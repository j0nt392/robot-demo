# Robot Backend

Run a FastAPI server with WebSockets for telemetry and an MJPEG endpoint for video (dummy frames).

## Setup

```bash
cd backend
python -m venv venv
# Windows PowerShell
venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints
- GET `/health` – quick status
- GET `/video.mjpeg` – MJPEG stream of synthetic frames
- WS `/ws/telemetry` – JSON messages like:

```json
{"t": 1.2, "motors": [101.2, 95.4, 110.1, 99.9, 123.4, 80.2]}
```

Cross-origin is enabled for local dev.


