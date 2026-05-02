import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDB, getNotebooks, createNotebook, updateNotebook, deleteNotebook, reorderNotebooks, getTotalNotes, getNotes, createNote, updateNote, deleteNote, reorderNotes, getNoteById } from './db';

let mainWindow: BrowserWindow | null = null;

function getPreloadPath() {
  return path.join(app.getAppPath(), 'dist', 'preload', 'index.js');
}

function getRendererPath() {
  return path.join(app.getAppPath(), 'dist', 'renderer', 'index.html');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(app.getAppPath(), 'icon.png'),
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(getRendererPath());
  }
}

ipcMain.handle('get-notebooks', async () => {
  return getNotebooks();
});

ipcMain.handle('create-notebook', async (_event, data) => {
  return createNotebook(data);
});

ipcMain.handle('update-notebook', async (_event, id, data) => {
  return updateNotebook(id, data);
});

ipcMain.handle('delete-notebook', async (_event, id) => {
  return deleteNotebook(id);
});

ipcMain.handle('get-notes', async (_event, notebookId?) => {
  return getNotes(notebookId);
});

ipcMain.handle('get-total-notes', async () => {
  return getTotalNotes();
});

ipcMain.handle('get-note', async (_event, id) => {
  return getNoteById(id);
});

ipcMain.handle('create-note', async (_event, data) => {
  return createNote(data);
});

ipcMain.handle('update-note', async (_event, id, data) => {
  return updateNote(id, data);
});

ipcMain.handle('delete-note', async (_event, id) => {
  return deleteNote(id);
});

ipcMain.handle('reorder-notebooks', async (_event, sourceIndex, targetIndex) => {
  return reorderNotebooks(sourceIndex, targetIndex);
});

ipcMain.handle('reorder-notes', async (_event, sourceIndex, targetIndex, notebookId) => {
  return reorderNotes(sourceIndex, targetIndex, notebookId);
});

app.whenReady().then(() => {
  initDB();
  createWindow();
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(app.getAppPath(), 'icon.png'));
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
