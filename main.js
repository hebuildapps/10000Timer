const path = require('path');
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 720,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      // Persist renderer storage (localStorage) across app restarts.
      partition: 'persist:10000Timer'
    }
  });

  // Remove the default menu (File, Edit, View, Window, Help)
  win.removeMenu();

  win.loadFile(path.join(__dirname, 'demo.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window when the dock icon is clicked.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

