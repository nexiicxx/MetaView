const { FACEIT_KEY } = require("keys.js");

class FaceitAPI {
    constructor(key = FACEIT_KEY) {
        this.api_key = key;
        this.base_url = "https://open.faceit.com/data/v4";
    }

    _buildUrl(category, endpoint = '', params = {}) {
        const url = new URL(`${this.base_url}/${category}${endpoint}`);

        // Add additional parameters
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        return url.toString();
    }

    async _makeRequest(url) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.api_key}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error making Faceit API request:', error);
            throw error;
        }
    }

    async getPlayerDetails(steamId) {
        const url = this._buildUrl('players', '', {
            game: 'cs2',
            game_player_id: steamId
        });
        
        return await this._makeRequest(url);
    }

    async getPlayerStats(playerId) {
        const url = this._buildUrl('players', `/${playerId}/stats/cs2`);
        
        return await this._makeRequest(url);
    }

    // Example of how to add more endpoints (if anyone wanted to build on top of this):
    // async getPlayerMatches(playerId, params = {}) {
    //     const url = this._buildUrl('players', `/${playerId}/matches`, params);
    //     return await this._makeRequest(url);
    // }
}

module.exports = FaceitAPI;