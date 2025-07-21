const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const Database = require('./src/database/database');
const AuthService = require('./src/services/authService');

let mainWindow;
let database;
let authService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src', 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Opcional
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile('src/views/login.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Menú de la aplicación
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  // Inicializar base de datos
  database = new Database();
  authService = new AuthService(database);
  
  createWindow();

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

// IPC Handlers para comunicación con el renderer
ipcMain.handle('auth:login', async (event, credentials) => {
  try {
    const result = await authService.login(credentials.email, credentials.password);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:register', async (event, userData) => {
  try {
    const result = await authService.register(userData);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('users:getAll', async () => {
  try {
    const users = await database.getAllUsers();
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('users:create', async (event, userData) => {
  try {
    const user = await authService.register(userData);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('users:update', async (event, userData) => {
  try {
    const user = await database.updateUser(userData);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('users:delete', async (event, userId) => {
  try {
    await database.deleteUser(userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('navigate:dashboard', () => {
  mainWindow.loadFile('src/views/dashboard.html');
});

ipcMain.handle('navigate:login', () => {
  mainWindow.loadFile('src/views/login.html');
});

// IPC Handlers para gestión de contactos
ipcMain.handle('contacts:getAll', async () => {
  try {
    const contacts = await database.getAllContacts();
    return { success: true, data: contacts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:create', async (event, contactData) => {
  try {
    const contact = await database.createContact(contactData);
    return { success: true, data: contact };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:update', async (event, contactData) => {
  try {
    const contact = await database.updateContact(contactData);
    return { success: true, data: contact };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:delete', async (event, contactId) => {
  try {
    await database.deleteContact(contactId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('contacts:getStats', async () => {
  try {
    const stats = await database.getContactStats();
    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
