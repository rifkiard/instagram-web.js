const { Client, Authentication } = require("./index");
const { EVENTS } = require("./src/utilities/Constants");

require('dotenv').config({
    path: './.env'
});

const client = new Client({
    authentication: new Authentication({
        username: process.env.IG_USERNAME,
        password: process.env.IG_PASSWORD,
    }),
    puppeteerOptions: {
        headless: false
    }
});

for (const event in EVENTS) {
    client.on(EVENTS[event], function () {
        console.log(`on ${EVENTS[event]}`)
    })
}

client.on(EVENTS.AUTHENTICATED, async () => {
    client.getInfo().then(info => console.log(info));
    client.getUser("haniiamp").then(info => console.log(info));
    client.getUserPicture("haniiamp").then(info => console.log(info));
})

client.initialize();