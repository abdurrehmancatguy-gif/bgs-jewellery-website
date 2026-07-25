'use strict';
// Minimal Netlify Blobs client using only Node's built-in https module.
// Reads NETLIFY_BLOBS_CONTEXT (auto-set by Netlify in all function environments).
// No npm package needed — drop this file alongside inventory.js.
const https = require('https');

function getCtx() {
  const raw = process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw) return null;
  try { return JSON.parse(Buffer.from(raw, 'base64').toString('utf8')); }
  catch (e) { return null; }
}

function doReq(method, url, token, body) {
  return new Promise(function (resolve, reject) {
    var u = new URL(url);
    var headers = { 'x-nf-token': token };
    if (body != null) {
      headers['content-type'] = 'text/plain; charset=utf-8';
      headers['content-length'] = String(Buffer.byteLength(body));
    }
    var r = https.request({
      hostname: u.hostname,
      port: 443,
      path: u.pathname + (u.search || ''),
      method: method,
      headers: headers
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

exports.getStore = function (name) {
  return {
    get: async function (key) {
      var ctx = getCtx();
      if (!ctx) return null;
      if (!ctx.siteID) throw new Error('No siteID in context. Keys: ' + JSON.stringify(Object.keys(ctx)));
      var base = ctx.apiURL || 'https://api.netlify.com';
      var url = base + '/api/v1/blobs/' + ctx.siteID + '/' + name + '/' + encodeURIComponent(key);
      var res = await doReq('GET', url, ctx.token);
      if (res.status === 404 || res.status === 204) return null;
      if (res.status !== 200) throw new Error('Blob GET ' + res.status + ': ' + res.body);
      return res.body;
    },
    set: async function (key, value) {
      var ctx = getCtx();
      if (!ctx) throw new Error('NETLIFY_BLOBS_CONTEXT not available');
      var base = ctx.apiURL || 'https://api.netlify.com';
      var url = base + '/api/v1/blobs/' + ctx.siteID + '/' + name + '/' + encodeURIComponent(key);
      var res = await doReq('PUT', url, ctx.token, String(value));
      if (res.status !== 200 && res.status !== 204) throw new Error('Blob PUT ' + res.status + ': ' + res.body);
    },
    delete: async function (key) {
      var ctx = getCtx();
      if (!ctx) return;
      var base = ctx.apiURL || 'https://api.netlify.com';
      var url = base + '/api/v1/blobs/' + ctx.siteID + '/' + name + '/' + encodeURIComponent(key);
      var res = await doReq('DELETE', url, ctx.token);
      if (res.status !== 200 && res.status !== 204 && res.status !== 404) throw new Error('Blob DELETE ' + res.status + ': ' + res.body);
    }
  };
};
