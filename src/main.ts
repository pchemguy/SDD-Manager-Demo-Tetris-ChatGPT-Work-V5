/** Browser composition, semantic controls and elapsed-time delivery. */
import './style.css';
import { Game } from './game.ts';
import { drawBoard, drawPreview } from './renderer.ts';
import { CHOICES, KEYS, SettingsStore, type SettingKey } from './settings.ts';
import { version } from '../package.json';
declare global { interface Window { __tetris: { game: Game; render: () => void } } }
const LABELS:Record<SettingKey,string>={ghost:'Ghost piece',hardDrop:'Hard drop',next:'Next-piece preview',dropLock:'Hard-drop locking',lock:'General locking',hold:'Hold piece'};
const OPTION_LABELS:Record<SettingKey,Record<string,string>>={ghost:{hide:'Always hide',dynamic:'Dynamic · below midline',show:'Always show'},hardDrop:{on:'On',off:'Off'},next:{on:'On',off:'Off'},dropLock:{follow:'Follow general policy',instant:'Lock immediately'},lock:{interval:'Full gravity interval',failed:'Failed downward attempt'},hold:{on:'On',off:'Off'}};
const settingsMarkup=KEYS.map(key=>`<div class="setting"><label for="setting-${key}">${LABELS[key]}</label><select id="setting-${key}">${CHOICES[key].map(value=>`<option value="${value}">${OPTION_LABELS[key][value]}</option>`).join('')}</select></div>`).join('');
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
      <section class="card bonus-card"><h2 class="eyebrow">PENETRATOR <kbd>E</kbd></h2><span id="bonus-symbols" aria-hidden="true"></span><span id="bonus-count" aria-live="polite">0 bonuses available</span><p id="penetrator-hint">Clear four lines. Press E to pass through blocks.</p></section>
    </aside>
    <section class="play-area" aria-label="Tetris game">
      <div class="board-wrap"><canvas id="board" width="300" height="600" tabindex="0" aria-label="Game board. Use arrow keys to move and rotate."></canvas>
        <div id="overlay"><span class="eyebrow">YOUR NEXT GOOD BREAK</span><h2 id="overlay-title">Ready to stack?</h2><p id="overlay-note">Make room for one more.</p><button id="start" class="primary">Start game</button></div>
      </div>
      <div class="game-actions"><button id="pause" disabled>Pause</button><button id="restart">New game <kbd>R</kbd></button></div>
    </section>
    <aside class="side-panel" aria-label="Game options">
      <div class="previews"><section id="next-card" class="card"><h2 class="eyebrow">UP NEXT</h2><canvas id="next" width="96" height="72" aria-label="Next piece"></canvas></section><section id="hold-card" class="card"><h2 class="eyebrow">HOLD <kbd>C</kbd></h2><canvas id="held" width="96" height="72" aria-label="Held piece"></canvas><span id="held-label" class="preview-label">Empty</span></section></div>
      <section class="settings"><h2 class="eyebrow">YOUR GAME</h2>${settingsMarkup}</section>
      <section class="controls"><h2 class="eyebrow">MAKE YOUR MOVE</h2><dl><dt><kbd>←</kbd> <kbd>→</kbd></dt><dd>Move</dd><dt><kbd>↑</kbd> / <kbd>X</kbd></dt><dd>Rotate</dd><dt><kbd>↓</kbd></dt><dd>Soft drop</dd><dt><kbd>Space</kbd></dt><dd>Hard drop</dd><dt><kbd>C</kbd></dt><dd>Hold piece</dd><dt><kbd>E</kbd></dt><dd>Penetrator</dd><dt><kbd>P</kbd> / <kbd>Esc</kbd></dt><dd>Pause</dd></dl><p class="hint" id="lock-hint">A full gravity interval to settle.</p></section>
    </aside>
  </div>
</main><footer>ONE PIECE AT A TIME.<span>Your pace, your game</span></footer>`;
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const settingsStore=new SettingsStore({
  readUrl:()=>window.location.href,
  readCookies:()=>document.cookie,
  writeCookie:cookie=>{document.cookie=cookie;},
  replaceUrl:url=>{window.history.replaceState(window.history.state,'',url);},
});
const board=element<HTMLCanvasElement>('board');const game=new Game(Math.random,settingsStore.current);
const names={ready:'Ready',running:'Playing',paused:'Paused',over:'Game over'};
function text(id:string,value:string):void { const node=element(id);if(node.textContent!==value)node.textContent=value; }
function render():void {
  drawBoard(board,game);drawPreview(element<HTMLCanvasElement>('next'),game.next);
  drawPreview(element<HTMLCanvasElement>('held'),game.held);
  element('next-card').hidden=game.settings.next==='off';element('hold-card').hidden=game.settings.hold==='off';
  text('held-label',game.held?(game.held.penetrator?'Penetrator ':'')+game.held.type:'Empty');
  text('bonus-symbols',Array(game.bonuses).fill('⚡').join(' '));
  text('bonus-count',`${game.bonuses} ${game.bonuses===1?'bonus':'bonuses'} available`);
  text('penetrator-hint',game.active?.penetrator?'Penetrator active until lock.':'Clear four lines. Press E to pass through blocks.');
  text('lock-hint',game.settings.lock==='interval'?'A full gravity interval to settle.':'Lock on the next failed downward attempt.');
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
  if(['arrowleft','arrowright','arrowdown','arrowup','x','p','escape','r','enter',' ','c','e'].includes(key))event.preventDefault();
  let command:(()=>void)|undefined;
  if(key==='arrowleft')command=()=>{game.move(-1);};
  if(key==='arrowright')command=()=>{game.move(1);};
  if(key==='arrowdown')command=()=>{game.softDrop();};
  if(!event.repeat){
    if(key==='e')command=()=>{game.activate();};
    if(key===' ')command=()=>{game.hardDrop();};
    if(key==='c')command=()=>{game.hold();};
    if(key==='arrowup'||key==='x')command=()=>{game.rotate();};
    if(key==='p'||key==='escape')command=()=>game.togglePause();
    if(key==='r')command=()=>game.restart();
    if(key==='enter')command=()=>game.start();
  }
  if(command)act(command,false);
});
for(const key of KEYS){
  const control=element<HTMLSelectElement>('setting-'+key);control.value=game.settings[key];
  control.addEventListener('change',()=>{if(settingsStore.select(key,control.value))act(()=>game.configure(settingsStore.current),false);});
}
window.addEventListener('blur',()=>{if(game.status==='running')act(()=>game.togglePause(),false);});
function frame(now:number):void{game.advance(now-previous);previous=now;render();requestAnimationFrame(frame);}
if(import.meta.env.MODE==='test')window.__tetris={game,render};
render();requestAnimationFrame(frame);
