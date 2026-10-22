/** Pure tetromino coordinates, board collision and shared normal/penetrator placement and landing. */
export const WIDTH = 10;
export const HEIGHT = 20;
export const TYPES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'] as const;
export type PieceType = typeof TYPES[number];
export type Board = (PieceType | null)[][];
export interface Piece { penetrator?:boolean; type: PieceType; rotation: number; x: number; y: number }
export const COLORS: Record<PieceType, string> = {
  I: '#60d8e8', J: '#729bff', L: '#ffae64', O: '#f8dc74', S: '#8fdbaf', T: '#bd9cf6', Z: '#ef8192',
};
const SHAPES: Record<PieceType, number[][]> = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
};

/** Allocate independent rows so clearing and fixtures cannot alias other rows. */
export function emptyBoard(): Board {
  return Array.from({ length: HEIGHT }, () => Array<PieceType | null>(WIDTH).fill(null));
}

/** Return occupied board coordinates; matrix padding does not count as occupancy. */
export function cells(piece: Piece): [number, number][] {
  let matrix = SHAPES[piece.type];
  const turns = ((piece.rotation % 4) + 4) % 4;
  for (let turn = 0; turn < turns; turn++)
    matrix = matrix.map((row, y) => row.map((_, x) => matrix[matrix.length - 1 - x][y]));
  const output: [number, number][] = [];
  matrix.forEach((row, y) => row.forEach((occupied, x) => {
    if (occupied) output.push([piece.x + x, piece.y + y]);
  }));
  return output;
}

export function spawn(type: PieceType): Piece {
  return { type, rotation: 0, x: Math.floor((WIDTH - SHAPES[type].length) / 2), y: 0 };
}

/** A terminal position must be entirely in bounds and avoid every settled cell. */
export function fits(board: Board, piece: Piece): boolean {
  return inBounds(piece)&&cells(piece).every(([x,y])=>board[y][x]===null);
}

/** Shared terminal placement: first obstruction normally, lowest legal position for a penetrator. */
export function landing(board: Board, piece: Piece): number | null {
  if(piece.penetrator){
    if(!inBounds(piece))return null;
    let lowest:number|null=null;
    for(let y=piece.y;y<HEIGHT;y++)if(fits(board,{...piece,y}))lowest=y;
    return lowest;
  }
  if (!fits(board, piece)) return null;
  let y = piece.y;
  while (fits(board, { ...piece, y: y + 1 })) y++;
  return y;
}

export const KICKS = [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1]] as const;
/** A projection crossing the midline stays visible; inspect occupied cells, not its anchor. */
export function ghostVisible(piece:Piece|null,mode:'hide'|'dynamic'|'show'):boolean {
  return piece!==null && mode!=='hide' && (mode==='show'||cells(piece).some(([,y])=>y>=HEIGHT/2));
}

export function inBounds(piece:Piece):boolean {
  return cells(piece).every(([x,y])=>x>=0&&x<WIDTH&&y>=0&&y<HEIGHT);
}
/** Intermediate overlap is safe only while an in-bounds terminal landing remains reachable. */
export function canPlace(board:Board,piece:Piece):boolean {
  return piece.penetrator?landing(board,piece)!==null:fits(board,piece);
}
