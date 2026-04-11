import { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { Search, LayoutDashboard, BookOpen, Circle, User, Settings, LogOut, Plus, FileText } from 'lucide-react'
import { SquaresFour, ListBullets, Columns, PencilSimpleLine } from '@phosphor-icons/react'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverBody, PopoverFooter } from '../ui/popover'
import { Avatar, AvatarFallback } from '../ui/avatar'

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
  compact?: boolean
  icon?: React.ElementType
}

// Per-section config: title and sub-tabs
function useSectionConfig(pathname: string, search: string, navigate: ReturnType<typeof useNavigate>) {
  const journalTab = new URLSearchParams(search).get('tab') || 'dashboard'
  const isJournal = pathname === '/journal'

  if (pathname === '/' ) return { title: 'Dashboard', tabs: null }
  if (pathname === '/wheel')    return { title: 'Wheel of Life', tabs: null }
  if (pathname === '/account')  return { title: 'Account', tabs: null }
  if (pathname === '/settings') return { title: 'Settings', tabs: null }
  if (pathname === '/tasks' || pathname.startsWith('/tasks/')) {
    const viewParam = new URLSearchParams(search).get('view') || 'board'
    return {
      title: 'Tasks',
      tabs: [
        { label: 'Board', active: viewParam === 'board', path: '/tasks?view=board', icon: SquaresFour },
        { label: 'List',  active: viewParam === 'list',  path: '/tasks?view=list',  icon: ListBullets },
        {
          label: 'Create Task',
          active: false,
          isAction: true,
          icon: PencilSimpleLine,
          onClick: () => navigate('/tasks', { state: { openModal: true } }),
        },
      ] as TabConfig[],
    }
  }
  if (pathname === '/goals') {
    const viewParam = new URLSearchParams(search).get('view') || 'portfolio'
    return {
      title: 'Goals',
      tabs: [
        { label: 'Portfolio', active: viewParam === 'portfolio', path: '/goals?view=portfolio', icon: SquaresFour },
        { label: 'List',      active: viewParam === 'list',      path: '/goals?view=list',      icon: ListBullets },
        { label: 'Board',     active: viewParam === 'board',     path: '/goals?view=board',     icon: Columns },
      ] as TabConfig[],
    }
  }
  if (pathname === '/projects') {
    const viewParam = new URLSearchParams(search).get('view') || 'grid'
    return {
      title: 'Projects',
      tabs: [
        { label: 'Grid',  active: viewParam === 'grid',  path: '/projects?view=grid',  icon: SquaresFour },
        { label: 'List',  active: viewParam === 'list',  path: '/projects?view=list',  icon: ListBullets },
        { label: 'Board', active: viewParam === 'board', path: '/projects?view=board', icon: Columns },
      ] as TabConfig[],
    }
  }
  if (pathname.startsWith('/projects/')) return { title: 'Projects', tabs: null }
  if (pathname === '/timeboxing') return { title: 'Timeboxing', tabs: null }

  if (['/journal', '/insights'].includes(pathname)) {
    return {
      title: 'Journal',
      tabs: [
        { label: 'Overview',    active: isJournal && journalTab === 'dashboard', path: '/journal' },
        { label: 'All Entries', active: isJournal && journalTab === 'journal',   path: '/journal?tab=journal' },
        { label: 'Calendar',    active: isJournal && journalTab === 'calendar',  path: '/journal?tab=calendar' },
        { label: 'Templates',   active: isJournal && journalTab === 'templates', path: '/journal?tab=templates' },
        { label: 'Insights',    active: pathname === '/insights',                path: '/insights' },
        {
          label: 'Add Entry',
          active: isJournal && journalTab === 'editor',
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
  const isJournalContext = ['/journal', '/insights'].includes(location.pathname)
  const { avatarUrl } = useAuthStore()

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
      'inline-flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap leading-none pb-[3px] shrink-0 !rounded-none bg-transparent',
      active
        ? 'text-[#0C1629] border-b-2 border-[#0C1629]'
        : 'text-[#727A84] hover:text-[#0C1629]'
    )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top App Bar */}
        <header className="w-full bg-background/80 backdrop-blur-xl sticky top-0 z-40 shrink-0 border-b border-[#F0F3F3]">
          <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-4 md:py-5 flex justify-between items-center gap-3">

            <div className="flex items-center gap-4 md:gap-10 min-w-0 flex-1">
              {/* Section title */}
              <span className="text-lg md:text-xl font-black tracking-tight shrink-0 text-[#0C1629]">
                {title}
              </span>

              {/* Sub-tabs — only when the section has them */}
              {tabs && (
                <nav className="flex items-center gap-5 md:gap-7 overflow-x-auto scrollbar-hide">
                  {tabs.map(({ label, active, path, onClick, isAction, compact, icon: Icon }) => (
                    isAction ? (
                      <button
                        key={label}
                        onClick={onClick}
                        className="inline-flex items-center gap-1.5 bg-[#0C1629] hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {Icon ? <Icon size={14} className="shrink-0" /> : <Plus size={14} className="shrink-0" />}
                        {label}
                      </button>
                    ) : (
                      <button
                        key={label}
                        onClick={() => path && navigate(path)}
                        className={tabClass(active)}
                      >
                        {Icon && <Icon size={14} weight={active ? 'bold' : 'regular'} className="shrink-0" />}
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
                  className="h-9 w-52 rounded-[15px] border border-[#D6DCE0] bg-white px-4 pr-10 text-sm text-[#0C1629] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#727A84]/50 focus-visible:border-[#0C1629]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C1629]/10"
                  placeholder={isJournalContext ? 'Search entries…' : 'Search…'}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#727A84] opacity-40 pointer-events-none" />
              </div>

              {/* Avatar + profile popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-8 h-8 md:w-9 md:h-9 !rounded-full bg-[#F0F3F3] cursor-pointer active:scale-95 transition-transform flex items-center justify-center shrink-0 hover:bg-[#c8d1d2] overflow-hidden border border-[#F0F3F3]"
                    aria-label="Account"
                  >
                    <User size={15} className="text-[#727A84]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-60">
                  <PopoverHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-[#F0F3F3]">
                          <User size={16} className="text-[#727A84]" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <PopoverTitle className="truncate">
                          {(user?.user_metadata?.full_name as string) || 'My Account'}
                        </PopoverTitle>
                        <PopoverDescription className="truncate">{user?.email}</PopoverDescription>
                      </div>
                    </div>
                  </PopoverHeader>
                  <PopoverBody className="space-y-0.5">
                    <button
                      onClick={() => navigate('/account')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0C1629] hover:bg-[#F0F3F3] transition-colors cursor-pointer"
                      style={{ borderRadius: 10 }}
                    >
                      <User size={14} className="text-[#727A84]" /> View Profile
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0C1629] hover:bg-[#F0F3F3] transition-colors cursor-pointer"
                      style={{ borderRadius: 10 }}
                    >
                      <Settings size={14} className="text-[#727A84]" /> Settings
                    </button>
                    <button
                      onClick={() => navigate('/docs')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0C1629] hover:bg-[#F0F3F3] transition-colors cursor-pointer"
                      style={{ borderRadius: 10 }}
                    >
                      <FileText size={14} className="text-[#727A84]" /> Docs
                    </button>
                  </PopoverBody>
                  <PopoverFooter>
                    <button
                      onClick={() => useAuthStore.getState().signOut()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#727A84] hover:text-[#0C1629] hover:bg-[#F0F3F3] border border-[#F0F3F3] transition-colors cursor-pointer"
                      style={{ borderRadius: 10 }}
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </PopoverFooter>
                </PopoverContent>
              </Popover>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-[#F0F3F3] flex items-center justify-around px-2 py-2">
        {mobileNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all',
                isActive ? 'text-[#0C1629]' : 'text-[#B5C1C8]'
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
