/** Enumerate TypeScript suites without relying on shell glob expansion. */
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../tests/unit/', import.meta.url);
const files = (existsSync(root) ? readdirSync(root, { withFileTypes: true }) : [])
  .filter(file => file.isFile() && file.name.endsWith('.test.ts'))
  .map(file => fileURLToPath(new URL(`../tests/unit/${file.name}`, import.meta.url)));
if (!files.length) { console.log('No unit suites created yet.'); process.exit(0); }
const result = spawnSync(process.execPath, ['--experimental-strip-types', '--test', ...files],
  { stdio: 'inherit', timeout: 30_000 });
process.exit(result.status ?? 1);
