const { chromium } = require('playwright');
const BASE = 'https://dreamgadgets.in';

const roles = [
  {
    phone:'9800000007',name:'Multi-Store Mgr',slug:'multi_store_manager',
    canSee:['/dashboard','/purchases','/purchases/new','/sales','/sales/pos','/inventory','/branches','/clients','/exchange','/orders','/buyback','/price-guide','/returns','/coupons','/emi','/refunds','/notifications','/users','/whatsapp','/whatsapp/templates','/whatsapp/campaigns'],
    cannotSee:['/gst','/reports','/brands','/announcement-bar','/banners','/settings'],
    hasTransferAccess:true,
    hasFinancialKPIs:false,
  },
  {
    phone:'9800000002',name:'Store Manager',slug:'store_manager',
    canSee:['/dashboard','/purchases','/purchases/new','/sales','/sales/pos','/inventory','/clients','/transfers','/exchange','/orders','/buyback','/price-guide','/returns','/coupons','/emi','/refunds','/reports','/notifications','/brands','/announcement-bar','/banners','/whatsapp','/whatsapp/templates','/whatsapp/campaigns','/settings','/accessories','/accessories/new'],
    cannotSee:['/users','/gst'],
    hasTransferAccess:true,
    hasFinancialKPIs:false,
  },
  {
    phone:'9800000003',name:'Shop Sales',slug:'shop_sales',
    canSee:['/dashboard','/purchases','/purchases/new','/sales','/sales/pos','/inventory','/clients','/exchange','/orders','/buyback','/price-guide','/returns','/coupons','/emi','/refunds','/notifications','/whatsapp','/whatsapp/templates','/whatsapp/campaigns','/accessories','/accessories/new'],
    cannotSee:['/branches','/transfers','/users','/reports','/gst','/brands','/announcement-bar','/banners','/settings'],
    hasTransferAccess:false,
    hasFinancialKPIs:false,
  },
  {
    phone:'9800000004',name:'Store Sales',slug:'store_sales',
    canSee:['/dashboard','/purchases','/purchases/new','/sales','/sales/pos','/inventory','/clients','/exchange','/orders','/buyback','/price-guide','/returns','/coupons','/emi','/refunds','/notifications','/accessories','/accessories/new'],
    cannotSee:['/branches','/transfers','/users','/reports','/gst','/brands','/announcement-bar','/banners','/settings','/whatsapp'],
    hasTransferAccess:false,
    hasFinancialKPIs:false,
  },
  {
    phone:'9800000005',name:'Calling Staff',slug:'calling_staff',
    canSee:['/dashboard','/clients','/orders','/buyback','/price-guide','/returns','/notifications','/whatsapp','/whatsapp/templates','/whatsapp/campaigns'],
    cannotSee:['/purchases','/sales','/sales/pos','/inventory','/branches','/transfers','/exchange','/coupons','/emi','/refunds','/reports','/gst','/users','/brands','/announcement-bar','/banners','/settings','/accessories'],
    hasTransferAccess:false,
    hasFinancialKPIs:false,
  },
  {
    phone:'9800000006',name:'Employee',slug:'employee',
    canSee:['/dashboard'],
    cannotSee:['/purchases','/sales','/sales/pos','/inventory','/branches','/clients','/transfers','/exchange','/orders','/buyback','/price-guide','/returns','/coupons','/emi','/refunds','/reports','/gst','/notifications','/users','/brands','/announcement-bar','/banners','/settings','/whatsapp','/accessories'],
    hasTransferAccess:false,
    hasFinancialKPIs:false,
  },
];

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

let total=0,pass=0,fail=0;
const failures=[];
function t(role,label,ok,detail=''){total++;if(ok)pass++;else{fail++;failures.push(role+': '+label+': '+detail);}console.log((ok?'  ✅':'  ❌')+' '+label+(detail?' — '+detail:''));}

