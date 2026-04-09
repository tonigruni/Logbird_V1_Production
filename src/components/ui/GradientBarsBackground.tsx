interface Props {
  barCount?: number
  barColor?: string
  animate?: boolean
}

export default function GradientBarsBackground({ barCount = 12, barColor = 'rgba(255,255,255,0.22)', animate = false }: Props) {
  const bars = Array.from({ length: barCount })

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
            background: `linear-gradient(to top, ${barColor}, transparent)`,
            height: `${40 + (i % 5) * 12}%`,
            transformOrigin: 'bottom',
            ...(animate && {
              animation: `gradientBarPulse ${3.5 + (i % 4) * 0.4}s ease-in-out infinite`,
              animationDelay: `${(i * 0.18) % 2}s`,
            }),
          }}
        />
      ))}
    </div>
  )
}
