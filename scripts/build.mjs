import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const out = new URL('../dist/', import.meta.url);
mkdirSync(out, { recursive: true });
const clean = text => text.replace(/\/\*[#@] sourceMappingURL=.*?\*\//g, '').replace(/\/\/# sourceMappingURL=.*$/gm, '');
const banner = '/*! bootstrapcn 0.3.0 | Bootstrap 6.0.0-alpha.1 | MIT | See THIRD-PARTY-LICENSES.txt */\n';
// Alpha.1's Combobox composes Menu on its own element, but its instance registry
// rejects the second instance. Permit only this documented composition pair.
const registryGuard = 'i.has(t)||0===i.size?i.set(t,n):console.error';
const registryFix = 'i.has(t)||0===i.size||["bs.combobox","bs.menu"].includes(t)&&[...i.keys()].every(k=>["bs.combobox","bs.menu"].includes(k))?i.set(t,n):console.error';
const vendorJS = clean(read('vendor/bootstrap.bundle.min.js'));
if (vendorJS.split(registryGuard).length !== 2) throw new Error('Bootstrap registry patch needs review for this vendor version.');
const css = banner + clean(read('vendor/bootstrap.min.css')) + '\n' + ['src/bootstrapcn.css', 'src/themes.css', 'src/components.css'].map(read).join('\n');
const js = banner + vendorJS.replace(registryGuard, registryFix) + '\n' + ['src/components.js', 'src/bootstrapcn.js'].map(file => read(file).replace(/^import .*;\r?\n/gm, '')).join('\n');
writeFileSync(new URL('bootstrapcn.css', out), css);
writeFileSync(new URL('bootstrapcn.js', out), js);
writeFileSync(new URL('THIRD-PARTY-LICENSES.txt', out), ['BOOTSTRAP-LICENSE', 'FLOATING-UI-LICENSE', 'VANILLA-CALENDAR-LICENSE'].map(name => name + '\n\n' + read('vendor/' + name)).join('\n\n---\n\n'));
writeFileSync(new URL('LICENSE.txt', out), read('LICENSE'));
const manifest = { version: '0.3.0', bootstrap: '6.0.0-alpha.1', files: {} };
for (const [name, content] of [['bootstrapcn.css', css], ['bootstrapcn.js', js]]) manifest.files[name] = { bytes: Buffer.byteLength(content), integrity: 'sha384-' + createHash('sha384').update(content).digest('base64') };
writeFileSync(new URL('manifest.json', out), JSON.stringify(manifest, null, 2) + '\n');
console.log('Ready: dist/bootstrapcn.css and dist/bootstrapcn.js. No build needed by consumers.');
