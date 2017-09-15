const config = require("config");
const sdk = require("matrix-js-sdk");
const CommandHandler = require("./src/CommandHandler");
const WelcomeHandler = require("./src/WelcomeHandler");
const matrixUtils = require("matrix-js-snippets");

const client = sdk.createClient({
    baseUrl: config['homeserverUrl'],
    accessToken: config['accessToken'],
    userId: config['userId']
});

matrixUtils.autoAcceptInvites(client);
CommandHandler.start(client);
WelcomeHandler.start(client);

client.startClient({initialSyncLimit: 3});