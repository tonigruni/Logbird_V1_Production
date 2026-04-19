// Lightweight inline icon set — matches Phosphor's regular weight feel.
// All icons accept {size, color, weight} and render inline-block svg.
// Ported 1:1 from /tmp/logbird_checkin/src/icons.jsx — all icons are custom SVGs,
// no @phosphor-icons/react re-exports (prototype used fully custom paths).
// Object.assign(window, …) replaced with named exports.

import React from 'react';

interface IcProps {
  size?: number;
  color?: string;
  stroke?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const Ic = ({ size = 18, color = "currentColor", stroke = 1.6, children, style }: IcProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'inline-block', verticalAlign: '-2px', flexShrink: 0, ...style }}>
    {children}
  </svg>
);

export const CheckIcon   = (p: IcProps) => <Ic {...p}><path d="M4 12.5l5 5L20 6.5"/></Ic>;
export const PlusIcon    = (p: IcProps) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>;
export const ArrowRight  = (p: IcProps) => <Ic {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Ic>;
export const CaretDown   = (p: IcProps) => <Ic {...p}><path d="M6 9l6 6 6-6"/></Ic>;
export const CaretRight  = (p: IcProps) => <Ic {...p}><path d="M9 6l6 6-6 6"/></Ic>;
export const Sparkle     = (p: IcProps) => <Ic {...p}>
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
</Ic>;
export const Flame       = (p: IcProps) => <Ic {...p}>
  <path d="M12 3c1.5 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1 .3-1.8.7-2.5C9 9 10 8 10 6.5 11 7.5 12 5 12 3z"/>
</Ic>;
export const Dots        = (p: IcProps) => <Ic {...p}>
  <circle cx="6" cy="12" r="1.2" fill={p.color || 'currentColor'}/>
  <circle cx="12" cy="12" r="1.2" fill={p.color || 'currentColor'}/>
  <circle cx="18" cy="12" r="1.2" fill={p.color || 'currentColor'}/>
</Ic>;
export const GripDots    = (p: IcProps) => <Ic {...p} stroke={0}>
  {[5,10,15].map((y,i)=>(
    <g key={i}>
      <circle cx="9"  cy={y} r="1.3" fill={p.color || '#cdd4d7'}/>
      <circle cx="15" cy={y} r="1.3" fill={p.color || '#cdd4d7'}/>
    </g>
  ))}
</Ic>;
export const Sun         = (p: IcProps) => <Ic {...p}>
  <circle cx="12" cy="12" r="4"/>
  <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>
</Ic>;
export const Moon        = (p: IcProps) => <Ic {...p}>
  <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>
</Ic>;
export const Target      = (p: IcProps) => <Ic {...p}>
  <circle cx="12" cy="12" r="8"/>
  <circle cx="12" cy="12" r="4"/>
  <circle cx="12" cy="12" r="1" fill={p.color || 'currentColor'}/>
</Ic>;
export const Book        = (p: IcProps) => <Ic {...p}>
  <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z"/>
  <path d="M4 19a2 2 0 0 1 2-2h12"/>
</Ic>;
export const Heart       = (p: IcProps) => <Ic {...p}>
  <path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/>
</Ic>;
export const Lightning   = (p: IcProps) => <Ic {...p}>
  <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>
</Ic>;
export const Quote       = (p: IcProps) => <Ic {...p}>
  <path d="M7 7h4v4H8a1 1 0 0 0-1 1v3M15 7h4v4h-3a1 1 0 0 0-1 1v3"/>
</Ic>;
export const Clock       = (p: IcProps) => <Ic {...p}>
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 7v5l3 2"/>
</Ic>;
export const Calendar    = (p: IcProps) => <Ic {...p}>
  <rect x="3" y="5" width="18" height="16" rx="2"/>
  <path d="M3 10h18M8 3v4M16 3v4"/>
</Ic>;
export const Settings    = (p: IcProps) => <Ic {...p}>
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
</Ic>;
export const X_Icon      = (p: IcProps) => <Ic {...p}><path d="M6 6l12 12M18 6L6 18"/></Ic>;
export const Leaf        = (p: IcProps) => <Ic {...p}>
  <path d="M4 20c0-8 6-14 16-14 0 10-6 16-14 16-1 0-2-1-2-2z"/>
  <path d="M4 20L14 10"/>
</Ic>;
export const Wind        = (p: IcProps) => <Ic {...p}>
  <path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3"/>
</Ic>;
