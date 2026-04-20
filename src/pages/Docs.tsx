import { useState } from 'react'
import { cn } from '../lib/utils'
import {
  Palette,
  TextT,
  Cursor,
  Cards,
  Tag,
  Layout,
  Rows,
  Sparkle,
  CheckCircle,
  Clock,
  Rocket,
  Lightbulb,
  Target,
  BookOpen,
  ChartDonut,
  CheckSquare,
  Kanban,
  Timer,
  SquaresFour,
  ArrowsClockwise,
  Brain,
  Lightning,
  ShieldCheck,
  ChartLineUp,
  ArrowRight,
  Database,
  House,
  Prohibit,
  Sun,
  Moon,
  Star,
} from '@phosphor-icons/react'

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <div className="w-10 h-10 rounded-[12px] bg-[#1F3649]/8 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={18} weight="bold" className="text-[#1F3649]" />
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-[#1F3649] tracking-tight">{title}</h2>
        <p className="text-sm text-[#5a6061] mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function DocSection({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="bg-white rounded-[15px] border border-[#ebeeef] p-8 space-y-6">
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-widest text-[#adb3b4]">{children}</span>
  )
}

function UsageNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-[#5a6061] bg-[#f2f4f4] rounded-[10px] px-4 py-3 leading-relaxed">
      <span className="font-bold text-[#1F3649]">Used in: </span>{children}
    </p>
  )
}

function Demo({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[12px] border border-[#ebeeef] bg-[#f8fafa] p-6 flex flex-wrap items-center gap-4', className)}>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Design System Tab
// ---------------------------------------------------------------------------

function ColourSwatch({ hex, name, role }: { hex: string; name: string; role: string }) {
  return (
    <div className="space-y-2">
      <div
        className="h-14 w-full rounded-[10px] border border-[#ebeeef]"
        style={{ backgroundColor: hex }}
      />
      <div>
        <p className="text-xs font-bold text-[#1F3649]">{name}</p>
        <p className="text-[10px] font-mono text-[#adb3b4]">{hex}</p>
        <p className="text-[10px] text-[#5a6061]">{role}</p>
      </div>
    </div>
  )
}

function DesignSystemTab() {
  return (
    <div className="space-y-8">

      {/* ── COLOURS ─────────────────────────────────────────────────────── */}
      <DocSection id="colours">
        <SectionHeader icon={Palette} title="Colour System" description="Every colour token used across Logbird. Never use raw hex inline — always trace back to one of these." />

        <div className="space-y-6">
          <div>
            <Label>Named Palette — 6 Core Swatches</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-3">
              <ColourSwatch hex="#FEFEFE" name="White as Heaven" role="Page & card backgrounds" />
              <ColourSwatch hex="#f2f4f4" name="Zappy Zebra" role="Inputs, muted surfaces" />
              <ColourSwatch hex="#ebeeef" name="Hidden Creek" role="Borders, dividers" />
              <ColourSwatch hex="#adb3b4" name="Kinder" role="Faint text, placeholders" />
              <ColourSwatch hex="#5a6061" name="Deep Shale" role="Secondary & muted text" />
              <ColourSwatch hex="#1F3649" name="Liberty Blue" role="Primary brand, headings" />
            </div>
          </div>
          <div>
            <Label>Semantic Tokens</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-3">
              <ColourSwatch hex="#1F3649" name="Primary" role="Buttons, links, active states" />
              <ColourSwatch hex="#1E2A3A" name="Primary Hover" role="Hover state of primary" />
              <ColourSwatch hex="#FEFEFE" name="Background" role="Page background" />
              <ColourSwatch hex="#FEFEFE" name="Surface" role="Card backgrounds" />
              <ColourSwatch hex="#f2f4f4" name="Muted" role="Inputs, secondary BG" />
            </div>
          </div>
          <div>
            <Label>Text Scale</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-3">
              <ColourSwatch hex="#1F3649" name="On Surface" role="Headings, body text" />
              <ColourSwatch hex="#5a6061" name="Secondary" role="Supporting text" />
              <ColourSwatch hex="#adb3b4" name="Faint" role="Placeholders, disabled" />
              <ColourSwatch hex="#5a6061" name="Variant" role="Nav labels, metadata" />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-3">
              <ColourSwatch hex="#22c55e" name="Success" role="Completed, positive" />
              <ColourSwatch hex="#f59e0b" name="Warning" role="In progress, caution" />
              <ColourSwatch hex="#9f403d" name="Error" role="Destructive actions" />
              <ColourSwatch hex="#8b5cf6" name="Purple" role="Personal Growth cat." />
              <ColourSwatch hex="#ec4899" name="Pink" role="Relationships cat." />
            </div>
          </div>
          <div>
            <Label>Borders & Containers</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-3">
              <ColourSwatch hex="#ebeeef" name="Card Border" role="Default card border" />
              <ColourSwatch hex="#ebeeef" name="Border Light" role="Dividers, subtle" />
              <ColourSwatch hex="#ebeeef" name="Container High" role="Hover borders" />
              <ColourSwatch hex="#f2f4f4" name="Container Low" role="Section fills" />
            </div>
          </div>
        </div>

        <Demo>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#1F3649]" />
            <span className="text-xs font-bold text-[#1F3649]">Primary</span>
          </div>
          <div className="w-px h-8 bg-[#ebeeef]" />
          <span className="text-xs text-[#22c55e] font-bold bg-[#22c55e]/10 px-3 py-1 rounded-full">Completed</span>
          <span className="text-xs text-[#f59e0b] font-bold bg-[#f59e0b]/10 px-3 py-1 rounded-full">In Progress</span>
          <span className="text-xs text-[#9f403d] font-bold bg-[#9f403d]/10 px-3 py-1 rounded-full">Destructive</span>
          <span className="text-xs text-[#8b5cf6] font-bold bg-[#8b5cf6]/10 px-3 py-1 rounded-full">Personal Growth</span>
        </Demo>
        <UsageNote>Goal status badges (Goals page, GoalDetailView), task priority pills, category labels on Wheel of Life check-ins</UsageNote>
      </DocSection>

      {/* ── TYPOGRAPHY ──────────────────────────────────────────────────── */}
      <DocSection id="typography">
        <SectionHeader icon={TextT} title="Typography" description="Three fonts, each with a strict role. Never mix them outside their assigned context." />

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Satoshi — Headings</Label>
            <Demo className="flex-col items-start gap-3">
              <p className="text-3xl font-extrabold text-[#1F3649]" style={{ fontFamily: 'Satoshi, system-ui' }}>Life Goals</p>
              <p className="text-2xl font-extrabold text-[#1F3649]" style={{ fontFamily: 'Satoshi, system-ui' }}>Project Overview</p>
              <p className="text-xl font-bold text-[#1F3649]" style={{ fontFamily: 'Satoshi, system-ui' }}>Weekly Journal Entry</p>
              <p className="text-base font-bold text-[#1F3649]" style={{ fontFamily: 'Satoshi, system-ui' }}>Section heading</p>
            </Demo>
            <UsageNote>Page titles (Goals, Dashboard, Projects hero), section headings, goal titles in GoalDetailView header</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>DM Sans — Body & UI</Label>
            <Demo className="flex-col items-start gap-2">
              <p className="text-sm text-[#1F3649]">Standard body text — task titles, descriptions, card content.</p>
              <p className="text-xs text-[#5a6061]">Secondary text — metadata, supporting labels, timestamps.</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#adb3b4]">Section Label</p>
              <p className="text-[10px] font-bold text-[#adb3b4]">Sidebar section header — REFLECTION, PRODUCTIVITY, SYSTEM</p>
            </Demo>
            <UsageNote>Every label, input, button, dropdown, nav item, and body paragraph across the entire app</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>JetBrains Mono — Code & Data</Label>
            <Demo>
              <span className="font-mono text-2xl font-bold text-[#1F3649]">00:42:17</span>
              <span className="font-mono text-sm text-[#5a6061]">00:00</span>
              <span className="font-mono text-xs text-[#adb3b4]">ID: LOG-042</span>
              <span className="font-mono text-xs bg-[#1F3649]/8 text-[#1F3649] px-2 py-1 rounded-md">#1F3649</span>
            </Demo>
            <UsageNote>Time tracker display (GoalDetailView), task IDs, hex colour codes, timer values</UsageNote>
          </div>
        </div>
      </DocSection>

      {/* ── BUTTONS ─────────────────────────────────────────────────────── */}
      <DocSection id="buttons">
        <SectionHeader icon={Cursor} title="Buttons" description="Four variants covering every interaction weight. Round corners always at 12px or 15px." />

        <div className="space-y-5">
          <div className="space-y-3">
            <Label>Primary</Label>
            <Demo>
              <button className="bg-[#1F3649] text-white text-sm font-semibold px-5 py-2.5 rounded-[15px] hover:opacity-90 transition-all cursor-pointer">
                Mark Complete
              </button>
              <button className="bg-[#1F3649] text-white text-sm font-semibold px-5 py-2.5 rounded-[15px] hover:opacity-90 transition-all cursor-pointer flex items-center gap-2">
                <Target size={14} />
                Set a New Goal
              </button>
              <button className="bg-[#1F3649] text-white text-sm font-semibold px-5 py-2.5 rounded-[15px] opacity-40 cursor-not-allowed">
                Disabled
              </button>
            </Demo>
            <UsageNote>GoalDetailView "Mark Complete", Dashboard "Add Entry", Goals "New Goal", all primary CTA buttons</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Secondary (Muted)</Label>
            <Demo>
              <button className="bg-[#f2f4f4] text-[#1F3649] text-sm font-semibold px-5 py-2.5 rounded-[15px] hover:bg-[#f2f4f4] transition-colors cursor-pointer">
                Cancel
              </button>
              <button className="bg-[#f2f4f4] text-[#5a6061] text-sm font-semibold px-4 py-2 rounded-[12px] hover:bg-[#ebeeef] transition-colors cursor-pointer flex items-center gap-1.5">
                <BookOpen size={13} />
                Send to Journal
              </button>
            </Demo>
            <UsageNote>GoalDetailView "Send to Journal" + "Cancel", secondary actions adjacent to a Primary button</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Destructive</Label>
            <Demo>
              <button className="bg-[#f2f4f4] text-[#9f403d] text-sm font-semibold px-5 py-2.5 rounded-[15px] hover:bg-[#fce8e8] transition-colors cursor-pointer">
                Delete Goal
              </button>
              <button className="text-[#9f403d]/60 text-sm font-semibold hover:text-[#9f403d] transition-colors cursor-pointer flex items-center gap-1.5">
                Delete
              </button>
            </Demo>
            <UsageNote>GoalDetailView "Delete", TaskEdit delete button, ProjectDetail "Unlink goal"</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Ghost / Text</Label>
            <Demo>
              <button className="text-[#5a6061] text-sm font-semibold hover:text-[#1F3649] transition-colors cursor-pointer">
                Back to Projects
              </button>
              <button className="text-xs font-semibold text-[#1F3649] flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
                View Goal →
              </button>
              <button className="text-xs text-[#1F3649] font-semibold hover:underline cursor-pointer">+ Add</button>
            </Demo>
            <UsageNote>Back navigation buttons, "View Goal / View Project" links in TaskEdit sidebar, attachment "+ Add" links</UsageNote>
          </div>
        </div>
      </DocSection>

      {/* ── CARDS ───────────────────────────────────────────────────────── */}
      <DocSection id="cards">
        <SectionHeader icon={Cards} title="Cards" description="The core surface unit. Always white, always bordered, never shadowed by default. Border-radius 15px throughout." />

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Default Card</Label>
            <Demo className="items-start">
              <div className="bg-white rounded-[15px] border border-[#ebeeef] p-5 w-64">
                <p className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider mb-1">CAREER</p>
                <h4 className="text-sm font-bold text-[#1F3649] mb-1">Launch Logbird to first 100 paying users</h4>
                <p className="text-xs text-[#5a6061] line-clamp-2">Turn Logbird from a personal tool into a real SaaS.</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#f2f4f4] rounded-full">
                    <div className="h-full w-2/5 rounded-full bg-[#1F3649]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1F3649]">40%</span>
                </div>
              </div>
            </Demo>
            <UsageNote>Goal cards (Goals portfolio view), project cards (Projects overview), journal entry cards</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Card Hover State</Label>
            <Demo>
              <div className="bg-white rounded-[15px] border border-[#ebeeef] p-5 w-64 shadow-[0_20px_40px_rgba(7,33,51,0.05)] cursor-pointer">
                <p className="text-xs font-bold text-[#1F3649]">Hovered card</p>
                <p className="text-xs text-[#5a6061]">shadow-[0_20px_40px_rgba(7,33,51,0.05)]</p>
              </div>
            </Demo>
            <UsageNote>Applied on hover via Tailwind group-hover — goal cards, project cards, task rows</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Hero / Banner Card</Label>
            <Demo className="p-0 overflow-hidden">
              <div className="relative bg-[#1F3649] rounded-[12px] overflow-hidden px-8 py-6 w-full">
                <div className="absolute inset-0 opacity-[0.07]">
                  <svg className="absolute inset-0 w-full h-full"><defs><pattern id="ds-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#ds-grid)" /></svg>
                </div>
                <div className="relative z-10">
                  <p className="text-white font-extrabold text-xl">Life Goals</p>
                  <p className="text-white/60 text-xs mt-1">3 active goals · align your actions with your vision.</p>
                </div>
              </div>
            </Demo>
            <UsageNote>Page hero banners on Goals, Projects, Journal, Dashboard — always bg-primary with dot-grid overlay</UsageNote>
          </div>
        </div>
      </DocSection>

      {/* ── BADGES & PILLS ──────────────────────────────────────────────── */}
      <DocSection id="badges">
        <SectionHeader icon={Tag} title="Badges & Pills" description="Compact status and category indicators. Always rounded-full, always 10px font, always font-bold." />

        <div className="space-y-5">
          <div className="space-y-3">
            <Label>Status Badges</Label>
            <Demo>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#16a34a]">Completed</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f59e0b]/10 text-[#b45309]">In Progress</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#adb3b4]/10 text-[#5a6061]">Archived</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1F3649]/10 text-[#1F3649]">Active</span>
            </Demo>
            <UsageNote>Goal status (GoalDetailView header), project status (ProjectDetail hero), task status in TaskEdit sidebar</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Priority Badges</Label>
            <Demo>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#dc2626]/10 text-[#dc2626]">Urgent</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#f59e0b]/10 text-[#f59e0b]">High</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#1F3649]/10 text-[#1F3649]">Normal</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#adb3b4]/10 text-[#5a6061]">Low</span>
            </Demo>
            <UsageNote>Task rows in ProjectDetail, TaskEdit sidebar summary, Tasks list page</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Category Pills</Label>
            <Demo>
              {[
                { name: 'Health', color: '#22c55e' },
                { name: 'Career', color: '#1F3649' },
                { name: 'Finance', color: '#f59e0b' },
                { name: 'Relationships', color: '#ec4899' },
                { name: 'Personal Growth', color: '#8b5cf6' },
                { name: 'Fun', color: '#f97316' },
              ].map(c => (
                <span key={c.name} className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: c.color + '18', color: c.color }}>
                  {c.name}
                </span>
              ))}
            </Demo>
            <UsageNote>GoalDetailView header badges, goal cards in Goals portfolio view, Wheel of Life category labels</UsageNote>
          </div>
        </div>
      </DocSection>

      {/* ── FORMS ───────────────────────────────────────────────────────── */}
      <DocSection id="forms">
        <SectionHeader icon={Rows} title="Forms & Inputs" description="Clean white inputs with a subtle ring on focus. Consistent 15px radius, sm text, px-4 py-2.5." />

        <div className="space-y-5">
          <div className="space-y-3">
            <Label>Text Input</Label>
            <Demo>
              <input
                className="w-64 bg-white rounded-[15px] border border-[#ebeeef] px-4 py-2.5 text-sm text-[#1F3649] placeholder-[#adb3b4] outline-none focus:ring-2 focus:ring-[#1F3649]/10 focus:border-[#1F3649]/20 transition-shadow"
                placeholder="Add a new task and press Enter..."
              />
            </Demo>
            <UsageNote>GoalDetailView "Add task" input, Journal entry title, TaskEdit title field</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Textarea</Label>
            <Demo>
              <textarea
                className="w-full bg-white rounded-[15px] border border-[#ebeeef] px-4 py-3 text-sm text-[#1F3649] placeholder-[#adb3b4] outline-none focus:ring-2 focus:ring-[#1F3649]/10 resize-none h-24 transition-shadow"
                placeholder="Add a comment, note, or reflection..."
              />
            </Demo>
            <UsageNote>GoalDetailView activity comment box, Journal editor (plain fallback), description edit in GoalDetailView</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Select / Dropdown</Label>
            <Demo>
              <select className="bg-white rounded-[15px] border border-[#ebeeef] px-4 py-2.5 text-sm text-[#1F3649] outline-none focus:ring-2 focus:ring-[#1F3649]/10 cursor-pointer">
                <option>No goal linked</option>
                <option>Get shredded for summer</option>
                <option>Launch Logbird</option>
              </select>
            </Demo>
            <UsageNote>TaskEdit category/project/goal dropdowns, GoalDetailView "Link a project…" select, ProjectDetail "Link a goal…"</UsageNote>
          </div>
        </div>
      </DocSection>

      {/* ── LAYOUT ──────────────────────────────────────────────────────── */}
      <DocSection id="layout">
        <SectionHeader icon={Layout} title="Layout & Spacing" description="Max-width container, dot-grid background, and consistent page padding. Never deviate from these." />

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Page Container</Label>
            <div className="bg-[#f8fafa] rounded-[10px] border border-[#ebeeef] p-4 font-mono text-xs text-[#5a6061] space-y-1">
              <p><span className="text-[#1F3649] font-bold">max-w</span>: 1400px (–– sidebar-width)</p>
              <p><span className="text-[#1F3649] font-bold">px</span>: 16px mobile → 48px desktop</p>
              <p><span className="text-[#1F3649] font-bold">pb</span>: 96px (space for bottom mobile nav)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sidebar</Label>
            <div className="bg-[#f8fafa] rounded-[10px] border border-[#ebeeef] p-4 font-mono text-xs text-[#5a6061] space-y-1">
              <p><span className="text-[#1F3649] font-bold">width</span>: 288px (–– sidebar-width)</p>
              <p><span className="text-[#1F3649] font-bold">bg</span>: white · border-right: 1px solid #ebeeef</p>
              <p><span className="text-[#1F3649] font-bold">py</span>: 32px · px: 16px · sticky top-0</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Pattern</Label>
            <Demo className="h-24 relative overflow-hidden p-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.088) 1px, transparent 0)',
              backgroundSize: '20px 20px',
              backgroundPosition: '10px 10px',
            }}>
              <p className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">
                Dot grid — main content area background
              </p>
            </Demo>
            <UsageNote>AppLayout main content area — the subtle dot grid behind every page</UsageNote>
          </div>

          <div className="space-y-2">
            <Label>Two-Column Detail Layout</Label>
            <Demo className="items-start p-3">
              <div className="flex gap-3 w-full">
                <div className="flex-1 bg-white border border-[#ebeeef] rounded-[10px] p-3 text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">
                  Left pane — col-span-8<br />
                  <span className="font-normal normal-case text-[#5a6061]">Description, tasks, activity</span>
                </div>
                <div className="w-1/3 bg-white border border-[#ebeeef] rounded-[10px] p-3 text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider">
                  Right pane — col-span-4<br />
                  <span className="font-normal normal-case text-[#5a6061]">Timer, project link, metadata</span>
                </div>
              </div>
            </Demo>
            <UsageNote>GoalDetailView, TaskEdit — 12-column grid split 8/4 on large screens, stacked on mobile</UsageNote>
          </div>
        </div>
      </DocSection>

      {/* ── NAVIGATION ──────────────────────────────────────────────────── */}
      <DocSection id="navigation">
        <SectionHeader icon={SquaresFour} title="Navigation Patterns" description="Sidebar nav, tab bars, and breadcrumbs. Consistent active/inactive states across all nav elements." />

        <div className="space-y-5">
          <div className="space-y-3">
            <Label>Sidebar Nav Item</Label>
            <Demo className="flex-col items-start gap-2">
              {/* Active */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-[15px] bg-[#f2f4f4] text-[#1F3649] font-bold w-56 cursor-pointer">
                <Target size={20} weight="bold" className="shrink-0" />
                <span className="text-base tracking-tight">Goals</span>
              </div>
              {/* Inactive */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-[15px] text-[#5a6061] font-semibold hover:bg-[#1F3649]/[0.03] w-56 cursor-pointer">
                <BookOpen size={20} weight="regular" className="shrink-0" />
                <span className="text-base tracking-tight">Journal</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-[15px] text-[#5a6061] font-semibold hover:bg-[#1F3649]/[0.03] w-56 cursor-pointer">
                <Kanban size={20} weight="regular" className="shrink-0" />
                <span className="text-base tracking-tight">Projects</span>
              </div>
            </Demo>
            <UsageNote>Left sidebar — active: bg-[#f2f4f4] + bold weight. Inactive: text-[#5a6061] + regular weight + hover:bg-[#1F3649]/3</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Page Tab Bar (header)</Label>
            <Demo>
              <div className="flex items-center gap-1 bg-[#f2f4f4] rounded-[10px] p-1">
                {['Overview', 'All Entries', 'Calendar', 'Templates'].map((tab, i) => (
                  <button key={tab} className={cn(
                    'text-xs font-bold px-3 py-1.5 rounded-[8px] transition-all cursor-pointer',
                    i === 0 ? 'bg-white text-[#1F3649] shadow-sm' : 'text-[#5a6061]'
                  )}>
                    {tab}
                  </button>
                ))}
              </div>
            </Demo>
            <UsageNote>Journal page header tabs, Goals view toggle (Portfolio / List / Board), Projects view toggle (Grid / Board)</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Breadcrumb</Label>
            <Demo>
              <div className="flex items-center gap-1.5 text-sm text-[#5a6061]">
                <button className="hover:text-[#1F3649] cursor-pointer flex items-center gap-1 font-medium">
                  ‹ Goals
                </button>
                <span className="opacity-40">›</span>
                <span className="text-[#1F3649] font-semibold">Launch Logbird to first 100 paying users</span>
              </div>
            </Demo>
            <UsageNote>GoalDetailView header — "‹ Goals › [goal title]". Same pattern in ProjectDetail "← Back to Projects"</UsageNote>
          </div>
        </div>
      </DocSection>

      {/* ── ICONS ───────────────────────────────────────────────────────── */}
      <DocSection id="icons">
        <SectionHeader icon={Sparkle} title="Icons" description="Phosphor Icons is primary. Lucide is secondary (GoalDetailView, older components). Sizes are strictly standardised." />

        <div className="space-y-5">
          <div className="space-y-3">
            <Label>Size Scale</Label>
            <Demo>
              {[
                { size: 10, label: '10 — tiny inline' },
                { size: 13, label: '13 — button inline' },
                { size: 15, label: '15 — section header' },
                { size: 18, label: '18 — card header' },
                { size: 20, label: '20 — sidebar nav' },
                { size: 22, label: '22 — task toggle' },
              ].map(({ size, label }) => (
                <div key={size} className="flex flex-col items-center gap-1">
                  <Target size={size} weight="bold" className="text-[#1F3649]" />
                  <span className="text-[9px] font-mono text-[#adb3b4] whitespace-nowrap">{label}</span>
                </div>
              ))}
            </Demo>
          </div>

          <div className="space-y-3">
            <Label>Weight Convention</Label>
            <Demo>
              <div className="flex flex-col items-center gap-1">
                <Target size={20} weight="regular" className="text-[#5a6061]" />
                <span className="text-[9px] font-mono text-[#adb3b4]">regular — inactive</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Target size={20} weight="bold" className="text-[#1F3649]" />
                <span className="text-[9px] font-mono text-[#adb3b4]">bold — active</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CheckSquare size={20} weight="fill" className="text-[#22c55e]" />
                <span className="text-[9px] font-mono text-[#adb3b4]">fill — completed state</span>
              </div>
            </Demo>
            <UsageNote>Sidebar uses regular/bold toggle based on active state. Task checkboxes use fill when done. Badges use fill for status icons.</UsageNote>
          </div>
        </div>
      </DocSection>

    </div>
  )
}

// ---------------------------------------------------------------------------
// What is Logbird Tab
// ---------------------------------------------------------------------------

function AboutFeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-[15px] border border-[#ebeeef] p-5 flex gap-4">
      <div className="w-9 h-9 rounded-[10px] bg-[#1F3649]/8 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={17} weight="bold" className="text-[#1F3649]" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#1F3649]">{title}</p>
        <p className="text-sm text-[#5a6061] mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function AboutPrinciple({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5">
      <div className="w-9 h-9 rounded-full border-2 border-[#ebeeef] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-black text-[#adb3b4]">{number}</span>
      </div>
      <div className="pb-8 border-b border-[#ebeeef] flex-1 last:border-0 last:pb-0">
        <p className="text-sm font-bold text-[#1F3649]">{title}</p>
        <p className="text-sm text-[#5a6061] mt-1.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function WhatIsLogbirdTab() {
  return (
    <div className="space-y-6 max-w-4xl">

      {/* Hero */}
      <div className="bg-[#1F3649] rounded-[15px] p-8 md:p-10">
        <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">The idea</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight mb-5">
          A closed-loop personal<br />operating system.
        </h2>
        <p className="text-sm text-white/60 leading-relaxed max-w-xl mb-8">
          Most tools are built around tasks and deadlines. Logbird is built around the full cycle of human performance — from reflection and insight, through to goals, actions, and back to reflection again.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {['Reflection', 'Insight', 'Goals', 'Actions', 'Feedback'].map((s, i, arr) => (
            <span key={s} className="flex items-center gap-2">
              <span className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-full">{s}</span>
              {i < arr.length - 1 && <ArrowRight size={12} className="text-white/30" />}
            </span>
          ))}
          <span className="text-xs text-white/30 ml-1">↩ repeat</span>
        </div>
      </div>

      {/* The problem */}
      <div className="bg-white rounded-[15px] border border-[#ebeeef] p-8">
        <SectionHeader
          icon={Lightbulb}
          title="The problem it solves"
          description="Why Logbird exists and what gap it fills."
        />
        <div className="space-y-4 text-sm text-[#5a6061] leading-relaxed">
          <p>
            People use a dozen different apps — a notes app for journalling, a task manager for to-dos, a spreadsheet for goals, a habit tracker for routines. None of them talk to each other. You have data everywhere and clarity nowhere.
          </p>
          <p>
            The deeper problem: even with the right tools, there's no feedback loop. You journal but never connect it to your goals. You complete tasks but never know if they moved the needle. You set goals but never review whether your days are actually serving them.
          </p>
          <p className="font-semibold text-[#1F3649]">
            Logbird closes the loop. Everything connects. Every feature feeds the next.
          </p>
        </div>
      </div>

      {/* 3 Sections */}
      <div className="bg-white rounded-[15px] border border-[#ebeeef] p-8">
        <SectionHeader
          icon={SquaresFour}
          title="Three sections. One system."
          description="Not three separate apps — three lenses on the same closed loop."
        />
        <div className="space-y-3">
          {[
            {
              dot: '#8b5cf6',
              label: 'Reflection',
              desc: 'The input layer. Understand your current state, surface patterns, generate insight. Everything else feeds from here.',
              features: ['Journal', 'Wheel of Life', 'Daily Check-in (coming)', 'Insights (coming)'],
            },
            {
              dot: '#f59e0b',
              label: 'Accountability',
              desc: 'The alignment layer. Goals sit above all tabs and are managed here. Reviews and habits keep you from drifting.',
              features: ['Goals', 'Habits (coming)', 'Weekly Review (coming)', 'Drift Detection (coming)'],
            },
            {
              dot: '#22c55e',
              label: 'Productivity',
              desc: 'The execution layer. Tasks, projects, and timeboxing — all linked to goals. Energy-aware planning driven by your Reflection state.',
              features: ['Tasks', 'Projects', 'Timeboxing', 'Weekly Planning (coming)'],
            },
          ].map(({ dot, label, desc, features }) => (
            <div key={label} className="flex gap-4 p-5 rounded-[12px] border border-[#ebeeef]">
              <div className="w-1.5 rounded-full shrink-0 self-stretch" style={{ backgroundColor: dot }} />
              <div className="flex-1">
                <p className="text-sm font-extrabold text-[#1F3649] mb-1">{label}</p>
                <p className="text-sm text-[#5a6061] leading-relaxed mb-3">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {features.map(f => (
                    <span
                      key={f}
                      className={cn(
                        'text-[10px] font-bold px-2.5 py-1 rounded-full',
                        f.includes('coming') ? 'bg-[#f2f4f4] text-[#adb3b4]' : 'text-white'
                      )}
                      style={f.includes('coming') ? {} : { backgroundColor: dot }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connection rule */}
      <div className="bg-white rounded-[15px] border border-[#ebeeef] p-8">
        <SectionHeader
          icon={Rocket}
          title="The connection rule"
          description="The principle that makes everything else work."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            ['Journal', 'Goals'],
            ['Goals', 'Tasks'],
            ['Tasks', 'Time'],
            ['Habits', 'Goals'],
          ].map(([a, b], i) => (
            <div key={i} className="bg-[#f2f4f4] rounded-[12px] p-3 text-center">
              <p className="text-xs font-bold text-[#1F3649]">{a}</p>
              <p className="text-base text-[#adb3b4] my-0.5">↔</p>
              <p className="text-xs font-bold text-[#1F3649]">{b}</p>
            </div>
          ))}
        </div>
        <div className="space-y-0">
          {[
            { number: '01', title: 'Everything is connected', desc: 'Goals link to projects. Projects own tasks. Tasks appear in time blocks. Journal entries tie to goals. Wheel of Life scores reflect active work. Nothing is a silo.' },
            { number: '02', title: 'You are the metric', desc: 'No streaks, no gamification, no leaderboards. The only benchmark is you — how aligned your days are with the life you said you want.' },
            { number: '03', title: 'Calm and clean by default', desc: 'White canvas. Thin borders. No clutter. Every piece of UI earns its place by helping you think more clearly, not by demanding attention.' },
            { number: '04', title: 'Built for one person first', desc: 'Started as a tool for one founder who couldn\'t find what they needed anywhere else. Every feature was needed before it was built. No bloat, no feature theatre.' },
          ].map(({ number, title, desc }) => (
            <div key={number} className="flex gap-5">
              <div className="w-9 h-9 rounded-full border-2 border-[#ebeeef] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-black text-[#adb3b4]">{number}</span>
              </div>
              <div className="pb-6 border-b border-[#ebeeef] flex-1 last:border-0 last:pb-0">
                <p className="text-sm font-bold text-[#1F3649]">{title}</p>
                <p className="text-sm text-[#5a6061] mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who it's for */}
      <div className="bg-[#f2f4f4] rounded-[15px] p-8">
        <p className="text-xs font-black uppercase tracking-widest text-[#adb3b4] mb-3">Who it's for</p>
        <p className="text-sm text-[#5a6061] leading-relaxed max-w-2xl">
          Logbird is for people who think seriously about how they spend their time — founders, creators, anyone in a self-directed role who needs to align daily execution with long-term direction. If you've ever felt busy but not making real progress, Logbird is the missing feedback loop.
        </p>
      </div>

    </div>
  )
}

// ---------------------------------------------------------------------------
// Roadmap Tab
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Changelog Tab
// ---------------------------------------------------------------------------

const CHANGELOG_ENTRIES = [
  {
    version: 'April 2026',
    label: 'Initial Build — v0.1',
    items: [
      { icon: SquaresFour, title: 'Dashboard', desc: 'Central hub with active goals, recent journal entries, Wheel of Life score, and upcoming tasks.' },
      { icon: BookOpen, title: 'Journal', desc: 'Rich text editor (ProseMirror) with mood tracking, templates, entry calendar, and Send to Journal from any goal.' },
      { icon: ChartDonut, title: 'Wheel of Life', desc: 'Score 9 life areas, track check-ins over time, visualise score changes with a radial chart.' },
      { icon: Target, title: 'Goals', desc: 'Portfolio, list, and board views. Each goal has a full detail page: tasks, time tracker, activity log, and project link.' },
      { icon: Kanban, title: 'Projects', desc: 'Grid overview + detail page. Real tasks per project, linked goal, progress bar, status, and metadata.' },
      { icon: CheckSquare, title: 'Tasks', desc: 'Full task edit with priority matrix, energy cost, time allocation, goal alignment, and project linking.' },
      { icon: Timer, title: 'Timeboxing', desc: 'Drag-and-drop time blocks linked to tasks. Daily schedule planning with energy-aware scheduling.' },
      { icon: Sparkle, title: 'Goal ↔ Project ↔ Task Graph', desc: 'Every entity is connected. Goals link to projects and tasks. Tasks inherit project_id from their parent goal.' },
      { icon: BookOpen, title: 'Docs', desc: 'Living design system, visual reference, product overview, changelog, roadmap, and strategic outlook — inside the app itself.' },
    ],
  },
]

function ChangelogCard({ item }: { item: { title: string; desc: string; icon?: React.ElementType } }) {
  const Icon = item.icon
  return (
    <div className="bg-white rounded-[15px] border border-[#ebeeef] p-5 flex items-start gap-4 hover:shadow-[0_10px_40px_rgba(12,22,41,0.06)] transition-shadow">
      <div className="w-9 h-9 rounded-[10px] bg-[#22c55e]/8 flex items-center justify-center shrink-0">
        {Icon && <Icon size={16} weight="bold" className="text-[#22c55e]" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-[#1F3649]">{item.title}</h4>
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#22c55e]/8 text-[#22c55e]">Live</span>
        </div>
        <p className="text-xs text-[#5a6061] leading-relaxed">{item.desc}</p>
      </div>
    </div>
  )
}

function ChangelogTab() {
  return (
    <div className="space-y-10">
      {CHANGELOG_ENTRIES.map(group => (
        <div key={group.version}>
          <div className="flex items-center gap-4 mb-6">
            <CheckCircle size={20} weight="fill" className="text-[#22c55e]" />
            <div className="flex-1">
              <h2 className="text-base font-extrabold text-[#1F3649]">{group.label}</h2>
              <p className="text-xs text-[#5a6061]">{group.version}</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e]">
              {group.items.length} features
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.items.map(item => (
              <ChangelogCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Roadmap Tab (future-focused)
// ---------------------------------------------------------------------------

const PHASES = [
  {
    number: '01',
    label: 'Phase 1 — Foundation',
    sub: 'Build this first. No phase 2 until this is solid.',
    color: '#1F3649',
    items: [
      {
        title: 'Workspaces',
        desc: 'Separate contexts of life (Private / Work / Relationship). Workspace entity with name, icon, color. All data — journal entries, goals, tasks — linked to a workspace. User always knows: "Which life area am I operating in right now?"',
        priority: 'Critical',
      },
      {
        title: 'Goals System Upgrade',
        desc: 'Add Outcome (measurable) vs Identity (behavioral) goal types, workspace_id linking, and target dates. Goals are already built — this makes them the true centre of the system.',
        priority: 'Critical',
      },
      {
        title: 'Task System Refinement',
        desc: 'Streamline to: title, due date, workspace, goal link, status. Add Today View (tasks due today) and This Week view. Principle: fast capture over complexity.',
        priority: 'High',
      },
      {
        title: 'Journal Goal Linking',
        desc: 'Add "Linked Goal" field and basic tags to journal entries. Turns reflection from private writing into a structured insight engine connected to your goals.',
        priority: 'Critical',
      },
    ],
  },
  {
    number: '02',
    label: 'Phase 2 — Productivity',
    sub: 'Only after Phase 1 is solid.',
    color: '#22c55e',
    items: [
      {
        title: 'Timeboxing Upgrade',
        desc: 'Full daily calendar view. Drag tasks into time slots and create time blocks (task_id, start_time, end_time). The moment planning becomes real: task → time → commitment.',
        priority: 'High',
      },
      {
        title: 'Projects Upgrade',
        desc: 'Add workspace_id and goal_id linking to projects. Keeps projects meaningful rather than just task buckets — a project always serves a goal.',
        priority: 'Normal',
      },
      {
        title: 'Weekly Planning System',
        desc: 'Structured weekly planning page: goals for the week, tasks to focus on, time allocation. Weekly review: what worked, what didn\'t, what to adjust. Feeds directly back into the journal.',
        priority: 'High',
      },
    ],
  },
  {
    number: '03',
    label: 'Phase 3 — Accountability',
    sub: 'Where most apps fail. Where Logbird wins.',
    color: '#f59e0b',
    items: [
      {
        title: 'Habits',
        desc: 'Habit object: name, frequency (daily/weekly), linked_goal. UI: daily checklist + streak tracking. Critical rule: habits must connect to goals. Otherwise it\'s just pointless tracking.',
        priority: 'High',
      },
      {
        title: 'Daily Check-In',
        desc: 'Simple daily prompt: How do you feel (mood)? Did you do what mattered? What was the highlight? Complements journalling — doesn\'t replace it.',
        priority: 'High',
      },
      {
        title: 'Weekly Review (Structured)',
        desc: 'Structured template: What moved me forward? What blocked me? Where did I drift? This is the self-correction engine.',
        priority: 'High',
      },
      {
        title: 'Drift Detection',
        desc: 'Logic: no activity on goal X → alert. Mood drop patterns → insight. Becomes the life awareness system — the feature that makes Logbird feel like it\'s paying attention.',
        priority: 'Normal',
      },
    ],
  },
]

const NOT_BUILDING = [
  { title: 'AI features', desc: 'Not yet. Build the data structure first.' },
  { title: 'Collaboration', desc: 'Single-player tool. Sharing comes much later.' },
  { title: 'Complex analytics', desc: 'No fancy dashboards. Signal over noise.' },
  { title: 'Gamification', desc: 'No streaks for the sake of streaks. Only metrics that reflect truth.' },
]

function RoadmapTab() {
  return (
    <div className="space-y-12">

      {PHASES.map(phase => (
        <div key={phase.number}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: phase.color }}>
              <span className="text-xs font-black" style={{ color: phase.color }}>{phase.number}</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1F3649]">{phase.label}</h2>
              <p className="text-xs text-[#5a6061]">{phase.sub}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {phase.items.map(item => (
              <div key={item.title} className="bg-white rounded-[15px] border border-[#ebeeef] p-5 hover:shadow-[0_10px_40px_rgba(12,22,41,0.06)] transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-bold text-[#1F3649] flex-1">{item.title}</h4>
                  <span className={cn(
                    'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0',
                    item.priority === 'Critical' ? 'bg-[#9f403d]/10 text-[#9f403d]' :
                    item.priority === 'High' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                    'bg-[#f2f4f4] text-[#5a6061]'
                  )}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-[#5a6061] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Not Building */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Prohibit size={20} weight="bold" className="text-[#9f403d]" />
          <div>
            <h2 className="text-base font-extrabold text-[#1F3649]">What we don't build (for now)</h2>
            <p className="text-xs text-[#5a6061]">Discipline is a feature. These are explicit non-priorities.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {NOT_BUILDING.map(item => (
            <div key={item.title} className="bg-[#f2f4f4] rounded-[15px] p-5 flex items-start gap-3">
              <span className="text-[#9f403d] font-black text-sm mt-0.5">✕</span>
              <div>
                <p className="text-sm font-bold text-[#1F3649]">{item.title}</p>
                <p className="text-xs text-[#5a6061] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Visual Tab
// ---------------------------------------------------------------------------

const PRIMARY_SCALE   = ['#020508','#050c12','#08121b','#1F3649','#1E2A3A','#2e4260','#5a7499','#96b0c8','#c8d5e1','#edf1f5']
const NEUTRAL_SCALE   = ['#13181a','#222829','#363d3e','#4a5253','#5a6061','#8e9499','#adb3b8','#c9cdd0','#e2e5e7','#f4f5f6']
const SURFACE_SCALE   = ['#8fa0aa','#a3b0b8','#b8c2c8','#c8d1d7','#ebeeef','#dfe5e9','#ebeeef','#eff3f5','#f5f8f9','#fafbfc']
const STATUS_SCALE    = ['#7a302e','#9f403d','#c05754','#f59e0b','#fbbf24','#fde68a','#22c55e','#4ade80','#86efac','#dcfce7']

function VisualColorCard({ name, hex, scale, light = false, gradient }: {
  name: string; hex: string; scale: string[]; light?: boolean; gradient?: string
}) {
  const fg = light ? '#1F3649' : 'white'
  return (
    <div className="rounded-[15px] border border-[#ebeeef] overflow-hidden flex flex-col flex-1 bg-white">
      <div className="px-4 py-3 flex justify-between items-center" style={{ background: gradient ?? hex }}>
        <span className="text-xs font-bold" style={{ color: fg }}>{name}</span>
        <span className="text-[10px] font-mono opacity-80" style={{ color: fg }}>{hex}</span>
      </div>
      <div className="h-14" style={{ background: gradient ?? hex }} />
      <div className="flex h-5">
        {scale.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
      </div>
    </div>
  )
}

function VisualCompCard({ label, sub, children, span2 }: {
  label: string; sub?: string; children: React.ReactNode; span2?: boolean
}) {
  return (
    <div className={`bg-white rounded-[15px] border border-[#ebeeef] p-5 flex flex-col gap-4 ${span2 ? 'col-span-2' : ''}`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#adb3b4]">{label}</span>
        {sub && <span className="text-[10px] font-mono text-[#adb3b4]">{sub}</span>}
      </div>
      <div className="flex items-center justify-center flex-1">
        {children}
      </div>
    </div>
  )
}

function VisualTab() {
  return (
    <div className="flex gap-3.5 items-stretch">

      {/* ── Color column ── */}
      <div className="flex flex-col gap-3.5 w-[190px] shrink-0">
        <VisualColorCard name="Primary" hex="#1F3649" scale={PRIMARY_SCALE} />
        <VisualColorCard name="Neutral" hex="#5a6061" scale={NEUTRAL_SCALE} />
        <VisualColorCard name="Surface" hex="#ebeeef" scale={SURFACE_SCALE} light />
        <VisualColorCard
          name="Status"
          hex="Error · Warn · OK"
          gradient="linear-gradient(90deg, #9f403d 33%, #f59e0b 66%, #22c55e 100%)"
          scale={STATUS_SCALE}
        />
      </div>

      {/* ── Component grid ── */}
      <div className="flex-1 grid grid-cols-3 gap-3.5">

        {/* Row 1 */}
        <VisualCompCard label="Headline" sub="Satoshi">
          <span className="text-7xl font-bold text-[#1F3649] leading-none" style={{ fontFamily: 'Satoshi, system-ui' }}>Aa</span>
        </VisualCompCard>

        <VisualCompCard label="Buttons">
          <div className="grid grid-cols-2 gap-2 w-full">
            <button className="text-xs font-bold px-3 py-2 rounded-[12px] bg-[#1F3649] text-white cursor-default">Primary</button>
            <button className="text-xs font-bold px-3 py-2 rounded-[12px] bg-[#f2f4f4] text-[#1F3649] cursor-default">Secondary</button>
            <button className="text-xs font-bold px-3 py-2 rounded-[12px] bg-[#1F3649]/90 text-white cursor-default">Inverted</button>
            <button className="text-xs font-bold px-3 py-2 rounded-[12px] border border-[#ebeeef] bg-white text-[#1F3649] cursor-default">Outlined</button>
          </div>
        </VisualCompCard>

        <VisualCompCard label="Search Input">
          <div className="flex items-center gap-2 w-full bg-[#f2f4f4] border border-[#ebeeef] rounded-[12px] px-4 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#adb3b4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-sm text-[#adb3b4]">Search</span>
          </div>
        </VisualCompCard>

        {/* Row 2 */}
        <VisualCompCard label="Body" sub="DM Sans">
          <span className="text-7xl font-normal text-[#1F3649] leading-none">Aa</span>
        </VisualCompCard>

        <VisualCompCard label="Progress">
          <div className="flex flex-col gap-2.5 w-full">
            {[
              { w: '72%', bg: '#1F3649' },
              { w: '48%', bg: '#5a6061' },
              { w: '30%', bg: '#f59e0b' },
            ].map((bar, i) => (
              <div key={i} className="h-1.5 rounded-full bg-[#f2f4f4] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: bar.w, background: bar.bg }} />
              </div>
            ))}
          </div>
        </VisualCompCard>

        <VisualCompCard label="Navigation">
          <div className="flex items-center justify-evenly w-full">
            <div className="w-10 h-10 rounded-[12px] bg-[#1F3649] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#adb3b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#adb3b4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        </VisualCompCard>

        {/* Row 3 */}
        <VisualCompCard label="Label" sub="DM Sans">
          <span className="text-6xl font-medium text-[#5a6061] leading-none">Aa</span>
        </VisualCompCard>

        <VisualCompCard label="Icon Buttons" span2>
          <div className="flex gap-3">
            {[
              { bg: '#1F3649', icon: <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>, icon2: <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/> },
              { bg: '#5a6061', icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
              { bg: '#2e4260', icon: <polyline points="20 6 9 17 4 12"/> },
              { bg: '#9f403d', icon: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></> },
            ].map((btn, i) => (
              <div key={i} className="w-10 h-10 rounded-[12px] flex items-center justify-center cursor-default" style={{ background: btn.bg }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {btn.icon}{btn.icon2}
                </svg>
              </div>
            ))}
          </div>
        </VisualCompCard>

      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Strategic Outlook Tab
// ---------------------------------------------------------------------------

const LOOP_STEPS = [
  { label: 'Reflect', color: '#8b5cf6', desc: 'Understand your current state' },
  { label: 'Decide', color: '#1F3649', desc: 'Choose your next direction' },
  { label: 'Execute', color: '#22c55e', desc: 'Do the actual work' },
  { label: 'Review', color: '#f59e0b', desc: 'Measure what happened' },
  { label: 'Adjust', color: '#ec4899', desc: 'Correct course if needed' },
  { label: 'Repeat', color: '#5a6061', desc: 'The loop never ends' },
]

const BACKBONE = [
  { label: 'Life Areas', sub: 'Wheel of Life · 9 categories', icon: ChartDonut },
  { label: 'Goals', sub: 'Derived from Life Areas', icon: Target },
  { label: 'Projects', sub: 'Derived from Goals', icon: Kanban },
  { label: 'Tasks', sub: 'Derived from Projects', icon: CheckSquare },
  { label: 'Check-ins', sub: 'State · energy · mood', icon: ChartLineUp },
  { label: 'Reflections', sub: 'Journal · insights', icon: BookOpen },
]

function PillarSection({ color, dot, number, title, purpose, items }: {
  color: string
  dot: string
  number: string
  title: string
  purpose: string
  items: { title: string; desc: string; key?: boolean }[]
}) {
  return (
    <div className="bg-white rounded-[15px] border border-[#ebeeef] p-8">
      <div className="flex items-start gap-5 mb-8">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: dot + '18' }}>
          <span className="text-xs font-black" style={{ color: dot }}>{number}</span>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-extrabold text-[#1F3649] tracking-tight">{title}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ backgroundColor: dot + '15', color: dot }}>{color}</span>
          </div>
          <p className="text-sm text-[#5a6061]">{purpose}</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={cn(
            'rounded-[12px] border p-4 flex items-start gap-3',
            item.key ? 'border-[#1F3649]/15 bg-[#1F3649]/[0.03]' : 'border-[#ebeeef] bg-[#f2f4f4]/40'
          )}>
            <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: item.key ? dot : '#ebeeef' }} />
            <div>
              <p className={cn('text-sm font-bold', item.key ? 'text-[#1F3649]' : 'text-[#5a6061]')}>{item.title}</p>
              <p className="text-xs text-[#5a6061] mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StrategicOutlookTab() {
  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── The Loop ──────────────────────────────────────────────────── */}
      <div className="bg-[#1F3649] rounded-[15px] p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <ArrowsClockwise size={18} weight="bold" className="text-white/40" />
          <p className="text-xs font-black uppercase tracking-widest text-white/40">First Principle</p>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight mb-3">
          This is not 3 tabs.<br />It's 1 loop.
        </h2>
        <p className="text-sm text-white/60 leading-relaxed max-w-xl mb-10">
          Reflection, Productivity, and Accountability are not separate apps. They are different lenses on the same system — three phases of a single continuous loop.
        </p>

        {/* Loop steps */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {LOOP_STEPS.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center gap-2">
              <div className="w-full rounded-[10px] p-3 flex flex-col items-center gap-1.5" style={{ backgroundColor: step.color + '20' }}>
                <span className="text-base font-extrabold" style={{ color: step.color }}>{step.label}</span>
                <span className="text-[10px] text-white/40 text-center leading-tight">{step.desc}</span>
              </div>
              {i < LOOP_STEPS.length - 1 && (
                <ArrowRight size={12} className="text-white/20 hidden md:block rotate-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Core Backbone ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-[15px] border border-[#ebeeef] p-8">
        <SectionHeader
          icon={Database}
          title="Core Data Backbone"
          description="Six objects that hold the entire system together. Every feature must connect to one of these — if it doesn't, the system breaks."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BACKBONE.map((obj, i) => {
            const Icon = obj.icon
            const isLast = i === BACKBONE.length - 1
            return (
              <div key={obj.label} className="flex items-center gap-3 bg-[#f2f4f4] rounded-[12px] p-4">
                <div className="w-8 h-8 rounded-[8px] bg-white border border-[#ebeeef] flex items-center justify-center shrink-0">
                  <Icon size={14} weight="bold" className="text-[#1F3649]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1F3649]">{obj.label}</p>
                  <p className="text-[10px] text-[#5a6061]">{obj.sub}</p>
                </div>
                {!isLast && i !== 2 && (
                  <ArrowRight size={12} className="text-[#adb3b4] ml-auto hidden md:block" />
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-4 bg-[#1F3649]/[0.03] border border-[#1F3649]/10 rounded-[12px] px-5 py-3">
          <p className="text-xs text-[#5a6061] leading-relaxed">
            <span className="font-bold text-[#1F3649]">Rule: </span>Goals exist once and are referenced everywhere. They don't live "in" a tab — they belong to the backbone. Tabs are just views into the same data.
          </p>
        </div>
      </div>

      {/* ── Three Pillars ──────────────────────────────────────────────── */}
      <PillarSection
        number="1"
        color="Reflection"
        dot="#8b5cf6"
        title="Reflection"
        purpose="Input layer — understand your current state and surface patterns."
        items={[
          { title: 'Daily Check-in (fast, mandatory)', desc: 'Energy (1–5), mood (1–5), focus, stress, short note. This is your state signal that feeds every other layer.', key: true },
          { title: 'Journal (deep reflection)', desc: 'Rich writing space — but every entry should optionally connect to a Life Area, Goal, or Project. Otherwise insights stay abstract.' },
          { title: 'Wheel of Life (weekly)', desc: '9 areas with scores. Highlights imbalance and feeds goal adjustments over time.' },
          { title: 'Insights layer (critical missing piece)', desc: 'Pattern detection: "You are low energy on Mondays." "Work is rising, health is declining." Without this, Reflection is just journalling — not intelligence.', key: true },
        ]}
      />

      <PillarSection
        number="2"
        color="Productivity"
        dot="#22c55e"
        title="Productivity"
        purpose="Execution layer — turn awareness into action."
        items={[
          { title: 'Today View (this is the main screen)', desc: 'Not a task list. Shows your energy from today\'s check-in + recommended task intensity. High energy → deep work. Low energy → admin. This is the unfair advantage.', key: true },
          { title: 'Tasks', desc: 'Linked to Projects. Carry priority, energy requirement, and time estimate.' },
          { title: 'Projects', desc: 'Linked to Goals. Progress tracking and milestones.' },
          { title: 'Calendar / Timeboxing', desc: 'Drag tasks into time blocks. The differentiation is context-aware execution — scheduling driven by your Reflection state, not by arbitrary time slots.' },
          { title: 'Focus Tools', desc: 'Pomodoro, deep work mode. Distraction blocker is a later feature.' },
        ]}
      />

      <PillarSection
        number="3"
        color="Accountability"
        dot="#f59e0b"
        title="Accountability"
        purpose="Alignment layer — make sure you don't drift from your direction."
        items={[
          { title: 'Goals System (sits above all tabs)', desc: 'Vision → Life Areas → Goals → Projects → Tasks. Goals are managed here but referenced everywhere. One source of truth.', key: true },
          { title: 'Weekly Review', desc: 'What did I plan vs do? Why did I fail? Adjust next week.' },
          { title: 'Monthly / Quarterly Reviews', desc: 'Progress vs goals, Wheel of Life changes, big direction shifts.' },
          { title: 'Score System', desc: 'Execution score, consistency score, alignment score. Without a clear signal you "feel productive" without truth.', key: true },
          { title: 'Accountability Layer (later)', desc: 'Accountability partners, shared goals, progress visibility.' },
        ]}
      />

      {/* ── The Real Problem ──────────────────────────────────────────── */}
      <div className="bg-white rounded-[15px] border border-[#ebeeef] p-8">
        <SectionHeader
          icon={Brain}
          title="The design error to avoid"
          description="The most common mistake when building this kind of system."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#9f403d]/[0.06] border border-[#9f403d]/15 rounded-[12px] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9f403d] mb-3">Wrong</p>
            <p className="text-sm font-bold text-[#1F3649] mb-2">"Goals go in all sections"</p>
            <p className="text-sm text-[#5a6061] leading-relaxed">
              Mixing where things <em>live</em> with how they <em>flow</em> creates duplicate state, inconsistency, and a broken mental model.
            </p>
          </div>
          <div className="bg-[#22c55e]/[0.06] border border-[#22c55e]/15 rounded-[12px] p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#22c55e] mb-3">Right</p>
            <p className="text-sm font-bold text-[#1F3649] mb-2">Goals exist once, referenced everywhere</p>
            <p className="text-sm text-[#5a6061] leading-relaxed">
              One source of truth in the backbone. Tabs are views — they display and interact with the same object, they don't own it.
            </p>
          </div>
        </div>
      </div>

      {/* ── Connection Rules ──────────────────────────────────────────── */}
      <div className="bg-white rounded-[15px] border border-[#ebeeef] p-8">
        <SectionHeader
          icon={Lightning}
          title="Connection rules"
          description="The most important part. If something doesn't connect, it becomes noise."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            ['Journal', 'Goals'],
            ['Goals', 'Tasks'],
            ['Tasks', 'Time'],
            ['Habits', 'Goals'],
          ].map(([a, b], i) => (
            <div key={i} className="bg-[#f2f4f4] rounded-[12px] p-4 text-center">
              <p className="text-xs font-bold text-[#1F3649]">{a}</p>
              <p className="text-xl text-[#adb3b4] my-1">↔</p>
              <p className="text-xs font-bold text-[#1F3649]">{b}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#5a6061] bg-[#1F3649]/[0.03] border border-[#1F3649]/10 rounded-[12px] px-5 py-3 leading-relaxed">
          <span className="font-bold text-[#1F3649]">Rule: </span>Every feature must strengthen one of these connections. If it doesn't — don't build it.
        </p>
      </div>

      {/* ── Daily User Flow ───────────────────────────────────────────── */}
      <div className="bg-white rounded-[15px] border border-[#ebeeef] p-8">
        <SectionHeader
          icon={Star}
          title="The north star: daily user flow"
          description="This is the experience the entire system is designed to enable."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Sun,
              label: 'Morning',
              time: '5 min',
              dot: '#f59e0b',
              steps: ['Open Logbird', 'See goals + today\'s tasks', 'Assign time blocks to tasks'],
            },
            {
              icon: Lightning,
              label: 'During the Day',
              time: 'Ongoing',
              dot: '#22c55e',
              steps: ['Execute tasks', 'Mark complete', 'Stay in the system'],
            },
            {
              icon: Moon,
              label: 'Evening',
              time: '5–10 min',
              dot: '#8b5cf6',
              steps: ['Write a journal entry', 'Link it to a goal', 'Quick reflection on the day'],
            },
          ].map(({ icon: Icon, label, time, dot, steps }) => (
            <div key={label} className="rounded-[12px] border border-[#ebeeef] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: dot + '18' }}>
                  <Icon size={15} weight="bold" style={{ color: dot }} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#1F3649]">{label}</p>
                  <p className="text-[10px] text-[#adb3b4]">{time}</p>
                </div>
              </div>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[10px] font-black text-[#adb3b4] mt-0.5 shrink-0">{i + 1}.</span>
                    <span className="text-xs text-[#5a6061] leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#5a6061] mt-5 leading-relaxed">
          <span className="font-bold text-[#1F3649]">Result: </span>User always knows what matters, what they did, and where they stand.
        </p>
      </div>

      {/* ── Ideal UI Vision ───────────────────────────────────────────── */}
      <div className="bg-[#f2f4f4] rounded-[15px] p-8">
        <div className="flex items-center gap-3 mb-6">
          <House size={16} weight="bold" className="text-[#5a6061]" />
          <p className="text-xs font-black uppercase tracking-widest text-[#adb3b4]">The ideal home screen</p>
        </div>
        <p className="text-sm font-bold text-[#1F3649] mb-2">Not: "Now I go to Reflection. Now I go to Productivity."</p>
        <p className="text-sm text-[#5a6061] leading-relaxed mb-6">
          Instead: you open your system and see your life.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Brain, label: 'Today\'s State', sub: 'From Reflection', dot: '#8b5cf6' },
            { icon: Lightning, label: 'Today\'s Plan', sub: 'From Productivity', dot: '#22c55e' },
            { icon: ShieldCheck, label: 'Goal Progress', sub: 'From Accountability', dot: '#f59e0b' },
          ].map(({ icon: Icon, label, sub, dot }) => (
            <div key={label} className="bg-white rounded-[12px] border border-[#ebeeef] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: dot + '15' }}>
                <Icon size={16} weight="bold" style={{ color: dot }} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1F3649]">{label}</p>
                <p className="text-[10px] text-[#adb3b4]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#adb3b4] mt-5 leading-relaxed">
          Dashboard OS view — not a navigation choice, but a unified daily starting point where all three layers surface at once.
        </p>
      </div>

    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'design', label: 'Design System' },
  { id: 'visual', label: 'Visual' },
  { id: 'about', label: 'What is Logbird' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'strategy', label: 'Strategic Outlook' },
] as const

type TabId = typeof TABS[number]['id']

const TAB_SUBTITLES: Record<TabId, string> = {
  design: 'Living design system — tokens, components, and usage examples straight from the codebase.',
  visual: 'Colour palette, typography, and core components at a glance.',
  about: 'The closed-loop philosophy behind Logbird — what it is, why it exists, and how it works.',
  changelog: 'Every feature shipped so far. The foundation the future is built on.',
  roadmap: 'Three phases of future work. Build order is strict — no skipping ahead.',
  strategy: 'System architecture, connection rules, daily flow, and the principles behind every product decision.',
}

export default function Docs() {
  const [tab, setTab] = useState<TabId>('design')

  return (
    <div className="pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1F3649] tracking-tight">Docs</h1>
          <p className="text-sm text-[#5a6061] mt-1">{TAB_SUBTITLES[tab]}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#f2f4f4] rounded-[12px] p-1 shrink-0 flex-wrap gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-2 text-sm font-bold rounded-[10px] transition-all cursor-pointer',
                tab === t.id
                  ? 'bg-white text-[#1F3649] shadow-sm'
                  : 'text-[#5a6061] hover:text-[#1F3649]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'design' ? <DesignSystemTab />
        : tab === 'visual' ? <VisualTab />
        : tab === 'about' ? <WhatIsLogbirdTab />
        : tab === 'changelog' ? <ChangelogTab />
        : tab === 'roadmap' ? <RoadmapTab />
        : <StrategicOutlookTab />}
    </div>
  )
}
