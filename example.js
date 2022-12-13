const { Client, Authentication, FeedMedia, EVENTS, CROP_SIZES } = require("./index");

require('dotenv').config({
    path: './.env'
});

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

for (const event in EVENTS) {
    client.on(EVENTS[event], function () {
        console.log(`on ${EVENTS[event]}`)
    })
}

client.on(EVENTS.AUTHENTICATED, async () => {
    client.getInfo().then(info => console.log(info));
    client.getUser("rifkiiard").then(info => console.log(info));
    client.getUserPicture("rifkiiard").then(url => console.log(url));

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

client.initialize();





