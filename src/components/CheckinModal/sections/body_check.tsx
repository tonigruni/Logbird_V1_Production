// Yesterday / overnight check — how the body arrived
// Ported 1:1 from /tmp/logbird_checkin/src/body_check.jsx

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Moon, Drop, ForkKnife, PersonSimpleRun, Wine, DeviceMobile } from '@phosphor-icons/react';

/* Small segmented control */
function BodySeg({ options, value, onChange, color = '#1F3649' }: any) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      gap: 4,
      background: '#f2f4f4',
      padding: 3,
      borderRadius: 10,
    }}>
      {options.map((o: any) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            title={o.title || o.l}
            style={{
              padding: '6px 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
              border: 0, borderRadius: 8, cursor: 'pointer',
              background: on ? '#fff' : 'transparent',
              color: on ? color : '#5a6061',
              boxShadow: on ? '0 1px 4px rgba(12,22,41,0.08)' : 'none',
              transition: 'all 140ms ease',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              minHeight: 26,
            }}
          >
            {o.icon}{o.l}
          </button>
        );
      })}
    </div>
  );
}


/* -------- Stat row primitive -------- */
function Row({ icon, label, hint, children, emphasis, error }: any) {
  return (
    <div style={{
      padding: '10px 0',
      borderTop: emphasis ? 0 : '1px solid #ECEFF2',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <span style={{
            width: 22, height: 22, borderRadius: 7,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: error ? '#fee2e2' : '#f6f7f7',
            color: error ? '#b91c1c' : '#5a6061', flexShrink: 0,
          }}>{icon}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#2d3435' }}>{label}</span>
          {error && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 10, fontWeight: 700, color: '#b91c1c',
              background: '#fee2e2', padding: '2px 7px', borderRadius: 9999,
              letterSpacing: '0.05em',
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5"/><path d="M12 16h.01"/>
              </svg>
              Required
            </span>
          )}
        </div>
        {hint && <span style={{ fontSize: 10.5, color: '#adb3b4', fontWeight: 600, whiteSpace: 'nowrap' }}>{hint}</span>}
      </div>
      <div style={error ? { animation: 'shake 420ms ease' } : undefined}>
        {children}
      </div>
    </div>
  );
}

/* -------- Dual-thumb sleep slider (18:00 → next-day 12:00 window) -------- */
const WINDOW_START = 18 * 60;   // 18:00
const WINDOW_LEN   = 18 * 60;   // 18h window → ends 12:00 next day (noon)

function toSliderPos(minuteOfDay: number) {
  // bedtime (evening) maps directly; wake (morning) wraps past midnight
  let x = minuteOfDay - WINDOW_START;
  if (x < 0) x += 1440;
  return Math.max(0, Math.min(WINDOW_LEN, x));
}
function fromSliderPos(pos: number) {
  return ((WINDOW_START + pos) % 1440 + 1440) % 1440;
}

function DualTimeSlider({ bed, wake, setBed, setWake }: any) {
  const trackRef = useRef<any>(null);
  const [drag, setDrag] = useState<any>(null); // 'bed' | 'wake' | null
  const bedUnset  = bed == null;
  const wakeUnset = wake == null;
  const bedPos  = bedUnset  ? WINDOW_LEN * 0.30 : toSliderPos(bed);   // default visual 23:30ish
  const wakePos = wakeUnset ? WINDOW_LEN * 0.75 : toSliderPos(wake);  // default visual 07:00ish

  const handleMove = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const raw = Math.round((frac * WINDOW_LEN) / 5) * 5; // snap 5 min
    if (drag === 'bed') {
      const v = Math.min(raw, wakePos - 30);
      setBed(fromSliderPos(Math.max(0, v)));
    } else if (drag === 'wake') {
      const v = Math.max(raw, bedPos + 30);
      setWake(fromSliderPos(Math.min(WINDOW_LEN, v)));
    }
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: any) => handleMove(e.touches ? e.touches[0].clientX : e.clientX);
    const onUp   = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [drag, bedPos, wakePos]);

  const bedPct  = (bedPos  / WINDOW_LEN) * 100;
  const wakePct = (wakePos / WINDOW_LEN) * 100;

  const tick = (label: string, pct: number) => (
    <div style={{ position: 'absolute', left: `${pct}%`, top: 22, transform: 'translateX(-50%)', fontSize: 9.5, color: '#adb3b4', fontFamily: 'var(--font-mono)' }}>
      {label}
    </div>
  );

  const thumb = (pct: number, which: string, icon: any, unset: boolean) => (
    <div
      onMouseDown={() => {
        setDrag(which);
        if (which === 'bed' && bedUnset) setBed(fromSliderPos(bedPos));
        if (which === 'wake' && wakeUnset) setWake(fromSliderPos(wakePos));
      }}
      onTouchStart={() => {
        setDrag(which);
        if (which === 'bed' && bedUnset) setBed(fromSliderPos(bedPos));
        if (which === 'wake' && wakeUnset) setWake(fromSliderPos(wakePos));
      }}
      style={{
        position: 'absolute', left: `${pct}%`, top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 22, height: 22, borderRadius: 9999,
        background: unset ? '#f2f4f4' : '#fff',
        border: unset ? '2px dashed #cdd4d7' : '2px solid #1F3649',
        opacity: unset ? 0.7 : 1,
        boxShadow: drag === which ? '0 0 0 6px rgba(31,54,73,0.12), 0 2px 6px rgba(12,22,41,0.15)' : (unset ? 'none' : '0 2px 6px rgba(12,22,41,0.12)'),
        cursor: 'grab', zIndex: 3,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: unset ? '#cdd4d7' : '#1F3649',
        transition: drag ? 'none' : 'box-shadow 160ms ease, opacity 160ms ease',
        touchAction: 'none',
      }}
    >
      {icon}
    </div>
  );

  return (
    <div style={{ padding: '6px 10px 16px' }}>
      <div ref={trackRef} style={{
        position: 'relative', height: 8, borderRadius: 9999,
        background: '#ECEFF2',
      }}>
        {/* filled segment = time asleep (faded when unset) */}
        <div style={{
          position: 'absolute', left: `${bedPct}%`, width: `${wakePct - bedPct}%`,
          top: 0, bottom: 0,
          background: (bedUnset || wakeUnset)
            ? 'repeating-linear-gradient(90deg, #cdd4d7 0 6px, transparent 6px 12px)'
            : 'linear-gradient(90deg, #4a7a9b, #1F3649)',
          opacity: (bedUnset || wakeUnset) ? 0.5 : 1,
          borderRadius: 9999,
        }}/>
        {thumb(bedPct,  'bed',  <span style={{ fontSize: 11 }}>🌙</span>, bedUnset)}
        {thumb(wakePct, 'wake', <span style={{ fontSize: 11 }}>☀️</span>, wakeUnset)}
        {tick('18:00',  0)}
        {tick('00:00', 33.33)}
        {tick('06:00', 66.66)}
        {tick('12:00', 100)}
      </div>
    </div>
  );
}

