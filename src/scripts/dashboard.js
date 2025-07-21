// CRM Contactos Pro - Dashboard JavaScript
// Variables globales
let currentUser = null;
let users = [];
let contacts = [];
let currentTab = 'dashboard';
let isEditing = false;
let editingUserId = null;
let editingContactId = null;
let isDarkMode = false;

// Elementos del DOM
const userModal = document.getElementById('userModal');
const contactModal = document.getElementById('contactModal');
const deleteModal = document.getElementById('deleteModal');
const userForm = document.getElementById('userForm');
const contactForm = document.getElementById('contactForm');
const usersTableBody = document.getElementById('usersTableBody');
const contactsTableBody = document.getElementById('contactsTableBody');
const loadingOverlay = document.getElementById('loadingOverlay');
const themeToggle = document.getElementById('themeToggle');

// Elementos de estadísticas
const totalUsersElement = document.getElementById('totalUsers');
const totalAdminsElement = document.getElementById('totalAdmins');
const totalRegularUsersElement = document.getElementById('totalRegularUsers');
const totalContactsElement = document.getElementById('totalContacts');
const totalLeadsElement = document.getElementById('totalLeads');
const totalClientsElement = document.getElementById('totalClients');
const totalCompaniesElement = document.getElementById('totalCompanies');

// Charts variables
let statusChart = null;
let trendChart = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
});

function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Botones principales
    document.getElementById('addUserBtn')?.addEventListener('click', openAddUserModal);
    document.getElementById('addContactBtn')?.addEventListener('click', openAddContactModal);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Forms
    userForm?.addEventListener('submit', handleUserFormSubmit);
    contactForm?.addEventListener('submit', handleContactFormSubmit);
    
    // Search and filters
    document.getElementById('contactsSearch')?.addEventListener('input', filterContacts);
    document.getElementById('statusFilter')?.addEventListener('change', filterContacts);
    document.getElementById('priorityFilter')?.addEventListener('change', filterContacts);
    
    // Export buttons
    document.getElementById('exportContactsBtn')?.addEventListener('click', exportContacts);
    document.getElementById('conversionReportBtn')?.addEventListener('click', generateConversionReport);
    
    // Delete confirmation
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    
    // Modal close handlers
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals();
        }
    });
}

async function initializeDashboard() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Current user from localStorage:', currentUser);
    
    if (!currentUser) {
        console.log('No current user found, redirecting to login...');
        await window.electronAPI.navigateToLogin();
        return;
    }
    
    // Verificar si currentUser tiene la estructura correcta
    if (!currentUser.id || !currentUser.name) {
        console.warn('Current user data incomplete:', currentUser);
        console.log('Trying to get user data from token...');
        
        const token = localStorage.getItem('userToken');
        if (token) {
            try {
                const result = await window.electronAPI.getCurrentUser(token);
                if (result.success) {
                    currentUser = result.data;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    console.log('Current user updated:', currentUser);
                } else {
                    await window.electronAPI.navigateToLogin();
                    return;
                }
            } catch (error) {
                console.error('Error getting current user:', error);
                await window.electronAPI.navigateToLogin();
                return;
            }
        } else {
            await window.electronAPI.navigateToLogin();
            return;
        }
    }
    
    initializeTheme();
    document.getElementById('userWelcome').textContent = `Bienvenido, ${currentUser.name}`;
    
    console.log('Iniciando carga de datos...');
    await Promise.all([
        loadUsers(),
        loadContacts(),
        loadContactStats()
    ]);
    
    initializeCharts();
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    isDarkMode = savedTheme === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
        themeToggle.title = 'Modo claro';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙';
        themeToggle.title = 'Modo oscuro';
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode.toString());
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
        themeToggle.title = 'Modo claro';
        showToast('Modo oscuro activado', 'info');
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙';
        themeToggle.title = 'Modo oscuro';
        showToast('Modo claro activado', 'info');
    }
    
    // Actualizar gráficos si están inicializados
    if (statusChart) {
        statusChart.destroy();
        initializeStatusChart();
    }
    if (trendChart) {
        trendChart.destroy();
        initializeTrendChart();
    }
}

function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    currentTab = tabName;
    
    // Load data based on active tab
    switch(tabName) {
        case 'users':
            console.log('Loading users for users tab...');
            loadUsers();
            break;
        case 'contacts':
            loadContacts();
            break;
        case 'dashboard':
            loadContactStats();
            break;
    }
}

