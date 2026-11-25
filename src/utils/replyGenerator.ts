import type { UiLocaleStrings } from '../data/locales';
import type {
  ComposerInputs,
  GeneratedVariant,
  LanguageCode,
  Scenario,
  VariantKind,
} from '../types/replycue';

const EXAMPLE_PREFIX_RE = /^(?:e\.g\.,?\s*|ej\.?\s*|ex\.?:?\s*|z\.\s*b\.?\s*|مثال:\s*|उदा\.?\s*|напр\.?:?\s*|例如：|例：)/i;

function cleanFallbackDetail(placeholder: string): string {
  const stripped = placeholder.replace(EXAMPLE_PREFIX_RE, '').trim();
  return stripped || placeholder;
}

function buildSnippet(raw: string): string {
  const normalized = raw.replace(/\s+/g, ' ').replace(/["“”«»]/g, '').trim();
  if (!normalized) return '';
  if (normalized.length <= 72) return normalized;
  return `${normalized.slice(0, 69).trimEnd()}...`;
}

function formatGreeting(
  locale: UiLocaleStrings,
  variant: VariantKind,
  recipientName: string,
  isShort: boolean
): string {
  const name = recipientName.trim();
  if (isShort) {
    return name ? locale.phraseEngine.shortGreetingWithName.replace('{name}', name) : '';
  }
  if (name) {
    return locale.phraseEngine.greetingWithName[variant].replace('{name}', name);
  }
  return locale.phraseEngine.greetingNoName[variant];
}

function formatClosing(
  locale: UiLocaleStrings,
  variant: VariantKind,
  senderName: string,
  isShort: boolean
): string {
  const sender = senderName.trim();
  if (isShort) {
    return sender ? locale.phraseEngine.shortClosingWithSender.replace('{sender}', sender) : '';
  }
  if (sender) {
    return locale.phraseEngine.closingWithSender[variant].replace('{sender}', sender);
  }
  return locale.phraseEngine.closingNoSender[variant];
}

export function generateReplyVariants(
  scenario: Scenario,
  lang: LanguageCode,
  locale: UiLocaleStrings,
  inputs: ComposerInputs
): GeneratedVariant[] {
  const content = scenario.locales[lang];
  const resolvedDetail = inputs.keyDetail.trim() || cleanFallbackDetail(content.detailPlaceholder);
  const snippet = buildSnippet(inputs.receivedMessage);
  const isShortMode = inputs.tone === 'short';

  const bodyWithDetail = content.body.replace(/\{detail\}/g, resolvedDetail);
  const nextWithDetail = content.nextStep.replace(/\{detail\}/g, resolvedDetail);
  const shortWithDetail = content.shortCore.replace(/\{detail\}/g, resolvedDetail);

  const buildVariantText = (variant: VariantKind): string => {
    const greeting = formatGreeting(locale, variant, inputs.recipientName, isShortMode);
    const closing = formatClosing(locale, variant, inputs.senderBrandOrRole, isShortMode);
    const contextLine = snippet
      ? locale.phraseEngine.contextEcho[variant].replace('{snippet}', snippet)
      : '';

    if (isShortMode) {
      if (variant === 'direct') {
        return [greeting, shortWithDetail, closing].filter(Boolean).join(' ');
      }
      if (variant === 'warm') {
        return [greeting, content.ack, shortWithDetail, closing].filter(Boolean).join(' ');
      }
      return [greeting, bodyWithDetail, closing].filter(Boolean).join(' ');
    }

    if (variant === 'direct') {
      const middle = [contextLine, content.ack, bodyWithDetail, nextWithDetail]
        .filter(Boolean)
        .join(' ');
      return [greeting, middle, closing].filter(Boolean).join('\n\n');
    }

    if (variant === 'warm') {
      const middle = [content.ack, contextLine, bodyWithDetail, nextWithDetail]
        .filter(Boolean)
        .join(' ');
      return [greeting, middle, closing].filter(Boolean).join('\n\n');
    }

    // Polite & Firm
    const middle = [contextLine || content.ack, bodyWithDetail, nextWithDetail]
      .filter(Boolean)
      .join(' ');
    return [greeting, middle, closing].filter(Boolean).join('\n\n');
  };

  const baseOrder: VariantKind[] =
    inputs.tone === 'warm'
      ? ['warm', 'direct', 'firm']
      : inputs.tone === 'firm'
        ? ['firm', 'direct', 'warm']
        : ['direct', 'warm', 'firm'];

  return baseOrder.map((variantId) => ({
    id: variantId,
    label: locale.variants[variantId].label,
    description: locale.tones[variantId].hint,
    text: buildVariantText(variantId),
  }));
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
