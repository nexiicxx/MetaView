const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Server = require('./server');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let server;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'pages', 'index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

const startServer = async () => {
  server = new Server(3000);
  try {
    await server.start();
    console.log('Background server started successfully');
  } catch (error) {
    console.error('Failed to start background server:', error);
    app.quit();
  }
};

app.whenReady().then(async () => {
  await startServer();
  createWindow();
});

app.on('window-all-closed', async () => {
  if (server) {
    await server.stop();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error);
  if (server) {
    await server.stop();
  }
  app.quit();
});

process.on('unhandledRejection', async (error) => {
  console.error('Unhandled rejection:', error);
  if (server) {
    await server.stop();
  }
  app.quit();
});