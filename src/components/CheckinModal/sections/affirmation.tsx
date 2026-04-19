// Affirmation + Goals reminder — for the check-in page
// Ported 1:1 from /tmp/logbird_checkin/src/affirmation.jsx

import { useState } from 'react';
import { Sparkle, Target, CaretRight } from '../icons';

const AFFIRMATIONS = [
  "I'm allowed to move at my own pace. Steady is still forward.",
  "I don't have to earn rest. I'm allowed to take up space.",
  "I can do hard things and still be gentle with myself.",
  "What I build quietly, compounds loudly. Keep going.",
  "I am not behind. I am exactly where today begins.",
  "I can hold high standards and low shame at the same time.",
];

export function Affirmation() {
  const [i, setI] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const text = AFFIRMATIONS[i];
  return (
    <div className="card-soft" style={{
      padding: 24,
      background: 'linear-gradient(155deg, #fefcf7 0%, #fdf4e3 100%)',
      borderColor: '#f5ecd6',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 14, left: 18, fontSize: 56, fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#e9d7a9', lineHeight: 0.55 }}>"</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Sparkle size={14} color="#ca8a04"/>
        <span className="section-title" style={{ color: '#a16207' }}>Today's affirmation</span>
      </div>
      <p style={{
        fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600,
        lineHeight: 1.4, letterSpacing: '-0.01em', color: '#2d3435',
        paddingLeft: 22,
      }}>
        {text}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingLeft: 22 }}>
        <span style={{ fontSize: 11, color: '#a16207', fontWeight: 600 }}>Say it once, slowly.</span>
        <button
          onClick={() => setI((i + 1) % AFFIRMATIONS.length)}
          style={{ background: 'transparent', border: 0, color: '#5a6061', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          Another →
        </button>
      </div>
    </div>
  );
}

const GOALS = [
  { id: 'g1', title: 'Ship the Identity Redesign',  area: 'Career',          progress: 0.72, deadline: 'by end of Q2', color: '#1F3649' },
  { id: 'g2', title: 'Run a half marathon',         area: 'Health',          progress: 0.45, deadline: 'October',       color: '#22c55e' },
  { id: 'g3', title: 'Read 12 books this year',     area: 'Personal Growth', progress: 0.33, deadline: '4 of 12',       color: '#3b82f6' },
  { id: 'g4', title: 'Closer to Mira',              area: 'Relationships',   progress: 0.60, deadline: 'ongoing',       color: '#9f403d' },
];

export function Goals() {
  return (
    <div className="card-soft" style={{ padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={16} color="#1F3649"/> Why you're doing this
        </h3>
        <button className="link-btn" style={{ fontSize: 12 }}>All goals →</button>
      </div>
      <p style={{ fontSize: 12.5, color: '#5a6061', marginBottom: 16 }}>The things today is quietly in service of.</p>

      <div style={{ display: 'grid', gap: 10 }}>
        {GOALS.map(g => (
          <div key={g.id} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
            padding: '10px 12px', borderRadius: 12,
            border: '1px solid #ECEFF2', background: '#fff',
          }}>
            <span style={{
              width: 34, height: 34, borderRadius: 10,
              background: g.color + '15', color: g.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-heading)',
            }}>
              {Math.round(g.progress * 100)}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#2d3435', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                <span style={{ fontSize: 10.5, color: g.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{g.area}</span>
                <span style={{ width: 3, height: 3, borderRadius: 999, background: '#dde4e5' }}/>
                <span style={{ fontSize: 10.5, color: '#adb3b4' }}>{g.deadline}</span>
              </div>
              <div style={{ height: 3, borderRadius: 9999, background: '#f2f4f4', marginTop: 6 }}>
                <div style={{ width: `${g.progress * 100}%`, height: '100%', background: g.color, borderRadius: 9999 }}/>
              </div>
            </div>
            <span style={{ color: '#adb3b4' }}><CaretRight size={14}/></span>
          </div>
        ))}
      </div>
    </div>
  );
}
