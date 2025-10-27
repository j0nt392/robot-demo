import { useState } from 'react'
import { BACKEND_URL } from '../config'

export default function RunControls() {
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<string>('Idle')

  async function startRun() {
    try {
      let repoPath = localStorage.getItem('evalRepoPath') || ''
      if (!repoPath) {
        // eslint-disable-next-line no-alert
        repoPath = window.prompt('Enter path to Isaac-gr00t repo (folder containing eval_lerobot.py):', repoPath) || ''
        if (!repoPath) return
        localStorage.setItem('evalRepoPath', repoPath)
      }
      setStatus('Starting…')
      const res = await fetch(`${BACKEND_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_path: repoPath, calibration: '', model: '', usb_ports: '' }),
      })
      if (!res.ok) throw new Error(await res.text())
      setIsRunning(true)
      setStatus('Running')
    } catch (err: any) {
      setStatus(err?.message || 'Failed to start')
    }
  }

  async function stopRun() {
    try {
      setStatus('Stopping…')
      const res = await fetch(`${BACKEND_URL}/stop`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      setIsRunning(false)
      setStatus('Idle')
    } catch (err: any) {
      setStatus(err?.message || 'Failed to stop')
    }
  }

  return (
    <div className="w-full flex items-center justify-center gap-6">
      <button
        className={`rounded-lg px-10 py-6 text-xl font-bold transition-colors ${
          isRunning ? 'bg-emerald-700/60 text-white/70 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-black'
        }`}
        onClick={startRun}
        disabled={isRunning}
      >
        ▶ Play
      </button>
      <button
        className="rounded-lg px-6 py-3 text-sm font-semibold bg-red-500 hover:bg-red-400 text-black disabled:bg-white/10 disabled:text-white/40"
        onClick={stopRun}
        disabled={!isRunning}
      >
        Stop
      </button>
      <div className="text-white/70 text-sm">{status}</div>
    </div>
  )
}


