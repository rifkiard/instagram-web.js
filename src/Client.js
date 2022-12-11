'use strict'

const puppeteer = require('puppeteer');
const ClientEvent = require('./ClientEvent');
const { URLS, DEFAULT_PUPPETEER_OPTIONS, DEFAULT_USER_AGENT, STATUS, ALLOWED_MEDIA_MIMETYPES } = require("./utilities/Constants");
const Injects = require('./utilities/Injects');
const InterfaceController = require('./utilities/InterfaceContorller');
const path = require('path');
const Utilities = require('./utilities/Utilities');
const Media = require("./structures/Media");

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

        await this.authentication.setupUserDir();
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

    async postFeed({
        files,
        caption = ""
    }) {
        return new Promise(async (resolve, reject) => {

            console.log(Media);
            var medias = [];
            for (var fileIndex = 0; fileIndex < files.length; fileIndex++) {
                if (Utilities.isValidHttpUrl(files[fileIndex])) {
                    medias.push(await Media.fromURL(files[fileIndex], this.authentication.userMediaDir));
                }
            }


            if (!medias.length) {
                return reject("Insert at least one file");
            }

            for (const f in medias) {
                if (!ALLOWED_MEDIA_MIMETYPES.includes(medias[f].type)) {
                    return reject(`File's mimetype (${medias[f].type}) is not allowed in index ${f}`)
                }
            }

            const currentPage = await this.openNewPage();

            await currentPage.goto(URLS.BASE, {
                waitUntil: 'networkidle0',
                timeout: 0,
            });

            await currentPage.waitForSelector("svg[aria-label='New post']")

            await currentPage.evaluate(Injects);

            const openNewPostModal = await currentPage.evaluate(_ => {
                return window.IGJS.openNewPostModal();
            })

            if (!openNewPostModal) return;

            await Promise.all([
                currentPage.waitForFileChooser().then(fileChooser => {
                    return fileChooser.accept(medias.map(x => x.path));
                }),
                currentPage.waitForTimeout(1000).then(() => {
                    return currentPage.evaluate(() => {
                        return window.IGJS.clickSelectFromComputerButton()
                    })
                })
            ])


        });
    }
}

module.exports = Client