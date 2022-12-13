'use strict'

const EventEmitter = require('events');
const { STATUS, URLS, EVENTS } = require('../utilities/Constants');

/**
 * Base class of Client.
 */
class ClientEvent extends EventEmitter {
    authentication;
    puppeteerOptions;
    userAgent;

    browser;
    page;
    status;

    constructor() {
        super();
    }

    listen() {
        this.on(EVENTS.AUTHENTICATED, this.onClientAuthenticated);
        this.on(EVENTS.AUTHENTICATION_FAILURE, this.onClientAuthenticated);
    }

    onClientAuthenticated() {
        this.page.removeListener("response", this.onPageAuthenticationResponse);
        this.status = STATUS.AUTHENTICATED;
    }

    onClientAuthenticationFaulure() {
        this.status = STATUS.UNAUTHENTICATED;
    }

    onPageAuthenticationResponse = async (response) => {
        if (response.status() == 302 && response.url() == URLS.LOGIN) {
            this.emit(EVENTS.AUTHENTICATED);
        }
        if (response.url().split("?")[0] == URLS.LOGIN_API) {
            const responseJSON = await response.json();

            if (responseJSON.authenticated) {
                this.emit(EVENTS.AUTHENTICATED);
            } else {
                this.emit(EVENTS.AUTHENTICATION_FAILURE);
            }
        }
    }
}

module.exports = ClientEvent;