// Seed data for the morning screen
// Ported 1:1 from /tmp/logbird_checkin/src/data.jsx
// Object.assign(window, …) replaced with named exports.

export const INITIAL_TASKS = {
  urgent: [
    { id: 'u1', title: 'Review Q2 roadmap draft before 10am standup', project: 'Identity Redesign', time: 25 },
    { id: 'u2', title: 'Reply to Leo re: interview loop timing', project: null, time: 10 },
  ],
  high: [
    { id: 'h1', title: 'Write spec for offline mode fallback', project: 'Focus Mastery', time: 60 },
    { id: 'h2', title: 'Ship the landing hero copy edits', project: 'Identity Redesign', time: 30 },
    { id: 'h3', title: 'Coffee with Priya — mentor check-in', project: null, time: 45 },
  ],
  normal: [
    { id: 'n1', title: 'Triage product inbox', project: null, time: 20 },
    { id: 'n2', title: 'Expense report for March travel', project: null, time: 15 },
    { id: 'n3', title: 'Rebook dentist', project: null, time: 5 },
  ],
};

export const INITIAL_PRIORITIES = [
  { id: 'p1', title: 'Finish the roadmap draft', note: 'Two focused hours before noon.' },
  { id: 'p2', title: 'One hard conversation with Leo', note: 'Kind, clear, no hedging.' },
  { id: 'p3', title: 'Run 4km at sunset', note: 'Legs, lungs, quiet.' },
];

export const MOOD_WORDS = [
  { w: 'calm',       tone: 'positive' },
  { w: 'hopeful',    tone: 'positive' },
  { w: 'focused',    tone: 'positive' },
  { w: 'grateful',   tone: 'positive' },
  { w: 'steady',     tone: 'positive' },
  { w: 'curious',    tone: 'positive' },
  { w: 'energized',  tone: 'positive' },
  { w: 'tender',     tone: 'neutral'  },
  { w: 'quiet',      tone: 'neutral'  },
  { w: 'restless',   tone: 'neutral'  },
  { w: 'tired',      tone: 'neutral'  },
  { w: 'foggy',      tone: 'neutral'  },
  { w: 'anxious',    tone: 'negative' },
  { w: 'heavy',      tone: 'negative' },
  { w: 'overwhelmed',tone: 'negative' },
  { w: 'scattered',  tone: 'negative' },
  { w: 'blue',       tone: 'negative' },
  { w: 'on edge',    tone: 'negative' },
];

export const TIMEBOX = [
  { id: 't1', start: '07:30', end: '08:15', title: 'Morning pages + stretch', kind: 'ritual' },
  { id: 't2', start: '08:30', end: '10:30', title: 'Deep work — roadmap draft', kind: 'deep' },
  { id: 't3', start: '10:30', end: '11:00', title: 'Standup',                  kind: 'meeting' },
  { id: 't4', start: '11:00', end: '12:00', title: 'Landing hero copy edits',  kind: 'shallow' },
  { id: 't5', start: '12:00', end: '13:00', title: 'Lunch + walk',             kind: 'break' },
  { id: 't6', start: '13:30', end: '14:15', title: 'Coffee w/ Priya',          kind: 'social' },
  { id: 't7', start: '15:00', end: '16:30', title: 'Spec: offline fallback',   kind: 'deep' },
  { id: 't8', start: '18:00', end: '18:45', title: '4km run at sunset',        kind: 'body' },
];

export const YESTERDAY = {
  mood: 'steady',
  journalTitle: "Small wins stack. Loud wins don't.",
  journalPreview: "A day that looked ordinary on paper but felt like something clicked. Three conversations I'd been avoiding are now just… done.",
  completed: 7,
  total: 9,
  carryovers: [
    { id: 'c1', title: 'Rebook dentist', priority: 'normal' },
    { id: 'c2', title: 'Expense report for March travel', priority: 'normal' },
  ],
};

export const HABITS = [
  { name: 'Morning pages',   streak: 41, done: true  },
  { name: 'No phone first hr',streak: 12, done: true },
  { name: 'Move 30 min',     streak:  6, done: false },
  { name: 'Read before bed', streak: 23, done: false },
];

export const WHEEL = [
  { cat: 'Health',          score: 7.2, color: '#22c55e' },
  { cat: 'Career',          score: 8.1, color: '#1F3649' },
  { cat: 'Finance',         score: 6.5, color: '#f59e0b' },
  { cat: 'Relationships',   score: 5.4, color: '#9f403d' },
  { cat: 'Personal Growth', score: 7.8, color: '#3b82f6' },
  { cat: 'Fun',             score: 5.9, color: '#ec4899' },
  { cat: 'Environment',     score: 6.8, color: '#14b8a6' },
  { cat: 'Family',          score: 7.1, color: '#f97316' },
];

export const QUOTE = {
  text: "Discipline equals freedom. Not because the world softens — but because you grow sturdier.",
  author: 'Marcus Aurelius, remixed',
};
