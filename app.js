'use strict';

/*###########################

Serviço em Background

#############################*/

document.getElementById('butSend').addEventListener('click', () => {

    if ('serviceWorker' in navigator) {

        navigator.serviceWorker.ready.then(function(swRegistration) {
            swRegistration.sync.register('syncOcasional').then(() => {
                console.log('Sync registrado');
            });
        });

    }else{
        console.log("Serviceworker não está registrado");
    }
});


/*###########################

Coletando postagens

#############################*/

var ajax = new XMLHttpRequest();

// Seta tipo de requisição e URL com os parâmetros
ajax.open("GET", "dados.json", true);

// Envia a requisição
ajax.send();

// Cria um evento para receber o retorno.
ajax.onreadystatechange = function() {

    // Caso o state seja 4 e o http.status for 200, é porque a requisiçõe deu certo.
    if (ajax.readyState == 4 && ajax.status == 200) {

        // Retorno do Ajax
        var data = ajax.responseText;

        var data_json = JSON.parse(data);


        if(data_json.length == 0){
            document.getElementsByClassName('card_loading')[0].style.display = 'none';
            document.getElementsByClassName('card_empty')[0].style.display = 'block';
        }else {

            document.getElementsByClassName('card_loading')[0].style.display = 'none';

            var container_viagens = document.getElementById('card_content');

            container_viagens.innerHTML = "";

            var html_viagens = "";
            for (var i = 0; i < data_json.length; i++) {

                html_viagens += template_card(data_json[i]['nome'],data_json[i]['apartamento'],data_json[i]['url'],data_json[i]['dia'],data_json[i]['mes']);

            }

            container_viagens.innerHTML = html_viagens;

            cache_cards(data_json);
        }
    }
}


var template_card = function(nome,apto, url,dia,mes){

    return '<div class="planned-trips__card">\n' +
    '                        <div class="planned-trip__image">\n' +
    '                            <img src="'+url+'" alt="imagem do condômino " />\n' +
    '                        </div>\n' +
    '                        <div class="planned-trip__description">\n' +
    '                            <span>'+nome+'</span>\n' +
    '                            <span>'+apto+'</span>\n' +
    '                        </div>\n' +
    '                    </div>';
}

/*###########################

Armazenamento Off-line dos Cards carregados

#############################*/


var cache_cards = function(data_json){

    if('caches' in window) {

        caches.delete('card-cache').then(function () {

            console.log('Cache dos Cards deletado com sucesso!');


            if (data_json.length > 0) {

                var arquivos = ['dados.json'];

                for (var i = 0; i < data_json.length; i++) {

                    arquivos.push(data_json[i]['url']);

                }

                console.log("Arquivos a serem gravados em cache:");
                console.log(arquivos);

                caches.open('card-cache').then(function (cache) {
                    cache.addAll(arquivos)
                        .then(function () {
                            console.log("Arquivos cacheados com sucesso!");
                        });
                });

            }

        });

    }
}


/*###########################

Experiencia de Notificação

#############################*/
let isSubscribed = false;

const applicationServerPublicKey = 'BEq9zCNAq5Dfwy7HiQ36aDtmdkExC8DWx1jWWgksOXqhHcm5QZt9coPBXg3lkXj_Jr8BysYgEM0c1RIx2mWeKGI';
const pushButton = document.getElementById('butPush');


function initialiseUI() {

    pushButton.addEventListener('click', function() {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });


    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            isSubscribed = !(subscription === null);

            if (isSubscribed) {
                console.log('Usuário inscrito na notificação.');
            } else {
                console.log('Usuário NÃO inscrito na notificação.');
            }
            updateBtn();
        });
}

function updateBtn() {

    if (Notification.permission === 'denied') {
        console.log("Notificação negada pelo usuário");
        updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        pushButton.textContent = 'Des. Notificação';
    } else {
        pushButton.textContent = 'Hab. Notificação';
    }
    pushButton.removeAttribute('hidden');
    pushButton.disabled = false;
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then(function(subscription) {
            console.log('Usuário inscrito com sucesso:', subscription);

            updateSubscriptionOnServer(subscription);

            isSubscribed = true;

            updateBtn();
        })
        .catch(function(err) {
            console.log('Falha ao inscrever usuário: ', err);
            updateBtn();
        });
}

//Essa deve ser a função que envia o endpoint de notificação para o servidor, para que posteriormente o app possa enviar notificações aos usuários
function updateSubscriptionOnServer(subscription) {

    if (subscription) {
        console.log(JSON.stringify(subscription));
        document.getElementById('endpoint_push').textContent = JSON.stringify(subscription);
    }
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .catch(function(error) {
            console.log('Erro ao cancelar inscrição', error);
        })
        .then(function() {
            updateSubscriptionOnServer(null);

            console.log('Notificação do usuário foi cancelada.');
            document.getElementById('endpoint_push').textContent = "Notificação cancelada!";
            isSubscribed = false;

            updateBtn();
        });
}

/*###########################

Experiencia de Instalação

#############################*/

let deferredInstallPrompt = null;
const installButton = document.getElementById('butInstall');
installButton.addEventListener('click', installPWA);

window.addEventListener('beforeinstallprompt', saveBeforeInstallPromptEvent);


function saveBeforeInstallPromptEvent(evt) {
    deferredInstallPrompt = evt;
    installButton.removeAttribute('hidden');
}

function installPWA(evt) {
    // CODELAB: Add code show install prompt & hide the install button.
    deferredInstallPrompt.prompt();
    // Escondendo botão
    evt.srcElement.setAttribute('hidden', true);

    //Interceptando se o usuário aceitou ou não a instalação
    deferredInstallPrompt.userChoice
        .then((choice) => {
            if (choice.outcome === 'accepted') {
                console.log('Usuário aceitou', choice);
            } else {
                console.log('Usuário não aceitou', choice);
            }
            deferredInstallPrompt = null;
        });

}

window.addEventListener('appinstalled', logAppInstalled);

function logAppInstalled(evt) {
    console.log('Aplicativo já está instalado.', evt);

}

/*###########################

Função para chave pública

#############################*/

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}