import config from "./config";
import { LocalStorage } from "node-localstorage";

export interface IActiveMap {
    [roomId: string]: { [userId: string]: number };
}

export class WelcomeStore {

    private static _db: any;

    private constructor() {
    }

    private static getDb() {
        if (!WelcomeStore._db) {
            WelcomeStore._db = new LocalStorage(config.dataPath);
        }
        return WelcomeStore._db;
    }

    private static getId(roughId: string) {
        return roughId.replace(/[^a-zA-Z0-9]/g, '.');
    }

    public static getWelcomeTimeout(roomId: string) {
        roomId = WelcomeStore.getId(roomId);
        const item = JSON.parse(WelcomeStore.getDb().getItem(roomId) || "{}");
        if (!item['timeout']) item['timeout'] = 3;
        return item['timeout'];
    }

    public static setWelcomeTimeout(roomId: string, timeout: number) {
        roomId = WelcomeStore.getId(roomId);
        const item = JSON.parse(WelcomeStore.getDb().getItem(roomId) || "{}");
        item['timeout'] = timeout;
        WelcomeStore.getDb().setItem(roomId, JSON.stringify(item));
    }

    public static getLastActiveMap(): IActiveMap {
        return JSON.parse(WelcomeStore.getDb().getItem("last_active") || "{}");
    }

    public static setLastActiveMap(map: IActiveMap) {
        WelcomeStore.getDb().setItem("last_active", JSON.stringify(map));
    }
}