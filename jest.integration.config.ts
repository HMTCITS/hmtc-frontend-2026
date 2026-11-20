/**
 * Integration tests: run against a real local Directus (`pnpm directus:setup`).
 *
 *   pnpm directus:setup && pnpm test:integration
 *
 * Kept apart from `pnpm test`, which must pass without Directus.
 */
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.integration.test.ts'],
  // One Directus instance is shared; keep tests from racing each other.
  maxWorkers: 1,
  testTimeout: 30_000,
};

export default createJestConfig(config);
