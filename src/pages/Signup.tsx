import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/Logo complete dark.png" alt="Logbird" className="h-14 w-auto" />
        </div>

        <div className="bg-white card p-8">
          <h1 className="text-2xl font-bold text-[#2d3435] mb-1">Create account</h1>
          <p className="text-sm text-[#5a6061] mb-8">Set up your personal OS</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#5a6061] ml-1 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#f2f4f4] border-none rounded-xl py-4 px-6 text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none focus:ring-2 focus:ring-[#1F3649]/20 focus:bg-white transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5a6061] ml-1 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f2f4f4] border-none rounded-xl py-4 px-6 text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none focus:ring-2 focus:ring-[#1F3649]/20 focus:bg-white transition-all"
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
                className="w-full bg-[#f2f4f4] border-none rounded-xl py-4 px-6 text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none focus:ring-2 focus:ring-[#1F3649]/20 focus:bg-white transition-all"
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
              <p className="text-sm text-[#5a6061] mt-1">Minimum 8 characters</p>
            </div>

            {error && <p className="text-sm text-[#9f403d] bg-[#9f403d]/10 rounded-xl px-4 py-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#586062] text-white font-bold py-4 rounded-full text-base transition-all duration-200 cursor-pointer active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#5a6061] mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1F3649] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
