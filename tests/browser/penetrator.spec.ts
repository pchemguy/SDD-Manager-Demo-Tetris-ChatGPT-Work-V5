/** Native activation, bonus accounting, white raster output and held lifetime. */
import { test, expect, type Page } from '@playwright/test';
const errors=new WeakMap<Page,string[]>();
test.beforeEach(({page})=>{const list:string[]=[];errors.set(page,list);page.on('pageerror',error=>list.push(error.message));});
test.afterEach(({page})=>expect(errors.get(page)).toEqual([]));
async function open(page:Page){
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.clock.pauseAt(new Date('2026-01-01T00:00:00Z'));
  await page.goto('/');await page.getByRole('button',{name:'Start game',exact:true}).click();
  await page.getByLabel('Hard-drop locking',{exact:true}).selectOption('instant');await page.locator('#board').focus();
}
test('four-line clears update capped symbols and activation repeat cannot spend on the next piece',async({page})=>{
  await open(page);await expect(page.locator('#bonus-count')).toHaveText('0 bonuses available');
  for(let n=1;n<=4;n++){
    await page.evaluate(()=>{const {game,render}=window.__tetris;game.board=Array.from({length:20},()=>Array(10).fill(null));
      for(let y=16;y<20;y++)game.board[y]=Array.from({length:10},(_,x)=>x===4?null:'J');game.active={type:'I',rotation:1,x:2,y:0};render();});
    await page.keyboard.press('Space');const count=Math.min(n,3);
    await expect(page.locator('#bonus-count')).toHaveText(`${count} ${count===1?'bonus':'bonuses'} available`);
    expect((await page.locator('#bonus-symbols').textContent())!.match(/⚡/gu)?.length).toBe(count);
  }
  await page.evaluate(()=>{window.__tetris.game.active={type:'O',rotation:0,x:4,y:0};window.__tetris.render();});
  await page.keyboard.down('e');await expect(page.locator('#bonus-count')).toHaveText('2 bonuses available');
  await page.keyboard.press('Space');await page.keyboard.down('e');await page.keyboard.up('e');
  expect(await page.evaluate(()=>window.__tetris.game.active!.penetrator===true)).toBe(false);
  await expect(page.locator('#bonus-count')).toHaveText('2 bonuses available');
  await page.keyboard.press('e');await expect(page.locator('#bonus-count')).toHaveText('1 bonus available');
  await page.keyboard.press('r');await expect(page.locator('#bonus-count')).toHaveText('0 bonuses available');await expect(page.locator('#bonus-symbols')).toHaveText('');
});
test('white active held and ghost pieces preserve ability across a hold and drop through blockers',async({page})=>{
  await open(page);await page.evaluate(()=>{const {game,render}=window.__tetris;game.active={type:'O',rotation:0,x:4,y:0};game.next='J';game.bonuses=1;game.board[5][4]='Z';game.board[5][5]='Z';render();});
  await page.keyboard.press('e');
  const pixel=async(id:string,x:number,y:number)=>page.locator(id).evaluate((node:HTMLCanvasElement,p)=>Array.from(node.getContext('2d')!.getImageData(p.x,p.y,1,1).data),{x,y});
  for(const [x,y] of [[123,3],[153,3],[123,33],[153,33]])expect(await pixel('#board',x,y)).toEqual([255,255,255,255]);
  expect(await page.evaluate(()=>window.__tetris.game.ghost!.y)).toBe(18);expect((await pixel('#board',135,555))[2]).toBeGreaterThan(55);
  await page.keyboard.press('c');expect(await pixel('#held',27,15)).toEqual([255,255,255,255]);
  expect(await page.evaluate(()=>window.__tetris.game.held!.penetrator)).toBe(true);await expect(page.locator('#bonus-count')).toHaveText('0 bonuses available');
  await page.keyboard.press('Space');await page.keyboard.press('c');
  expect(await page.evaluate(()=>window.__tetris.game.active!.penetrator)).toBe(true);expect(await page.evaluate(()=>window.__tetris.game.ghost!.y)).toBe(18);
  await page.keyboard.press('Space');
  expect(await page.evaluate(()=>({blocker:window.__tetris.game.board[5][4],bottom:window.__tetris.game.board[19][5],cells:window.__tetris.game.board.flat().filter(Boolean).length,stock:window.__tetris.game.bonuses}))).toEqual({blocker:'Z',bottom:'O',cells:10,stock:0});
});
test('penetrator presentation is legible at desktop and narrow widths',async({page},info)=>{
  await open(page);await page.evaluate(()=>{const {game,render}=window.__tetris;game.active={type:'T',rotation:0,x:3,y:7,penetrator:true};game.held={type:'I',penetrator:true};game.bonuses=3;game.next='L';
    game.board[19]=['J','J','L',null,null,null,'T','T','Z','Z'];game.board[18]=[null,'J','L',null,null,null,null,'T','Z',null];render();});
  await page.screenshot({path:info.outputPath('penetrator-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('penetrator-narrow.png'),fullPage:true});
});
