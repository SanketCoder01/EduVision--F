const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const statusEl = document.getElementById('status');
const previewEl = document.getElementById('preview');
const serverResultEl = document.getElementById('serverResult');
const saveBtn = document.getElementById('save');
const retakeBtn = document.getElementById('retake');

let faceDetector;
let camera;
let readyToCapture = false;
let stableCounter = 0;
let lastCaptureDataUrl = null;

// Parameters
const REQUIRED_STABLE_FRAMES = 10; // slightly faster capture on mobile
const MIN_FACE_COVERAGE = 0.42;    // ensure closer face for better quality

function setStatus(text, cls = '') {
  statusEl.textContent = text;
  statusEl.className = 'status ' + cls;
}

function getCircle() {
  const rect = overlay.getBoundingClientRect();
  // larger circle on mobile
  const size = Math.min(rect.width, rect.height) * 0.8;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const r = size / 2;
  return { cx, cy, r };
}

function drawOverlay(faceBox) {
  overlay.width = overlay.clientWidth;
  overlay.height = overlay.clientHeight;
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  // Optional: draw face box for debugging
  if (faceBox) {
    ctx.strokeStyle = 'rgba(37,99,235,0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(faceBox.x, faceBox.y, faceBox.w, faceBox.h);
  }

  // draw circle guide (handled by CSS mask; this is optional helper indicators)
  const { cx, cy, r } = getCircle();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function boxCenter(box) {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

function isCenteredAndSized(box) {
  const { cx, cy, r } = getCircle();
  const center = boxCenter(box);
  const dist = Math.hypot(center.x - cx, center.y - cy);
  const maxCenterDist = r * 0.25; // must be fairly centered
  const diameter = Math.max(box.w, box.h);
  const coverage = diameter / (2 * r); // box diameter vs circle diameter
  return dist < maxCenterDist && coverage >= MIN_FACE_COVERAGE && coverage <= 0.95;
}

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'user' },
        width: { ideal: 1080 },
        height: { ideal: 1440 },
      },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    setStatus('Camera initialized successfully');
  } catch (e) {
    console.error('Camera initialization failed:', e);
    setStatus('Camera access denied. Please allow camera permissions and refresh.', 'err');
    throw e;
  }
}

