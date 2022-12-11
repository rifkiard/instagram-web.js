'use strict'

const { ALLOWED_MEDIA_MIMETYPES } = require("./Constants");

class Utilities {
    static async fetchMedia(url, options) {
        options = {
            ...options,
            ... {
                headers: {
                    accept: ALLOWED_MEDIA_MIMETYPES.join(" ")
                }
            }
        }

        const response = await fetch(url, options);
        const mime = response.headers.get('Content-Type');
        const size = response.headers.get('Content-Length');

        const contentDisposition = response.headers.get('Content-Disposition');
        const name = contentDisposition ? contentDisposition.match(/((?<=filename=")(.*)(?="))/) : null;


        if (!ALLOWED_MEDIA_MIMETYPES.includes(mime)) {
            throw new Error(`Fetched file from ${url} is not allowed (${mime})`)
        }

        await response.blob();

        let data = '';
        if (response.buffer) {
            data = (await response.buffer()).toString('base64');
        } else {
            const bArray = new Uint8Array(await response.arrayBuffer());
            bArray.forEach((b) => {
                data += String.fromCharCode(b);
            });
            data = btoa(data);
        }

        return { data, mime, name, size };
    }

    static dataToFile(data, filename, mimetype) {
        const buffer = Buffer.from(data, 'base64');
        return new File([buffer], filename, {
            type: mimetype
        });
    }

    static isValidHttpUrl(string) {
        try {
            new URL(string);
        } catch (_) {
            return false;
        }

        return true;
    }

    static randomString(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

module.exports = Utilities;