import { spawn } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
const port = process.env.BOOTSTRAPCN_TEST_PORT || '4173';
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: port }, stdio: ['ignore','pipe','pipe'] });
let serverError = '';
server.stderr.on('data', chunk => { serverError += chunk; });
const run = file => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [file], { env: { ...process.env, BOOTSTRAPCN_TEST_URL: base }, stdio: 'inherit' });
  child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${file} failed (${code})`)));
});
try {
  let ready = false;
  for (let i=0; i<100; i++) {
    if (server.exitCode !== null) throw new Error('Preview server failed: ' + serverError);
    try { if ((await fetch(base)).ok) { ready=true; break; } } catch { /* Wait for the local listener. */ }
    await setTimeout(100);
  }
  if (!ready) throw new Error('Preview server did not start');
  await run('tests/browser.mjs'); await run('tests/expanded-browser.mjs');
} finally { server.kill(); }
