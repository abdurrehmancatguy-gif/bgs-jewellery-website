'use strict';
// Self-contained — no npm packages, no local requires.
// Uses Node's built-in https module + NETLIFY_BLOBS_CONTEXT (auto-set by Netlify).
const https = require('https');

function getCtx() {
  var raw = process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw) return null;
  try { return JSON.parse(Buffer.from(raw, 'base64').toString('utf8')); }
  catch (e) { return null; }
}

function doReq(method, url, token, body) {
  return new Promise(function (resolve, reject) {
    var u = new URL(url);
    var h = { 'x-nf-token': token };
    if (body != null) {
      h['content-type'] = 'text/plain; charset=utf-8';
      h['content-length'] = String(Buffer.byteLength(body));
    }
    var r = https.request({
      hostname: u.hostname, port: 443,
      path: u.pathname + (u.search || ''),
      method: method, headers: h
    }, function (res) {
      var d = '';
      res.on('data', function (c) { d += c; });
      res.on('end', function () { resolve({ status: res.statusCode, body: d }); });
    });
    r.on('error', reject);
    if (body != null) r.write(body);
    r.end();
  });
}

function blobURL(ctx, key) {
  var api = ctx.apiURL || 'https://api.netlify.com';
  return api + '/api/v1/blobs/' + ctx.siteID + '/bgs-site/' + encodeURIComponent(key);
}

async function blobGet(key) {
  var ctx = getCtx();
  if (!ctx) return null;
  if (!ctx.siteID) throw new Error('siteID missing from context. Keys present: ' + Object.keys(ctx).join(', '));
  var res = await doReq('GET', blobURL(ctx, key), ctx.token);
  if (res.status === 404 || res.status === 204) return null;
  if (res.status !== 200) throw new Error('Blob GET ' + res.status + ': ' + res.body.slice(0, 300));
  return res.body;
}

async function blobSet(key, value) {
  var ctx = getCtx();
  if (!ctx) throw new Error('NETLIFY_BLOBS_CONTEXT not available in this environment');
  var res = await doReq('PUT', blobURL(ctx, key), ctx.token, String(value));
  if (res.status !== 200 && res.status !== 204) throw new Error('Blob PUT ' + res.status + ': ' + res.body.slice(0, 300));
}

var HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  // GET — return full snapshot so all devices can sync
  if (event.httpMethod === 'GET') {
    try {
      var data = await blobGet('snapshot');
      return { statusCode: 200, headers: HEADERS, body: data || '{}' };
    } catch (err) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
    }
  }

  // POST — save full snapshot (no auth required)
  if (event.httpMethod === 'POST') {
    try {
      var body = event.body || '{}';
      JSON.parse(body); // validate JSON
      await blobSet('snapshot', body);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    } catch (err) {
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
};
