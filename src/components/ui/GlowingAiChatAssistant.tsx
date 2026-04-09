import { useState, useRef, useEffect } from 'react'
import { Send, Bot, X, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useJournalStore } from '../../stores/journalStore'
import { format } from 'date-fns'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function FloatingAiAssistant() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { entries } = useJournalStore()

  const maxChars = 1000

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (chatRef.current && !chatRef.current.contains(target) && !target.closest('.floating-ai-button')) {
        setIsChatOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    if (input.length > maxChars) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setMessages(m => [...m, { role: 'user', content: input }, { role: 'assistant', content: 'Please sign in to use the AI assistant.' }])
      setInput('')
      return
    }

    const userMsg: Message = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const context = entries.slice(0, 20).map(e =>
        `[${format(new Date(e.created_at), 'MMM d, yyyy')}] ${e.title}:\n${e.content}`
      ).join('\n\n---\n\n')

      const history: { role: 'user' | 'assistant'; content: string }[] = messages.map(m => ({ role: m.role, content: m.content }))
      history.push({ role: 'user', content: input })

      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/anthropic-proxy`
      const res = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          max_tokens: 1024,
          system: `You are a thoughtful journal analysis assistant. The user's recent journal entries are provided below for context. Answer warmly, concisely, and specifically.\n\n${context ? `Recent entries:\n\n${context}` : 'No entries yet.'}`,
          messages: history,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error('AI request failed')
      }

      const block = data.content?.[0]
      const text = block?.type === 'text' ? block.text : 'No response received.'
      setMessages(m => [...m, { role: 'assistant', content: text }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating button */}
      <button
        className={`floating-ai-button relative w-14 h-14 flex items-center justify-center transition-all duration-300 ${isChatOpen ? 'scale-95' : 'hover:scale-110'}`}
        onClick={() => setIsChatOpen(o => !o)}
        style={{
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #162838 0%, #1F3649 100%)',
          boxShadow: '0 8px 24px rgba(31,54,73,0.4), 0 2px 8px rgba(31,54,73,0.2)',
          border: '2px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" style={{ borderRadius: '50%' }} />
        <div className="absolute inset-0 animate-ping opacity-10 bg-[#1F3649]" style={{ borderRadius: '50%' }} />
        <div className="relative z-10 text-white">
          {isChatOpen ? <X size={20} /> : <Bot size={22} />}
        </div>
      </button>

      {/* Chat panel */}
      {isChatOpen && (
        <div
          ref={chatRef}
          className="absolute right-0 w-[400px] animate-pop-in"
          style={{ bottom: '4.5rem' }}
        >
          <div className="flex flex-col bg-white border border-[#e8eaeb] shadow-[0_16px_48px_rgba(45,52,53,0.12)] overflow-hidden" style={{ borderRadius: 15 }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f2f4f4] bg-[#f2f4f4]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                <span className="text-xs font-semibold text-[#2d3435]">Journal AI</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-[#ebeeef] transition-colors" style={{ borderRadius: 8 }}>
                <X size={14} className="text-[#586062]" />
              </button>
            </div>

            {/* Message history */}
            {messages.length > 0 && (
              <div className="px-4 py-3 max-h-64 overflow-y-auto space-y-3 scrollbar-hide bg-[#f9f9f8]">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-5 h-5 rounded-full bg-[#1F3649]/10 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                        <Sparkles size={10} className="text-[#1F3649]" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1F3649] text-white rounded-br-sm'
                        : 'bg-white border border-[#f2f4f4] text-[#2d3435] rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-5 h-5 rounded-full bg-[#1F3649]/10 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <Sparkles size={10} className="text-[#1F3649] animate-pulse" />
                    </div>
                    <div className="bg-white border border-[#f2f4f4] text-[#adb3b4] px-3 py-2 rounded-2xl rounded-bl-sm text-xs shadow-sm">
                      Thinking…
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value.slice(0, maxChars))}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder={messages.length === 0 ? 'Ask about your journal entries, patterns, or reflections…' : 'Ask a follow-up…'}
                className="w-full bg-[#f2f4f4] border border-transparent rounded-[15px] px-4 py-3 text-sm text-[#2d3435] placeholder:text-[#adb3b4] resize-none outline-none focus:border-[#1F3649]/20 focus:bg-white focus:ring-2 focus:ring-[#1F3649]/10 transition-all scrollbar-hide leading-relaxed"
                style={{ scrollbarWidth: 'none' }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-[#adb3b4]">{input.length}/{maxChars} · Shift+Enter for new line</span>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1F3649] hover:bg-[#2a4a63] disabled:bg-[#adb3b4] disabled:cursor-not-allowed text-white text-xs font-semibold rounded-[15px] transition-all"
                >
                  <Send size={12} />
                  Send
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
