// Section components: Hero, Tasks, Priorities, Timebox, Intention, Gratitude,
// Wheel, Journal, Yesterday, Habits, Quote.
// Ported 1:1 from /tmp/logbird_checkin/src/sections.jsx

import { useState } from 'react';
import React from 'react';
import {
  Sun, Heart, Target, Book, ArrowRight, Lightning, PlusIcon,
  GripDots, CheckIcon, CaretRight, Flame
} from '../icons';
import { Pill, PRIORITY_PILL, PRIORITY_DOT, Checkbox, Btn } from '../atoms';
import { MOOD_WORDS, TIMEBOX, YESTERDAY, HABITS, WHEEL, QUOTE, INITIAL_PRIORITIES } from '../data';
import { CommonEmotions } from './common_emotions';
import { MoodCheckIn } from './moods';
import { EmotionWheelFullscreen } from './emotion_wheel';

/* ------------- HERO ------------- */
export function Hero({ name = 'Toni', treatment = 'navy', mood, weather }: any) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const hr = now.getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';

  // Navy hero (matches dashboard)
  if (treatment === 'navy') {
    return (
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #162838 0%, #1F3649 100%)',
        borderRadius: 20,
        overflow: 'hidden',
        padding: '44px 40px 48px',
        color: '#fff',
      }}>
        {/* gradient bars */}
        <div className="hero-bars">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{
              background: `linear-gradient(to top, rgba(255,255,255,${0.13 + (i % 3) * 0.04}), transparent)`,
              height: `${42 + (i % 5) * 10}%`,
              animation: `gradientBarPulse ${3.5 + (i % 4) * 0.4}s ease-in-out infinite`,
              animationDelay: `${(i * 0.2) % 2}s`,
            }}/>
          ))}
        </div>
        <div className="grid-lines" style={{ position: 'absolute', inset: 0, opacity: 0.8 }}/>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
              {dateStr} · {timeStr}
            </div>
            <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.08 }}>
              {greet}, {name}.
            </h1>
            <p style={{ marginTop: 10, color: 'rgba(255,255,255,0.62)', fontSize: 15, maxWidth: 520, lineHeight: 1.55 }}>
              A quiet hour before the day asks anything of you. Let's set the shape of it.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10, color: '#fff',
            }}>
              <Sun size={18} color="#fde68a"/>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>17°C</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.62)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Partly cloudy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Light variant
  if (treatment === 'light') {
    return (
      <div style={{ padding: '8px 4px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#adb3b4', textTransform: 'uppercase', marginBottom: 10 }}>
          {dateStr} · {timeStr} · 17°C Partly cloudy
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
          {greet}, <span style={{ color: '#adb3b4' }}>{name}.</span>
        </h1>
        <p style={{ marginTop: 12, color: '#5a6061', fontSize: 16, maxWidth: 580, lineHeight: 1.55 }}>
          A quiet hour before the day asks anything of you. Let's set the shape of it.
        </p>
      </div>
    );
  }

  // Dawn variant
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #fdecd9 0%, #f8d5c1 35%, #e9d2db 70%, #cfd8e4 100%)',
      borderRadius: 20,
      padding: '44px 40px 48px',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -60, top: -80, width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, #fde4b2, transparent 65%)', opacity: 0.9 }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(45,52,53,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>
          {dateStr} · {timeStr}
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.08, color: '#2d3435' }}>
          {greet}, {name}.
        </h1>
        <p style={{ marginTop: 10, color: 'rgba(45,52,53,0.65)', fontSize: 15, maxWidth: 520, lineHeight: 1.55 }}>
          A quiet hour before the day asks anything of you. Let's set the shape of it.
        </p>
      </div>
    </div>
  );
}

