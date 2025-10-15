const STATIC_CACHE_NAME = 'static-cache-v1';
const APP_CACHE_NAME = 'app-cache-#VERSION';

self.addEventListener('install', event => {
    console.log('Service Worker instalado.');
    self.skipWaiting(); 
});

self.addEventListener('activate', event => {
    console.log('Service Worker ativado.');
    event.waitUntil(clients.claim());
});

self.onfetch= (event) => {
    event.respondWith(new Response(blob, { headers: { contentType: "text/css" }}))
    // if (event.request.mode === 'navigate') { 
    //     event.respondWith(
    //         (async () => {
    //             const customResponse = await fetch('/pre-html-call', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({ message: 'Antes de carregar o HTML' })
    //             });

    //             if (!customResponse.ok) {
    //                 console.error('Falha na chamada ao servidor antes de carregar o HTML:', customResponse.statusText);
    //             }

    //             return fetch(event.request);
    //         })()
    //     );
    // } else {
    //     event.respondWith(fetch(event.request));
    // }
};