import { expect, test } from '@playwright/test';
import { answerCurrent, startSurvey } from './journey';

/** Walks forward until the named question is on screen. */
async function advanceTo(page: import('@playwright/test').Page, heading: RegExp) {
  for (let i = 0; i < 20; i++) {
    if (await page.getByRole('heading', { name: heading }).count()) return;
    await answerCurrent(page);
    await page.getByRole('button', { name: /^Next$/ }).click();
  }
  throw new Error(`Never reached ${heading}`);
}

test.describe('conditional questions', () => {
  test('a single-site business is never asked about other divisions', async ({ page }) => {
    await startSurvey(page, 'founder');
    await advanceTo(page, /How many locations/);
    await page.getByRole('radio', { name: 'One' }).click();
    await page.getByRole('button', { name: /^Next$/ }).click();
    await expect(page.getByRole('heading', { name: /other divisions/i })).toHaveCount(0);
  });

  test('a multi-site business is asked, and its main division is excluded', async ({ page }) => {
    await startSurvey(page, 'founder');

    // Record the main division so the follow-up can be checked against it.
    await advanceTo(page, /Where in Sarawak/);
    await page.locator('main select').selectOption('Kuching');
    await page.getByRole('button', { name: /^Next$/ }).click();

    await advanceTo(page, /How many locations/);
    await page.getByRole('radio', { name: '4 to 10' }).click();
    await page.getByRole('button', { name: /^Next$/ }).click();

    await expect(page.getByRole('heading', { name: /other divisions/i })).toBeVisible();
    const options = await page.locator('main button[aria-pressed]').allTextContents();
    expect(options).not.toContain('Kuching');
    expect(options.length).toBeGreaterThan(5);
  });

  test('the total question count grows when the follow-up appears', async ({ page }) => {
    await startSurvey(page, 'founder');
    await advanceTo(page, /How many locations/);
    const before = await page.getByText(/Question \d+ of \d+/).first().textContent();
    await page.getByRole('radio', { name: '4 to 10' }).click();
    await page.getByRole('button', { name: /^Next$/ }).click();
    const after = await page.getByText(/Question \d+ of \d+/).first().textContent();
    const total = (s: string | null) => Number(s!.match(/of (\d+)/)![1]);
    expect(total(after)).toBe(total(before) + 1);
  });
});
