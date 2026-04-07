import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Circle, Settings, User, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/wheel', icon: Circle, label: 'Wheel of Life' },
  { to: '/account', icon: User, label: 'Account' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-full text-sm tracking-tight transition-all duration-200 cursor-pointer font-semibold',
      isActive
        ? 'bg-[#0061aa] text-white [&_svg]:fill-white'
        : 'text-[#586062] hover:bg-[#dde4e5] [&_svg]:fill-[#586062]'
    )

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen bg-[#f9f9f9] py-8 px-4 sticky top-0 z-50">
      {/* Logo */}
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold text-[#586062]">Personal OS</h1>
        <p className="text-xs text-[#586062] opacity-60 font-medium">Personal Growth Hub</p>
      </div>

      {/* All nav items in one list */}
      <nav className="flex-1 space-y-2">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
            <Icon size={18} strokeWidth={1.5} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium text-[#586062] hover:bg-[#9f403d]/10 hover:text-[#9f403d] transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} strokeWidth={1.5} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
