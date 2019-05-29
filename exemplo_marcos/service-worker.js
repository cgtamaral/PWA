'use strict';

const CACHE_NAME = 'static-cache-v1';

const FILES_TO_CACHE = [
    'images/offline.svg',
    'offline_001.html',
];

self.addEventListener('install', (evt) => {
    console.log('[ServiceWorker] Instalando');

    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Fazendo cache da página estática');
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
    console.log('[ServiceWorker] Ativado');

    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removendo cache antigo', key);
                    return caches.delete(key);
                }
            }));
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
    console.log('[ServiceWorker] Recebendo', evt.request.url);

    if (evt.request.mode !== 'navigate') {

        return;
    }
    evt.respondWith(
        fetch(evt.request)
            .catch(() => {
                return caches.open(CACHE_NAME)
                    .then((cache) => {
                        return cache.match('offline_001.html');
                    });
            })
    );

});

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Notificação recebida.');
    console.log(`[Service Worker] O conteúdo da notificação é: "${event.data.text()}"`);

    const title = 'Viagem - Marcos';
    const options = {
        body: event.data.text(),
        icon: 'images/icons/128.png',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Clique na notificação recebido.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://www.uol.com.br')
    );
});

self.addEventListener('sync', function(event) {
    if (event.tag == 'syncOcasional') {
        event.waitUntil(syncOcasional());
    }
});


/*###########################

Método de Sincronismo

#############################*/

var syncOcasional = function(){

    fetch("sync.php", {
        method: 'post',
        headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: "dados="+NOW()
    })
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.log('Erro na sincronização', error);
        });

}

//Formatar a data para ficar igual ao PHP
function NOW() {

    var date = new Date();
    var aaaa = date.getFullYear();
    var gg = date.getDate();
    var mm = (date.getMonth() + 1);

    if (gg < 10)
        gg = "0" + gg;

    if (mm < 10)
        mm = "0" + mm;

    var cur_day = aaaa + "-" + mm + "-" + gg;

    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds();

    if (hours < 10)
        hours = "0" + hours;

    if (minutes < 10)
        minutes = "0" + minutes;

    if (seconds < 10)
        seconds = "0" + seconds;

    return cur_day + " " + hours + ":" + minutes + ":" + seconds;

}