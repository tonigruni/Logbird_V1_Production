// Emotion wheel — 3-ring radial picker (Junto-style)
// Ported 1:1 from /tmp/logbird_checkin/src/emotion_wheel.jsx

import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ArrowRight } from '../icons';

// Structure: 6 core emotions → 3 nuanced each (18) → 3 specific each (54)
// Tone colors keep it warm and readable on the Logbird palette.
export const EMOTION_WHEEL = [
  {
    core: 'Happy', color: '#B5A47A', angle: 0,
    branches: [
      { nuance: 'Content',  specifics: ['Peaceful', 'Grateful', 'Fulfilled'] },
      { nuance: 'Playful',  specifics: ['Cheeky', 'Amused', 'Silly'] },
      { nuance: 'Proud',    specifics: ['Confident', 'Respected', 'Valued'] },
    ],
  },
  {
    core: 'Tender', color: '#9E8A98', angle: 60,
    branches: [
      { nuance: 'Loving',    specifics: ['Affectionate', 'Warm', 'Attracted'] },
      { nuance: 'Connected', specifics: ['Accepted', 'Included', 'Seen'] },
      { nuance: 'Grateful',  specifics: ['Thankful', 'Appreciative', 'Moved'] },
    ],
  },
  {
    core: 'Calm', color: '#6A9298', angle: 120,
    branches: [
      { nuance: 'Hopeful',  specifics: ['Optimistic', 'Inspired', 'Open'] },
      { nuance: 'Steady',   specifics: ['Centered', 'Grounded', 'Relaxed'] },
      { nuance: 'Focused',  specifics: ['Alert', 'Curious', 'Engaged'] },
    ],
  },
  {
    core: 'Sad', color: '#6A7A94', angle: 180,
    branches: [
      { nuance: 'Lonely',     specifics: ['Isolated', 'Abandoned', 'Missing'] },
      { nuance: 'Hurt',       specifics: ['Disappointed', 'Rejected', 'Betrayed'] },
      { nuance: 'Heavy',      specifics: ['Tired', 'Numb', 'Empty'] },
    ],
  },
  {
    core: 'Tense', color: '#7E5E5E', angle: 240,
    branches: [
      { nuance: 'Anxious',    specifics: ['Worried', 'Overwhelmed', 'Restless'] },
      { nuance: 'Fearful',    specifics: ['Scared', 'Insecure', 'Threatened'] },
      { nuance: 'Frustrated', specifics: ['Annoyed', 'Irritated', 'Stuck'] },
    ],
  },
  {
    core: 'Angry', color: '#8A6A60', angle: 300,
    branches: [
      { nuance: 'Mad',        specifics: ['Furious', 'Resentful', 'Provoked'] },
      { nuance: 'Judgmental', specifics: ['Critical', 'Suspicious', 'Dismissive'] },
      { nuance: 'Hurt-anger', specifics: ['Bitter', 'Withdrawn', 'Guarded'] },
    ],
  },
];

// Polar → cartesian, radians
const deg2rad = (d: number) => (d - 90) * Math.PI / 180;
const polar = (cx: number, cy: number, r: number, deg: number) => ({
  x: cx + r * Math.cos(deg2rad(deg)),
  y: cy + r * Math.sin(deg2rad(deg)),
});
const arcPath = (cx: number, cy: number, rInner: number, rOuter: number, a1: number, a2: number) => {
  const p1 = polar(cx, cy, rOuter, a1);
  const p2 = polar(cx, cy, rOuter, a2);
  const p3 = polar(cx, cy, rInner, a2);
  const p4 = polar(cx, cy, rInner, a1);
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  return [
    'M', p1.x, p1.y,
    'A', rOuter, rOuter, 0, large, 1, p2.x, p2.y,
    'L', p3.x, p3.y,
    'A', rInner, rInner, 0, large, 0, p4.x, p4.y,
    'Z',
  ].join(' ');
};

