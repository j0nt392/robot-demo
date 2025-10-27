import asyncio
import json
import math
import time
from asyncio.subprocess import PIPE
from typing import List, Optional


class StreamManager:
    """Manages a shared telemetry stream with multiple subscribers.

    - When no external process is running, emits dummy values.
    - When a process is started, reads JSON lines from stdout and broadcasts them.
    Each JSON line is expected to have the shape: {"t": float, "motors": [..]}
    """

    def __init__(self) -> None:
        self._subscribers: List[asyncio.Queue] = []
        self._producer_task: Optional[asyncio.Task] = None
        self._process: Optional[asyncio.subprocess.Process] = None
        self._lock = asyncio.Lock()

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._subscribers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        try:
            self._subscribers.remove(q)
        except ValueError:
            pass

    async def _broadcast(self, payload: dict) -> None:
        # Push to all subscriber queues without blocking forever
        for q in list(self._subscribers):
            if q.full():
                # Drop oldest to keep flow moving
                try:
                    q.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                # If still full, skip this subscriber
                pass

    async def _dummy_producer(self) -> None:
        t = 0.0
        try:
            while True:
                values = [100 + 40 * math.sin(0.6 * t + i) for i in range(6)]
                payload = {"t": t, "motors": [round(max(0, v), 2) for v in values]}
                await self._broadcast(payload)
                t += 0.1
                await asyncio.sleep(0.1)
        except asyncio.CancelledError:
            return

    async def ensure_dummy_running(self) -> None:
        async with self._lock:
            if self._process is not None:
                return
            if self._producer_task is None or self._producer_task.done():
                self._producer_task = asyncio.create_task(self._dummy_producer())

    async def start_process(self, cmd: List[str], cwd: Optional[str] = None) -> None:
        async with self._lock:
            await self._stop_producer_locked()
            # If a process already running, stop it first
            if self._process is not None:
                await self._stop_process_locked()

            self._process = await asyncio.create_subprocess_exec(
                *cmd, cwd=cwd, stdout=PIPE, stderr=PIPE
            )

            asyncio.create_task(self._consume_process_output())

    async def _consume_process_output(self) -> None:
        assert self._process is not None
        proc = self._process
        try:
            assert proc.stdout is not None
            async for raw in proc.stdout:
                line = raw.decode("utf-8", errors="ignore").strip()
                if not line:
                    continue
                try:
                    payload = json.loads(line)
                    # Expecting keys t and motors; if not, adapt here
                    await self._broadcast(payload)
                except json.JSONDecodeError:
                    # Ignore non-JSON lines
                    pass
        finally:
            # When process ends, fall back to dummy
            async with self._lock:
                self._process = None
                await self._start_producer_locked()

    async def stop_process(self) -> None:
        async with self._lock:
            await self._stop_process_locked()
            await self._start_producer_locked()

    async def _stop_process_locked(self) -> None:
        if self._process is not None:
            proc = self._process
            self._process = None
            try:
                proc.terminate()
            except ProcessLookupError:
                pass
            try:
                await asyncio.wait_for(proc.wait(), timeout=2.0)
            except asyncio.TimeoutError:
                try:
                    proc.kill()
                except ProcessLookupError:
                    pass

    async def _start_producer_locked(self) -> None:
        if self._producer_task is None or self._producer_task.done():
            self._producer_task = asyncio.create_task(self._dummy_producer())

    async def _stop_producer_locked(self) -> None:
        if self._producer_task is not None:
            self._producer_task.cancel()
            try:
                await self._producer_task
            except asyncio.CancelledError:
                pass
            self._producer_task = None


