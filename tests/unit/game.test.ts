/** Exact elapsed-time and hand-built row fixtures exercise classic session contracts. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game.ts';
const started = (): Game => { const game = new Game(() => 0); game.start(); return game; };
const ground = (game: Game, y = 18): void => { game.active = { type: 'O', rotation: 0, x: 4, y }; };
const occupied = (game: Game): number => game.board.flat().filter(Boolean).length;

test('ready is inert and start enables a fresh running round', () => {
  const game = new Game(() => 0); const before = structuredClone(game.active);
  game.advance(5000); game.move(1); assert.deepEqual(game.active,before);
  game.start(); assert.equal(game.status,'running'); assert.equal(game.score,0);
});
test('gravity observes its exact interval and does not award drop points', () => {
  const game=started(); game.advance(799); assert.equal(game.active!.y,0);
  game.advance(1); assert.equal(game.active!.y,1); assert.equal(game.score,0);
});
test('successful movement rotation and soft drop update the active piece only', () => {
  const game=started(); assert.equal(game.move(1),true); assert.equal(game.active!.x,4);
  assert.equal(game.rotate(),true); assert.equal(game.active!.rotation,1);
  assert.equal(game.softDrop(),true); assert.equal(game.active!.y,1); assert.equal(game.score,1); assert.equal(occupied(game),0);
});
test('grounding locks at a full interval and failed soft drop does not lock early', () => {
  const game=started();ground(game); assert.equal(game.softDrop(),false);
  game.advance(799);assert.equal(occupied(game),0);game.advance(1);assert.equal(occupied(game),4);
});
test('soft-drop grounding mid-gravity interval still receives a full lock interval', () => {
  const game=started();ground(game,17);game.advance(500);game.softDrop();assert.equal(game.active!.y,18);
  game.advance(300);assert.equal(occupied(game),0);game.advance(499);assert.equal(occupied(game),0);
  game.advance(1);assert.equal(occupied(game),4);
});
test('movement and rotation remaining grounded preserve the existing deadline', () => {
  const game=started();ground(game);game.advance(600);assert.equal(game.move(1),true);game.rotate();
  game.advance(199);assert.equal(occupied(game),0);game.advance(1);assert.equal(occupied(game),4);
});
test('leaving support cancels the countdown and new grounding starts afresh', () => {
  const game=started();game.board[19][4]='J';ground(game,17);game.advance(600);game.move(1);
  game.advance(200);assert.equal(game.active!.y,18);assert.equal(occupied(game),1);
  game.advance(799);assert.equal(occupied(game),1);game.advance(1);assert.equal(occupied(game),5);
});
test('pause excludes elapsed time from both gravity and lock deadlines', () => {
  const game=started();ground(game);game.advance(500);game.togglePause();assert.equal(game.status,'paused');
  game.advance(9000);assert.equal(occupied(game),0);game.togglePause();game.advance(299);assert.equal(occupied(game),0);
  game.advance(1);assert.equal(occupied(game),4);
});
test('four simultaneous row clears use the pre-clear level and update speed', () => {
  const game=started();game.rows=9;
  for(let y=16;y<20;y++)for(let x=0;x<10;x++)game.board[y][x]=x===4?null:'J';
  game.active={type:'I',rotation:1,x:2,y:16};game.advance(800);
  assert.equal(game.rows,13);assert.equal(game.level,2);assert.equal(game.score,800);assert.equal(game.interval,640);assert.equal(occupied(game),0);
});
test('a long frame preserves gravity then grounding then lock event order', () => {
  const game=started();ground(game,17);game.advance(1600);assert.equal(occupied(game),4);
  assert.equal(game.active!.y,0);assert.equal(game.active!.type,'I');
});
test('blocked spawn ends the round without overwriting settled cells', () => {
  const game=started();for(let x=3;x<7;x++)game.board[1][x]='Z';ground(game);
  game.advance(800);assert.equal(game.status,'over');assert.equal(game.active,null);assert.equal(occupied(game),8);
  const snapshot=JSON.stringify(game);game.advance(8000);game.move(1);assert.equal(JSON.stringify(game),snapshot);
});
test('restart clears round state and returns to running', () => {
  const game=started();game.score=999;game.rows=12;game.board[19][0]='S';game.togglePause();game.restart();
  assert.equal(game.status,'running');assert.equal(game.score,0);assert.equal(game.rows,0);assert.equal(occupied(game),0);assert.equal(game.active!.y,0);
});
test('invalid elapsed values and illegal rotations leave state unchanged', () => {
  const game=started();game.active={type:'I',rotation:1,x:-2,y:0};const before=JSON.stringify(game);
  assert.equal(game.rotate(),false);for(const elapsed of [-1,NaN,Infinity])game.advance(elapsed);
  assert.equal(JSON.stringify(game),before);
});
for (const [count, score] of [[1,100],[2,300],[3,500]]) test(`${count} cleared rows preserve retained order and upper padding`, () => {
  const game=started();game.board[0][0]='S';game.board[10][9]='L';
  for(let y=20-count;y<20;y++)for(let x=0;x<10;x++) {
    game.board[y][x]=(count===1 ? x>=3&&x<=6 : count===2 ? x===4||x===5 : x===4)?null:'J';
  }
  game.active=count===1?{type:'I',rotation:0,x:3,y:18}:count===2?{type:'O',rotation:0,x:4,y:18}:{type:'I',rotation:1,x:2,y:16};
  game.advance(800);
  assert.equal(game.score,score);assert.equal(game.rows,count);
  const expected=Array.from({length:20},()=>Array(10).fill(null));
  expected[count][0]='S';expected[10+count][9]='L';if(count===3)expected[19][4]='I';
  assert.deepEqual(game.board,expected);
});
