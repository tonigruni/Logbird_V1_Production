import * as React from 'react'
import { cn } from '../../lib/utils'

// Wrapper for a sidebar section — p-6 with a bottom divider between sections.
export function SidebarSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 border-b border-[#f2f4f4]', className)}>
      {children}
    </div>
  )
}

// Section heading (e.g. "Details", "Current Mood")
export function SidebarSectionHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-xs font-bold text-[#2d3435] uppercase tracking-wider mb-4', className)}>
      {children}
    </h3>
  )
}

// Small all-caps field label (e.g. "Title", "Category")
export function SidebarFieldLabel({
  children,
  className,
  htmlFor,
}: {
  children: React.ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('text-[10px] font-bold text-[#adb3b4] uppercase tracking-widest block mb-1.5', className)}
    >
      {children}
    </label>
  )
}

// Styled text input — with optional leading icon
interface SidebarInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ElementType
}
export function SidebarInput({ icon: Icon, className, ...props }: SidebarInputProps) {
  if (Icon) {
    return (
      <div className="flex items-center gap-2.5 rounded-[15px] border border-[#e8eaeb] bg-white px-3 py-2.5 shadow-sm shadow-black/5 transition-shadow focus-within:border-[#1F3649]/30 focus-within:ring-[3px] focus-within:ring-[#1F3649]/10">
        <Icon size={14} className="text-[#adb3b4] shrink-0" />
        <input
          className={cn(
            'flex-1 bg-transparent text-sm text-[#2d3435] placeholder:text-[#adb3b4] focus:outline-none min-w-0',
            className,
          )}
          {...props}
        />
      </div>
    )
  }
  return (
    <input
      className={cn(
        'w-full rounded-[15px] border border-[#e8eaeb] bg-white px-3 py-2.5 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#adb3b4] focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10',
        className,
      )}
      {...props}
    />
  )
}

// Styled textarea — matches journal entry prompt fields
export function SidebarTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-[15px] border border-[#e8eaeb] bg-white px-4 py-3 text-sm text-[#2d3435] shadow-sm shadow-black/5 transition-shadow placeholder:text-[#adb3b4]/60 focus-visible:border-[#1F3649]/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#1F3649]/10 resize-none leading-relaxed',
        className,
      )}
      {...props}
    />
  )
}
