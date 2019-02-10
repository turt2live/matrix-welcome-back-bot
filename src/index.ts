import {
    AutojoinRoomsMixin,
    AutojoinUpgradedRoomsMixin,
    LogService,
    MatrixClient,
    SimpleFsStorageProvider,
    SimpleRetryJoinStrategy
} from "matrix-bot-sdk";
import config from "./config";
import * as mkdirp from "mkdirp";
import { WelcomeStore } from "./WelcomeStore";
import * as striptags from "striptags";
import moment = require("moment");
import * as path from "path";

mkdirp.sync(config.dataPath);

const storageProvider = new SimpleFsStorageProvider(path.join(config.dataPath, "__matrix.db"));
const client = new MatrixClient(config.homeserverUrl, config.accessToken, storageProvider);

AutojoinRoomsMixin.setupOnClient(client);
AutojoinUpgradedRoomsMixin.setupOnClient(client);
client.setJoinStrategy(new SimpleRetryJoinStrategy());

const activeMap = WelcomeStore.getLastActiveMap();

client.on("room.upgraded", async (roomId, event) => {
    const oldRoomId = event['content']['predecessor']['room_id'];
    LogService.info("index", `Migrating data from ${oldRoomId} to ${roomId}`);

    const timeout = WelcomeStore.getWelcomeTimeout(oldRoomId);
    WelcomeStore.setWelcomeTimeout(roomId, timeout);

    await client.sendNotice(roomId, `I have migrated your settings from your old room. Your welcome back timeout is ${timeout} minutes.`);
});

client.on("room.message", async (roomId, event) => {
    if (event['sender'] === await client.getUserId()) return;
    if (!event['content']) return;
    if (event['content']['msgtype'] === 'm.notice') return;
    if (event['content']['msgtype'] === 'm.text' && event['content']['body'].startsWith("!wb")) {
        tryRunCommand(roomId, event).catch(err => {
            LogService.error("index", err);
        });
    }

    let roomMap = activeMap[roomId];
    if (!roomMap) {
        activeMap[roomId] = {};
        roomMap = activeMap[roomId];
    }

    let userLastActive = roomMap[event['sender']];
    if (!userLastActive) {
        roomMap[event['sender']] = moment().valueOf();
        WelcomeStore.setLastActiveMap(activeMap);
        return;
    }

    const timeout = WelcomeStore.getWelcomeTimeout(roomId) * 60000;
    if (moment().valueOf() - userLastActive > timeout) {
        LogService.info("index", `Welcoming ${event['sender']} to ${roomId}`);

        let displayName = event['sender'];
        try {
            const profile = await client.getUserProfile(event['sender']);
            displayName = profile['displayname'];
        } catch (e) {
            LogService.error("index", e);
        }

        const lastActiveStr = `You were last active ${moment(userLastActive).fromNow()}.`
        const plain = `Welcome back, ${displayName}. ${lastActiveStr}`;
        const html = `Welcome back, <a href="https://matrix.to/#/${event['sender']}">${striptags(displayName)}</a>. ${lastActiveStr}`;

        try {
            await client.sendMessage(roomId, {
                msgtype: "m.notice",
                body: plain,
                format: "org.matrix.custom.html",
                formatted_body: html,
            });
        } catch (e) {
            LogService.error("index", e);
        }
    }

    roomMap[event['sender']] = moment().valueOf();
    WelcomeStore.setLastActiveMap(activeMap);
});

async function tryRunCommand(roomId, event) {
    const parts = event['content']['body'].split(' ');
    if (parts.length === 1) {
        client.sendNotice(roomId, `The welcome timeout is set to ${WelcomeStore.getWelcomeTimeout(roomId)} minutes`);
    } else if (parts[1] === 'help') {
        client.sendNotice(roomId, "Use !wb <timeoutMinutes> to set a new timeout, or !wb to see the current timeout.");
    } else if (!await client.userHasPowerLevelFor(event['sender'], roomId, 'io.t2l.welcomebot', true)) {
        client.sendNotice(roomId, "Sorry, you don't have permission to run commands here.");
    } else {
        const timeoutMinutes = Number(parts[1]);
        WelcomeStore.setWelcomeTimeout(roomId, timeoutMinutes);
        client.sendNotice(roomId, `Timeout set to ${timeoutMinutes} minutes`);
    }
}

client.start().then(async () => {
    LogService.info("index", `Bot started as ${await client.getUserId()}`);
});