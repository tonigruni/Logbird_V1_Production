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
  gradientFrom = "#0C1629",
  gradientTo = "#2a4a63",
}: ExpandableCardProps) {
  return (
    <div
      onClick={onOpen ?? undefined}
      className={cn(
        "border border-[#F0F3F3] bg-white overflow-hidden",
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
        <p className="text-[10px] font-semibold text-[#0C1629]/50 uppercase tracking-wider mb-0.5">
          {description}
        </p>
        <h3 className="text-sm font-bold text-[#0C1629] leading-snug">{title}</h3>
      </div>

      {/* Preview text — fills remaining space, fades out at bottom */}
      <div className={cn("relative px-3 pt-2 overflow-hidden", fill ? "flex-1 min-h-0" : "pb-3")}>
        <p className="text-xs text-[#727A84] leading-relaxed">{preview}</p>
        {/* Gradient fade + ellipsis hint */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        <p className="absolute bottom-2 right-3 text-[10px] text-[#B5C1C8] font-medium">...</p>
      </div>
    </div>
  );
}
