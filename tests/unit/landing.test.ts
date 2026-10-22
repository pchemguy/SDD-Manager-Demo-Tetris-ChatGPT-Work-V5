/** Literal kick, landing, ghost boundary and locking-policy contracts. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game.ts';
import { ghostVisible, cells } from '../../src/model.ts';
const started=()=>{const game=new Game(()=>0);game.start();return game;};
const count=(game:Game)=>game.board.flat().filter(Boolean).length;
test('rotation accepts the first legal ordered kick including two-cell wall correction',()=>{
  const game=started();game.active={type:'I',rotation:1,x:-2,y:5};
  assert.equal(game.rotate(),true);assert.deepEqual(game.active,{type:'I',rotation:2,x:0,y:5});
  game.active={type:'T',rotation:0,x:3,y:18};assert.equal(game.rotate(),true);
  assert.deepEqual(game.active,{type:'T',rotation:1,x:3,y:17});
  game.active={type:'T',rotation:0,x:3,y:0};game.board[2][4]='Z';assert.equal(game.rotate(),true);
  assert.deepEqual(game.active,{type:'T',rotation:1,x:2,y:0});
});
test('all blocked kick candidates preserve piece queue and score',()=>{
  const game=started();game.active={type:'T',rotation:0,x:3,y:0};
  const occupied=new Set(cells(game.active).map(p=>p.join(',')));
  for(let y=0;y<4;y++)for(let x=0;x<10;x++)if(!occupied.has([x,y].join(',')))game.board[y][x]='J';
  const before=JSON.stringify(game);assert.equal(game.rotate(),false);assert.equal(JSON.stringify(game),before);
});
test('dynamic ghost hides only wholly upper projections and shows straddling cells',()=>{
  assert.equal(ghostVisible({type:'O',rotation:0,x:4,y:8},'dynamic'),false);
  assert.equal(ghostVisible({type:'O',rotation:0,x:4,y:9},'dynamic'),true);
  assert.equal(ghostVisible({type:'I',rotation:1,x:2,y:7},'dynamic'),true);
  assert.equal(ghostVisible({type:'O',rotation:0,x:4,y:0},'show'),true);
  assert.equal(ghostVisible({type:'O',rotation:0,x:4,y:18},'hide'),false);
  assert.equal(ghostVisible(null,'show'),false);
});
test('hard drop and ghost share the first-obstruction landing and score distance',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:0};game.board[12][4]='Z';
  assert.equal(game.ghost!.y,10);assert.equal(game.hardDrop(),true);
  assert.equal(game.active!.y,10);assert.equal(game.score,20);assert.equal(count(game),1);
  game.advance(799);assert.equal(count(game),1);game.advance(1);assert.equal(count(game),5);
});
test('repeated follow hard drops preserve an existing grounding deadline',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:0};game.hardDrop();game.advance(700);
  assert.equal(game.hardDrop(),true);game.advance(99);assert.equal(count(game),0);game.advance(1);assert.equal(count(game),4);
});
test('instant hard drop locks immediately under either general policy',()=>{
  for(const policy of ['interval','failed'] as const){const game=started();game.configure({...game.settings,lock:policy});game.configure({...game.settings,dropLock:'instant'});
    game.active={type:'O',rotation:0,x:4,y:0};game.hardDrop();assert.equal(count(game),4);assert.equal(game.score,36);}
});
test('follow hard drop under failed policy waits for next failed downward attempt',()=>{
  const game=started();game.configure({...game.settings,lock:'failed'});game.active={type:'O',rotation:0,x:4,y:0};
  game.hardDrop();assert.equal(count(game),0);assert.equal(game.softDrop(),false);assert.equal(count(game),4);
});
test('failed policy ignores grounding timer and locks on the next gravity attempt',()=>{
  const game=started();game.configure({...game.settings,lock:'failed'});game.active={type:'O',rotation:0,x:4,y:17};game.advance(500);game.softDrop();
  game.advance(299);assert.equal(count(game),0);game.advance(1);assert.equal(count(game),4);
});
test('disabled hard drop and paused commands do not change state',()=>{
  const game=started();game.configure({...game.settings,hardDrop:'off'});let before=JSON.stringify(game);assert.equal(game.hardDrop(),false);assert.equal(JSON.stringify(game),before);
  game.configure({...game.settings,hardDrop:'on'});game.togglePause();before=JSON.stringify(game);assert.equal(game.hardDrop(),false);assert.equal(JSON.stringify(game),before);
});
