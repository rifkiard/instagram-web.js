'use strict'

const { CROP_SIZES, ALLOWED_MEDIA_MIMETYPES } = require("../utilities/Constants");
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const { URL } = require("url");
const https = require('https');

class FeedMedia {
    type;
    path;
    name;
    size;
    url;
    fetchOptions;
    deleteAfterPost;
    cropSize;

    constructor({
        type,
        path,
        name,
        size,
        url,
        fetchOptions,
        deleteAfterPost,
        cropSize
    }) {
        this.type = type;
        this.path = path;
        this.name = name;
        this.size = size;
        this.url = url;
        this.fetchOptions = fetchOptions;
        this.deleteAfterPost = deleteAfterPost;
        this.cropSize = cropSize;
    }

    static fromPath({
        path,
        cropSize = CROP_SIZES.ORIGINAL,
        deleteAfterPost = false,
    }) {
        return new FeedMedia({
            type: mime.getType(filePath),
            path: path,
            name: path.basename(filePath),
            size: fs.statSync(filePath).size,
            url: null,
            fetchOptions: {},
            deleteAfterPost: deleteAfterPost,
            cropSize: cropSize
        });
    }

    static fromUrl({
        url,
        cropSize = CROP_SIZES.ORIGINAL,
        fetchOptions = {},
        deleteAfterPost = true,
    }) {
        return new FeedMedia({
            type: null,
            path: null,
            name: null,
            size: null,
            url: url,
            fetchOptions: fetchOptions,
            deleteAfterPost: deleteAfterPost,
            cropSize: cropSize
        });
    }

    async fetch(savePath) {
        var url = new URL(this.url);
        var mimetype = mime.getType(url.pathname);

        if (!mimetype && !this.fetchOptions.unsafeMime) {
            throw new Error('Unable to determine MIME type using URL. Set unsafeMime to true to download it anyway.');
        }


        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });

        var options = {
            ...this.fetchOptions,
            ... {
                headers: {
                    accept: ALLOWED_MEDIA_MIMETYPES.join(" ")
                },
                agent: httpsAgent,
            }
        }

        console.log({
            options
        })


        const response = await fetch(url, options);
        const responseMime = response.headers.get('Content-Type');
        const responseSize = response.headers.get('Content-Length');

        const name = Buffer.from(Math.random().toString()).toString("base64").substring(10, 15)
            + '.' + mime.getExtension(mimetype)

        if (!ALLOWED_MEDIA_MIMETYPES.includes(responseMime)) {
            throw new Error(`Fetched file from ${url} is not allowed (${responseMime})`)
        }

        fs.writeFileSync(path.join(savePath, name), Buffer.from(await (await response.blob()).arrayBuffer()));

        this.type = responseMime;
        this.path = path.join(savePath, name);
        this.name = name;
        this.size = responseSize;
    }

    unlink() {
        if (this.deleteAfterPost) {
            return fs.unlinkSync(this.path);
        }

        return false;
    }
}

module.exports = FeedMedia;