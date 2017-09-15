const htmlToText = require('html-to-text');
const WelcomeStore = require('./WelcomeStore');

class CommandHandler {
    start(client) {
        this._client = client;

        client.on('event', (event) => {
            if (event.getType() !== 'm.room.message') return;
            if (event.getSender() === client.credentials.userId) return;
            if (event.getContent().msgtype !== 'm.text') return;
            if (!event.getContent().body.startsWith("!wb")) return;

            this._processCommand(event);
        });
    }

    _processCommand(event) {
        var parts = event.getContent().body.substring("!wb ".length).split(" ");

        var promise = null;

        var asNumber = Number(parts[0]);
        if (asNumber == parts[0]) {
            promise = () => {
                WelcomeStore.setWelcomeTimeout(event.getRoomId(), asNumber);
                this._client.sendNotice(event.getRoomId(), "Welcome timeout set to " + asNumber + " minutes");
            };
        }

        if (promise !== null) {
            if (!this._hasPermission(event.getSender(), event.getRoomId())) {
                this._client.sendNotice(event.getRoomId(), "You do not have permission to use that command here.");
                return;
            } else {
                promise();
                return;
            }
        }

        // if we made it this far, send help
        var message = "Welcome bot help:<br>" +
            "<code>!wb help</code> - This menu<br>" +
            "<code>!wb &lt;timeoutMinutes&gt;</code> - Sets the welcome timeout in minutes<br>";
        var plainMessage = htmlToText.fromString(message);
        this._client.sendHtmlNotice(event.getRoomId(), plainMessage, message);
    }

    _hasPermission(sender, roomId) {
        var room = this._client.getRoom(roomId);
        var powerLevels = room.currentState.getStateEvents('m.room.power_levels', '');
        if (!powerLevels) return false;
        powerLevels = powerLevels.getContent();

        var userPowerLevels = powerLevels['users'] || {};
        var eventPowerLevels = powerLevels['events'] || {};

        var powerLevel = userPowerLevels[sender];
        if (!powerLevel) powerLevel = powerLevels['users_default'];
        if (!powerLevel) powerLevel = 0; // default

        var modPowerLevel = eventPowerLevels["io.t2l.welcomebot"];
        if (!modPowerLevel) modPowerLevel = powerLevels["state_default"];
        if (!modPowerLevel) return false;

        return modPowerLevel <= powerLevel;
    }
}

module.exports = new CommandHandler();