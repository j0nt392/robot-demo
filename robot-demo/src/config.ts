export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL ?? 'http://localhost:8000'

export function toWsUrl(httpUrl: string): string {
  if (httpUrl.startsWith('https://')) return 'wss://' + httpUrl.slice('https://'.length)
  if (httpUrl.startsWith('http://')) return 'ws://' + httpUrl.slice('http://'.length)
  return httpUrl
}


