class CustomFetch {
    constructor() {
        this.baseUrl = env.API_URL;
    }

    static async request(method, path, body = null) {
        const url = new URL(path, env.API_URL);
        /**
         * @type {RequestInit}
         */
        const options = {
            method: method.toUpperCase(),
            headers: new Headers({
                'Content-Type': 'application/json',
                'X-Device-Fingerprint': CustomFetch.getFingerprint(),
            }),
        };

        if (body && !['DELETE', 'GET'].includes(options.method)) {
            options.body = (() => {
                if (body instanceof FormData) return new URLSearchParams(body)
                return JSON.stringify(body)
            })();
            if (options.body instanceof URLSearchParams) options.headers.set('Content-Type', 'application/x-www-form-urlencoded')
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    static getFingerprint() {
        const fingerprint = navigator.userAgent + navigator.platform + navigator.vendor;
        return new TextEncoder().encode(fingerprint).toString();
    }
}