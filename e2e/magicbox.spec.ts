import { expect, test } from '@playwright/test';
import { completeSurvey, startSurvey } from './journey';

test.describe('AI Magic Box', () => {
  test.beforeEach(async ({ page }) => {
    await startSurvey(page, 'founder');
    await completeSurvey(page);
  });

  test('classifies, normalises and deduplicates pasted links', async ({ page }) => {
    await page.locator('#paste').fill(
      [
        'www.shirazempire.com.my',
        'https://www.facebook.com/shirazempirekch?mibextid=abc',
        'facebook.com/shirazempirekch',
        '@shiraz_empire',
        'https://maps.app.goo.gl/A1b2C3',
        'shopee.com.my/shirazempire',
        'https://wa.me/60128889999',
      ].join('\n'),
    );

    // Seven lines, one of which repeats a page already listed.
    await expect(page.getByRole('button', { name: /Add 6 detected assets/ })).toBeVisible();
    await page.getByRole('button', { name: /Add 6 detected assets/ }).click();

    const rows = page.locator('section[aria-labelledby="detected-heading"] li');
    await expect(rows).toHaveCount(6);

    // Tracking parameters are stripped so the same page counts once.
    await expect(page.getByTitle('https://facebook.com/shirazempirekch')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('mibextid');

    // Platforms are identified rather than left for the respondent to sort out.
    const platforms = await page.locator('section[aria-labelledby="detected-heading"] select')
      .evaluateAll((els) => els.map((e) => (e as HTMLSelectElement).value));
    expect(platforms).toContain('website');
    expect(platforms).toContain('facebook');
    expect(platforms).toContain('google_business');
    expect(platforms).toContain('shopee');
    expect(platforms).toContain('whatsapp');
  });

  test('every asset is labelled declared, never verified', async ({ page }) => {
    await page.locator('#paste').fill('www.example.com.my');
    await page.getByRole('button', { name: /Add 1 detected asset/ }).click();
    const row = page.locator('section[aria-labelledby="detected-heading"] li').first();
    await expect(row.getByText('declared', { exact: true })).toBeVisible();
  });

  test('an asset can be removed before anything is scored', async ({ page }) => {
    await page.locator('#paste').fill('www.example.com.my\nfacebook.com/example');
    await page.getByRole('button', { name: /Add 2 detected assets/ }).click();
    const rows = page.locator('section[aria-labelledby="detected-heading"] li');
    await expect(rows).toHaveCount(2);
    await rows.first().getByRole('button', { name: /Remove/ }).click();
    await expect(rows).toHaveCount(1);
  });

  test('the survey can be completed with no links at all', async ({ page }) => {
    await expect(page.getByText(/None yet/)).toBeVisible();
    await page.getByRole('button', { name: /Review and submit/ }).click();
    await expect(page.getByRole('heading', { name: /Review before you submit/ })).toBeVisible();
  });
});
