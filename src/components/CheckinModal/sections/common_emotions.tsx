// CommonEmotions — quick-pick grid of 6 core feelings, each with 4 common nuances
// Ported 1:1 from /tmp/logbird_checkin/src/common_emotions.jsx

const COMMON_EMOTION_GROUPS = [
  { core: 'Happy',  color: '#B5A47A', words: ['Content', 'Grateful', 'Playful', 'Proud'] },
  { core: 'Tender', color: '#9E8A98', words: ['Loving', 'Connected', 'Warm', 'Seen'] },
  { core: 'Calm',   color: '#6A9298', words: ['Hopeful', 'Steady', 'Focused', 'Curious'] },
  { core: 'Sad',    color: '#6A7A94', words: ['Tired', 'Lonely', 'Heavy', 'Disappointed'] },
  { core: 'Tense',  color: '#7E5E5E', words: ['Anxious', 'Overwhelmed', 'Restless', 'Frustrated'] },
  { core: 'Angry',  color: '#8A6A60', words: ['Irritated', 'Resentful', 'Critical', 'Annoyed'] },
];

function lightenColor(hex: string, amt: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2), 16);
  const g = parseInt(h.substring(2,4), 16);
  const b = parseInt(h.substring(4,6), 16);
  const lr = Math.round(r + (255 - r) * amt);
  const lg = Math.round(g + (255 - g) * amt);
  const lb = Math.round(b + (255 - b) * amt);
  return `rgb(${lr}, ${lg}, ${lb})`;
}

export function CommonEmotions({ selected, onToggle, onOpenWheel }: any) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {COMMON_EMOTION_GROUPS.map(g => (
          <div key={g.core} style={{
            padding: 10,
            borderRadius: 12,
            background: lightenColor(g.color, 0.88),
            border: `1px solid ${lightenColor(g.color, 0.65)}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: g.color }}/>
              <span style={{
                fontSize: 10.5, fontWeight: 800, letterSpacing: '0.12em',
                color: g.color, textTransform: 'uppercase',
              }}>{g.core}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {g.words.map(w => {
                const on = selected.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => onToggle(w)}
                    style={{
                      padding: '5px 10px', borderRadius: 9999,
                      border: `1px solid ${on ? g.color : lightenColor(g.color, 0.55)}`,
                      background: on ? g.color : '#fff',
                      color: on ? '#fff' : '#2d3435',
                      fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11.5, color: '#5a6061' }}>
          {selected.length > 0
            ? <><strong style={{ color: '#2d3435' }}>{selected.length}</strong> picked · {selected.slice(0, 3).join(' · ')}{selected.length > 3 ? '…' : ''}</>
            : 'Tap what fits. Skip the words that don\'t.'}
        </span>
        <button
          onClick={onOpenWheel}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'transparent', border: 0,
            fontSize: 11.5, fontWeight: 700, color: '#1F3649',
            cursor: 'pointer', padding: 0,
          }}
        >
          More nuance
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H9M17 7v8"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
