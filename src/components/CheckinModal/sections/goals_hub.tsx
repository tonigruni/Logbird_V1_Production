// Hierarchical goals view: Big → Quarterly → Monthly → Weekly
// Ported 1:1 from /tmp/logbird_checkin/src/goals_hub.jsx

import { useState } from 'react';
import { CheckIcon, CaretDown } from '../icons';

const BIG_GOALS = [
  {
    id: 'bg1',
    title: 'Become a principal designer',
    area: 'Career',
    horizon: '2027',
    color: '#1F3649',
    why: 'Build the body of work I\'d be proud to leave behind.',
    progress: 0.52,
    quarters: [
      {
        id: 'q1', label: 'Q2 · Apr–Jun',
        title: 'Ship the Identity Redesign',
        progress: 0.72, status: 'on-track',
        months: [
          { id: 'm1', label: 'May', title: 'Design system v2 adopted by 3 teams', progress: 0.60, weeks: [
            { id: 'w1', label: 'This week', title: 'Onboard the Growth team to tokens', due: 'Fri', done: false, active: true },
            { id: 'w2', label: 'Next week', title: 'Ship the motion guidelines doc', due: '10 May', done: false },
          ]},
          { id: 'm2', label: 'Jun', title: 'Present redesign at All-Hands', progress: 0.10, weeks: [] },
        ],
      },
    ],
  },
  {
    id: 'bg2',
    title: 'Strong, steady body',
    area: 'Health',
    horizon: '2026',
    color: '#22c55e',
    why: 'Show up for the next 40 years with a body that still runs.',
    progress: 0.38,
    quarters: [
      {
        id: 'q2', label: 'Q2 · Apr–Jun',
        title: 'Run a half marathon',
        progress: 0.45, status: 'on-track',
        months: [
          { id: 'm3', label: 'May', title: 'Reach 15km long run', progress: 0.50, weeks: [
            { id: 'w3', label: 'This week', title: '3 runs · one hill session', due: 'Sun', done: false, active: true },
            { id: 'w4', label: 'Next week', title: '12km long run', due: '11 May', done: false },
          ]},
          { id: 'm4', label: 'Jun', title: '18km long run · race-week taper', progress: 0.0, weeks: [] },
        ],
      },
    ],
  },
  {
    id: 'bg3',
    title: 'A life shared, not performed',
    area: 'Relationships',
    horizon: 'ongoing',
    color: '#9f403d',
    why: 'People over optics. Depth over reach.',
    progress: 0.66,
    quarters: [
      {
        id: 'q3', label: 'Q2 · Apr–Jun',
        title: 'Weekly dinners + a slow weekend away',
        progress: 0.60, status: 'ahead',
        months: [
          { id: 'm5', label: 'May', title: 'Plan weekend with Mira', progress: 0.75, weeks: [
            { id: 'w5', label: 'This week', title: 'Book cabin · dinner w/ Sam', due: 'Thu', done: true, active: true },
          ]},
          { id: 'm6', label: 'Jun', title: 'Mira\'s birthday, properly', progress: 0.0, weeks: [] },
        ],
      },
    ],
  },
];

const STATUS_STYLES: any = {
  'on-track':   { bg: '#dcfce7', fg: '#15803d', label: 'On track' },
  'ahead':      { bg: '#dbeafe', fg: '#1d4ed8', label: 'Ahead' },
  'at-risk':    { bg: '#fef3c7', fg: '#a16207', label: 'At risk' },
  'off-track':  { bg: '#fee2e2', fg: '#b91c1c', label: 'Off track' },
};

/* ---------- Tiny ring ---------- */
function Ring({ pct, color, size = 44, stroke = 4 }: any) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const off = C * (1 - pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ECEFF2" strokeWidth={stroke}/>
      <circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={C} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 600ms ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fontSize={size * 0.28} fontWeight="800" fill={color}
        fontFamily="var(--font-heading)">
        {Math.round(pct * 100)}
      </text>
    </svg>
  );
}

