/** Modern session commands are driven by deterministic queue and timing fixtures. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game.ts';
import { emptyBoard, TYPES } from '../../src/model.ts';
const started=()=>{const game=new Game(()=>0);game.start();return game;};
const lockCurrent=(game:Game)=>{while(game.softDrop()){}game.advance(game.interval);};
test('each complete seven-piece bag contains every type exactly once',()=>{
  const game=started(),seen:string[]=[];
  for(let i=0;i<21;i++){seen.push(game.active!.type);game.board=emptyBoard();lockCurrent(game);}
  for(let i=0;i<21;i+=7)assert.deepEqual(seen.slice(i,i+7).sort(),[...TYPES].sort());
});
test('empty hold consumes next once and repeated hold preserves all state',()=>{
  const game=started(),outgoing=game.active!.type,next=game.next;
  game.rotate();game.softDrop();assert.equal(game.hold(),true);
  assert.equal(game.held!.type,outgoing);assert.equal(game.active!.type,next);
  assert.equal(game.active!.rotation,0);assert.equal(game.active!.y,0);
  const snapshot=JSON.stringify(game);assert.equal(game.hold(),false);assert.equal(JSON.stringify(game),snapshot);
});
test('holding a grounded piece starts the received piece with fresh clocks',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:18};game.advance(700);
  assert.equal(game.hold(),true);game.advance(799);assert.equal(game.active!.y,0);
  game.advance(1);assert.equal(game.active!.y,1);assert.equal(game.board.flat().filter(Boolean).length,0);
});
test('hold becomes available after lock and nonempty swap does not consume next',()=>{
  let draws=0;const game=new Game(()=>{draws++;return 0;});game.start();
  const first=game.active!.type;assert.equal(game.hold(),true);lockCurrent(game);
  const next=game.next,received=game.active!.type,before=draws;
  assert.equal(game.hold(),true);assert.equal(game.active!.type,first);assert.equal(game.held!.type,received);
  assert.equal(game.next,next);assert.equal(draws,before);
});
test('disabled hold retains storage and restart clears it while retaining enablement',()=>{
  const game=started();game.hold();lockCurrent(game);game.configure({...game.settings,hold:'off'});
  const snapshot=JSON.stringify(game);assert.equal(game.hold(),false);assert.equal(JSON.stringify(game),snapshot);
  assert.notEqual(game.held,null);game.restart();assert.equal(game.held,null);assert.equal(game.settings.hold,'off');
});
test('hold rejects paused input and blocked received spawn ends without overwriting cells',()=>{
  const game=started();game.togglePause();assert.equal(game.hold(),false);game.togglePause();
  game.next='J';game.board[0][3]='Z';game.active={type:'O',rotation:0,x:4,y:18};
  assert.equal(game.hold(),true);assert.equal(game.status,'over');assert.equal(game.active,null);
  assert.equal(game.board.flat().filter(Boolean).length,1);assert.equal(game.board[0][3],'Z');
});
