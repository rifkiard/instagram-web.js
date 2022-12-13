'use strict'

const path = require('path');
const fs = require('fs');

class Authentication {
    username;
    password;
    dataPath;
    mediaPath;
    clientId;

    client;
    dataDirName;
    userDataDir;
    userMediaDir;

    constructor({
        username,
        password,
        dataPath = "./.instagram_auth",
        mediaPath = "./.instagram_media",
        clientId,
    }) {
        const idRegex = /^[-_\w]+$/i;
        if (clientId && !idRegex.test(clientId)) {
            throw new Error('Invalid clientId. Only alphanumeric characters, underscores and hyphens are allowed.');
        }

        this.username = username;
        this.password = password;
        this.clientId = clientId;
        this.dataPath = path.resolve(dataPath);
        this.mediaPath = path.resolve(mediaPath);
        this.dataDirName = this.clientId ? `session-${this.clientId}` : "session"
    }

    injectClient(client) {
        this.client = client;
    }

    async setupUserDir() {
        const userDataDir = path.join(this.dataPath, this.dataDirName);
        const userMediaDir = path.join(this.mediaPath, this.dataDirName);

        if (this.client.puppeteerOptions.userDataDir && this.client.puppeteerOptions.userDataDir != userDataDir) {
            throw new Error("Authentication's dataPath is not compatible with a user-supplied userDataDir.");
        }

        fs.mkdirSync(userDataDir, {
            recursive: true
        })


        fs.mkdirSync(userMediaDir, {
            recursive: true
        })

        this.userDataDir = userDataDir;
        this.userMediaDir = userMediaDir;
    }
}

module.exports = Authentication