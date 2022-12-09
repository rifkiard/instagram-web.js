'use strict'

const EventEmitter = require('events');
const puppeteer = require('puppeteer');
const { URLs, Events } = require("./utilities/Constants");
const InterfaceController = require('./utilities/InterfaceContorller');

class Client extends EventEmitter {
    page;
    username;
    password;
    interfaceController;

    constructor({
        username,
        password
    }) {
        super();

        this.username = username;
        this.password = password;
    }

    async initialize() {
        this.interfaceController = new InterfaceController({
            client: this
        });

        const browser = await puppeteer.launch({
            headless: false
        });

        this.page = (await browser.pages())[0];

        await this.page.goto(URLs.LOGIN, {
            waitUntil: 'networkidle0',
            timeout: 0,
        });

        this.page.on("response", async (response) => {
            if (response.url().split("?")[0] == URLs.LOGIN_API) {
                const responseJSON = await response.json();

                if (responseJSON.authenticated) {
                    this.emit(Events.AUTHENTICATED, {});
                } else {
                    this.emit(Events.AUTHENTICATION_FAILURE, {});
                }
            }
        });

        await this.page.type('[name="username"]', this.username);
        await this.page.type('[name="password"]', this.password);
        await this.page.click('[type="submit"]');
    }

    async getProfilePicture(username) {
        await this.page.goto(`${URLs.BASE}/${username}`, {
            waitUntil: 'networkidle0',
            timeout: 0,
        });

        return await this.page.evaluate(this.interfaceController.getProfilePicture, username)
    }

    async getUser(username) {
        return new Promise(async (resolve) => {
            this.page.on("response", async (response) => {
                if (response.url().split("?")[0] == URLs.PROFILE_API) {
                    resolve((await response.json())['data']['user']);
                }
            })

            await this.page.goto(`${URLs.BASE}/${username}`, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            resolve(null);
        })
    }
}

module.exports = Client