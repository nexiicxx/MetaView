const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

class Server {
    constructor(port = 3000) {
        this.port = port;
        this.app = express();
        this.isRunning = false;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '..')));
        
        // Store clients in app.locals for access in routes
        this.app.locals.clients = new Set();
        
        if (process.env.NODE_ENV === 'development') {
            this.app.use((req, res, next) => {
                console.log(`${req.method} ${req.url}`);
                next();
            });
        }
    }

    setupRoutes() {
        this.app.use(routes);
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