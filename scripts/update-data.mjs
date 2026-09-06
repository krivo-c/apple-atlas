import fs from 'node:fs/promises';

const PRODUCTS = {
  'iPhone 17': '/shop/buy-iphone/iphone-17',
  'iPhone 17 Pro': '/shop/buy-iphone/iphone-17-pro',
  'iPhone Air': '/shop/buy-iphone/iphone-air',
  'MacBook Air': '/shop/buy-mac/macbook-air',
  'iPad Air': '/shop/buy-ipad/ipad-air',
  'Apple Watch Series 11': '/shop/buy-watch/apple-watch-series-11'
};

// Apple storefronts use locale paths (for example /ch-fr/ and /de/),
// not a simple /xx/ country URL. Keep the storefront registry explicit so
// a change in Apple's country-selector HTML cannot make the database empty.
const MARKETS = [
  ['us','United States','https://www.apple.com/us/','USD','840','North America','🇺🇸'],
  ['ca','Canada','https://www.apple.com/ca/','CAD','124','North America','🇨🇦'],
  ['mx','Mexico','https://www.apple.com/mx/','MXN','484','North America','🇲🇽'],
  ['br','Brazil','https://www.apple.com/br/','BRL','076','South America','🇧🇷'],
  ['cl','Chile','https://www.apple.com/cl/','CLP','152','South America','🇨🇱'],
  ['co','Colombia','https://www.apple.com/co/','COP','170','South America','🇨🇴'],
  ['de','Germany','https://www.apple.com/de/','EUR','276','Europe','🇩🇪'],
  ['fr','France','https://www.apple.com/fr/','EUR','250','Europe','🇫🇷'],
  ['ch','Switzerland','https://www.apple.com/ch-de/','CHF','756','Europe','🇨🇭'],
  ['it','Italy','https://www.apple.com/it/','EUR','380','Europe','🇮🇹'],
  ['es','Spain','https://www.apple.com/es/','EUR','724','Europe','🇪🇸'],
  ['pt','Portugal','https://www.apple.com/pt/','EUR','620','Europe','🇵🇹'],
  ['at','Austria','https://www.apple.com/at/','EUR','040','Europe','🇦🇹'],
  ['be','Belgium','https://www.apple.com/be/','EUR','056','Europe','🇧🇪'],
  ['nl','Netherlands','https://www.apple.com/nl/','EUR','528','Europe','🇳🇱'],
  ['lu','Luxembourg','https://www.apple.com/lu/','EUR','442','Europe','🇱🇺'],
  ['ie','Ireland','https://www.apple.com/ie/','EUR','372','Europe','🇮🇪'],
  ['gb','United Kingdom','https://www.apple.com/uk/','GBP','826','Europe','🇬🇧'],
  ['dk','Denmark','https://www.apple.com/dk/','DKK','208','Europe','🇩🇰'],
  ['se','Sweden','https://www.apple.com/se/','SEK','752','Europe','🇸🇪'],
  ['no','Norway','https://www.apple.com/no/','NOK','578','Europe','🇳🇴'],
  ['fi','Finland','https://www.apple.com/fi/','EUR','246','Europe','🇫🇮'],
  ['pl','Poland','https://www.apple.com/pl/','PLN','616','Europe','🇵🇱'],
  ['cz','Czech Republic','https://www.apple.com/cz/','CZK','203','Europe','🇨🇿'],
  ['hu','Hungary','https://www.apple.com/hu/','HUF','348','Europe','🇭🇺'],
  ['ro','Romania','https://www.apple.com/ro/','RON','642','Europe','🇷🇴'],
  ['gr','Greece','https://www.apple.com/gr/','EUR','300','Europe','🇬🇷'],
  ['jp','Japan','https://www.apple.com/jp/','JPY','392','Asia-Pacific','🇯🇵'],
  ['kr','South Korea','https://www.apple.com/kr/','KRW','410','Asia-Pacific','🇰🇷'],
  ['cn','China mainland','https://www.apple.com.cn/','CNY','156','Asia-Pacific','🇨🇳'],
  ['hk','Hong Kong','https://www.apple.com/hk/','HKD','344','Asia-Pacific','🇭🇰'],
  ['tw','Taiwan','https://www.apple.com/tw/','TWD','158','Asia-Pacific','🇹🇼'],
  ['sg','Singapore','https://www.apple.com/sg/','SGD','702','Asia-Pacific','🇸🇬'],
  ['my','Malaysia','https://www.apple.com/my/','MYR','458','Asia-Pacific','🇲🇾'],
  ['th','Thailand','https://www.apple.com/th/','THB','764','Asia-Pacific','🇹🇭'],
  ['in','India','https://www.apple.com/in/','INR','356','Asia-Pacific','🇮🇳'],
  ['au','Australia','https://www.apple.com/au/','AUD','036','Asia-Pacific','🇦🇺'],
  ['nz','New Zealand','https://www.apple.com/nz/','NZD','554','Asia-Pacific','🇳🇿'],
  ['ae','United Arab Emirates','https://www.apple.com/ae/','AED','784','Middle East','🇦🇪'],
  ['sa','Saudi Arabia','https://www.apple.com/sa/','SAR','682','Middle East','🇸🇦'],
  ['il','Israel','https://www.apple.com/il/','ILS','376','Middle East','🇮🇱'],
  ['tr','Türkiye','https://www.apple.com/tr/','TRY','792','Europe','🇹🇷'],
  ['za','South Africa','https://www.apple.com/za/','ZAR','710','Africa','🇿🇦']
].map(([code,country,base,currency,isoNumeric,region,flag]) => ({code,country,base, currency,isoNumeric,region,flag}));

