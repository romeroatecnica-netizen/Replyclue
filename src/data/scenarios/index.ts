import type { Scenario } from '../../types/replycue';
import { EVERYDAY_SCENARIOS } from './everyday';
import { MESSAGING_SCENARIOS } from './messaging';
import { REVIEW_SCENARIOS } from './reviews';
import { SALES_SCENARIOS } from './sales';
import { SOCIAL_SCENARIOS } from './social';
import { WORK_SCENARIOS } from './work';

export const SCENARIOS: Scenario[] = [
  ...REVIEW_SCENARIOS,
  ...SALES_SCENARIOS,
  ...WORK_SCENARIOS,
  ...MESSAGING_SCENARIOS,
  ...SOCIAL_SCENARIOS,
  ...EVERYDAY_SCENARIOS,
];

export function findScenarioBySlugOrId(value: string | null | undefined): Scenario | undefined {
  if (!value) return undefined;
  return SCENARIOS.find((s) => s.id === value || s.slug === value);
}
