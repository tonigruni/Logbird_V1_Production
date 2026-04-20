import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DEMO_MODE } from '../lib/demo'
import GradientBarsBackground from '../components/ui/GradientBarsBackground'


export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (DEMO_MODE) { navigate('/'); return }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      sessionStorage.setItem('logbird_session_active', 'true')
      navigate('/')
    }
  }

  const passwordStrength = password.length === 0
    ? null
    : password.length < 8
      ? 'too-short'
      : password.length < 12
        ? 'fair'
        : 'strong'

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row overflow-hidden">

      {/* ── Left column: sign-up form ── */}
      <section
        className="flex-1 relative flex items-center justify-center p-8 bg-background"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.088) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          backgroundPosition: '10px 10px',
        }}
      >

        {/* Logo — top left */}
        <div className="absolute top-8 left-8 auth-fade auth-delay-1">
          <img src="/Logo complete dark semibold.png" alt="Logbird" className="h-10 w-auto" />
        </div>

        <div className="w-full max-w-md">
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="auth-fade auth-delay-2 text-4xl font-semibold text-on-surface leading-tight tracking-tight">
                Create account
              </h1>
              <p className="auth-fade auth-delay-3 text-on-surface-variant mt-2 text-sm">
                Set up your personal OS
              </p>
            </div>

            {error && (
              <p className="text-sm text-error bg-error/10 rounded-2xl px-4 py-3">{error}</p>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSignup}>
              <div className="auth-fade auth-delay-3">
                <label className="text-sm font-medium text-on-surface-variant block mb-1.5">
                  Full Name
                </label>
                <div className="auth-input">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-transparent text-sm px-4 py-3.5 rounded-[15px] focus:outline-none text-on-surface"
                  />
                </div>
              </div>

              <div className="auth-fade auth-delay-4">
                <label className="text-sm font-medium text-on-surface-variant block mb-1.5">
                  Email Address
                </label>
                <div className="auth-input">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm px-4 py-3.5 rounded-[15px] focus:outline-none text-on-surface"
                    required
                  />
                </div>
              </div>

              <div className="auth-fade auth-delay-5">
                <label className="text-sm font-medium text-on-surface-variant block mb-1.5">
                  Password
                </label>
                <div className="auth-input">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-transparent text-sm px-4 py-3.5 pr-12 rounded-[15px] focus:outline-none text-on-surface"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {passwordStrength && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-colors duration-300"
                          style={{
                            backgroundColor:
                              passwordStrength === 'too-short' && i === 0 ? '#9f403d' :
                              passwordStrength === 'fair' && i <= 1 ? '#f59e0b' :
                              passwordStrength === 'strong' ? '#22c55e' :
                              'var(--card-border-color)'
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      {passwordStrength === 'too-short' ? 'Too short' : passwordStrength === 'fair' ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-fade auth-delay-6 w-full bg-primary py-3.5 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 text-sm mt-1"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="auth-fade auth-delay-7 text-center text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline transition-colors font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Right column: gradient bars card + testimonials ── */}
      <section className="hidden md:block flex-1 relative p-4">
        <div className="auth-slide-right auth-delay-3 absolute top-8 right-8 bottom-8 left-4 rounded-3xl overflow-hidden bg-[#1F3649]">
          <GradientBarsBackground barCount={8} animate />
          {/* Intro text — pinned to bottom */}
          <div className="relative z-10 p-10 flex flex-col justify-end h-full">
            <div>
              <p className="text-white/50 text-xs font-semibold tracking-widest mb-4">Your Personal OS</p>
              <h2 className="text-white text-5xl font-bold leading-tight tracking-tight w-3/4">
                The system built<br />around your life.
              </h2>
              <p className="text-white/60 mt-5 text-base leading-relaxed w-3/4">
                Journal your days, track your goals, and align every action with what matters most — all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
