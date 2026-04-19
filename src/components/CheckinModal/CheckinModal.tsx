import { useEffect, useState, useCallback } from 'react'
import { X } from '@phosphor-icons/react'
import { useCheckin } from '../../context/CheckinContext'

const STORAGE_KEY = 'logbird_checkin_last_opened'
const PAGE_LABELS = ['Check-in', 'Mind', 'Goals', 'Today'] as const

// Lazy imports — replaced with real pages in later tasks
import PageCheckin from './pages/PageCheckin'
import PageMind    from './pages/PageMind'
import PageGoals   from './pages/PageGoals'
import PageToday   from './pages/PageToday'

export default function CheckinModal() {
  const { isOpen, openCheckin, closeCheckin } = useCheckin()
  const [page, setPage] = useState(0)
  const [checkinId, setCheckinId] = useState<string | null>(null)

  // Auto-open once per day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const last  = localStorage.getItem(STORAGE_KEY)
    if (last !== today) {
      localStorage.setItem(STORAGE_KEY, today)
      openCheckin()
    }
  }, [openCheckin])

  const goNext = useCallback(() => setPage(p => Math.min(PAGE_LABELS.length - 1, p + 1)), [])
  const goBack = useCallback(() => setPage(p => Math.max(0, p - 1)), [])
  const handleClose = useCallback(() => {
    closeCheckin()
    setPage(0)
  }, [closeCheckin])

  if (!isOpen) return null

  const isLast = page === PAGE_LABELS.length - 1

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* ── Sticky header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#ECEFF2] shrink-0">
          <div className="flex items-center gap-3">
            {PAGE_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => setPage(i)}
                className="flex items-center gap-2 group"
                aria-label={`Go to ${label}`}
              >
                <span
                  className={[
                    'block rounded-full transition-all duration-200',
                    i === page
                      ? 'w-5 h-2 bg-[#1F3649]'
                      : i < page
                      ? 'w-2 h-2 bg-[#1F3649]/35'
                      : 'w-2 h-2 bg-[#ECEFF2]',
                  ].join(' ')}
                />
              </button>
            ))}
            <span className="ml-1 text-[10px] font-bold text-[#adb3b4] tracking-[0.12em] uppercase">
              {PAGE_LABELS[page]}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#adb3b4] hover:text-[#2d3435] hover:bg-[#f2f4f4] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable page content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {page === 0 && (
            <PageCheckin
              onCheckinCreated={(id) => setCheckinId(id)}
              checkinId={checkinId}
            />
          )}
          {page === 1 && <PageMind checkinId={checkinId} />}
          {page === 2 && <PageGoals onClose={handleClose} />}
          {page === 3 && <PageToday onClose={handleClose} />}
        </div>

        {/* ── Sticky footer nav ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#ECEFF2] shrink-0">
          <button
            onClick={goBack}
            disabled={page === 0}
            className="text-sm font-semibold text-[#5a6061] hover:text-[#2d3435] transition-colors disabled:opacity-0"
          >
            ← Back
          </button>
          <button
            onClick={isLast ? handleClose : goNext}
            className="px-5 py-2.5 rounded-xl bg-[#1F3649] text-white text-sm font-bold hover:bg-[#162838] transition-colors"
          >
            {isLast ? 'Start my day →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
