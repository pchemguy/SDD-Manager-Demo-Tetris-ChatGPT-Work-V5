/** Hand-checked board/shape fixtures protect geometry independently of the renderer. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TYPES, COLORS, emptyBoard, cells, spawn, fits, landing, type Board, type Piece } from '../../src/model.ts';
const board = (): Board => Array.from({ length: 20 }, () => Array(10).fill(null));
const square = (x = 4, y = 0): Piece => ({ type: 'O', rotation: 0, x, y });

test('empty board has twenty independent rows of ten empty cells', () => {
  const value = emptyBoard();
  assert.equal(value.length, 20); assert.ok(value.every(row => row.length === 10 && row.every(cell => cell === null)));
  value[0][0] = 'I'; assert.equal(value[1][0], null);
});
test('all seven types contain four distinct occupied cells in every rotation', () => {
  assert.equal(new Set(TYPES).size, 7);
  for (const type of TYPES) for (let rotation = 0; rotation < 4; rotation++) {
    const result = cells({ type, rotation, x: 0, y: 0 });
    assert.equal(result.length, 4, `${type}/${rotation}`); assert.equal(new Set(result.map(cell => cell.join(','))).size, 4);
  }
});
test('I and O spawn centered with literal expected coordinates', () => {
  assert.deepEqual(spawn('I'), { type: 'I', rotation: 0, x: 3, y: 0 });
  assert.deepEqual(cells(spawn('O')), [[4,0],[5,0],[4,1],[5,1]]);
});
test('four turns restore geometry and I rotates into a vertical column', () => {
  const first: Piece = { type: 'I', rotation: 0, x: 0, y: 0 };
  assert.deepEqual(cells({ ...first, rotation: 1 }), [[2,0],[2,1],[2,2],[2,3]]);
  assert.deepEqual(cells({ ...first, rotation: 4 }), cells(first));
});
test('regular colors are distinct and never white', () => {
  assert.equal(new Set(Object.values(COLORS)).size, 7);
  assert.ok(Object.values(COLORS).every(color => !['#fff','#ffffff','white'].includes(color.toLowerCase())));
});
test('fit accepts the floor and rejects walls floor overflow and occupied cells', () => {
  const value = board(); assert.equal(fits(value, square(4,18)), true);
  for (const piece of [square(-1),square(9),square(4,19),square(4,-1)]) assert.equal(fits(value,piece),false);
  value[1][5] = 'Z'; assert.equal(fits(value,square()),false);
});
test('normal landing stops before the first blocker and does not mutate the board', () => {
  const value = board(); value[15][4] = 'J'; const before = structuredClone(value);
  assert.equal(landing(value,square()),13); assert.deepEqual(value,before);
  assert.equal(landing(board(),square()),18);
});
test('an illegal starting position has no normal landing', () => {
  const value = board(); value[0][4]='S'; assert.equal(landing(value,square()),null);
});
