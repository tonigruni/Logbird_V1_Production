// 4 mood check-in styles.
// Ported 1:1 from /tmp/logbird_checkin/src/moods.jsx

import { MOOD_WORDS } from '../data';
import { EmotionWheelPreview } from './emotion_wheel';

/* ------- 1. Word cloud / tag picker ------- */
function MoodWords({ selected, onToggle }: any) {
  const tones: any = {
    positive: { base: '#f7f9fa', hi: '#1F3649' },
    neutral:  { base: '#f7f9fa', hi: '#5a6061' },
    negative: { base: '#f7f9fa', hi: '#9f403d' },
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {MOOD_WORDS.map(({ w, tone }) => {
        const on = selected.includes(w);
        const t = tones[tone];
        return (
          <button
            key={w}
            className={"chip" + (on ? " selected" : "")}
            onClick={() => onToggle(w)}
            style={on ? { background: t.hi, borderColor: t.hi, color: '#fff' } : {}}
          >
            <span style={{
              width: 6, height: 6, borderRadius: 999,
              background: on ? '#fff' : t.hi, opacity: on ? 0.9 : 0.55,
            }}/>
            {w}
          </button>
        );
      })}
    </div>
  );
}

/* ------- 2. 5 emoji faces ------- */
function MoodEmoji({ value, onChange }: any) {
  const faces = [
    { v: 1, label: 'very low',  color: '#7E5E5E', d: 'M8 15c1.5-1.5 6.5-1.5 8 0' },
    { v: 2, label: 'low',       color: '#8A7868', d: 'M8 14.5c1-0.5 6-0.5 8 0' },
    { v: 3, label: 'neutral',   color: '#5a6061', d: 'M8 14h8' },
    { v: 4, label: 'good',      color: '#5A8490', d: 'M8 13c1.5 1.5 6.5 1.5 8 0' },
    { v: 5, label: 'excellent', color: '#1F3649', d: 'M7 12c2 3 8 3 10 0' },
  ];
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {faces.map(f => {
        const on = value === f.v;
        return (
          <button
            key={f.v}
            onClick={() => onChange(f.v)}
            style={{
              flex: 1,
              padding: '14px 8px 10px',
              border: `2px solid ${on ? f.color : '#ECEFF2'}`,
              background: on ? '#fff' : '#fff',
              borderRadius: 16,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              transition: 'all 180ms ease',
              cursor: 'pointer',
              boxShadow: on ? '0 8px 24px rgba(45,52,53,0.08)' : 'none',
              transform: on ? 'translateY(-2px)' : 'none',
            }}
            aria-pressed={on}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                 stroke={on ? f.color : '#5a6061'} strokeWidth="1.8"
                 strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5"/>
              <circle cx="9" cy="10" r="0.8" fill={on ? f.color : '#5a6061'}/>
              <circle cx="15" cy="10" r="0.8" fill={on ? f.color : '#5a6061'}/>
              <path d={f.d}/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: on ? f.color : '#adb3b4', textTransform: 'capitalize' }}>
              {f.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------- 3. Slider 1-10 ------- */
function MoodSlider({ value, onChange }: any) {
  const labels = ['rough', 'flat', 'so-so', 'ok', 'steady', 'good', 'bright', 'great', 'glowing', 'on fire'];
  const unset = value == null;
  const display = unset ? 5 : value;
  const label = unset ? 'tap to set' : labels[Math.max(0, Math.min(9, display - 1))];
  const hue = 0 + (display - 1) * 13; // red -> green
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 48, fontWeight: 700, letterSpacing: '-0.02em', color: unset ? '#adb3b4' : '#1F3649' }}>
          {unset ? '—' : display}<span style={{ fontSize: 22, color: '#adb3b4' }}>/10</span>
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#5a6061', textTransform: 'capitalize' }}>{label}</span>
      </div>
      <input
        type="range" min={1} max={10} value={display}
        onChange={e => onChange(Number(e.target.value))}
        onPointerDown={() => { if (unset) onChange(display); }}
        className="mood-slider"
        style={unset ? { opacity: 0.6 } : undefined}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, color: '#adb3b4', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <span>Rough</span><span>Steady</span><span>On fire</span>
      </div>
    </div>
  );
}

/* ------- 4. Weather metaphor ------- */
function MoodWeather({ value, onChange }: any) {
  const options = [
    { v: 'stormy',   label: 'Stormy',   svg: (
      <g stroke="#5a6061" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M8 14a4 4 0 1 1 2-7.5A4.5 4.5 0 0 1 18 9h.5a3 3 0 0 1 0 6H8z" fill="#e4e9ea" stroke="none"/>
        <path d="M10 18l-2 3M14 17l-2 4M17 18l-1.5 3"/>
      </g>
    )},
    { v: 'cloudy',   label: 'Cloudy',   svg: (
      <g stroke="#5a6061" strokeWidth="1.6" fill="none">
        <path d="M8 16a4 4 0 1 1 2-7.5A4.5 4.5 0 0 1 18 11h.5a3 3 0 0 1 0 6H8z" fill="#ebeeef" stroke="none"/>
      </g>
    )},
    { v: 'misty',    label: 'Misty',    svg: (
      <g stroke="#5a6061" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M4 10h12M6 14h14M4 18h12"/>
      </g>
    )},
    { v: 'partly',   label: 'Partly sunny', svg: (
      <g stroke="#f59e0b" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <circle cx="9" cy="9" r="3.2" fill="#fef3c7" stroke="#f59e0b"/>
        <path d="M9 3.5v1.5M9 13v1.5M3.5 9h1.5M13 9h1.5M5.4 5.4l1 1M11.6 11.6l1 1M5.4 12.6l1-1M11.6 6.4l1-1"/>
        <path d="M10 18a3.5 3.5 0 1 1 1.8-6.5A4 4 0 0 1 19 14h.5a2.5 2.5 0 0 1 0 5H10z" fill="#ebeeef" stroke="#5a6061"/>
      </g>
    )},
    { v: 'sunny',    label: 'Sunny',    svg: (
      <g stroke="#f59e0b" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.5" fill="#fef3c7" stroke="#f59e0b"/>
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>
      </g>
    )},
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
      {options.map(o => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={"weather-tile" + (on ? " selected" : "")}
            aria-pressed={on}
          >
            <svg className="weather-svg" viewBox="0 0 24 24">{o.svg}</svg>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: on ? '#1F3649' : '#5a6061' }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------- Dispatch ------- */
export function MoodCheckIn({ style, state, setState, onOpenWheel }: any) {
  if (style === 'wheel') {
    const toggle = (w: any) => {
      const has = state.words.includes(w);
      setState({ ...state, words: has ? state.words.filter((x: any) => x !== w) : [...state.words, w] });
    };
    return (
      <EmotionWheelPreview
        selected={state.words}
        onOpen={onOpenWheel}
        onRemove={toggle}
      />
    );
  }
  if (style === 'words') {
    return <MoodWords selected={state.words} onToggle={(w: any) => {
      const has = state.words.includes(w);
      setState({ ...state, words: has ? state.words.filter((x: any) => x !== w) : [...state.words, w] });
    }}/>;
  }
  if (style === 'emoji')   return <MoodEmoji   value={state.emoji}   onChange={(v: any) => setState({ ...state, emoji: v })} />;
  if (style === 'slider')  return <MoodSlider  value={state.slider}  onChange={(v: any) => setState({ ...state, slider: v })} />;
  if (style === 'weather') return <MoodWeather value={state.weather} onChange={(v: any) => setState({ ...state, weather: v })} />;
  return null;
}
