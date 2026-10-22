/** Bound Playwright and clean its owned process tree, including controller cancellation. */
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
let stopped = false, cancellation = 0, forceTimer;
const selfProc = process.platform === 'linux' ? Number(readFileSync('/proc/self/stat', 'utf8').split(' ')[0]) : 0;
function stat(id) {
  try {
    const fields = readFileSync(`/proc/${id}/stat`, 'utf8').split(') ')[1].split(' ');
    return { parent: Number(fields[1]), birth: fields[19], state: fields[0] };
  } catch { return null; }
}
function observe() {
  if (process.platform !== 'linux') return;
  const rows = [];
  for (const id of readdirSync('/proc').filter(name => /^\d+$/.test(name))) {
    const info = stat(id);
    if (!info) continue;
    try {
      // procfs can expose outer PIDs while Node uses an inner PID namespace.
      const ids = readFileSync(`/proc/${id}/status`, 'utf8').match(/^NSpid:\s+(.+)$/m)?.[1].trim().split(/\s+/);
      rows.push({ id: Number(id), pid: Number(ids?.at(-1) ?? id), ...info });
    } catch { /* Exited during observation. */ }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const row of rows) if (!owned.has(row.id) &&
      ((row.parent === selfProc && row.pid === child.pid) || owned.has(row.parent))) {
      owned.set(row.id, row); changed = true;
    }
  }
}
function survivors() {
  return [...owned.values()].filter(row => { const now = stat(row.id); return now?.birth === row.birth && now.state !== 'Z'; });
}
function terminate(signal) {
  observe();
  if (process.platform === 'win32') {
    spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F']);
  } else {
    for (const row of survivors()) { try { process.kill(row.pid, signal); } catch {} }
    if (!stopped) { try { process.kill(-child.pid, signal); } catch {} }
  }
}
function cancel(code) {
  if (cancellation) return;
  cancellation = code;
  terminate('SIGTERM');
  forceTimer = setTimeout(() => terminate('SIGKILL'), 500);
}
process.on('SIGINT', () => cancel(130));
process.on('SIGTERM', () => cancel(143));
const observer = setInterval(observe, 100);
const timer = setTimeout(() => cancel(124), 90_000);
child.on('error', error => { console.error(error.message); clearTimeout(timer); clearInterval(observer); process.exitCode = 1; });
child.on('exit', code => {
  stopped = true;
  clearTimeout(timer); clearInterval(observer);
  setTimeout(() => {
    clearTimeout(forceTimer);
    const leaked = survivors().length;
    if (leaked) terminate('SIGKILL');
    setTimeout(() => {
      const live = survivors().length;
      console.log(JSON.stringify({ runnerExit: code, ownedLiveAfterTeardown: live, cancellation }));
      process.exitCode = live || (leaked && !cancellation) ? 1 : (cancellation || (code ?? 1));
    }, 100);
  }, 600);
});
