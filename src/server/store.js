class PlayerStore {
    constructor() {
        this.players = {
            ct: [], // team 3
            t: []   // team 2
        };
    }

    updatePlayers(gameData) {
        // Clear existing players
        this.players.ct = [];
        this.players.t = [];

        // Sort players into teams
        gameData.forEach(player => {
            const playerData = {
                name: player.name.replace('Aim Botz\r ', ''), // Clean up bot names
                health: player.health,
                steamid: player.steamid
            };

            if (player.team === 3) {
                this.players.ct.push(playerData);
            } else if (player.team === 2) {
                this.players.t.push(playerData);
            }
        });

        return this.players;
    }

    getPlayers() {
        return this.players;
    }
}

module.exports = new PlayerStore(); 