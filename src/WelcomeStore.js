const LocalStorage = require("node-localstorage").LocalStorage;
const LogService = require("./LogService");

class WelcomeStore {

    constructor() {
        LogService.info("WelcomeStore", "Initializing localstorage backend");
        this._store = new LocalStorage("./db");
    }

    getWelcomeTimeout(roomId) {
        roomId = this._getId(roomId);
        var item = JSON.parse(this._store.getItem(roomId) || "{}");
        if (!item['timeout']) item['timeout'] = 3;
        LogService.verbose("WelcomeStore", "Timeout for " + roomId + " is " + item['timeout']);
        return item['timeout'];
    }

    setWelcomeTimeout(roomId, timeoutMinutes) {
        roomId = this._getId(roomId);
        var item = JSON.parse(this._store.getItem(roomId) || "{}");
        item['timeout'] = timeoutMinutes;
        this._store.setItem(roomId, JSON.stringify(item));
    }

    storeLastActiveMap(map) {
        this._store.setItem("last_active", JSON.stringify(map));
    }
    
    _getId(roomId) {
        return roomId.replace(/[^a-zA-Z0-9]/g, '.');
    }

    loadLastActiveMap() {
        return JSON.parse(this._store.getItem("last_active") || "{}");
    }
}

module.exports = new WelcomeStore();
