const { Client } = require("./index");
const { Events } = require("./src/utilities/Constants");

require('dotenv').config({
    path: './.env'
});

const client = new Client({
    username: process.env.IG_USERNAME,
    password: process.env.IG_PASSWORD
});

for (const event in Events) {
    client.on(Events[event], function () {
        console.log(`on ${Events[event]}`)
    })
}

client.on(Events.AUTHENTICATED, async () => {
    const pic = await client.getProfilePicture("rifkiiard");
    console.log({
        pic
    });

    await client.getUser();
})

client.initialize();