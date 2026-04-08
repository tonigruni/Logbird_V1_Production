import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-row items-center gap-1.5 relative', className)} {...props} />
}

function PaginationItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('', className)} {...props} />
}

interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
}

function PaginationButton({ className, isActive, ...props }: PaginationButtonProps) {
  return (
    <button
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex h-10 w-10 items-center justify-center text-sm font-semibold transition-all duration-200 cursor-pointer',
        isActive
          ? 'bg-[#1F3649] text-white scale-105'
          : 'text-[#586062] hover:bg-[#f2f4f4] hover:text-[#2d3435]',
        className,
      )}
      style={{ borderRadius: 10 }}
      {...props}
    />
  )
}

function PaginationPrev({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label="Go to previous page"
      className={cn(
        'flex h-10 items-center gap-1.5 px-4 text-sm font-semibold text-[#586062] hover:bg-[#f2f4f4] hover:text-[#2d3435] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        className,
      )}
      style={{ borderRadius: 10 }}
      {...props}
    >
      <ChevronLeft size={15} /> Prev
    </button>
  )
}

function PaginationNext({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label="Go to next page"
      className={cn(
        'flex h-10 items-center gap-1.5 px-4 text-sm font-semibold text-[#586062] hover:bg-[#f2f4f4] hover:text-[#2d3435] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        className,
      )}
      style={{ borderRadius: 10 }}
      {...props}
    >
      Next <ChevronRight size={15} />
    </button>
  )
}

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-10 w-10 items-center justify-center text-[#adb3b4]', className)}
    {...props}
  >
    <MoreHorizontal size={16} />
  </span>
)

export { Pagination, PaginationContent, PaginationItem, PaginationButton, PaginationPrev, PaginationNext, PaginationEllipsis }
