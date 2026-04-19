// Tweaks panel + protocol
// Ported 1:1 from /tmp/logbird_checkin/src/tweaks.jsx

import { useState, useEffect } from 'react';
import { X_Icon } from '../icons';

export function TweaksPanel({ tweaks, setTweaks, open, setOpen }: any) {
  // edit-mode protocol
  useEffect(() => {
    function onMsg(e: any) {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setOpen(true);
      if (d.type === '__deactivate_edit_mode') setOpen(false);
    }
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch(_){}
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const update = (patch: any) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
    } catch(_) {}
  };

  if (!open) return null;

  const Seg = ({ label, keyName, options }: any) => (
    <div className="tweak-row">
      <span className="tweak-label">{label}</span>
      <div className="segmented">
        {options.map((o: any) => (
          <button key={o.v} className={tweaks[keyName] === o.v ? 'active' : ''} onClick={() => update({ [keyName]: o.v })}>
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );

  const Tog = ({ label, keyName }: any) => (
    <div className="toggle-row">
      <span>{label}</span>
      <button className={"switch" + (tweaks[keyName] ? " on" : "")} onClick={() => update({ [keyName]: !tweaks[keyName] })} aria-pressed={tweaks[keyName]}/>
    </div>
  );

  return (
    <div className="tweaks-panel open">
      <div className="tweaks-header">
        <span>Tweaks</span>
        <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 0, color: '#adb3b4', padding: 4, cursor: 'pointer' }}>
          <X_Icon size={16}/>
        </button>
      </div>
      <div className="tweaks-body scrollbar-hide">
        <Seg label="Mood check-in style" keyName="moodStyle" options={[
          { v: 'wheel',   l: 'Wheel' },
          { v: 'words',   l: 'Words' },
          { v: 'emoji',   l: 'Emoji' },
          { v: 'slider',  l: 'Slider' },
          { v: 'weather', l: 'Weather' },
        ]}/>
        <Seg label="Hero treatment" keyName="hero" options={[
          { v: 'navy',  l: 'Navy' },
          { v: 'light', l: 'Light' },
          { v: 'dawn',  l: 'Dawn' },
        ]}/>
        <div className="tweak-row">
          <span className="tweak-label">Sections</span>
          <div style={{ display: 'grid', gap: 2 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#adb3b4', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Page 1 · Check-in</div>
            <Tog label="Mood & energy"     keyName="secMood"/>
            <Tog label="Body check-in"     keyName="secBody"/>
            <Tog label="Affirmation"       keyName="secAffirm"/>
            <Tog label="Purpose"           keyName="secPurpose"/>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#adb3b4', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 10 }}>Page 2 · Mind</div>
            <Tog label="Intention"         keyName="secIntent"/>
            <Tog label="Journal"           keyName="secJournal"/>
            <Tog label="Gratitude"         keyName="secGrat"/>
            <Tog label="Breathwork"        keyName="secMed"/>
            <Tog label="Habits"            keyName="secHabits"/>
            <Tog label="Quote"             keyName="secQuote"/>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#adb3b4', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 10 }}>Page 3 · Goals</div>
            <Tog label="Goals"             keyName="secGoals"/>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#adb3b4', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 10 }}>Page 4 · Today</div>
            <Tog label="Top 3 priorities"  keyName="secTop3"/>
            <Tog label="Tasks (grouped)"   keyName="secTasks"/>
            <Tog label="Timebox"           keyName="secTimebox"/>
            <Tog label="Wheel nudge"       keyName="secWheel"/>
            <Tog label="Yesterday recap"   keyName="secYest"/>
          </div>
        </div>
      </div>
    </div>
  );
}
