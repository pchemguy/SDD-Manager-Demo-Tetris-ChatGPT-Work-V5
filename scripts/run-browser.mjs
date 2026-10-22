/** Bound the Playwright runner, apply diagnosed host settings and clean its owned descendants. */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: resolve('.cache/browsers') };
if (existsSync('.cache/browser-env.json')) {
  const settings = JSON.parse(readFileSync('.cache/browser-env.json', 'utf8'));
  if (settings.firefoxSandboxWorkaround) env.TETRIS_FIREFOX_SANDBOX = '1';
}
mkdirSync('.cache/tmp', { recursive: true });
env.TMPDIR = resolve('.cache/tmp');
const child = spawn(process.execPath, ['node_modules/playwright/cli.js', 'test', ...process.argv.slice(2)],
  { stdio: 'inherit', env, detached: process.platform !== 'win32' });
const owned = new Map();
function observe() {
  if (process.platform !== 'linux') return;
  const rows = [];
  for (const id of readdirSync('/proc').filter(name => /^\d+$/.test(name))) {
    try {
      const stat = readFileSync(`/proc/${id}/stat`, 'utf8').split(') ')[1].split(' ');
      rows.push({ pid: Number(id), parent: Number(stat[1]), birth: stat[19] });
    } catch { /* A process may exit during observation. */ }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const row of rows) if ((row.parent === child.pid || owned.has(row.parent)) && !owned.has(row.pid)) {
      owned.set(row.pid, row.birth); changed = true;
    }
  }
}
const observer = setInterval(observe, 100);
const timer = setTimeout(() => {
  observe();
  if (process.platform === 'win32') spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F']);
  else {
    for (const [pid, birth] of owned) {
      try {
        const stat = readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ')[1].split(' ');
        if (stat[19] === birth) process.kill(pid, 'SIGKILL');
      } catch { /* Already exited. */ }
    }
    try { process.kill(-child.pid, 'SIGKILL'); } catch { /* Already exited. */ }
  }
}, 90_000);
child.on('error', error => { console.error(error.message); clearTimeout(timer); clearInterval(observer); process.exitCode = 1; });
child.on('exit', code => {
  clearTimeout(timer); clearInterval(observer);
  setTimeout(() => {
    const live = [];
    if (process.platform === 'linux') for (const [pid, birth] of owned) {
      try {
        const stat = readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ')[1].split(' ');
        if (stat[19] === birth && stat[0] !== 'Z') live.push(pid);
      } catch { /* Exited and reaped. */ }
    }
    for (const pid of live) { try { process.kill(pid, 'SIGKILL'); } catch { /* Already exited. */ } }
    console.log(JSON.stringify({ runnerExit: code, ownedLiveAfterTeardown: live.length }));
    process.exitCode = live.length ? 1 : (code ?? 1);
  }, 500);
});
