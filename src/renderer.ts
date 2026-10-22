/** Canvas presentation only: board mutation and geometry remain in the domain. */
import { COLORS, cells, spawn, ghostVisible, type Piece, type PieceType } from './model.ts';
import type { Game } from './game.ts';
function block(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  context.fillStyle=color;context.fillRect(x+1,y+1,size-2,size-2);
  context.strokeStyle='#101c29';context.strokeRect(x+3,y+3,size-6,size-6);
}
function piece(context: CanvasRenderingContext2D, value: Piece, size: number): void {
  for(const [x,y] of cells(value))block(context,x*size,y*size,size,COLORS[value.type]);
}
export function drawBoard(canvas: HTMLCanvasElement, game: Game): void {
  const context=canvas.getContext('2d')!;const size=canvas.width/10;
  context.fillStyle='#0c1622';context.fillRect(0,0,canvas.width,canvas.height);
  context.strokeStyle='#162536';context.lineWidth=1;
  for(let x=1;x<10;x++){context.beginPath();context.moveTo(x*size,0);context.lineTo(x*size,canvas.height);context.stroke();}
  for(let y=1;y<20;y++){context.beginPath();context.moveTo(0,y*size);context.lineTo(canvas.width,y*size);context.stroke();}
  game.board.forEach((row,y)=>row.forEach((type,x)=>{if(type)block(context,x*size,y*size,size,COLORS[type]);}));
  const ghost=game.ghost;
  if(ghostVisible(ghost,game.ghostMode)&&ghost){
    context.fillStyle=COLORS[ghost.type];context.strokeStyle=COLORS[ghost.type];
    for(const [x,y] of cells(ghost)){
      context.globalAlpha=.14;context.fillRect(x*size+2,y*size+2,size-4,size-4);
      context.globalAlpha=.65;context.strokeRect(x*size+2,y*size+2,size-4,size-4);
    }
    context.globalAlpha=1;
  }
  if(game.active)piece(context,game.active,size);
}
export function drawPreview(canvas: HTMLCanvasElement, type: PieceType | null): void {
  const context=canvas.getContext('2d')!;context.clearRect(0,0,canvas.width,canvas.height);
  if(!type)return;
  const points=cells(spawn(type));const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const minX=Math.min(...xs),minY=Math.min(...ys);const size=24;
  const ox=(canvas.width-(Math.max(...xs)-minX+1)*size)/2;
  const oy=(canvas.height-(Math.max(...ys)-minY+1)*size)/2;
  for(const [x,y] of points)block(context,ox+(x-minX)*size,oy+(y-minY)*size,size,COLORS[type]);
}
