# Face Capture (Flask + Mediapipe)

Circular, auto-detect, auto-capture face experience with a modern UI. Client-side detection using Mediapipe, server-side validation with OpenCV Haar for extra safety.

## Quick Start

1. Create and activate a virtual environment (recommended)
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the app:

```bash
python app.py
```

4. Open http://localhost:5000 in your browser.

## Notes
- If `haarcascade_frontalface_default.xml` is missing, place it in `haarcascades/`. Server falls back to skipping validation if not present.
- Captured images are saved to `static/captures/`.
- The UI automatically captures when your face is centered and steady inside the circle.

## Integrating elsewhere
You can POST a base64 image to `/upload` with JSON `{ "image": "data:image/jpeg;base64,..." }` and receive `{ ok, url, filename }`.
