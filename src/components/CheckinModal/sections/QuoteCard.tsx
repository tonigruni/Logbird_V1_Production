// src/components/CheckinModal/sections/QuoteCard.tsx

// Static daily quote — rotates by day of year
const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
]

function todaysQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff  = Date.now() - start.getTime()
  const day   = Math.floor(diff / 86_400_000)
  return QUOTES[day % QUOTES.length]
}

export default function QuoteCard() {
  const { text, author } = todaysQuote()
  return (
    <div className="relative rounded-2xl border border-[#ECEFF2] bg-[#f7f9fa] px-7 py-6">
      <div className="absolute top-3 left-5 text-[56px] font-extrabold text-[#dde4e5] leading-none select-none">"</div>
      <p className="relative pl-4 font-semibold text-[17px] leading-[1.45] text-[#2d3435] tracking-[-0.01em]">
        {text}
      </p>
      <p className="mt-2.5 pl-4 text-[11px] text-[#adb3b4] uppercase tracking-[0.1em] font-bold">
        — {author}
      </p>
    </div>
  )
}
