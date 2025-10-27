import { useEffect, useMemo, useRef, useState } from 'react'
import { ColorType, createChart, LineSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, LineData, UTCTimestamp } from 'lightweight-charts'
import { useTelemetry } from '../hooks/useTelemetry'

type MotorSeries = { series: ISeriesApi<'Line'> }

type MotorRow = { id: number; name: string; lastValue: number }

const MOTOR_COLORS = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e84393']

const NUM_MOTORS = 6

function nowUtcSeconds(): UTCTimestamp {
  return Math.floor(Date.now() / 1000) as UTCTimestamp
}

function generateMotorValue(motorIndex: number, t: number, amplitude: number): number {
  const base = 100 + amplitude * Math.sin(0.6 * t + motorIndex)
  const transient = 70 * Math.exp(-Math.pow(t - (4 + motorIndex * 0.15), 2) / 2)
  const noise = (Math.random() - 0.5) * 3
  return Math.max(0, base + transient + noise)
}

export default function MotorDataPanel() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const motorSeriesRef = useRef<Record<number, MotorSeries>>({})
  const [rows, setRows] = useState<MotorRow[]>(() =>
    new Array(NUM_MOTORS).fill(0).map((_, i) => ({ id: i, name: `Motor ${i}`, lastValue: 0 })),
  )
  const telemetry = useTelemetry()

  const gridColors = useMemo(
    () => ({
      vert: 'rgba(197,203,206,0.25)',
      horz: 'rgba(197,203,206,0.25)',
      text: 'rgba(255,255,255,0.85)',
    }),
    [],
  )

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: gridColors.text,
        attributionLogo: false,
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: true, borderVisible: false },
      timeScale: {
        borderVisible: false,
        secondsVisible: true,
        timeVisible: true,
      },
      grid: {
        vertLines: { color: gridColors.vert },
        horzLines: { color: gridColors.horz },
      },
      autoSize: true,
    })

    chartRef.current = chart

    // Create series for each motor (single line per motor)
    for (let i = 0; i < NUM_MOTORS; i += 1) {
      const color = MOTOR_COLORS[i % MOTOR_COLORS.length]
      const series = chart.addSeries(LineSeries) as ISeriesApi<'Line'>
      series.applyOptions({
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      })
      motorSeriesRef.current[i] = { series }
    }

    const resize = () => chart.applyOptions({})
    const ro = new ResizeObserver(resize)
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      motorSeriesRef.current = { }
    }
  }, [gridColors])

  // Update chart when telemetry arrives (fallback to simulated time when null)
  useEffect(() => {
    const time = nowUtcSeconds() as UTCTimestamp
    const nextRows: MotorRow[] = []
    const values = telemetry?.motors ?? new Array(NUM_MOTORS).fill(0)
    for (let i = 0; i < NUM_MOTORS; i += 1) {
      const v = Number((values[i] ?? 0).toFixed(2))
      const series = motorSeriesRef.current[i]
      if (series) {
        const point: LineData = { time, value: v }
        series.series.update(point)
      }
      nextRows.push({ id: i, name: `Motor ${i}`, lastValue: v })
    }
    setRows(nextRows)
  }, [telemetry])

  return (
    <div className="w-full h-full grid grid-cols-4 gap-4">
      <div className="col-span-3 min-h-[420px] h-full">
        <div ref={containerRef} className="w-full h-full rounded-md border border-white/10" />
      </div>
      <div className="col-span-1 h-full overflow-auto rounded-md border border-white/10">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white/5">
            <tr>
              <th className="text-left p-3">Motor</th>
              <th className="text-left p-3">Color</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m, idx) => {
              const color = MOTOR_COLORS[idx % MOTOR_COLORS.length]
              return (
                <tr key={m.id} className={idx % 2 === 0 ? 'bg-white/0' : 'bg-white/5'}>
                  <td className="p-3 font-semibold">{m.name}</td>
                  <td className="p-3">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


