/** Deterministic round state and continuous-grounding simulation, independent of the DOM. */
import { WIDTH, TYPES, cells, fits, emptyBoard, spawn, type Board, type Piece, type PieceType } from './model.ts';
export type Status = 'ready' | 'running' | 'paused' | 'over';
export class Game {
  board: Board = emptyBoard();
  active: Piece | null = null;
  next: PieceType = 'I';
  status: Status = 'ready';
  score = 0;
  rows = 0;
  private random: () => number;
  private fallElapsed = 0;
  private lockElapsed = 0;

  constructor(random: () => number = Math.random) {
    this.random = random;
    this.reset('ready');
  }
  get level(): number { return 1 + Math.floor(this.rows / 10); }
  get interval(): number { return Math.max(80, Math.round(800 * 0.8 ** (this.level - 1))); }
  get grounded(): boolean {
    return this.active !== null && fits(this.board, this.active)
      && !fits(this.board, { ...this.active, y: this.active.y + 1 });
  }
  start(): void {
    if (this.status === 'ready') this.status = 'running';
    else if (this.status === 'over') this.restart();
  }
  restart(): void { this.reset('running'); }
  togglePause(): void {
    if (this.status === 'running') this.status = 'paused';
    else if (this.status === 'paused') this.status = 'running';
  }
  move(direction: number): boolean {
    if (!this.active || (direction !== -1 && direction !== 1)) return false;
    return this.place({ ...this.active, x: this.active.x + direction });
  }
  rotate(): boolean {
    return this.active ? this.place({ ...this.active, rotation: (this.active.rotation + 1) % 4 }) : false;
  }
  softDrop(): boolean { return this.down(true); }

  /** Process gravity and lock events chronologically, including ties and long frames. */
  advance(milliseconds: number): void {
    if (!Number.isFinite(milliseconds) || milliseconds < 0 || this.status !== 'running') return;
    let remaining = milliseconds;
    while (remaining > 0 && this.status === 'running') {
      const grounded = this.grounded;
      if (!grounded) this.lockElapsed = 0;
      const interval = this.interval;
      const step = Math.min(remaining, Math.max(0, interval - this.fallElapsed),
        grounded ? Math.max(0, interval - this.lockElapsed) : Infinity);
      this.fallElapsed += step;
      if (grounded) this.lockElapsed += step;
      remaining -= step;
      if (grounded && this.lockElapsed >= interval) { this.lock(); continue; }
      if (this.fallElapsed >= interval) { this.fallElapsed = 0; this.down(false); }
    }
  }

  private draw(): PieceType { return TYPES[Math.floor(this.random() * TYPES.length)]; }
  private reset(status: Status): void {
    this.board = emptyBoard(); this.score = 0; this.rows = 0;
    this.fallElapsed = 0; this.lockElapsed = 0;
    this.active = spawn(this.draw()); this.next = this.draw(); this.status = status;
  }
  private place(candidate: Piece): boolean {
    if (this.status !== 'running' || !fits(this.board, candidate)) return false;
    const wasGrounded = this.grounded;
    this.active = candidate;
    if (!wasGrounded || !this.grounded) this.lockElapsed = 0;
    return true;
  }
  private down(soft: boolean): boolean {
    if (!this.active) return false;
    const moved = this.place({ ...this.active, y: this.active.y + 1 });
    if (moved && soft) this.score++;
    return moved;
  }
  private lock(): void {
    if (!this.active || !fits(this.board, this.active)) return;
    for (const [x, y] of cells(this.active)) this.board[y][x] = this.active.type;
    const previousLevel = this.level;
    const retained = this.board.filter(row => !row.every(Boolean));
    const cleared = this.board.length - retained.length;
    this.board = [...Array.from({ length: cleared }, () => Array<PieceType | null>(WIDTH).fill(null)), ...retained];
    this.score += ([0,100,300,500,800][cleared] ?? 0) * previousLevel;
    this.rows += cleared;
    this.active = spawn(this.next); this.next = this.draw();
    this.fallElapsed = 0; this.lockElapsed = 0;
    if (!fits(this.board, this.active)) { this.active = null; this.status = 'over'; }
  }
}
