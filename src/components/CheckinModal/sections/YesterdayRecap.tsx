// src/components/CheckinModal/sections/YesterdayRecap.tsx
import { useWheelStore } from '../../../stores/wheelStore'
import { useAuthStore }  from '../../../stores/authStore'

export default function YesterdayRecap() {
  const { checkins, tasks, updateTask } = useWheelStore()
  const { user } = useAuthStore()

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const lastCheckin = checkins.find(c => c.date === yesterdayStr)
  const yesterdayTasks  = tasks.filter(t => t.due_date === yesterdayStr)
  const completedCount  = yesterdayTasks.filter(t => t.completed).length
  const carryOvers      = yesterdayTasks.filter(t => !t.completed)

  if (!lastCheckin && yesterdayTasks.length === 0) return null

  const today = new Date().toISOString().split('T')[0]
  const promote = (id: string) => updateTask(id, { due_date: today })

  const moodLabel = lastCheckin?.mood_words?.slice(0, 2).join(', ') ?? null

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5">
      <div className="text-[10px] font-bold tracking-[0.14em] text-[#adb3b4] uppercase mb-3">
        Yesterday, briefly
      </div>
      <div className="flex gap-4 items-start mb-4">
        <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-[#e4e9ea] to-[#f2f4f4] flex flex-col items-center justify-center shrink-0">
          <span className="font-extrabold text-[20px] text-[#1F3649] leading-none">{completedCount}</span>
          <span className="text-[9px] text-[#5a6061] font-semibold">of {yesterdayTasks.length}</span>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#2d3435]">
            {completedCount === yesterdayTasks.length && yesterdayTasks.length > 0
              ? 'All done — clean slate today.'
              : `${yesterdayTasks.length - completedCount} tasks carried over.`}
          </p>
          {moodLabel && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-bold text-[#adb3b4] uppercase tracking-wider">Mood:</span>
              <span className="text-[11.5px] font-semibold text-[#2d3435] bg-[#f2f4f4] px-2.5 py-0.5 rounded-full">
                {moodLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {carryOvers.length > 0 && (
        <div className="border-t border-[#ECEFF2] pt-3">
          <div className="text-[10px] font-bold text-[#adb3b4] uppercase tracking-wider mb-2">Carry-overs</div>
          {carryOvers.map(t => (
            <div key={t.id} className="flex items-center gap-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#adb3b4] shrink-0" />
              <span className="flex-1 text-[13px] text-[#2d3435]">{t.title}</span>
              <button
                onClick={() => promote(t.id)}
                className="text-[11.5px] font-semibold text-[#1F3649] hover:underline cursor-pointer shrink-0"
              >
                Move to today →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
