// 1-minute guided meditation — animated breath orb
// Ported 1:1 from /tmp/logbird_checkin/src/meditation.jsx

import { useState, useEffect, useRef } from 'react';
import { Btn } from '../atoms';
import { ArrowRight, CheckIcon } from '../icons';

function Leaf({ size = 18, color = 'currentColor' }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: '-2px', flexShrink: 0 }}>
      <path d="M12 2c0 0-8 4-8 12a8 8 0 0 0 16 0C20 6 12 2 12 2z"/>
      <path d="M12 22V12"/>
    </svg>
  );
}

export function Meditation() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [phase, setPhase] = useState('ready'); // ready | in | hold | out
  const total = 60;
  const raf = useRef<any>();
  const startedAt = useRef<any>(null);

  useEffect(() => {
    if (!running) return;
    startedAt.current = performance.now() - elapsed * 1000;
    const tick = (t: number) => {
      const secs = (t - startedAt.current) / 1000;
      if (secs >= total) {
        setElapsed(total);
        setRunning(false);
        setPhase('done');
        return;
      }
      setElapsed(secs);
      // 8s cycle: 4 in, 2 hold, 2 out — soft
      const s = secs % 8;
      setPhase(s < 4 ? 'in' : s < 6 ? 'hold' : 'out');
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const reset = () => { setRunning(false); setElapsed(0); setPhase('ready'); };

  const pct = elapsed / total;
  const done = elapsed >= total;
  const cue = done ? 'nicely done' : phase === 'in' ? 'breathe in' : phase === 'hold' ? 'hold' : phase === 'out' ? 'let it go' : 'ready when you are';
  const mm = Math.floor((total - elapsed) / 60);
  const ss = Math.max(0, Math.floor(total - elapsed) % 60);

  // orb scale: 0.75 → 1.1 following breath
  const orbScale = phase === 'in'
    ? 0.78 + ((elapsed % 8) / 4) * 0.32
    : phase === 'hold'
    ? 1.10
    : phase === 'out'
    ? 1.10 - (((elapsed % 8) - 6) / 2) * 0.32
    : 0.85;

  return (
    <div className="card-soft" style={{
      padding: 28,
      background: 'linear-gradient(155deg, #f5f7f8 0%, #ebf0f2 100%)',
      borderColor: '#e4e9ea',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Leaf size={16} color="#22c55e"/> One-minute pause
        </h3>
        <span className="mono" style={{ fontSize: 12, color: '#5a6061' }}>
          {mm}:{ss.toString().padStart(2,'0')}
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#5a6061', marginBottom: 22 }}>
        Let the orb guide your breath. In, hold, out. That's the whole trick.
      </p>

      <div style={{
        position: 'relative',
        height: 220,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 22,
      }}>
        {/* ripples */}
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            width: 180, height: 180, borderRadius: '50%',
            border: '1px solid rgba(31,54,73,0.10)',
            transform: `scale(${1 + i * 0.18 + orbScale * 0.2})`,
            opacity: running ? 0.6 - i * 0.18 : 0.25,
            transition: 'transform 900ms ease, opacity 400ms ease',
          }}/>
        ))}
        {/* orb */}
        <div style={{
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #a7c2d6, #1F3649 75%)',
          transform: `scale(${orbScale})`,
          transition: 'transform 900ms ease',
          boxShadow: '0 20px 60px rgba(31,54,73,0.25), inset -20px -30px 60px rgba(0,0,0,0.2), inset 20px 25px 50px rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: '0.02em',
        }}>
          <span style={{ opacity: 0.92 }}>{cue}</span>
        </div>
      </div>

      {/* progress bar */}
      <div style={{ height: 4, background: '#e4e9ea', borderRadius: 9999, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          height: '100%', width: `${pct * 100}%`,
          background: 'linear-gradient(90deg, #22c55e, #1F3649)',
          transition: 'width 300ms linear',
        }}/>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {!running && !done && (
          <Btn variant="primary" onClick={() => setRunning(true)}>
            {elapsed > 0 ? 'Resume' : 'Begin'} <ArrowRight size={14}/>
          </Btn>
        )}
        {running && (
          <Btn variant="outline" onClick={() => setRunning(false)}>Pause</Btn>
        )}
        {(elapsed > 0) && (
          <Btn variant="ghost" onClick={reset}>Reset</Btn>
        )}
        {done && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
            <CheckIcon size={14} color="#22c55e" stroke={3}/> One minute of quiet, logged.
          </span>
        )}
      </div>
    </div>
  );
}
