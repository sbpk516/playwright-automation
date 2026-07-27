import type { ProfileInput } from '../schemas/api.types';

export function buildProfile(
  overrides: Partial<ProfileInput> = {},
): ProfileInput {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

  return {
    name: `QA-${uniqueSuffix}`.slice(0, 24),
    avatar: 'lumen',
    maturity_limit: 18,
    ...overrides,
  };
}
