// src/components/CheckinModal/sections/MeditationSection.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { Leaf, ArrowRight } from '@phosphor-icons/react'

interface MeditationSectionProps {
  onComplete: () => void
  completed: boolean
}

type Phase = 'ready' | 'in' | 'hold' | 'out' | 'done'

const TOTAL = 60 // seconds

export default function MeditationSection({ onComplete, completed }: MeditationSectionProps) {
  const [running,  setRunning]  = useState(false)
  const [elapsed,  setElapsed]  = useState(0)
  const [phase,    setPhase]    = useState<Phase>('ready')
  const rafRef     = useRef<number>(0)
  const startedAt  = useRef<number>(0)

  useEffect(() => {
    if (!running) return
    startedAt.current = performance.now() - elapsed * 1000
    const tick = (t: number) => {
      const secs = (t - startedAt.current) / 1000
      if (secs >= TOTAL) {
        setElapsed(TOTAL); setRunning(false); setPhase('done'); onComplete(); return
      }
      setElapsed(secs)
      const s = secs % 8
      setPhase(s < 4 ? 'in' : s < 6 ? 'hold' : 'out')
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, onComplete])

  const reset = useCallback(() => { setRunning(false); setElapsed(0); setPhase('ready') }, [])

  const pct  = elapsed / TOTAL
  const done = elapsed >= TOTAL || completed
  const mm   = Math.floor((TOTAL - elapsed) / 60)
  const ss   = Math.max(0, Math.floor(TOTAL - elapsed) % 60)
  const cue  = done ? 'nicely done' : phase === 'in' ? 'breathe in' : phase === 'hold' ? 'hold' : phase === 'out' ? 'let it go' : 'ready when you are'

  const orbScale = phase === 'in'
    ? 0.78 + ((elapsed % 8) / 4) * 0.32
    : phase === 'hold' ? 1.10
    : phase === 'out'  ? 1.10 - (((elapsed % 8) - 6) / 2) * 0.32
    : 0.85

  return (
    <div className="rounded-2xl border border-[#e4e9ea] bg-gradient-to-br from-[#f5f7f8] to-[#ebf0f2] p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[18px] font-bold tracking-tight flex items-center gap-2">
          <Leaf size={16} className="text-green-500" /> One-minute pause
        </h3>
        <span className="font-mono text-[12px] text-[#5a6061]">
          {mm}:{ss.toString().padStart(2, '0')}
        </span>
      </div>
      <p className="text-[13px] text-[#5a6061] mb-5">
        Let the orb guide your breath. In, hold, out. That's the whole trick.
      </p>

      {/* Orb */}
      <div className="flex items-center justify-center relative h-48 mb-5">
        {[0, 1, 2].map(i => (
          <div key={i} className="absolute w-36 h-36 rounded-full border border-[#1F3649]/10 transition-all duration-700"
            style={{ transform: `scale(${1 + i * 0.18 + orbScale * 0.2})`, opacity: running ? 0.6 - i * 0.18 : 0.2 }} />
        ))}
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center text-white text-[14px] font-semibold tracking-wide transition-transform duration-[900ms]"
          style={{
            transform: `scale(${orbScale})`,
            background: 'radial-gradient(circle at 35% 30%, #a7c2d6, #1F3649 75%)',
            boxShadow: '0 20px 60px rgba(31,54,73,0.25), inset -20px -30px 60px rgba(0,0,0,0.2), inset 20px 25px 50px rgba(255,255,255,0.3)',
          }}
        >
          <span className="opacity-90">{cue}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-[#e4e9ea] rounded-full overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-green-400 to-[#1F3649] rounded-full transition-all duration-300"
          style={{ width: `${pct * 100}%` }} />
      </div>

      <div className="flex gap-2.5 justify-center">
        {!running && !done && (
          <button
            onClick={() => setRunning(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1F3649] text-white text-sm font-bold hover:bg-[#162838] transition-colors cursor-pointer"
          >
            {elapsed > 0 ? 'Resume' : 'Begin'} <ArrowRight size={14} />
          </button>
        )}
        {running && (
          <button onClick={() => setRunning(false)} className="px-4 py-2 rounded-xl border border-[#ECEFF2] text-sm font-semibold text-[#5a6061] hover:bg-[#f7f9fa] transition-colors cursor-pointer">
            Pause
          </button>
        )}
        {elapsed > 0 && !done && (
          <button onClick={reset} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#adb3b4] hover:text-[#5a6061] transition-colors cursor-pointer">
            Reset
          </button>
        )}
        {done && (
          <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-semibold">
            ✓ One minute of quiet, logged.
          </span>
        )}
      </div>
    </div>
  )
}
