// src/components/CheckinModal/pages/PageGoals.tsx
import { useNavigate } from 'react-router-dom'
import { Target, Plus } from '@phosphor-icons/react'
import { useWheelStore } from '../../../store/wheelStore'

interface PageGoalsProps {
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-[#1F3649] text-white',
  completed: 'bg-green-100 text-green-700',
  archived:  'bg-[#f2f4f4] text-[#adb3b4]',
}

export default function PageGoals({ onClose }: PageGoalsProps) {
  const navigate = useNavigate()
  const { goals } = useWheelStore()

  const activeGoals = goals.filter(g => g.status === 'active')

  const openGoal = (id: string) => {
    onClose()
    navigate(`/goals/${id}`)
  }

  const createGoal = () => {
    onClose()
    navigate('/goals/new')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight text-[#2d3435]">Your goals</h2>
          <p className="text-[12.5px] text-[#5a6061] mt-0.5">
            {activeGoals.length} active {activeGoals.length === 1 ? 'goal' : 'goals'}
          </p>
        </div>
        <button
          onClick={createGoal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#ECEFF2] text-[13px] font-semibold text-[#5a6061] hover:bg-[#f7f9fa] transition-colors cursor-pointer"
        >
          <Plus size={14} /> New goal
        </button>
      </div>

      {activeGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center rounded-2xl border border-dashed border-[#ECEFF2]">
          <div className="w-12 h-12 rounded-full bg-[#f2f4f4] flex items-center justify-center">
            <Target size={24} className="text-[#adb3b4]" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#2d3435]">No goals yet</p>
            <p className="text-[13px] text-[#5a6061] mt-1">Set your first goal to start tracking progress.</p>
          </div>
          <button
            onClick={createGoal}
            className="px-5 py-2 rounded-xl bg-[#1F3649] text-white text-sm font-bold hover:bg-[#162838] transition-colors cursor-pointer"
          >
            Set a goal →
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeGoals.map(goal => (
            <button
              key={goal.id}
              onClick={() => openGoal(goal.id)}
              className="w-full text-left rounded-2xl border border-[#ECEFF2] bg-white px-5 py-4 hover:border-[#1F3649]/20 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#2d3435] leading-tight truncate">
                    {goal.title}
                  </p>
                  {goal.description && (
                    <p className="text-[12.5px] text-[#5a6061] mt-1 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                  {goal.target_date && (
                    <p className="text-[11px] text-[#adb3b4] mt-2 font-semibold">
                      Due {new Date(goal.target_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <span className={[
                  'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0',
                  STATUS_COLORS[goal.status] ?? STATUS_COLORS.active,
                ].join(' ')}>
                  {goal.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
