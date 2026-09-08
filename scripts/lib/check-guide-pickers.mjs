import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';

export async function verifyGuidePickers({ browser, origin }) {
  for (const colorScheme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      for (const width of [319, 375, 768, 959, 960, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(origin, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('.provider-tabs').count(), 0, 'retired tabs are absent');
        assert.equal(await page.locator('.hero-provider-link').count(), 3);
        assert.equal(await page.locator('.home-content > p').first().textContent().then((s) => s.replace(/\s+/g, ' ').trim()), 'practical guidance for working with AI under constraints and tradeoffs of the real world.');
        const geometry = await page.evaluate(() => {
          const highlight = document.querySelector('.keyword-highlight');
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            buttons: [...document.querySelectorAll('.hero-provider-link')].map((button) => ({
              label: button.textContent.trim(), href: button.getAttribute('href'),
              radius: getComputedStyle(button).borderRadius,
              highlightRadius: getComputedStyle(highlight).borderRadius,
              inView: button.getBoundingClientRect().right <= innerWidth,
            })),
          };
        });
        assert.equal(geometry.overflow, 0, `${width}px homepage overflows`);
        assert.deepEqual(geometry.buttons.map(({ label }) => label), ['codex', 'claude code', 'grok']);
        assert.deepEqual(geometry.buttons.map(({ href }) => href), ['/guides/codex/', '/guides/claude-code/', '/guides/grok/']);
        assert.ok(geometry.buttons.every((button) => button.inView && button.radius === button.highlightRadius));
        const trigger = page.locator('.header-guide-picker-trigger');
        await trigger.focus();
        await page.keyboard.press('Enter');
        const menu = page.locator('.guide-page-options:visible');
        await menu.waitFor();
        assert.equal(await menu.locator('[data-slot="dropdown-group"]').count(), 4);
        assert.deepEqual(await menu.locator('[data-slot="dropdown-group"]').evaluateAll((groups) => groups.map((group) => group.getAttribute('aria-label'))), ['handbook', 'codex', 'claude code', 'grok']);
        const bounds = await menu.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, `${width}px guide menu stays within viewport`);
        assert.equal(await menu.locator('a[href="/handbook/operating-agents/"]').count(), 1);
        assert.equal(await menu.locator('[aria-label="handbook"] a[href="/archive/claude-code-tools/"]').count(), 0);
        assert.equal(await menu.locator('[aria-label="claude code"] a[href="/archive/claude-code-tools/"]').count(), 1);
        await page.keyboard.press('Escape');
        assert.ok(await trigger.evaluate((el) => el === document.activeElement), 'homepage picker restores focus');
      }
      await page.locator('.header-guide-picker-trigger').click();
      await page.locator('.guide-page-options:visible a[href="/guides/grok/"]').click();
      await page.waitForURL('**/guides/grok/');
      const sidebarTrigger = page.locator('.sidebar-guide-picker-trigger');
      assert.equal((await sidebarTrigger.textContent()).trim(), 'grok');
      await sidebarTrigger.focus();
      await page.keyboard.press('Enter');
      const report = await new AxeBuilder({ page }).include('.guide-page-options[data-state="open"]').analyze();
      assert.deepEqual(report.violations.map(({ id }) => id), [], 'shared picker passes accessibility checks');
      await page.locator('.guide-page-options:visible a[href="/handbook/operating-agents/"]').click();
      await page.waitForURL('**/handbook/operating-agents/');
      assert.equal((await sidebarTrigger.textContent()).trim(), 'handbook');
      assert.equal(await page.locator('.guide-page-options:visible').count(), 0);
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  }
  console.log('homepage provider links and shared guide pickers passed at seven widths in both themes');
}
