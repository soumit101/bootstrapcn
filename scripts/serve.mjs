import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.md': 'text/plain' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root) || path.extname(file) === '.php') { res.writeHead(403); res.end('Use a PHP server for PHP examples.'); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8' }); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT || 8080), '127.0.0.1', () => console.log(`Gallery: http://127.0.0.1:${process.env.PORT || 8080}`));
