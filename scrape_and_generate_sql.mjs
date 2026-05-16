
import axios from 'axios';

const SUPABASE_URL = 'https://pwpqaljpshlcxxsfrrgv.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cHFhbGpwc2hsY3h4c2Zycmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTkzODksImV4cCI6MjA5MzgzNTM4OX0.z2bTBu6lDr3i7NykxydSTvrc5u2DHbVau4Mn4cfAA6M';

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

async function run() {
  console.log(`Starting to scrape ${urls.length} URLs...`);
  try {
    const response = await axios.post(`${SUPABASE_URL}/functions/v1/scrape-alibaba`, {
      urls: urls
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });

    const results = response.data.results;
    console.log(`Successfully scraped ${results.length} products.`);

    const products = results.filter(r => r.success).map(r => r.data);
    console.log(`Total successful products: ${products.length}`);

    // Output as SQL insert
    if (products.length > 0) {
      console.log('Generating SQL insert...');
      const values = products.map(p => {
        return `('${p.title.replace(/'/g, "''")}', '${p.image_url}', ${p.price_min}, ${p.price_max}, ${p.moq}, '${p.description.replace(/'/g, "''")}', '${p.supplier_name.replace(/'/g, "''")}', '${p.alibaba_link}', '${p.category}', '${p.status}')`;
      }).join(',\n');

      const sql = `INSERT INTO supplier_products (title, image_url, price_min, price_max, moq, description, supplier_name, alibaba_link, category, status) VALUES \n${values};`;
      
      process.stdout.write('---SQL_START---\n');
      process.stdout.write(sql);
      process.stdout.write('\n---SQL_END---\n');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

run();
