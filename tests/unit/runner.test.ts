/** Exercise actual wrapper cancellation with an isolated, long-running CLI process tree. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const live = (pid: number): boolean => {
  try { return readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ')[1][0] !== 'Z'; } catch { return false; }
};
for (const signal of ['SIGTERM', 'SIGINT'] as const) test(`browser controller cleans its owned tree on ${signal}`, { skip: process.platform !== 'linux', timeout: 6000 }, async () => {
  const root = mkdtempSync(join(tmpdir(), 'tetris-runner-'));
  mkdirSync(join(root, 'node_modules/playwright'), { recursive: true });
  writeFileSync(join(root, 'node_modules/playwright/cli.js'), `const {spawn}=require('node:child_process');const fs=require('node:fs');const c=spawn(process.execPath,['-e',"require('node:fs').writeFileSync('descendant.json',JSON.stringify([Number(require('node:fs').readFileSync('/proc/self/stat','utf8').split(' ')[0]),process.pid]));setInterval(()=>{},1000)"],{stdio:'ignore'});fs.writeFileSync('pids.json',JSON.stringify([Number(fs.readFileSync('/proc/self/stat','utf8').split(' ')[0]),process.pid]));c.stdout?.resume();setInterval(()=>{},1000);`);
  const controller = spawn(process.execPath, [resolve('scripts/run-browser.mjs')], { cwd: root, stdio: 'ignore' });
  let pids: number[] = []; let namespacePids: number[] = [];
  try {
    const deadline = Date.now() + 2000;
    while ((!existsSync(join(root, 'pids.json')) || !existsSync(join(root, 'descendant.json'))) && Date.now() < deadline) await wait(20);
    assert.equal(existsSync(join(root, 'pids.json')), true, 'fixture started');
    const parent = JSON.parse(readFileSync(join(root, 'pids.json'), 'utf8'));
    const descendant = JSON.parse(readFileSync(join(root, 'descendant.json'), 'utf8'));
    pids = [parent[0], descendant[0]]; namespacePids = [parent[1], descendant[1]];
    await wait(200); // Allow the controller to observe descendant birth identities.
    assert.equal(pids.filter(live).length, 2, 'fixture process tree remains live before cancellation');
    const exited = new Promise<void>(r => controller.once('exit', () => r()));
    controller.kill(signal);
    await Promise.race([exited, wait(2500).then(() => { throw new Error('controller did not exit'); })]);
    assert.deepEqual(pids.filter(live), [], 'cancelled controller left live descendants');
  } finally {
    controller.kill('SIGKILL');
    for (let i=0;i<pids.length;i++) if (live(pids[i])) { try { process.kill(namespacePids[i], 'SIGKILL'); } catch {} }
    rmSync(root, { recursive: true, force: true });
  }
});
test('unexpected runner signal is reported as failure', { timeout: 4000 }, async () => {
  const root=mkdtempSync(join(tmpdir(),'tetris-signal-'));
  mkdirSync(join(root,'node_modules/playwright'),{recursive:true});
  writeFileSync(join(root,'node_modules/playwright/cli.js'),"process.kill(process.pid,'SIGTERM');");
  try {
    const controller=spawn(process.execPath,[resolve('scripts/run-browser.mjs')],{cwd:root,stdio:'ignore'});
    const code=await new Promise<number|null>(r=>controller.once('exit',r));
    assert.notEqual(code,0);
  } finally { rmSync(root,{recursive:true,force:true}); }
});
