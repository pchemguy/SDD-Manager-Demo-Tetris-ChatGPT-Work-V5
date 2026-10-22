/** Browser composition, semantic controls and elapsed-time delivery. */
import './style.css';
import { Game } from './game.ts';
import { drawBoard, drawPreview } from './renderer.ts';
import { version } from '../package.json';
declare global { interface Window { __tetris: { game: Game; render: () => void } } }
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<header><a class="brand" href="./" aria-label="Stack home"><span class="brand-mark">▦</span> STACK<span class="brand-dot">.</span></a><span class="edition">THE FALLING BLOCK GAME <b>v${version}</b></span></header>
<main>
  <section class="intro"><p class="eyebrow">A LITTLE FOCUS. A CLEAN SLATE.</p><h1>Find your flow.</h1><p>Build a rhythm. Clear a line. Keep going.</p></section>
  <div class="game-layout">
    <aside class="stats" aria-label="Game statistics">
      <div class="card"><span class="eyebrow">SCORE</span><strong id="score">0</strong></div>
      <div class="card compact"><span class="eyebrow">LINES</span><strong id="lines">0</strong></div>
      <div class="card compact"><span class="eyebrow">LEVEL</span><strong id="level">1</strong></div>
      <div class="status-card"><span class="status-dot"></span><span id="status" aria-live="polite">Ready</span></div>
    </aside>
    <section class="play-area" aria-label="Tetris game">
      <div class="board-wrap"><canvas id="board" width="300" height="600" tabindex="0" aria-label="Game board. Use arrow keys to move and rotate."></canvas>
        <div id="overlay"><span class="eyebrow">YOUR NEXT GOOD BREAK</span><h2 id="overlay-title">Ready to stack?</h2><p id="overlay-note">Make room for one more.</p><button id="start" class="primary">Start game</button></div>
      </div>
      <div class="game-actions"><button id="pause" disabled>Pause</button><button id="restart">New game <kbd>R</kbd></button></div>
    </section>
    <aside class="side-panel" aria-label="Game options">
      <section class="card"><h2 class="eyebrow">UP NEXT</h2><canvas id="next" width="136" height="96" aria-label="Next piece"></canvas></section>
      <section class="controls"><h2 class="eyebrow">MAKE YOUR MOVE</h2><dl><dt><kbd>←</kbd> <kbd>→</kbd></dt><dd>Move</dd><dt><kbd>↑</kbd> / <kbd>X</kbd></dt><dd>Rotate</dd><dt><kbd>↓</kbd></dt><dd>Soft drop</dd><dt><kbd>P</kbd> / <kbd>Esc</kbd></dt><dd>Pause</dd></dl><p class="hint">A full gravity interval to settle.<br>Take a breath. Find your place.</p></section>
    </aside>
  </div>
</main><footer>ONE PIECE AT A TIME.<span>Classic play · Made for your browser</span></footer>`;
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const board=element<HTMLCanvasElement>('board');const game=new Game();
const names={ready:'Ready',running:'Playing',paused:'Paused',over:'Game over'};
function text(id:string,value:string):void { const node=element(id);if(node.textContent!==value)node.textContent=value; }
function render():void {
  drawBoard(board,game);drawPreview(element<HTMLCanvasElement>('next'),game.next);
  text('score',String(game.score));text('lines',String(game.rows));text('level',String(game.level));
  text('status',names[game.status]);
  element('overlay').hidden=game.status==='running';
  text('overlay-title',game.status==='paused'?'Take your time.':game.status==='over'?'One more round?':'Ready to stack?');
  text('overlay-note',game.status==='over'?`You cleared ${game.rows} lines. A new rhythm awaits.`:'Make room for one more.');
  text('start',game.status==='paused'?'Resume game':game.status==='over'?'Play again':'Start game');
  element<HTMLButtonElement>('pause').disabled=game.status==='ready'||game.status==='over';
  text('pause',game.status==='paused'?'Resume':'Pause');
}
let previous=performance.now();
function act(command:()=>void,focus=true):void {
  const now=performance.now();game.advance(now-previous);previous=now;command();render();if(focus)board.focus();
}
element('start').addEventListener('click',()=>act(()=>game.status==='paused'?game.togglePause():game.start()));
element('pause').addEventListener('click',()=>act(()=>game.togglePause()));
element('restart').addEventListener('click',()=>act(()=>game.restart()));
document.addEventListener('keydown',event=>{
  if(event.target instanceof Element && event.target.closest('input,select,textarea,button,a,[contenteditable="true"]'))return;
  if(event.ctrlKey||event.metaKey||event.altKey)return;
  const key=event.key.toLowerCase();
  if(['arrowleft','arrowright','arrowdown','arrowup','x','p','escape','r','enter'].includes(key))event.preventDefault();
  let command:(()=>void)|undefined;
  if(key==='arrowleft')command=()=>{game.move(-1);};
  if(key==='arrowright')command=()=>{game.move(1);};
  if(key==='arrowdown')command=()=>{game.softDrop();};
  if(!event.repeat){
    if(key==='arrowup'||key==='x')command=()=>{game.rotate();};
    if(key==='p'||key==='escape')command=()=>game.togglePause();
    if(key==='r')command=()=>game.restart();
    if(key==='enter')command=()=>game.start();
  }
  if(command)act(command,false);
});
window.addEventListener('blur',()=>{if(game.status==='running')act(()=>game.togglePause(),false);});
function frame(now:number):void{game.advance(now-previous);previous=now;render();requestAnimationFrame(frame);}
if(import.meta.env.MODE==='test')window.__tetris={game,render};
render();requestAnimationFrame(frame);
