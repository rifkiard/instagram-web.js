'use strict'

const Constants = require("./src/utilities/Constants");

module.exports = {
    Client: require("./src/Client"),
    Authentication: require("./src/structures/Authentication"),
    FeedMedia: require("./src/structures/FeedMedia"),
    version: require('./package.json').version,

    ...Constants
}