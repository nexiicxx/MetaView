import { SteamID } from "../utils/steam.js";


export class Player {
    constructor(name, health, steamid) {
        this.name = name;
        this.health = health;
        this.steamid = steamid;
        // Convert BigInt to string for json encoding
        this.steamid64 = SteamID.fromAccountID(steamid).steam64.toString();
    }



}