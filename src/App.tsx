import {
  AlertTriangle,
  Bookmark,
  Check,
  Copy,
  Globe,
  Link2,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AdSlot } from './components/AdSlot';
import { EditorialAndAffiliateSection } from './components/EditorialAndAffiliateSection';
import { ReplySceneIllustration } from './components/ReplySceneIllustration';
import { SavedLibrarySection } from './components/SavedLibrarySection';
import {
  SUPPORTED_LANGUAGES,
  detectInitialLanguage,
  syncHeadSeo,
} from './config/seo';
import { UI_LOCALES } from './data/locales';
import { SCENARIOS, findScenarioBySlugOrId } from './data/scenarios';
import type {
  CategoryId,
  ComposerInputs,
  LanguageCode,
  SavedReplyItem,
  ToneId,
  VariantKind,
} from './types/replycue';
import { countWords, generateReplyVariants } from './utils/replyGenerator';
import {
  createBackupPayload,
  loadFavorites,
  loadSavedReplies,
  parseBackupPayload,
  saveFavorites,
  saveSavedReplies,
} from './utils/storage';

const CATEGORY_ORDER: CategoryId[] = [
  'reviews',
  'sales',
  'work',
  'messaging',
  'social',
  'everyday',
];

const TONE_ORDER: ToneId[] = ['warm', 'direct', 'firm', 'short'];

