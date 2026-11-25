import type { CategoryId, ChannelType, LanguageCode, RiskLevel, ToneId, VariantKind } from '../../types/replycue';

export interface UiLocaleStrings {
  metaTitle: string;
  metaDescription: string;
  nav: {
    generator: string;
    scenarios: string;
    saved: string;
    guide: string;
  };
  hero: {
    title: string;
    subtitle: string;
    localNotice: string;
    searchPlaceholder: string;
    allCategories: string;
    favoritesOnly: string;
    scenariosCountLabel: string;
  };
  categories: Record<CategoryId, string>;
  channels: Record<ChannelType, string>;
  risks: Record<RiskLevel, string>;
  tones: Record<ToneId, { label: string; hint: string }>;
  variants: Record<VariantKind, { label: string; badge: string }>;
  composer: {
    title: string;
    recipientLabel: string;
    recipientPlaceholder: string;
    senderLabel: string;
    senderPlaceholder: string;
    detailLabel: string;
    receivedLabel: string;
    receivedPlaceholder: string;
    useExampleBtn: string;
    toneLabel: string;
    recommendedLabel: string;
    cautionPrefix: string;
    guidanceLabel: string;
    copyBtn: string;
    copiedBtn: string;
    saveBtn: string;
    savedBtn: string;
    favoriteBtn: string;
    favoritedBtn: string;
    shareAnchorBtn: string;
    anchorCopied: string;
    resetEditsBtn: string;
    charsLabel: string;
    wordsLabel: string;
    editedLabel: string;
    illustrationLabel: string;
    howToSteps: [string, string, string];
  };
  savedSection: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    exportJson: string;
    importJson: string;
    printSelected: string;
    clearAll: string;
    selectForPrint: string;
    notePlaceholder: string;
    deleteBtn: string;
    importSuccess: string;
    importError: string;
    printHeaderTitle: string;
  };
  affiliateSection: {
    title: string;
    subtitle: string;
    disclosure: string;
    ctaLabel: string;
    items: Array<{
      title: string;
      category: string;
      description: string;
      href: string;
    }>;
  };
  editorialSection: {
    title: string;
    subtitle: string;
    pillars: Array<{
      title: string;
      points: string[];
    }>;
    faqTitle: string;
    faqs: Array<{
      q: string;
      a: string;
    }>;
  };
  footer: {
    tagline: string;
    canonicalNote: string;
    privacyNote: string;
  };
  phraseEngine: {
    greetingWithName: Record<VariantKind, string>;
    greetingNoName: Record<VariantKind, string>;
    contextEcho: Record<VariantKind, string>;
    closingWithSender: Record<VariantKind, string>;
    closingNoSender: Record<VariantKind, string>;
    shortGreetingWithName: string;
    shortClosingWithSender: string;
  };
}

export type LocaleDictionary = Record<LanguageCode, UiLocaleStrings>;
