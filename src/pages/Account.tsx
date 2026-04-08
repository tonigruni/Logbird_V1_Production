import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { DEMO_MODE } from '../lib/demo'
import { Lock, AlertTriangle, Trash2, User, ChevronsUpDown, Check, Search, PenLine } from 'lucide-react'
import { cn } from '../lib/utils'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina',
  'Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Cape Verde',
  'Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba',
  'Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia',
  'Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Guatemala','Guinea',
  'Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica',
  'Japan','Jordan','Kazakhstan','Kenya','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia',
  'Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta',
  'Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia',
  'Norway','Oman','Pakistan','Palestine','Panama','Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia','Sierra Leone','Singapore','Slovakia','Slovenia',
  'Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Togo','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Venezuela',
  'Vietnam','Yemen','Zambia','Zimbabwe',
]

function CountryPicker({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between gap-2 text-left',
          value ? 'text-[#2d3435]' : 'text-[#586062]/50',
          className,
        )}
        style={{ borderRadius: 15 }}
      >
        <span className="truncate">{value || 'Select country…'}</span>
        <ChevronsUpDown size={14} className="shrink-0 text-[#adb3b4]" />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-[#e8eaeb] shadow-[0_8px_24px_rgba(45,52,53,0.10)] overflow-hidden"
          style={{ borderRadius: 15 }}
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#f2f4f4]">
            <Search size={13} className="text-[#adb3b4] shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country…"
              className="flex-1 text-sm text-[#2d3435] placeholder:text-[#adb3b4] outline-none bg-transparent"
            />
          </div>
          {/* List */}
          <div className="max-h-52 overflow-y-auto [scrollbar-width:none]">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-[#adb3b4]">No results</p>
            ) : filtered.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { onChange(c); setOpen(false); setSearch('') }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#2d3435] hover:bg-[#f2f4f4] transition-colors cursor-pointer text-left"
              >
                {c}
                {value === c && <Check size={13} className="text-[#1F3649] shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer !rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#1F3649]' : 'bg-[#dde4e5]'
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

  // Bio state
  const [bioLoading, setBioLoading] = useState(false)
  const [bioMsg, setBioMsg] = useState('')

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

  /* ---- Save bio ---- */
  const saveBio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (DEMO_MODE) {
      setBioMsg('Bio saved (demo mode)')
      setTimeout(() => setBioMsg(''), 2500)
      return
    }
    setBioLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { bio } })
    setBioLoading(false)
    setBioMsg(error ? error.message : 'Bio saved.')
    setTimeout(() => setBioMsg(''), 2500)
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
    'w-full rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#586062]/50 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10'

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="pb-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#2d3435] mb-2">
          Account &amp; Settings
        </h2>
        <p className="text-[#5a6061] max-w-2xl">
          Manage your profile information, security settings, and account
          preferences.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-8">
        {/* ============================================================ */}
        {/*  PROFILE INFO — 8 cols                                        */}
        {/* ============================================================ */}
        <section className="col-span-12 lg:col-span-8 bg-white card p-10 flex flex-col">
          <div className="flex items-center gap-2.5 mb-2">
            <User size={18} className="text-[#1F3649]" />
            <h3 className="text-2xl font-bold text-[#2d3435]">Profile Info</h3>
          </div>
          <p className="text-sm text-[#5a6061]">Your personal identity across the platform.</p>

          <form onSubmit={updateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">Email Address</label>
                <input value={email} disabled className={`${inputCls} cursor-not-allowed opacity-60`} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">Country</label>
                <CountryPicker value={location} onChange={setLocation} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">City</label>
                <input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g. New York" className={inputCls} />
              </div>
            </div>

            {profileMsg && (
              <p className="text-sm text-[#22c55e] bg-[#22c55e]/10 rounded-[1rem] px-4 py-3 mt-6">
                {profileMsg}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="bg-[#e4e9ea] hover:bg-[#dde4e5] text-[#2d3435] px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </section>

        {/* ============================================================ */}
        {/*  TELL US ABOUT YOURSELF — 4 cols                             */}
        {/* ============================================================ */}
        <section className="col-span-12 lg:col-span-4 bg-white card p-10 flex flex-col">
          <div className="flex items-center gap-2.5 mb-2">
            <PenLine size={18} className="text-[#1F3649]" />
            <h3 className="text-2xl font-bold text-[#2d3435]">Tell us about yourself</h3>
          </div>
          <p className="text-sm text-[#5a6061]">A short bio visible on your profile.</p>
          <form onSubmit={saveBio} className="mt-8 flex flex-col flex-1">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a few sentences about yourself…"
              className={`${inputCls} resize-none flex-1 min-h-0`}
            />
            {bioMsg && (
              <p className="text-sm text-[#22c55e] bg-[#22c55e]/10 rounded-[1rem] px-4 py-3 mt-4">
                {bioMsg}
              </p>
            )}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={bioLoading}
                className="bg-[#e4e9ea] hover:bg-[#dde4e5] text-[#2d3435] px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {bioLoading ? 'Saving...' : 'Save Bio'}
              </button>
            </div>
          </form>
        </section>

        {/* ============================================================ */}
        {/*  SECURITY — 8 cols                                            */}
        {/* ============================================================ */}
        <section className="col-span-12 lg:col-span-8 bg-white card p-10 flex flex-col">
          <div className="flex items-center gap-2.5 mb-2">
            <Lock size={18} className="text-[#1F3649]" />
            <h3 className="text-2xl font-bold text-[#2d3435]">Security</h3>
          </div>
          <p className="text-sm text-[#5a6061]">Update your password to keep your account secure.</p>

          <form onSubmit={changePassword} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#5a6061] ml-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 12 characters"
                  className={inputCls}
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-sm text-[#9f403d] bg-[#9f403d]/10 rounded-[1rem] px-4 py-3 mt-6">
                {passwordError}
              </p>
            )}
            {passwordMsg && (
              <p className="text-sm text-[#22c55e] bg-[#22c55e]/10 rounded-[1rem] px-4 py-3 mt-6">
                {passwordMsg}
              </p>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-[#e4e9ea] hover:bg-[#dde4e5] text-[#2d3435] px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Lock size={13} />
                {passwordLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>

        {/* ============================================================ */}
        {/*  DANGER ZONE — 4 cols                                        */}
        {/* ============================================================ */}
        <section className="col-span-12 lg:col-span-4">
          <div className="bg-[#fff3f3] border-2 border-[#fe8983]/20 card p-10 h-full flex flex-col">
            <div className="flex items-center gap-2.5 mb-2">
              <AlertTriangle size={18} className="text-[#9f403d]" />
              <h3 className="text-2xl font-bold text-[#2d3435]">Danger Zone</h3>
            </div>
            <p className="text-sm text-[#5a6061] mb-8">
              Deleting your account is a permanent action. All your journal
              entries, calendar events, and growth metrics will be wiped from
              our servers. This cannot be undone. You will be asked to confirm
              before deletion.
            </p>

            {!showDelete ? (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowDelete(true)}
                  className="bg-[#9f403d] hover:brightness-90 text-white px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Trash2 size={13} />
                  Delete Account
                </button>
              </div>
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
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowDelete(false)
                      setDeleteConfirm('')
                      setDeleteError('')
                    }}
                    className="bg-[#e4e9ea] hover:bg-[#dde4e5] text-[#2d3435] px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAccount}
                    disabled={deleteLoading || deleteConfirm !== user?.email}
                    className="bg-[#9f403d] hover:brightness-90 text-white px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
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
