const { Client, Authentication, Media } = require("./index");
const { EVENTS } = require("./src/utilities/Constants");
const Utilities = require("./src/utilities/Utilities");

require('dotenv').config({
    path: './.env'
});

const client = new Client({
    authentication: new Authentication({
        username: process.env.IG_USERNAME,
        password: process.env.IG_PASSWORD,
    }),
    puppeteerOptions: {
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    }
});

for (const event in EVENTS) {
    client.on(EVENTS[event], function () {
        console.log(`on ${EVENTS[event]}`)
    })
}

client.on(EVENTS.AUTHENTICATED, async () => {
    // client.getInfo().then(info => console.log(info));
    // client.getUser("haniiamp").then(info => console.log(info));
    // client.getUserPicture("haniiamp").then(info => console.log(info));

    client.postFeed({
        files: ['https://upload.wikimedia.org/wikipedia/id/1/19/Optimus10108pieces.jpg']
    })
})

client.initialize();