const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function text(url) {
  const r = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 ApplePriceAtlas/4.0',
      'accept-language': 'en-US,en;q=0.8'
    }
  });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

function parseNumber(raw, currency) {
  const s = clean(raw).replace(/[^0-9.,-]/g, '');
  if (!s) return null;
  // Most Apple storefronts use either 1,234.56 or 1.234,56. For integer
  // currencies (JPY/KRW/CLP etc.) separators are thousands separators.
  let n;
  if (/,\d{2}$/.test(s) && /\./.test(s)) n = Number(s.replace(/\./g, '').replace(',', '.'));
  else if (/\.\d{2}$/.test(s) && /,/.test(s)) n = Number(s.replace(/,/g, ''));
  else if (/^\d{1,3}(\.\d{3})+$/.test(s) || /^\d{1,3}(,\d{3})+$/.test(s)) n = Number(s.replace(/[.,]/g, ''));
  else n = Number(s.replace(/,/g, ''));
  return Number.isFinite(n) && n > 50 && n < 10000000 ? n : null;
}

function price(html, currency) {
  const values = [];
  const meta = /(?:itemprop=["']price["']|property=["']product:price:amount["']|name=["']price["'])[^>]*content=["']([^"']+)["']/gi;
  for (const m of html.matchAll(meta)) values.push(m[1]);
  const priceClass = /class=["'][^"']*price[^"']*["'][^>]*>([^<]{1,80})</gi;
  for (const m of html.matchAll(priceClass)) values.push(m[1]);
  const symbol = {
    CHF:'CHF',USD:'USD',EUR:'€|EUR',GBP:'£|GBP',JPY:'¥|JPY',CAD:'CAD|CA\\$',AUD:'A\\$|AUD',
    SGD:'S\\$|SGD',HKD:'HK\\$|HKD',CNY:'CN¥|RMB|CNY|¥',INR:'₹|INR',KRW:'₩|KRW',TWD:'NT\\$|TWD',
    MXN:'MX\\$|MXN',BRL:'R\\$|BRL',TRY:'₺|TRY',DKK:'kr|DKK',SEK:'kr|SEK',NOK:'kr|NOK',PLN:'zł|PLN',
    CZK:'Kč|CZK',HUF:'Ft|HUF',RON:'lei|RON',THB:'฿|THB',MYR:'RM|MYR',NZD:'NZ\\$|NZD',AED:'AED',SAR:'SAR',
    ILS:'₪|ILS',ZAR:'R|ZAR',CLP:'CLP|\\$',COP:'COP|\\$'
  }[currency] || currency;
  const re = new RegExp(`(?:${symbol})\\s*[0-9][0-9.,]*|[0-9][0-9.,]*\\s*(?:${symbol})`, 'gi');
  const body = html.replace(/<script[\\s\\S]*?<\\/script>/gi, ' ').replace(/<style[\\s\\S]*?<\\/style>/gi, ' ');
  for (const m of body.matchAll(re)) values.push(m[0]);
  for (const v of values) {
    const n = parseNumber(v, currency);
    if (n !== null) return n;
  }
  return null;
}

async function main() {
  const out = {
    updatedAt: new Date().toISOString(),
    marketCount: MARKETS.length,
    source: 'Apple storefront registry',
    products: {}
  };

  for (const [product, path] of Object.entries(PRODUCTS)) {
    const rows = [];
    for (const market of MARKETS) {
      const url = market.base.replace(/\/$/, '') + path;
      try {
        const html = await text(url);
        const value = price(html, market.currency);
        if (value) rows.push({...market, price:value, url});
      } catch (error) {
        console.warn(`Skipping ${market.country} / ${product}: ${error.message}`);
      }
      await sleep(150);
    }
    out.products[product] = {rows, count: rows.length};
    console.log(`${product}: ${rows.length}/${MARKETS.length}`);
  }

  await fs.mkdir('data', {recursive:true});
  await fs.writeFile('data/prices.json', JSON.stringify(out, null, 2));
  console.log(`Updated ${MARKETS.length} markets`);
}

main().catch(error => { console.error(error); process.exit(1); });