// ============ CONTACTS MANAGEMENT ============
async function loadContacts() {
    showLoading(true);
    
    try {
        const result = await window.electronAPI.getAllContacts();
        
        if (result.success) {
            contacts = result.data;
            renderContactsTable();
        } else {
            showError('Error al cargar contactos: ' + result.error);
        }
    } catch (error) {
        console.error('Error cargando contactos:', error);
        showError('Error de conexión al cargar contactos');
    } finally {
        showLoading(false);
    }
}

async function loadContactStats() {
    try {
        const result = await window.electronAPI.getContactStats();
        
        if (result.success) {
            const stats = result.data;
            animateNumber(totalContactsElement, stats.total || 0);
            animateNumber(totalLeadsElement, stats.leads || 0);
            animateNumber(totalClientsElement, stats.clients || 0);
            animateNumber(totalCompaniesElement, stats.companies || 0);
            
            updateCharts(stats);
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function renderContactsTable() {
    if (!contactsTableBody) return;
    
    contactsTableBody.innerHTML = '';
    
    contacts.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${contact.name}</strong></td>
            <td>${contact.company || '-'}</td>
            <td>${contact.email || '-'}</td>
            <td>${contact.phone || '-'}</td>
            <td><span class="status-badge status-${contact.status}">${getStatusLabel(contact.status)}</span></td>
            <td><span class="priority-badge priority-${contact.priority}">${getPriorityLabel(contact.priority)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="openEditContactModal(${contact.id})">Editar</button>
                    <button class="delete-btn" onclick="openDeleteContactModal(${contact.id})">Eliminar</button>
                </div>
            </td>
        `;
        contactsTableBody.appendChild(row);
    });
}

function filterContacts() {
    const searchTerm = document.getElementById('contactsSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const priorityFilter = document.getElementById('priorityFilter')?.value || '';
    
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm) ||
                             (contact.company && contact.company.toLowerCase().includes(searchTerm)) ||
                             (contact.email && contact.email.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilter || contact.status === statusFilter;
        const matchesPriority = !priorityFilter || contact.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });
    
    // Re-render table with filtered results
    renderFilteredContactsTable(filteredContacts);
}

function renderFilteredContactsTable(filteredContacts) {
    if (!contactsTableBody) return;
    
    contactsTableBody.innerHTML = '';
    
    filteredContacts.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${contact.name}</strong></td>
            <td>${contact.company || '-'}</td>
            <td>${contact.email || '-'}</td>
            <td>${contact.phone || '-'}</td>
            <td><span class="status-badge status-${contact.status}">${getStatusLabel(contact.status)}</span></td>
            <td><span class="priority-badge priority-${contact.priority}">${getPriorityLabel(contact.priority)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="openEditContactModal(${contact.id})">Editar</button>
                    <button class="delete-btn" onclick="openDeleteContactModal(${contact.id})">Eliminar</button>
                </div>
            </td>
        `;
        contactsTableBody.appendChild(row);
    });
}

function getStatusLabel(status) {
    const labels = {
        'lead': 'Lead',
        'prospect': 'Prospect',
        'cliente': 'Cliente',
        'inactivo': 'Inactivo'
    };
    return labels[status] || status;
}

function getPriorityLabel(priority) {
    const labels = {
        'high': 'Alta',
        'medium': 'Media',
        'low': 'Baja'
    };
    return labels[priority] || priority;
}

// Contact Modal Functions
function openAddContactModal() {
    isEditing = false;
    editingContactId = null;
    
    document.getElementById('contactModalTitle').textContent = 'Agregar Contacto';
    contactForm.reset();
    contactModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function openEditContactModal(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    isEditing = true;
    editingContactId = contactId;
    
    document.getElementById('contactModalTitle').textContent = 'Editar Contacto';
    
    // Fill form with contact data
    document.getElementById('contactId').value = contact.id;
    document.getElementById('contactName').value = contact.name || '';
    document.getElementById('contactEmail').value = contact.email || '';
    document.getElementById('contactPhone').value = contact.phone || '';
    document.getElementById('contactCompany').value = contact.company || '';
    document.getElementById('contactPosition').value = contact.position || '';
    document.getElementById('contactWebsite').value = contact.website || '';
    document.getElementById('contactAddress').value = contact.address || '';
    document.getElementById('contactCity').value = contact.city || '';
    document.getElementById('contactCountry').value = contact.country || '';
    document.getElementById('contactStatus').value = contact.status || 'lead';
    document.getElementById('contactPriority').value = contact.priority || 'medium';
    document.getElementById('contactSource').value = contact.source || '';
    document.getElementById('contactTags').value = contact.tags || '';
    document.getElementById('contactNotes').value = contact.notes || '';
    
    contactModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function openDeleteContactModal(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    editingContactId = contactId;
    document.getElementById('deleteInfo').textContent = `${contact.name} (${contact.company || 'Sin empresa'})`;
    
    deleteModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        position: formData.get('position'),
        website: formData.get('website'),
        address: formData.get('address'),
        city: formData.get('city'),
        country: formData.get('country'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        source: formData.get('source'),
        tags: formData.get('tags'),
        notes: formData.get('notes'),
        created_by: currentUser.id
    };
    
    if (!contactData.name) {
        showError('El nombre es requerido');
        return;
    }
    
    if (isEditing) {
        contactData.id = editingContactId;
        await updateContact(contactData);
    } else {
        await createContact(contactData);
    }
}

async function createContact(contactData) {
    try {
        const result = await window.electronAPI.createContact(contactData);
        
        if (result.success) {
            closeModals();
            await loadContacts();
            await loadContactStats();
            showSuccessMessage('Contacto creado exitosamente');
        } else {
            showError(result.error || 'Error al crear contacto');
        }
    } catch (error) {
        console.error('Error creando contacto:', error);
        showError('Error de conexión al crear contacto');
    }
}

async function updateContact(contactData) {
    try {
        const result = await window.electronAPI.updateContact(contactData);
        
        if (result.success) {
            closeModals();
            await loadContacts();
            await loadContactStats();
            showSuccessMessage('Contacto actualizado exitosamente');
        } else {
            showError(result.error || 'Error al actualizar contacto');
        }
    } catch (error) {
        console.error('Error actualizando contacto:', error);
        showError('Error de conexión al actualizar contacto');
    }
}

function closeContactModal() {
    contactModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    hideError();
    contactForm.reset();
}

// ============ USERS MANAGEMENT (Existing code adapted) ============
async function loadUsers() {
    showLoading(true);
    
    try {
        console.log('Cargando usuarios...');
        const result = await window.electronAPI.getAllUsers();
        console.log('Resultado getAllUsers:', result);
        
        if (result.success) {
            users = result.data;
            console.log('Usuarios cargados:', users);
            renderUsersTable();
            updateUserStats();
        } else {
            console.error('Error en result:', result.error);
            showError('Error al cargar usuarios: ' + result.error);
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showError('Error de conexión al cargar usuarios');
    } finally {
        showLoading(false);
    }
}

function renderUsersTable() {
    console.log('Renderizando tabla de usuarios...');
    console.log('usersTableBody:', usersTableBody);
    console.log('users array:', users);
    
    if (!usersTableBody) {
        console.error('No se encontró usersTableBody element');
        return;
    }
    
    usersTableBody.innerHTML = '';
    
    if (!users || users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #666;">No hay usuarios para mostrar</td></tr>';
        return;
    }
    
    users.forEach(user => {
        console.log('Renderizando usuario:', user);
        const row = document.createElement('tr');
        
        // Verificar currentUser antes de usarlo
        const isCurrentUser = currentUser && currentUser.id === user.id;
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="role-badge role-${user.role}">
                    ${user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="openEditUserModal(${user.id})">Editar</button>
                    <button class="delete-btn" onclick="openDeleteUserModal(${user.id})" 
                            ${isCurrentUser ? 'disabled title="No puedes eliminar tu propia cuenta"' : ''}>
                        Eliminar
                    </button>
                </div>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
    
    console.log('Tabla renderizada con', users.length, 'usuarios');
}

function updateUserStats() {
    const totalUsers = users.length;
    const totalAdmins = users.filter(user => user.role === 'admin').length;
    const totalRegularUsers = users.filter(user => user.role === 'user').length;
    
    animateNumber(totalUsersElement, totalUsers);
    animateNumber(totalAdminsElement, totalAdmins);
    animateNumber(totalRegularUsersElement, totalRegularUsers);
}

// ============ CHARTS ============
function initializeCharts() {
    initializeStatusChart();
    initializeTrendChart();
}

function initializeStatusChart() {
    const ctx = document.getElementById('statusChart')?.getContext('2d');
    if (!ctx) return;
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e2e8f0' : '#333333';
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Leads', 'Prospects', 'Clientes', 'Inactivos'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#f57c00',
                    '#1976d2',
                    '#388e3c',
                    '#616161'
                ],
                borderWidth: 3,
                borderColor: isDark ? '#2d3748' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: {
                            family: 'Inter',
                            size: 12,
                            weight: 500
                        },
                        padding: 20
                    }
                }
            }
        }
    });
}

function initializeTrendChart() {
    const ctx = document.getElementById('trendChart')?.getContext('2d');
    if (!ctx) return;
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e2e8f0' : '#333333';
    const gridColor = isDark ? '#4a5568' : '#e1e5e9';
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Nuevos Contactos',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: {
                            family: 'Inter',
                            size: 12,
                            weight: 500
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function updateCharts(stats) {
    if (statusChart) {
        statusChart.data.datasets[0].data = [
            stats.leads || 0,
            stats.prospects || 0, 
            stats.clients || 0,
            stats.inactive || 0
        ];
        statusChart.update();
    }
}

// ============ REPORTS ============
async function exportContacts() {
    try {
        showToast('Preparando exportación...', 'info');
        
        // Create CSV content
        const headers = ['Nombre', 'Email', 'Teléfono', 'Empresa', 'Cargo', 'Estado', 'Prioridad', 'Ciudad', 'País', 'Tags'];
        const csvContent = [
            headers.join(','),
            ...contacts.map(contact => [
                `"${contact.name || ''}"`,
                `"${contact.email || ''}"`,
                `"${contact.phone || ''}"`,
                `"${contact.company || ''}"`,
                `"${contact.position || ''}"`,
                `"${getStatusLabel(contact.status)}"`,
                `"${getPriorityLabel(contact.priority)}"`,
                `"${contact.city || ''}"`,
                `"${contact.country || ''}"`,
                `"${contact.tags || ''}"`
            ].join(','))
        ].join('\\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `contactos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessMessage('Contactos exportados exitosamente');
    } catch (error) {
        console.error('Error exportando contactos:', error);
        showError('Error al exportar contactos');
    }
}

function generateConversionReport() {
    const leads = contacts.filter(c => c.status === 'lead').length;
    const prospects = contacts.filter(c => c.status === 'prospect').length;
    const clients = contacts.filter(c => c.status === 'cliente').length;
    const total = contacts.length;
    
    if (total === 0) {
        showToast('No hay datos suficientes para generar el reporte', 'info');
        return;
    }
    
    const conversionRate = ((clients / total) * 100).toFixed(1);
    const prospectRate = ((prospects / total) * 100).toFixed(1);
    
    showToast(`Tasa de conversión: ${conversionRate}% | Prospects: ${prospectRate}%`, 'success');
}

// ============ UTILITY FUNCTIONS ============
function animateNumber(element, targetNumber) {
    if (!element) return;
    
    const currentNumber = parseInt(element.textContent) || 0;
    
    // Si los números son iguales, no hacer animación
    if (currentNumber === targetNumber) {
        element.textContent = targetNumber;
        return;
    }
    
    const difference = Math.abs(targetNumber - currentNumber);
    const increment = targetNumber > currentNumber ? 1 : -1;
    
    // Calcular tiempo de paso más seguro
    const duration = 500; // 500ms total
    const steps = Math.min(difference, 50); // Máximo 50 pasos
    const stepTime = Math.max(duration / steps, 10); // Mínimo 10ms por paso
    
    let current = currentNumber;
    const stepIncrement = difference > steps ? Math.ceil(difference / steps) : 1;
    
    const timer = setInterval(() => {
        if (increment > 0) {
            current = Math.min(current + stepIncrement, targetNumber);
        } else {
            current = Math.max(current - stepIncrement, targetNumber);
        }
        
        element.textContent = current;
        
        if (current === targetNumber) {
            clearInterval(timer);
        }
    }, stepTime);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============ USER MANAGEMENT (Existing functions) ============
function openAddUserModal() {
    isEditing = false;
    editingUserId = null;
    
    document.getElementById('modalTitle').textContent = 'Agregar Usuario';
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('userPassword').required = true;
    
    userForm.reset();
    userModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function openEditUserModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    isEditing = true;
    editingUserId = userId;
    
    document.getElementById('modalTitle').textContent = 'Editar Usuario';
    document.getElementById('passwordGroup').style.display = 'none';
    document.getElementById('userPassword').required = false;
    
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    
    userModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function openDeleteUserModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (user.id === currentUser.id) {
        showError('No puedes eliminar tu propia cuenta');
        return;
    }
    
    editingUserId = userId;
    document.getElementById('deleteInfo').textContent = `${user.name} (${user.email})`;
    
    deleteModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

async function handleUserFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(userForm);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role')
    };
    
    if (!userData.name || !userData.email || !userData.role) {
        showError('Por favor, completa todos los campos');
        return;
    }
    
    if (isEditing) {
        userData.id = editingUserId;
        await updateUser(userData);
    } else {
        userData.password = formData.get('password');
        if (!userData.password) {
            showError('La contraseña es requerida para nuevos usuarios');
            return;
        }
        if (userData.password.length < 6) {
            showError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        await createUser(userData);
    }
}

async function createUser(userData) {
    try {
        const result = await window.electronAPI.createUser(userData);
        
        if (result.success) {
            closeModals();
            await loadUsers();
            showSuccessMessage('Usuario creado exitosamente');
        } else {
            showError(result.error || 'Error al crear usuario');
        }
    } catch (error) {
        console.error('Error creando usuario:', error);
        showError('Error de conexión al crear usuario');
    }
}

async function updateUser(userData) {
    try {
        const result = await window.electronAPI.updateUser(userData);
        
        if (result.success) {
            closeModals();
            await loadUsers();
            showSuccessMessage('Usuario actualizado exitosamente');
        } else {
            showError(result.error || 'Error al actualizar usuario');
        }
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        showError('Error de conexión al actualizar usuario');
    }
}

async function confirmDelete() {
    if (editingUserId) {
        // Delete user
        try {
            const result = await window.electronAPI.deleteUser(editingUserId);
            
            if (result.success) {
                closeModals();
                await loadUsers();
                showSuccessMessage('Usuario eliminado exitosamente');
            } else {
                showError(result.error || 'Error al eliminar usuario');
            }
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            showError('Error de conexión al eliminar usuario');
        }
    } else if (editingContactId) {
        // Delete contact
        try {
            const result = await window.electronAPI.deleteContact(editingContactId);
            
            if (result.success) {
                closeModals();
                await loadContacts();
                await loadContactStats();
                showSuccessMessage('Contacto eliminado exitosamente');
            } else {
                showError(result.error || 'Error al eliminar contacto');
            }
        } catch (error) {
            console.error('Error eliminando contacto:', error);
            showError('Error de conexión al eliminar contacto');
        }
    }
}

// ============ MODAL MANAGEMENT ============
function closeUserModal() {
    userModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    hideError();
    userForm.reset();
}

function closeDeleteModal() {
    deleteModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    editingUserId = null;
    editingContactId = null;
}

function closeModals() {
    closeUserModal();
    closeContactModal();
    closeDeleteModal();
}

async function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('currentUser');
        await window.electronAPI.navigateToLogin();
    }
}

// ============ UI HELPERS ============
function showLoading(show) {
    if (show) {
        loadingOverlay.style.display = 'flex';
    } else {
        loadingOverlay.style.display = 'none';
    }
}

function showError(message) {
    const errorElement = document.getElementById('contact-form-error') || document.getElementById('user-form-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        showToast(message, 'error');
    }
}

function hideError() {
    const errorElements = ['contact-form-error', 'user-form-error'];
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

function showSuccessMessage(message) {
    showToast(message, 'success');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
        success: { bg: '#d4edda', text: '#155724', border: '#28a745' },
        error: { bg: '#f8d7da', text: '#721c24', border: '#dc3545' },
        info: { bg: '#d1ecf1', text: '#0c5460', border: '#17a2b8' }
    };
    
    const color = colors[type] || colors.info;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color.bg};
        color: ${color.text};
        padding: 16px 24px;
        border-radius: 12px;
        border-left: 4px solid ${color.border};
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        z-index: 2001;
        max-width: 400px;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// CSS Animations for toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