// Lighten a hex color toward white by `amt` (0..1)
function lighten(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (c: number) => Math.round(c + (255 - c) * amt);
  const to = (v: number) => v.toString(16).padStart(2, '0');
  return '#' + to(mix(r)) + to(mix(g)) + to(mix(b));
}

function EmotionWheelSVG({ size = 520, selected, onToggle, label = true }: any) {
  const cx = size / 2, cy = size / 2;
  // Ring radii
  const r0 = size * 0.14; // core hole
  const r1 = size * 0.28; // between core & nuance
  const r2 = size * 0.40; // between nuance & specific
  const r3 = size * 0.49; // outer

  const sliceCore = 60; // 6 cores
  const sliceNuance = 20; // 3 per core → 60/3
  const sliceSpec = 20; // 3 per nuance → same

  const isOn = (word: string) => selected.includes(word);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <filter id="softshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.17  0 0 0 0 0.28  0 0 0 0.18 0"/>
          <feBlend in="SourceGraphic"/>
        </filter>
      </defs>

      {EMOTION_WHEEL.map((sector, i) => {
        const startAngle = -sliceCore/2 + i * sliceCore;
        const endAngle = startAngle + sliceCore;
        const midAngle = (startAngle + endAngle) / 2;
        const coreOn = isOn(sector.core);

        return (
          <g key={sector.core}>
            {/* OUTER — specifics */}
            {sector.branches.map((b, bi) => {
              return b.specifics.map((sp, si) => {
                const a1 = startAngle + bi * sliceNuance + si * (sliceSpec/3);
                const a2 = a1 + (sliceSpec/3);
                const on = isOn(sp);
                const mid = (a1 + a2) / 2;
                const tp = polar(cx, cy, (r2 + r3)/2, mid);
                const rot = mid > 90 && mid < 270 ? mid + 180 : mid;
                return (
                  <g key={sp} style={{ cursor: 'pointer' }} onClick={(e: any) => { e.stopPropagation(); onToggle(sp); }}>
                    <path
                      d={arcPath(cx, cy, r2, r3, a1, a2)}
                      fill={on ? sector.color : lighten(sector.color, 0.60)}
                      stroke="#fff" strokeWidth={1.25}
                      style={{ transition: 'fill 180ms' }}
                    />
                    {label && (
                      <text
                        x={tp.x} y={tp.y}
                        transform={`rotate(${rot} ${tp.x} ${tp.y})`}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={size * 0.0235}
                        fontFamily="var(--font-sans)"
                        fontWeight={on ? 700 : 600}
                        fill={on ? '#fff' : '#2d3435'}
                        pointerEvents="none"
                        style={{ userSelect: 'none' }}
                      >
                        {sp}
                      </text>
                    )}
                  </g>
                );
              });
            })}

            {/* MIDDLE — nuances */}
            {sector.branches.map((b, bi) => {
              const a1 = startAngle + bi * sliceNuance;
              const a2 = a1 + sliceNuance;
              const on = isOn(b.nuance);
              const mid = (a1 + a2) / 2;
              const tp = polar(cx, cy, (r1 + r2)/2, mid);
              const rot = mid > 90 && mid < 270 ? mid + 180 : mid;
              return (
                <g key={b.nuance} style={{ cursor: 'pointer' }} onClick={(e: any) => { e.stopPropagation(); onToggle(b.nuance); }}>
                  <path
                    d={arcPath(cx, cy, r1, r2, a1, a2)}
                    fill={on ? sector.color : lighten(sector.color, 0.35)}
                    stroke="#fff" strokeWidth={1.5}
                    style={{ transition: 'fill 180ms' }}
                  />
                  {label && (
                    <text
                      x={tp.x} y={tp.y}
                      transform={`rotate(${rot} ${tp.x} ${tp.y})`}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={size * 0.028}
                      fontFamily="var(--font-sans)"
                      fontWeight={700}
                      fill={on ? '#fff' : '#1a1f20'}
                      pointerEvents="none"
                      style={{ userSelect: 'none' }}
                    >
                      {b.nuance}
                    </text>
                  )}
                </g>
              );
            })}

            {/* INNER — core */}
            <g style={{ cursor: 'pointer' }} onClick={(e: any) => { e.stopPropagation(); onToggle(sector.core); }}>
              <path
                d={arcPath(cx, cy, r0, r1, startAngle, endAngle)}
                fill={coreOn ? sector.color : lighten(sector.color, 0.15)}
                stroke="#fff" strokeWidth={2}
                style={{ transition: 'fill 180ms' }}
              />
              {label && (() => {
                const tp = polar(cx, cy, (r0 + r1)/2, midAngle);
                const rot = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;
                return (
                  <text
                    x={tp.x} y={tp.y}
                    transform={`rotate(${rot} ${tp.x} ${tp.y})`}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={size * 0.038}
                    fontFamily="var(--font-heading)"
                    fontWeight={800}
                    fill="#fff"
                    letterSpacing={0.3}
                    pointerEvents="none"
                    style={{ userSelect: 'none' }}
                  >
                    {sector.core}
                  </text>
                );
              })()}
            </g>
          </g>
        );
      })}

      {/* Center hole / label */}
      <circle cx={cx} cy={cy} r={r0 - 2} fill="#FAFBFB" stroke="#ECEFF2"/>
      <text
        x={cx} y={cy - 4}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.022}
        fontFamily="var(--font-sans)" fontWeight={700}
        fill="#2d3435" letterSpacing={1}
        style={{ textTransform: 'uppercase' }}
      >
        Feel
      </text>
      <text
        x={cx} y={cy + size * 0.025}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.028}
        fontFamily="var(--font-heading)" fontWeight={800}
        fill="#1F3649"
      >
        {selected.length > 0 ? selected.length : 'today'}
      </text>
      {selected.length > 0 && (
        <text
          x={cx} y={cy + size * 0.06}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={size * 0.017}
          fontFamily="var(--font-sans)" fill="#5a6061"
        >
          selected
        </text>
      )}
    </svg>
  );
}

