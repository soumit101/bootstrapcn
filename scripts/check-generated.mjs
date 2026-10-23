import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const files = ['index.html','dist/bootstrapcn.css','dist/bootstrapcn.js','dist/manifest.json','dist/THIRD-PARTY-LICENSES.txt','dist/LICENSE.txt'];
const before = files.map(file => readFileSync(file));
execFileSync(process.execPath,['scripts/gallery.mjs'],{stdio:'inherit'});
execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit'});
const changed = files.filter((file,i) => !before[i].equals(readFileSync(file)));
if (changed.length) { console.error('Generated files were stale. Commit the regenerated files: ' + changed.join(', ')); process.exitCode=1; }
else console.log('Generated files match their sources.');
