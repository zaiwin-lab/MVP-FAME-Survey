import type { Page } from '@playwright/test';

export type Journey = 'founder' | 'successor' | 'manager';

const CARD: Record<Journey, RegExp> = {
  founder: /Founder or business owner/,
  successor: /Next-generation successor/,
  manager: /Senior manager or transformation leader/,
};

/** Landing through consent to the first question. */
export async function startSurvey(page: Page, journey: Journey = 'founder') {
  await page.goto('/');
  await page.getByRole('button', { name: /Check my business readiness/ }).first().click();
  await page.locator('#consent-research').check();
  await page.getByRole('button', { name: /Agree and continue/ }).click();
  await page.getByRole('button', { name: CARD[journey] }).click();
  await page.getByRole('button', { name: /Start the questions/ }).click();
}

/** Answers whichever control the current question uses. */
export async function answerCurrent(page: Page) {
  const range = page.locator('input[type=range]');
  if (await range.count()) {
    await range.focus();
    await page.keyboard.press('ArrowRight');
    return;
  }
  const select = page.locator('main select');
  if (await select.count()) {
    const values = await select.locator('option:not([disabled])').evaluateAll((os) =>
      os.map((o) => (o as HTMLOptionElement).value),
    );
    await select.selectOption(values[values.length - 1]);
    return;
  }
  const radios = page.locator('[role="radio"]');
  if (await radios.count()) {
    await radios.first().click();
    return;
  }
  const chips = page.locator('main button[aria-pressed]');
  if (await chips.count()) await chips.first().click();
}

/** Walks the whole question set and stops on the Magic Box. */
export async function completeSurvey(page: Page) {
  for (let i = 0; i < 60; i++) {
    if (await page.getByRole('heading', { name: 'AI Magic Box' }).count()) return;
    await answerCurrent(page);
    const next = page.getByRole('button', { name: /^(Next|Continue to the AI Magic Box)$/ });
    if (await next.count()) await next.first().click();
  }
  throw new Error('Never reached the AI Magic Box');
}

/** Fills the Magic Box and drives through to the rendered report. */
export async function reachReport(page: Page, links = 'www.demo.com.my\nhttps://maps.app.goo.gl/x1') {
  await page.locator('#paste').fill(links);
  const add = page.getByRole('button', { name: /Add \d+ detected asset/ });
  if (await add.isEnabled()) await add.click();
  await page.locator('#description').fill(
    'A family retail business in Kuching selling household goods to local residents since 1998.',
  );
  await page.locator('#products').fill('Household goods, school supplies');
  await page.locator('#customers').fill('Local residents in Kuching');
  await page.locator('#location').fill('Kuching, Sarawak');
  await page.getByRole('button', { name: /Review and submit/ }).click();
  await page.getByRole('button', { name: /Submit and generate my snapshot/ }).click();
  await page.getByRole('heading', { name: /Readiness Snapshot/ }).waitFor({ timeout: 30_000 });
}
