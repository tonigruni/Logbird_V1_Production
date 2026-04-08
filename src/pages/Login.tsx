import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const inputCls =
  'w-full rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#586062]/50 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/Logo complete dark semibold.png" alt="Logbird" className="h-14 w-auto" />
        </div>

        <div className="bg-white card p-10">
          <h1 className="text-2xl font-bold text-[#2d3435] mb-1">Welcome back</h1>
          <p className="text-sm text-[#5a6061] mb-8">Sign in to your personal OS</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#5a6061] ml-1 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5a6061] ml-1 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-[#9f403d] bg-[#9f403d]/10 rounded-[1rem] px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F3649] hover:opacity-90 text-white font-semibold py-3 rounded-[10px] text-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-[#5a6061] mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#1F3649] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
