/** Real settings/forms, modern keys and Canvas ghost boundaries on the served app. */
import { test, expect, type Page } from '@playwright/test';
const errors=new WeakMap<Page,string[]>();
test.beforeEach(({page})=>{const list:string[]=[];errors.set(page,list);page.on('pageerror',error=>list.push(error.message));});
test.afterEach(({page})=>{expect(errors.get(page)).toEqual([]);});
async function open(page:import('@playwright/test').Page){
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:00Z'));
  await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
}
test('six session controls reflect defaults and native form input keeps gameplay focus isolated',async({page})=>{
  await open(page);
  const defaults={'Ghost piece':'show','Hard drop':'on','Next-piece preview':'on','Hard-drop locking':'follow','General locking':'interval','Hold piece':'on'};
  for(const [label,value] of Object.entries(defaults))await expect(page.getByLabel(label,{exact:true})).toHaveValue(value);
  const ghost=page.getByLabel('Ghost piece',{exact:true});await ghost.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
  await expect(ghost).toHaveValue('dynamic');await page.keyboard.press('p');await expect(page.locator('#status')).toHaveText('Playing');
  const selections={'Ghost piece':'hide','Hard drop':'off','Next-piece preview':'off','Hard-drop locking':'instant','General locking':'failed','Hold piece':'off'};
  const next=await page.evaluate(()=>window.__tetris.game.next);
  for(const [label,value] of Object.entries(selections))await page.getByLabel(label,{exact:true}).selectOption(value);
  expect(await page.evaluate(()=>window.__tetris.game.settings)).toEqual({ghost:'hide',hardDrop:'off',next:'off',dropLock:'instant',lock:'failed',hold:'off'});
  expect(await page.evaluate(()=>window.__tetris.game.next)).toBe(next);
  await expect(page.locator('#next-card')).toBeHidden();await expect(page.locator('#hold-card')).toBeHidden();
  await page.locator('#board').focus();const before=await page.evaluate(()=>JSON.stringify(window.__tetris.game.active));
  await page.keyboard.press('Space');await page.keyboard.press('c');expect(await page.evaluate(()=>JSON.stringify(window.__tetris.game.active))).toBe(before);
});
test('hold and hard drop use native keys and ignore hard-drop repeat after immediate lock',async({page})=>{
  await open(page);const first=await page.evaluate(()=>window.__tetris.game.active!.type);
  await page.keyboard.press('c');expect(await page.evaluate(()=>window.__tetris.game.held!.type)).toBe(first);
  const held=await page.evaluate(()=>JSON.stringify(window.__tetris.game));await page.keyboard.press('c');expect(await page.evaluate(()=>JSON.stringify(window.__tetris.game))).toBe(held);
  await page.getByLabel('Hard-drop locking',{exact:true}).selectOption('instant');await page.locator('#board').focus();
  await page.evaluate(()=>{const {game,render}=window.__tetris;game.active={type:'O',rotation:0,x:4,y:0};render();});
  await page.keyboard.down('Space');await page.keyboard.down('Space');await page.keyboard.up('Space');
  expect(await page.evaluate(()=>window.__tetris.game.board.flat().filter(Boolean).length)).toBe(4);
});
test('dynamic ghost hides upper landings shows straddling positions and matches drop',async({page},info)=>{
  await open(page);await page.getByLabel('Ghost piece',{exact:true}).selectOption('dynamic');
  await page.evaluate(()=>{const {game,render}=window.__tetris;game.active={type:'O',rotation:0,x:4,y:0};game.board[10].fill('J');render();});
  const pixel=async(y:number)=>page.locator('#board').evaluate((node:HTMLCanvasElement,row)=>Array.from(node.getContext('2d')!.getImageData(135,row*30+15,1,1).data),y);
  expect(await pixel(8)).toEqual([12,22,34,255]);
  await page.getByLabel('Ghost piece',{exact:true}).selectOption('show');expect((await pixel(8))[0]).toBeGreaterThan(12);
  await page.getByLabel('Ghost piece',{exact:true}).selectOption('dynamic');
  await page.evaluate(()=>{const {game,render}=window.__tetris;game.board[10].fill(null);game.board[11].fill('J');render();});
  expect(await page.evaluate(()=>window.__tetris.game.ghost!.y)).toBe(9);expect((await pixel(9))[0]).toBeGreaterThan(12);
  await page.screenshot({path:info.outputPath('modern-desktop.png'),fullPage:true});
  await page.locator('#board').focus();await page.keyboard.press('Space');expect(await page.evaluate(()=>window.__tetris.game.active!.y)).toBe(9);
});
