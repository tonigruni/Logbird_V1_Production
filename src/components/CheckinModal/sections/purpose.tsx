// Purpose — your north star, reminded daily
// Ported 1:1 from /tmp/logbird_checkin/src/purpose.jsx

import { useState } from 'react';

const DEFAULT_PURPOSE = {
  statement: "To build quiet, humane tools — and live a steady life with people I love.",
  pillars: [
    { label: "Craft",    text: "Make things that respect attention.", color: "#1F3649" },
    { label: "Family",   text: "Be present for Mira and mom.",        color: "#9f403d" },
    { label: "Health",   text: "Move, sleep, tend the body.",         color: "#22c55e" },
  ],
};

export function Purpose() {
  const [editing, setEditing] = useState(false);
  const [p, setP] = useState(DEFAULT_PURPOSE);

  return (
    <div style={{
      position: 'relative',
      borderRadius: 16,
      background: 'linear-gradient(140deg, #1F3649 0%, #2a4861 60%, #3b5f7d 100%)',
      color: '#fff',
      padding: 20,
      overflow: 'hidden',
    }}>
      {/* faint star pattern */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }} width="100%" height="100%">
        <defs>
          <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#fff"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 5.8L20 9l-4.5 4 1.2 6L12 16l-4.7 3 1.2-6L4 9l5.6-1.2z"/>
            </svg>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(253,230,138,0.9)', textTransform: 'uppercase' }}>
              Your purpose
            </span>
          </div>
          {editing ? (
            <textarea
              value={p.statement}
              onChange={e => setP({ ...p, statement: e.target.value })}
              rows={2}
              autoFocus
              style={{
                width: '100%', resize: 'vertical',
                padding: 10, borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', fontFamily: 'var(--font-heading)',
                fontSize: 18, fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.01em',
                outline: 'none',
              }}
            />
          ) : (
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 19, fontWeight: 600,
              lineHeight: 1.35, letterSpacing: '-0.01em',
              color: '#fff', margin: 0,
              textWrap: 'balance',
            } as any}>
              "{p.statement}"
            </p>
          )}
        </div>
        <button
          onClick={() => setEditing(v => !v)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#fff', cursor: 'pointer',
            padding: '6px 10px', borderRadius: 9,
            fontSize: 11, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}
        >
          {editing ? 'Done' : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
              </svg>
              Edit
            </>
          )}
        </button>
      </div>

      {/* Pillars */}
      <div style={{
        position: 'relative',
        marginTop: 16, paddingTop: 14,
        borderTop: '1px solid rgba(255,255,255,0.12)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {p.pillars.map((pi, i) => (
          <div key={i} style={{
            padding: '8px 10px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: pi.color === '#1F3649' ? '#fde68a' : pi.color }}/>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {pi.label}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
              {pi.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
