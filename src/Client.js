'use strict'

const puppeteer = require('puppeteer');
const ClientEvent = require('./structures/ClientEvent');
const { URLS, DEFAULT_PUPPETEER_OPTIONS, DEFAULT_USER_AGENT, STATUS, ALLOWED_MEDIA_MIMETYPES, MAX_FEED_VIDEO_DURATION_IN_SECONDS } = require("./utilities/Constants");
const Injects = require('./utilities/Injects');
const { getVideoDurationInSeconds } = require('get-video-duration');
const FeedMedia = require('./structures/FeedMedia');

/**
 * Instagram client.
 * @extends {ClientEvent}
 * @param {object} options - Client options.
 * @param {Authentication} options.authentication - Representing instagram authentication and determines how session is saved.
 * @param {object} options.puppeteerOptions - Puppeteer launch options. View docs here: https://github.com/puppeteer/puppeteer/
 * @param {string} options.userAgent -  User agent to use in puppeteer.
 * 
 * @fires Client#authenticated
 * @fires Client#auth_failure
 */
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

    /**
    * Sets up events and requirements, kicks off authentication request
    * @returns {Promise<void>}
    */
    async initialize() {
        this.listen();

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

        return;
    }

    /**
     * Open new tab in puppeteer browser.
     * @returns {Promise<Page>}
     */
    async openNewPage() {
        const currentPage = await this.browser.newPage();
        await currentPage.setUserAgent(this.userAgent);

        return currentPage;
    }

    /**
     * Get URL of specific user picture by their Instagram username.
     * @param {string} username
     * @returns {Promise<string|null>}
     */
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

    /**
     * Get specific user information.
     * @param {string} username
     * @returns {Promise<object|null>}
     */
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
    /**
     * Get current user information.
     * @returns {Promise<object|null>}
     */
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

    /**
     * Post new feed.
     * @param {object} params
     * @param {FeedMedia[]} params.media
     * @param {string?} params.caption
     * 
     * @returns Promise<bool>
     */
    async postFeed(params) {
        const {
            media,
            caption = "",
        } = params;

        return new Promise(async (resolve, reject) => {
            if (!media.length) {
                return reject("Media must be an array.");
            }

            function removeAllMedia() {
                media.forEach(val => {
                    val.unlink();
                })
            }

            for (var mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
                if (media[mediaIndex].url) {
                    await media[mediaIndex].fetch(this.authentication.userMediaDir);
                }
            }

            for (var mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
                if (!ALLOWED_MEDIA_MIMETYPES.includes(media[mediaIndex].type)) {
                    removeAllMedia();
                    return reject(`${media[mediaIndex].type} is not allowed, occur in index of ${mediaIndex}.`);
                }

                if (media[mediaIndex].type.startsWith('video/')) {
                    var duration = await getVideoDurationInSeconds(media[mediaIndex].path);

                    if (duration > MAX_FEED_VIDEO_DURATION_IN_SECONDS) {
                        removeAllMedia();
                        return reject(`Max feed video duration is ${MAX_FEED_VIDEO_DURATION_IN_SECONDS} seconds, your file is exceed in index of ${fileIndex}.`);
                    }
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

            if (!openNewPostModal) {
                removeAllMedia();
                if (!currentPage.isClosed()) {
                    await currentPage.close();
                }
                return reject("Post modal not found. This is an error, please make a report to us.");
            };

            await Promise.all([
                currentPage.waitForFileChooser().then(fileChooser => {
                    return fileChooser.accept(media.map(x => x.path));
                }),
                currentPage.waitForTimeout(1000).then(() => {
                    return currentPage.evaluate(() => {
                        return window.IGJS.clickSelectFromComputerButton()
                    })
                })
            ])

            await currentPage.waitForSelector('svg[aria-label="Select crop"]');

            const cropButton = await currentPage.evaluate(() => {
                const button = document.querySelector('svg[aria-label="Select crop"]').closest('button')

                if (!button) {
                    return false;
                }

                button.click()
                return true;
            })

            if (!cropButton) {
                removeAllMedia();
                if (!currentPage.isClosed()) {
                    await currentPage.close();
                }
                return reject("Crop button not found. This is an error, please make a report to us.");
            }

            // trigger to wait till cropper is ready.
            await currentPage.waitForSelector('svg[aria-label="Crop square icon"]');

            // Crop the picture and video.
            async function cropMedia(crop) {
                await currentPage.evaluate((crop) => {
                    [...document.querySelectorAll('[role="button"]')]
                        .find(d => d.innerText.toLowerCase().match(crop))
                        .click();
                }, crop)
            }

            for (var mediaIndex = 0; mediaIndex < media.length; mediaIndex++) {
                await cropMedia(media[mediaIndex].cropSize);

                if (mediaIndex != media.length - 1) {
                    await currentPage.evaluate(() => {
                        [...document.querySelectorAll('svg[aria-label="Right chevron"]')].find(x => x.closest('button')).closest('button').click()

                    })
                }
            }

            // check if there prompt reels.


            // Next to the filters and adjustments.
            await currentPage.evaluate(() => {
                [...document.querySelectorAll('[role="button"]')].find(b => b.innerText.toLowerCase().match('next')).click();
            })

            await currentPage.waitForTimeout(200);

            // Next to the create a post.
            await currentPage.evaluate(() => {
                [...document.querySelectorAll('[role="button"]')].find(b => b.innerText.toLowerCase().match('next')).click();
            })

            // Wait for transition.
            await currentPage.waitForTimeout(1000);

            if (caption) {
                await currentPage.waitForSelector('[contenteditable="true"][role="textbox"]')
                await currentPage.type('[contenteditable="true"][role="textbox"]', caption)
                await currentPage.waitForTimeout(500);

            }

            // // Share the post.
            await currentPage.evaluate(() => {
                [...document.querySelectorAll('[role="button"]')].find(b => b.innerText.toLowerCase().match('share')).focus();
                [...document.querySelectorAll('[role="button"]')].find(b => b.innerText.toLowerCase().match('share')).click();
            })

            removeAllMedia();

            await currentPage.waitForNetworkIdle({
                timeout: 60 * 2 * 1000
            });

            if (!currentPage.isClosed()) {
                await currentPage.close();
            }

            resolve(true);
        });
    }
}

module.exports = Client