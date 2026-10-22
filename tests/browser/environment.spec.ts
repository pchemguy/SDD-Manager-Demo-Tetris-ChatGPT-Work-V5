/** Environment capability checks; these do not certify game acceptance. */
import { test, expect } from '@playwright/test';
for (const cycle of [1, 2]) {
  test(`isolated interaction and Canvas cycle ${cycle}`, async ({ page, browser }, info) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Stack — Browser Tetris');
    await page.setContent('<button>Paint</button><canvas width="40" height="40"></canvas>');
    await page.evaluate(() => document.querySelector('button')!.onclick = () => {
      const context = document.querySelector('canvas')!.getContext('2d')!;
      context.fillStyle = '#00cc88'; context.fillRect(0, 0, 40, 40);
    });
    await page.getByRole('button', { name: 'Paint' }).click();
    expect(await page.locator('canvas').evaluate(canvas =>
      Array.from((canvas as HTMLCanvasElement).getContext('2d')!.getImageData(20, 20, 1, 1).data))).toEqual([0, 204, 136, 255]);
    await page.screenshot({ path: info.outputPath('environment.png') });
    console.log(JSON.stringify({ browser: info.project.name, version: browser.version(), cycle }));
  });
}
