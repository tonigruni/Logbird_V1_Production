import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWheelStore } from '../stores/wheelStore'
import { useAuthStore } from '../stores/authStore'
import GoalDetailView from '../components/GoalDetailView'

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { goals, fetchAll } = useWheelStore()

  useEffect(() => {
    if (user) fetchAll(user.id)
  }, [user?.id])

  const goal = goals.find(g => g.id === id)

  if (!goal) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        Goal not found.
      </div>
    )
  }

  return (
    <div className="pb-24">
      <GoalDetailView goal={goal} onClose={() => navigate('/goals')} />
    </div>
  )
}
