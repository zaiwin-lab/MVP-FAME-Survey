import { expect, test } from '@playwright/test';
import { completeSurvey, reachReport, startSurvey } from './journey';

const LANGUAGES = [
  { name: 'Bahasa Malaysia', cta: /Semak kesediaan perniagaan saya/ },
  { name: '中文', cta: /检测我的企业准备度/ },
  { name: 'Jaku Iban', cta: /Peresa sedia pengawa aku/ },
];

test.describe('four languages', () => {
  for (const lang of LANGUAGES) {
    test(`the landing page translates into ${lang.name}`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: lang.name }).first().click();
      await expect(page.getByRole('button', { name: lang.cta }).first()).toBeVisible();
    });
  }

  test('the choice survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Bahasa Malaysia' }).first().click();
    await page.reload();
    await expect(page.getByRole('button', { name: LANGUAGES[0].cta }).first()).toBeVisible();
  });

  test('a generated report re-renders when the language changes', async ({ page }) => {
    await startSurvey(page, 'founder');
    await completeSurvey(page);
    await reachReport(page);

    // Generated recommendations must follow the toggle, not just the labels.
    await expect(page.getByRole('heading', { name: /Three things you could do/ })).toBeVisible();
    await page.getByRole('button', { name: '中文' }).first().click();
    await expect(page.getByRole('heading', { name: /七天内可以做的三件事/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /您的接班反思/ })).toBeVisible();
  });
});
