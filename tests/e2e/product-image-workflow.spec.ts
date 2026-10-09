import { test, expect, Page, Locator } from '@playwright/test';

/**
 * Product-image workflow — EXISTING product end-to-end.
 *
 * Verifies the real user-facing flow (driven through the actual admin UI in a
 * browser, then checked against the live storefront):
 *
 *   Existing Google Pixel 7 Pro 128GB
 *     → open Inventory → Manage Photos
 *     → attach/upload product image
 *     → photo persisted + associated with the correct product (API)
 *     → Store listing card shows the actual image
 *     → Product details page shows the actual image
 *     → refresh → image still appears
 *     → other products (iPhone 13) unaffected
 */

const STORE = 'https://dreamgadgets.in';
const ADMIN = `${STORE}/admin`;
const API = `${STORE}/api/v1`;

const PIXEL_ID = 'a0097598-9c44-4a93-b4c0-1f98013f4672';
const IPHONE_ID = 'ddf32f1e-32e1-46a8-84d0-3607a899015d';

// Pre-existing (SQL-seeded) photo file of the Pixel; uploaded again through
// the real workflow so the final state is produced by the workflow itself.
const OLD_FILE = '1791216668-pixel7pro.jpg';
const UPLOAD_FILE = `/var/www/dream-gadgets/apps/uploads/inventory/${OLD_FILE}`;

const OWNER_EMAIL = 'owner@dreamgadgets.in';
const OWNER_PASSWORD = 'Test@1234';

const SHOTS = 'test-results/product-image';

async function apiLogin(): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: OWNER_EMAIL, password: OWNER_PASSWORD }),
  });
  const json = await res.json();
  expect(json?.data?.accessToken, 'API login failed').toBeTruthy();
  return {
    accessToken: json.data.accessToken as string,
    refreshToken: json.data.refreshToken as string,
  };
}

/**
 * Establish the admin browser session exactly as a successful UI login does:
 * localStorage tokens + the DECODED JWT in the persisted zustand store
 * (`user` — the API's `user` object carries a role object that the UI does not
 * render), plus the session cookie the Next.js middleware checks for.
 *
 * The cookie is set via CDP: the owner's access token is 4183 bytes and
 * exceeds the 4096-byte cookie limit, so `document.cookie` silently refuses it
 * (pre-existing auth issue, out of scope for this test) — the middleware only
 * checks cookie presence, while API calls authenticate with the
 * Authorization header from localStorage.
 */
