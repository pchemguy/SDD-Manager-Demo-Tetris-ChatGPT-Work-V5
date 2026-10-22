/** Session settings and policy transitions; persistence gets controlled-adapter coverage later. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHOICES, DEFAULTS, KEYS, decodeSetting } from '../../src/settings.ts';
import { Game } from '../../src/game.ts';
const started=()=>{const game=new Game(()=>0);game.start();return game;};
const count=(game:Game)=>game.board.flat().filter(Boolean).length;
test('six canonical defaults and only exact accepted tokens are valid',()=>{
  assert.deepEqual(DEFAULTS,{ghost:'show',hardDrop:'on',next:'on',dropLock:'follow',lock:'interval',hold:'on'});
  for(const key of KEYS){for(const value of CHOICES[key])assert.equal(decodeSetting(key,value),value);
    for(const invalid of ['',null,undefined,42,'ON',' show ','unexpected'])assert.equal(decodeSetting(key,invalid),undefined);}
});
test('changing to interval while grounded grants a fresh interval without locking',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:18};game.advance(700);
  game.configure({...DEFAULTS,lock:'failed'});assert.equal(game.settings.lock,'failed');assert.equal(count(game),0);
  game.configure({...DEFAULTS,lock:'interval'});game.advance(799);assert.equal(count(game),0);
  game.advance(1);assert.equal(count(game),4);
});
test('display-only setting changes preserve queue and pending lock deadline',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:18};game.advance(700);const next=game.next;
  game.configure({...DEFAULTS,ghost:'hide',next:'off'});assert.equal(game.settings.next,'off');assert.equal(game.next,next);
  game.advance(99);assert.equal(count(game),0);game.advance(1);assert.equal(count(game),4);
});
test('settings changes retain held state and restart retains all selected options',()=>{
  const game=started();game.hold();const held=structuredClone(game.held);
  const selected={...DEFAULTS,hold:'off',hardDrop:'off',ghost:'dynamic',dropLock:'instant',lock:'failed',next:'off'} as const;
  game.configure(selected);assert.deepEqual(game.held,held);assert.equal(game.hold(),false);assert.equal(game.hardDrop(),false);
  game.restart();assert.deepEqual(game.settings,selected);assert.equal(game.held,null);
});
