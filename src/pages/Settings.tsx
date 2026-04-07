import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, Key, Cpu } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const MODELS = [
  { id: 'claude-opus-4-5', label: 'Claude Opus 4.5 — Most capable' },
  { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5 — Balanced (recommended)' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 — Fastest & cheapest' },
  { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
]

export default function Settings() {
  const { user } = useAuthStore()
  const [anthropicKey, setAntropicKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)
  const [keyLoading, setKeyLoading] = useState(false)
  const [model, setModel] = useState('claude-sonnet-4-5')
  const [modelSaved, setModelSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    // Load from DB
    supabase
      .from('user_profiles')
      .select('anthropic_api_key, anthropic_model')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.anthropic_api_key) setAntropicKey(data.anthropic_api_key)
        if (data?.anthropic_model) setModel(data.anthropic_model)
      })
  }, [user])

  const saveApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setKeyLoading(true)
    const trimmed = anthropicKey.trim()
    // Persist to DB
    await supabase.from('user_profiles').upsert(
      { user_id: user.id, anthropic_api_key: trimmed },
      { onConflict: 'user_id' }
    )
    // Keep localStorage in sync for same-session use
    localStorage.setItem('anthropic_api_key', trimmed)
    setKeyLoading(false)
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2500)
  }

  const saveModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    await supabase.from('user_profiles').upsert(
      { user_id: user.id, anthropic_model: model },
      { onConflict: 'user_id' }
    )
    localStorage.setItem('anthropic_model', model)
    setModelSaved(true)
    setTimeout(() => setModelSaved(false), 2500)
  }

  const inputCls =
    'w-full bg-[#f2f4f4] border-none rounded-xl py-4 px-6 text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none focus:ring-2 focus:ring-[#0061aa]/20 focus:bg-white transition-all'

  return (
    <div className="px-4 md:px-12 pb-24 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2d3435] mb-2">Settings</h1>
          <p className="text-[#5a6061] mb-8">Configure your integrations and API connections.</p>
        </div>
        <Link
          to="/account"
          className="text-sm text-[#0061aa] font-semibold hover:underline"
        >
          Account &amp; Profile
        </Link>
      </div>

      <div className="space-y-6">
        {/* API Key */}
        <div className="bg-white rounded-xl shadow-sm p-5 md:p-8">
          <h2 className="text-xl font-bold text-[#2d3435] flex items-center gap-2 mb-2">
            <Key size={18} className="text-[#0061aa]" />
            Anthropic API Key
          </h2>
          <p className="text-sm text-[#5a6061] mb-8 leading-relaxed">
            Required for AI journal analysis. Your key is stored securely in the database,
            never exposed to other users. Get your key at{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0061aa] hover:underline"
            >
              console.anthropic.com
            </a>
          </p>
          <form onSubmit={saveApiKey} className="space-y-4">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAntropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className={`${inputCls} pr-12 font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#586062] opacity-40 hover:opacity-70 transition-colors cursor-pointer"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={keyLoading}
              className="flex items-center gap-1.5 bg-[#e4e9ea] text-[#586062] hover:bg-[#dde4e5] disabled:opacity-50 text-sm font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
            >
              <Save size={13} />
              {keyLoading ? 'Saving...' : keySaved ? 'Saved!' : 'Save API Key'}
            </button>
          </form>
        </div>

        {/* Model selector */}
        <div className="bg-white rounded-xl shadow-sm p-5 md:p-8">
          <h2 className="text-xl font-bold text-[#2d3435] flex items-center gap-2 mb-2">
            <Cpu size={18} className="text-[#0061aa]" />
            AI Model
          </h2>
          <p className="text-sm text-[#5a6061] mb-8 leading-relaxed">
            Choose which Claude model to use for journal analysis and insights.
          </p>
          <form onSubmit={saveModel} className="space-y-4">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={inputCls}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#e4e9ea] text-[#586062] hover:bg-[#dde4e5] text-sm font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
            >
              <Save size={13} />
              {modelSaved ? 'Saved!' : 'Save Model'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
