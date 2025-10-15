class CookieManager {
  static setCookie(name, value) {
    const cookie = CookieManager.getCookie(name);
    if (cookie) document.cookie = CookieManager.getCookies().replace(`${name}=${cookie}`, `${name}=${value}`);
    else document.cookie = CookieManager.getCookies().concat(`${CookieManager.getCookies() == "" ? "" : ";"}${name}=${value}`); 
  }

  static getCookie(name) {
    const regex = new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    const match = CookieManager.getCookies().split(';').find((cookie) => regex.test(cookie));
    return match ? match[2] : null;
  }

  static getCookies() {
    return document.cookie;
  }

  static deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}