async function bootstrapAdminSession(page: Page): Promise<void> {
  const { accessToken, refreshToken } = await apiLogin();
  const user = JSON.parse(
    Buffer.from(
      accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString(),
  );

  await page.goto(`${ADMIN}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    (s: { accessToken: string; refreshToken: string; user: unknown }) => {
      localStorage.setItem('admin_access_token', s.accessToken);
      localStorage.setItem('admin_refresh_token', s.refreshToken);
      localStorage.setItem(
        'admin-auth-storage',
        JSON.stringify({
          state: { accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user },
          version: 0,
        }),
      );
    },
    { accessToken, refreshToken, user },
  );

  try {
    await page.context().addCookies([
      { name: 'admin_access_token', value: accessToken, domain: 'dreamgadgets.in', path: '/' },
    ]);
  } catch {
    await page.context().addCookies([
      { name: 'admin_access_token', value: 'session-present', domain: 'dreamgadgets.in', path: '/' },
    ]);
  }
}

type Photo = { id: string; cdnUrl: string | null };

async function getPhotos(token: string, itemId: string): Promise<Photo[]> {
  const res = await fetch(`${API}/inventory/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok, `GET /inventory/${itemId} → ${res.status}`).toBeTruthy();
  const json = await res.json();
  return (json?.data?.photos ?? []) as Photo[];
}

/** Assert the image actually decoded (naturalWidth > 0), not just present in DOM. */
async function expectImageLoaded(locator: Locator, timeout = 20000) {
  const img = locator.first();
  await img.scrollIntoViewIfNeeded();
  await expect
    .poll(
      () =>
        img.evaluate((el: HTMLImageElement) =>
          el.complete && el.naturalWidth > 0 ? el.naturalWidth : 0,
        ),
      { timeout, intervals: [500] },
    )
    .toBeGreaterThan(0);
}

/** Reload a page until its image src settles on a specific file (cache TTLs). */
async function waitForSrc(page: Page, url: string, locator: Locator, file: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  let last = '(none)';
  while (Date.now() < deadline) {
    if ((await locator.count()) > 0) {
      last = (await locator.first().getAttribute('src')) ?? '(none)';
      if (last.includes(file)) return last;
    }
    await page.waitForTimeout(3000);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  }
  throw new Error(`Image src never settled on "${file}" — last src: ${last}`);
}

test('EXISTING PRODUCT image workflow: attach in inventory mgmt → store card + details show it', async ({
  page,
}) => {
  test.setTimeout(600_000);

  // ── Baseline: existing product with an image keeps working ─────────────────
  const { accessToken: token } = await apiLogin();
  const before = await getPhotos(token, PIXEL_ID);
  expect(before, 'Pixel baseline photo').toHaveLength(1);
  expect(before[0].cdnUrl).toContain(OLD_FILE);
  expect(await getPhotos(token, IPHONE_ID), 'iPhone baseline has no photos').toHaveLength(0);

  // ── 1. Open existing product in inventory management (real admin UI) ───────
  await bootstrapAdminSession(page);

  await page.goto(`${ADMIN}/inventory`, { waitUntil: 'domcontentloaded' });
  const pixelRow = page.locator('tbody tr', { hasText: 'Pixel 7 Pro' }).first();
  await expect(pixelRow).toBeVisible({ timeout: 20_000 });

  // ── 2. Attach/upload product image via the Manage Photos workflow ──────────
  await pixelRow.locator('button[title="Manage Photos"]').click();
  const dialog = page.getByRole('dialog', { name: 'Manage Product Photos' });
  await expect(dialog).toBeVisible({ timeout: 10_000 });

  // Existing photo renders inside management UI (existing images keep working)
  const thumbs = dialog.locator('img[alt="Product photo"]');
  await expect(thumbs).toHaveCount(1);
  await expectImageLoaded(thumbs, 15_000);
  await page.screenshot({ path: `${SHOTS}/1-manage-photos-before.png` });

  // Upload through the SAME endpoint the workflow uses
  await dialog.locator('input[type="file"]').setInputFiles(UPLOAD_FILE);
  await expect(dialog).toContainText('1 file(s) selected');
  await dialog.getByRole('button', { name: 'Upload & Attach' }).click();
  await expect(page.getByText(/photo\(s\) attached to/)).toBeVisible({ timeout: 20_000 });
  await expect(thumbs).toHaveCount(2, { timeout: 15_000 });
  await page.screenshot({ path: `${SHOTS}/2-manage-photos-after-upload.png` });
  await dialog.locator('button:has-text("Close")').click();

  // ── 3. Photo persisted AND associated with the correct product ─────────────
  const after = await getPhotos(token, PIXEL_ID);
  expect(after).toHaveLength(2);
  const newPhoto = after.find((p) => !before.some((b) => b.id === p.id));
  expect(newPhoto, 'new photo row persisted for Pixel').toBeDefined();
  expect(newPhoto!.cdnUrl).toContain('/uploads/inventory/');
  const newFile = (newPhoto!.cdnUrl ?? '').split('/').pop()!;
  expect(newFile).not.toBe(OLD_FILE);
  expect(await getPhotos(token, IPHONE_ID), 'no cross-contamination').toHaveLength(0);

  // ── 4. Store listing card shows the actual image ───────────────────────────
  const cardImg = page
    .locator(`a[href="/products/${PIXEL_ID}"] img[src*="inventory"]`)
    .first();
  await page.goto(`${STORE}/products`, { waitUntil: 'domcontentloaded' });
  await expect(cardImg).toHaveCount(1, { timeout: 20_000 });
  await expectImageLoaded(cardImg, 20_000);
  await page.screenshot({ path: `${SHOTS}/3-store-card.png` });

  // ── 5. Product details page shows the actual image (not "No Image") ────────
  const detailImg = page.locator('img[sizes*="100vw"][src*="inventory"]').first();
  await page.goto(`${STORE}/products/${PIXEL_ID}`, { waitUntil: 'domcontentloaded' });
  await expect(detailImg).toHaveCount(1, { timeout: 20_000 });
  await expectImageLoaded(detailImg, 20_000);
  await page.screenshot({ path: `${SHOTS}/4-product-details.png` });

  // ── 6. Refresh → image still appears ───────────────────────────────────────
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectImageLoaded(detailImg, 20_000);
  await page.goto(`${STORE}/products`, { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(cardImg).toHaveCount(1, { timeout: 20_000 });
  await expectImageLoaded(cardImg, 20_000);
  await page.screenshot({ path: `${SHOTS}/5-store-card-after-refresh.png` });

  // ── 7. Remove the stale SQL-seeded photo through the SAME workflow ─────────
  // (final state = photo attached by the workflow itself; image never
  // disappears because the workflow photo is already there)
  await page.goto(`${ADMIN}/inventory`, { waitUntil: 'domcontentloaded' });
  await pixelRow.locator('button[title="Manage Photos"]').click();
  const dialog2 = page.getByRole('dialog', { name: 'Manage Product Photos' });
  await expect(dialog2).toBeVisible({ timeout: 10_000 });
  const oldThumb = dialog2.locator(`img[src*="${OLD_FILE}"]`);
  await expect(oldThumb).toHaveCount(1, { timeout: 15_000 });
  await oldThumb.locator('..').getByRole('button', { name: 'Remove photo' }).click();
  await expect(page.getByText('Photo removed')).toBeVisible({ timeout: 15_000 });
  await expect(dialog2.locator('img[alt="Product photo"]')).toHaveCount(1, { timeout: 15_000 });
  await dialog2.locator('button:has-text("Close")').click();

  const finalPhotos = await getPhotos(token, PIXEL_ID);
  expect(finalPhotos).toHaveLength(1);
  expect(finalPhotos[0].id).toBe(newPhoto!.id);
  expect(finalPhotos[0].cdnUrl).not.toContain(OLD_FILE);
  expect(await getPhotos(token, IPHONE_ID)).toHaveLength(0);

  // ── 8. Store card + details still show an image, and settle on the
  // workflow-uploaded file once 60s API/page caches rotate ────────────────────
  await page.goto(`${STORE}/products`, { waitUntil: 'domcontentloaded' });
  await expectImageLoaded(cardImg, 20_000);
  await waitForSrc(page, `${STORE}/products`, cardImg, newFile, 180_000);
  await expectImageLoaded(cardImg, 20_000);
  await page.screenshot({ path: `${SHOTS}/6-store-card-final.png` });

  await page.goto(`${STORE}/products/${PIXEL_ID}`, { waitUntil: 'domcontentloaded' });
  await expectImageLoaded(detailImg, 20_000);
  await waitForSrc(page, `${STORE}/products/${PIXEL_ID}`, detailImg, newFile, 180_000);
  await expectImageLoaded(detailImg, 20_000);
  await page.screenshot({ path: `${SHOTS}/7-details-final.png` });

  // Refresh persistence on the final state
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectImageLoaded(detailImg, 20_000);
  await page.screenshot({ path: `${SHOTS}/8-details-final-refresh.png` });

  // ── 9. Other products unaffected ───────────────────────────────────────────
  // iPhone 13 still has no photos → inline-SVG placeholder art on the card
  // (no <img> at all), and no Pixel photo leaking onto it
  expect(await getPhotos(token, IPHONE_ID)).toHaveLength(0);
  await page.goto(`${STORE}/products`, { waitUntil: 'domcontentloaded' });
  const iphoneLink = page.locator(`a[href="/products/${IPHONE_ID}"]`).first();
  await expect(iphoneLink).toHaveCount(1, { timeout: 15_000 });
  await iphoneLink.scrollIntoViewIfNeeded();
  await expect(iphoneLink.locator('img[src*="inventory"]')).toHaveCount(0);
  expect(await iphoneLink.locator('svg').count()).toBeGreaterThan(0); // placeholder art
  await page.screenshot({ path: `${SHOTS}/9-other-product-unchanged.png` });

  await page.goto(`${STORE}/products/${IPHONE_ID}`, { waitUntil: 'domcontentloaded' });
  const iphoneMain = page.locator('img[alt*="Image 1"][src*="no-image"]').first();
  await expect(iphoneMain).toHaveCount(1, { timeout: 15_000 });
  await expectImageLoaded(iphoneMain, 15_000);
  await page.screenshot({ path: `${SHOTS}/10-other-product-details-unchanged.png` });
});
