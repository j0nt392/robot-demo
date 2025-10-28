from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import io
import time
from typing import AsyncIterator
from pydantic import BaseModel

class TelemetryIn(BaseModel):
    t: float
    motors: list[float] # length 6. channels 0-5.

app = FastAPI(title="Robot Backend")

# --- Simplified single-client telemetry pipeline ---
telemetry_queue: asyncio.Queue = asyncio.Queue(maxsize=256)
dummy_task: asyncio.Task | None = None


async def _safe_put(payload: dict) -> None:
    if telemetry_queue.full():
        try:
            telemetry_queue.get_nowait()
        except asyncio.QueueEmpty:
            pass
    try:
        telemetry_queue.put_nowait(payload)
    except asyncio.QueueFull:
        pass


async def start_dummy() -> None:
    global dummy_task
    if dummy_task is not None and not dummy_task.done():
        return

    async def _producer() -> None:
        import math
        t = 0.0
        try:
            while True:
                values = [100 + 40 * math.sin(0.6 * t + i) for i in range(6)]
                await _safe_put({"t": t, "motors": [round(max(0, v), 2) for v in values]})
                t += 0.1
                await asyncio.sleep(0.1)
        except asyncio.CancelledError:
            return

    dummy_task = asyncio.create_task(_producer())


async def stop_dummy() -> None:
    # Unused in dummy-only mode; kept minimal if needed later
    global dummy_task
    if dummy_task is not None:
        dummy_task.cancel()
        try:
            await dummy_task
        except asyncio.CancelledError:
            pass
        dummy_task = None


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

@app.post("/ingest")
async def ingest(data: TelemetryIn):
    await _safe_put({"t": data.t, "motors": data.motors})
    return {"ok": True}

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
    # await start_dummy()
    try:
        while True:
            payload = await telemetry_queue.get()
            await ws.send_json(payload)
    except WebSocketDisconnect:
        return


# Removed /run and /stop endpoints for dummy-only mode


