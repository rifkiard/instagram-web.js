'use strict'

const fs = require('fs');
const path = require('path');
const mime = require('mime');
const { URL } = require("url");
const { ALLOWED_MEDIA_MIMETYPES } = require('../utilities/Constants');

class Media {
    constructor({
        type,
        path,
        name,
        size = null,
        deletable = false
    }) {
        this.type = type
        this.path = path
        this.name = name
        this.size = size
        this.deletable = deletable
    }

    removeFile() {
        if (this.deletable) {
            return fs.unlinkSync(this.path);
        }

        return false;
    }

    static fromPath(filePath) {
        const mimetype = mime.getType(filePath);
        const filename = path.basename(filePath);

        return new Media({
            type: mimetype,
            path: filePath,
            name: filename
        });
    }

    static async fromURL(url, savePath, options = {}) {
        url = new URL(url);
        var mimetype = mime.getType(url.pathname);

        if (!mimetype && !options.unsafeMime) {
            throw new Error('Unable to determine MIME type using URL. Set unsafeMime to true to download it anyway.');
        }

        options = {
            ...options,
            ... {
                headers: {
                    accept: ALLOWED_MEDIA_MIMETYPES.join(" ")
                }
            }
        }

        const response = await fetch(url, options);
        const responseMime = response.headers.get('Content-Type');
        const responseSize = response.headers.get('Content-Length');

        const contentDisposition = response.headers.get('Content-Disposition');
        var name = contentDisposition ? contentDisposition.match(/((?<=filename=")(.*)(?="))/) : null;

        if (!name) {
            name = Buffer.from(Math.random().toString()).toString("base64").substring(10, 15)
                + '.' + mime.getExtension(mimetype)
        }

        if (!ALLOWED_MEDIA_MIMETYPES.includes(responseMime)) {
            throw new Error(`Fetched file from ${url} is not allowed (${responseMime})`)
        }

        fs.writeFileSync(path.join(savePath, name), Buffer.from(await (await response.blob()).arrayBuffer()));

        return new Media({
            type: responseMime,
            path: path.join(savePath, name),
            name: name,
            size: responseSize,
            deletable: true,
        })
    }
}

module.exports = Media;