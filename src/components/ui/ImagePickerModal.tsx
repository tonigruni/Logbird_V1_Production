import { useState, useEffect, useRef } from 'react'
import { X, MagnifyingGlass, Image } from '@phosphor-icons/react'

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY as string | undefined

interface PexelsPhoto {
  id: number
  src: { medium: string; large: string }
  photographer: string
  alt: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
  initialQuery?: string
}

const SUGGESTED = ['nature', 'technology', 'business', 'creative', 'wellness', 'architecture', 'minimal', 'abstract']

export default function ImagePickerModal({ open, onClose, onSelect, initialQuery = 'abstract' }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [photos, setPhotos] = useState<PexelsPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      search(initialQuery)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function search(q: string = query) {
    if (!q.trim() || !PEXELS_API_KEY) return
    setLoading(true)
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=21&orientation=landscape`,
        { headers: { Authorization: PEXELS_API_KEY } }
      )
      const data = await res.json()
      setPhotos(data.photos ?? [])
      setSearched(true)
    } catch {
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[15px] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden mx-4">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f2f4f4]">
          <Image size={18} className="text-[#5a6061] shrink-0" />
          <h2 className="text-sm font-bold text-[#1F3649] flex-1">Choose Cover Image</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#f2f4f4] rounded-[8px] transition-colors cursor-pointer"
          >
            <X size={16} className="text-[#5a6061]" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-[#f2f4f4] space-y-2.5">
          <div className="flex items-center gap-2 bg-[#F7F8F9] rounded-[10px] px-3 py-2.5">
            <MagnifyingGlass size={15} className="text-[#adb3b4] shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Search free photos..."
              className="flex-1 text-sm text-[#1F3649] placeholder-[#adb3b4] bg-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); search(s) }}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#f2f4f4] text-[#5a6061] hover:bg-[#1F3649]/10 hover:text-[#1F3649] transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {!PEXELS_API_KEY ? (
            <div className="text-center py-12 space-y-1">
              <p className="text-sm font-semibold text-[#1F3649]">Pexels API key not configured</p>
              <p className="text-xs text-[#adb3b4]">Add VITE_PEXELS_API_KEY to your .env file</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-[#1F3649] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : photos.length === 0 && searched ? (
            <div className="text-center py-12 text-sm text-[#adb3b4]">
              No photos found for "{query}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => { onSelect(photo.src.large); onClose() }}
                  className="relative group rounded-[10px] overflow-hidden aspect-video cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F3649]"
                >
                  <img
                    src={photo.src.medium}
                    alt={photo.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-end p-1.5">
                    <span className="text-[9px] text-white/0 group-hover:text-white/80 transition-colors truncate max-w-full leading-tight">
                      {photo.photographer}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pexels attribution (required) */}
        <div className="px-5 py-2.5 border-t border-[#f2f4f4] flex items-center gap-1.5">
          <span className="text-[10px] text-[#adb3b4]">Photos provided by</span>
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-[#05A081] hover:underline"
          >
            Pexels
          </a>
        </div>
      </div>
    </div>
  )
}
