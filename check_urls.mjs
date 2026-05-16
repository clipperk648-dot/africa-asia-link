
import axios from 'axios';

const urls = [
  "https://www.alibaba.com/x/1lAevq6?ck=pdp",
  "https://www.alibaba.com/x/1lAevdS?ck=pdp",
  "https://www.alibaba.com/x/1lAevRS?ck=pdp",
  "https://www.alibaba.com/x/1lAevRY?ck=pdp",
  "https://www.alibaba.com/x/1lAew0M?ck=pdp",
  "https://www.alibaba.com/x/1lAew0U?ck=pdp",
  "https://www.alibaba.com/x/1lAew0m?ck=pdp",
  "https://www.alibaba.com/x/1lAew0u?ck=pdp",
  "https://www.alibaba.com/x/1lAewEl?ck=pdp",
  "https://www.alibaba.com/x/1lAewEt?ck=pdp",
  "https://www.alibaba.com/x/1lAew16?ck=pdp",
  "https://www.alibaba.com/x/1lAewF6?ck=pdp",
  "https://www.alibaba.com/x/1lAewFC?ck=pdp",
  "https://www.alibaba.com/x/1lAew1h?ck=pdp",
  "https://www.alibaba.com/x/1lAew1v?ck=pdp",
  "https://www.alibaba.com/x/1lAew27?ck=pdp",
  "https://www.alibaba.com/x/1lAewFh?ck=pdp",
  "https://www.alibaba.com/x/1lAew2M?ck=pdp",
  "https://www.alibaba.com/x/1lAewFy?ck=pdp",
  "https://www.alibaba.com/x/1lAevg2?ck=pdp",
  "https://www.alibaba.com/x/1lAevgz?ck=pdp",
  "https://www.alibaba.com/x/1lAewHC?ck=pdp",
  "https://www.alibaba.com/x/1lAew45?ck=pdp",
  "https://www.alibaba.com/x/1lAew4M?ck=pdp",
  "https://www.alibaba.com/x/1lAew4T?ck=pdp",
  "https://www.alibaba.com/x/1lAevv6?ck=pdp",
  "https://www.alibaba.com/x/1lAevvC?ck=pdp",
  "https://www.alibaba.com/x/1lAevvO?ck=pdp",
  "https://www.alibaba.com/x/1lAevvX?ck=pdp",
  "https://www.alibaba.com/x/1lAewUh?ck=pdp",
  "https://www.alibaba.com/x/1lAewUo?ck=pdp",
  "https://www.alibaba.com/x/1lAevvr?ck=pdp",
  "https://www.alibaba.com/x/1lAevvw?ck=pdp"
];

async function checkUrl(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      maxRedirects: 5,
      validateStatus: null
    });
    console.log(`URL: ${url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Final URL: ${response.request.res.responseUrl || url}`);
    console.log('---');
  } catch (error) {
    console.error(`Error checking ${url}: ${error.message}`);
  }
}

async function run() {
  for (const url of urls) {
    await checkUrl(url);
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();
