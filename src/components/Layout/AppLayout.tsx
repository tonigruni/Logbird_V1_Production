import { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { Search, LayoutDashboard, BookOpen, Circle, User, Settings, Plus } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

const mobileNav = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/wheel', icon: Circle, label: 'Wheel' },
  { to: '/account', icon: User, label: 'Account' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface TabConfig {
  label: string
  active: boolean
  path?: string
  onClick?: () => void
  isAction?: boolean
}

// Per-section config: title and sub-tabs
function useSectionConfig(pathname: string, search: string, navigate: ReturnType<typeof useNavigate>) {
  const journalTab = new URLSearchParams(search).get('tab') || 'dashboard'
  const isJournal = pathname === '/journal'

  if (pathname === '/' ) return { title: 'Dashboard', tabs: null }
  if (pathname === '/wheel')    return { title: 'Wheel of Life', tabs: null }
  if (pathname === '/account')  return { title: 'Account', tabs: null }
  if (pathname === '/settings') return { title: 'Settings', tabs: null }

  if (['/journal', '/analysis', '/insights'].includes(pathname)) {
    return {
      title: 'Journal',
      tabs: [
        { label: 'Overview',    active: isJournal && journalTab === 'dashboard', path: '/journal' },
        { label: 'All Entries', active: isJournal && journalTab === 'journal',   path: '/journal?tab=journal' },
        { label: 'Calendar',    active: isJournal && journalTab === 'calendar',  path: '/journal?tab=calendar' },
        { label: 'Templates',   active: isJournal && journalTab === 'templates', path: '/journal?tab=templates' },
        { label: 'Analysis',    active: pathname === '/analysis',                path: '/analysis' },
        { label: 'Insights',    active: pathname === '/insights',                path: '/insights' },
        {
          label: 'Add Entry',
          active: false,
          isAction: true,
          onClick: () => navigate('/journal', { state: { openNew: true } }),
        },
      ] as TabConfig[],
    }
  }

  return { title: 'Logbird', tabs: null }
}

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const { title, tabs } = useSectionConfig(location.pathname, location.search, navigate)
  const isJournalContext = ['/journal', '/analysis', '/insights'].includes(location.pathname)

  const initials = useMemo(() => {
    const name = (user?.user_metadata?.full_name as string) || ''
    if (name.trim()) {
      const parts = name.trim().split(/\s+/)
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase()
    }
    const email = user?.email || ''
    return email.slice(0, 2).toUpperCase() || 'ME'
  }, [user])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/journal?tab=journal&q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const tabClass = (active: boolean) =>
    cn(
      'text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap leading-none pb-[3px] shrink-0 !rounded-none bg-transparent',
      active
        ? 'text-[#1F3649] border-b-2 border-[#1F3649]'
        : 'text-[#586062] hover:text-[#1F3649]'
    )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top App Bar */}
        <header className="w-full bg-background/80 backdrop-blur-xl sticky top-0 z-40 shrink-0 border-b border-[#f2f4f4]">
          <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-4 md:py-5 flex justify-between items-center gap-3">

            <div className="flex items-center gap-4 md:gap-10 min-w-0 flex-1">
              {/* Section title */}
              <span className="text-lg md:text-xl font-black tracking-tight shrink-0 text-[#2d3435]">
                {title}
              </span>

              {/* Sub-tabs — only when the section has them */}
              {tabs && (
                <nav className="flex items-center gap-5 md:gap-7 overflow-x-auto scrollbar-hide">
                  {tabs.map(({ label, active, path, onClick, isAction }) => (
                    isAction ? (
                      <button
                        key={label}
                        onClick={onClick}
                        className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap shrink-0 px-3 py-1 rounded-full bg-[#1F3649] text-white hover:bg-[#2a4a63] transition-colors cursor-pointer leading-none"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                        {label}
                      </button>
                    ) : (
                      <button
                        key={label}
                        onClick={() => path && navigate(path)}
                        className={tabClass(active)}
                      >
                        {label}
                      </button>
                    )
                  ))}
                </nav>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {/* Search */}
              <div className="relative hidden lg:block">
                <input
                  className="bg-[#f2f4f4] border-none rounded-[15px] py-2.5 pl-5 pr-10 w-52 focus:ring-2 focus:ring-[#1F3649]/20 focus:bg-white transition-all outline-none text-sm text-[#2d3435] placeholder:text-[#586062] placeholder:opacity-40"
                  placeholder={isJournalContext ? 'Search entries…' : 'Search…'}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#586062] opacity-40 pointer-events-none" />
              </div>

              {/* Avatar */}
              <button
                onClick={() => navigate('/account')}
                className="w-8 h-8 md:w-9 md:h-9 !rounded-full bg-[#dde4e5] cursor-pointer active:scale-95 transition-transform flex items-center justify-center shrink-0"
                aria-label="Account settings"
              >
                <span className="text-xs font-bold text-[#586062]">{initials}</span>
              </button>
            </div>

          </div>
        </header>

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto pb-16 md:pb-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.088) 1px, transparent 0)',
            backgroundSize: '20px 20px',
            backgroundPosition: '10px 10px',
          }}
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-12 w-full pt-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-[#f2f4f4] flex items-center justify-around px-2 py-2">
        {mobileNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all',
                isActive ? 'text-[#1F3649]' : 'text-[#adb3b4]'
              )
            }
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-semibold">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
