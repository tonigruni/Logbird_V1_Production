import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '../../lib/utils'

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error('useChart must be used within a <ChartContainer />')
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          '[&_.recharts-polar-grid_[stroke="#ccc"]]:stroke-[#f2f4f4] [&_.recharts-cartesian-axis-tick_text]:fill-[#5a6061] flex justify-center text-xs',
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  hideLabel = false,
  label,
  nameKey,
  color,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  return (
    <div className={cn('bg-white grid min-w-[8rem] items-start gap-1.5 rounded-xl border border-[#f2f4f4] px-2.5 py-1.5 text-xs shadow-xl', className)}>
      {!hideLabel && label && (
        <div className="font-semibold text-[#1F3649]">
          {config[label as string]?.label ?? label}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`
          const itemConfig = config[key]
          const indicatorColor = color || itemConfig?.color || (item.payload as Record<string, string>).fill || item.color
          return (
            <div key={item.dataKey as string} className="flex w-full items-center gap-2">
              <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: indicatorColor }} />
              <div className="flex flex-1 justify-between items-center">
                <span className="text-[#5a6061]">{itemConfig?.label ?? item.name}</span>
                {item.value !== undefined && (
                  <span className="text-[#1F3649] font-semibold tabular-nums ml-3">{Number(item.value)}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
