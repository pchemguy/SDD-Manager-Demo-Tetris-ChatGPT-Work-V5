/** Provision one owned managed-browser cache; optional source contains binaries only. */
import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const target = resolve('.cache/browsers');
mkdirSync(target, { recursive: true });
const definitions = JSON.parse(readFileSync('node_modules/playwright-core/browsers.json', 'utf8')).browsers;
const directories = ['chromium-headless-shell', 'firefox', 'ffmpeg'].map(name => {
  const entry = definitions.find(browser => browser.name === name);
  return `${name.replaceAll('-', '_')}-${entry.revision}`;
});
if (process.env.TETRIS_BROWSER_SOURCE) {
  const source = resolve(process.env.TETRIS_BROWSER_SOURCE);
  for (const name of directories) {
    if (!existsSync(resolve(source, name, 'INSTALLATION_COMPLETE')))
      throw new Error(`Incomplete managed distribution: ${name}`);
    if (!existsSync(resolve(target, name))) cpSync(resolve(source, name), resolve(target, name), { recursive: true });
  }
  console.log(JSON.stringify({ provisioning: 'contained-binary-copy', source, target, directories }));
} else {
  const result = spawnSync(process.execPath, ['node_modules/playwright/cli.js', 'install', '--only-shell', 'chromium', 'firefox'],
    { stdio: 'inherit', env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: target }, timeout: 120_000 });
  process.exitCode = result.status ?? 1;
}
