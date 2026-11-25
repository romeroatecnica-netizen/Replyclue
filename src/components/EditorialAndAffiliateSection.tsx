import { ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { UiLocaleStrings } from '../data/locales';

interface EditorialAndAffiliateSectionProps {
  locale: UiLocaleStrings;
}

export function EditorialAndAffiliateSection({
  locale,
}: EditorialAndAffiliateSectionProps) {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  return (
    <div className="no-print flex flex-col gap-10">
      {/* Contextual Affiliate Gear & Workflow Resources */}
      <section
        aria-labelledby="affiliate-heading"
        className="rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="affiliate-heading"
              className="font-display text-lg font-semibold text-slate-900"
            >
              {locale.affiliateSection.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{locale.affiliateSection.subtitle}</p>
          </div>
          <p className="text-[11px] text-slate-500">{locale.affiliateSection.disclosure}</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locale.affiliateSection.items.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-[#F8FAFC] p-4 transition-colors hover:border-blue-300 hover:bg-white"
            >
              <div>
                <p className="text-xs font-medium text-slate-500">{item.category}</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-[#2563EB]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB]">
                <span>{locale.affiliateSection.ctaLabel}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Editorial SEO Guide & Interactive FAQ */}
      <section
        id="guide"
        aria-labelledby="editorial-guide-heading"
        className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"
      >
        <div className="max-w-3xl">
          <h2
            id="editorial-guide-heading"
            className="font-display text-2xl font-semibold tracking-tight text-slate-900"
            style={{ textWrap: 'balance' }}
          >
            {locale.editorialSection.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {locale.editorialSection.subtitle}
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {locale.editorialSection.pillars.map((pillar, idx) => (
            <div key={idx} className="border-t border-slate-200 pt-4">
              <h3 className="font-display text-base font-semibold text-slate-900">
                <span className="font-mono-num me-2 text-xs text-slate-400">
                  0{idx + 1}.
                </span>
                {pillar.title}
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-600">
                {pillar.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <h3 className="font-display text-lg font-semibold text-slate-900">
            {locale.editorialSection.faqTitle}
          </h3>
          <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-[#F8FAFC]">
            {locale.editorialSection.faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="px-4 py-3.5">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 text-start text-sm font-medium text-slate-900"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{faq.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
