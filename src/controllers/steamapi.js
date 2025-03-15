const { STEAM_KEY } = require("keys.js");

export class SteamAPI {
    constructor(key = STEAM_KEY) {
        this.api_key = key;
        this.base_url = "https://api.steampowered.com";
    }

    _buildUrl(interfaceName, method, version, params = {}) {
        const url = new URL(`${this.base_url}/${interfaceName}/${method}/${version}/`);

        // Add API key to all requests
        url.searchParams.append('key', this.api_key);

        // Add additional parameters
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        return url.toString();
    }

    async get_player_summaries(steamids) {
        const url = this._buildUrl(
            'ISteamUser',
            'GetPlayerSummaries',
            'v2',
            { steamids: Array.isArray(steamids) ? steamids.join(',') : steamids }
        );

        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.response.players;
        } catch (error) {
            console.error('Error fetching player summaries:', error);
            throw error;
        }
    }
}