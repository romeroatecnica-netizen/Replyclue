import type { IllustrationKind, RiskLevel } from '../types/replycue';

interface ReplySceneIllustrationProps {
  kind: IllustrationKind;
  risk: RiskLevel;
  steps: [string, string, string];
  label: string;
}

export function ReplySceneIllustration({
  kind,
  risk,
  steps,
  label,
}: ReplySceneIllustrationProps) {
  const accentColor =
    risk === 'high' ? '#D97706' : kind === 'review-positive' || kind === 'personal-note' ? '#059669' : '#2563EB';
  const accentSoft =
    risk === 'high' ? '#FEF3C7' : kind === 'review-positive' || kind === 'personal-note' ? '#D1FAE5' : '#DBEAFE';

  return (
    <figure
      className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4"
      aria-label={label}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <svg
          viewBox="0 0 360 112"
          className="h-24 w-full max-w-[360px] shrink-0"
          role="img"
          aria-hidden="true"
        >
          {/* Base architectural grid lines */}
          <rect x="1" y="1" width="358" height="110" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

          {/* Node 1: Incoming Cue */}
          <rect x="16" y="22" width="84" height="68" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <line x1="28" y1="38" x2="72" y2="38" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="49" x2="86" y2="49" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="59" x2="66" y2="59" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          {kind === 'review-positive' && (
            <path
              d="M78 68l2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8-3.5-3.4 4.8-.7z"
              fill="#059669"
            />
          )}
          {(kind === 'review-negative' || kind === 'review-clarify') && (
            <g>
              <circle cx="79" cy="74" r="8" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />
              <line x1="79" y1="70" x2="79" y2="75" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="79" cy="78.5" r="1" fill="#D97706" />
            </g>
          )}
          {(kind === 'sales-quote' || kind === 'sales-order') && (
            <rect x="64" y="68" width="24" height="12" rx="3" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1" />
          )}
          {(kind === 'work-deadline' || kind === 'work-boundary') && (
            <circle cx="78" cy="74" r="7.5" fill="none" stroke="#2563EB" strokeWidth="1.4" />
          )}
          {(kind === 'chat-support' || kind === 'social-public' || kind === 'personal-note') && (
            <circle cx="78" cy="74" r="6" fill={accentSoft} stroke={accentColor} strokeWidth="1.2" />
          )}

          {/* Connector 1 -> 2 */}
          <line x1="100" y1="56" x2="128" y2="56" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M125 52l5 4-5 4" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Node 2: Guardrail & Tone Filter */}
          <rect x="134" y="18" width="92" height="76" rx="6" fill={accentSoft} stroke={accentColor} strokeWidth="1.4" />
          <circle cx="152" cy="36" r="5" fill={accentColor} />
          <line x1="164" y1="36" x2="212" y2="36" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="146" y="49" width="68" height="12" rx="3" fill="#FFFFFF" stroke={accentColor} strokeOpacity="0.4" strokeWidth="1" />
          <line x1="154" y1="55" x2="198" y2="55" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <rect x="146" y="67" width="68" height="12" rx="3" fill="#FFFFFF" stroke={accentColor} strokeOpacity="0.4" strokeWidth="1" />
          <line x1="154" y1="73" x2="188" y2="73" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />

          {/* Connector 2 -> 3 */}
          <line x1="226" y1="56" x2="254" y2="56" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M251 52l5 4-5 4" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Node 3: Clear Outgoing Reply */}
          <rect x="260" y="22" width="84" height="68" rx="6" fill="#FFFFFF" stroke="#059669" strokeWidth="1.4" />
          <line x1="272" y1="38" x2="320" y2="38" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="272" y1="49" x2="332" y2="49" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <line x1="272" y1="59" x2="312" y2="59" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="326" cy="74" r="7.5" fill="#D1FAE5" />
          <path
            d="M322.5 74l2.3 2.3 4.7-4.6"
            fill="none"
            stroke="#059669"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <ol className="flex flex-1 flex-col gap-2 text-xs text-slate-700">
          {steps.map((stepText, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="font-mono-num inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-[11px] font-medium text-slate-700">
                0{idx + 1}
              </span>
              <span className="leading-5">{stepText}</span>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