/* ---------- Flat progress bar ---------- */
function Bar({ pct, color }: any) {
  return (
    <div style={{ height: 4, background: '#f2f4f4', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, pct * 100)}%`, height: '100%',
        background: color, borderRadius: 9999,
        transition: 'width 600ms ease',
      }}/>
    </div>
  );
}

/* ---------- Cascade column for a single big goal ---------- */
function GoalCascade({ goal, isOpen, onToggle }: any) {
  const q = goal.quarters[0]; // current quarter
  return (
    <div style={{
      borderRadius: 16,
      border: '1px solid #ECEFF2',
      background: '#fff',
      overflow: 'hidden',
    }}>
      {/* Header card */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          padding: 18,
          background: isOpen ? `linear-gradient(135deg, ${goal.color}08, ${goal.color}00)` : '#fff',
          border: 0, borderBottom: isOpen ? '1px solid #ECEFF2' : '1px solid transparent',
          display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
          transition: 'all 220ms ease',
        }}
      >
        <Ring pct={goal.progress} color={goal.color} size={52} stroke={5}/>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em',
              color: goal.color, textTransform: 'uppercase',
            }}>{goal.area}</span>
            <span style={{ fontSize: 10.5, color: '#adb3b4' }}>· {goal.horizon}</span>
          </div>
          <h3 style={{
            fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', color: '#2d3435',
            lineHeight: 1.2, margin: 0,
          }}>{goal.title}</h3>
          <p style={{
            margin: 0, marginTop: 4, fontSize: 12, color: '#5a6061',
            fontStyle: 'italic', lineHeight: 1.4,
          }}>{goal.why}</p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 9999,
          background: '#f6f7f7', color: '#5a6061',
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform 220ms ease',
        }}>
          <CaretDown size={14}/>
        </span>
      </button>

      {/* Cascade — shown when open */}
      <div style={{
        display: 'grid',
        gridTemplateRows: isOpen ? '1fr' : '0fr',
        transition: 'grid-template-rows 320ms ease',
      }}>
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div style={{ padding: 18, paddingTop: 14 }}>
            <GoalCascadeRows quarter={q} color={goal.color}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Cascade rows: Q → M → W ---------- */
function GoalCascadeRows({ quarter, color }: any) {
  const status = STATUS_STYLES[quarter.status] || STATUS_STYLES['on-track'];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr', gap: 10,
    }}>
      {/* Quarter row */}
      <HorizonRow
        icon="Q"
        label={quarter.label}
        title={quarter.title}
        pct={quarter.progress}
        color={color}
        pill={<span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999,
          background: status.bg, color: status.fg, textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>{status.label}</span>}
      />
      {/* Connector */}
      <div style={{ paddingLeft: 20, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
        {quarter.months.map((m: any) => (
          <div key={m.id} style={{ position: 'relative' }}>
            {/* Month */}
            <div style={{
              position: 'relative', paddingLeft: 22,
            }}>
              <span style={{
                position: 'absolute', left: 0, top: 14, bottom: 0, width: 1,
                background: m.weeks.length ? '#e4e9ea' : 'transparent',
              }}/>
              <span style={{
                position: 'absolute', left: -4, top: 10, width: 9, height: 9,
                borderRadius: 9999, background: '#fff', border: `2px solid ${color}`,
              }}/>
              <HorizonRow
                icon={m.label.slice(0,1)}
                label={m.label}
                title={m.title}
                pct={m.progress}
                color={color}
                compact
              />
            </div>

            {/* Weeks */}
            {m.weeks.length > 0 && (
              <div style={{ paddingLeft: 44, marginTop: 6, display: 'grid', gap: 6 }}>
                {m.weeks.map((w: any) => (
                  <div key={w.id} style={{
                    position: 'relative',
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: w.active ? color + '0a' : '#fafbfb',
                    border: `1px solid ${w.active ? color + '33' : '#ECEFF2'}`,
                    display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 10, alignItems: 'center',
                  }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: 5,
                      border: `1.5px solid ${w.done ? color : '#cdd4d5'}`,
                      background: w.done ? color : '#fff',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {w.done && <CheckIcon size={9} color="#fff" stroke={3}/>}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em',
                          color: w.active ? color : '#adb3b4', textTransform: 'uppercase',
                        }}>{w.label}</span>
                        {w.active && <span style={{
                          width: 5, height: 5, borderRadius: 9999, background: color,
                          boxShadow: `0 0 0 4px ${color}22`,
                        }}/>}
                      </div>
                      <div style={{
                        fontSize: 12.5, fontWeight: 600, color: '#2d3435',
                        textDecoration: w.done ? 'line-through' : 'none',
                        opacity: w.done ? 0.55 : 1,
                        marginTop: 1,
                      }}>{w.title}</div>
                    </div>
                    <span style={{ fontSize: 10.5, color: '#adb3b4', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {w.due}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Row component shared between horizons ---------- */
function HorizonRow({ icon, label, title, pct, color, pill, compact }: any) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
      padding: compact ? '4px 0' : '10px 12px',
      borderRadius: compact ? 0 : 12,
      background: compact ? 'transparent' : '#fafbfb',
      border: compact ? 'none' : '1px solid #ECEFF2',
    }}>
      <span style={{
        width: compact ? 22 : 30, height: compact ? 22 : 30, borderRadius: 8,
        background: color + '15', color: color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: compact ? 11 : 12, fontWeight: 800, fontFamily: 'var(--font-heading)',
        flexShrink: 0,
      }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em',
            color: '#adb3b4', textTransform: 'uppercase',
          }}>{label}</span>
          {pill}
        </div>
        <div style={{
          fontSize: compact ? 12.5 : 13.5, fontWeight: 600, color: '#2d3435',
          marginTop: 2,
        }}>{title}</div>
        {!compact && <div style={{ marginTop: 6 }}><Bar pct={pct} color={color}/></div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: compact ? 11 : 13, fontWeight: 800, fontFamily: 'var(--font-heading)',
          color: color,
        }}>{Math.round(pct * 100)}%</div>
      </div>
    </div>
  );
}

/* ---------- Top summary strip ---------- */
function GoalsSummary({ goals }: any) {
  // Build this-week flat list
  const weekItems: any[] = [];
  goals.forEach((g: any) => g.quarters.forEach((q: any) => q.months.forEach((m: any) => m.weeks.forEach((w: any) => {
    if (w.active) weekItems.push({ ...w, color: g.color, area: g.area });
  }))));
  const doneCount = weekItems.filter(w => w.done).length;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
      marginBottom: 18,
    }}>
      {[
        { label: 'Big goals',   value: goals.length,                                        sub: 'active',    color: '#1F3649' },
        { label: 'This quarter',value: goals.reduce((a: any,g: any)=>a+g.quarters.length,0),          sub: 'milestones',color: '#22c55e' },
        { label: 'This month',  value: goals.reduce((a: any,g: any)=>a+g.quarters.reduce((b: any,q: any)=>b+q.months.length,0),0), sub: 'targets',color: '#3b82f6' },
        { label: 'This week',   value: `${doneCount}/${weekItems.length}`,                  sub: 'done',      color: '#9f403d' },
      ].map((s,i)=>(
        <div key={i} style={{
          padding: '12px 14px', borderRadius: 12,
          background: s.color + '0a',
          border: `1px solid ${s.color}22`,
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {s.label}
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)',
            color: '#2d3435', letterSpacing: '-0.02em', marginTop: 3, lineHeight: 1,
          }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, color: '#5a6061', marginTop: 3 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Main hub ---------- */
export function GoalsHub() {
  const [openId, setOpenId] = useState<any>(BIG_GOALS[0].id);
  return (
    <div>
      <GoalsSummary goals={BIG_GOALS}/>
      <div style={{ display: 'grid', gap: 12 }}>
        {BIG_GOALS.map(g => (
          <GoalCascade
            key={g.id}
            goal={g}
            isOpen={openId === g.id}
            onToggle={() => setOpenId(openId === g.id ? null : g.id)}
          />
        ))}
      </div>
    </div>
  );
}
