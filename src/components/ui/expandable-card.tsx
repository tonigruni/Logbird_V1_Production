import { cn } from "../../lib/utils";

interface ExpandableCardProps {
  title: string;
  description: string;
  preview: string;
  onOpen?: () => void;
  /** When true the card stretches to fill its container (flex-1) */
  fill?: boolean;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function ExpandableCard({
  title,
  description,
  preview,
  onOpen,
  fill,
  className,
  gradientFrom = "#1F3649",
  gradientTo = "#2a4a63",
}: ExpandableCardProps) {
  return (
    <div
      onClick={onOpen ?? undefined}
      className={cn(
        "border border-[#f2f4f4] bg-white overflow-hidden",
        fill ? "flex flex-col flex-1 min-h-0" : "mb-2",
        onOpen && "hover:bg-[#f9f9f8] transition-colors cursor-pointer",
        className,
      )}
      style={{ borderRadius: 12 }}
    >
      {/* Header band */}
      <div
        className="px-3 pt-3 pb-2.5 shrink-0"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}12, ${gradientTo}08)` }}
      >
        <p className="text-[10px] font-semibold text-[#1F3649]/50 uppercase tracking-wider mb-0.5">
          {description}
        </p>
        <h3 className="text-sm font-bold text-[#2d3435] leading-snug">{title}</h3>
      </div>

      {/* Preview text — fills remaining space, fades out at bottom */}
      <div className={cn("relative px-3 pt-2 overflow-hidden", fill ? "flex-1 min-h-0" : "pb-3")}>
        <p className="text-xs text-[#5a6061] leading-relaxed">{preview}</p>
        {/* Gradient fade + ellipsis hint */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        <p className="absolute bottom-2 right-3 text-[10px] text-[#adb3b4] font-medium">...</p>
      </div>
    </div>
  );
}
