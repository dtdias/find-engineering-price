// (async () => {
//     try {
//         const version = '000';
//         const registration = await navigator.serviceWorker.register('/static/js/interceptor.js?v='+version)
//         if (registration.installing) {
//             console.log("Interceptor installing");
//           } else if (registration.waiting) {
//             console.log("Interceptor installed");
//           } else if (registration.active) {
//             console.log("Interceptor active");
//           }
//     } catch (error) {
//         console.error('Falha no registro do Interceptor', error);
//     }
// })();

document.addEventListener('DOMContentLoaded', async (e) => {
    if (!localStorage.getItem('__token')) {
        if (!["/entrar","/cadastro","/esqueci-minha-senha","/sair"].find((path)=> window.location.href.match(path))) {
            return window.location.replace('/entrar')
        }
        return;
    }

    try {
        const response = await CustomFetch.request('GET', '/auth/validate');
        sessionStorage.setItem('userId', response.id);
        document.cookie = `userId=${response.id};`;
        if (document.URL.includes('/entrar')) {
            window.location.replace(`/?userId=${response.id}`)
        }
    } catch (error) {

        localStorage.removeItem('__token');
        Notifier.Error("Autenticação expirada.", { destination: '/entrar' }).showToast()
    }
})