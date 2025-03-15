const express = require('express');
const { SteamID } = require('../utils/steam');
const playerStore = require('./store');

const router = express.Router();

// Health check endpoint
router.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        uptime: process.uptime(),
        serverRunning: true
    });
});

// Steam ID lookup
router.get("/api/steam/:id", (req, res) => {
    const { id } = req.params;
    const { legacy, steam64 } = SteamID.from_account_id(id);
    res.json({
        status: 'ok',
        steamid64: steam64.toString(),
        legacy: legacy,
        steamid: id
    });
});

// Get current players with SSE
router.get("/api/players", (req, res) => {
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

    // Add this client to our set of clients
    req.app.locals.clients.add(res);

    // Handle client disconnect
    req.on('close', () => {
        clearInterval(keepAlive);
        req.app.locals.clients.delete(res);
    });
});

// Update game data
router.post("/api/gamedata", (req, res) => {
    let data = "";

    req.on("data", chunk => {
        data += chunk;
    });

    req.on("end", () => {
        try {
            const parsedBody = JSON.parse(data);
            const players = playerStore.updatePlayers(parsedBody);

            // Send updates to all connected clients
            const updateData = JSON.stringify({
                status: 'ok',
                players: players
            });
            
            req.app.locals.clients.forEach(client => {
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

// 404 handler
router.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

module.exports = router; 