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
test('controls retain keyboard focus and window blur pauses the round', async ({ page }) => {
  await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
  await page.locator('#restart').focus();
  await page.keyboard.press('p');await expect(page.locator('#status')).toHaveText('Playing');
  await page.locator('#board').focus();await page.keyboard.press('p');await expect(page.locator('#status')).toHaveText('Paused');
  await page.keyboard.press('p');
  // Modeled lifecycle delivery; this does not claim OS-window focus coverage.
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await expect(page.locator('#status')).toHaveText('Paused');
});
test('row clear and blocked spawn reach the UI without corrupting the board', async ({ page }) => {
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-01-01T00:00:00Z'));
  await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
  await page.evaluate(()=>{
    const {game,render}=window.__tetris;game.restart();
    game.board[19]=Array.from({length:10},(_,x)=>x>=3&&x<=6?null:'J');
    game.active={type:'I',rotation:0,x:3,y:18};game.advance(799);render();
  });
  await expect(page.locator('#lines')).toHaveText('0');
  await page.evaluate(()=>{window.__tetris.game.advance(1);window.__tetris.render();});
  await expect(page.locator('#lines')).toHaveText('1');await expect(page.locator('#score')).toHaveText('100');
  await page.evaluate(()=>{
    const {game,render}=window.__tetris;game.restart();game.next='I';
    for(let x=3;x<7;x++)game.board[1][x]='Z';
    game.active={type:'O',rotation:0,x:4,y:18};game.advance(800);render();
  });
  await expect(page.locator('#status')).toHaveText('Game over');
  await page.getByRole('button',{name:'Play again',exact:true}).click();
  await expect(page.locator('#status')).toHaveText('Playing');await expect(page.locator('#score')).toHaveText('0');
});
test('layout and gameplay screenshot', async ({ page }, info) => {
  await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
  await page.evaluate(()=>{
    const {game,render}=window.__tetris;game.restart();
    game.board[19]=['J','J','L',null,null,null,'T','T','Z','Z'];
    game.board[18]=[null,'J','L',null,null,null,null,'T','Z',null];
    game.active={type:'S',rotation:0,x:3,y:7};render();
  });
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('classic-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('classic-narrow.png'),fullPage:true});
});
