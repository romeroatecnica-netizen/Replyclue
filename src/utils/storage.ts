import type { ReplyCueBackupPayload, SavedReplyItem } from '../types/replycue';

const FAVORITES_KEY = 'replycue_favorites_v1';
const SAVED_REPLIES_KEY = 'replycue_saved_replies_v1';

export function loadFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore storage quota errors silently
  }
}

export function loadSavedReplies(): SavedReplyItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_REPLIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidSavedReplyItem);
  } catch {
    return [];
  }
}

export function saveSavedReplies(items: SavedReplyItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVED_REPLIES_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors silently
  }
}

function isValidSavedReplyItem(item: unknown): item is SavedReplyItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.scenarioId === 'string' &&
    typeof candidate.scenarioTitle === 'string' &&
    typeof candidate.text === 'string' &&
    typeof candidate.createdAt === 'string'
  );
}

export function createBackupPayload(
  favorites: string[],
  savedReplies: SavedReplyItem[]
): ReplyCueBackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites,
    savedReplies,
  };
}

export function parseBackupPayload(rawJson: string): ReplyCueBackupPayload | null {
  try {
    const parsed = JSON.parse(rawJson) as Partial<ReplyCueBackupPayload>;
    if (!parsed || typeof parsed !== 'object') return null;
    const favorites = Array.isArray(parsed.favorites)
      ? parsed.favorites.filter((x): x is string => typeof x === 'string')
      : [];
    const savedReplies = Array.isArray(parsed.savedReplies)
      ? parsed.savedReplies.filter(isValidSavedReplyItem)
      : [];
    if (!Array.isArray(parsed.favorites) && !Array.isArray(parsed.savedReplies)) {
      return null;
    }
    return {
      version: 1,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      favorites,
      savedReplies,
    };
  } catch {
    return null;
  }
}
