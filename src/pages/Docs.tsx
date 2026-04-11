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
      <div className="w-10 h-10 rounded-[12px] bg-[#0C1629]/8 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={18} weight="bold" className="text-[#0C1629]" />
      </div>
      <div>
        <h2 className="text-lg font-extrabold text-[#0C1629] tracking-tight">{title}</h2>
        <p className="text-sm text-[#727A84] mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function DocSection({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="bg-white rounded-[15px] border border-[#D6DCE0] p-8 space-y-6">
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-widest text-[#B5C1C8]">{children}</span>
  )
}

function UsageNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-[#727A84] bg-[#F0F3F3] rounded-[10px] px-4 py-3 leading-relaxed">
      <span className="font-bold text-[#0C1629]">Used in: </span>{children}
    </p>
  )
}

function Demo({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[12px] border border-[#D6DCE0] bg-[#f8fafa] p-6 flex flex-wrap items-center gap-4', className)}>
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
        className="h-14 w-full rounded-[10px] border border-[#D6DCE0]"
        style={{ backgroundColor: hex }}
      />
      <div>
        <p className="text-xs font-bold text-[#0C1629]">{name}</p>
        <p className="text-[10px] font-mono text-[#B5C1C8]">{hex}</p>
        <p className="text-[10px] text-[#727A84]">{role}</p>
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
              <ColourSwatch hex="#F0F3F3" name="Zappy Zebra" role="Inputs, muted surfaces" />
              <ColourSwatch hex="#D6DCE0" name="Hidden Creek" role="Borders, dividers" />
              <ColourSwatch hex="#B5C1C8" name="Kinder" role="Faint text, placeholders" />
              <ColourSwatch hex="#727A84" name="Deep Shale" role="Secondary & muted text" />
              <ColourSwatch hex="#0C1629" name="Liberty Blue" role="Primary brand, headings" />
            </div>
          </div>
          <div>
            <Label>Semantic Tokens</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-3">
              <ColourSwatch hex="#0C1629" name="Primary" role="Buttons, links, active states" />
              <ColourSwatch hex="#1E2A3A" name="Primary Hover" role="Hover state of primary" />
              <ColourSwatch hex="#FEFEFE" name="Background" role="Page background" />
              <ColourSwatch hex="#FEFEFE" name="Surface" role="Card backgrounds" />
              <ColourSwatch hex="#F0F3F3" name="Muted" role="Inputs, secondary BG" />
            </div>
          </div>
          <div>
            <Label>Text Scale</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-3">
              <ColourSwatch hex="#0C1629" name="On Surface" role="Headings, body text" />
              <ColourSwatch hex="#727A84" name="Secondary" role="Supporting text" />
              <ColourSwatch hex="#B5C1C8" name="Faint" role="Placeholders, disabled" />
              <ColourSwatch hex="#727A84" name="Variant" role="Nav labels, metadata" />
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
              <ColourSwatch hex="#D6DCE0" name="Card Border" role="Default card border" />
              <ColourSwatch hex="#D6DCE0" name="Border Light" role="Dividers, subtle" />
              <ColourSwatch hex="#D6DCE0" name="Container High" role="Hover borders" />
              <ColourSwatch hex="#F0F3F3" name="Container Low" role="Section fills" />
            </div>
          </div>
        </div>

        <Demo>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#0C1629]" />
            <span className="text-xs font-bold text-[#0C1629]">Primary</span>
          </div>
          <div className="w-px h-8 bg-[#D6DCE0]" />
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
              <p className="text-3xl font-extrabold text-[#0C1629]" style={{ fontFamily: 'Satoshi, system-ui' }}>Life Goals</p>
              <p className="text-2xl font-extrabold text-[#0C1629]" style={{ fontFamily: 'Satoshi, system-ui' }}>Project Overview</p>
              <p className="text-xl font-bold text-[#0C1629]" style={{ fontFamily: 'Satoshi, system-ui' }}>Weekly Journal Entry</p>
              <p className="text-base font-bold text-[#0C1629]" style={{ fontFamily: 'Satoshi, system-ui' }}>Section heading</p>
            </Demo>
            <UsageNote>Page titles (Goals, Dashboard, Projects hero), section headings, goal titles in GoalDetailView header</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>DM Sans — Body & UI</Label>
            <Demo className="flex-col items-start gap-2">
              <p className="text-sm text-[#0C1629]">Standard body text — task titles, descriptions, card content.</p>
              <p className="text-xs text-[#727A84]">Secondary text — metadata, supporting labels, timestamps.</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5C1C8]">Section Label</p>
              <p className="text-[10px] font-bold text-[#B5C1C8]">Sidebar section header — REFLECTION, PRODUCTIVITY, SYSTEM</p>
            </Demo>
            <UsageNote>Every label, input, button, dropdown, nav item, and body paragraph across the entire app</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>JetBrains Mono — Code & Data</Label>
            <Demo>
              <span className="font-mono text-2xl font-bold text-[#0C1629]">00:42:17</span>
              <span className="font-mono text-sm text-[#727A84]">00:00</span>
              <span className="font-mono text-xs text-[#B5C1C8]">ID: LOG-042</span>
              <span className="font-mono text-xs bg-[#0C1629]/8 text-[#0C1629] px-2 py-1 rounded-md">#0C1629</span>
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
              <button className="bg-[#0C1629] text-white text-sm font-semibold px-5 py-2.5 rounded-[15px] hover:opacity-90 transition-all cursor-pointer">
                Mark Complete
              </button>
              <button className="bg-[#0C1629] text-white text-sm font-semibold px-5 py-2.5 rounded-[15px] hover:opacity-90 transition-all cursor-pointer flex items-center gap-2">
                <Target size={14} />
                Set a New Goal
              </button>
              <button className="bg-[#0C1629] text-white text-sm font-semibold px-5 py-2.5 rounded-[15px] opacity-40 cursor-not-allowed">
                Disabled
              </button>
            </Demo>
            <UsageNote>GoalDetailView "Mark Complete", Dashboard "Add Entry", Goals "New Goal", all primary CTA buttons</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Secondary (Muted)</Label>
            <Demo>
              <button className="bg-[#F0F3F3] text-[#0C1629] text-sm font-semibold px-5 py-2.5 rounded-[15px] hover:bg-[#F0F3F3] transition-colors cursor-pointer">
                Cancel
              </button>
              <button className="bg-[#F0F3F3] text-[#727A84] text-sm font-semibold px-4 py-2 rounded-[12px] hover:bg-[#D6DCE0] transition-colors cursor-pointer flex items-center gap-1.5">
                <BookOpen size={13} />
                Send to Journal
              </button>
            </Demo>
            <UsageNote>GoalDetailView "Send to Journal" + "Cancel", secondary actions adjacent to a Primary button</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Destructive</Label>
            <Demo>
              <button className="bg-[#F0F3F3] text-[#9f403d] text-sm font-semibold px-5 py-2.5 rounded-[15px] hover:bg-[#fce8e8] transition-colors cursor-pointer">
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
              <button className="text-[#727A84] text-sm font-semibold hover:text-[#0C1629] transition-colors cursor-pointer">
                Back to Projects
              </button>
              <button className="text-xs font-semibold text-[#0C1629] flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
                View Goal →
              </button>
              <button className="text-xs text-[#0C1629] font-semibold hover:underline cursor-pointer">+ Add</button>
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
              <div className="bg-white rounded-[15px] border border-[#D6DCE0] p-5 w-64">
                <p className="text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider mb-1">CAREER</p>
                <h4 className="text-sm font-bold text-[#0C1629] mb-1">Launch Logbird to first 100 paying users</h4>
                <p className="text-xs text-[#727A84] line-clamp-2">Turn Logbird from a personal tool into a real SaaS.</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#F0F3F3] rounded-full">
                    <div className="h-full w-2/5 rounded-full bg-[#0C1629]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0C1629]">40%</span>
                </div>
              </div>
            </Demo>
            <UsageNote>Goal cards (Goals portfolio view), project cards (Projects overview), journal entry cards</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Card Hover State</Label>
            <Demo>
              <div className="bg-white rounded-[15px] border border-[#D6DCE0] p-5 w-64 shadow-[0_20px_40px_rgba(7,33,51,0.05)] cursor-pointer">
                <p className="text-xs font-bold text-[#0C1629]">Hovered card</p>
                <p className="text-xs text-[#727A84]">shadow-[0_20px_40px_rgba(7,33,51,0.05)]</p>
              </div>
            </Demo>
            <UsageNote>Applied on hover via Tailwind group-hover — goal cards, project cards, task rows</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Hero / Banner Card</Label>
            <Demo className="p-0 overflow-hidden">
              <div className="relative bg-[#0C1629] rounded-[12px] overflow-hidden px-8 py-6 w-full">
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
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#B5C1C8]/10 text-[#727A84]">Archived</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0C1629]/10 text-[#0C1629]">Active</span>
            </Demo>
            <UsageNote>Goal status (GoalDetailView header), project status (ProjectDetail hero), task status in TaskEdit sidebar</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Priority Badges</Label>
            <Demo>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#dc2626]/10 text-[#dc2626]">Urgent</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#f59e0b]/10 text-[#f59e0b]">High</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#0C1629]/10 text-[#0C1629]">Normal</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[#B5C1C8]/10 text-[#727A84]">Low</span>
            </Demo>
            <UsageNote>Task rows in ProjectDetail, TaskEdit sidebar summary, Tasks list page</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Category Pills</Label>
            <Demo>
              {[
                { name: 'Health', color: '#22c55e' },
                { name: 'Career', color: '#0C1629' },
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
                className="w-64 bg-white rounded-[15px] border border-[#D6DCE0] px-4 py-2.5 text-sm text-[#0C1629] placeholder-[#B5C1C8] outline-none focus:ring-2 focus:ring-[#0C1629]/10 focus:border-[#0C1629]/20 transition-shadow"
                placeholder="Add a new task and press Enter..."
              />
            </Demo>
            <UsageNote>GoalDetailView "Add task" input, Journal entry title, TaskEdit title field</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Textarea</Label>
            <Demo>
              <textarea
                className="w-full bg-white rounded-[15px] border border-[#D6DCE0] px-4 py-3 text-sm text-[#0C1629] placeholder-[#B5C1C8] outline-none focus:ring-2 focus:ring-[#0C1629]/10 resize-none h-24 transition-shadow"
                placeholder="Add a comment, note, or reflection..."
              />
            </Demo>
            <UsageNote>GoalDetailView activity comment box, Journal editor (plain fallback), description edit in GoalDetailView</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Select / Dropdown</Label>
            <Demo>
              <select className="bg-white rounded-[15px] border border-[#D6DCE0] px-4 py-2.5 text-sm text-[#0C1629] outline-none focus:ring-2 focus:ring-[#0C1629]/10 cursor-pointer">
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
            <div className="bg-[#f8fafa] rounded-[10px] border border-[#D6DCE0] p-4 font-mono text-xs text-[#727A84] space-y-1">
              <p><span className="text-[#0C1629] font-bold">max-w</span>: 1400px (–– sidebar-width)</p>
              <p><span className="text-[#0C1629] font-bold">px</span>: 16px mobile → 48px desktop</p>
              <p><span className="text-[#0C1629] font-bold">pb</span>: 96px (space for bottom mobile nav)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sidebar</Label>
            <div className="bg-[#f8fafa] rounded-[10px] border border-[#D6DCE0] p-4 font-mono text-xs text-[#727A84] space-y-1">
              <p><span className="text-[#0C1629] font-bold">width</span>: 288px (–– sidebar-width)</p>
              <p><span className="text-[#0C1629] font-bold">bg</span>: white · border-right: 1px solid #D6DCE0</p>
              <p><span className="text-[#0C1629] font-bold">py</span>: 32px · px: 16px · sticky top-0</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Pattern</Label>
            <Demo className="h-24 relative overflow-hidden p-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.088) 1px, transparent 0)',
              backgroundSize: '20px 20px',
              backgroundPosition: '10px 10px',
            }}>
              <p className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">
                Dot grid — main content area background
              </p>
            </Demo>
            <UsageNote>AppLayout main content area — the subtle dot grid behind every page</UsageNote>
          </div>

          <div className="space-y-2">
            <Label>Two-Column Detail Layout</Label>
            <Demo className="items-start p-3">
              <div className="flex gap-3 w-full">
                <div className="flex-1 bg-white border border-[#D6DCE0] rounded-[10px] p-3 text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">
                  Left pane — col-span-8<br />
                  <span className="font-normal normal-case text-[#727A84]">Description, tasks, activity</span>
                </div>
                <div className="w-1/3 bg-white border border-[#D6DCE0] rounded-[10px] p-3 text-[10px] font-bold text-[#B5C1C8] uppercase tracking-wider">
                  Right pane — col-span-4<br />
                  <span className="font-normal normal-case text-[#727A84]">Timer, project link, metadata</span>
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
              <div className="flex items-center gap-3 px-4 py-3 rounded-[15px] bg-[#D6DCE0] text-[#0C1629] font-bold w-56 cursor-pointer">
                <Target size={20} weight="bold" className="shrink-0" />
                <span className="text-base tracking-tight">Goals</span>
              </div>
              {/* Inactive */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-[15px] text-[#727A84] font-semibold hover:bg-[#0C1629]/[0.03] w-56 cursor-pointer">
                <BookOpen size={20} weight="regular" className="shrink-0" />
                <span className="text-base tracking-tight">Journal</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-[15px] text-[#727A84] font-semibold hover:bg-[#0C1629]/[0.03] w-56 cursor-pointer">
                <Kanban size={20} weight="regular" className="shrink-0" />
                <span className="text-base tracking-tight">Projects</span>
              </div>
            </Demo>
            <UsageNote>Left sidebar — active: bg-[#D6DCE0] + bold weight. Inactive: text-[#727A84] + regular weight + hover:bg-[#0C1629]/3</UsageNote>
          </div>

          <div className="space-y-3">
            <Label>Page Tab Bar (header)</Label>
            <Demo>
              <div className="flex items-center gap-1 bg-[#F0F3F3] rounded-[10px] p-1">
                {['Overview', 'All Entries', 'Calendar', 'Templates'].map((tab, i) => (
                  <button key={tab} className={cn(
                    'text-xs font-bold px-3 py-1.5 rounded-[8px] transition-all cursor-pointer',
                    i === 0 ? 'bg-white text-[#0C1629] shadow-sm' : 'text-[#727A84]'
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
              <div className="flex items-center gap-1.5 text-sm text-[#727A84]">
                <button className="hover:text-[#0C1629] cursor-pointer flex items-center gap-1 font-medium">
                  ‹ Goals
                </button>
                <span className="opacity-40">›</span>
                <span className="text-[#0C1629] font-semibold">Launch Logbird to first 100 paying users</span>
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
                  <Target size={size} weight="bold" className="text-[#0C1629]" />
                  <span className="text-[9px] font-mono text-[#B5C1C8] whitespace-nowrap">{label}</span>
                </div>
              ))}
            </Demo>
          </div>

          <div className="space-y-3">
            <Label>Weight Convention</Label>
            <Demo>
              <div className="flex flex-col items-center gap-1">
                <Target size={20} weight="regular" className="text-[#727A84]" />
                <span className="text-[9px] font-mono text-[#B5C1C8]">regular — inactive</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Target size={20} weight="bold" className="text-[#0C1629]" />
                <span className="text-[9px] font-mono text-[#B5C1C8]">bold — active</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CheckSquare size={20} weight="fill" className="text-[#22c55e]" />
                <span className="text-[9px] font-mono text-[#B5C1C8]">fill — completed state</span>
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
// Roadmap Tab
// ---------------------------------------------------------------------------

const SHIPPED = [
  { icon: SquaresFour, title: 'Dashboard', desc: 'Central hub showing active goals, recent journal entries, wheel of life score overview, and upcoming tasks.', tag: 'Live' },
  { icon: BookOpen, title: 'Journal', desc: 'Rich text editor with mood tracking, templates, entry calendar, and Send to Journal from any goal. ProseMirror-powered.', tag: 'Live' },
  { icon: ChartDonut, title: 'Wheel of Life', desc: 'Score 8 life categories, track check-ins over time, visualise score changes with a radial chart.', tag: 'Live' },
  { icon: Target, title: 'Goals', desc: 'Portfolio, list, and board views. Each goal has a full detail page: description, tasks, time tracker, activity log, and project link.', tag: 'Live' },
  { icon: Kanban, title: 'Projects', desc: 'Project overview grid + detail page. Real tasks per project, linked goal, progress bar, status and metadata.', tag: 'Live' },
  { icon: CheckSquare, title: 'Tasks', desc: 'Full task edit with priority matrix, energy cost, time allocation, goal alignment, and project linking.', tag: 'Live' },
  { icon: Timer, title: 'Timeboxing', desc: 'Drag-and-drop time blocks linked to tasks. Daily schedule planning with energy-aware scheduling.', tag: 'Live' },
  { icon: Sparkle, title: 'Goal ↔ Project ↔ Task Graph', desc: 'Every entity is connected. Goals link to projects and tasks. Projects link to goals and tasks. Tasks inherit project_id from their parent goal.', tag: 'Live' },
]

const IN_PROGRESS = [
  { title: 'Docs (this page)', desc: 'Design system reference and product roadmap, living inside the app itself.' },
  { title: 'Supabase seed data', desc: 'Realistic demo entries across all three life themes: fitness, Logbird startup, and attachment work.' },
]

const NEXT_UP = [
  { title: 'Recurring Tasks', desc: 'Daily / weekly / monthly repeating tasks that auto-generate on their schedule.' },
  { title: 'Goal Progress Graph', desc: 'Line chart on the goal detail page tracking task completion rate over time.' },
  { title: 'Journal Insights', desc: 'Pattern detection across entries: mood trends, keyword frequency, topic clusters.' },
  { title: 'Weekly Review', desc: 'Structured end-of-week template: wins, misses, energy, and goal progress summary.' },
  { title: 'Push / In-App Notifications', desc: 'Due date reminders, check-in prompts, and milestone alerts.' },
  { title: 'Project Create Flow', desc: 'Functional project creation form wired to Supabase (currently stubs to a placeholder).' },
]

const FUTURE = [
  { title: 'AI Journaling Assistant', desc: 'Ask questions about your own journal. Surface patterns, suggest reflections, generate prompts.' },
  { title: 'Habit Tracker', desc: 'Daily streaks linked to goals and wheel of life categories. Visual heatmap calendar.' },
  { title: 'Sharing & Accountability Partner', desc: 'Invite one person to see your goals and leave comments — not full collab, just one trusted mirror.' },
  { title: 'Native Mobile App', desc: 'iOS and Android. Quick journal entry, check-in, and task tick without opening a browser.' },
  { title: 'Calendar Integration', desc: 'Sync timeboxed blocks to Google/Apple Calendar. Pull in events to see real schedule density.' },
  { title: 'Logbird API', desc: 'Public API so power users can pipe data into their own tools, dashboards, or automations.' },
]

function RoadmapCard({ item, variant }: {
  item: { title: string; desc: string; icon?: React.ElementType; tag?: string }
  variant: 'shipped' | 'in-progress' | 'next' | 'future'
}) {
  const styles = {
    shipped:     { dot: 'bg-[#22c55e]', ring: 'ring-[#22c55e]/20', text: 'text-[#22c55e]', bg: 'bg-[#22c55e]/8' },
    'in-progress': { dot: 'bg-[#f59e0b]', ring: 'ring-[#f59e0b]/20', text: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/8' },
    next:        { dot: 'bg-[#0C1629]', ring: 'ring-[#0C1629]/20', text: 'text-[#0C1629]', bg: 'bg-[#0C1629]/8' },
    future:      { dot: 'bg-[#B5C1C8]', ring: 'ring-[#B5C1C8]/20', text: 'text-[#B5C1C8]', bg: 'bg-[#B5C1C8]/8' },
  }[variant]

  const Icon = item.icon

  return (
    <div className="bg-white rounded-[15px] border border-[#D6DCE0] p-5 flex items-start gap-4 hover:shadow-[0_10px_40px_rgba(12,22,41,0.06)] transition-shadow">
      <div className={cn('w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0', styles.bg)}>
        {Icon
          ? <Icon size={16} weight="bold" className={styles.text} />
          : <div className={cn('w-2.5 h-2.5 rounded-full', styles.dot)} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-[#0C1629]">{item.title}</h4>
          {item.tag && (
            <span className={cn('text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full', styles.bg, styles.text)}>
              {item.tag}
            </span>
          )}
        </div>
        <p className="text-xs text-[#727A84] leading-relaxed">{item.desc}</p>
      </div>
    </div>
  )
}

function RoadmapTab() {
  return (
    <div className="space-y-12">

      {/* Shipped */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <CheckCircle size={20} weight="fill" className="text-[#22c55e]" />
          <div>
            <h2 className="text-base font-extrabold text-[#0C1629]">Shipped</h2>
            <p className="text-xs text-[#727A84]">Features live in the current build</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SHIPPED.map(item => <RoadmapCard key={item.title} item={item} variant="shipped" />)}
        </div>
      </div>

      {/* In Progress */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Clock size={20} weight="fill" className="text-[#f59e0b]" />
          <div>
            <h2 className="text-base font-extrabold text-[#0C1629]">In Progress</h2>
            <p className="text-xs text-[#727A84]">Being built right now</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {IN_PROGRESS.map(item => <RoadmapCard key={item.title} item={item} variant="in-progress" />)}
        </div>
      </div>

      {/* Next Up */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Rocket size={20} weight="fill" className="text-[#0C1629]" />
          <div>
            <h2 className="text-base font-extrabold text-[#0C1629]">Next Up</h2>
            <p className="text-xs text-[#727A84]">Planned for the near-term — roughly in priority order</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {NEXT_UP.map(item => <RoadmapCard key={item.title} item={item} variant="next" />)}
        </div>
      </div>

      {/* Future */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Lightbulb size={20} weight="fill" className="text-[#B5C1C8]" />
          <div>
            <h2 className="text-base font-extrabold text-[#0C1629]">Future Ideas</h2>
            <p className="text-xs text-[#727A84]">Directionally committed, not yet scoped</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FUTURE.map(item => <RoadmapCard key={item.title} item={item} variant="future" />)}
        </div>
      </div>

    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'design', label: 'Design System' },
  { id: 'roadmap', label: 'Roadmap' },
] as const

type TabId = typeof TABS[number]['id']

export default function Docs() {
  const [tab, setTab] = useState<TabId>('design')

  return (
    <div className="pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0C1629] tracking-tight">Docs</h1>
          <p className="text-sm text-[#727A84] mt-1">
            {tab === 'design'
              ? 'Living design system — tokens, components, and usage examples straight from the codebase.'
              : "What\u2019s shipped, what\u2019s in progress, and what\u2019s coming next."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#F0F3F3] rounded-[12px] p-1 shrink-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-5 py-2 text-sm font-bold rounded-[10px] transition-all cursor-pointer',
                tab === t.id
                  ? 'bg-white text-[#0C1629] shadow-sm'
                  : 'text-[#727A84] hover:text-[#0C1629]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'design' ? <DesignSystemTab /> : <RoadmapTab />}
    </div>
  )
}
