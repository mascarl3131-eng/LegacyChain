const { app, BrowserWindow, shell } = require('electron');

const APP_URL = process.env.LEGACYCHAIN_ELECTRON_URL || 'https://thechainlegacy.com/';

function createWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 360,
    minHeight: 640,
    title: 'LegacyChain',
    backgroundColor: '#10130F',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    const appHost = new URL(APP_URL).host;
    const nextHost = new URL(url).host;
    if (nextHost === appHost || nextHost.endsWith('supabase.co') || nextHost.includes('google')) {
      return { action: 'allow' };
    }
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  void window.loadURL(APP_URL);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
