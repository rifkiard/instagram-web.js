# instagram.js

Automated instagram activity.

## Supported Features

| Feature                       | Status               |
| ----------------------------- | -------------------- |
| Multiple Account              | ✅                   |
| Get user information          | ✅                   |
| Get specific user picture     | ✅                   |
| Get specific user information | ✅                   |
| Post a picture                | ✅                   |
| Post a video                  | ✅ (Chrome required) |
| Post multiple media           | ✅                   |

## Examples

### Get current user information

```javaScript
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