/* ------------- MOOD + ENERGY ------------- */
export function MoodSection({ moodStyle, moodState, setMoodState, energy, setEnergy, committed, onCommit, showErrors = false, onValidChange }: any) {
  const [wheelOpen, setWheelOpen] = React.useState(false);
  const [moodView, setMoodView] = React.useState('common'); // 'common' | 'wheel'
  const toggleWord = (w: any) => {
    const has = moodState.words.includes(w);
    setMoodState({ ...moodState, words: has ? moodState.words.filter((x: any) => x !== w) : [...moodState.words, w] });
  };
  const isWheelStyle = moodStyle === 'wheel';

  const moodMissing = (() => {
    if (moodStyle === 'wheel' || moodStyle === 'words') return (moodState.words || []).length === 0;
    if (moodStyle === 'emoji')   return moodState.emoji   == null;
    if (moodStyle === 'slider')  return moodState.slider  == null;
    if (moodStyle === 'weather') return moodState.weather == null;
    return false;
  })();
  const energyMissing = energy == null;
  const isValid = !moodMissing && !energyMissing;
  React.useEffect(() => { if (onValidChange) onValidChange(isValid); }, [isValid, onValidChange]);
  return (
    <div className="card-soft" style={{
      padding: 22,
      border: showErrors && moodMissing ? '1px solid #fca5a5' : undefined,
      animation: showErrors && moodMissing ? 'shake 420ms ease' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>How's the weather inside?</h3>
            {showErrors && moodMissing && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 10, fontWeight: 700, color: '#b91c1c',
                background: '#fee2e2', padding: '2px 7px', borderRadius: 9999,
                letterSpacing: '0.05em',
              }}>Required</span>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: '#5a6061', marginTop: 2 }}>
            {showErrors && moodMissing
              ? 'Pick at least one — there are no wrong answers.'
              : 'No wrong answers. Just honest weather.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isWheelStyle && (
            <div style={{
              display: 'inline-flex', padding: 3,
              background: '#f2f4f4', borderRadius: 9999, gap: 2,
            }}>
              {[
                { v: 'common', l: 'Common' },
                { v: 'wheel',  l: 'Wheel' },
              ].map(o => {
                const on = moodView === o.v;
                return (
                  <button
                    key={o.v}
                    onClick={() => setMoodView(o.v)}
                    style={{
                      padding: '4px 10px', borderRadius: 9999,
                      border: 0, cursor: 'pointer',
                      background: on ? '#fff' : 'transparent',
                      color: on ? '#1F3649' : '#5a6061',
                      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
                      boxShadow: on ? '0 1px 4px rgba(12,22,41,0.08)' : 'none',
                      transition: 'all 140ms ease',
                    }}
                  >{o.l}</button>
                );
              })}
            </div>
          )}
          {committed && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, fontWeight: 700, color: '#22c55e',
              background: 'rgba(34,197,94,0.1)', padding: '3px 8px',
              borderRadius: 9999, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <CheckIcon size={10} color="#22c55e" stroke={3}/> Logged
            </span>
          )}
        </div>
      </div>

      {isWheelStyle && moodView === 'common' ? (
        <CommonEmotions
          selected={moodState.words}
          onToggle={toggleWord}
          onOpenWheel={() => setWheelOpen(true)}
        />
      ) : (
        <MoodCheckIn
          style={moodStyle}
          state={moodState}
          setState={setMoodState}
          onOpenWheel={() => setWheelOpen(true)}
        />
      )}

      <div style={{
        marginTop: 18, paddingTop: 14, borderTop: '1px solid #ECEFF2',
        animation: showErrors && energyMissing ? 'shake 420ms ease' : 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h4 style={{ fontSize: 12.5, fontWeight: 700, color: '#2d3435' }}>Energy level</h4>
            {showErrors && energyMissing && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 10, fontWeight: 700, color: '#b91c1c',
                background: '#fee2e2', padding: '2px 7px', borderRadius: 9999,
                letterSpacing: '0.05em',
              }}>Required</span>
            )}
          </div>
          <span style={{ fontSize: 11, color: '#adb3b4' }}>where are you starting from?</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3,4,5].map(i => {
            const on = energy != null && i <= energy;
            return (
              <button
                key={i}
                onClick={() => setEnergy(i)}
                style={{
                  flex: 1, height: 36, borderRadius: 10,
                  border: '2px solid ' + (on ? '#1F3649' : (showErrors && energyMissing ? '#fca5a5' : '#ECEFF2')),
                  background: on ? 'rgba(31,54,73,0.07)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 160ms ease',
                  cursor: 'pointer',
                }}
              >
                <Lightning size={15} color={on ? '#1F3649' : '#ebeeef'}/>
              </button>
            );
          })}
        </div>
      </div>

      <EmotionWheelFullscreen
        open={wheelOpen}
        onClose={() => setWheelOpen(false)}
        selected={moodState.words}
        onToggle={toggleWord}
        onClear={() => setMoodState({ ...moodState, words: [] })}
      />
    </div>
  );
}

