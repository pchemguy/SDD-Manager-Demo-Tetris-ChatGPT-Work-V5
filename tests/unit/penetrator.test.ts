/** Literal traversal, landing, stock and lifetime fixtures for penetrators. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game.ts';
import { canPlace, fits, landing, emptyBoard } from '../../src/model.ts';
const started=()=>{const game=new Game(()=>0);game.start();return game;};
const count=(game:Game)=>game.board.flat().filter(Boolean).length;
test('four-line clears cap unspent inventory independently of active and held penetrators',()=>{
  const game=started();
  for(let n=1;n<=4;n++){
    game.board=emptyBoard();for(let y=16;y<20;y++)game.board[y]=Array.from({length:10},(_,x)=>x===4?null:'J');
    if(n===3){assert.equal(game.bonuses,2);game.held={type:'T',penetrator:true};}
    game.active={type:'I',rotation:1,x:2,y:16,...(n===3?{penetrator:true}:{})};
    game.advance(game.interval);assert.equal(game.bonuses,Math.min(3,n));
    if(n>=3)assert.deepEqual(game.held,{type:'T',penetrator:true});
  }
});
test('activation spends once rejects absent stock and pause and preserves next',()=>{
  const game=started();let before=JSON.stringify(game);assert.equal(game.activate(),false);assert.equal(JSON.stringify(game),before);
  game.bonuses=2;game.togglePause();before=JSON.stringify(game);assert.equal(game.activate(),false);assert.equal(JSON.stringify(game),before);
  game.togglePause();const next=game.next;assert.equal(game.activate(),true);assert.equal(game.bonuses,1);assert.equal(game.active!.penetrator,true);assert.equal(game.next,next);
  before=JSON.stringify(game);assert.equal(game.activate(),false);assert.equal(JSON.stringify(game),before);
});
test('penetrator ghost and hard drop cross blockers to the lowest legal nonoverlapping position',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:0,penetrator:true};game.board[6][4]='Z';game.board[6][5]='Z';game.board[19][4]='L';
  const original=structuredClone(game.board);assert.equal(landing(game.board,{...game.active,penetrator:false}),4);
  assert.equal(landing(game.board,game.active),17);assert.equal(game.ghost!.y,17);
  assert.equal(game.hardDrop(),true);assert.equal(game.active!.y,17);assert.equal(game.score,34);assert.deepEqual(game.board,original);
  game.advance(799);assert.equal(count(game),3);game.advance(1);assert.equal(count(game),7);
  assert.equal(game.board[6][4],'Z');assert.equal(game.board[6][5],'Z');assert.equal(game.board[19][4],'L');assert.notEqual(game.active!.penetrator,true);
});
test('gravity and soft drop traverse occupied intermediate cells without destruction',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:4,penetrator:true};game.board[6][4]='Z';const original=structuredClone(game.board);
  game.advance(800);assert.equal(game.active!.y,5);assert.equal(fits(game.board,game.active!),false);assert.equal(canPlace(game.board,game.active!),true);
  game.advance(800);assert.equal(game.active!.y,6);assert.equal(game.softDrop(),true);assert.equal(game.active!.y,7);assert.deepEqual(game.board,original);
});
test('penetrator rotation accepts the unshifted overlapping candidate with a reachable landing',()=>{
  const game=started();game.active={type:'I',rotation:1,x:2,y:0,penetrator:true};game.board[2][3]='Z';const original=structuredClone(game.board);
  assert.equal(game.rotate(),true);assert.deepEqual(game.active,{type:'I',rotation:2,x:2,y:0,penetrator:true});assert.equal(fits(game.board,game.active!),false);assert.deepEqual(game.board,original);
});
test('dead-end candidates and out-of-board positions remain rejected',()=>{
  const game=started();for(let y=7;y<20;y++)game.board[y].fill('J');game.board[6][6]='Z';game.active={type:'O',rotation:0,x:4,y:5,penetrator:true};
  const before=JSON.stringify(game);assert.equal(game.move(1),false);assert.equal(JSON.stringify(game),before);
  assert.equal(canPlace(game.board,{...game.active,x:-1}),false);assert.equal(canPlace(game.board,{...game.active,y:19}),false);
});
test('hold preserves the flag without charge and receives through overlapping spawn if landing exists',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:0};game.bonuses=1;assert.equal(game.activate(),true);assert.equal(game.hold(),true);
  assert.equal(game.held!.penetrator,true);assert.notEqual(game.active!.penetrator,true);
  game.configure({...game.settings,dropLock:'instant'});game.hardDrop();game.board[0][4]='Z';const next=game.next;
  assert.equal(game.hold(),true);assert.equal(game.status,'running');assert.equal(game.active!.penetrator,true);assert.equal(game.bonuses,0);assert.equal(game.next,next);
  assert.equal(fits(game.board,game.active!),false);assert.equal(fits(game.board,game.ghost!),true);
});
test('a held penetrator with no legal terminal position ends the round safely',()=>{
  const game=started();game.held={type:'O',penetrator:true};game.bonuses=2;
  for(let y=0;y<20;y++){game.board[y][4]='Z';game.board[y][5]='Z';}game.active={type:'J',rotation:0,x:0,y:0};const board=structuredClone(game.board);
  assert.equal(game.hold(),true);assert.equal(game.status,'over');assert.equal(game.active,null);assert.equal(game.bonuses,2);assert.deepEqual(game.board,board);
});
test('activation leaving support cancels the old deadline and landing gets a fresh interval',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:4};game.board[6][4]='Z';game.bonuses=1;game.advance(600);
  assert.equal(game.activate(),true);assert.equal(game.grounded,false);game.advance(200);assert.equal(game.active!.y,5);assert.equal(count(game),1);
  game.hardDrop();game.advance(799);assert.equal(count(game),1);game.advance(1);assert.equal(count(game),5);
});
test('activation remaining grounded preserves the existing interval deadline',()=>{
  const game=started();game.active={type:'O',rotation:0,x:4,y:18};game.bonuses=1;game.advance(600);assert.equal(game.activate(),true);
  game.advance(199);assert.equal(count(game),0);game.advance(1);assert.equal(count(game),4);
});
test('failed locking traverses intermediate overlaps and locks only at the safe lowest landing',()=>{
  const game=started();game.configure({...game.settings,lock:'failed'});game.active={type:'O',rotation:0,x:4,y:0,penetrator:true};game.board[5][4]='J';
  for(let steps=0;steps<25;steps++)if(!game.softDrop())break;
  assert.equal(game.board[5][4],'J');assert.equal(game.board[18][4],'O');assert.equal(game.board[19][5],'O');assert.equal(count(game),5);assert.equal(game.score,18);
});
test('restart clears stock and penetrator lifetimes while retaining settings',()=>{
  const game=started();game.configure({...game.settings,ghost:'dynamic'});game.bonuses=3;game.active!.penetrator=true;game.held={type:'T',penetrator:true};game.restart();
  assert.equal(game.bonuses,0);assert.equal(game.held,null);assert.notEqual(game.active!.penetrator,true);assert.equal(game.settings.ghost,'dynamic');
});
