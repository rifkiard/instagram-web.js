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
    SIDECAR: "https://www.instagram.com/api/v1/media/configure_sidecar/"
}

exports.DEFAULT_PUPPETEER_OPTIONS = {
    headless: true,
    defaultViewport: null,
}

exports.DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36";

exports.ALLOWED_MEDIA_EXTENSIONS = [
    "jpeg",
    "png",
    "heic",
    "heif",
    "mp4",
    "mov",
    "qt"
]

exports.ALLOWED_MEDIA_MIMETYPES = [
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "video/mp4",
    "video/quicktime"
]

exports.CROP_SIZES = {
    ORIGINAL: "original",
    SQUARE: "1:1",
    PORTRAIT: "4:5",
    LANDSCAPE: "16:9",
}

exports.MAX_FEED_VIDEO_DURATION_IN_SECONDS = 60;