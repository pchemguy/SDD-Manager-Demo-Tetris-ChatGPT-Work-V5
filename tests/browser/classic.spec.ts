/** Native controls exercise the real application; fixtures only prepare rare board states. */
import { test, expect } from '@playwright/test';
test('start keyboard play pause restart and visible board', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await expect(page.locator('#status')).toHaveText('Playing');
  await expect(page.locator('#board')).toBeFocused();
  const x = await page.evaluate(() => window.__tetris.game.active!.x);
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => window.__tetris.game.active!.x)).toBe(x+1);
  await page.keyboard.press('ArrowUp');
  expect(await page.evaluate(() => window.__tetris.game.active!.rotation)).toBe(1);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#score')).toHaveText('1');
  await page.keyboard.press('p'); await expect(page.locator('#status')).toHaveText('Paused');
  const frozen = await page.evaluate(() => JSON.stringify(window.__tetris.game.active));
  await page.keyboard.press('ArrowLeft');
  expect(await page.evaluate(() => JSON.stringify(window.__tetris.game.active))).toBe(frozen);
  await page.keyboard.press('p');await page.keyboard.press('r');
  await expect(page.locator('#score')).toHaveText('0');
  expect(await page.locator('#board').evaluate((node: HTMLCanvasElement) => {
    const data=node.getContext('2d')!.getImageData(0,0,300,600).data;
    return [...data].filter((value,i)=>i%4===0 && value>70).length;
  })).toBeGreaterThan(100);
});
