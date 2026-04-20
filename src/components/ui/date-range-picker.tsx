import {
  DateRangePicker,
  DatePicker,
  DateInput,
  DateSegment,
  Group,
  Button,
  Popover,
  Dialog,
  RangeCalendar,
  Calendar,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarCell,
  Heading,
  Label,
  type DateValue,
} from 'react-aria-components'
import {
  parseDate,
  CalendarDate,
} from '@internationalized/date'
import { useLocale } from 'react-aria'
import { CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DateRange {
  start: string | null
  end: string | null
}

interface LogbirdDateRangePickerProps {
  label?: string
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Helper: string ↔ CalendarDate
// ---------------------------------------------------------------------------

function toCalendarDate(str: string | null): CalendarDate | undefined {
  if (!str) return undefined
  try {
    const parsed = parseDate(str)
    return parsed
  } catch {
    return undefined
  }
}

function fromCalendarDate(d: DateValue | null | undefined): string | null {
  if (!d) return null
  return d.toString()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LogbirdDateRangePicker({
  label,
  value,
  onChange,
  className,
}: LogbirdDateRangePickerProps) {
  const { locale } = useLocale()
  const start = toCalendarDate(value.start)
  const end = toCalendarDate(value.end)

  const ariaValue =
    start && end
      ? { start, end }
      : undefined

  return (
    <DateRangePicker
      value={ariaValue ?? null}
      onChange={(range) => {
        onChange({
          start: fromCalendarDate(range?.start),
          end: fromCalendarDate(range?.end),
        })
      }}
      className={cn('w-full', className)}
    >
      {label && (
        <Label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block mb-1.5">
          {label}
        </Label>
      )}

      {/* Trigger group */}
      <Group className="flex items-center w-full bg-white border border-[#E4E9EC] rounded-[12px] px-3 py-2.5 gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-[#1F3649]/10 transition-shadow">
        <CalendarBlank size={14} className="text-[#adb3b4] shrink-0" />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <DateInput
            slot="start"
            className="flex gap-0.5 text-sm font-semibold text-[#1F3649]"
          >
            {(segment) => (
              <DateSegment
                segment={segment}
                className="px-0.5 rounded focus:bg-[#1F3649]/[0.07] outline-none tabular-nums"
              />
            )}
          </DateInput>
          <span className="text-[#adb3b4] text-sm shrink-0">–</span>
          <DateInput
            slot="end"
            className="flex gap-0.5 text-sm font-semibold text-[#1F3649]"
          >
            {(segment) => (
              <DateSegment
                segment={segment}
                className="px-0.5 rounded focus:bg-[#1F3649]/[0.07] outline-none tabular-nums"
              />
            )}
          </DateInput>
        </div>
        <Button className="shrink-0 p-0.5 rounded-[6px] text-[#adb3b4] hover:text-[#1F3649] hover:bg-[#f2f4f4] transition-colors outline-none cursor-pointer">
          <CalendarBlank size={14} />
        </Button>
      </Group>

      {/* Calendar popover */}
      <Popover
        className={cn(
          'mt-2 z-50 shadow-xl rounded-[18px] overflow-hidden',
          'border border-[#E4E9EC] bg-white',
          'entering:animate-in entering:fade-in entering:zoom-in-95',
          'exiting:animate-out exiting:fade-out exiting:zoom-out-95'
        )}
      >
        <Dialog className="p-4 outline-none">
          <RangeCalendar
            className="w-full"
            visibleDuration={{ months: 1 }}
          >
            {/* Header */}
            <header className="flex items-center justify-between mb-4">
              <Button
                slot="previous"
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5a6061] hover:bg-[#f2f4f4] hover:text-[#1F3649] transition-colors outline-none cursor-pointer"
              >
                <CaretLeft size={14} weight="bold" />
              </Button>
              <Heading className="text-sm font-bold text-[#1F3649]" />
              <Button
                slot="next"
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5a6061] hover:bg-[#f2f4f4] hover:text-[#1F3649] transition-colors outline-none cursor-pointer"
              >
                <CaretRight size={14} weight="bold" />
              </Button>
            </header>

            <CalendarGrid>
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider w-9 h-8 text-center">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    date={date}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-[8px] cursor-pointer outline-none transition-colors',
                      'text-[#1F3649]',
                      'hover:bg-[#f2f4f4]',
                      // today
                      'data-[today]:font-black data-[today]:underline data-[today]:decoration-[#1F3649]/40',
                      // outside month
                      'data-[outside-visible-range]:text-[#ebeeef]',
                      // disabled
                      'data-[disabled]:text-[#ebeeef] data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent',
                      // unavailable (weekends etc)
                      'data-[unavailable]:line-through data-[unavailable]:text-[#ebeeef]',
                      // selection range
                      'data-[selected]:bg-[#1F3649]/10',
                      // range start/end caps
                      'data-[selection-start]:bg-[#1F3649] data-[selection-start]:text-white data-[selection-start]:rounded-[8px]',
                      'data-[selection-end]:bg-[#1F3649] data-[selection-end]:text-white data-[selection-end]:rounded-[8px]',
                      // focused
                      'data-[focused]:ring-2 data-[focused]:ring-[#1F3649]/20'
                    )}
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </RangeCalendar>
        </Dialog>
      </Popover>
    </DateRangePicker>
  )
}

// ---------------------------------------------------------------------------
// Single-date picker (for tasks, goals, milestones)
// ---------------------------------------------------------------------------

interface LogbirdDatePickerProps {
  label?: string
  value: string | null
  onChange: (value: string | null) => void
  className?: string
  placeholder?: string
}

export function LogbirdDatePicker({
  label,
  value,
  onChange,
  className,
}: LogbirdDatePickerProps) {
  const ariaValue = value ? toCalendarDate(value) : undefined

  return (
    <DatePicker
      value={ariaValue ?? null}
      onChange={(date) => onChange(fromCalendarDate(date))}
      className={cn('w-full', className)}
    >
      {label && (
        <Label className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider block mb-1.5">
          {label}
        </Label>
      )}

      {/* Trigger */}
      <Group className="flex items-center w-full bg-white border border-[#E4E9EC] rounded-[12px] px-3 py-2.5 gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-[#1F3649]/10 transition-shadow">
        <CalendarBlank size={14} className="text-[#adb3b4] shrink-0" />
        <DateInput className="flex gap-0.5 text-sm font-semibold text-[#1F3649] flex-1">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="px-0.5 rounded focus:bg-[#1F3649]/[0.07] outline-none tabular-nums"
            />
          )}
        </DateInput>
        <Button className="shrink-0 p-0.5 rounded-[6px] text-[#adb3b4] hover:text-[#1F3649] hover:bg-[#f2f4f4] transition-colors outline-none cursor-pointer">
          <CalendarBlank size={14} />
        </Button>
      </Group>

      {/* Calendar popover */}
      <Popover
        className={cn(
          'mt-2 z-50 shadow-xl rounded-[18px] overflow-hidden',
          'border border-[#E4E9EC] bg-white',
          'entering:animate-in entering:fade-in entering:zoom-in-95',
          'exiting:animate-out exiting:fade-out exiting:zoom-out-95'
        )}
      >
        <Dialog className="p-4 outline-none">
          <Calendar className="w-full">
            <header className="flex items-center justify-between mb-4">
              <Button
                slot="previous"
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5a6061] hover:bg-[#f2f4f4] hover:text-[#1F3649] transition-colors outline-none cursor-pointer"
              >
                <CaretLeft size={14} weight="bold" />
              </Button>
              <Heading className="text-sm font-bold text-[#1F3649]" />
              <Button
                slot="next"
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5a6061] hover:bg-[#f2f4f4] hover:text-[#1F3649] transition-colors outline-none cursor-pointer"
              >
                <CaretRight size={14} weight="bold" />
              </Button>
            </header>

            <CalendarGrid>
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider w-9 h-8 text-center">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    date={date}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-[8px] cursor-pointer outline-none transition-colors',
                      'text-[#1F3649]',
                      'hover:bg-[#f2f4f4]',
                      'data-[today]:font-black data-[today]:underline data-[today]:decoration-[#1F3649]/40',
                      'data-[outside-visible-range]:text-[#ebeeef]',
                      'data-[disabled]:text-[#ebeeef] data-[disabled]:cursor-not-allowed data-[disabled]:hover:bg-transparent',
                      'data-[selected]:bg-[#1F3649] data-[selected]:text-white',
                      'data-[focused]:ring-2 data-[focused]:ring-[#1F3649]/20'
                    )}
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </DatePicker>
  )
}
