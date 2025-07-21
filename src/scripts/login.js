// Variables globales
let currentUser = null;

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerModal = document.getElementById('registerModal');
const registerLink = document.getElementById('registerLink');
const errorMessage = document.getElementById('error-message');
const registerErrorMessage = document.getElementById('register-error-message');
const loadingElement = document.getElementById('loading');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Register form
    registerForm.addEventListener('submit', handleRegister);
    
    // Register link
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        openRegisterModal();
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            closeModals();
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Confirm password validation
    const confirmPasswordField = document.getElementById('confirmPassword');
    confirmPasswordField.addEventListener('input', validatePasswordMatch);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    if (!credentials.email || !credentials.password) {
        showError('Por favor, completa todos los campos', errorMessage);
        return;
    }
    
    showLoading(true);
    hideError(errorMessage);
    
    try {
        const result = await window.electronAPI.login(credentials);
        
        if (result.success) {
            currentUser = result.data.user;
            localStorage.setItem('userToken', result.data.token);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Navegar al dashboard
            await window.electronAPI.navigateToDashboard();
        } else {
            showError(result.error || 'Error al iniciar sesión', errorMessage);
        }
    } catch (error) {
        console.error('Error en login:', error);
        showError('Error de conexión. Inténtalo de nuevo.', errorMessage);
    } finally {
        showLoading(false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: 'user' // Los nuevos usuarios son usuarios regulares por defecto
    };
    
    const confirmPassword = formData.get('confirmPassword');
    
    // Validaciones
    if (!userData.name || !userData.email || !userData.password || !confirmPassword) {
        showError('Por favor, completa todos los campos', registerErrorMessage);
        return;
    }
    
    if (userData.password !== confirmPassword) {
        showError('Las contraseñas no coinciden', registerErrorMessage);
        return;
    }
    
    if (userData.password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres', registerErrorMessage);
        return;
    }
    
    hideError(registerErrorMessage);
    
    try {
        const result = await window.electronAPI.register(userData);
        
        if (result.success) {
            closeModals();
            resetForms();
            showSuccessMessage('Usuario registrado exitosamente. Puedes iniciar sesión ahora.');
        } else {
            showError(result.error || 'Error al registrar usuario', registerErrorMessage);
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showError('Error de conexión. Inténtalo de nuevo.', registerErrorMessage);
    }
}

function openRegisterModal() {
    registerModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModals() {
    registerModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    hideError(registerErrorMessage);
    resetForms();
}

function resetForms() {
    registerForm.reset();
}

function validatePasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmField = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmField.setCustomValidity('Las contraseñas no coinciden');
        confirmField.style.borderColor = '#c62828';
    } else {
        confirmField.setCustomValidity('');
        confirmField.style.borderColor = '#e1e5e9';
    }
}

function showError(message, element) {
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(element) {
    element.style.display = 'none';
}

function showLoading(show) {
    if (show) {
        loadingElement.style.display = 'flex';
    } else {
        loadingElement.style.display = 'none';
    }
}

function showSuccessMessage(message) {
    // Crear un elemento de mensaje de éxito
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #d4edda;
        color: #155724;
        padding: 12px;
        border-radius: 6px;
        margin-top: 15px;
        border-left: 4px solid #28a745;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    // Remover el mensaje después de 3 segundos
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Manejar tecla Enter en modales
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModals();
    }
});
