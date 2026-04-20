// Atoms: small reusable UI bits
// Ported 1:1 from /tmp/logbird_checkin/src/atoms.jsx
// Object.assign(window, …) replaced with named exports.
// const { useState } = React → import { useState } from 'react'

import { useState } from 'react';
import { CaretDown } from './icons';
import { CheckIcon } from './icons';

interface PillProps {
  children: React.ReactNode;
  bg?: string;
  color?: string;
  style?: React.CSSProperties;
}

export function Pill({ children, bg, color, style }: PillProps) {
  return <span className="pill" style={{ background: bg, color, ...style }}>{children}</span>;
}

// dot colors shown alongside pill (6px colored dot per spec)
export const PRIORITY_DOT: Record<string, string> = {
  urgent: '#9f403d',
  high:   '#f59e0b',
  normal: '#5a6061',
  low:    '#adb3b4',
};

export const PRIORITY_PILL: Record<string, { bg: string; color: string; label: string }> = {
  urgent: { bg: '#f2f4f4', color: '#5a6061', label: 'Urgent' },
  high:   { bg: '#f2f4f4', color: '#5a6061', label: 'High'   },
  normal: { bg: '#f2f4f4', color: '#5a6061', label: 'Normal' },
  low:    { bg: '#f2f4f4', color: '#5a6061', label: 'Low'    },
};

// Checkbox
interface CheckboxProps {
  done: boolean;
  onClick: () => void;
}

export function Checkbox({ done, onClick }: CheckboxProps) {
  return (
    <button
      className={"check" + (done ? " done" : "")}
      onClick={onClick}
      aria-label={done ? "Mark incomplete" : "Mark complete"}
    >
      {done && <CheckIcon size={12} color="#fff" stroke={3}/>}
    </button>
  );
}

// Section wrapper with optional collapse
interface SectionProps {
  title: string;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  children: React.ReactNode;
  id?: string;
}

export function Section({ title, action, defaultOpen = true, collapsible = true, children, id }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="fade-up" style={{ marginBottom: 18 }} data-section-id={id}>
      <div className="section-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {collapsible && (
            <button
              onClick={() => setOpen(v => !v)}
              style={{
                background: 'transparent', border: 0, padding: 0,
                color: '#adb3b4',
                transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 180ms ease',
                display: 'inline-flex',
              }}
              aria-label={open ? "Collapse" : "Expand"}
            >
              <CaretDown size={14}/>
            </button>
          )}
          <h2 className="section-title">{title}</h2>
        </div>
        {action}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 260ms ease',
      }}>
        <div style={{ overflow: open ? 'visible' : 'hidden', minHeight: 0 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

// Button
interface BtnProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  [key: string]: any;
}

export function Btn({ variant = 'primary', size = 'md', children, onClick, style, ...rest }: BtnProps) {
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    border: 0,
    borderRadius: 15,
    transition: 'all 180ms ease',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: size === 'sm' ? '6px 12px' : '10px 16px',
    fontSize: size === 'sm' ? 12 : 13.5,
    cursor: 'pointer',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#1F3649', color: '#fff' },
    secondary: { background: '#f2f4f4', color: '#2d3435' },
    outline: { background: '#fff', color: '#2d3435', border: '1px solid #e8eaeb' },
    ghost: { background: 'transparent', color: '#5a6061' },
  };
  return (
    <button onClick={onClick} {...rest} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}