// ---------- Small preview (inside MoodSection) ----------
export function EmotionWheelPreview({ selected, onOpen, onRemove }: any) {
  return (
    <div>
      <div
        onClick={onOpen}
        role="button"
        style={{
          position: 'relative',
          borderRadius: 16,
          background: 'linear-gradient(170deg, #FAFBFB 0%, #f1f4f5 100%)',
          border: '1px solid #ECEFF2',
          padding: 14,
          cursor: 'pointer',
          transition: 'all 180ms ease',
        }}
        onMouseEnter={(e: any) => e.currentTarget.style.borderColor = '#d6dcde'}
        onMouseLeave={(e: any) => e.currentTarget.style.borderColor = '#ECEFF2'}
      >
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 8px', borderRadius: 9999,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid #ECEFF2',
          fontSize: 10.5, fontWeight: 700, color: '#5a6061',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <ExpandIcon/> Expand
        </div>
        <div style={{ maxWidth: 280, margin: '0 auto' }}>
          <EmotionWheelSVG size={260} selected={selected} onToggle={() => onOpen()} label={false}/>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 12.5, color: '#5a6061' }}>
            {selected.length === 0
              ? <span>Tap the wheel to name what you feel.</span>
              : <span><strong style={{ color: '#2d3435' }}>{selected.length}</strong> selected · click to refine</span>}
          </div>
        </div>
      </div>

      {/* Chips below preview */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {selected.map((w: string) => (
            <span key={w} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 10px 5px 12px',
              background: '#1F3649', color: '#fff',
              borderRadius: 9999, fontSize: 12, fontWeight: 600,
            }}>
              {w}
              <button
                onClick={(e: any) => { e.stopPropagation(); onRemove(w); }}
                aria-label={`Remove ${w}`}
                style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', padding: 0, display: 'inline-flex' }}
              >
                <XIcon size={11}/>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
    </svg>
  );
}
function XIcon({ size = 12 }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
    </svg>
  );
}

