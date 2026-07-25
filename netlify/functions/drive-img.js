const https = require('https');

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
      res.on('end', () => resolve({
        buf: Buffer.concat(chunks),
        type: res.headers['content-type'] || 'image/jpeg',
        status: res.statusCode
      }));
    }).on('error', reject);
  });
}

exports.handler = async function (event) {
  const id = (event.queryStringParameters || {}).id;
  if (!id || !/^[\w-]{10,}$/.test(id)) {
    return { statusCode: 400, body: 'bad id' };
  }
  try {
    const url = 'https://drive.usercontent.google.com/download?id=' + id + '&export=view&authuser=0';
    const { buf, type, status } = await fetchBinary(url);
    if (status === 200) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': type,
          'Cache-Control': 'public, max-age=86400'
        },
        body: buf.toString('base64'),
        isBase64Encoded: true
      };
    }
    return { statusCode: status, body: 'upstream error' };
  } catch (err) {
    return { statusCode: 502, body: err.message };
  }
};
