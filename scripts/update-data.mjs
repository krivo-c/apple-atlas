import fs from 'node:fs/promises';

const PRODUCTS = [
  // iPhone
  ['iPhone 17 Pro','iPhone','électronique','/shop/buy-iphone/iphone-17-pro'],
  ['iPhone Air','iPhone','électronique','/shop/buy-iphone/iphone-air'],
  ['iPhone 17','iPhone','électronique','/shop/buy-iphone/iphone-17'],
  ['iPhone 17e','iPhone','électronique','/shop/buy-iphone/iphone-17e'],
  ['iPhone 16','iPhone','électronique','/shop/buy-iphone/iphone-16'],
  // Mac
  ['MacBook Neo','Mac','électronique','/shop/buy-mac/macbook-neo'],
  ['MacBook Air','Mac','électronique','/shop/buy-mac/macbook-air'],
  ['MacBook Pro','Mac','électronique','/shop/buy-mac/macbook-pro'],
  ['iMac','Mac','électronique','/shop/buy-mac/imac'],
  ['Mac mini','Mac','électronique','/shop/buy-mac/mac-mini'],
  ['Mac Studio','Mac','électronique','/shop/buy-mac/mac-studio'],
  ['Studio Display','Mac','électronique','/shop/buy-mac/studio-display'],
  ['Studio Display XDR','Mac','électronique','/shop/buy-mac/studio-display-xdr'],
  // iPad
  ['iPad Pro','iPad','électronique','/shop/buy-ipad/ipad-pro'],
  ['iPad Air','iPad','électronique','/shop/buy-ipad/ipad-air'],
  ['iPad','iPad','électronique','/shop/buy-ipad/ipad'],
  ['iPad mini','iPad','électronique','/shop/buy-ipad/ipad-mini'],
  // Apple Watch
  ['Apple Watch Series 11','Apple Watch','électronique','/shop/buy-watch/apple-watch'],
  ['Apple Watch SE 3','Apple Watch','électronique','/shop/buy-watch/apple-watch-se'],
  ['Apple Watch Ultra 3','Apple Watch','électronique','/shop/buy-watch/apple-watch-ultra'],
  // AirPods
  ['AirPods 4','AirPods','électronique','/shop/buy-airpods/airpods-4'],
  ['AirPods Pro 3','AirPods','électronique','/shop/buy-airpods/airpods-pro-3'],
  ['AirPods Max 2','AirPods','électronique','/shop/buy-airpods/airpods-max'],
  // TV & Maison
  ['Apple TV 4K','TV & Maison','électronique','/shop/buy-tv/apple-tv-4k'],
  ['HomePod mini','TV & Maison','électronique','/shop/buy-homepod/homepod-mini'],
  ['HomePod','TV & Maison','électronique','/shop/buy-homepod/homepod'],
  ['AirTag','AirTag','électronique','/shop/buy-airtag/airtag'],
  ['Apple Vision Pro','Apple Vision Pro','électronique','/shop/buy-vision']
].map(([name,category,type,path]) => ({name,category,type,path}));

// Only markets with a genuine Apple Online Store are listed here.
const MARKETS = [
  ['us','United States','https://www.apple.com/us/','USD','840','North America','🇺🇸'],
  ['ca','Canada','https://www.apple.com/ca/','CAD','124','North America','🇨🇦'],
  ['mx','Mexico','https://www.apple.com/mx/','MXN','484','North America','🇲🇽'],
  ['br','Brazil','https://www.apple.com/br/','BRL','076','South America','🇧🇷'],
  ['cl','Chile','https://www.apple.com/cl/','CLP','152','South America','🇨🇱'],
  ['de','Germany','https://www.apple.com/de/','EUR','276','Europe','🇩🇪'],
  ['fr','France','https://www.apple.com/fr/','EUR','250','Europe','🇫🇷'],
  ['ch','Switzerland','https://www.apple.com/ch-fr/','CHF','756','Europe','🇨🇭'],
  ['it','Italy','https://www.apple.com/it/','EUR','380','Europe','🇮🇹'],
  ['es','Spain','https://www.apple.com/es/','EUR','724','Europe','🇪🇸'],
  ['pt','Portugal','https://www.apple.com/pt/','EUR','620','Europe','🇵🇹'],
  ['at','Austria','https://www.apple.com/at/','EUR','040','Europe','🇦🇹'],
  ['be','Belgium','https://www.apple.com/be-fr/','EUR','056','Europe','🇧🇪'],
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
  ['tr','Türkiye','https://www.apple.com/tr/','TRY','792','Europe','🇹🇷'],
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
  ['ph','Philippines','https://www.apple.com/ph/','PHP','608','Asia-Pacific','🇵🇭'],
  ['vn','Vietnam','https://www.apple.com/vn/','VND','704','Asia-Pacific','🇻🇳'],
  ['ae','United Arab Emirates','https://www.apple.com/ae/','AED','784','Middle East','🇦🇪'],
  ['sa','Saudi Arabia','https://www.apple.com/sa/','SAR','682','Middle East','🇸🇦']
].map(([code,country,base,currency,isoNumeric,region,flag]) => ({code,country,base,currency,isoNumeric,region,flag}));

