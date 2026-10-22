/** Real cookies, URL precedence, six-setting changes and fresh-page restoration. */
import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import type { Settings } from '../../src/settings.ts';
const base='http://127.0.0.1:4317';
const defaults:Settings={ghost:'show',hardDrop:'on',next:'on',dropLock:'follow',lock:'interval',hold:'on'};
const selected:Settings={ghost:'dynamic',hardDrop:'off',next:'off',dropLock:'instant',lock:'failed',hold:'off'};
const errors=new WeakMap<Page,string[]>();
function observe(page:Page){const list:string[]=[];errors.set(page,list);page.on('pageerror',error=>list.push(error.message));}
test.beforeEach(({page})=>observe(page));
test.afterEach(({page})=>{expect(errors.get(page)).toEqual([]);});
async function seed(context:BrowserContext,values:Record<string,string>){
  await context.addCookies(Object.entries(values).map(([key,value])=>({name:'tetris_'+key,value,url:base,sameSite:'Lax' as const})));
}
async function expectSettings(page:Page,values:Settings){
  await expect.poll(()=>page.evaluate(()=>window.__tetris.game.settings)).toEqual(values);
  for(const [key,value] of Object.entries(values))await expect(page.locator('#setting-'+key)).toHaveValue(value);
}
async function saved(context:BrowserContext){
  return Object.fromEntries((await context.cookies(base)).filter(cookie=>cookie.name.startsWith('tetris_')).map(cookie=>[cookie.name.slice(7),cookie.value]));
}
test('mixed sources resolve independently and initialization preserves the exact URL',async({page,context})=>{
  await seed(context,{...selected,ghost:'hide'});
  const path='/?campaign=keep&ghost=show&hardDrop=on&next=invalid&dropLock=&lock=failed&lock=interval#play';
  await page.goto(path);
  const expected:Settings={ghost:'show',hardDrop:'on',next:'off',dropLock:'instant',lock:'failed',hold:'off'};
  await expectSettings(page,expected);expect(await saved(context)).toEqual(expected);expect(page.url()).toBe(base+path);
  await expect(page.locator('#next-card')).toBeHidden();await expect(page.locator('#hold-card')).toBeHidden();
});
test('all six changes save cookies replace URL and survive reload and reopening without parameters',async({page,context})=>{
  await page.goto('/?campaign=keep&tag=a&tag=b#play');const historyLength=await page.evaluate(()=>history.length);
  const now=Date.now()/1000;
  for(const [key,value] of Object.entries(selected))await page.locator('#setting-'+key).selectOption(value);
  await expectSettings(page,selected);expect(await saved(context)).toEqual(selected);
  const url=new URL(page.url());
  for(const [key,value] of Object.entries(selected))expect(url.searchParams.getAll(key)).toEqual([value]);
  expect(url.searchParams.get('campaign')).toBe('keep');expect(url.searchParams.getAll('tag')).toEqual(['a','b']);expect(url.hash).toBe('#play');
  expect(await page.evaluate(()=>history.length)).toBe(historyLength);
  for(const cookie of await context.cookies(base)){
    expect(cookie.path).toBe('/');expect(cookie.sameSite).toBe('Lax');expect(cookie.secure).toBe(false);expect(cookie.httpOnly).toBe(false);
    expect(cookie.expires).toBeGreaterThan(now+31536000-60);expect(cookie.expires).toBeLessThan(now+31536000+60);
  }
  await page.reload();await expectSettings(page,selected);
  const reopened=await context.newPage();observe(reopened);
  try{
    await reopened.goto('/?campaign=reopened#again');await expectSettings(reopened,selected);
    expect(reopened.url()).toBe(base+'/?campaign=reopened#again');expect(await saved(context)).toEqual(selected);
    expect(await reopened.evaluate(()=>({status:window.__tetris.game.status,score:window.__tetris.game.score,bonuses:window.__tetris.game.bonuses,held:window.__tetris.game.held}))).toEqual({status:'ready',score:0,bonuses:0,held:null});
    expect(errors.get(reopened)).toEqual([]);
  }finally{await reopened.close();}
});
test('all six explicit default URL values overwrite different cookies and remain saved when omitted',async({page,context})=>{
  await seed(context,selected);
  const path='/?ghost=show&hardDrop=on&next=on&dropLock=follow&lock=interval&hold=on&campaign=keep#play';
  await page.goto(path);await expectSettings(page,defaults);expect(await saved(context)).toEqual(defaults);expect(page.url()).toBe(base+path);
  await page.goto('/');await expectSettings(page,defaults);expect(await saved(context)).toEqual(defaults);
});
test('malformed cookies and invalid or repeated URL values affect only their setting',async({page,context})=>{
  const raw={ghost:'%E0%A4%A',hardDrop:'ON',next:'off',dropLock:'%20instant',lock:'failed',hold:'off'};
  await seed(context,raw);await context.addCookies([{name:'unrelated',value:'keep',url:base}]);
  const path='/?ghost=dynamic&ghost=show&hardDrop=OFF&next=&dropLock=INSTANT&lock=invalid&hold=invalid#play';
  await page.goto(path);await expectSettings(page,{ghost:'show',hardDrop:'on',next:'off',dropLock:'follow',lock:'failed',hold:'off'});
  expect(await saved(context)).toEqual(raw);expect(page.url()).toBe(base+path);
  await page.locator('#setting-ghost').selectOption('dynamic');
  expect(await saved(context)).toEqual({...raw,ghost:'dynamic'});
  const url=new URL(page.url());expect(url.searchParams.getAll('ghost')).toEqual(['dynamic']);expect(url.searchParams.get('next')).toBe('');expect(url.hash).toBe('#play');
  expect((await context.cookies(base)).find(cookie=>cookie.name==='unrelated')?.value).toBe('keep');
});
test('setting changes capture the command clock before slow persistence effects',async({page,context})=>{
  await page.addInitScript(()=>{
    let now=0;
    Object.defineProperty(performance,'now',{value:()=>now});
    window.requestAnimationFrame=callback=>{(window as any).__pendingFrame=callback;return 1;};
    const replace=history.replaceState.bind(history);
    history.replaceState=(...args)=>{now+=200;replace(...args);};
  });
  await page.goto('/?lock=failed');await page.getByRole('button',{name:'Start game',exact:true}).click();
  await page.evaluate(()=>{
    const {game,render}=window.__tetris;game.restart();game.active={type:'O',rotation:0,x:4,y:18};game.advance(700);render();
  });
  await page.getByLabel('General locking',{exact:true}).selectOption('interval');
  expect(await page.evaluate(()=>window.__tetris.game.board.flat().filter(Boolean).length)).toBe(0);
  expect(await page.evaluate(()=>window.__tetris.game.active)).toEqual({type:'O',rotation:0,x:4,y:18});
  expect((await saved(context)).lock).toBe('interval');expect(new URL(page.url()).searchParams.getAll('lock')).toEqual(['interval']);
  // The new policy owns the 200 ms spent in history, then the remaining 600 ms.
  await page.evaluate(()=>{(window as any).__pendingFrame(performance.now());window.__tetris.game.advance(599);window.__tetris.render();});
  expect(await page.evaluate(()=>window.__tetris.game.board.flat().filter(Boolean).length)).toBe(0);
  await page.evaluate(()=>{window.__tetris.game.advance(1);window.__tetris.render();});
  expect(await page.evaluate(()=>window.__tetris.game.board.flat().filter(Boolean).length)).toBe(4);
});
