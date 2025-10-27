from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import io
import time
from typing import AsyncIterator
import os

from .stream_manager import StreamManager

app = FastAPI(title="Robot Backend")
stream_manager = StreamManager()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"ok": True, "time": time.time()}


async def generate_mjpeg(camera: str = "default") -> AsyncIterator[bytes]:
    """Dummy MJPEG stream (solid color frames that change over time).

    Separate callers can pass a camera name to get a different color cycle.
    """
    boundary = b"--frame"
    base = sum(camera.encode("utf-8")) % 255
    hue = base
    while True:
        # Create a tiny PNG as placeholder without heavy deps
        from PIL import Image  # type: ignore

        img = Image.new("RGB", (640, 480), (hue % 255, (hue * 2) % 255, (hue * 3) % 255))
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=60)
        frame = buf.getvalue()

        yield boundary + b"\r\n" + b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
        hue = (hue + 5) % 255
        await asyncio.sleep(0.1)


@app.get("/video.mjpeg")
async def video_stream_default():
    """Legacy single stream (front)."""
    return StreamingResponse(generate_mjpeg("front"), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/video_front.mjpeg")
async def video_stream_front():
    return StreamingResponse(generate_mjpeg("front"), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/video_wrist.mjpeg")
async def video_stream_wrist():
    return StreamingResponse(generate_mjpeg("wrist"), media_type="multipart/x-mixed-replace; boundary=frame")


@app.websocket("/ws/telemetry")
async def telemetry_ws(ws: WebSocket):
    await ws.accept()
    # Ensure dummy producer is running
    await stream_manager.ensure_dummy_running()
    queue = stream_manager.subscribe()
    try:
        while True:
            payload = await queue.get()
            await ws.send_json(payload)
    except WebSocketDisconnect:
        stream_manager.unsubscribe(queue)
        return


@app.post("/run")
async def run_process(
    repo_path: str,
    calibration: str = "",
    model: str = "",
    usb_ports: str = "",
):
    """Start the external eval script as a subprocess and stream its JSONL telemetry.

    For now we just build a command and delegate to the StreamManager.
    The eval script is expected to print JSON lines like {"t": ..., "motors": [...]}
    """
    cmd = [
        os.path.join(os.environ.get("PYTHON", "python")),
        "eval_lerobot.py",
        "--calibration",
        calibration,
        "--model",
        model,
        "--usb-ports",
        usb_ports,
    ]
    await stream_manager.start_process(cmd, cwd=repo_path)
    return {"started": True}


@app.post("/stop")
async def stop_process():
    await stream_manager.stop_process()
    return {"stopped": True}


