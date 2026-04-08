import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, Key, Cpu } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

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
    await supabase.from('user_profiles').upsert(
      { user_id: user.id, anthropic_api_key: trimmed },
      { onConflict: 'user_id' }
    )
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
    'w-full rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#586062]/50 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10'

  const btnCls =
    'flex items-center gap-1.5 bg-[#e4e9ea] hover:bg-[#dde4e5] text-[#2d3435] px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer'

  return (
    <div className="pb-24">
      <div className="pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2d3435] mb-2">Settings</h1>
        <p className="text-sm text-[#5a6061]">Configure your integrations and API connections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Key */}
        <div className="bg-white card p-10 flex flex-col">
          <div className="flex items-center gap-2.5 mb-2">
            <Key size={18} className="text-[#1F3649]" />
            <h2 className="text-2xl font-bold text-[#2d3435]">Anthropic API Key</h2>
          </div>
          <p className="text-sm text-[#5a6061] mb-8 leading-relaxed">
            Required for AI journal analysis. Your key is stored securely in the database,
            never exposed to other users. Get your key at{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F3649] hover:underline"
            >
              console.anthropic.com
            </a>
          </p>
          <form onSubmit={saveApiKey} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#5a6061] ml-1 mb-2">API Key</label>
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
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={keyLoading} className={btnCls}>
                <Save size={13} />
                {keyLoading ? 'Saving...' : keySaved ? 'Saved!' : 'Save API Key'}
              </button>
            </div>
          </form>
        </div>

        {/* Model selector */}
        <div className="bg-white card p-10 flex flex-col">
          <div className="flex items-center gap-2.5 mb-2">
            <Cpu size={18} className="text-[#1F3649]" />
            <h2 className="text-2xl font-bold text-[#2d3435]">AI Model</h2>
          </div>
          <p className="text-sm text-[#5a6061] mb-8 leading-relaxed">
            Choose which Claude model to use for journal analysis and insights.
          </p>
          <form onSubmit={saveModel} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#5a6061] ml-1 mb-2">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={inputCls}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button type="submit" className={btnCls}>
                <Save size={13} />
                {modelSaved ? 'Saved!' : 'Save Model'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
