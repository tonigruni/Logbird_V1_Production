// src/components/CheckinModal/sections/CheckinTasksGrouped.tsx
import { useState } from 'react'
import { useWheelStore } from '../../../stores/wheelStore'
import { useAuthStore }  from '../../../stores/authStore'
import { Plus, Square } from '@phosphor-icons/react'
import type { TaskPriority } from '../../../stores/wheelStore'

type Group = { key: TaskPriority; label: string; hint: string; pillClass: string }

const GROUPS: Group[] = [
  { key: 'urgent', label: 'Urgent', hint: 'Do these first',        pillClass: 'bg-red-50 text-red-700' },
  { key: 'high',   label: 'High',   hint: 'Important, not fires',  pillClass: 'bg-amber-50 text-amber-700' },
  { key: 'normal', label: 'Normal', hint: 'If time allows',        pillClass: 'bg-[#f2f4f4] text-[#5a6061]' },
]

export default function CheckinTasksGrouped() {
  const { tasks, toggleTask, createTask } = useWheelStore()
  const { user } = useAuthStore()
  const [adding, setAdding] = useState<TaskPriority | null>(null)
  const [draft,  setDraft]  = useState('')

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => !t.completed)

  const addTask = async (priority: TaskPriority) => {
    if (!draft.trim() || !user) { setAdding(null); return }
    await createTask({
      user_id:            user.id,
      title:              draft.trim(),
      priority,
      completed:          false,
      goal_id:            null,
      category_id:        null,
      project_id:         null,
      energy:             2,
      estimated_minutes:  null,
      due_date:           today,
    })
    setDraft('')
    setAdding(null)
  }

  return (
    <div className="space-y-4">
      {GROUPS.map(g => {
        const list = todayTasks.filter(t => t.priority === g.key)
        return (
          <div key={g.key}>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className={['text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', g.pillClass].join(' ')}>
                  {g.label}
                </span>
                <span className="text-[12px] text-[#adb3b4]">{g.hint}</span>
                <span className="text-[11px] text-[#adb3b4]">· {list.length}</span>
              </div>
              <button
                onClick={() => setAdding(g.key)}
                className="text-[12px] font-semibold text-[#5a6061] hover:text-[#2d3435] inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="rounded-2xl border border-[#ECEFF2] bg-white divide-y divide-[#f2f4f4]">
              {list.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f7f9fa] transition-colors">
                  <button
                    onClick={() => toggleTask(task.id, true)}
                    className="text-[#adb3b4] hover:text-[#1F3649] transition-colors cursor-pointer shrink-0"
                  >
                    <Square size={18} />
                  </button>
                  <span className="flex-1 text-[14px] font-medium text-[#2d3435]">{task.title}</span>
                </div>
              ))}

              {adding === g.key && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Square size={18} className="text-[#adb3b4] shrink-0" />
                  <input
                    autoFocus
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addTask(g.key)
                      if (e.key === 'Escape') { setAdding(null); setDraft('') }
                    }}
                    onBlur={() => addTask(g.key)}
                    placeholder={`New ${g.label.toLowerCase()} task — Enter to add`}
                    className="flex-1 text-[14px] text-[#2d3435] bg-transparent border-none outline-none placeholder:text-[#adb3b4]"
                  />
                </div>
              )}

              {list.length === 0 && adding !== g.key && (
                <div className="px-4 py-3 text-[13px] text-[#adb3b4] italic">Nothing here — breathe.</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