function mediapipeInit() {
  try {
    const faceDetection = new FaceDetection.FaceDetection({ 
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}` 
    });
    faceDetection.setOptions({ model: 'short', minDetectionConfidence: 0.5 });
    faceDetector = faceDetection;

    faceDetection.onResults(onResults);

    camera = new Camera(video, {
      onFrame: async () => {
        try {
          await faceDetection.send({ image: video });
        } catch (e) {
          console.warn('Face detection frame error:', e);
        }
      },
      width: 720,
      height: 1280,
    });
    camera.start();
    setStatus('Face detection ready');
  } catch (e) {
    console.error('MediaPipe initialization failed:', e);
    setStatus('Face detection unavailable, using basic capture', 'warn');
    // Fallback to simple auto-capture without face detection
    setTimeout(() => {
      setStatus('Position your face in the circle and click Save', 'ok');
      enableManualCapture();
    }, 1000);
  }
}

let lastBox = null;
function smoothBox(box) {
  if (!lastBox) return box;
  const alpha = 0.6; // smoothing factor
  return {
    x: lastBox.x * alpha + box.x * (1 - alpha),
    y: lastBox.y * alpha + box.y * (1 - alpha),
    w: lastBox.w * alpha + box.w * (1 - alpha),
    h: lastBox.h * alpha + box.h * (1 - alpha),
  };
}

function normalizedToPixel(normRect) {
  // normRect: {xCenter, yCenter, width, height} in [0..1] of the input image.
  const w = overlay.clientWidth;
  const h = overlay.clientHeight;
  const x = (normRect.xCenter - normRect.width / 2) * w;
  const y = (normRect.yCenter - normRect.height / 2) * h;
  return { x, y, w: normRect.width * w, h: normRect.height * h };
}

function onResults(results) {
  let faceBox = null;
  if (results.detections && results.detections.length > 0) {
    const det = results.detections[0];
    const bbox = det.locationData.relativeBoundingBox;
    faceBox = normalizedToPixel({
      xCenter: bbox.xMin + bbox.width / 2,
      yCenter: bbox.yMin + bbox.height / 2,
      width: bbox.width,
      height: bbox.height,
    });
    faceBox = smoothBox(faceBox);
    lastBox = faceBox;
  }

  drawOverlay(faceBox);

  if (faceBox && isCenteredAndSized(faceBox)) {
    stableCounter++;
    setStatus(`Hold still… ${Math.min(stableCounter, REQUIRED_STABLE_FRAMES)}/${REQUIRED_STABLE_FRAMES}`, 'ok');
  } else if (faceBox) {
    stableCounter = 0;
    setStatus('Center your face inside the circle', 'warn');
  } else {
    stableCounter = 0;
    setStatus('No face detected', 'err');
  }

  if (!readyToCapture && stableCounter >= REQUIRED_STABLE_FRAMES) {
    autoCapture();
  }
}

function captureToDataUrl() {
  const canvas = document.createElement('canvas');
  // square crop around the circle
  const size = Math.min(video.videoWidth, video.videoHeight) * 0.8;
  canvas.width = size; canvas.height = size;
  const ctx2 = canvas.getContext('2d');

  // compute crop rectangle centered on video
  const cx = video.videoWidth / 2;
  const cy = video.videoHeight / 2;
  const sx = Math.max(0, Math.floor(cx - size / 2));
  const sy = Math.max(0, Math.floor(cy - size / 2));

  ctx2.save();
  ctx2.beginPath();
  ctx2.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx2.closePath();
  ctx2.clip();
  ctx2.drawImage(video, sx, sy, size, size, 0, 0, size, size);
  ctx2.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

function autoCapture() {
  readyToCapture = true;
  const dataUrl = captureToDataUrl();
  lastCaptureDataUrl = dataUrl;
  previewEl.src = dataUrl;
  previewEl.style.display = 'block';
  saveBtn.disabled = false;
  retakeBtn.disabled = false;
  setStatus('Captured! Review and save.', 'ok');
}

async function uploadImage() {
  if (!lastCaptureDataUrl) return;

  const params = new URLSearchParams(window.location.search);
  const pending_registration_id = params.get('pending_registration_id');
  const nextUrl = params.get('next') || '/'; // Default to root if next is not provided

  if (!pending_registration_id) {
    setStatus('Error: Missing registration ID.', 'err');
    serverResultEl.textContent = 'Cannot save image without a registration ID.';
    return;
  }

  saveBtn.disabled = true;
  setStatus('Uploading and saving...');
  serverResultEl.textContent = '';

  try {
    const res = await fetch('/api/auth/update-pending-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        pending_registration_id,
        image: lastCaptureDataUrl 
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setStatus('Saved successfully! Redirecting...', 'ok');
      serverResultEl.innerHTML = `<span style="color:#16a34a">Upload successful.</span>`;
      
      // Redirect back to the Next.js app
      window.location.href = nextUrl;

    } else {
      throw new Error(data.message || 'Server rejected the image.');
    }
  } catch (e) {
    const err = e;
    serverResultEl.textContent = 'Upload failed: ' + err.message;
    setStatus('Upload failed. Please retake.', 'err');
    saveBtn.disabled = false; // Re-enable button on failure
  }
}

function retake() {
  readyToCapture = false;
  stableCounter = 0;
  lastCaptureDataUrl = null;
  previewEl.src = '';
  previewEl.style.display = 'none';
  saveBtn.disabled = true;
  retakeBtn.disabled = true;
  setStatus('Align your face inside the circle');
}

retakeBtn.addEventListener('click', retake);
saveBtn.addEventListener('click', uploadImage);

function enableManualCapture() {
  // Enable manual capture mode when MediaPipe fails
  saveBtn.disabled = false;
  saveBtn.textContent = 'Capture & Save';
  saveBtn.onclick = () => {
    if (!readyToCapture) {
      autoCapture();
    } else {
      uploadImage();
    }
  };
}

(async function main() {
  try {
    setStatus('Initializing camera...', 'ok');
    await initCamera();
    setStatus('Camera ready, loading face detection...', 'ok');
    
    // Check if MediaPipe is available
    if (typeof FaceDetection === 'undefined' || typeof Camera === 'undefined') {
      throw new Error('MediaPipe libraries not loaded');
    }
    
    mediapipeInit();
  } catch (e) {
    console.error('Initialization error:', e);
    setStatus('Camera ready - Manual capture mode', 'warn');
    enableManualCapture();
  }
})();
