import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.BOOTSTRAPCN_TEST_URL || 'http://127.0.0.1:8080';
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium') });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = []; page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
mkdirSync('test-results', { recursive: true });
try {
  await page.goto(baseURL + '/'); await page.waitForFunction(() => !!window.BootstrapCN);
  // Check real computed foreground/background contrast for every palette and mode.
  const contrasts = await page.evaluate(() => {
    const luminance = color => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(0,0,1,1);
      const [r,g,b] = [...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4; });
      return .2126*r + .7152*g + .0722*b;
    };
    const result = [];
    for (const palette of BootstrapCN.palettes) for (const mode of ['light','dark']) {
      BootstrapCN.setPalette(palette); BootstrapCN.setTheme(mode);
      const style = getComputedStyle(document.querySelector('#buttons .sc-button'));
      const a = luminance(style.color), b = luminance(style.backgroundColor);
      result.push({ palette, mode, ratio: (Math.max(a,b)+.05)/(Math.min(a,b)+.05), bg: style.backgroundColor });
    }
    return result;
  });
  for (const result of contrasts) assert.ok(result.ratio >= 4.5, JSON.stringify(result));
  assert.equal(contrasts.length, 20);
  assert.equal(await page.evaluate(() => {
    BootstrapCN.setPalette('violet'); BootstrapCN.setTheme('light');
    const button = document.createElement('button'); button.className = 'btn-solid theme-primary'; document.body.append(button);
    const matches = getComputedStyle(button).backgroundColor === getComputedStyle(document.querySelector('#buttons .sc-button')).backgroundColor;
    button.remove(); return matches;
  }), true, 'Native Bootstrap buttons inherit the palette');
  await page.selectOption('#palette-select','violet');
  await page.reload(); await page.waitForFunction(() => !!window.BootstrapCN);
  assert.equal(await page.evaluate(() => BootstrapCN.getPalette()), 'violet');
  assert.equal(await page.locator('#palette-select').inputValue(), 'violet');
  await page.evaluate(() => BootstrapCN.setTheme('light'));
  await page.locator('#theming').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/theme-violet.png' });

  await page.locator('#command-input').fill('appearance');
  assert.equal(await page.locator('#command [data-sc-command-item]:visible').count(),1);
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Appearance');
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#command-input').inputValue(), '');
  await page.locator('#command-input').fill('not-a-command');
  assert.equal(await page.locator('[data-sc-command-empty]').isVisible(), true);
  await page.locator('#command-input').fill('');

  const table = page.locator('#data-table');
  assert.equal(await table.locator('tbody tr:visible').count(),3);
  await table.locator('[data-sc-page-next]').click();
  assert.match(await table.locator('[data-sc-page-info]').textContent(), /Page 2 of 2/);
  await page.locator('#people-filter').fill('admin');
  assert.equal(await table.locator('tbody tr:visible').count(),2);
  await table.locator('[data-sc-select-all]').check();
  assert.equal(await table.locator('[data-sc-selection-count]').textContent(),'2 selected');
  await page.locator('#people-filter').fill('');
  await table.locator('[data-sc-sort]').last().click();
  assert.equal(await table.locator('tbody tr:visible').first().locator('td').last().textContent(),'2');
  await table.locator('[data-sc-sort]').last().click();
  assert.equal(await table.locator('tbody tr:visible').first().locator('td').last().textContent(),'12');
  await page.locator('#people-filter').fill('nothing-found');
  assert.equal(await table.locator('[data-sc-table-empty]').isVisible(),true);
  assert.equal(await table.locator('[data-sc-page-next]').isDisabled(),true);
  await page.locator('#people-filter').fill('');

  await page.locator('.sc-context-target').focus();
  await page.keyboard.press('Shift+F10');
  assert.equal(await page.locator('#project-context').evaluate(el => el.matches(':popover-open')),true);
  await page.keyboard.press('ArrowDown'); assert.equal(await page.evaluate(() => document.activeElement.textContent),'Duplicate');
  await page.keyboard.press('Escape'); assert.equal(await page.locator('.sc-context-target').evaluate(el => el === document.activeElement),true);

  await page.locator('.sc-resize-handle').focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.sc-resize-handle').getAttribute('aria-valuenow'),'55');
  await page.keyboard.press('End'); assert.equal(await page.locator('.sc-resize-handle').getAttribute('aria-valuenow'),'80');
  await page.keyboard.press('Home'); assert.equal(await page.locator('.sc-resize-handle').getAttribute('aria-valuenow'),'20');
  await page.locator('[data-sc-collapse-target="app-sidebar"]').click();
  assert.equal(await page.locator('#app-sidebar').isVisible(),false);
  await page.locator('[data-sc-collapse-target="app-sidebar"]').click();
  assert.equal(await page.locator('#app-sidebar').isVisible(),true);
  await page.locator('#toggle-group button').nth(1).click();
  assert.equal(await page.locator('#toggle-group [aria-pressed="true"]').count(),1);

  await page.locator('#verification-code').fill('123456');
  assert.equal(await page.locator('#otp-form').evaluate(el => new FormData(el).get('code')),'123456');
  assert.equal(await page.locator('#otp-form .otp-slot').count(),6);
  await page.locator('#otp-form').evaluate(el => el.reset());
  assert.equal(await page.locator('#verification-code').inputValue(),'');
  assert.equal(await page.locator('#otp-form .otp-slot-filled').count(),0);
  await page.locator('#role-form [data-bs-toggle]').click();
  await page.locator('#role-form [data-bs-value="editor"]').click();
  await page.locator('#role-form').evaluate(el => el.reset());
  assert.equal(await page.locator('#role-form').evaluate(el => new FormData(el).get('role')),'');
  await page.locator('#role-form [data-bs-toggle]').evaluate(el => { el.disabled = true; });
  assert.equal(await page.locator('#role-form').evaluate(el => new FormData(el).has('role')),false);
  await page.locator('#role-form [data-bs-toggle]').evaluate(el => { el.disabled = false; });
  await page.locator('#calendar [data-vc-date="2026-10-25"] button').click();
  assert.equal(await page.locator('#calendar-form').evaluate(el => new FormData(el).get('appointment')),'2026-10-25');
  await page.locator('#calendar-form').evaluate(el => el.reset());
  assert.equal(await page.locator('#calendar-form').evaluate(el => new FormData(el).get('appointment')),'2026-10-23');
  await page.locator('#deadline').focus();
  assert.equal(await page.evaluate(async () => (await import('/dist/bootstrapcn.js')).Datepicker.getInstance(document.querySelector('#deadline')).getSelectedDates().length),0);
  await page.keyboard.press('Escape');
  await page.locator('#feature-carousel [data-bs-slide="next"]').click();
  await page.waitForFunction(() => document.querySelectorAll('#feature-carousel .carousel-item')[1].classList.contains('active'));
  assert.equal(await page.locator('#chart .sc-chart-bar').count(),4);
  await page.evaluate(() => { BootstrapCN.init(); BootstrapCN.init(); });
  assert.equal(await page.locator('#chart .sc-chart-bar').count(),4);
  assert.equal(await page.locator('#otp-form .otp-slot').count(),6);
  await page.evaluate(() => { const el = document.querySelector('#chart'); BootstrapCN.dispose(el); BootstrapCN.init(el); });
  assert.equal(await page.locator('#chart .sc-chart-bar').count(),4);

  await page.locator('#component-search').fill('calendar');
  assert.equal(await page.locator('#component-nav a:visible').count(),1);
  await page.locator('#component-search').fill('');
  await page.setViewportSize({width:390,height:844});
  await page.locator('.mobile-nav-trigger').click();
  assert.equal(await page.locator('#component-search').isVisible(),true);
  await page.locator('#component-search').fill('sidebar');
  await page.locator('#component-nav a[href="#sidebar"]').click();
  assert.equal(await page.locator('#docs-sidebar').isVisible(),false);
  await page.locator('.mobile-nav-trigger').click(); await page.locator('#component-search').fill(''); await page.keyboard.press('Escape');
  assert.equal(await page.locator('#docs-sidebar').isVisible(),false);
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth, null, { timeout: 2000 });
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 20 palette/mode contrast checks, palette persistence, command search/keys, table filtering/sorting/paging/selection, context menu keys, resize keys, sidebar, toggle group, OTP POST, calendar POST, carousel, chart lifecycle, filtered navigation, mobile navigation, responsive layout.');
} finally { await browser.close(); }
