const express = require('express');
const cors = require('cors');
const path = require('path');
const { steam_id, SteamID } = require('../utils/steam');
const playerStore = require('./store');

class Server {
    constructor(port = 3000) {
        this.port = port;
        this.app = express();
        this.isRunning = false;
        this.clients = new Set();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '..')));
        
        if (process.env.NODE_ENV === 'development') {
            this.app.use((req, res, next) => {
                console.log(`${req.method} ${req.url}`);
                next();
            });
        }
    }

    setupRoutes() {
        this.app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'ok',
                uptime: process.uptime(),
                serverRunning: this.isRunning
            });
        });

        this.app.get("/api/steam/:id", (req, res) => {
            const { id } = req.params;
            const { legacy, steam64 } = SteamID.from_account_id(id);
            res.json({
                status: 'ok',
                steamid64: steam64.toString(),  // convert BigInt to string
                legacy: legacy,
                steamid: id
            });
        });

        // Get current players with SSE
        this.app.get("/api/players", (req, res) => {
            // Set SSE headers
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            // Send initial data
            const data = JSON.stringify({
                status: 'ok',
                players: playerStore.getPlayers()
            });
            res.write(`data: ${data}\n\n`);

            // Keep connection alive
            const keepAlive = setInterval(() => {
                res.write(': keepalive\n\n');
            }, 30000);

            // Add this client to our set
            this.clients.add(res);

            // Handle client disconnect
            req.on('close', () => {
                clearInterval(keepAlive);
                this.clients.delete(res);
            });
        });
        
        this.app.post("/api/gamedata", (req, res) => {
            let data = "";
        
            req.on("data", chunk => {
                data += chunk;
            });
        
            req.on("end", () => {
                try {
                    const parsedBody = JSON.parse(data);
                    //console.log("Received game data:", parsedBody);

                    // Update player store
                    const players = playerStore.updatePlayers(parsedBody);
                    //console.log("Updated players:", players);
        
                    // Send updates to all connected clients
                    const updateData = JSON.stringify({
                        status: 'ok',
                        players: players
                    });
                    
                    this.clients.forEach(client => {
                        client.write(`data: ${updateData}\n\n`);
                    });
        
                    res.json({
                        status: 'success'
                    });
                } catch (error) {
                    console.error("Error processing game data:", error);
                    res.status(400).json({
                        status: 'error',
                        message: 'Invalid game data'
                    });
                }
            });
        });  
        
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Not found' });
        });
    }

    setupErrorHandling() {
        this.app.use((err, req, res, next) => {
            console.error('Server error:', err);
            res.status(500).json({ 
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });

        this.handleServerErrors();
    }

    handleServerErrors() {
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            this.stop();
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received. Shutting down gracefully...');
            this.stop();
        });
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                if (this.isRunning) {
                    console.log('Server is already running');
                    resolve();
                    return;
                }

                this.server = this.app.listen(this.port, () => {
                    this.isRunning = true;
                    console.log(`Server running on http://localhost:${this.port}`);
                    resolve();
                });

                this.server.on('error', (error) => {
                    if (error.code === 'EADDRINUSE') {
                        console.error(`Port ${this.port} is already in use`);
                    } else {
                        console.error('Server error:', error);
                    }
                    reject(error);
                });
            } catch (error) {
                console.error('Failed to start server:', error);
                reject(error);
            }
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            if (!this.server || !this.isRunning) {
                console.log('Server is not running');
                resolve();
                return;
            }

            this.server.close((err) => {
                if (err) {
                    console.error('Failed to stop server:', err);
                    reject(err);
                } else {
                    this.isRunning = false;
                    console.log('Server stopped gracefully');
                    resolve();
                }
            });

            setTimeout(() => {
                if (this.isRunning) {
                    console.log('Forcing server shutdown...');
                    this.isRunning = false;
                    resolve();
                }
            }, 5000);
        });
    }
}

module.exports = Server; 