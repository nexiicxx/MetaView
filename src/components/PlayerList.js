import { PlayerCard } from './PlayerCard.js';

export class PlayerList {
    constructor(containerId, team) {
        this.container = document.getElementById(containerId);
        this.team = team;
        this.players = [];
        
        // Start listening for updates if we're on active players list
        if (team === 'ct' || team === 't') {
            this.startListening();
        }

        // Close popups when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-button') && !e.target.closest('.popup-menu')) {
                document.querySelectorAll('.popup-menu').forEach(popup => popup.remove());
            }
        });
    }

    startListening() {
        // Fetch data from the server
        this.eventSource = new EventSource('http://localhost:3000/api/players');
        
        this.eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.status === 'ok' && data.players) {
                this.players = data.players[this.team] || [];
                this.render();
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                this.eventSource.close();
                this.startListening();
            }, 5000);
        };
    }

    addPlayer(player) {
        this.players.push(player);
    }

    render() {
        this.container.innerHTML = '';
        
        this.players.forEach(player => {
            const playerCard = new PlayerCard(
                player.name,
                this.team,
                null,  // Let PlayerCard generate initials
                player.steamid64
            );
            
            this.container.appendChild(playerCard.mount());
        });
    }

    destroy() {
        if (this.eventSource) {
            this.eventSource.close();
        }
        document.removeEventListener('click', this.handleOutsideClick);
    }
} 