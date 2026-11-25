import type { LocaleDictionary } from './types';
import { UI_LOCALES_PART1 } from './uiPart1';
import { UI_LOCALES_PART2 } from './uiPart2';

export const UI_LOCALES: LocaleDictionary = {
  ...UI_LOCALES_PART1,
  ...UI_LOCALES_PART2,
};

export type { UiLocaleStrings } from './types';
