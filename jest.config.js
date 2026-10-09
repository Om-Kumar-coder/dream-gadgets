/**
 * Root Jest config.
 *
 * BUG-21: this file used to declare two `projects` — `tests/components` and
 * `tests/integration` — directories that do not exist, so the root
 * `test:components` / `test:integration` scripts (and a bare `npx jest` at the
 * repo root) could never run a single test. The dead projects and scripts were
 * removed (see package.json and run-all-tests.sh); the root config now points
 * at the one real Jest project in the repo — the API suite in apps/api, which
 * is also what CI runs (working-directory: apps/api).
 */
module.exports = {
  projects: ['<rootDir>/apps/api'],
  testTimeout: 30000,
  verbose: true,
};
