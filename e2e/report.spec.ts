import { expect, test } from '@playwright/test';
import { completeSurvey, reachReport, startSurvey } from './journey';

test.describe('the snapshot', () => {
  test('renders every promised section', async ({ page }) => {
    await startSurvey(page, 'founder');
    await completeSurvey(page);
    await reachReport(page);

    await expect(page.getByRole('heading', { name: /Dimension scores/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /improve only one thing/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /three strongest signals/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Three visibility gaps/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /seven days/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Two AI opportunities/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /succession reflection/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /does not cover/ })).toBeVisible();
  });

  test('exposes the structured output it was rendered from', async ({ page }) => {
    await startSurvey(page, 'founder');
    await completeSurvey(page);
    await reachReport(page);
    await page.getByRole('button', { name: /Show the structured output/ }).click();
    await expect(page.locator('pre')).toContainText('"scope": "marketing_digital_presence"');
  });

  test('scoring is deterministic for identical input', async ({ page }) => {
    const run = async () => {
      // localStorage is only reachable once a document from the origin is loaded.
      await page.goto('/');
      await page.evaluate(() => window.localStorage.clear());
      await startSurvey(page, 'founder');
      await completeSurvey(page);
      await reachReport(page);
      return page.evaluate(() => {
        const r = JSON.parse(window.localStorage.getItem('fame-survey-session-v1')!).report;
        return { score: r.overall_score, band: r.readiness_band_key };
      });
    };
    const first = await run();
    const second = await run();
    expect(second).toEqual(first);
  });
});