// ---------- Fullscreen expanded picker ----------
export function EmotionWheelFullscreen({ open, onClose, selected, onToggle, onClear }: any) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: any) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Group selected by core so the summary feels like a narrative
  const byCore: any = {};
  selected.forEach((w: string) => {
    const hit = EMOTION_WHEEL.find(s =>
      s.core === w ||
      s.branches.some(b => b.nuance === w) ||
      s.branches.some(b => b.specifics.includes(w))
    );
    if (!hit) return;
    (byCore[hit.core] ||= { color: hit.color, words: [] }).words.push(w);
  });

  const node = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(12,22,41,0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'stretch', justifyContent: 'stretch',
      animation: 'fadeIn 200ms ease both',
    }} onClick={onClose}>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
      <div
        onClick={(e: any) => e.stopPropagation()}
        style={{
          margin: 0,
          width: '100vw',
          height: '100vh',
          background: '#FAFBFB',
          display: 'grid', gridTemplateColumns: '1fr 320px',
          overflow: 'hidden',
          animation: 'modalIn 320ms cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* LEFT — wheel */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 22px',
            background: 'rgba(255,255,255,0.85)',
            borderBottom: '1px solid #ECEFF2',
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#adb3b4', textTransform: 'uppercase' }}>Feelings wheel</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', marginTop: 2 }}>What are you actually feeling?</h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClear} style={{
                padding: '8px 14px', borderRadius: 12, border: '1px solid #ECEFF2',
                background: '#fff', fontSize: 12, fontWeight: 600, color: '#5a6061',
                cursor: 'pointer',
              }}>Clear</button>
              <button onClick={onClose} style={{
                padding: '8px 14px', borderRadius: 12, border: 0,
                background: '#1F3649', color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <CollapseIcon/> Collapse
              </button>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%', maxWidth: 'min(92vh, 1100px)', maxHeight: 'min(92vh, 1100px)', aspectRatio: '1 / 1' }}>
              <EmotionWheelSVG size={1100} selected={selected} onToggle={onToggle}/>
            </div>
          </div>

          <div style={{
            padding: '12px 22px',
            borderTop: '1px solid #ECEFF2',
            background: '#fff',
            fontSize: 12, color: '#5a6061',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>Core feelings at the center · refine outward. Click anything to toggle.</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#adb3b4' }}>esc to close</span>
          </div>
        </div>

        {/* RIGHT — selected summary */}
        <aside style={{
          background: '#fff',
          borderLeft: '1px solid #ECEFF2',
          padding: '22px 22px 20px',
          display: 'flex', flexDirection: 'column', minHeight: 0,
        }}>
          <div className="section-title" style={{ marginBottom: 6 }}>You're feeling</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: 1.05, color: '#1F3649', marginBottom: 18 }}>
            {selected.length === 0 ? <span style={{ color: '#adb3b4', fontSize: 18, fontWeight: 600 }}>Pick what fits — start anywhere.</span> : `${selected.length} thing${selected.length === 1 ? '' : 's'}`}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, marginRight: -6, paddingRight: 6 }}>
            {Object.entries(byCore).length === 0 && (
              <div style={{ fontSize: 13, color: '#5a6061', lineHeight: 1.55 }}>
                Tap the <strong style={{ color: '#2d3435' }}>inner ring</strong> for the broad feeling, then move outward to get more specific. You can pick as many as feel true.
              </div>
            )}
            {Object.entries(byCore).map(([core, coreData]: any) => (
              <div key={core} style={{ marginBottom: 18 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: 9999, background: coreData.color }}/>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#5a6061', textTransform: 'uppercase' }}>{core}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {coreData.words.map((w: string) => (
                    <button
                      key={w}
                      onClick={() => onToggle(w)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 10px 6px 12px',
                        background: coreData.color, color: '#fff',
                        border: 0, borderRadius: 9999,
                        fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {w}
                      <XIcon size={11}/>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ECEFF2' }}>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px 16px', borderRadius: 14, border: 0,
                background: '#1F3649', color: '#fff',
                fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              Save & collapse <ArrowRight size={14}/>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
  return ReactDOM.createPortal(node, document.body);
}

function CollapseIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/>
    </svg>
  );
}
