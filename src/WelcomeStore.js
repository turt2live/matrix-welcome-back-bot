const LocalStorage = require("node-localstorage").LocalStorage;
const LogService = require("./LogService");

class WelcomeStore {

    constructor() {
        LogService.info("WelcomeStore", "Initializing localstorage backend");
        this._store = new LocalStorage("./db");
    }

    getWelcomeTimeout(roomId) {
        var item = JSON.parse(this._store.getItem(roomId) || "{}");
        if (!item['timeout']) return 3;
        return item['timeout'];
    }

    setWelcomeTimeout(roomId, timeoutMinutes) {
        var item = JSON.parse(this._store.getItem(roomId) || "{}");
        item['timeout'] = timeoutMinutes;
        this._store.setItem(roomId, JSON.stringify(item));
    }
}

module.exports = new WelcomeStore();