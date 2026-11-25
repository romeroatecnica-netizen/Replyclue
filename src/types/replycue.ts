export type LanguageCode =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'ar'
  | 'hi'
  | 'ru'
  | 'zh'
  | 'ja';

export type CategoryId =
  | 'reviews'
  | 'sales'
  | 'work'
  | 'messaging'
  | 'social'
  | 'everyday';

export type ToneId = 'warm' | 'direct' | 'firm' | 'short';

export type VariantKind = 'direct' | 'warm' | 'firm';

export type ChannelType =
  | 'google-review'
  | 'email'
  | 'chat'
  | 'social'
  | 'personal';

export type RiskLevel = 'low' | 'medium' | 'high';

export type IllustrationKind =
  | 'review-positive'
  | 'review-negative'
  | 'review-clarify'
  | 'sales-quote'
  | 'sales-order'
  | 'work-deadline'
  | 'work-boundary'
  | 'chat-support'
  | 'social-public'
  | 'personal-note';

export interface LocalizedScenarioContent {
  title: string;
  guidance: string;
  caution?: string;
  detailPlaceholder: string;
  exampleReceived: string;
  /** Core acknowledgment phrase in this language */
  ack: string;
  /** Core message/resolution phrase in this language (supports {detail} token) */
  body: string;
  /** Concrete next step / closing invitation in this language (supports {detail} token) */
  nextStep: string;
  /** Ultra-concise version for Short & Concise mode */
  shortCore: string;
}

export interface Scenario {
  id: string;
  slug: string;
  category: CategoryId;
  channel: ChannelType;
  risk: RiskLevel;
  illustration: IllustrationKind;
  recommendedTone: ToneId;
  locales: Record<LanguageCode, LocalizedScenarioContent>;
}

export interface ComposerInputs {
  recipientName: string;
  senderBrandOrRole: string;
  keyDetail: string;
  receivedMessage: string;
  tone: ToneId;
}

export interface GeneratedVariant {
  id: VariantKind;
  label: string;
  description: string;
  text: string;
}

export interface SavedReplyItem {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  category: CategoryId;
  tone: ToneId;
  variantKind: VariantKind;
  language: LanguageCode;
  text: string;
  note: string;
  createdAt: string;
  selectedForPrint: boolean;
}

export interface ReplyCueBackupPayload {
  version: 1;
  exportedAt: string;
  favorites: string[];
  savedReplies: SavedReplyItem[];
}
