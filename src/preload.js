const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Autenticación
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  register: (userData) => ipcRenderer.invoke('auth:register', userData),
  
  // Gestión de usuarios (mantener para administración)
  getAllUsers: () => ipcRenderer.invoke('users:getAll'),
  createUser: (userData) => ipcRenderer.invoke('users:create', userData),
  updateUser: (userData) => ipcRenderer.invoke('users:update', userData),
  deleteUser: (userId) => ipcRenderer.invoke('users:delete', userId),
  
  // Gestión de contactos empresariales
  getAllContacts: () => ipcRenderer.invoke('contacts:getAll'),
  createContact: (contactData) => ipcRenderer.invoke('contacts:create', contactData),
  updateContact: (contactData) => ipcRenderer.invoke('contacts:update', contactData),
  deleteContact: (contactId) => ipcRenderer.invoke('contacts:delete', contactId),
  getContactStats: () => ipcRenderer.invoke('contacts:getStats'),
  
  // Navegación
  navigateToDashboard: () => ipcRenderer.invoke('navigate:dashboard'),
  navigateToLogin: () => ipcRenderer.invoke('navigate:login')
});
