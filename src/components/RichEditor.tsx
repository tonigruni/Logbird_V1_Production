import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Markdown } from 'tiptap-markdown'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/utils'
import {
  Bold, Italic, Underline, List, ListOrdered,
  Quote, Code, Minus, Strikethrough, Plus,
  Type, TextQuote, Heading1, Heading2, Heading3,
  CheckSquare, Highlighter,
} from 'lucide-react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

interface Props {
  content: string
  onChange: (markdown: string) => void
  editable: boolean
  placeholder?: string
  compact?: boolean
}

// ─── Slash command items ──────────────────────────────────────────────────────
interface SlashCmd {
  id: string
  icon: React.ElementType
  label: string
  desc: string
  keywords: string[]
  action: (editor: NonNullable<ReturnType<typeof useEditor>>, range: { from: number; to: number }) => void
}

const SLASH_CMDS: SlashCmd[] = [
  {
    id: 'p', icon: Type, label: 'Text', desc: 'Plain paragraph', keywords: ['text', 'paragraph', 'p'],
    action: (e, r) => e.chain().focus().deleteRange(r).setParagraph().run(),
  },
  {
    id: 'h1', icon: Heading1, label: 'Heading 1', desc: 'Big section heading', keywords: ['h1', 'heading', 'title'],
    action: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 1 }).run(),
  },
  {
    id: 'h2', icon: Heading2, label: 'Heading 2', desc: 'Medium section heading', keywords: ['h2', 'heading', 'subtitle'],
    action: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 2 }).run(),
  },
  {
    id: 'h3', icon: Heading3, label: 'Heading 3', desc: 'Small section heading', keywords: ['h3', 'heading'],
    action: (e, r) => e.chain().focus().deleteRange(r).setHeading({ level: 3 }).run(),
  },
  {
    id: 'todo', icon: CheckSquare, label: 'To-do', desc: 'Track tasks with checkboxes', keywords: ['todo', 'task', 'check', 'checkbox'],
    action: (e, r) => e.chain().focus().deleteRange(r).toggleTaskList().run(),
  },
  {
    id: 'ul', icon: List, label: 'Bullet List', desc: 'Unordered list', keywords: ['bullet', 'list', 'ul'],
    action: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run(),
  },
  {
    id: 'ol', icon: ListOrdered, label: 'Numbered List', desc: 'Ordered list', keywords: ['numbered', 'ordered', 'ol', 'number'],
    action: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run(),
  },
  {
    id: 'quote', icon: TextQuote, label: 'Quote', desc: 'Highlight a quote', keywords: ['quote', 'blockquote'],
    action: (e, r) => e.chain().focus().deleteRange(r).toggleBlockquote().run(),
  },
  {
    id: 'code', icon: Code, label: 'Code Block', desc: 'Monospace code snippet', keywords: ['code', 'pre', 'mono'],
    action: (e, r) => e.chain().focus().deleteRange(r).toggleCodeBlock().run(),
  },
  {
    id: 'hr', icon: Minus, label: 'Divider', desc: 'Visually divide sections', keywords: ['divider', 'separator', 'hr', 'rule'],
    action: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run(),
  },
]

// ─── Toolbar button ───────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick, active = false, title, children,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={cn(
        'flex items-center justify-center w-11 h-11 rounded-xl text-sm font-medium transition-all cursor-pointer',
        active
          ? 'bg-[#1F3649] text-white'
          : 'text-[#5a6061] hover:bg-[#f2f4f4] hover:text-[#2d3435]',
      )}
    >
      {children}
    </button>
  )
}

