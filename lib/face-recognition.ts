// Face recognition and liveness detection utilities
export interface FaceDetectionResult {
  success: boolean;
  faceDetected: boolean;
  confidence?: number;
  landmarks?: any[];
  error?: string;
}

export interface LivenessDetectionResult {
  success: boolean;
  isLive: boolean;
  livenessScore: number;
  blinkDetected: boolean;
  eyeMovementDetected: boolean;
  error?: string;
}

export interface FaceMatchResult {
  success: boolean;
  isMatch: boolean;
  confidence: number;
  error?: string;
}

// Simple face detection using MediaDevices API
export async function detectFace(videoElement: HTMLVideoElement): Promise<FaceDetectionResult> {
  try {
    // Check if video is playing and has valid dimensions
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return {
        success: false,
        faceDetected: false,
        error: 'Video not ready'
      };
    }

    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        success: false,
        faceDetected: false,
        error: 'Canvas context not available'
      };
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0);

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple skin tone detection (basic face detection)
    let skinPixels = 0;
    let totalPixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Basic skin tone detection
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 && r > g && r > b) {
        skinPixels++;
      }
    }

    const skinRatio = skinPixels / totalPixels;
    const faceDetected = skinRatio > 0.1; // 10% skin pixels threshold

    return {
      success: true,
      faceDetected,
      confidence: skinRatio
    };
  } catch (error) {
    return {
      success: false,
      faceDetected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Liveness detection using eye blink and movement detection
export async function detectLiveness(videoElement: HTMLVideoElement, duration: number = 3000): Promise<LivenessDetectionResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const frames: number[] = [];
    let blinkCount = 0;
    let eyeMovementCount = 0;

    const checkFrame = () => {
      if (Date.now() - startTime > duration) {
        // Analysis complete
        const livenessScore = Math.min(1.0, (blinkCount + eyeMovementCount) / 10);
        const isLive = livenessScore > 0.3;

        resolve({
          success: true,
          isLive,
          livenessScore,
          blinkDetected: blinkCount > 0,
          eyeMovementDetected: eyeMovementCount > 0
        });
        return;
      }

      // Capture current frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple eye region analysis (top portion of face)
        const eyeRegion = data.slice(0, data.length / 3);
        let eyePixels = 0;

        for (let i = 0; i < eyeRegion.length; i += 4) {
          const r = eyeRegion[i];
          const g = eyeRegion[i + 1];
          const b = eyeRegion[i + 2];

          // Detect darker pixels (potential eyes)
          if (r < 100 && g < 100 && b < 100) {
            eyePixels++;
          }
        }

        frames.push(eyePixels);

        // Detect changes (blinks/movement)
        if (frames.length > 1) {
          const current = frames[frames.length - 1];
          const previous = frames[frames.length - 2];
          const change = Math.abs(current - previous);

          if (change > 100) {
            if (current < previous) {
              blinkCount++;
            } else {
              eyeMovementCount++;
            }
          }
        }
      }

      requestAnimationFrame(checkFrame);
    };

    checkFrame();
  });
}

// Face matching using simple feature comparison
export async function matchFace(
  currentFaceData: string,
  storedFaceData: string
): Promise<FaceMatchResult> {
  try {
    // Decode base64 face data
    const currentFeatures = JSON.parse(atob(currentFaceData));
    const storedFeatures = JSON.parse(atob(storedFaceData));

    // Simple feature comparison (in a real implementation, you'd use proper face recognition)
    let matchScore = 0;
    const totalFeatures = Math.min(currentFeatures.length, storedFeatures.length);

    for (let i = 0; i < totalFeatures; i++) {
      const diff = Math.abs(currentFeatures[i] - storedFeatures[i]);
      if (diff < 0.1) { // Threshold for feature similarity
        matchScore++;
      }
    }

    const confidence = matchScore / totalFeatures;
    const isMatch = confidence > 0.7; // 70% threshold

    return {
      success: true,
      isMatch,
      confidence
    };
  } catch (error) {
    return {
      success: false,
      isMatch: false,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Generate face encoding from video frame
export async function generateFaceEncoding(videoElement: HTMLVideoElement): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple feature extraction (in a real implementation, you'd use proper face recognition)
      const features: number[] = [];
      const step = Math.floor(data.length / 100); // Extract 100 features

      for (let i = 0; i < data.length; i += step * 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert RGB to grayscale and normalize
        const gray = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        features.push(gray);
      }

      // Encode features as base64
      const featuresJson = JSON.stringify(features);
      const encoded = btoa(featuresJson);
      
      resolve(encoded);
    } catch (error) {
      reject(error);
    }
  });
}

// Get user's current location
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// Get device information
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString()
  };
}

// Validate attendance requirements
export async function validateAttendanceRequirements(
  session: any,
  faceVerified: boolean,
  geoVerified: boolean,
  livenessVerified: boolean
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (session.require_face_recognition && !faceVerified) {
    errors.push('Face recognition verification required');
  }

  if (session.require_geo_fencing && !geoVerified) {
    errors.push('Location verification required');
  }

  if (session.require_liveness_detection && !livenessVerified) {
    errors.push('Liveness detection required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 