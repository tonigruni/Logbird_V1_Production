import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { DEMO_MODE } from '../lib/demo'
import { Lock, AlertTriangle, Trash2 } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Toggle switch component                                           */
/* ------------------------------------------------------------------ */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#0061aa]' : 'bg-[#dde4e5]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 mt-1 ${
          checked ? 'translate-x-[26px]' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Account & Settings page                                           */
/* ------------------------------------------------------------------ */
export default function Account() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  // Profile state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [timezone, setTimezone] = useState('')
  const [bio, setBio] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name ?? '')
      setEmail(user.email ?? '')
      setLocation(user.user_metadata?.location ?? '')
      setTimezone(
        user.user_metadata?.timezone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone
      )
      setBio(user.user_metadata?.bio ?? '')
      setEmailNotifications(user.user_metadata?.email_notifications ?? true)
      setPublicProfile(user.user_metadata?.public_profile ?? false)
    }
  }, [user])

  /* ---- Profile save ---- */
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (DEMO_MODE) {
      setProfileMsg('Profile updated (demo mode)')
      setTimeout(() => setProfileMsg(''), 2500)
      return
    }
    setProfileLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, location, timezone, bio },
    })
    if (!error && user) {
      await supabase
        .from('user_profiles')
        .upsert(
          { user_id: user.id, full_name: fullName },
          { onConflict: 'user_id' }
        )
    }
    setProfileLoading(false)
    setProfileMsg(error ? error.message : 'Profile updated successfully.')
    setTimeout(() => setProfileMsg(''), 2500)
  }

  /* ---- Change password ---- */
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg('')
    setPasswordError('')
    if (DEMO_MODE) {
      setPasswordError('Password change is disabled in demo mode.')
      return
    }
    if (newPassword.length < 12) {
      setPasswordError('Password must be at least 12 characters.')
      return
    }
    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)
    if (error) setPasswordError(error.message)
    else {
      setPasswordMsg('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
    }
  }

  /* ---- Delete account ---- */
  const deleteAccount = async () => {
    if (DEMO_MODE) {
      setDeleteError('Account deletion is disabled in demo mode.')
      return
    }
    if (deleteConfirm !== user?.email) {
      setDeleteError('Email does not match.')
      return
    }
    setDeleteLoading(true)
    const { error } = await supabase.rpc('delete_user')
    setDeleteLoading(false)
    if (error) setDeleteError(error.message)
    else {
      await signOut()
      navigate('/login')
    }
  }

  /* ---- Toggle preference and save to Supabase ---- */
  const updatePreference = async (
    key: 'email_notifications' | 'public_profile',
    value: boolean
  ) => {
    if (key === 'email_notifications') setEmailNotifications(value)
    else setPublicProfile(value)

    if (DEMO_MODE) return
    await supabase.auth.updateUser({ data: { [key]: value } })
  }

  /* shared input classes — using explicit hex for reliability */
  const inputCls =
    'w-full bg-[#f2f4f4] border-none rounded-[1.5rem] py-4 px-6 text-[#2d3435] placeholder:text-[#adb3b4] focus:ring-2 focus:ring-[#0061aa]/20 focus:bg-white transition-all outline-none'

  return (
    <div className="px-12 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="py-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#2d3435] mb-2">
          Account &amp; Settings
        </h2>
        <p className="text-[#5a6061] max-w-2xl">
          Manage your profile information, security settings, and account
          preferences.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* ============================================================ */}
        {/*  PROFILE INFO — 8 cols                                        */}
        {/* ============================================================ */}
        <section className="col-span-12 lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-[#2d3435] mb-1">
                Profile Info
              </h3>
              <p className="text-sm text-[#5a6061]">
                Your personal identity across the platform.
              </p>
            </div>
          </div>

          <form onSubmit={updateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">
                  Email Address
                </label>
                <input
                  value={email}
                  disabled
                  className={`${inputCls} cursor-not-allowed opacity-60`}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">
                  Timezone
                </label>
                <input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g. America/New_York"
                  className={inputCls}
                />
              </div>
              <div className="col-span-full space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">
                  Personal Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            {profileMsg && (
              <p className="text-sm text-[#22c55e] bg-[#22c55e]/10 rounded-[1rem] px-4 py-3 mt-6">
                {profileMsg}
              </p>
            )}

            <div className="mt-10 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="bg-[#586062] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </section>

        {/* ============================================================ */}
        {/*  SECURITY — 4 cols                                            */}
        {/* ============================================================ */}
        <section className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[3rem] p-8 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6 text-[#0061aa]">
              <Lock size={20} />
              <h3 className="text-xl font-bold text-[#2d3435]">Security</h3>
            </div>
            <p className="text-sm text-[#5a6061] mb-8 leading-relaxed">
              Ensure your account remains protected with a strong, rotating
              password.
            </p>

            <form onSubmit={changePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#5a6061] opacity-60">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#5a6061] opacity-60">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 12 characters"
                  className={inputCls}
                />
              </div>

              {passwordError && (
                <p className="text-sm text-[#9f403d] bg-[#9f403d]/10 rounded-[1rem] px-4 py-3">
                  {passwordError}
                </p>
              )}
              {passwordMsg && (
                <p className="text-sm text-[#22c55e] bg-[#22c55e]/10 rounded-[1rem] px-4 py-3">
                  {passwordMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-[#e4e9ea] text-[#586062] py-4 rounded-[1.5rem] font-bold hover:bg-[#dde4e5] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                {passwordLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>

            {/* Two-Factor Auth */}
            <div className="mt-8 pt-8 border-t border-dashed border-[#ebeeef]">
              <h4 className="text-sm font-bold text-[#2d3435] mb-4">
                Two-Factor Auth
              </h4>
              <div className="flex items-center justify-between p-4 bg-[#f2f4f4] rounded-[1.5rem]">
                <span className="text-sm font-medium text-[#5a6061]">
                  Coming soon
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter bg-[#dde4e5] text-[#586062]">
                  Unavailable
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  PREFERENCES + DANGER ZONE — full width row                   */}
        {/* ============================================================ */}
        <section className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ---- Preferences ---- */}
          <div className="bg-white rounded-[3rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#2d3435] mb-6">
              Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-2">
                <div>
                  <p className="font-semibold text-[#2d3435]">
                    Email Notifications
                  </p>
                  <p className="text-sm text-[#5a6061]">
                    Weekly summaries and insights
                  </p>
                </div>
                <Toggle
                  checked={emailNotifications}
                  onChange={(v) => updatePreference('email_notifications', v)}
                />
              </div>

              <div className="flex items-center justify-between p-2">
                <div>
                  <p className="font-semibold text-[#2d3435]">
                    Public Profile
                  </p>
                  <p className="text-sm text-[#5a6061]">
                    Allow others to find your public journal
                  </p>
                </div>
                <Toggle
                  checked={publicProfile}
                  onChange={(v) => updatePreference('public_profile', v)}
                />
              </div>
            </div>
          </div>

          {/* ---- Danger Zone ---- */}
          <div className="bg-[#fe8983]/10 border-2 border-[#fe8983]/20 rounded-[3rem] p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 text-[#9f403d]">
                <AlertTriangle size={20} />
                <h3 className="text-xl font-bold">Danger Zone</h3>
              </div>
              <p className="text-[#752121] text-sm leading-relaxed mb-6">
                Deleting your account is a permanent action. All your journal
                entries, calendar events, and growth metrics will be wiped from
                our servers. This cannot be undone.
              </p>
            </div>

            {!showDelete ? (
              <button
                onClick={() => setShowDelete(true)}
                className="w-full bg-[#9f403d] text-white py-4 rounded-[1.5rem] font-bold hover:brightness-90 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#752121]">
                  Type your email{' '}
                  <strong className="text-[#2d3435]">{user?.email}</strong> to
                  confirm:
                </p>
                <input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={user?.email ?? ''}
                  className={inputCls}
                />
                {deleteError && (
                  <p className="text-sm text-[#9f403d] bg-[#9f403d]/10 rounded-[1rem] px-4 py-3">
                    {deleteError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={deleteAccount}
                    disabled={deleteLoading || deleteConfirm !== user?.email}
                    className="flex-1 bg-[#9f403d] text-white py-4 rounded-[1.5rem] font-bold hover:brightness-90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDelete(false)
                      setDeleteConfirm('')
                      setDeleteError('')
                    }}
                    className="bg-[#e4e9ea] hover:bg-[#dde4e5] text-[#5a6061] font-medium px-6 py-4 rounded-[1.5rem] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
