import type { LanguageCode, Scenario } from '../types/replycue';

export const CANONICAL_ORIGIN = 'https://replycue.bastelar.com';

export interface LanguageMeta {
  code: LanguageCode;
  nativeLabel: string;
  englishName: string;
  dir: 'ltr' | 'rtl';
  hreflang: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', nativeLabel: 'English', englishName: 'English', dir: 'ltr', hreflang: 'en' },
  { code: 'es', nativeLabel: 'Español', englishName: 'Spanish', dir: 'ltr', hreflang: 'es' },
  { code: 'fr', nativeLabel: 'Français', englishName: 'French', dir: 'ltr', hreflang: 'fr' },
  { code: 'de', nativeLabel: 'Deutsch', englishName: 'German', dir: 'ltr', hreflang: 'de' },
  { code: 'pt', nativeLabel: 'Português', englishName: 'Portuguese', dir: 'ltr', hreflang: 'pt' },
  { code: 'ar', nativeLabel: 'العربية', englishName: 'Arabic', dir: 'rtl', hreflang: 'ar' },
  { code: 'hi', nativeLabel: 'हिन्दी', englishName: 'Hindi', dir: 'ltr', hreflang: 'hi' },
  { code: 'ru', nativeLabel: 'Русский', englishName: 'Russian', dir: 'ltr', hreflang: 'ru' },
  { code: 'zh', nativeLabel: '中文', englishName: 'Chinese', dir: 'ltr', hreflang: 'zh' },
  { code: 'ja', nativeLabel: '日本語', englishName: 'Japanese', dir: 'ltr', hreflang: 'ja' },
];

const LANGUAGE_CODES = new Set<LanguageCode>(SUPPORTED_LANGUAGES.map((l) => l.code));

export function isSupportedLanguage(value: string | null | undefined): value is LanguageCode {
  return Boolean(value && LANGUAGE_CODES.has(value as LanguageCode));
}

export function getLanguageMeta(lang: LanguageCode): LanguageMeta {
  return SUPPORTED_LANGUAGES.find((l) => l.code === lang) ?? SUPPORTED_LANGUAGES[0];
}

export function getCanonicalUrl(lang: LanguageCode): string {
  return lang === 'en' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}/?lang=${lang}`;
}

export function detectInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get('lang')?.toLowerCase();
    if (isSupportedLanguage(queryLang)) {
      return queryLang;
    }
    const stored = window.localStorage.getItem('replycue_lang_v1');
    if (isSupportedLanguage(stored)) {
      return stored;
    }
    const navLang = (navigator.language || 'en').toLowerCase().split('-')[0];
    if (isSupportedLanguage(navLang)) {
      return navLang;
    }
  } catch {
    return 'en';
  }
  return 'en';
}

export interface SeoSyncInput {
  lang: LanguageCode;
  metaTitle: string;
  metaDescription: string;
  activeScenario: Scenario;
  faqItems: Array<{ q: string; a: string }>;
  howToStepLabels: [string, string, string];
}

function upsertMeta(attrName: 'name' | 'property', attrValue: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) {
      el.setAttribute('hreflang', hreflang);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function syncHeadSeo({
  lang,
  metaTitle,
  metaDescription,
  activeScenario,
  faqItems,
  howToStepLabels,
}: SeoSyncInput): void {
  if (typeof document === 'undefined') return;
  const meta = getLanguageMeta(lang);
  const canonicalUrl = getCanonicalUrl(lang);
  const scenarioContent = activeScenario.locales[lang];

  document.documentElement.lang = lang;
  document.documentElement.dir = meta.dir;
  document.title = metaTitle;

  upsertMeta('name', 'description', metaDescription);
  upsertMeta('property', 'og:title', metaTitle);
  upsertMeta('property', 'og:description', metaDescription);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('name', 'twitter:title', metaTitle);
  upsertMeta('name', 'twitter:description', metaDescription);

  upsertLink('canonical', canonicalUrl);
  upsertLink('alternate', `${CANONICAL_ORIGIN}/`, 'x-default');
  for (const item of SUPPORTED_LANGUAGES) {
    upsertLink('alternate', getCanonicalUrl(item.code), item.hreflang);
  }

  const jsonLdScript = document.getElementById('replycue-jsonld');
  if (jsonLdScript) {
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'ReplyCue — Reply Generator for Google Reviews, Emails & Everyday Messages',
          url: canonicalUrl,
          inLanguage: lang,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          description: metaDescription,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        {
          '@type': 'HowTo',
          name: scenarioContent.title,
          description: scenarioContent.guidance,
          totalTime: 'PT1M',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: howToStepLabels[0],
              text: scenarioContent.guidance,
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: howToStepLabels[1],
              text: scenarioContent.ack,
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: howToStepLabels[2],
              text: scenarioContent.nextStep,
            },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        },
      ],
    };
    jsonLdScript.textContent = JSON.stringify(graph);
  }
}
