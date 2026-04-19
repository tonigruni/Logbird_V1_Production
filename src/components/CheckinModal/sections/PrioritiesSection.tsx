// src/components/CheckinModal/sections/PrioritiesSection.tsx
import { useWheelStore } from '../../../stores/wheelStore'
import { Square } from '@phosphor-icons/react'

export default function PrioritiesSection() {
  const { tasks, toggleTask } = useWheelStore()

  const top3 = tasks
    .filter(t => !t.completed && t.priority === 'urgent')
    .slice(0, 3)

  return (
    <div className="rounded-2xl border border-[#ECEFF2] bg-white p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-[18px] font-bold tracking-tight text-[#2d3435]">Today's top 3</h3>
          <p className="text-[12.5px] text-[#5a6061] mt-0.5">If only these got done, today is a win.</p>
        </div>
      </div>

      {top3.length === 0 ? (
        <p className="text-[13px] text-[#adb3b4] italic py-2">No urgent tasks — breathe.</p>
      ) : (
        <ol className="space-y-1">
          {top3.map((task, idx) => (
            <li key={task.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f7f9fa] transition-colors">
              <div className="w-7 h-7 rounded-[8px] bg-[#f2f4f4] text-[#5a6061] flex items-center justify-center font-bold text-[13px] shrink-0">
                {idx + 1}
              </div>
              <span className="flex-1 text-[15px] font-semibold text-[#2d3435] leading-tight">{task.title}</span>
              <button
                onClick={() => toggleTask(task.id, true)}
                className="text-[#adb3b4] hover:text-[#1F3649] transition-colors cursor-pointer"
                aria-label="Complete task"
              >
                <Square size={20} weight="regular" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
