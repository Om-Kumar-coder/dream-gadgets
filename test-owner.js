const { chromium } = require('playwright');
const BASE = 'https://dreamgadgets.in';
const allPages = [
  '/dashboard','/purchases','/purchases/new','/sales','/sales/pos','/inventory',
  '/branches','/clients','/transfers','/exchange','/orders','/buyback','/price-guide',
  '/returns','/coupons','/emi','/refunds','/reports','/gst','/notifications',
  '/users','/brands','/announcement-bar','/banners','/accessories','/accessories/new',
  '/whatsapp','/whatsapp/templates','/whatsapp/campaigns','/settings',
];
let total=0, pass=0, fail=0;
const failures = [];
function t(label,ok,detail=''){total++;if(ok)pass++;else{fail++;failures.push(label+': '+detail);}console.log((ok?'  ✅':'  ❌')+' '+label+(detail?' — '+detail:''));}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
(async()=>{
  const browser=await chromium.launch({headless:true});
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  await page.goto(BASE+'/admin/login');await sleep(2000);
  await page.fill('input[name="identifier"]','9800000001');
  await page.fill('input[name="password"]','Test@1234');
  await page.click('button[type="submit"]');await sleep(4000);
  t('Owner login',page.url().includes('/admin/dashboard'));
  const sidebarLinks=await page.$$eval('aside nav a',els=>els.map(e=>e.textContent.trim()).filter(Boolean));
  const sidebarBtns=await page.$$eval('aside nav button',els=>els.map(e=>e.textContent.trim()).filter(Boolean));
  console.log('\nSidebar ('+sidebarLinks.length+' links, '+sidebarBtns.length+' dropdowns):',[...sidebarLinks,...sidebarBtns].join(' | '));
  for(const p of allPages){
    await page.goto(BASE+'/admin'+p);await sleep(2000);
    const body=await page.textContent('body');
    const blocked=body.includes('Access Denied')||body.includes('Permission Denied');
    t('Page '+p,!blocked&&body.length>500,blocked?'Access Denied':body.length<=500?'empty page':'');
  }
  await page.goto(BASE+'/admin/dashboard');await sleep(3000);
  const dash=await page.textContent('body');
  t('Dashboard: Financial KPIs',dash.includes('Net Income')||dash.includes('Revenue'));
  t('Dashboard: Stock info',dash.includes('Stock')||dash.includes('Inventory'));
  const qa=await page.$$('a[href*="pos"],a[href*="inventory"],a[href*="users"],a[href*="reports"]');
  t('Dashboard: Quick Actions',qa.length>0,qa.length+' actions found');
  // Test POS page has form elements
  await page.goto(BASE+'/admin/sales/pos');await sleep(2500);
  const posBody=await page.textContent('body');
  t('POS page has content',posBody.includes('Sale')||posBody.includes('Product'));
  // Test new purchase
  await page.goto(BASE+'/admin/purchases/new');await sleep(2500);
  const newPurch=await page.textContent('body');
  t('New Purchase form',newPurch.includes('Purchase')||newPurch.includes('Product'));
  // Test settings
  await page.goto(BASE+'/admin/settings');await sleep(2500);
  const setBody=await page.textContent('body');
  t('Settings page',setBody.includes('Setting')||setBody.includes('Branch')||setBody.includes('Role'));
  // Test GST
  await page.goto(BASE+'/admin/gst');await sleep(2500);
  const gstBody=await page.textContent('body');
  t('GST page',gstBody.includes('GST')||gstBody.includes('GSTR'));
  await browser.close();
  console.log('\n'+'='.repeat(50));
  console.log('OWNER: '+pass+'/'+total+' passed, '+fail+' failed');
  console.log('='.repeat(50));
  if(failures.length){console.log('\nFAILURES:');failures.forEach((f,i)=>console.log('  '+(i+1)+'. '+f));}
  process.exit(fail>0?1:0);
})();
