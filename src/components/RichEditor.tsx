import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Markdown } from 'tiptap-markdown'
import { useEffect } from 'react'
import { cn } from '../lib/utils'
import {
  Bold, Italic, Underline, List, ListOrdered,
  Quote, Code, Minus, Heading1, Heading2, Heading3, Strikethrough,
} from 'lucide-react'

interface Props {
  content: string
  onChange: (markdown: string) => void
  editable: boolean
  placeholder?: string
}

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
        'flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-all cursor-pointer',
        active
          ? 'bg-[#0061aa] text-white'
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

export default function RichEditor({ content, onChange, editable, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExt,
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing from the heart…',
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#0061aa] underline' } }),
      Markdown.configure({ html: false, transformCopiedText: true }),
    ],
    content,
    editable,
    onUpdate({ editor }) {
      onChange(editor.storage.markdown.getMarkdown())
    },
  })

  // Sync editable prop
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable)
    }
  }, [editor, editable])

  if (!editor) return null

  return (
    <div className="flex flex-col">
      {/* Editor content */}
      <EditorContent editor={editor} className="rich-editor" />

      {/* Bottom formatting toolbar — card style, only when editable */}
      {editable && (
        <div className="mx-6 mb-4 bg-white border border-[#f2f4f4] rounded-xl shadow-[0_4px_24px_rgba(45,52,53,0.07)] px-3 py-2 flex items-center gap-0.5 flex-wrap">
          {/* Heading group */}
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
            <span className="text-xs font-bold">H1</span>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
            <span className="text-xs font-bold">H2</span>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
            <span className="text-xs font-bold">H3</span>
          </ToolbarBtn>

          <Divider />

          {/* Inline formatting */}
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <Bold size={13} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <Italic size={13} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <Underline size={13} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough size={13} />
          </ToolbarBtn>

          <Divider />

          {/* Block formatting */}
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
            <List size={13} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
            <ListOrdered size={13} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
            <Quote size={13} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
            <Code size={13} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
            <span className="text-[10px] font-mono font-bold">{`</>`}</span>
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
            <Minus size={13} />
          </ToolbarBtn>
        </div>
      )}
    </div>
  )
}
