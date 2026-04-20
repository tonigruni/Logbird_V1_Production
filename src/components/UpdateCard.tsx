import { Download, RefreshCw } from 'lucide-react'
import { useUpdater } from '../hooks/useUpdater'

export function UpdateCard() {
  const { available, version, downloading, installUpdate } = useUpdater()

  if (!available) return null

  return (
    <div className="mx-2 mb-3 rounded-xl bg-[#1F3649] p-3 text-white">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
          <Download size={12} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white leading-tight">
            Update available{version ? ` (v${version})` : ''}
          </p>
          <p className="text-[10px] text-white/50 mt-0.5 leading-tight">
            A new version of Logbird is ready
          </p>
        </div>
      </div>
      <button
        onClick={installUpdate}
        disabled={downloading}
        className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-white text-[#1F3649] text-xs font-semibold py-1.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
      >
        {downloading ? (
          <>
            <RefreshCw size={11} className="animate-spin" />
            Installing…
          </>
        ) : (
          <>
            <RefreshCw size={11} />
            Relaunch to update
          </>
        )}
      </button>
    </div>
  )
}
