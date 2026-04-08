import * as React from 'react'
import {
  add, eachDayOfInterval, endOfMonth, endOfWeek,
  format, getDay, isEqual, isSameDay, isSameMonth,
  isToday, parse, startOfToday, startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { useMediaQuery } from '../../hooks/use-media-query'

export interface CalendarEvent {
  id: string
  name: string
  time?: string
}

export interface CalendarDay {
  day: Date
  events: CalendarEvent[]
}

interface FullScreenCalendarProps {
  data: CalendarDay[]
  onDayClick?: (day: Date) => void
}

const colStartClasses = ['', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7']

export function FullScreenCalendar({ data, onDayClick }: FullScreenCalendarProps) {
  const today = startOfToday()
  const [selectedDay, setSelectedDay] = React.useState(today)
  const [currentMonth, setCurrentMonth] = React.useState(format(today, 'MMM-yyyy'))
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  })

  const previousMonth = () => setCurrentMonth(format(add(firstDayCurrentMonth, { months: -1 }), 'MMM-yyyy'))
  const nextMonth = () => setCurrentMonth(format(add(firstDayCurrentMonth, { months: 1 }), 'MMM-yyyy'))
  const goToToday = () => { setCurrentMonth(format(today, 'MMM-yyyy')); setSelectedDay(today) }

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    onDayClick?.(day)
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:gap-0 lg:flex-none border-b border-[#f2f4f4]">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-center justify-center min-w-[60px]">
            <span className="text-[10px] uppercase font-semibold text-[#adb3b4]">{format(firstDayCurrentMonth, 'MMM')}</span>
            <span className="text-lg font-black text-[#1F3649] leading-tight">{format(firstDayCurrentMonth, 'yyyy')}</span>
          </div>
          <div>
            <h2 className="text-base font-black text-[#2d3435] tracking-tight">{format(firstDayCurrentMonth, 'MMMM, yyyy')}</h2>
            <p className="text-xs text-[#adb3b4]">
              {format(firstDayCurrentMonth, 'MMM d')} – {format(endOfMonth(firstDayCurrentMonth), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex -space-x-px rounded-[15px] overflow-hidden border border-[#e8eaeb]">
            <Button onClick={previousMonth} variant="outline" size="icon" className="rounded-none border-0 border-r border-[#e8eaeb]">
              <ChevronLeft size={15} />
            </Button>
            <Button onClick={goToToday} variant="outline" className="rounded-none border-0 px-4 text-xs">
              Today
            </Button>
            <Button onClick={nextMonth} variant="outline" size="icon" className="rounded-none border-0 border-l border-[#e8eaeb]">
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="lg:flex lg:flex-auto lg:flex-col">
        {/* Week days header */}
        <div className="grid grid-cols-7 border-b border-[#f2f4f4] text-center text-[11px] font-semibold text-[#adb3b4] uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div key={d} className={cn('py-2.5', i < 6 && 'border-r border-[#f2f4f4]')}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="flex text-xs leading-6 lg:flex-auto">
          {/* Desktop grid */}
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-5">
            {days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                onClick={() => handleDayClick(day)}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  !isSameMonth(day, firstDayCurrentMonth) && 'bg-[#fafafa]',
                  'relative flex flex-col border-b border-r border-[#f2f4f4] hover:bg-[#f9f9f8] cursor-pointer transition-colors min-h-[140px]',
                )}
              >
                <header className="flex items-center justify-between p-2">
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleDayClick(day) }}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                      isEqual(day, selectedDay) && isToday(day) && 'bg-[#1F3649] text-white',
                      isEqual(day, selectedDay) && !isToday(day) && 'bg-[#1F3649] text-white',
                      isToday(day) && !isEqual(day, selectedDay) && 'bg-[#1F3649]/10 text-[#1F3649]',
                      !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && 'text-[#2d3435] hover:bg-[#f2f4f4]',
                      !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && 'text-[#adb3b4]',
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                </header>
                <div className="flex-1 px-2 pb-2 space-y-1">
                  {data.filter(e => isSameDay(e.day, day)).map(d => (
                    <div key={d.day.toString()}>
                      {d.events.slice(0, 2).map(event => (
                        <div key={event.id} className="flex flex-col rounded-lg bg-[#1F3649]/8 px-2 py-1 text-[10px] leading-tight">
                          <span className="font-semibold text-[#1F3649] truncate">{event.name}</span>
                          {event.time && <span className="text-[#adb3b4]">{event.time}</span>}
                        </div>
                      ))}
                      {d.events.length > 2 && (
                        <div className="text-[10px] text-[#adb3b4] px-1">+{d.events.length - 2} more</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile grid */}
          <div className="isolate grid w-full grid-cols-7 grid-rows-5 lg:hidden">
            {days.map((day, dayIdx) => (
              <button
                key={dayIdx}
                onClick={() => handleDayClick(day)}
                type="button"
                className={cn(
                  'flex h-14 flex-col border-b border-r border-[#f2f4f4] px-2 py-1.5 hover:bg-[#f2f4f4] focus:z-10 transition-colors',
                  !isSameMonth(day, firstDayCurrentMonth) && 'bg-[#fafafa]',
                )}
              >
                <time
                  dateTime={format(day, 'yyyy-MM-dd')}
                  className={cn(
                    'ml-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                    isEqual(day, selectedDay) && 'bg-[#1F3649] text-white',
                    isToday(day) && !isEqual(day, selectedDay) && 'bg-[#1F3649]/10 text-[#1F3649]',
                    !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && 'text-[#2d3435]',
                    !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && 'text-[#adb3b4]',
                  )}
                >
                  {format(day, 'd')}
                </time>
                {data.filter(d => isSameDay(d.day, day)).length > 0 && (
                  <div className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                    {data.filter(d => isSameDay(d.day, day)).flatMap(d => d.events).slice(0, 3).map((_, i) => (
                      <span key={i} className="mx-0.5 mt-0.5 h-1 w-1 rounded-full bg-[#1F3649]" />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
