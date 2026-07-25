const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseGoldPrices(html) {
  const prices = [];
  const regex = /<div class="sortd-gold-price-item">\s*<span class="sortd-gold-type">([^<]+)<\/span>\s*<span class="sortd-gold-value">([^<]+)<\/span>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    prices.push({ type: match[1].trim(), value: match[2].trim() });
  }
  // Parse updated time
  const updatedMatch = html.match(/<span class="update-dte">\s*([^<]+)/);
  const updated = updatedMatch ? updatedMatch[1].trim() : '';
  return { prices, updated };
}

let cachedPrices = null;
let cacheTime = 0;
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

function fetchBinary(url, redirects) {
  redirects = redirects || 0;
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'));
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBinary(res.headers.location, redirects + 1).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ buf: Buffer.concat(chunks), type: res.headers['content-type'] || 'image/jpeg', status: res.statusCode }));
    }).on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // Proxy Google Drive images so the browser doesn't need Google cookies
  if (req.url.startsWith('/api/drive-img?')) {
    const qs = new URLSearchParams(req.url.slice('/api/drive-img?'.length));
    const id = qs.get('id');
    if (!id || !/^[\w-]{10,}$/.test(id)) {
      res.writeHead(400); res.end('bad id'); return;
    }
    try {
      const driveUrl = 'https://drive.usercontent.google.com/download?id=' + id + '&export=view&authuser=0';
      const { buf, type, status } = await fetchBinary(driveUrl);
      if (status === 200) {
        res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400' });
        res.end(buf);
      } else {
        res.writeHead(status); res.end('upstream error');
      }
    } catch (err) {
      res.writeHead(502); res.end(err.message);
    }
    return;
  }

  // API endpoint for gold prices
  if (req.url === '/api/gold-prices') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const now = Date.now();
      if (!cachedPrices || now - cacheTime > CACHE_MS) {
        const html = await fetchPage('https://dubaicityofgold.com/');
        cachedPrices = parseGoldPrices(html);
        cacheTime = now;
      }
      res.writeHead(200);
      res.end(JSON.stringify(cachedPrices));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Local inventory store (simulates Netlify Blobs for local dev)
  if (req.url === '/api/inventory') {
    const invFile = path.join(DIST, '.local-inventory.json');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-PW');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    if (req.method === 'GET') {
      fs.readFile(invFile, 'utf8', (err, data) => {
        if (err) { res.writeHead(204); res.end(); return; }
        res.writeHead(200); res.end(data);
      });
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try { JSON.parse(body); } catch (e) { res.writeHead(400); res.end('{"error":"bad json"}'); return; }
        fs.writeFile(invFile, body, 'utf8', err => {
          if (err) { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); return; }
          res.writeHead(200); res.end(JSON.stringify({ ok: true }));
        });
      });
      return;
    }
    if (req.method === 'DELETE') {
      fs.unlink(invFile, () => { res.writeHead(200); res.end('{"ok":true}'); });
      return;
    }
    res.writeHead(405); res.end('{"error":"method not allowed"}');
    return;
  }

  // Static file serving
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  filePath = path.join(DIST, filePath);

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(DIST, 'index.html'), (err2, data2) => {
        if (err2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data2);
      });
      return;
    }
    const headers = { 'Content-Type': contentType };
    // Always revalidate app files — without this, browsers heuristically cache
    // the JS bundle and keep running stale code after updates.
    if (ext === '.html' || ext === '.js' || ext === '.css') {
      headers['Cache-Control'] = 'no-cache, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
