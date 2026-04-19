// src/components/CheckinModal/sections/WheelNudge.tsx
import { useNavigate } from 'react-router-dom'
import { useWheelStore } from '../../../stores/wheelStore'

interface WheelNudgeProps {
  onClose: () => void
}

export default function WheelNudge({ onClose }: WheelNudgeProps) {
  const navigate  = useNavigate()
  const { checkins, categories } = useWheelStore()

  // Find latest check-in that has real category scores (not empty from popup)
  const latestScored = checkins.find(c => c.scores && Object.keys(c.scores).length > 0)

  if (!latestScored || categories.length === 0) return null

  const scoreEntries = Object.entries(latestScored.scores)
  if (scoreEntries.length === 0) return null

  const [weakestName, weakestScore] = scoreEntries.sort(([,a],[,b]) => a - b)[0]
  const total = scoreEntries.reduce((s, [,v]) => s + v, 0)

  const openWheel = () => { onClose(); navigate('/wheel') }

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5 flex gap-4 items-center">
      {/* Mini donut */}
      <svg width="72" height="72" viewBox="0 0 100 100" className="shrink-0">
        {(() => {
          let angle = -90
          return scoreEntries.map(([name, score], i) => {
            const sweep = (score / total) * 360
            const x1 = 50 + 36 * Math.cos((angle * Math.PI) / 180)
            const y1 = 50 + 36 * Math.sin((angle * Math.PI) / 180)
            const a2 = angle + sweep
            const x2 = 50 + 36 * Math.cos((a2 * Math.PI) / 180)
            const y2 = 50 + 36 * Math.sin((a2 * Math.PI) / 180)
            const large = sweep > 180 ? 1 : 0
            const isWeak = name === weakestName
            angle = a2
            return (
              <path
                key={i}
                d={`M 50 50 L ${x1} ${y1} A 36 36 0 ${large} 1 ${x2} ${y2} Z`}
                fill="#1F3649"
                opacity={isWeak ? 1 : 0.15}
              />
            )
          })
        })()}
        <circle cx="50" cy="50" r="22" fill="white" />
        <text x="50" y="46" textAnchor="middle" fontWeight="800" fontSize="14" fill="#2d3435">
          {weakestScore.toFixed(1)}
        </text>
        <text x="50" y="57" textAnchor="middle" fontSize="8" fill="#adb3b4">/10</text>
      </svg>

      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold tracking-[0.14em] text-[#adb3b4] uppercase mb-1">Needs tending</div>
        <h3 className="text-[17px] font-bold tracking-tight text-[#2d3435]">
          {weakestName} feels a little thin.
        </h3>
        <p className="text-[13px] text-[#5a6061] mt-1 leading-relaxed">
          One small act today? A text to someone you miss counts.
        </p>
        <button
          onClick={openWheel}
          className="mt-2 text-[12.5px] font-bold text-[#1F3649] hover:underline cursor-pointer"
        >
          Open Wheel of Life →
        </button>
      </div>
    </div>
  )
}
