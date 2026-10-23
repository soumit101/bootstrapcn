import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.BOOTSTRAPCN_TEST_URL || 'http://127.0.0.1:8080';
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium') });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
mkdirSync('test-results', { recursive: true });
try {
  await page.goto(baseURL + '/');
  await page.waitForFunction(() => !!window.BootstrapCN);
  assert.equal(await page.locator('.component').count(), 53);
  assert.equal(await page.locator('.hero .sc-button').first().evaluate(el => getComputedStyle(el).color !== getComputedStyle(el).backgroundColor), true, 'Primary link text is readable');
  await page.screenshot({ path: 'test-results/gallery-light.png', fullPage: true });

  await page.locator('[data-bs-target="#profile-dialog"]').click();
  await page.waitForFunction(() => document.querySelector('#profile-dialog').open);
  assert.equal(await page.evaluate(() => document.querySelector('#profile-dialog').contains(document.activeElement)), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#profile-dialog').open);
  assert.equal(await page.locator('[data-bs-target="#profile-dialog"]').evaluate(el => el === document.activeElement), true);

  await page.locator('[data-bs-target="#settings-sheet"]').click();
  await page.waitForFunction(() => document.querySelector('#settings-sheet').open);
  await page.locator('#settings-sheet [data-bs-dismiss]').click();
  await page.waitForFunction(() => !document.querySelector('#settings-sheet').open);

  await page.locator('#menu [data-bs-toggle="menu"]').click();
  await page.locator('#menu .menu-item').first().waitFor({ state: 'visible' });
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('menu-item')), true);
  await page.keyboard.press('Escape');
  await page.locator('#menu .menu').waitFor({ state: 'hidden' });

  await page.locator('#security-tab').click();
  await page.locator('#security-panel').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#account-panel').isVisible(), false);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#account-tab').getAttribute('aria-selected'), 'true');

  await page.locator('#role-form [data-bs-toggle]').click();
  await page.locator('#role-form [data-bs-value="editor"]').click();
  assert.equal(await page.locator('#role-form').evaluate(el => new FormData(el).get('role')), 'editor');
  await page.evaluate(() => { BootstrapCN.init(); BootstrapCN.init(); });
  assert.equal(await page.locator('#role-form input[name="role"]').count(), 1);

  await page.locator('#accordion summary').first().click();
  assert.equal(await page.locator('#accordion details').first().getAttribute('open'), '');
  await page.locator('[data-sc-toggle]').first().click();
  assert.equal(await page.locator('[data-sc-toggle]').first().getAttribute('aria-pressed'), 'true');

  await page.locator('#toast [data-sc-toast]').click();
  await page.locator('.sc-toast').waitFor({ state: 'visible' });
  await page.locator('.sc-toast button').click();
  assert.equal(await page.locator('.sc-toast').count(), 0);
  await page.evaluate(() => BootstrapCN.toast('<img src=x onerror=alert(1)>', { duration: 0 }));
  assert.equal(await page.locator('.sc-toast img').count(), 0);
  assert.match(await page.locator('.sc-toast').textContent(), /<img/);
  await page.locator('.sc-toast button').click();

  await page.locator('[data-bs-toggle="tooltip"]').hover();
  await page.locator('.tooltip').waitFor({ state: 'visible' });
  await page.mouse.move(0, 0);
  await page.locator('#tooltip [data-bs-toggle="popover"]').click();
  await page.locator('.popover').waitFor({ state: 'visible' });
  await page.locator('#tooltip [data-bs-toggle="popover"]').click();

  await page.locator('[data-sc-theme-value="dark"]').click();
  assert.equal(await page.locator('html').getAttribute('data-bs-theme'), 'dark');
  await page.reload();
  await page.waitForFunction(() => !!window.BootstrapCN);
  assert.equal(await page.locator('html').getAttribute('data-bs-theme'), 'dark');
  await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: 'test-results/gallery-dark.png', fullPage: true });
  await page.evaluate(() => BootstrapCN.setTheme('system'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForFunction(() => document.documentElement.dataset.bsTheme === 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForFunction(() => document.documentElement.dataset.bsTheme === 'dark');
  await page.evaluate(() => BootstrapCN.setTheme('light'));

  await page.locator('#component-search').fill('dialog');
  assert.equal(await page.locator('.component:visible').count(), 2);
  await page.locator('#component-search').fill('no-such-component');
  assert.equal(await page.locator('#no-results').isVisible(), true);
  await page.locator('#component-search').fill('');
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL + '/');
  await page.screenshot({ path: 'test-results/gallery-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('PASS: dialog/focus, drawer, menu/keyboard, tabs/keyboard, combobox POST, idempotent init, accordion, toggle, toast/escaping, tooltip, popover, themes/persistence/system, search, responsive overflow, no JS errors.');
} finally { await browser.close(); }
