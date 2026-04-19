import PrioritiesSection    from '../sections/PrioritiesSection'
import CheckinTasksGrouped  from '../sections/CheckinTasksGrouped'
import WheelNudge           from '../sections/WheelNudge'
import YesterdayRecap       from '../sections/YesterdayRecap'

interface PageTodayProps {
  onClose: () => void
}

export default function PageToday({ onClose }: PageTodayProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[20px] font-bold tracking-tight text-[#2d3435] mb-0.5">Shape your day</h2>
        <p className="text-[13px] text-[#5a6061]">What matters today, and what to carry forward.</p>
      </div>

      <YesterdayRecap />
      <WheelNudge onClose={onClose} />
      <PrioritiesSection />
      <CheckinTasksGrouped />
    </div>
  )
}
