const CACHE_NAME='javid-chemistry-platform-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  await cache.addAll(SHELL);
  try{const response=await fetch('../',{cache:'reload'});if(response.ok)await cache.put('../',response)}catch(_){}
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const cached=await cache.match(request,{ignoreSearch:true});
    if(cached){
      fetch(request).then(response=>{if(response.ok)cache.put(request,response.clone())}).catch(()=>{});
      return cached;
    }
    try{
      const response=await fetch(request);
      if(response.ok&&(request.mode==='navigate'||/\.(css|js|svg)$/.test(url.pathname)))cache.put(request,response.clone());
      return response;
    }catch(error){
      if(request.mode==='navigate'){const fallback=await cache.match('./index.html');if(fallback)return fallback}
      throw error;
    }
  })());
});
