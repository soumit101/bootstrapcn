import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');
test('ready-to-ship assets match the integrity manifest', () => {
  const manifest = JSON.parse(read('dist/manifest.json'));
  for (const [name, meta] of Object.entries(manifest.files)) {
    const data = read('dist/' + name);
    assert.equal(Buffer.byteLength(data), meta.bytes);
    assert.equal('sha384-' + createHash('sha384').update(data).digest('base64'), meta.integrity);
  }
});
test('JavaScript is standalone, valid ESM with Bootstrap 6 exports', () => {
  const js = read('dist/bootstrapcn.js');
  assert.doesNotMatch(js, /^import\s/m);
  assert.doesNotMatch(js, /sourceMappingURL/);
  assert.match(js, /export\{.*Dialog.*Drawer.*Menu/);
  assert.match(js, /export \{ BootstrapCN \}/);
  execFileSync(process.execPath, ['--check', 'dist/bootstrapcn.js']);
});
test('all local gallery assets and PHP starter assets exist', () => {
  for (const page of ['index.html', 'docs/guide.html', 'examples/starter.php']) {
    const html = read(page);
    for (const match of html.matchAll(/<(?:link|script)\b[^>]*?(?:src|href)="([^"?#]+\.(?:css|js))"/g)) {
      const path = new URL(match[1], new URL('../' + page, import.meta.url));
      assert.ok(readFileSync(path).length > 0);
    }
  }
});
test('every catalog pattern has a unique, copyable gallery target', () => {
  const coverage = JSON.parse(read('docs/coverage.json'));
  assert.equal(Object.keys(coverage).length, 66);
  const html = read('index.html');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'No duplicate IDs');
  for (const target of Object.values(coverage)) assert.ok(ids.includes(target), 'Missing component: ' + target);
});
