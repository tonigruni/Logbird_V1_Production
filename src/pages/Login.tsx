import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DEMO_MODE } from '../lib/demo'

const HERO_IMAGE = '/signup_picture.jpg'

const testimonials = [
  {
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Sarah K.',
    handle: '@sarahbuilds',
    text: 'This is the first system that actually stuck. My goals, journal, and tasks — all in one place.',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'James M.',
    handle: '@jamesworks',
    text: 'The weekly reviews alone changed how I think about my time. A real game changer for focus.',
  },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (DEMO_MODE) navigate('/', { replace: true })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResetSent(false)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (!keepSignedIn) {
      localStorage.setItem('logbird_keep_signed_in', 'false')
    } else {
      localStorage.removeItem('logbird_keep_signed_in')
    }
    sessionStorage.setItem('logbird_session_active', 'true')
    navigate('/')
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Enter your email address above first, then click Reset password.')
      return
    }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setResetSent(true)
  }

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row overflow-hidden">

      {/* ── Left column: sign-in form ── */}
      <section className="flex-1 relative flex items-center justify-center p-8 bg-background">

        {/* Logo — top left */}
        <div className="absolute top-8 left-8 auth-fade auth-delay-1">
          <img src="/Logo complete dark semibold.png" alt="Logbird" className="h-10 w-auto" />
        </div>

        <div className="w-full max-w-md">
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="auth-fade auth-delay-2 text-4xl font-semibold text-on-surface leading-tight tracking-tight">
                Welcome back
              </h1>
              <p className="auth-fade auth-delay-3 text-on-surface-variant mt-2 text-sm">
                Sign in to your personal OS
              </p>
            </div>

            {resetSent && (
              <div className="rounded-2xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
                Password reset email sent — check your inbox.
              </div>
            )}

            {error && (
              <p className="text-sm text-error bg-error/10 rounded-2xl px-4 py-3">{error}</p>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <div className="auth-fade auth-delay-3">
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

              <div className="auth-fade auth-delay-4">
                <label className="text-sm font-medium text-on-surface-variant block mb-1.5">
                  Password
                </label>
                <div className="auth-input">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm px-4 py-3.5 pr-12 rounded-[15px] focus:outline-none text-on-surface"
                      required
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
              </div>

              <div className="auth-fade auth-delay-5 flex items-center justify-between text-sm pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                    style={{ borderRadius: 4 }}
                  />
                  <span className="text-on-surface-variant">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="text-primary hover:underline transition-colors disabled:opacity-50"
                >
                  Reset password
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-fade auth-delay-6 w-full bg-primary py-3.5 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 text-sm mt-1"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="auth-fade auth-delay-7 text-center text-sm text-on-surface-variant">
              New here?{' '}
              <Link to="/signup" className="text-primary hover:underline transition-colors font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Right column: hero image + testimonials ── */}
      <section className="hidden md:block flex-1 relative p-4">
        <div
          className="auth-slide-right auth-delay-3 absolute inset-4 rounded-3xl bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center pointer-events-none z-10">
          {testimonials.map((t, i) => (
            <div
              key={t.handle}
              className={`auth-testimonial ${i === 0 ? 'auth-delay-6' : 'auth-delay-8'} flex items-start gap-3 rounded-3xl p-5 w-64 pointer-events-auto`}
              style={{
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(31,54,73,0.12)',
              }}
            >
              <img src={t.avatar} className="h-10 w-10 object-cover rounded-2xl flex-shrink-0" alt="avatar" />
              <div className="text-sm leading-snug">
                <p className="font-semibold text-on-surface">{t.name}</p>
                <p className="text-on-surface-variant">{t.handle}</p>
                <p className="mt-1 text-on-surface-variant">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
