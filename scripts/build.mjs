import { rmSync, mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
const result = spawnSync(process.execPath, [fileURLToPath(new URL('node_modules/rollup/dist/bin/rollup', root)), '-c'], {
  cwd: fileURLToPath(root), env: { ...process.env, SERVE: 'false' }, stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
copyFileSync(new URL('package.json', root), new URL('package.json', dist));
