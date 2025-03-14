import { PlayerCard } from './PlayerCard.js';

export class PlayerList {
    constructor(containerId, team) {
        this.containerId = containerId;
        this.team = team;
        this.players = [];
        this.startPolling();
    }

    async fetchPlayers() {
        try {
            const response = await fetch('http://localhost:3000/api/players');
            const data = await response.json();
            
            if (data.status === 'ok') {
                // Update players based on team
                this.players = [];
                const teamPlayers = this.team === 'ct' ? data.players.ct : data.players.t;
                teamPlayers.forEach(player => {
                    this.addPlayer(player.name);
                });
                this.render();
            }
        } catch (error) {
            console.error('Error fetching players:', error);
        }
    }

    startPolling() {
        // Fetch players immediately
        this.fetchPlayers();
        
        // Then poll every 2 seconds
        this.pollInterval = setInterval(() => {
            this.fetchPlayers();
        }, 2000);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }

    addPlayer(name, initials = null) {
        const player = new PlayerCard(name, this.team, initials);
        this.players.push(player);
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const playerCards = this.players.map(player => player.render()).join('');
        container.innerHTML = playerCards;

        this.attachEventListeners(container);
    }

    attachEventListeners(container) {
        container.querySelectorAll('.player-card').forEach(card => {
            card.addEventListener('click', () => {
                const playerName = card.dataset.playerName;
                const team = card.dataset.team;
                
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    window.location.href = `details.html?name=${encodeURIComponent(playerName)}&team=${team}`;
                }, 300);
            });

            const menuButton = card.querySelector('.menu-button');
            menuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const playerName = card.dataset.playerName;
                // Menu functionality can be added here
            });
        });
    }

    // Clean up when the component is no longer needed
    destroy() {
        this.stopPolling();
    }
} 