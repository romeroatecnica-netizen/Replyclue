interface AdSlotProps {
  slotId: string;
  placementLabel: string;
  minHeightClass?: string;
}

/**
 * Media.net Ad Container (Reserved height to prevent Cumulative Layout Shift / CLS).
 * Replace the inner placeholder comment/markup with your Media.net <div id="..."> and script tag in production.
 */
export function AdSlot({
  slotId,
  placementLabel,
  minHeightClass = 'min-h-[110px]',
}: AdSlotProps) {
  return (
    <aside
      id={slotId}
      aria-label={placementLabel}
      data-ad-network="media.net"
      className={`no-print mx-auto w-full rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 ${minHeightClass} flex flex-col items-center justify-center text-center`}
    >
      {/* Media.net Ad Placement: Insert Media.net ad unit script for slotId here */}
      <span className="text-[11px] font-medium tracking-wide text-slate-400">
        {placementLabel}
      </span>
    </aside>
  );
}
