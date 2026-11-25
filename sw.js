const V='scheda-ale-v9';
const FCSS='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap';
const FILES=['./','index.html','manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png','icon-maskable-512.png'];
const FONT=/^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
// salva subito anche i font, così l'app ha il suo aspetto anche offline dal primo avvio
const fonts=c=>fetch(FCSS).then(r=>{c.put(FCSS,r.clone());return r.text()}).then(t=>Promise.all([...t.matchAll(/url\((https:[^)]+)\)/g)].map(m=>fetch(m[1]).then(r=>c.put(m[1],r))))).catch(()=>{});
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES).then(()=>fonts(c))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  if(FONT.test(r.url)){e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res})));return}
  if(new URL(r.url).origin!==location.origin)return;
  if(r.mode==='navigate'){
    // pagina: prova la rete (così prendi gli aggiornamenti), se non c'è campo usa la copia salvata
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res})));
});
