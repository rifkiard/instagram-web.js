'use strict'

const path = require('path');
const fs = require('fs');

class Authentication {
    username;
    password;
    dataPath;
    clientId;

    client;
    dataDirName;
    userDataDir;

    constructor({
        username,
        password,
        dataPath = "./.instagram_auth",
        clientId,
    }) {
        const idRegex = /^[-_\w]+$/i;
        if (clientId && !idRegex.test(clientId)) {
            throw new Error('Invalid clientId. Only alphanumeric characters, underscores and hyphens are allowed.');
        }

        this.username = username;
        this.password = password;
        this.dataPath = dataPath;
        this.clientId = clientId;
        this.dataPath = path.resolve(dataPath);
        this.dataDirName = this.clientId ? `session-${this.clientId}` : "session"
    }

    injectClient(client) {
        this.client = client;
    }

    async setupUserDataDir() {
        const userDataDir = path.join(this.dataPath, this.dataDirName);

        if (this.client.puppeteerOptions.userDataDir && this.client.puppeteerOptions.userDataDir != userDataDir) {
            throw new Error("Authentication's dataPath is not compatible with a user-supplied userDataDir.");
        }

        fs.mkdirSync(userDataDir, {
            recursive: true
        })

        this.userDataDir = userDataDir;
    }
}

module.exports = Authentication