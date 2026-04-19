// src/components/CheckinModal/sections/HabitsSection.tsx
import { Flame, Gear } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

// Placeholder: habits are read from DB in future sprint.
// For now, the section shows an empty state prompting the user to configure habits.
// When habits exist, this will map over them with toggle functionality.

interface HabitsSectionProps {
  onClose: () => void
}

export default function HabitsSection({ onClose }: HabitsSectionProps) {
  const navigate = useNavigate()

  const openSettings = () => {
    onClose()
    navigate('/settings')
  }

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5">
      <div className="text-[10px] font-bold tracking-[0.14em] text-[#adb3b4] uppercase mb-3 flex items-center gap-1.5">
        <Flame size={12} className="text-amber-400" />
        Habit streaks
      </div>
      <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-[#f2f4f4] flex items-center justify-center">
          <Flame size={20} className="text-[#adb3b4]" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#2d3435]">No habits configured yet</p>
          <p className="text-[12.5px] text-[#5a6061] mt-1 max-w-[200px]">
            Add habits in Settings to start tracking your streaks here.
          </p>
        </div>
        <button
          onClick={openSettings}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[#ECEFF2] text-[#5a6061] hover:bg-[#f7f9fa] transition-colors cursor-pointer"
        >
          <Gear size={13} /> Open Settings
        </button>
      </div>
    </div>
  )
}