const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function text(url) {
  const r = await fetch(url, {headers:{'user-agent':'Mozilla/5.0 ApplePriceAtlas/5.0','accept-language':'en-US,en;q=0.8'}});
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

function parseNumber(raw) {
  const s = clean(raw).replace(/[^0-9.,-]/g, '');
  if (!s) return null;
  let n;
  if (/,\d{2}$/.test(s) && /\./.test(s)) n = Number(s.replace(/\./g, '').replace(',', '.'));
  else if (/\.\d{2}$/.test(s) && /,/.test(s)) n = Number(s.replace(/,/g, ''));
  else if (/^\d{1,3}(\.\d{3})+$/.test(s) || /^\d{1,3}(,\d{3})+$/.test(s)) n = Number(s.replace(/[.,]/g, ''));
  else n = Number(s.replace(/,/g, ''));
  return Number.isFinite(n) && n > 20 && n < 10000000 ? n : null;
}

function price(html, currency) {
  const body = html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ');
  const currencyPattern = {
    CHF:'CHF|Fr\\.?',USD:'\\$',EUR:'€|EUR',GBP:'£|GBP',CAD:'CA\\$|CAD',AUD:'A\\$|AUD',JPY:'¥|JPY',CNY:'CN¥|RMB|CNY|¥',
    HKD:'HK\\$|HKD',SGD:'S\\$|SGD',KRW:'₩|KRW',INR:'₹|INR',MXN:'MX\\$|MXN',BRL:'R\\$|BRL',TRY:'₺|TRY',
    PLN:'zł|PLN',SEK:'kr|SEK',NOK:'kr|NOK',DKK:'kr|DKK',CZK:'Kč|CZK',HUF:'Ft|HUF',RON:'lei|RON',TWD:'NT\\$|TWD',
    AED:'AED',SAR:'SAR',ILS:'₪|ILS',NZD:'NZ\\$|NZD',THB:'฿|THB',MYR:'RM|MYR',ZAR:'ZAR|R',CLP:'CLP|\\$',COP:'COP|\\$',
    PHP:'₱|PHP',VND:'₫|đ|VND'
  }[currency] || currency;

  // Apple frequently shows a cash price followed by a financing option such as
  // "or 855,000đ/month". Never accept the monthly installment as the product price.
  const monthly = /(?:\/|per\s+|a\s+|pro\s+|por\s+|w\s+|na\s+|miesięcznie|monat|mois|mes|meses|mån|måned|mês|miesiąc|miesiące|tháng|bulan|月|개월|เดือน|개월|month|months)\s*(?:month|months|mo\.?|mois|mes|mån|måned|mês|tháng|bulan|月|개월|เดือน)?/i;

  // First, inspect Apple "From / À partir de / Indulóár / Từ / From" labels.
  const lead = '(?:From|À\\s*partir\\s*de|A\\s*partir\\s*de|Indulóár:?|Từ|Da|A\\s*partire\\s*da|Ab|Vanaf|Fra|Från|Od|Od|De)';
  const fromRe = new RegExp(`${lead}\\s*(?:${currencyPattern})?\\s*([0-9][0-9.,\\s]*)\\s*(?:${currencyPattern})?(?!\\s*(?:/|per|pro|por|a|month|months|mo\\.?|mois|mes|mån|måned|mês|tháng|bulan|月|개월|เดือน))`, 'i');
  const from = body.match(fromRe);
  if (from) { const n = parseNumber(from[1]); if (n) return n; }

  // Structured price metadata is generally the cleanest source.
  const meta = /(?:itemprop=["']price["']|property=["']product:price:amount["']|name=["']price["'])[^>]*content=["']([^"']+)["']/gi;
  for (const m of body.matchAll(meta)) {
    const n=parseNumber(m[1]);
    if(n) return n;
  }

  // Last resort: scan currency amounts, but reject anything explicitly tied to financing/monthly terms.
  const re = new RegExp(`(?:${currencyPattern})\\s*[0-9][0-9.,\\s]*|[0-9][0-9.,\\s]*\\s*(?:${currencyPattern})`, 'gi');
  for (const m of body.matchAll(re)) {
    const start=Math.max(0,m.index-45), end=Math.min(body.length,m.index+m[0].length+45);
    const context=body.slice(start,end);
    if(monthly.test(context)) continue;
    const n=parseNumber(m[0]);
    if(n) return n;
  }
  return null;
}

async function fetchProduct(market, product) {
  // Some Apple markets use a language-specific storefront path (notably Belgium).
  const bases = [market.base];
  if (market.code === 'be') bases.push('https://www.apple.com/be-nl/');
  if (market.code === 'ch') bases.push('https://www.apple.com/ch-de/');
  for (const base of bases) {
    const url=base.replace(/\/$/,'')+product.path;
    try { return {html:await text(url),url}; } catch(error) {
      if (!String(error.message).startsWith('404')) throw error;
    }
  }
  throw new Error(`404 ${market.base}${product.path}`);
}

async function main() {
  const out = {updatedAt:new Date().toISOString(),marketCount:MARKETS.length,productCount:PRODUCTS.length,source:'Apple Online Stores — prix publics affichés par Apple, hors mensualités',products:{}};
  for (const product of PRODUCTS) {
    const rows=[];
    for (const market of MARKETS) {
      try {
        const {html,url}=await fetchProduct(market,product);
        const value=price(html,market.currency);
        if(value) rows.push({...market,product:product.name,category:product.category,type:product.type,price:value,url});
        else console.warn(`No price ${market.country} / ${product.name}`);
      } catch(error) {
        console.warn(`Skipping ${market.country} / ${product.name}: ${error.message}`);
      }
      await sleep(100);
    }
    out.products[product.name]={category:product.category,type:product.type,path:product.path,rows,count:rows.length};
    console.log(`${product.name}: ${rows.length}/${MARKETS.length}`);
  }
  await fs.mkdir('data',{recursive:true});
  await fs.writeFile('data/prices.json',JSON.stringify(out,null,2));
  console.log(`Updated ${MARKETS.length} markets × ${PRODUCTS.length} products`);
}
main().catch(error=>{console.error(error);process.exit(1);});
