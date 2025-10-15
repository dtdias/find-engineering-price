class Notifier {
    static config = {
        text: "Adicione uma mensagem",
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
    }
    static Success(text, options={}) {
        return Toastify({
            ...Notifier.config,
            backgroundColor: '#00b09b',
            text, ...options
        });
    }
    static Error(text, options={}) {
        return Toastify({
            ...Notifier.config,
            backgroundColor: '#DD0000',
            text, ...options
        });
    }
    static Warning(text, options={}) {
        return Toastify({
            ...Notifier.config,
            backgroundColor: '#DDDD00',
            text, ...options
        });
    }
}