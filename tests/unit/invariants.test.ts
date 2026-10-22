/** Seeded command sequences check board safety across ordinary classic sessions. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game.ts';
import { fits, TYPES } from '../../src/model.ts';

test('seeded play preserves board shape legal active placement and finite scoring', () => {
  let seed = 0x51a7;
  const random = (): number => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };
  const game = new Game(random); game.start();
  for (let step = 0; step < 1500; step++) {
    const command = Math.floor(random() * 6);
    if (command === 0) game.move(-1);
    else if (command === 1) game.move(1);
    else if (command === 2) game.rotate();
    else if (command === 3) game.softDrop();
    else game.advance(Math.floor(random() * 1800));
    assert.equal(game.board.length,20);
    assert.ok(game.board.every(row => row.length === 10 && row.every(value => value === null || TYPES.includes(value))));
    assert.ok(Number.isFinite(game.score) && game.score >= 0);
    assert.ok(Number.isInteger(game.rows) && game.rows >= 0);
    if (game.active) assert.equal(fits(game.board,game.active),true);
    if (game.status === 'over') game.restart();
  }
});
