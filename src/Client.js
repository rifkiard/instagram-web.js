'use strict'

const puppeteer = require('puppeteer');
const ClientEvent = require('./ClientEvent');
const { URLS, DEFAULT_PUPPETEER_OPTIONS, DEFAULT_USER_AGENT, STATUS } = require("./utilities/Constants");
const InterfaceController = require('./utilities/InterfaceContorller');

class Client extends ClientEvent {
    constructor(options) {
        super();

        const {
            authentication,
            puppeteerOptions = {},
            userAgent = DEFAULT_USER_AGENT
        } = options;

        this.userAgent = userAgent;
        this.puppeteerOptions = {
            ...DEFAULT_PUPPETEER_OPTIONS,
            ...puppeteerOptions,
        };

        this.authentication = authentication;
        this.authentication.injectClient(this);
    }

    async initialize() {
        this.listen();

        this.interfaceController = new InterfaceController({
            client: this
        });

        await this.authentication.setupUserDataDir();
        this.puppeteerOptions.userDataDir = this.authentication.userDataDir;

        if (this.puppeteerOptions.browserWSEndpoint) {
            this.browser = await puppeteer.connect(this.puppeteerOptions);
        } else {
            this.browser = await puppeteer.launch(this.puppeteerOptions);
        }
        this.page = (await this.browser.pages())[0]

        await this.page.setUserAgent(this.userAgent);

        this.page.on("response", this.onPageAuthenticationResponse);

        await this.page.goto(URLS.LOGIN, {
            waitUntil: 'networkidle0',
            timeout: 0,
        });

        if (this.status === STATUS.AUTHENTICATED) {
            return;
        };

        await this.page.type('[name="username"]', this.authentication.username);
        await this.page.type('[name="password"]', this.authentication.password);
        await this.page.click('[type="submit"]');
    }

    async openNewPage() {
        const currentPage = await this.browser.newPage();
        await currentPage.setUserAgent(this.userAgent);

        return currentPage;
    }

    async getUserPicture(username) {

        return new Promise(async (resolve) => {
            const currentPage = await this.openNewPage();

            const responseHandler = async (response) => {
                if (currentPage.isClosed()) return;

                if (response.url().split("?")[0] == URLS.PROFILE_API) {
                    currentPage.removeListener("response", responseHandler);

                    const responseJSON = await response.json();

                    if (responseJSON.data && responseJSON.data.user && responseJSON.data.user.profile_pic_url_hd) {
                        return resolve(responseJSON.data.user.profile_pic_url_hd);
                    }
                    return resolve(null);
                }
            }

            currentPage.on("response", responseHandler)

            await currentPage.goto(`${URLS.BASE}/${username}`, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            resolve(null);

            if (!currentPage.isClosed()) {
                await currentPage.close();
            }
        });
    }

    async getUser(username) {
        return new Promise(async (resolve) => {
            const currentPage = await this.openNewPage();

            const responseHandler = async (response) => {
                if (currentPage.isClosed()) return;

                if (response.url().split("?")[0] == URLS.PROFILE_API) {
                    currentPage.removeListener("response", responseHandler);

                    const responseJSON = await response.json();

                    if (responseJSON.data && responseJSON.data.user) {
                        return resolve(responseJSON.data.user);
                    }
                    return resolve(null);
                }
            }

            currentPage.on("response", responseHandler)

            await currentPage.goto(`${URLS.BASE}/${username}`, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            resolve(null);

            if (!currentPage.isClosed()) {
                await currentPage.close();
            }
        });
    }

    async getInfo() {
        return new Promise(async (resolve) => {
            const currentPage = await this.openNewPage();

            const responseHandler = async (response) => {
                if (currentPage.isClosed()) return;

                if (response.url().split("?")[0] == URLS.PROFILE_API) {
                    currentPage.removeListener("response", responseHandler);

                    const responseJSON = await response.json();

                    if (responseJSON.data && responseJSON.data.user) {
                        return resolve(responseJSON.data.user);
                    }
                    return resolve(null);
                }
            }

            currentPage.on("response", responseHandler)

            await currentPage.goto(`${URLS.BASE}/${this.authentication.username}`, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            resolve(null);

            if (!currentPage.isClosed()) {
                await currentPage.close();
            }
        });
    }
}

module.exports = Client