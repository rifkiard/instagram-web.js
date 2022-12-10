'use strict'

exports.EVENTS = {
    AUTHENTICATED: "authenticated",
    AUTHENTICATION_FAILURE: 'auth_failure',
}

exports.STATUS = {
    AUTHENTICATED: "authenticated",
    UNAUTHENTICATED: "unauthenticated",
}

exports.URLS = {
    BASE: "https://www.instagram.com/",
    LOGIN: "https://www.instagram.com/accounts/login/",
    LOGIN_API: "https://www.instagram.com/api/v1/web/accounts/login/ajax/",
    PROFILE_API: "https://www.instagram.com/api/v1/users/web_profile_info/",
}

exports.DEFAULT_PUPPETEER_OPTIONS = {
    headless: true,
    defaultViewport: null,
}

exports.DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36";