import { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Show journal-context nav on journal, analysis, and insights routes
  const isJournalContext = ['/journal', '/analysis', '/insights'].includes(location.pathname)
  const isJournal = location.pathname === '/journal'
  const journalTab = new URLSearchParams(location.search).get('tab') || 'dashboard'

  // Derive initials from user metadata or email
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

  // Single nav-item class factory — works for both button tabs and route tabs
  const tabClass = (active: boolean) =>
    cn(
      'text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap leading-none pb-[3px]',
      active
        ? 'text-[#0061aa] border-b-2 border-[#0061aa]'
        : 'text-[#586062] hover:text-[#0061aa]'
    )

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f9f9]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top App Bar */}
        <header className="w-full bg-[#f9f9f9]/80 backdrop-blur-xl sticky top-0 z-40 shrink-0 border-b border-[#f2f4f4]">
          <div className="max-w-[1400px] mx-auto px-12 py-5 flex justify-between items-center">

            <div className="flex items-center gap-10">
              {/* Brand / page title */}
              <span className={cn(
                'text-xl font-black tracking-tight shrink-0',
                isJournalContext ? 'text-[#2d3435]' : 'text-[#586062]'
              )}>
                {isJournalContext ? 'Journal' : 'Serene'}
              </span>

              {/* Nav links */}
              <nav className="hidden md:flex items-center gap-7">
                {isJournalContext ? (
                  <>
                    <button
                      onClick={() => navigate('/journal')}
                      className={tabClass(isJournal && journalTab === 'dashboard')}
                    >Overview</button>
                    <button
                      onClick={() => navigate('/journal?tab=journal')}
                      className={tabClass(isJournal && journalTab === 'journal')}
                    >All Entries</button>
                    <button
                      onClick={() => navigate('/journal?tab=calendar')}
                      className={tabClass(isJournal && journalTab === 'calendar')}
                    >Calendar</button>
                    <button
                      onClick={() => navigate('/journal?tab=templates')}
                      className={tabClass(isJournal && journalTab === 'templates')}
                    >Templates</button>
                    <button
                      onClick={() => navigate('/analysis')}
                      className={tabClass(location.pathname === '/analysis')}
                    >Analysis</button>
                    <button
                      onClick={() => navigate('/insights')}
                      className={tabClass(location.pathname === '/insights')}
                    >Insights</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/')}
                      className={tabClass(location.pathname === '/')}
                    >Overview</button>
                    <button
                      onClick={() => navigate('/analysis')}
                      className={tabClass(location.pathname === '/analysis')}
                    >Analysis</button>
                    <button
                      onClick={() => navigate('/insights')}
                      className={tabClass(location.pathname === '/insights')}
                    >Insights</button>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* New Entry button — only on /journal */}
              {isJournal && (
                <button
                  onClick={() => navigate('/journal', { state: { openNew: true } })}
                  className="flex items-center gap-1.5 bg-[#0061aa] hover:bg-[#005596] text-white text-sm font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer shrink-0"
                >
                  <Plus size={14} />New Entry
                </button>
              )}

              {/* Search */}
              <div className="relative hidden lg:block">
                <input
                  className="bg-[#f2f4f4] border-none rounded-full py-2.5 pl-5 pr-10 w-52 focus:ring-2 focus:ring-[#0061aa]/20 focus:bg-white transition-all outline-none text-sm text-[#2d3435] placeholder:text-[#586062] placeholder:opacity-40"
                  placeholder={isJournalContext ? 'Search entries…' : 'Search…'}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#586062] opacity-40 pointer-events-none" />
              </div>

              {/* Avatar with real initials */}
              <button
                onClick={() => navigate('/account')}
                className="w-9 h-9 rounded-full bg-[#dde4e5] cursor-pointer active:scale-95 transition-transform flex items-center justify-center shrink-0"
                aria-label="Account settings"
              >
                <span className="text-xs font-bold text-[#586062]">{initials}</span>
              </button>
            </div>

          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
