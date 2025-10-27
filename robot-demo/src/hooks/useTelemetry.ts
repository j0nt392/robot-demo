import { useEffect, useRef, useState } from 'react'
import { BACKEND_URL, toWsUrl } from '../config'

export type Telemetry = { t: number; motors: number[] }

export function useTelemetry() {
  const [data, setData] = useState<Telemetry | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const url = toWsUrl(BACKEND_URL) + '/ws/telemetry'
    const ws = new WebSocket(url)
    wsRef.current = ws
    ws.onmessage = evt => {
      try {
        const parsed = JSON.parse(evt.data)
        setData(parsed)
      } catch {}
    }
    ws.onerror = () => {
      // noop for now
    }
    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [])

  return data
}


