import { useState } from 'react'

type ReasoningStep = {
  id: number
  timestamp: string
  observation: string
  reasoning: string
  action: string
}

const DUMMY_STEPS: ReasoningStep[] = [
  {
    id: 1,
    timestamp: new Date().toLocaleTimeString(),
    observation: 'Board detected. User placed O at top-left.',
    reasoning: 'Center is the strongest opening. Taking center denies forks.',
    action: 'Place X at center (row 2, col 2).',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() + 1500).toLocaleTimeString(),
    observation: 'Opponent threatens row 1: O at (1,1) and (1,2).',
    reasoning: 'Must block immediate win on (1,3).',
    action: 'Place X at top-right (row 1, col 3).',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() + 3000).toLocaleTimeString(),
    observation: 'Diagonal opportunity forming with X at (1,3) and (2,2).',
    reasoning: 'Create dual threat by taking (3,1).',
    action: 'Place X at bottom-left (row 3, col 1).',
  },
  {
    id: 4,
    timestamp: new Date(Date.now() + 4500).toLocaleTimeString(),
    observation: 'Opponent blocked at (3,1). Board remains balanced.',
    reasoning: 'Set up a vertical threat using center column.',
    action: 'Place X at bottom-center (row 3, col 2).',
  },
  {
    id: 5,
    timestamp: new Date(Date.now() + 6000).toLocaleTimeString(),
    observation: 'Two-in-a-row with X at (2,2) and (3,2).',
    reasoning: 'Finish vertical line to win.',
    action: 'Place X at top-center (row 1, col 2).',
  },
]

export default function ReasoningPanel() {
  const [steps] = useState<ReasoningStep[]>(DUMMY_STEPS)

  return (
    <div className="w-full rounded-md border border-white/10 bg-white/5">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Model Reasoning</div>
        <div className="text-xs text-white/60">VLM → VLA decisions</div>
      </div>
      <div className="divide-y divide-white/10">
        {steps.map(step => (
          <div key={step.id} className="p-6 grid grid-cols-12 gap-4">
            <div className="col-span-2 text-xs text-white/60">
              <div className="font-mono">{step.timestamp}</div>
            </div>
            <div className="col-span-3">
              <div className="text-xs uppercase text-white/60 mb-1">Observation</div>
              <div>{step.observation}</div>
            </div>
            <div className="col-span-4">
              <div className="text-xs uppercase text-white/60 mb-1">Reasoning</div>
              <div>{step.reasoning}</div>
            </div>
            <div className="col-span-3">
              <div className="text-xs uppercase text-white/60 mb-1">Action</div>
              <div className="font-medium">{step.action}</div>
            </div>
          </div>
        ))}
        {steps.length === 0 && (
          <div className="p-6 text-white/60">Waiting for reasoning steps…</div>
        )}
      </div>
    </div>
  )
}