(async()=>{
  const browser=await chromium.launch({headless:true});

  for(const role of roles){
    console.log('\n'+'='.repeat(60));
    console.log('ROLE: '+role.name+' ('+role.slug+') — '+role.phone);
    console.log('='.repeat(60));
    const ctx=await browser.newContext({viewport:{width:1280,height:900}});
    const page=await ctx.newPage();

    // Login
    await page.goto(BASE+'/admin/login');await sleep(2000);
    await page.fill('input[name="identifier"]',role.phone);
    await page.fill('input[name="password"]','Test@1234');
    await page.click('button[type="submit"]');await sleep(4000);
    t(role.name,'Login',page.url().includes('/admin/dashboard'));

    // Sidebar check
    const sLinks=await page.$$eval('aside nav a',els=>els.map(e=>e.textContent.trim()).filter(Boolean));
    const sBtns=await page.$$eval('aside nav button',els=>els.map(e=>e.textContent.trim()).filter(Boolean));
    console.log('  Sidebar ('+sLinks.length+' links): '+sLinks.join(' | '));

    // Pages that SHOULD load
    for(const p of role.canSee){
      await page.goto(BASE+'/admin'+p);await sleep(2000);
      const body=await page.textContent('body');
      const blocked=body.includes('Access Denied')||body.includes('Permission Denied');
      t(role.name,'Page '+p+' loads',!blocked&&body.length>500,blocked?'Access Denied!':body.length<=500?'empty':'');
    }

    // Pages that SHOULD be blocked (via Access Denied or sidebar hidden)
    for(const p of role.cannotSee){
      await page.goto(BASE+'/admin'+p);await sleep(2000);
      const body=await page.textContent('body');
      const blocked=body.includes('Access Denied')||body.includes('Permission Denied');
      const url=page.url();
      const redirected=url.includes('/dashboard')&&!p.includes('/dashboard');
      t(role.name,'Page '+p+' blocked',blocked||redirected||body.length<=500,blocked?'blocked correctly':redirected?'redirected correctly':body.length>500?'NOT BLOCKED!':'empty (OK)');
    }

    // Dashboard: financial KPIs
    await page.goto(BASE+'/admin/dashboard');await sleep(3000);
    const dash=await page.textContent('body');
    const hasFinancial=dash.includes('Net Income')||dash.includes('Revenue');
    if(role.hasFinancialKPIs){
      t(role.name,'Financial KPIs shown',hasFinancial);
    }else{
      t(role.name,'Financial KPIs hidden',!hasFinancial,hasFinancial?'SHOULD BE HIDDEN!':'');
    }

    // Dashboard: page title
    t(role.name,'Dashboard has title',dash.includes(role.name)||dash.includes('Dashboard')||dash.includes('Welcome')||dash.includes('Overview'));

    // Transfers access
    if(!role.hasTransferAccess){
      await page.goto(BASE+'/admin/transfers');await sleep(2000);
      const tBody=await page.textContent('body');
      const tBlocked=tBody.includes('Access Denied')||tBody.includes('Permission Denied');
      t(role.name,'Transfers blocked',tBlocked,tBlocked?'correctly blocked':'NOT blocked!');
    }

    // POS page (only sales roles)
    if(role.canSee.includes('/sales/pos')){
      await page.goto(BASE+'/admin/sales/pos');await sleep(2500);
      const posBody=await page.textContent('body');
      t(role.name,'POS page loads',posBody.includes('Sale')||posBody.includes('Product')||posBody.includes('POS'));
    }

    // Settings page
    if(role.canSee.includes('/settings')){
      await page.goto(BASE+'/admin/settings');await sleep(2500);
      const setBody=await page.textContent('body');
      t(role.name,'Settings loads',setBody.includes('Setting')||setBody.includes('Branch')||setBody.includes('Role'));
    }

    // Users page (admin roles only)
    if(role.canSee.includes('/users')){
      await page.goto(BASE+'/admin/users');await sleep(2500);
      const uBody=await page.textContent('body');
      t(role.name,'Users page loads',uBody.includes('User')||uBody.includes('Role'));
    }

    await ctx.close();
  }

  await browser.close();
  console.log('\n'+'='.repeat(60));
  console.log('TOTAL: '+pass+'/'+total+' passed, '+fail+' failed');
  console.log('='.repeat(60));
  if(failures.length){console.log('\nFAILURES ('+failures.length+'):');failures.forEach((f,i)=>console.log('  '+(i+1)+'. '+f));}
  process.exit(fail>0?1:0);
})();
