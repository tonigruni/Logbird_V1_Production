export default function GradientBarsBackground() {
  const bars = Array.from({ length: 12 })

  return (
    <div
      className="absolute inset-0 flex items-end justify-center gap-[3px] overflow-hidden"
      aria-hidden="true"
    >
      {bars.map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-full"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.22), transparent)',
            height: `${45 + (i % 4) * 15}%`,
            animationName: 'gradientBarSlideIn',
            animationDuration: `${0.5 + (i % 4) * 0.1}s`,
            animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            animationFillMode: 'both',
            animationDelay: `${i * 0.04}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes gradientBarSlideIn {
          from { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
          to   { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
        }
      `}</style>
    </div>
  )
}