/* -------- Main component -------- */
/* time helpers */
function minToHHMM(m: number | null) {
  if (m == null) return '--:--';
  m = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), mm = m % 60;
  return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}
function hhmmToMin(s: string) {
  const [h, m] = s.split(':').map(Number);
  return (h * 60 + (m || 0)) % 1440;
}

export function BodyCheck({ showErrors = false, onValidChange }: any) {
  const [bedtime,   setBedtime]   = useState<any>(null);
  const [waketime,  setWaketime]  = useState<any>(null);
  const [editTimes, setEditTimes] = useState(true);
  const [sleepQual, setSleepQual] = useState<any>(null); // awful/rough/ok/good/restful
  const [dreams,    setDreams]    = useState(false);
  const [dreamNote, setDreamNote] = useState('');
  const [alcohol,   setAlcohol]   = useState<any>(null);
  const [food,      setFood]      = useState<any>(null);
  const [water,     setWater]     = useState<any>(null); // none/little/some/good/plenty
  const [steps,     setSteps]     = useState<any>(null);
  const [activities,setActivities]= useState<any[]>([]); // ['walk','cardio','workout']
  const [screens,   setScreens]   = useState(false);
  const [note,      setNote]      = useState('');

  const toggleActivity = (k: string) => setActivities((a: any[]) => a.includes(k) ? a.filter((x: string) => x !== k) : [...a, k]);

  // Required-field validation
  const missing = {
    sleepTimes: bedtime == null || waketime == null,
    sleepQual:  sleepQual == null,
    alcohol:    alcohol == null,
    food:       food == null,
    water:      water == null,
    steps:      steps == null,
  };
  const isValid = !Object.values(missing).some(Boolean);
  useEffect(() => {
    if (onValidChange) onValidChange(isValid);
  }, [isValid, onValidChange]);

  // compute sleep duration from times (handle overnight wrap); show "—" if unset
  const hasTimes = bedtime != null && waketime != null;
  const sleepMin = hasTimes ? (waketime - bedtime + 1440) % 1440 : 0;
  const sleepH = Math.floor(sleepMin / 60);
  const sleepM = sleepMin % 60;
  const hourDisplay = !hasTimes ? '—h' : (sleepM === 0 ? `${sleepH}h` : `${sleepH}h ${sleepM}m`);

  const sleepColor = !sleepQual ? '#adb3b4' : (({
    awful:   '#7E5E5E',
    rough:   '#8A7868',
    ok:      '#5a6061',
    good:    '#4A7070',
    restful: '#1F3649',
  } as any)[sleepQual] || '#1F3649');

  return (
    <div className="card-soft" style={{ padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>How did yesterday land?</h3>
        <p style={{ fontSize: 12.5, color: '#5a6061', marginTop: 2 }}>A quick scan of the body you brought in.</p>
      </div>

      {/* SLEEP — emphasized, with slider */}
      <div style={{
        padding: 14,
        borderRadius: 12,
        background: '#f7f9fa',
        border: '1px solid ' + (showErrors && (missing.sleepTimes || missing.sleepQual) ? '#fca5a5' : '#ECEFF2'),
        marginBottom: 8,
        animation: showErrors && (missing.sleepTimes || missing.sleepQual) ? 'shake 420ms ease' : 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, background: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#5a6061',
            }}><Moon size={13}/></span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#1F3649', textTransform: 'uppercase' }}>Sleep</span>
                {showErrors && (missing.sleepTimes || missing.sleepQual) && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    fontSize: 9.5, fontWeight: 700, color: '#b91c1c',
                    background: '#fee2e2', padding: '2px 6px', borderRadius: 9999,
                  }}>Required</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#5a6061', fontFamily: 'var(--font-mono)' }}>
                Bed <strong style={{ color: hasTimes ? '#2d3435' : '#adb3b4' }}>{minToHHMM(bedtime)}</strong> → wake <strong style={{ color: hasTimes ? '#2d3435' : '#adb3b4' }}>{minToHHMM(waketime)}</strong>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: sleepColor, lineHeight: 1 }}>
              {hourDisplay}
            </div>
            <div style={{ fontSize: 10.5, color: '#adb3b4', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
              {({ awful: 'awful', rough: 'rough', ok: 'okay', good: 'good', restful: 'restful' } as any)[sleepQual] || 'not set'}
            </div>
          </div>
        </div>

        <DualTimeSlider bed={bedtime} wake={waketime} setBed={setBedtime} setWake={setWaketime}/>

        <div style={{ marginTop: 10 }}>
          <BodySeg
            color="#1F3649"
            value={sleepQual}
            onChange={setSleepQual}
            options={[
              { v: 'awful',   l: 'Awful' },
              { v: 'rough',   l: 'Rough' },
              { v: 'ok',      l: 'Okay' },
              { v: 'good',    l: 'Good' },
              { v: 'restful', l: 'Restful' },
            ]}
          />
        </div>
      </div>

      {/* Drinks / Food */}
      <Row icon={<Wine size={13}/>} label="Alcohol" hint="last night" error={showErrors && missing.alcohol}>
        <BodySeg
          color="#1F3649"
          value={alcohol} onChange={setAlcohol}
          options={[
            { v: 'none', l: 'None' },
            { v: 'one',  l: '1 drink' },
            { v: 'more', l: '2 or more' },
          ]}
        />
      </Row>

      <Row icon={<ForkKnife size={13}/>} label="Ate well" hint="yesterday" error={showErrors && missing.food}>
        <BodySeg
          color="#1F3649"
          value={food} onChange={setFood}
          options={[
            { v: 'poorly', l: 'Poorly' },
            { v: 'no',     l: 'Not really' },
            { v: 'mostly', l: 'Mostly' },
            { v: 'yes',    l: 'Yes' },
            { v: 'great',  l: 'Great' },
          ]}
        />
      </Row>

      <Row icon={<Drop size={13}/>} label="Hydration" hint="yesterday" error={showErrors && missing.water}>
        <BodySeg
          color="#1F3649"
          value={water} onChange={setWater}
          options={[
            { v: 'none',   l: 'None' },
            { v: 'little', l: 'A little' },
            { v: 'some',   l: 'Some' },
            { v: 'good',   l: 'Good' },
            { v: 'plenty', l: 'Plenty' },
          ]}
        />
      </Row>

      <Row icon={<PersonSimpleRun size={13}/>} label="Movement" hint="yesterday" error={showErrors && missing.steps}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
          {/* Steps row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            background: '#f7f9fa', border: '1px solid #ECEFF2',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6061" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20c1-4 3-6 5-7 1-.5 2-2 2-4 0-2-2-3-3-3s-2 1-2 3c0 3 2 4 3 5"/>
              <path d="M14 18c1-3 3-5 5-6 1-.4 1.5-1.5 1.5-3 0-1.5-1.5-2.5-2.5-2.5s-2 1-2 2.5c0 2.5 1.5 3.5 2.5 4"/>
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <input
                  type="number" min="0" step="500"
                  value={steps ?? ''}
                  placeholder="—"
                  onChange={e => {
                    const v = e.target.value;
                    setSteps(v === '' ? null : Math.max(0, parseInt(v, 10)));
                  }}
                  style={{
                    width: 76, padding: '2px 6px',
                    border: '1px solid #ECEFF2', borderRadius: 6, background: '#fff',
                    fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
                    color: '#2d3435', outline: 'none',
                  }}
                />
                <span style={{ fontSize: 11.5, color: '#5a6061', fontWeight: 600 }}>steps</span>
                <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#adb3b4', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {steps == null ? 'not set' : steps < 3000 ? 'low' : steps < 7000 ? 'moderate' : steps < 11000 ? 'active' : 'very active'}
                </span>
              </div>
              <input
                type="range" min="0" max="20000" step="500"
                value={steps ?? 0}
                onChange={e => setSteps(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#1F3649', opacity: steps == null ? 0.5 : 1 }}
              />
            </div>
          </div>

          {/* Activity multi-select chips */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: '#adb3b4', textTransform: 'uppercase', marginBottom: 6 }}>
              Activities <span style={{ fontWeight: 500, letterSpacing: 0, textTransform: 'none', color: '#adb3b4' }}>— pick any</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { k: 'walk',    l: 'Walk',    glyph: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="13" cy="4" r="1.7"/><path d="M7 22l2.5-6 2.5 2 1 5"/><path d="M13 14l3-3 3 2"/><path d="M10 10l2-4 4 1"/>
                  </svg>
                )},
                { k: 'cardio',  l: 'Cardio',  glyph: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h3l2-5 3 10 2-6 2 3h6"/>
                  </svg>
                )},
                { k: 'workout', l: 'Workout', glyph: (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>
                  </svg>
                )},
              ].map(a => {
                const on = activities.includes(a.k);
                return (
                  <button
                    key={a.k}
                    onClick={() => toggleActivity(a.k)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px 10px', borderRadius: 10,
                      border: '1px solid ' + (on ? '#1F3649' : '#ECEFF2'),
                      background: on ? '#f0f3f5' : '#fff',
                      color: on ? '#1F3649' : '#5a6061',
                      fontSize: 12, fontWeight: 700, letterSpacing: '0.01em',
                      cursor: 'pointer', transition: 'all 140ms ease',
                    }}
                  >
                    {a.glyph}{a.l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Row>

      {/* Toggles row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid #ECEFF2' }}>
        <ToggleCard label="Dreams" icon={<span style={{ fontSize: 14 }}>💭</span>} on={dreams} onChange={setDreams}/>
        <ToggleCard label="Screen before bed" icon={<DeviceMobile size={13}/>} on={screens} onChange={setScreens}/>
      </div>

      {/* Dream note — only when dreams toggled on */}
      {dreams && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', color: '#adb3b4', textTransform: 'uppercase', marginBottom: 5 }}>
            Dream note
          </div>
          <textarea
            value={dreamNote} onChange={e => setDreamNote(e.target.value)}
            rows={2}
            placeholder="A fragment you'd like to remember — a face, a place, a feeling…"
            style={{
              width: '100%', resize: 'vertical',
              padding: 10, borderRadius: 10,
              border: '1px solid #ECEFF2', background: '#fafbfb',
              fontFamily: 'var(--font-sans)', fontSize: 12.5, color: '#2d3435',
              outline: 'none', fontStyle: 'italic',
            }}
          />
        </div>
      )}

      {/* Optional note */}
      <div style={{ marginTop: 12 }}>
        <textarea
          value={note} onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="Anything notable about your body this morning?"
          style={{
            width: '100%', resize: 'vertical',
            padding: 10, borderRadius: 10,
            border: '1px solid #ECEFF2', background: '#fafbfb',
            fontFamily: 'var(--font-sans)', fontSize: 12.5, color: '#2d3435',
            outline: 'none',
          }}
        />
      </div>

      {/* Correlate hint — only when we have a real signal */}
      {(() => {
        const sleepHoursF = sleepMin / 60;
        let msg: any = null;
        if ((alcohol !== 'none') && (sleepQual === 'rough' || sleepQual === 'awful')) {
          msg = <span>Logbird notices: rough sleep after alcohol has happened <strong style={{ color: '#2d3435' }}>3 of last 4 times</strong>.</span>;
        } else if (sleepHoursF < 6.5) {
          msg = <span>Under 6.5h tends to flatten your mood by midday. Be gentle with your schedule.</span>;
        } else if (activities.includes('workout') && (sleepQual === 'restful' || sleepQual === 'good')) {
          msg = <span>Movement days correlate with your most restful nights. Keep going.</span>;
        }
        if (!msg) return null;
        return (
          <div style={{
            marginTop: 12, padding: '10px 12px',
            borderRadius: 10, background: '#fafbfb',
            border: '1px dashed #e0e4e6',
            fontSize: 11.5, color: '#5a6061', lineHeight: 1.5,
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 13 }}>💡</span>
            <span>{msg}</span>
          </div>
        );
      })()}
    </div>
  );
}

/* -------- Pill toggle card -------- */
function ToggleCard({ label, icon, on, onChange }: any) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', borderRadius: 10,
        border: '1px solid ' + (on ? '#1F3649' : '#ECEFF2'),
        background: on ? '#1F3649' : '#fff',
        color: on ? '#fff' : '#2d3435',
        fontSize: 12, fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 160ms ease',
        width: '100%',
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: 6,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: on ? 'rgba(255,255,255,0.12)' : '#f6f7f7',
        color: on ? '#fff' : '#5a6061',
      }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      <span style={{
        width: 28, height: 16, borderRadius: 9999,
        background: on ? 'rgba(255,255,255,0.3)' : '#e6e9ea',
        position: 'relative', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 14 : 2,
          width: 12, height: 12, borderRadius: 9999,
          background: '#fff', transition: 'left 160ms ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}/>
      </span>
    </button>
  );
}
