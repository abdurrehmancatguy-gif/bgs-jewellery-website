const https = require('https');

function fetchPage(url, redirects) {
  redirects = redirects || 0;
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'));
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location, redirects + 1).then(resolve).catch(reject);
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
  const updatedMatch = html.match(/<span class="update-dte">\s*([^<]+)/);
  const updated = updatedMatch ? updatedMatch[1].trim() : '';
  return { prices, updated };
}

exports.handler = async function (event) {
  try {
    const html = await fetchPage('https://dubaicityofgold.com/');
    const data = parseGoldPrices(html);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
