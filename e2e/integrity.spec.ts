import { expect, test } from '@playwright/test';
import { completeSurvey, reachReport, startSurvey } from './journey';

/**
 * The honesty guarantees are the project's credibility, so they are the part
 * most worth guarding. Each of these fails loudly if a later change quietly
 * turns a declared asset into a verified one, or lets an unapproved partner
 * name reach the bundle.
 */
test.describe('integrity guarantees', () => {
  test('no partner branding reaches the page while approval is pending', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).not.toContainText(/Sarawak Artificial Intelligence/i);

    // The header notice is hidden on narrow screens for space, so the guarantee
    // is that the pending status is disclosed on the page, not that it sits
    // above the fold. The footer carries it at every width.
    const pending = page.getByText(/partnership invitation in progress/i);
    expect(await pending.count()).toBeGreaterThan(0);
    const footerNotice = pending.last();
    await footerNotice.scrollIntoViewIfNeeded();
    await expect(footerNotice).toBeVisible();
  });

  test('the WhatsApp bubble never opens a dead link when no number is set', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /WhatsApp us/ })).toHaveCount(0);
    await page.getByRole('button', { name: /WhatsApp us/ }).click();
    await expect(page.getByRole('status')).toContainText(/goes live/i);
  });

  test('declared assets are never reported as verified', async ({ page }) => {
    await startSurvey(page, 'founder');
    await completeSurvey(page);
    await reachReport(page);

    // Two links were supplied and none can be fetched from a browser.
    await expect(page.getByText('0 of 2')).toBeVisible();

    // Confidence must stay capped while nothing has been confirmed.
    await expect(page.getByText(/^Good$/)).toHaveCount(0);

    const json = await page.evaluate(() => {
      const raw = window.localStorage.getItem('fame-survey-session-v1');
      return raw ? JSON.parse(raw).report : null;
    });
    expect(json.assets_reviewed).toBe(0);
    expect(json.assets_submitted).toBeGreaterThan(0);
    expect(json.confidence_level).not.toBe('good');
    expect(json.scope).toBe('marketing_digital_presence');
  });

  test('every finding carries a classification', async ({ page }) => {
    await startSurvey(page, 'founder');
    await completeSurvey(page);
    await reachReport(page);
    const json = await page.evaluate(() => {
      const raw = window.localStorage.getItem('fame-survey-session-v1');
      return JSON.parse(raw!).report;
    });
    for (const f of [...json.strengths, ...json.gaps]) {
      expect(['fact', 'inference', 'recommendation', 'limitation']).toContain(f.classification);
      expect(f.evidence.length).toBeGreaterThan(0);
    }
    expect(json.limitations.length).toBeGreaterThan(0);
  });

  test('succession is reflected, never scored', async ({ page }) => {
    await startSurvey(page, 'founder');
    await completeSurvey(page);
    await reachReport(page);
    const json = await page.evaluate(() => {
      const raw = window.localStorage.getItem('fame-survey-session-v1');
      return JSON.parse(raw!).report;
    });
    // Only marketing dimensions are published; no succession score exists.
    const keys = json.dimension_scores.map((d: { key: string }) => d.key);
    expect(keys).not.toContain('succession');
    expect(json.succession_reflection.founderDependence.key).toBeTruthy();
  });
});
