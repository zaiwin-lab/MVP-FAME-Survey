import { expect, test } from '@playwright/test';
import { startSurvey } from './journey';

test.describe('input controls', () => {
  test('an untouched slider is not treated as an answer', async ({ page }) => {
    await startSurvey(page, 'founder');
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: /^Next$/ }).click(); // role
    await page.getByRole('radio', { name: '45-54' }).click();
    await page.getByRole('button', { name: /^Next$/ }).click(); // age

    const slider = page.locator('input[type=range]');
    await expect(slider).toBeVisible();
    // A range input always holds a value; Next must stay blocked regardless.
    await expect(page.getByRole('button', { name: /^Next$/ })).toBeDisabled();

    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('button', { name: /^Next$/ })).toBeEnabled();
  });

  test('the slider announces its band, not its index', async ({ page }) => {
    await startSurvey(page, 'founder');
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: /^Next$/ }).click();
    await page.getByRole('radio', { name: '45-54' }).click();
    await page.getByRole('button', { name: /^Next$/ }).click();

    const slider = page.locator('input[type=range]');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuetext', /years/);
  });

  test('a long option list is a dropdown rather than a wall of cards', async ({ page }) => {
    await startSurvey(page, 'founder');
    for (let i = 0; i < 3; i++) {
      const radios = page.locator('[role="radio"]');
      if (await radios.count()) await radios.first().click();
      else {
        const slider = page.locator('input[type=range]');
        await slider.focus();
        await page.keyboard.press('ArrowRight');
      }
      await page.getByRole('button', { name: /^Next$/ }).click();
    }
    await expect(page.locator('main select')).toBeVisible();
    await expect(page.locator('main select option')).not.toHaveCount(0);
  });

  test('an optional question can be declined and skipped', async ({ page }) => {
    await startSurvey(page, 'founder');
    await page.locator('[role="radio"]').first().click();
    await page.getByRole('button', { name: /^Next$/ }).click();
    // Age is optional, so Next is available before answering.
    await expect(page.getByRole('button', { name: /^Next$/ })).toBeEnabled();
    await page.getByRole('button', { name: /Prefer not to answer/ }).click();
    await expect(page.getByRole('button', { name: /Prefer not to answer/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
