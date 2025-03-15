const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor() {
        this.configPath = path.join(__dirname, '../../data/saved_players.json');
        this.ensureConfigFile();
    }

    ensureConfigFile() {
        const dirPath = path.dirname(this.configPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        if (!fs.existsSync(this.configPath)) {
            fs.writeFileSync(this.configPath, JSON.stringify({ players: [] }, null, 2));
        }
    }

    loadSavedPlayers() {
        try {
            const data = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(data).players;
        } catch (error) {
            console.error('Error loading saved players:', error);
            return [];
        }
    }

    savePlayer(playerData) {
        try {
            const data = this.loadSavedPlayers();
            const existingPlayerIndex = data.findIndex(p => p.steamid64 === playerData.steamid64);
            
            if (existingPlayerIndex === -1) {
                data.push(playerData);
            } else {
                data[existingPlayerIndex] = playerData;
            }

            fs.writeFileSync(this.configPath, JSON.stringify({ players: data }, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving player:', error);
            return false;
        }
    }

    removePlayer(steamid64) {
        try {
            const data = this.loadSavedPlayers();
            const filteredPlayers = data.filter(p => p.steamid64 !== steamid64);
            fs.writeFileSync(this.configPath, JSON.stringify({ players: filteredPlayers }, null, 2));
            return true;
        } catch (error) {
            console.error('Error removing player:', error);
            return false;
        }
    }

    isPlayerSaved(steamid64) {
        const data = this.loadSavedPlayers();
        return data.some(p => p.steamid64 === steamid64);
    }
}

module.exports = new ConfigManager(); 