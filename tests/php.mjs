import { spawn, execFileSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import assert from 'node:assert/strict';
execFileSync('php',['-l','examples/starter.php'],{stdio:'inherit'});
const base = 'http://127.0.0.1:4174';
const server = spawn('php',['-S','127.0.0.1:4174','-t','.'],{stdio:['ignore','ignore','pipe']});
let failure;
server.on('error', error => { failure = error; });
try {
  let response;
  for (let i=0;i<100;i++) {
    if (failure) throw failure;
    try { response=await fetch(base+'/examples/starter.php'); if(response.ok)break; } catch { /* Wait for PHP. */ }
    await setTimeout(100);
  }
  assert.ok(response?.ok,'PHP server started');
  const html=await response.text();
  const csrf=/name="csrf" value="([a-f0-9]+)"/.exec(html)?.[1];
  assert.ok(csrf,'CSRF token is rendered');
  const cookie=response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  const post = values => fetch(base+'/examples/starter.php',{method:'POST',headers:{Cookie:cookie},body:new URLSearchParams(values)});
  const valid=await post({csrf,name:'<script>alert(1)</script>',email:'user@example.com',plan:'pro',notifications:'1'});
  const rendered=await valid.text();
  assert.equal(valid.status,200); assert.match(rendered,/Validation passed/);
  assert.match(rendered,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/); assert.doesNotMatch(rendered,/<script>alert\(1\)<\/script>/);
  const invalid=await post({csrf,name:'',email:'bad',plan:'unsupported'});
  const errors=await invalid.text(); assert.match(errors,/name-error/); assert.match(errors,/email-error/); assert.match(errors,/plan-error/);
  const forbidden=await post({csrf:'wrong-token',name:'Alex',email:'user@example.com',plan:'free'});
  assert.equal(forbidden.status,403);
  const array=await post({csrf,'name[]':'unexpected-array',email:'user@example.com',plan:'free'});
  assert.equal(array.status,200); assert.match(await array.text(),/name-error/);
  const asset=await fetch(base+'/dist/bootstrapcn.js'); assert.equal(asset.status,200);
  console.log('PASS: PHP session/CSRF, valid POST, output escaping, invalid fields, unexpected array input, local JS assets.');
} finally { server.kill(); }
