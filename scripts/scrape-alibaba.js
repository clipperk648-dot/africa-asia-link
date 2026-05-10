const https = require('https');
const url = require('url');

async function fetchPage(urlString) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new url.URL(urlString);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function scrapeProduct(urlString) {
  try {
    const html = await fetchPage(urlString);
    
    // Extract JSON-LD data
    const jsonldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let productData = {
      url: urlString,
      error: null
    };

    if (jsonldMatch) {
      try {
        const jsonld = JSON.parse(jsonldMatch[1]);
        productData.title = jsonld.name || '';
        productData.description = jsonld.description || '';
        productData.image = jsonld.image || '';
        productData.price = jsonld.offers?.price || 0;
        productData.currency = jsonld.offers?.priceCurrency || 'USD';
      } catch (e) {
        productData.error = 'Failed to parse JSON-LD';
      }
    }

    // Extract from meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const priceMatch = html.match(/current-price['"]\s*:\s*['"]([\d.]+)['"]/i);

    if (titleMatch) productData.title = titleMatch[1];
    if (descMatch) productData.description = descMatch[1];
    if (imageMatch) productData.image = imageMatch[1];
    if (priceMatch) productData.price = parseFloat(priceMatch[1]);

    return productData;
  } catch (error) {
    return {
      url: urlString,
      error: error.message,
      title: 'Error',
      description: error.message
    };
  }
}

async function main() {
  const urls = [
    'https://www.alibaba.com/x/1lAevq6?ck=pdp',
    'https://www.alibaba.com/x/1lAevdS?ck=pdp',
    'https://www.alibaba.com/x/1lAevRS?ck=pdp',
    'https://www.alibaba.com/x/1lAevRY?ck=pdp',
    'https://www.alibaba.com/x/1lAew0M?ck=pdp',
    'https://www.alibaba.com/x/1lAew0U?ck=pdp',
    'https://www.alibaba.com/x/1lAew0m?ck=pdp',
    'https://www.alibaba.com/x/1lAew0u?ck=pdp',
    'https://www.alibaba.com/x/1lAewEl?ck=pdp',
    'https://www.alibaba.com/x/1lAewEt?ck=pdp',
    'https://www.alibaba.com/x/1lAew16?ck=pdp',
    'https://www.alibaba.com/x/1lAewF6?ck=pdp',
    'https://www.alibaba.com/x/1lAewFC?ck=pdp',
    'https://www.alibaba.com/x/1lAew1h?ck=pdp',
    'https://www.alibaba.com/x/1lAew1v?ck=pdp',
    'https://www.alibaba.com/x/1lAew27?ck=pdp',
    'https://www.alibaba.com/x/1lAewFh?ck=pdp',
    'https://www.alibaba.com/x/1lAew2M?ck=pdp',
    'https://www.alibaba.com/x/1lAewFy?ck=pdp',
    'https://www.alibaba.com/x/1lAevg2?ck=pdp',
    'https://www.alibaba.com/x/1lAevgz?ck=pdp',
    'https://www.alibaba.com/x/1lAewHC?ck=pdp',
    'https://www.alibaba.com/x/1lAew45?ck=pdp',
    'https://www.alibaba.com/x/1lAew4M?ck=pdp',
    'https://www.alibaba.com/x/1lAew4T?ck=pdp',
    'https://www.alibaba.com/x/1lAevv6?ck=pdp',
    'https://www.alibaba.com/x/1lAevvC?ck=pdp',
    'https://www.alibaba.com/x/1lAevvO?ck=pdp',
    'https://www.alibaba.com/x/1lAevvX?ck=pdp',
    'https://www.alibaba.com/x/1lAewUh?ck=pdp',
    'https://www.alibaba.com/x/1lAewUo?ck=pdp',
    'https://www.alibaba.com/x/1lAevvr?ck=pdp',
    'https://www.alibaba.com/x/1lAevvw?ck=pdp'
  ];

  console.log('Scraping Alibaba products...');
  const products = [];

  for (const u of urls) {
    console.log('Fetching: ' + u);
    const product = await scrapeProduct(u);
    products.push(product);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error);