function BubbleBtn({
  onClick, active = false, title, children,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={cn(
        'flex items-center justify-center w-7 h-7 rounded-lg text-sm transition-all cursor-pointer',
        active
          ? 'bg-[#1F3649] text-white'
          : 'text-[#5a6061] hover:bg-[#f2f4f4] hover:text-[#2d3435]',
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-[#ebeeef] mx-0.5 shrink-0" />
}

function BubbleDivider() {
  return <div className="w-px h-4 bg-[#ebeeef] mx-0.5 shrink-0" />
}

// ─── Block insert dropdown (shared between "+" gutter & slash menu) ────────────
const BLOCK_GROUPS = (editor: NonNullable<ReturnType<typeof useEditor>>) => [
  [
    { icon: Type,        label: 'Text',          desc: 'Plain paragraph',         action: () => editor.chain().focus().setParagraph().run() },
    { icon: Heading1,    label: 'Heading 1',     desc: 'Big section heading',     action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { icon: Heading2,    label: 'Heading 2',     desc: 'Medium section heading',  action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: Heading3,    label: 'Heading 3',     desc: 'Small section heading',   action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  ],
  [
    { icon: CheckSquare, label: 'To-do',         desc: 'Track tasks with checkboxes', action: () => editor.chain().focus().toggleTaskList().run() },
    { icon: List,        label: 'Bullet List',   desc: 'Unordered list',          action: () => editor.chain().focus().toggleBulletList().run() },
    { icon: ListOrdered, label: 'Numbered List', desc: 'Ordered list',            action: () => editor.chain().focus().toggleOrderedList().run() },
  ],
  [
    { icon: TextQuote,   label: 'Quote',         desc: 'Highlight a quote',       action: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: Code,        label: 'Code Block',    desc: 'Monospace code snippet',  action: () => editor.chain().focus().toggleCodeBlock().run() },
    { icon: Minus,       label: 'Divider',       desc: 'Visually divide sections', action: () => editor.chain().focus().setHorizontalRule().run() },
  ],
]

function BlockInsertMenu({ editor, triggerClassName, side = 'top', align = 'start', onOpenChange }: {
  editor: NonNullable<ReturnType<typeof useEditor>>
  triggerClassName?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  onOpenChange?: (open: boolean) => void
}) {
  const groups = BLOCK_GROUPS(editor)

  return (
    <DropdownMenuPrimitive.Root onOpenChange={onOpenChange}>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          onMouseDown={e => e.preventDefault()}
          className={triggerClassName}
          title="Insert block"
        >
          <Plus size={20} />
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          onCloseAutoFocus={e => e.preventDefault()}
          className="z-50 w-56 overflow-hidden rounded-[15px] border border-[#e8eaeb] bg-white p-1 shadow-[0_8px_24px_rgba(45,52,53,0.12)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {groups.map((group, gi) => (
            <div key={gi}>
              {gi === 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-[#5a6061]">Insert block</div>
                  <div className="-mx-1 my-1 h-px bg-[#f2f4f4]" />
                </>
              )}
              {group.map(({ icon: Icon, label, desc, action }) => (
                <DropdownMenuPrimitive.Item
                  key={label}
                  onSelect={action}
                  className="flex items-center gap-2 rounded-[10px] px-2 py-1.5 outline-none cursor-pointer hover:bg-[#f2f4f4] focus:bg-[#f2f4f4]"
                >
                  <div className="flex size-8 items-center justify-center rounded-[8px] border border-[#e8eaeb] bg-[#f2f4f4] shrink-0">
                    <Icon size={14} className="text-[#586062]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#2d3435]">{label}</div>
                    <div className="text-xs text-[#5a6061]">{desc}</div>
                  </div>
                </DropdownMenuPrimitive.Item>
              ))}
              {gi < groups.length - 1 && <div className="-mx-1 my-1 h-px bg-[#f2f4f4]" />}
            </div>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

// ─── Slash command floating menu ──────────────────────────────────────────────
interface SlashState {
  x: number
  y: number
  query: string
  slashFrom: number
  cursorTo: number
  selectedIdx: number
}

function SlashMenu({ state, editor, onClose }: {
  state: SlashState
  editor: NonNullable<ReturnType<typeof useEditor>>
  onClose: () => void
}) {
  const filtered = SLASH_CMDS.filter(cmd =>
    state.query === '' ||
    cmd.label.toLowerCase().includes(state.query.toLowerCase()) ||
    cmd.keywords.some(k => k.includes(state.query.toLowerCase()))
  )

  if (filtered.length === 0) return null

  const execute = (cmd: SlashCmd) => {
    cmd.action(editor, { from: state.slashFrom, to: state.cursorTo })
    onClose()
  }

  return createPortal(
    <div
      className="fixed z-[9999] w-64 overflow-hidden rounded-[15px] border border-[#e8eaeb] bg-white p-1 shadow-[0_8px_24px_rgba(45,52,53,0.14)]"
      style={{ top: state.y, left: state.x }}
      onMouseDown={e => e.preventDefault()}
    >
      <div className="px-2 py-1.5 text-xs font-semibold text-[#5a6061]">Blocks</div>
      <div className="-mx-1 mb-1 h-px bg-[#f2f4f4]" />
      {filtered.map((cmd, i) => {
        const Icon = cmd.icon
        return (
          <button
            key={cmd.id}
            onMouseDown={() => execute(cmd)}
            className={cn(
              'w-full flex items-center gap-2 rounded-[10px] px-2 py-1.5 text-left outline-none cursor-pointer transition-colors',
              i === state.selectedIdx ? 'bg-[#f2f4f4]' : 'hover:bg-[#f2f4f4]',
            )}
          >
            <div className="flex size-8 items-center justify-center rounded-[8px] border border-[#e8eaeb] bg-[#f2f4f4] shrink-0">
              <Icon size={14} className="text-[#586062]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#2d3435]">{cmd.label}</div>
              <div className="text-xs text-[#5a6061]">{cmd.desc}</div>
            </div>
          </button>
        )
      })}
    </div>,
    document.body,
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RichEditor({ content, onChange, editable, placeholder, compact = false }: Props) {
  const gutterRef = useRef<HTMLDivElement>(null)
  const [plusTop, setPlusTop] = useState<number | null>(null)
  const isHoveringGutter = useRef(false)
  const isDropdownOpen = useRef(false)

  const [slashState, setSlashState] = useState<SlashState | null>(null)
  const slashStateRef = useRef<SlashState | null>(null)

  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null)

  const closeSlash = useCallback(() => {
    setSlashState(null)
    slashStateRef.current = null
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExt,
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing from the heart… or type / for commands',
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#1F3649] underline' } }),
      Markdown.configure({ html: false, transformCopiedText: true }),
    ],
    content,
    editable,
    onUpdate({ editor }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange((editor.storage as any).markdown.getMarkdown())

      // ── Slash command detection ───────────────────────────────────────────
      const { state } = editor
      const { from, to } = state.selection
      if (from !== to) { closeSlash(); return }

      const $from = state.selection.$from
      const lineStart = $from.start()
      const textBefore = state.doc.textBetween(lineStart, from, '\n', '\0')
      const match = textBefore.match(/\/(\w*)$/)

      if (match) {
        const query = match[1]
        const slashFrom = from - 1 - query.length // position of '/'
        try {
          const coords = editor.view.coordsAtPos(from)
          const newState: SlashState = {
            x: coords.left,
            y: coords.bottom + 6,
            query,
            slashFrom,
            cursorTo: from,
            selectedIdx: 0,
          }
          setSlashState(newState)
          slashStateRef.current = newState
        } catch {
          closeSlash()
        }
      } else {
        closeSlash()
      }
    },
  })

  // ── Sync editable ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable)
    }
  }, [editor, editable])

  // ── Slash command keyboard handler ─────────────────────────────────────────
  useEffect(() => {
    if (!editor) return
    const el = editor.view.dom

    const onKeyDown = (e: KeyboardEvent) => {
      const s = slashStateRef.current
      if (!s) return

      const filtered = SLASH_CMDS.filter(cmd =>
        s.query === '' ||
        cmd.label.toLowerCase().includes(s.query.toLowerCase()) ||
        cmd.keywords.some(k => k.includes(s.query.toLowerCase()))
      )
      if (filtered.length === 0) { if (e.key === 'Escape') closeSlash(); return }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next: SlashState = { ...s, selectedIdx: (s.selectedIdx + 1) % filtered.length }
        setSlashState(next); slashStateRef.current = next
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const next: SlashState = { ...s, selectedIdx: (s.selectedIdx - 1 + filtered.length) % filtered.length }
        setSlashState(next); slashStateRef.current = next
      } else if (e.key === 'Enter') {
        e.preventDefault()
        filtered[s.selectedIdx]?.action(editor, { from: s.slashFrom, to: s.cursorTo })
        closeSlash()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        closeSlash()
      }
    }

    el.addEventListener('keydown', onKeyDown, true)
    return () => el.removeEventListener('keydown', onKeyDown, true)
  }, [editor, closeSlash])

  // ── Bubble menu (text selection toolbar) ──────────────────────────────────
  useEffect(() => {
    if (!editor) return

    const updateBubble = () => {
      const { from, to } = editor.state.selection
      if (from === to || editor.isActive('codeBlock')) { setBubblePos(null); return }
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) { setBubblePos(null); return }
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      if (!rect.width) { setBubblePos(null); return }
      setBubblePos({ x: rect.left + rect.width / 2, y: rect.top })
    }

    const clearBubble = () => setBubblePos(null)

    editor.on('selectionUpdate', updateBubble)
    editor.on('blur', clearBubble)
    return () => {
      editor.off('selectionUpdate', updateBubble)
      editor.off('blur', clearBubble)
    }
  }, [editor])

  // ── Inline "+" gutter position ─────────────────────────────────────────────
  useEffect(() => {
    if (!editor) return

    const updatePlusPos = () => {
      if (!gutterRef.current || !editor.isFocused) { setPlusTop(null); return }
      const { state, view } = editor
      const { from } = state.selection
      try {
        const coords = view.coordsAtPos(from)
        const gutterRect = gutterRef.current.getBoundingClientRect()
        const lineMiddle = (coords.top + coords.bottom) / 2
        setPlusTop(Math.max(0, lineMiddle - gutterRect.top - 14))
      } catch { setPlusTop(null) }
    }

    const handleBlur = () => {
      setTimeout(() => {
        if (!isHoveringGutter.current && !isDropdownOpen.current) setPlusTop(null)
      }, 150)
    }

    editor.on('selectionUpdate', updatePlusPos)
    editor.on('focus', updatePlusPos)
    editor.on('blur', handleBlur)
    return () => {
      editor.off('selectionUpdate', updatePlusPos)
      editor.off('focus', updatePlusPos)
      editor.off('blur', handleBlur)
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-col">
      {/* ── Bubble menu (shows on text selection) ── */}
      {bubblePos && createPortal(
        <div
          className="fixed z-[9998] flex items-center gap-0.5 bg-white border border-[#e8eaeb] rounded-xl shadow-[0_4px_16px_rgba(45,52,53,0.12)] px-2 py-1.5 -translate-x-1/2 -translate-y-full -mt-2"
          style={{ left: bubblePos.x, top: bubblePos.y - 8 }}
          onMouseDown={e => e.preventDefault()}
        >
          <BubbleBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <Bold size={14} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <Italic size={14} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <Underline size={14} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough size={14} />
          </BubbleBtn>
          <BubbleDivider />
          <BubbleBtn onClick={() => (editor.chain().focus() as any).toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
            <Highlighter size={14} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
            <Code size={14} />
          </BubbleBtn>
        </div>,
        document.body,
      )}

      {/* ── Slash command menu ── */}
      {slashState && (
        <SlashMenu state={slashState} editor={editor} onClose={closeSlash} />
      )}

      {/* ── Editor area with left gutter ── */}
      <div className="flex">
        {editable && (
          <div
            ref={gutterRef}
            className="relative -ml-8 w-8 shrink-0 select-none"
            onMouseEnter={() => { isHoveringGutter.current = true }}
            onMouseLeave={() => { isHoveringGutter.current = false }}
          >
            {plusTop !== null && (
              <div className="absolute left-0" style={{ top: plusTop }}>
                <BlockInsertMenu
                  editor={editor}
                  side="right"
                  align="start"
                  onOpenChange={open => { isDropdownOpen.current = open }}
                  triggerClassName="flex items-center justify-center w-7 h-7 rounded-md text-[#b0b8b9] hover:bg-[#f2f4f4] hover:text-[#586062] transition-all cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <EditorContent editor={editor} className="rich-editor" />
        </div>
      </div>

      {/* ── Floating formatting toolbar ── */}
      {editable && (() => {
        const iconSz = compact ? 14 : 19
        const btnCls = compact
          ? 'flex items-center justify-center w-7 h-7 rounded-lg text-xs font-medium transition-all cursor-pointer'
          : 'flex items-center justify-center w-11 h-11 rounded-xl text-sm font-medium transition-all cursor-pointer'
        const activeCls = 'bg-[#1F3649] text-white'
        const idleCls = 'text-[#5a6061] hover:bg-[#f2f4f4] hover:text-[#2d3435]'
        const Btn = ({ onClick, active = false, title: t, children }: { onClick: () => void; active?: boolean; title?: string; children: React.ReactNode }) => (
          <button onMouseDown={e => { e.preventDefault(); onClick() }} title={t} className={cn(btnCls, active ? activeCls : idleCls)}>{children}</button>
        )
        const wrapperCls = compact
          ? 'pointer-events-auto inline-flex items-center gap-0 bg-white border border-[#f2f4f4] rounded-xl shadow-[0_4px_16px_rgba(45,52,53,0.10)] px-1.5 py-1'
          : 'pointer-events-auto inline-flex items-center gap-0.5 bg-white border border-[#f2f4f4] rounded-2xl shadow-[0_8px_32px_rgba(45,52,53,0.12)] px-3 py-2'
        const dividerEl = compact
          ? <div className="w-px h-3.5 bg-[#ebeeef] mx-0.5 shrink-0" />
          : <div className="w-px h-5 bg-[#ebeeef] mx-0.5 shrink-0" />

        return (
          <div className={compact
            ? 'flex justify-center pt-3 pb-1'
            : 'fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none'
          }>
            <div className={wrapperCls}>
              <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
                <span className={compact ? 'text-[11px] font-bold' : 'text-[15px] font-bold'}>H1</span>
              </Btn>
              <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                <span className={compact ? 'text-[11px] font-bold' : 'text-[15px] font-bold'}>H2</span>
              </Btn>
              <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                <span className={compact ? 'text-[11px] font-bold' : 'text-[15px] font-bold'}>H3</span>
              </Btn>
              {dividerEl}
              <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={iconSz} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={iconSz} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><Underline size={iconSz} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={iconSz} /></Btn>
              {dividerEl}
              <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="To-do list"><CheckSquare size={iconSz} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List size={iconSz} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={iconSz} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote size={iconSz} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code"><Code size={iconSz} /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
                <span className={compact ? 'text-[10px] font-mono font-bold' : 'text-[13px] font-mono font-bold'}>{`</>`}</span>
              </Btn>
              {dividerEl}
              <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={iconSz} /></Btn>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
