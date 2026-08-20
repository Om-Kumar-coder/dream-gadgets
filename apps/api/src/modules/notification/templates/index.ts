/**
 * Notification template registry.
 *
 * Templates are stored as JSON files in this directory so they can be:
 * 1. Edited without code deploys
 * 2. Previewed in an admin editor
 * 3. Overridden per-key via the settings table (DB takes precedence)
 *
 * Each file exports a `TemplateDef` object with `subject`, `body`, and optional
 * `smsBody` fields. Variables use {{varName}} syntax.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TemplateDef {
  subject: string;
  body: string;
  /** Plain-text fallback for SMS (160 char limit) and WhatsApp (no HTML). */
  smsBody?: string;
}

let _cache: Record<string, TemplateDef> | null = null;

/**
 * Load all templates from the templates/ directory.
 * Results are cached after the first read (safe for hot-reload in dev via
 * the `require.cache` invalidation that NestJS dev mode does).
 */
export function loadTemplates(): Record<string, TemplateDef> {
  if (_cache) return _cache;

  const templatesDir = __dirname;
  const cache: Record<string, TemplateDef> = {};

  if (fs.existsSync(templatesDir)) {
    for (const file of fs.readdirSync(templatesDir)) {
      if (!file.endsWith('.json')) continue;
      const key = file.replace('.json', '');
      try {
        const raw = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
        cache[key] = JSON.parse(raw) as TemplateDef;
      } catch {
        // skip malformed files silently
      }
    }
  }

  _cache = cache;
  return cache;
}

/**
 * Get a single template by key. Returns null if not found.
 */
export function getTemplate(key: string): TemplateDef | null {
  return loadTemplates()[key] ?? null;
}

/**
 * Get all template keys (for admin listing).
 */
export function getTemplateKeys(): string[] {
  return Object.keys(loadTemplates());
}
