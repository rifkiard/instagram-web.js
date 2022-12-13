<h1 align="center">
  <a href="https://www.npmjs.com/package/instagram-web.js" target="_blank">instagram-web.js</a>
</h1>

<div align="center">

### Headless automated instagram activity.

![test](https://img.shields.io/github/workflow/status/rifkiard/instagram-web.js/CI)
[![npm package](https://img.shields.io/npm/v/instagram-web.js?color=blue)](https://img.shields.io/npm/v/instagram-web.js?color=blue)
[![npm downloads](https://img.shields.io/npm/dm/instagram-web.js)](https://img.shields.io/npm/dm/instagram-web.js)
[![npm bundle size](https://img.shields.io/bundlephobia/min/instagram-web.js)](https://img.shields.io/bundlephobia/min/instagram-web.js)
[![supported node version](https://img.shields.io/node/v/instagram-web.js)](https://img.shields.io/node/v/instagram-web.js)
[![contributors](https://img.shields.io/github/contributors/rifkiard/instagram-web.js)](https://img.shields.io/github/contributors/rifkiard/instagram-web.js)
[![last commit](https://img.shields.io/github/last-commit/rifkiard/instagram-web.js)](https://img.shields.io/github/last-commit/rifkiard/instagram-web.js)
[![license](https://img.shields.io/npm/l/instagram-web.js)](https://img.shields.io/npm/l/instagram-web.js)

</div>

# Supported Features

| Feature                       | Status               |
| ----------------------------- | -------------------- |
| Multiple Account              | ✅                   |
| Get user information          | ✅                   |
| Get specific user picture     | ✅                   |
| Get specific user information | ✅                   |
| Post a picture                | ✅                   |
| Post a video                  | ✅ (Chrome required) |
| Post multiple media           | ✅                   |

# Installation

```shell
npm install instagram-web.js
```

# Examples

### Get current user information

```javaScript
const { Client, Authentication } = require("instagram-web.js");

const client = new Client({
    authentication: new Authentication({
        username: process.env.IG_USERNAME,
        password: process.env.IG_PASSWORD,
    }),
    puppeteerOptions: {
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    }
});

client.on("authenticated", () => {
    client
        .getInfo()
        .then(info => console.log(info));
})

```

### Get specific user information

```javaScript
const { Client, Authentication } = require("instagram-web.js");

const client = new Client({
    authentication: new Authentication({
        username: process.env.IG_USERNAME,
        password: process.env.IG_PASSWORD,
    }),
    puppeteerOptions: {
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    }
});

client.on("authenticated", () => {
    client
        .getUser("rifkiiard")
        .then(info => console.log(info));
})

```

### Get specific user profile

```javaScript
const { Client, Authentication } = require("instagram-web.js");

const client = new Client({
    authentication: new Authentication({
        username: process.env.IG_USERNAME,
        password: process.env.IG_PASSWORD,
    }),
    puppeteerOptions: {
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    }
});

client.on("authenticated", () => {
    client
        .getUserPicture("rifkiiard")
        .then(url => console.log(url));
})

```

### Post a Feed

```javaScript
const { Client, Authentication, FeedMedia, EVENTS, CROP_SIZES } = require("instagram-web.js");


const client = new Client({
    authentication: new Authentication({
        username: process.env.IG_USERNAME,
        password: process.env.IG_PASSWORD,
    }),
    puppeteerOptions: {
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    }
});

client.on("authenticated", () => {
    client.postFeed({
        media: [
            FeedMedia.fromUrl({
                url: "https://upload.wikimedia.org/wikipedia/id/1/19/Optimus10108pieces.jpg",
                cropSize: CROP_SIZES.ORIGINAL
            }),
            FeedMedia.fromUrl({
                url: "https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
                cropSize: CROP_SIZES.ORIGINAL
            }),
        ],
        crop: CROP_SIZES.LANDSCAPE,
        caption: "I am Optimus Prime ..."
    })
})

```

# LICENSE

[instagram-web.js](https://www.npmjs.com/package/instagram-web.js) is released under the [MIT](https://github.com/rifkiard/instagram-web.js/blob/main/LICENSE) license.
