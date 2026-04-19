// AffirmPurposeBar — compact, full-width strip combining today's affirmation and purpose
// Ported 1:1 from /tmp/logbird_checkin/src/affirm_purpose_bar.jsx

import { useState } from 'react';

const AP_AFFIRMATIONS = [
  "I'm allowed to move at my own pace. Steady is still forward.",
  "I don't have to earn rest. I'm allowed to take up space.",
  "I can do hard things and still be gentle with myself.",
  "What I build quietly, compounds loudly. Keep going.",
  "I am not behind. I am exactly where today begins.",
  "I can hold high standards and low shame at the same time.",
];

const AP_DEFAULT_PURPOSE = {
  statement: "To build quiet, humane tools — and live a steady life with people I love.",
  pillars: [
    { label: "Craft",  color: "#fde68a" },
    { label: "Family", color: "#f4a3a0" },
    { label: "Health", color: "#86efac" },
  ],
};

export function AffirmPurposeBar() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * AP_AFFIRMATIONS.length));
  const [editing, setEditing] = useState(false);
  const [purpose, setPurpose] = useState(AP_DEFAULT_PURPOSE);
  const aff = AP_AFFIRMATIONS[idx];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 1px minmax(0, 1fr)',
      gap: 0,
      borderRadius: 16,
      overflow: 'hidden',
      background: 'linear-gradient(90deg, #1F3649 0%, #24425b 55%, #2d5272 100%)',
      color: '#fff',
      position: 'relative',
      minHeight: 90,
    }}>
      {/* faint dot pattern */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }} width="100%" height="100%">
        <defs>
          <pattern id="apdots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="0.9" fill="#fff"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#apdots)"/>
      </svg>

      {/* LEFT — Affirmation */}
      <div style={{ position: 'relative', padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/>
          </svg>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(253,230,138,0.95)', textTransform: 'uppercase' }}>
            Today's affirmation
          </span>
          <button
            onClick={() => setIdx((idx + 1) % AP_AFFIRMATIONS.length)}
            style={{
              marginLeft: 'auto',
              background: 'transparent', border: 0,
              color: 'rgba(255,255,255,0.55)',
              fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}
          >
            ↻ Another
          </button>
        </div>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-heading)',
          fontSize: 15.5, fontWeight: 600,
          lineHeight: 1.35, letterSpacing: '-0.005em',
          color: '#fff', textWrap: 'balance',
        } as any}>
          "{aff}"
        </p>
      </div>

      {/* Divider */}
      <div style={{ background: 'rgba(255,255,255,0.08)' }}/>

      {/* RIGHT — Purpose */}
      <div style={{ position: 'relative', padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7"/>
            <circle cx="12" cy="12" r="3"/>
            <circle cx="12" cy="12" r="0.6" fill="#fde68a"/>
          </svg>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(253,230,138,0.95)', textTransform: 'uppercase' }}>
            Your purpose
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {purpose.pillars.map((pi, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: 9999, background: pi.color }}/>
                {pi.label}
              </span>
            ))}
            <button
              onClick={() => setEditing(v => !v)}
              style={{
                background: 'transparent', border: 0,
                color: 'rgba(255,255,255,0.55)',
                fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
                padding: 0,
              }}
            >
              {editing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>
        {editing ? (
          <textarea
            value={purpose.statement}
            onChange={e => setPurpose({ ...purpose, statement: e.target.value })}
            rows={2}
            autoFocus
            style={{
              width: '100%', resize: 'none',
              padding: 6, borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontFamily: 'var(--font-heading)',
              fontSize: 15, fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.005em',
              outline: 'none',
            }}
          />
        ) : (
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontSize: 15.5, fontWeight: 600,
            lineHeight: 1.35, letterSpacing: '-0.005em',
            color: '#fff', textWrap: 'balance',
          } as any}>
            "{purpose.statement}"
          </p>
        )}
      </div>
    </div>
  );
}
