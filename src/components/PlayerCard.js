export class PlayerCard {
    constructor(name, team, initials, steamid64) {
        this.name = name;
        this.team = team;
        this.steamid64 = steamid64;
        this.initials = initials || this.generateInitials(name);
        this.element = null;
        this.activePopup = null;
    }

    generateInitials(name) {
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    createPopupMenu() {
        const popup = document.createElement('div');
        popup.className = 'popup-menu';
        popup.style.cssText = `
            position: absolute;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 4px 0;
            min-width: 150px;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        `;

        const menuItems = [
            {
                label: 'View Steam Profile',
                onClick: () => window.open(`https://steamcommunity.com/profiles/${this.steamid64}`, '_blank')
            }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'popup-menu-item';
            menuItem.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                color: var(--text-color);
                transition: background-color 0.2s;
            `;
            menuItem.textContent = item.label;

            menuItem.addEventListener('mouseover', () => {
                menuItem.style.backgroundColor = 'var(--hover-color)';
            });

            menuItem.addEventListener('mouseout', () => {
                menuItem.style.backgroundColor = 'transparent';
            });

            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                item.onClick();
                popup.remove();
                this.activePopup = null;
            });

            popup.appendChild(menuItem);
        });

        return popup;
    }

    mount() {
        this.element = document.createElement('div');
        this.element.className = 'player-card';
        this.element.dataset.playerName = this.name;
        this.element.dataset.team = this.team;
        
        this.element.innerHTML = this.render();
        
        // Add click handler for the entire card
        this.element.addEventListener('click', () => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                window.location.href = `details.html?name=${encodeURIComponent(this.name)}&team=${this.team}`;
            }, 300);
        });
        
        // Add click handler for menu button
        const menuButton = this.element.querySelector('.menu-button');
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Toggle popup
            if (this.activePopup) {
                this.activePopup.remove();
                this.activePopup = null;
                return;
            }

            // Create and position the popup
            const popup = this.createPopupMenu();
            const rect = menuButton.getBoundingClientRect();
            popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
            popup.style.left = `${rect.left + window.scrollX - 130}px`;
            
            document.body.appendChild(popup);
            this.activePopup = popup;
        });

        return this.element;
    }

    render() {
        return `
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
        `;
    }
} 