function detectInitialScenarioId(): string {
  if (typeof window === 'undefined') return SCENARIOS[0].id;
  const hashSlug = window.location.hash.replace(/^#/, '').trim();
  const params = new URLSearchParams(window.location.search);
  const queryScenario = params.get('scenario')?.trim();
  const match = findScenarioBySlugOrId(queryScenario || hashSlug);
  return match ? match.id : SCENARIOS[0].id;
}

export default function App() {
  const [lang, setLang] = useState<LanguageCode>(() => detectInitialLanguage());
  const [activeScenarioId, setActiveScenarioId] = useState<string>(() =>
    detectInitialScenarioId()
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [savedReplies, setSavedReplies] = useState<SavedReplyItem[]>(() =>
    loadSavedReplies()
  );

  const activeScenario = useMemo(
    () => SCENARIOS.find((s) => s.id === activeScenarioId) ?? SCENARIOS[0],
    [activeScenarioId]
  );

  const [inputs, setInputs] = useState<ComposerInputs>(() => ({
    recipientName: '',
    senderBrandOrRole: '',
    keyDetail: '',
    receivedMessage: '',
    tone: activeScenario.recommendedTone,
  }));

  const [editedVariants, setEditedVariants] = useState<Partial<Record<VariantKind, string>>>(
    {}
  );
  const [copiedVariant, setCopiedVariant] = useState<VariantKind | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<VariantKind | null>(null);
  const [anchorCopied, setAnchorCopied] = useState(false);

  const locale = UI_LOCALES[lang];
  const scenarioLocale = activeScenario.locales[lang];

  // Sync document lang/dir, canonical/hreflang tags, and dynamic JSON-LD
  useEffect(() => {
    syncHeadSeo({
      lang,
      metaTitle: locale.metaTitle,
      metaDescription: locale.metaDescription,
      activeScenario,
      faqItems: locale.editorialSection.faqs,
      howToStepLabels: locale.composer.howToSteps,
    });
  }, [lang, locale, activeScenario]);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    saveSavedReplies(savedReplies);
  }, [savedReplies]);

  const handleLanguageChange = (nextLang: LanguageCode) => {
    setLang(nextLang);
    try {
      window.localStorage.setItem('replycue_lang_v1', nextLang);
      const url = new URL(window.location.href);
      if (nextLang === 'en') {
        url.searchParams.delete('lang');
      } else {
        url.searchParams.set('lang', nextLang);
      }
      window.history.replaceState(null, '', url.toString());
    } catch {
      // Ignore history/storage restrictions
    }
  };

  const handleSelectScenario = (scenarioId: string) => {
    const next = SCENARIOS.find((s) => s.id === scenarioId);
    if (!next) return;
    setActiveScenarioId(next.id);
    setEditedVariants({});
    setInputs((prev) => ({
      ...prev,
      keyDetail: '',
      receivedMessage: '',
      tone: next.recommendedTone,
    }));
    try {
      const url = new URL(window.location.href);
      url.hash = next.slug;
      window.history.replaceState(null, '', url.toString());
    } catch {
      // Ignore
    }
  };

  const filteredScenarios = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SCENARIOS.filter((scenario) => {
      if (selectedCategory !== 'all' && scenario.category !== selectedCategory) {
        return false;
      }
      if (favoritesOnly && !favorites.includes(scenario.id)) {
        return false;
      }
      if (!q) return true;
      const content = scenario.locales[lang];
      const catLabel = locale.categories[scenario.category].toLowerCase();
      const chLabel = locale.channels[scenario.channel].toLowerCase();
      return (
        content.title.toLowerCase().includes(q) ||
        content.guidance.toLowerCase().includes(q) ||
        catLabel.includes(q) ||
        chLabel.includes(q) ||
        scenario.slug.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, favoritesOnly, favorites, searchQuery, lang, locale]);

  const generatedVariants = useMemo(
    () => generateReplyVariants(activeScenario, lang, locale, inputs),
    [activeScenario, lang, locale, inputs]
  );

  const isFavorited = favorites.includes(activeScenario.id);

  const toggleFavorite = (scenarioId: string) => {
    setFavorites((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : [scenarioId, ...prev]
    );
  };

  const handleCopyVariant = async (kind: VariantKind, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVariant(kind);
      window.setTimeout(
        () => setCopiedVariant((curr) => (curr === kind ? null : curr)),
        1800
      );
    } catch {
      // Clipboard fallback ignored if restricted
    }
  };

  const handleSaveVariant = (kind: VariantKind, text: string) => {
    const newItem: SavedReplyItem = {
      id: `${activeScenario.id}-${kind}-${Date.now()}`,
      scenarioId: activeScenario.id,
      scenarioTitle: scenarioLocale.title,
      category: activeScenario.category,
      tone: inputs.tone,
      variantKind: kind,
      language: lang,
      text,
      note: '',
      createdAt: new Date().toISOString(),
      selectedForPrint: true,
    };
    setSavedReplies((prev) => [newItem, ...prev]);
    setSavedFeedback(kind);
    window.setTimeout(
      () => setSavedFeedback((curr) => (curr === kind ? null : curr)),
      1800
    );
  };

  const handleCopyAnchorLink = async () => {
    try {
      const base =
        lang === 'en'
          ? 'https://replycue.bastelar.com/'
          : `https://replycue.bastelar.com/?lang=${lang}`;
      const shareUrl = `${base}#${activeScenario.slug}`;
      await navigator.clipboard.writeText(shareUrl);
      setAnchorCopied(true);
      window.setTimeout(() => setAnchorCopied(false), 1800);
    } catch {
      // Ignore
    }
  };

  const handleExportJson = () => {
    const payload = createBackupPayload(favorites, savedReplies);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `replycue-library-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportJsonFile = async (file: File): Promise<boolean> => {
    try {
      const content = await file.text();
      const parsed = parseBackupPayload(content);
      if (!parsed) return false;
      setFavorites((prev) => Array.from(new Set([...parsed.favorites, ...prev])));
      setSavedReplies((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const incoming = parsed.savedReplies.filter((item) => !existingIds.has(item.id));
        return [...incoming, ...prev];
      });
      return true;
    } catch {
      return false;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const printableSavedItems = savedReplies.filter((item) => item.selectedForPrint);

  return (
    <div id="top" className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            ReplyCue
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#generator"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {locale.nav.generator}
            </a>
            <a
              href="#scenarios"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {locale.nav.scenarios}
            </a>
            <a
              href="#saved"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {locale.nav.saved}
            </a>
            <a
              href="#guide"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {locale.nav.guide}
            </a>
          </nav>

          {/* Zone 3: 1 primary language selector control */}
          <div className="flex items-center shrink-0">
            <label htmlFor="language-select" className="sr-only">
              Language
            </label>
            <div className="relative inline-flex items-center">
              <Globe
                className="pointer-events-none absolute start-2.5 h-3.5 w-3.5 text-slate-500"
                aria-hidden="true"
              />
              <select
                id="language-select"
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
                className="min-h-[40px] cursor-pointer rounded-lg border border-slate-200 bg-white ps-8 pe-7 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:border-slate-300 focus:border-[#2563EB] focus:outline-none whitespace-nowrap shrink-0"
              >
                {SUPPORTED_LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.nativeLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <section className="no-print mb-8 border-b border-slate-200 pb-6">
          <div className="max-w-4xl">
            <h1
              className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[34px] lg:leading-[1.2]"
              style={{ textWrap: 'balance' }}
            >
              {locale.hero.title}
            </h1>
            <p className="mt-2.5 text-base leading-relaxed text-slate-600">
              {locale.hero.subtitle}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {locale.hero.localNotice}
            </p>
          </div>
        </section>

        {/* Main 2-Column Workspace */}
        <div className="no-print flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left Column: Scenario Directory */}
          <aside
            id="scenarios"
            aria-label={locale.nav.scenarios}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-20 lg:w-[350px] xl:w-[375px] shrink-0"
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale.hero.searchPlaceholder}
                className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-[#F8FAFC] ps-9 pe-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Category & Favorites Filter Controls */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setFavoritesOnly(false);
                }}
                className={`min-h-[34px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === 'all' && !favoritesOnly
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {locale.hero.allCategories}
              </button>

              <button
                type="button"
                onClick={() => setFavoritesOnly((prev) => !prev)}
                className={`inline-flex min-h-[34px] items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  favoritesOnly
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Star className="h-3 w-3" aria-hidden="true" />
                <span>{locale.hero.favoritesOnly}</span>
                <span className="font-mono-num">({favorites.length})</span>
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {CATEGORY_ORDER.map((catId) => (
                <button
                  key={catId}
                  type="button"
                  onClick={() => setSelectedCategory(catId)}
                  className={`min-h-[32px] rounded-md px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === catId
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {locale.categories[catId]}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5 text-xs text-slate-500">
              <span>{locale.nav.scenarios}</span>
              <span className="font-mono-num font-medium text-slate-700">
                {filteredScenarios.length} {locale.hero.scenariosCountLabel}
              </span>
            </div>

            {/* Scenario List */}
            <div className="mt-2 max-h-[440px] space-y-1.5 overflow-y-auto pe-1 lg:max-h-[600px]">
              {filteredScenarios.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-[#F8FAFC] p-4 text-center text-xs text-slate-500">
                  No matching scenarios found.
                </p>
              ) : (
                filteredScenarios.map((item) => {
                  const isActive = item.id === activeScenario.id;
                  const isStarred = favorites.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectScenario(item.id)}
                      className={`w-full rounded-lg border p-3 text-start transition-colors ${
                        isActive
                          ? 'border-[#2563EB] bg-blue-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="truncate">
                          {locale.categories[item.category]} · {locale.channels[item.channel]}
                        </span>
                        {isStarred && (
                          <Star
                            className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <p
                        className={`mt-1 text-xs font-semibold leading-snug ${
                          isActive ? 'text-[#2563EB]' : 'text-slate-900'
                        }`}
                      >
                        {item.locales[lang].title}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Column: Active Scenario, Composer, and 3 Variants */}
          <div id="generator" className="min-w-0 flex-1 space-y-6">
            {/* Active Scenario Overview & Static SVG Schematic */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      {locale.categories[activeScenario.category]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{locale.channels[activeScenario.channel]}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        activeScenario.risk === 'high'
                          ? 'font-medium text-[#D97706]'
                          : 'text-slate-500'
                      }
                    >
                      {locale.risks[activeScenario.risk]}
                    </span>
                  </div>

                  <h2
                    className="font-display mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
                    style={{ textWrap: 'balance' }}
                  >
                    {scenarioLocale.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(activeScenario.id)}
                    className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isFavorited
                        ? 'border-amber-300 bg-amber-50 text-amber-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        isFavorited ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                      aria-hidden="true"
                    />
                    <span>
                      {isFavorited
                        ? locale.composer.favoritedBtn
                        : locale.composer.favoriteBtn}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAnchorLink}
                    className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      anchorCopied
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {anchorCopied ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {anchorCopied
                        ? locale.composer.anchorCopied
                        : locale.composer.shareAnchorBtn}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-sm leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-900">
                    {locale.composer.guidanceLabel}:{' '}
                  </span>
                  {scenarioLocale.guidance}
                </p>

                {scenarioLocale.caution && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-950">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]"
                      aria-hidden="true"
                    />
                    <div>
                      <span className="font-semibold">{locale.composer.cautionPrefix}: </span>
                      <span>{scenarioLocale.caution}</span>
                    </div>
                  </div>
                )}

                <ReplySceneIllustration
                  kind={activeScenario.illustration}
                  risk={activeScenario.risk}
                  steps={locale.composer.howToSteps}
                  label={locale.composer.illustrationLabel}
                />
              </div>
            </section>

            {/* Personalization Composer */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3.5">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  {locale.composer.title}
                </h3>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{locale.savedSection.printSelected}</span>
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="recipient-input"
                    className="block text-xs font-medium text-slate-700"
                  >
                    {locale.composer.recipientLabel}
                  </label>
                  <input
                    id="recipient-input"
                    type="text"
                    value={inputs.recipientName}
                    onChange={(e) => {
                      setEditedVariants({});
                      setInputs((prev) => ({ ...prev, recipientName: e.target.value }));
                    }}
                    placeholder={locale.composer.recipientPlaceholder}
                    className="mt-1.5 min-h-[40px] w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sender-input"
                    className="block text-xs font-medium text-slate-700"
                  >
                    {locale.composer.senderLabel}
                  </label>
                  <input
                    id="sender-input"
                    type="text"
                    value={inputs.senderBrandOrRole}
                    onChange={(e) => {
                      setEditedVariants({});
                      setInputs((prev) => ({ ...prev, senderBrandOrRole: e.target.value }));
                    }}
                    placeholder={locale.composer.senderPlaceholder}
                    className="mt-1.5 min-h-[40px] w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="detail-input"
                    className="block text-xs font-medium text-slate-700"
                  >
                    {locale.composer.detailLabel}
                  </label>
                  <input
                    id="detail-input"
                    type="text"
                    value={inputs.keyDetail}
                    onChange={(e) => {
                      setEditedVariants({});
                      setInputs((prev) => ({ ...prev, keyDetail: e.target.value }));
                    }}
                    placeholder={scenarioLocale.detailPlaceholder}
                    className="mt-1.5 min-h-[40px] w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="received-input"
                      className="block text-xs font-medium text-slate-700"
                    >
                      {locale.composer.receivedLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedVariants({});
                        setInputs((prev) => ({
                          ...prev,
                          receivedMessage: scenarioLocale.exampleReceived,
                        }));
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      <span>{locale.composer.useExampleBtn}</span>
                    </button>
                  </div>
                  <textarea
                    id="received-input"
                    rows={2}
                    value={inputs.receivedMessage}
                    onChange={(e) => {
                      setEditedVariants({});
                      setInputs((prev) => ({ ...prev, receivedMessage: e.target.value }));
                    }}
                    placeholder={locale.composer.receivedPlaceholder}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Tone Selector */}
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-xs font-medium text-slate-700">
                  {locale.composer.toneLabel}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {TONE_ORDER.map((toneId) => {
                    const active = inputs.tone === toneId;
                    const isRecommended = activeScenario.recommendedTone === toneId;
                    return (
                      <button
                        key={toneId}
                        type="button"
                        onClick={() => {
                          setEditedVariants({});
                          setInputs((prev) => ({ ...prev, tone: toneId }));
                        }}
                        className={`flex flex-col items-start rounded-lg border p-3 text-start transition-colors ${
                          active
                            ? 'border-[#2563EB] bg-blue-50/60'
                            : 'border-slate-200 bg-[#F8FAFC] hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              active ? 'text-[#2563EB]' : 'text-slate-900'
                            }`}
                          >
                            {locale.tones[toneId].label}
                          </span>
                          {isRecommended && (
                            <span className="text-[10px] font-medium text-[#059669]">
                              {locale.composer.recommendedLabel}
                            </span>
                          )}
                        </div>
                        <span className="mt-1 text-[11px] leading-snug text-slate-500">
                          {locale.tones[toneId].hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 3 Ready-to-Copy & Editable Variants */}
            <section className="grid gap-4 xl:grid-cols-3">
              {generatedVariants.map((variant, idx) => {
                const currentText = editedVariants[variant.id] ?? variant.text;
                const isEdited = editedVariants[variant.id] !== undefined;
                const isCopied = copiedVariant === variant.id;
                const isSaved = savedFeedback === variant.id;
                const charCount = currentText.length;
                const wordCount = countWords(currentText);

                return (
                  <article
                    key={variant.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono-num font-medium text-slate-700">
                              0{idx + 1}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{variant.description}</span>
                          </div>
                          <h3 className="font-display mt-0.5 text-sm font-semibold text-slate-900">
                            {variant.label}
                          </h3>
                        </div>

                        {isEdited && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditedVariants((prev) => {
                                const next = { ...prev };
                                delete next[variant.id];
                                return next;
                              })
                            }
                            title={locale.composer.resetEditsBtn}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 whitespace-nowrap shrink-0"
                          >
                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                            <span>{locale.composer.resetEditsBtn}</span>
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={7}
                        value={currentText}
                        onChange={(e) =>
                          setEditedVariants((prev) => ({
                            ...prev,
                            [variant.id]: e.target.value,
                          }))
                        }
                        aria-label={variant.label}
                        className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-[#F8FAFC] p-3 text-sm leading-relaxed text-slate-800 focus:border-[#2563EB] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <div className="font-mono-num flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span>
                          {charCount} {locale.composer.charsLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {wordCount} {locale.composer.wordsLabel}
                        </span>
                        {isEdited && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-sans font-medium text-[#2563EB]">
                              {locale.composer.editedLabel}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSaveVariant(variant.id, currentText)}
                          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            isSaved
                              ? 'border-emerald-200 bg-emerald-50 text-[#059669]'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isSaved ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>
                            {isSaved ? locale.composer.savedBtn : locale.composer.saveBtn}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyVariant(variant.id, currentText)}
                          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0 ${
                            isCopied
                              ? 'bg-[#059669]'
                              : 'bg-[#2563EB] hover:bg-blue-700'
                          }`}
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>
                            {isCopied ? locale.composer.copiedBtn : locale.composer.copyBtn}
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        </div>

        {/* Dedicated Media.net Ad Slot 1 (Zero CLS, hidden on print) */}
        <div className="my-10">
          <AdSlot
            slotId="replycue-medianet-top-leaderboard"
            placementLabel="Media.net Responsive Ad Slot — Primary Content Break"
            minHeightClass="min-h-[110px]"
          />
        </div>

        {/* Saved Library & Local JSON Persistence */}
        <div className="space-y-10">
          <SavedLibrarySection
            locale={locale}
            savedReplies={savedReplies}
            onTogglePrintSelection={(id) =>
              setSavedReplies((prev) =>
                prev.map((item) =>
                  item.id === id
                    ? { ...item, selectedForPrint: !item.selectedForPrint }
                    : item
                )
              )
            }
            onUpdateNote={(id, note) =>
              setSavedReplies((prev) =>
                prev.map((item) => (item.id === id ? { ...item, note } : item))
              )
            }
            onDeleteItem={(id) =>
              setSavedReplies((prev) => prev.filter((item) => item.id !== id))
            }
            onClearAll={() => setSavedReplies([])}
            onExportJson={handleExportJson}
            onImportJsonFile={handleImportJsonFile}
            onPrintSelected={handlePrint}
          />

          {/* Contextual Affiliate + Editorial SEO Guide + FAQ */}
          <EditorialAndAffiliateSection locale={locale} />

          {/* Dedicated Media.net Ad Slot 2 (Bottom Footer Placement, Zero CLS, hidden on print) */}
          <AdSlot
            slotId="replycue-medianet-bottom-banner"
            placementLabel="Media.net Responsive Ad Slot — Footer Placement"
            minHeightClass="min-h-[110px]"
          />
        </div>

        {/* Printable Sheet (@media print only) */}
        <section className="print-only hidden space-y-6">
          <div className="border-b border-slate-300 pb-3">
            <h1 className="font-display text-xl font-bold text-slate-900">
              {locale.savedSection.printHeaderTitle}
            </h1>
            <p className="mt-1 text-xs text-slate-600">{locale.footer.canonicalNote}</p>
          </div>

          {printableSavedItems.length > 0 ? (
            <div className="space-y-4">
              {printableSavedItems.map((item) => (
                <div
                  key={item.id}
                  className="print-surface rounded-lg border border-slate-300 p-4"
                >
                  <p className="text-xs text-slate-500">
                    {locale.categories[item.category]} ·{' '}
                    {locale.variants[item.variantKind]?.label ?? item.tone}
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">
                    {item.scenarioTitle}
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-900">
                    {item.text}
                  </p>
                  {item.note && (
                    <p className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-600">
                      {item.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                {scenarioLocale.title}
              </h2>
              {generatedVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="print-surface rounded-lg border border-slate-300 p-4"
                >
                  <p className="text-xs font-semibold text-slate-700">{variant.label}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-900">
                    {editedVariants[variant.id] ?? variant.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="no-print mt-12 border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-medium text-slate-700">{locale.footer.tagline}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>{locale.footer.canonicalNote}</span>
            <span aria-hidden="true">·</span>
            <span>{locale.footer.privacyNote}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