/* ------------- INTENTION ------------- */
export function IntentionCard({ value, setValue }: any) {
  return (
    <div className="card-soft" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05 }}>
        <Target size={140} color="#1F3649" stroke={1.2}/>
      </div>
      <div style={{ position: 'relative' }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Intention for today</div>
        <textarea
          className="intention-input"
          rows={2}
          placeholder="Today I want to…"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Move slowly.', 'Finish the hard thing first.', 'Be kind in writing.', 'Say no once.'].map(s => (
            <button key={s} onClick={() => setValue(s)} style={{
              fontSize: 12, fontWeight: 500,
              padding: '6px 12px', borderRadius: 9999,
              border: '1px solid #ECEFF2',
              background: '#fff', color: '#5a6061',
              cursor: 'pointer',
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------- TOP 3 PRIORITIES (draggable) ------------- */
export function Priorities({ items, setItems }: any) {
  const [dragId, setDragId] = useState(null as any);
  const [overId, setOverId] = useState(null as any);
  const [done, setDone] = useState({} as any);

  const onDrop = () => {
    if (!dragId || !overId || dragId === overId) { setDragId(null); setOverId(null); return; }
    const from = items.findIndex((i: any) => i.id === dragId);
    const to = items.findIndex((i: any) => i.id === overId);
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDragId(null); setOverId(null);
  };

  return (
    <div className="card-soft" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Today's top 3</h3>
          <p style={{ fontSize: 12.5, color: '#5a6061', marginTop: 2 }}>If only these got done, today is a win. Drag to reorder.</p>
        </div>
      </div>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((it: any, idx: number) => (
          <li
            key={it.id}
            className="priority-item"
            draggable
            onDragStart={() => setDragId(it.id)}
            onDragOver={(e: any) => { e.preventDefault(); setOverId(it.id); }}
            onDragEnd={onDrop}
            onDrop={onDrop}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '14px 12px',
              borderRadius: 12,
              background: overId === it.id ? '#f7f9fa' : 'transparent',
              opacity: dragId === it.id ? 0.4 : 1,
              transition: 'background 160ms ease',
            }}
          >
            <span className="drag-handle" style={{ marginTop: 4 }}>
              <GripDots size={18}/>
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: done[it.id] ? '#1F3649' : '#f2f4f4',
              color: done[it.id] ? '#fff' : '#5a6061',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
              fontFamily: 'var(--font-heading)',
            }}>{idx + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: done[it.id] ? '#adb3b4' : '#2d3435', textDecoration: done[it.id] ? 'line-through' : 'none' }}>{it.title}</div>
              <div style={{ fontSize: 12.5, color: '#5a6061', marginTop: 2 }}>{it.note}</div>
            </div>
            <Checkbox done={!!done[it.id]} onClick={() => setDone({ ...done, [it.id]: !done[it.id] })}/>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------- TASKS (grouped by priority + quick add) ------------- */
export function TasksGrouped({ tasks, setTasks, done, toggleDone }: any) {
  const [adding, setAdding] = useState(null as any); // 'urgent' | 'high' | 'normal'
  const [draft, setDraft] = useState('');

  const groups = [
    { key: 'urgent', label: 'Urgent', hint: 'Do these first' },
    { key: 'high',   label: 'High',   hint: 'Important, not fires' },
    { key: 'normal', label: 'Normal', hint: 'If time allows' },
  ];

  const addTask = (groupKey: string) => {
    if (!draft.trim()) { setAdding(null); return; }
    const id = 'new-' + Date.now();
    setTasks({
      ...tasks,
      [groupKey]: [...tasks[groupKey], { id, title: draft.trim(), project: null, time: null }],
    });
    setDraft(''); setAdding(null);
  };

  return (
    <div>
      {groups.map(g => {
        const list = tasks[g.key] || [];
        const p = PRIORITY_PILL[g.key];
        return (
          <div key={g.key} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pill bg={p.bg} color={p.color} style={{ border: '1px solid #ECEFF2', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 9999, background: PRIORITY_DOT[g.key], flexShrink: 0 }}/>
                  {p.label}
                </Pill>
                <span style={{ fontSize: 12, color: '#adb3b4' }}>{g.hint}</span>
                <span style={{ fontSize: 11, color: '#adb3b4' }}>· {list.length}</span>
              </div>
              <button
                onClick={() => setAdding(g.key)}
                style={{ background: 'transparent', border: 0, color: '#5a6061', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
              >
                <PlusIcon size={12} stroke={2.4}/> Add
              </button>
            </div>
            <div className="card-soft" style={{ padding: 4 }}>
              {list.map((t: any) => {
                const isDone = !!done[t.id];
                return (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    transition: 'background 140ms',
                  }}
                  onMouseEnter={(e: any) => e.currentTarget.style.background = '#f7f9fa'}
                  onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Checkbox done={isDone} onClick={() => toggleDone(t.id)}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500,
                        color: isDone ? '#adb3b4' : '#2d3435',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}>
                        {t.title}
                      </div>
                      {(t.project || t.time) && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 3, alignItems: 'center' }}>
                          {t.project && (
                            <span style={{ fontSize: 11, color: '#5a6061', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 6, height: 6, borderRadius: 2, background: '#1F3649' }}/>{t.project}
                            </span>
                          )}
                          {t.time && <span style={{ fontSize: 11, color: '#adb3b4' }}>{t.time} min</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {adding === g.key && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <div className="check" style={{ opacity: 0.5 }}/>
                  <input
                    autoFocus
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={(e: any) => { if (e.key === 'Enter') addTask(g.key); if (e.key === 'Escape') { setAdding(null); setDraft(''); } }}
                    onBlur={() => addTask(g.key)}
                    placeholder={`New ${g.label.toLowerCase()} task — press Enter to add`}
                    style={{ flex: 1, border: 0, background: 'transparent', fontSize: 14, color: '#2d3435' }}
                  />
                </div>
              )}
              {list.length === 0 && adding !== g.key && (
                <div style={{ padding: '14px', fontSize: 13, color: '#adb3b4', fontStyle: 'italic' }}>
                  Nothing here — breathe.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------- TIMEBOX ------------- */
export function Timebox() {
  const kinds: any = {
    deep:    { bg: '#f2f4f4', text: '#2d3435', dot: '#1F3649', label: 'Deep',    border: '#1F3649', borderLeft: true },
    shallow: { bg: '#f2f4f4', text: '#2d3435', dot: '#adb3b4', label: 'Shallow', border: '#ECEFF2' },
    meeting: { bg: '#f2f4f4', text: '#2d3435', dot: '#1F3649', label: 'Meeting', border: '#ECEFF2' },
    break:   { bg: '#f2f4f4', text: '#2d3435', dot: '#1F3649', label: 'Break',   border: '#ECEFF2' },
    social:  { bg: '#f2f4f4', text: '#2d3435', dot: '#1F3649', label: 'Social',  border: '#ECEFF2' },
    body:    { bg: '#f2f4f4', text: '#2d3435', dot: '#1F3649', label: 'Body',    border: '#ECEFF2' },
    ritual:  { bg: '#f2f4f4', text: '#2d3435', dot: '#1F3649', label: 'Ritual',  border: '#ECEFF2' },
  };
  const hours = Array.from({ length: 14 }, (_, i) => 7 + i); // 7am..8pm

  // y-position helper: minutes past 7am
  const topFor = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return ((h - 7) * 60 + m) * (54 / 60); // 54px per hour
  };
  const hFor = (s: string, e: string) => topFor(e) - topFor(s);

  return (
    <div className="card-soft" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #ECEFF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>Today's shape</h3>
          <p style={{ fontSize: 12.5, color: '#5a6061', marginTop: 2 }}>Blocks you've set aside. You can rearrange later in Timeboxing.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries({ deep: 'Deep', meeting: 'Meeting', break: 'Break' }).map(([k,l]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#5a6061' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#1F3649' }}/>{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', padding: '18px 24px 24px' }}>
        <div style={{ width: 56, flexShrink: 0, paddingTop: 4 }}>
          {hours.map(h => (
            <div key={h} style={{ height: 54, fontSize: 10.5, fontWeight: 600, color: '#adb3b4', letterSpacing: '0.06em' }}>
              {h > 12 ? h - 12 : h}{h >= 12 ? 'PM' : 'AM'}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, position: 'relative', height: hours.length * 54 + 4 }}>
          {/* gridlines */}
          {hours.map((h, i) => (
            <div key={h} style={{ position: 'absolute', left: 0, right: 0, top: i * 54, borderTop: '1px dashed #f2f4f4' }}/>
          ))}
          {/* current time line (assume 8:45 AM) */}
          <div style={{ position: 'absolute', left: -8, right: 0, top: topFor('08:45'), height: 0, borderTop: '1.5px solid #ef4444', zIndex: 3 }}>
            <div style={{ position: 'absolute', left: -12, top: -5, width: 10, height: 10, borderRadius: 999, background: '#ef4444' }}/>
            <span style={{ position: 'absolute', right: 0, top: -20, fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fff', padding: '2px 6px', borderRadius: 6 }}>8:45 · now</span>
          </div>
          {/* blocks */}
          {TIMEBOX.map(b => {
            const k = kinds[b.kind] || kinds.shallow;
            return (
              <div key={b.id} style={{
                position: 'absolute',
                left: 4, right: 4,
                top: topFor(b.start) + 2,
                height: Math.max(26, hFor(b.start, b.end) - 4),
                background: k.bg,
                color: k.text,
                border: `1px solid ${k.border || '#ECEFF2'}`,
                borderLeft: k.borderLeft ? `3px solid #1F3649` : `1px solid ${k.border || '#ECEFF2'}`,
                borderRadius: 10,
                padding: '6px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: 'none',
                overflow: 'hidden',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: k.dot, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                  <div style={{ fontSize: 10.5, opacity: 0.7, marginTop: 1 }}>{b.start}–{b.end}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------- GRATITUDE ------------- */
export function Gratitude({ values, setValues }: any) {
  return (
    <div className="card-soft" style={{ padding: 24, background: '#fefcf7', borderColor: '#f5ecd6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Heart size={16} color="#ca8a04"/>
        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: '#78350f' }}>Three things, small or loud.</h3>
      </div>
      {[0,1,2].map(i => (
        <div key={i} style={{ marginBottom: i < 2 ? 10 : 0, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ca8a04', fontWeight: 600 }}>0{i+1}</span>
          <input
            value={values[i] || ''}
            onChange={e => { const next = values.slice(); next[i] = e.target.value; setValues(next); }}
            placeholder={(['the coffee', 'Mira laughing at nothing', 'the way the light hits the kitchen'] as any)[i]}
            style={{
              width: '100%', paddingLeft: 40, paddingRight: 14, height: 40,
              borderRadius: 12,
              border: '1px solid #f5ecd6',
              background: '#fff',
              fontSize: 13.5, color: '#2d3435',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ------------- WHEEL NUDGE ------------- */
export function WheelNudge() {
  // weakest area
  const weakest = [...WHEEL].sort((a, b) => a.score - b.score)[0];
  return (
    <div className="card-soft" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
      {/* mini donut — two-tone: navy arc for weakest score, gray for remainder */}
      <svg width="90" height="90" viewBox="0 0 100 100">
        {(() => {
          const r = 36;
          const cx = 50, cy = 50;
          const circ = 2 * Math.PI * r;
          const filled = (weakest.score / 10) * circ;
          const startAngle = -90 * (Math.PI / 180);
          const x1 = cx + r * Math.cos(startAngle);
          const y1 = cy + r * Math.sin(startAngle);
          const endAngle = startAngle + (weakest.score / 10) * 2 * Math.PI;
          const x2 = cx + r * Math.cos(endAngle);
          const y2 = cy + r * Math.sin(endAngle);
          const large = weakest.score / 10 > 0.5 ? 1 : 0;
          // remainder arc
          const rx1 = x2, ry1 = y2;
          const rx2 = x1, ry2 = y1;
          const rlarge = (1 - weakest.score / 10) > 0.5 ? 1 : 0;
          return (
            <>
              <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill="#1F3649"/>
              <path d={`M ${cx} ${cy} L ${rx1} ${ry1} A ${r} ${r} 0 ${rlarge} 1 ${rx2} ${ry2} Z`} fill="#ECEFF2"/>
            </>
          );
        })()}
        <circle cx="50" cy="50" r="22" fill="#fff"/>
        <text x="50" y="48" textAnchor="middle" fontFamily="Satoshi" fontWeight="800" fontSize="14" fill="#1F3649">
          {weakest.score.toFixed(1)}
        </text>
        <text x="50" y="60" textAnchor="middle" fontFamily="DM Sans" fontSize="7" fill="#adb3b4">/10</text>
      </svg>
      <div style={{ flex: 1 }}>
        <div className="section-title" style={{ marginBottom: 6 }}>Needs tending</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{weakest.cat} feels a little thin.</h3>
        <p style={{ fontSize: 13, color: '#5a6061', marginTop: 4, lineHeight: 1.5 }}>
          One small act today? A text to someone you miss counts.
        </p>
        <button className="link-btn" style={{ paddingLeft: 0, marginTop: 6 }}>Open Wheel of Life →</button>
      </div>
    </div>
  );
}

/* ------------- YESTERDAY RECAP ------------- */
export function Yesterday({ onPromote }: any) {
  return (
    <div className="card-soft" style={{ padding: 22 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Yesterday, briefly</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'linear-gradient(135deg, #e4e9ea, #f2f4f4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, flexDirection: 'column', gap: 2,
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: '#1F3649', lineHeight: 1 }}>{YESTERDAY.completed}</span>
          <span style={{ fontSize: 9, color: '#5a6061', fontWeight: 600, letterSpacing: '0.04em' }}>of {YESTERDAY.total}</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#2d3435' }}>{YESTERDAY.journalTitle}</div>
          <p style={{ fontSize: 12.5, color: '#5a6061', marginTop: 3, lineHeight: 1.5 }}>{YESTERDAY.journalPreview}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#adb3b4', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>mood:</span>
            <span className="chip" style={{ padding: '4px 10px', fontSize: 11.5 }}>{YESTERDAY.mood}</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #ECEFF2', paddingTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#adb3b4', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Carry-overs</div>
        {YESTERDAY.carryovers.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#adb3b4' }}/>
            <span style={{ fontSize: 13, color: '#2d3435', flex: 1 }}>{c.title}</span>
            <button
              onClick={() => onPromote(c)}
              style={{ background: 'transparent', border: 0, color: '#1F3649', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
            >Move to today →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------- HABITS ------------- */
export function Habits() {
  const [state, setState] = useState(Object.fromEntries(HABITS.map(h => [h.name, h.done])));
  return (
    <div className="card-soft" style={{ padding: 20 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>Habit streaks</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {HABITS.map(h => {
          const done = state[h.name];
          return (
            <button
              key={h.name}
              onClick={() => setState({ ...state, [h.name]: !done })}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12,
                border: '1px solid ' + (done ? '#1F3649' : '#ECEFF2'),
                background: done ? '#f7f9fa' : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: done ? '#1F3649' : '#f2f4f4',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {done
                  ? <CheckIcon size={14} color="#fff" stroke={3}/>
                  : <Flame size={14} color="#adb3b4"/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#2d3435', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                <div style={{ fontSize: 10.5, color: '#adb3b4', fontWeight: 600, letterSpacing: '0.04em' }}>
                  <Flame size={10} color="#adb3b4" style={{ marginRight: 3 }}/>{h.streak} days
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------- JOURNAL QUICK ENTRY ------------- */
export function JournalQuick({ value, setValue }: any) {
  return (
    <div className="card-soft" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Book size={16} color="#1F3649"/> Morning pages
        </h3>
        <span style={{ fontSize: 11, color: '#adb3b4' }}>{value.trim().split(/\s+/).filter(Boolean).length} words</span>
      </div>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Write freely. Nothing here needs to be good. Just true."
        rows={5}
        style={{
          width: '100%', resize: 'none',
          border: '1px solid #ECEFF2', borderRadius: 12,
          padding: 14, fontSize: 14, lineHeight: 1.6,
          color: '#2d3435',
          fontFamily: 'var(--font-sans)',
          background: '#fafbfb',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span style={{ fontSize: 11, color: '#adb3b4' }}>Autosaves to Journal</span>
        <Btn variant="outline" size="sm">Expand to full editor <ArrowRight size={12}/></Btn>
      </div>
    </div>
  );
}

/* ------------- QUOTE ------------- */
export function QuoteCard({ inline = false }: any) {
  if (inline) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, paddingTop: 4 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', color: '#1F3649', textTransform: 'uppercase' }}>Today's line</span>
        </div>
        <div style={{ minWidth: 0, flex: 1, position: 'relative', paddingLeft: 18 }}>
          <div style={{ position: 'absolute', top: -6, left: 0, fontSize: 36, fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#dde4e5', lineHeight: 0.6 }}>"</div>
          <p style={{
            margin: 0, fontFamily: 'var(--font-heading)',
            fontSize: 15, fontWeight: 500, lineHeight: 1.4, color: '#2d3435',
            letterSpacing: '-0.005em', textWrap: 'balance',
          } as any}>
            {QUOTE.text}
          </p>
          <p style={{ margin: 0, marginTop: 6, fontSize: 10, color: '#adb3b4', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
            — {QUOTE.author}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      padding: '32px 28px',
      borderRadius: 18,
      background: '#f7f9fa',
      border: '1px solid #ECEFF2',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 18, left: 22, fontSize: 64, fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#dde4e5', lineHeight: 0.6 }}>"</div>
      <div style={{ paddingLeft: 22 }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 500, lineHeight: 1.45, color: '#2d3435', letterSpacing: '-0.01em' }}>
          {QUOTE.text}
        </p>
        <p style={{ marginTop: 10, fontSize: 12, color: '#adb3b4', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
          — {QUOTE.author}
        </p>
      </div>
    </div>
  );
}
