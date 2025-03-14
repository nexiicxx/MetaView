export class PlayerCard {
    constructor(name, team, initials) {
        this.name = name;
        this.team = team;
        this.initials = initials || this.generateInitials(name);
    }

    generateInitials(name) {
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    }

    render() {
        return `
            <div class="player-card" data-player-name="${this.name}" data-team="${this.team}">
                <div class="player-info">
                    <div class="player-avatar ${this.team}-avatar">${this.initials}</div>
                    <span class="player-name">${this.name}</span>
                </div>
                <button class="menu-button">
                    <div class="menu-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </button>
            </div>
        `;
    }
} 