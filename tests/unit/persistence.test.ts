/** Per-key persistence contracts exercised through controlled browser effects. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHOICES, DEFAULTS, KEYS, SettingsStore, type SettingKey, type SettingsPort } from '../../src/settings.ts';
const alternates={ghost:'dynamic',hardDrop:'off',next:'off',dropLock:'instant',lock:'failed',hold:'off'} as const;
function fixture(url='https://game.example/?campaign=keep&tag=a&tag=b#play',cookies=''){
  const state={url,cookies,writes:[] as string[],replacements:[] as string[],failReadCookies:false,failReadUrl:false,failWrite:false,failReplace:false};
  const port:SettingsPort={
    readUrl(){if(state.failReadUrl)throw Error('URL unavailable');return state.url;},
    readCookies(){if(state.failReadCookies)throw Error('Cookies unavailable');return state.cookies;},
    writeCookie(value){state.writes.push(value);if(state.failWrite)throw Error('Cookies blocked');},
    replaceUrl(value){state.replacements.push(value);if(state.failReplace)throw Error('History unavailable');state.url=value;},
  };
  return {state,port};
}
const cookie=(key:SettingKey,value:string,secure=true)=>`tetris_${key}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure?'; Secure':''}`;

for(const key of KEYS){
  test(`${key}: one valid URL value wins and saves even the explicit default`,()=>{
    for(const value of CHOICES[key]){
      const conflicting=CHOICES[key].find(candidate=>candidate!==value)!;
      const {state,port}=fixture(`https://game.example/?${key}=${value}&other=keep#play`,`tetris_${key}=${conflicting}`);
      const before=state.url;const store=new SettingsStore(port);
      assert.deepEqual(store.current,{...DEFAULTS,[key]:value});assert.deepEqual(state.writes,[cookie(key,value)]);
      assert.equal(state.url,before);assert.deepEqual(state.replacements,[]);
    }
  });
  test(`${key}: an omitted URL key keeps its saved cookie without writing defaults`,()=>{
    const {state,port}=fixture('https://game.example/?unknown=ignored#play',`unknown=bad; tetris_${key}=${alternates[key]}`);
    assert.deepEqual(new SettingsStore(port).current,{...DEFAULTS,[key]:alternates[key]});
    assert.deepEqual(state.writes,[]);assert.deepEqual(state.replacements,[]);
  });
  test(`${key}: invalid empty and repeated URL values fall through independently`,()=>{
    for(const query of [`${key}=invalid`,`${key}=`,`${key}=${DEFAULTS[key]}&${key}=${DEFAULTS[key]}`,`${key}=ON`,`${key}=%20${alternates[key]}%20`,`${key}=%E0%A4%A`]){
      const {state,port}=fixture(`https://game.example/?${query}`,`tetris_${key}=${alternates[key]}`);
      assert.deepEqual(new SettingsStore(port).current,{...DEFAULTS,[key]:alternates[key]},query);
      assert.deepEqual(state.writes,[],query);assert.deepEqual(state.replacements,[],query);
    }
  });
  test(`${key}: invalid malformed or duplicate cookies fall back only for that key`,()=>{
    const other=KEYS[(KEYS.indexOf(key)+1)%KEYS.length];
    for(const value of ['invalid','','%E0%A4%A',`%20${alternates[key]}%20`,`${alternates[key]}; tetris_${key}=${alternates[key]}`]){
      const {state,port}=fixture('https://game.example/',`tetris_${key}=${value}; tetris_${other}=${alternates[other]}`);
      assert.deepEqual(new SettingsStore(port).current,{...DEFAULTS,[other]:alternates[other]},value);
      assert.deepEqual(state.writes,[]);
    }
  });
  test(`${key}: a user change writes one cookie and replaces only its URL key`,()=>{
    const {state,port}=fixture(`https://game.example/?campaign=keep&tag=a&tag=b&${key}=invalid&${key}=invalid#play`);const store=new SettingsStore(port);
    assert.equal(store.select(key,alternates[key]),true);assert.deepEqual(store.current,{...DEFAULTS,[key]:alternates[key]});
    assert.deepEqual(state.writes,[cookie(key,alternates[key])]);assert.equal(state.replacements.length,1);
    const url=new URL(state.url);assert.deepEqual(url.searchParams.getAll(key),[alternates[key]]);assert.equal(url.searchParams.get('campaign'),'keep');
    assert.deepEqual(url.searchParams.getAll('tag'),['a','b']);assert.equal(url.hash,'#play');
    for(const other of KEYS.filter(candidate=>candidate!==key))assert.equal(url.searchParams.has(other),false);
  });
}
test('no known values resolve to defaults without persisting defaults',()=>{
  const {state,port}=fixture('https://game.example/?unknown=on','foreign=off');
  assert.deepEqual(new SettingsStore(port).current,DEFAULTS);assert.deepEqual(state.writes,[]);assert.deepEqual(state.replacements,[]);
});
test('mixed sources resolve all six settings without blanket replacement',()=>{
  const {state,port}=fixture('https://game.example/?ghost=show&hardDrop=on&next=invalid&dropLock=&lock=interval&lock=failed#play',
    'tetris_ghost=hide; tetris_hardDrop=off; tetris_next=off; tetris_dropLock=instant; tetris_lock=failed; tetris_hold=off');
  assert.deepEqual(new SettingsStore(port).current,{ghost:'show',hardDrop:'on',next:'off',dropLock:'instant',lock:'failed',hold:'off'});
  assert.deepEqual(state.writes,[cookie('ghost','show'),cookie('hardDrop','on')]);assert.deepEqual(state.replacements,[]);
});
test('HTTPS cookie writes are Secure and HTTP writes keep the remaining required attributes',()=>{
  for(const protocol of ['https:','http:']){
    const {state,port}=fixture(`${protocol}//game.example/?ghost=dynamic`);const store=new SettingsStore(port);store.select('hold','off');
    assert.deepEqual(state.writes,[cookie('ghost','dynamic',protocol==='https:'),cookie('hold','off',protocol==='https:')]);
  }
});
test('cookie read failure preserves explicit URL settings and defaults independently',()=>{
  const {state,port}=fixture('https://game.example/?ghost=dynamic');state.failReadCookies=true;
  assert.deepEqual(new SettingsStore(port).current,{...DEFAULTS,ghost:'dynamic'});assert.deepEqual(state.writes,[cookie('ghost','dynamic')]);
});
test('invalid or unavailable URL reads still restore saved cookies',()=>{
  for(const unreadable of ['malformed','throws']){
    const {state,port}=fixture(unreadable==='malformed'?'invalid URL':'https://game.example/','tetris_hold=off');state.failReadUrl=unreadable==='throws';
    assert.deepEqual(new SettingsStore(port).current,{...DEFAULTS,hold:'off'});assert.deepEqual(state.writes,[]);assert.deepEqual(state.replacements,[]);
  }
});
test('cookie and history write failures independently preserve each selected in-memory value',()=>{
  for(const key of KEYS)for(const [failWrite,failReplace] of [[true,false],[false,true],[true,true]]){
    const {state,port}=fixture();const store=new SettingsStore(port);state.failWrite=failWrite;state.failReplace=failReplace;
    assert.equal(store.select(key,alternates[key]),true);assert.equal(store.current[key],alternates[key]);
    assert.deepEqual(state.writes,[cookie(key,alternates[key])]);assert.equal(state.replacements.length,1);
    assert.equal(new URL(state.url).searchParams.get(key),failReplace?null:alternates[key]);
  }
});
test('failed explicit URL cookie writes cannot prevent restoration of later settings',()=>{
  const {state,port}=fixture('https://game.example/?ghost=dynamic&hardDrop=off&next=off&dropLock=instant&lock=failed&hold=off');state.failWrite=true;
  assert.deepEqual(new SettingsStore(port).current,alternates);assert.equal(state.writes.length,6);assert.deepEqual(state.replacements,[]);
});
test('a later URL read failure preserves memory cookie writing and known HTTPS attributes',()=>{
  const {state,port}=fixture();const store=new SettingsStore(port);state.failReadUrl=true;
  assert.equal(store.select('ghost','dynamic'),true);assert.equal(store.current.ghost,'dynamic');assert.deepEqual(state.writes,[cookie('ghost','dynamic')]);assert.deepEqual(state.replacements,[]);
});
test('invalid player selections cannot change state or persist effects',()=>{
  const {state,port}=fixture();const store=new SettingsStore(port);
  for(const key of KEYS)for(const value of ['invalid','',null,undefined,42,{},'ON'])assert.equal(store.select(key,value),false);
  assert.deepEqual(store.current,DEFAULTS);assert.deepEqual(state.writes,[]);assert.deepEqual(state.replacements,[]);
});
