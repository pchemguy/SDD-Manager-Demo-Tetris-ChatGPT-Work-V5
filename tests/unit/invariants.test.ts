/** Seeded command sequences check board safety across ordinary and penetrator sessions. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game.ts';
import { fits, canPlace, TYPES } from '../../src/model.ts';

test('seeded play preserves board shape legal active placement and finite scoring', () => {
  let seed = 0x51a7;
  const random = (): number => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };
  const game = new Game(random); game.start();game.bonuses=3;
  for (let step = 0; step < 1500; step++) {
    const command = Math.floor(random() * 10);
    if (command === 0) game.move(-1);
    else if (command === 1) game.move(1);
    else if (command === 2) game.rotate();
    else if (command === 3) game.softDrop();
    else if(command===4)game.hold();
    else if(command===5)game.hardDrop();
    else if(command===6)game.activate();
    else if(command===7)game.configure({...game.settings,lock:random()<.5?'interval':'failed',dropLock:random()<.5?'follow':'instant'});
    else game.advance(Math.floor(random() * 1800));
    assert.equal(game.board.length,20);
    assert.ok(game.board.every(row => row.length === 10 && row.every(value => value === null || TYPES.includes(value))));
    assert.ok(Number.isFinite(game.score) && game.score >= 0);
    assert.ok(Number.isInteger(game.rows) && game.rows >= 0);
    assert.ok(Number.isInteger(game.bonuses)&&game.bonuses>=0&&game.bonuses<=3);
    if(game.active){assert.equal(canPlace(game.board,game.active),true);assert.equal(fits(game.board,game.ghost!),true);}
    if(game.status==='over'){game.restart();game.bonuses=3;}
  }
});
