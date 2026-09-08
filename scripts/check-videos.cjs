const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1100},locale:'en-US'});const results=[];const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BELLWORKS_URL || 'http://127.0.0.1:7331/bellworks.html');
 for(const day of ['a','b','c']) {
  await page.locator('#day-'+day).click();
  const slugs=await page.locator('.exercise-card').evaluateAll(cs=>cs.map(c=>c.dataset.slug));
  for(const slug of slugs) {
   await page.locator('[data-slug="'+slug+'"] .exercise-select').click();
   await page.locator('#studio-video .video-poster').click();
   await page.locator('#studio-video iframe').waitFor({timeout:15000});
   const frame=await (await page.locator('#studio-video iframe').elementHandle()).contentFrame();
   await frame.waitForURL('**/embed/**');
   let result;
   try{
    await frame.waitForFunction(()=>{const v=document.querySelector('video');return v&&v.readyState>=2&&v.currentTime>0&&!v.paused},{},{timeout:12000});
    const t=await frame.locator('video').evaluate(v=>v.currentTime);
    await page.waitForTimeout(350);
    result=await frame.locator('video').evaluate((v,t)=>({playing:!v.paused&&v.currentTime>t,duration:v.duration,time:v.currentTime}),t);
   }catch(e){result={playing:false,error:(await frame.locator('body').innerText()).slice(0,240),status:await page.locator('#studio-video .video-status').textContent()};}
   await page.locator('#studio-video .video-stage').screenshot({path:'/private/tmp/bellworks-video-'+slug+'.png'});
   results.push({slug,videoId:await page.locator('#studio-video').getAttribute('data-video-id'),...result});console.log(JSON.stringify(results.at(-1)));
  }
 }
 console.log('Browser errors',errors);fs.writeFileSync('/private/tmp/bellworks-video-results.json',JSON.stringify(results,null,2));
 await browser.close();
 if(errors.length||results.some(r=>!r.playing))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
