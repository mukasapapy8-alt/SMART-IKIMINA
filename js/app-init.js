/**
 * Smart Ikimina - Frontend Initialization Script
 * This script initializes the frontend with proper backend integration
 */

// Ensure API is loaded
if (typeof API_CONFIG === 'undefined') {
    console.error('API_CONFIG not found! Make sure api.js is loaded before this script.');
}

/**
 * Initialize the frontend application
 */
function initializeApp() {
    console.log('🚀 Initializing Smart Ikimina Frontend...');
    
    // Check backend connection
    checkBackendStatus();
    
    // Setup global error handlers
    setupErrorHandlers();
    
    // Setup network listeners
    setupNetworkListeners();
    
    // Initialize language
    initializeLanguage();
    
    // Load user data if logged in
    if (TokenManager.isLoggedIn()) {
        initializeUserSession();
    }
    
    console.log('✓ Frontend initialization complete');
}

/**
 * Check backend status
 */
async function checkBackendStatus() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.HEALTH, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            console.log('✓ Backend connection: OK');
            return true;
        } else {
            console.warn('⚠ Backend returned status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('✗ Backend connection failed:', error.message);
        showBackendErrorNotification();
        return false;
    }
}

/**
 * Show backend error notification
 */
function showBackendErrorNotification() {
    // Only show if not already shown
    if (document.getElementById('backend-error-notification')) return;
    
    const notification = document.createElement('div');
    notification.id = 'backend-error-notification';
    notification.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #ff4444, #ff6666);
        color: white;
        padding: 16px 20px;
        text-align: center;
        font-weight: 600;
        z-index: 9998;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle" style="font-size: 1.2rem;"></i>
        <span>Cannot connect to backend. Please ensure the server is running on <strong>${API_CONFIG.BASE_URL}</strong></span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;">Dismiss</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 15000);
}

/**
 * Initialize user session
 */
async function initializeUserSession() {
    try {
        const user = TokenManager.getUser();
        console.log('👤 User session loaded:', user?.email);
        
        // Start socket connection for notifications
        if (typeof SocketManager !== 'undefined') {
            SocketManager.connect();
        }
        
        return true;
    } catch (error) {
        console.error('Error initializing user session:', error);
        return false;
    }
}

/**
 * Setup global error handlers
 */
function setupErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
        console.error('Global error caught:', event.error);
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        // Don't prevent default - let browser handle it
    });
    
    // Handle fetch errors
    if (typeof originalFetch === 'undefined') {
        window.originalFetch = window.fetch;
        window.fetch = async function(...args) {
            try {
                const response = await window.originalFetch(...args);
                
                // Log 4xx and 5xx errors
                if (!response.ok && response.status >= 400) {
                    console.warn(`API ${response.status} error:`, args[0]);
                }
                
                return response;
            } catch (error) {
                console.error('Fetch error:', error, args[0]);
                throw error;
            }
        };
    }
}

/**
 * Setup network listeners
 */
function setupNetworkListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
        console.log('✓ Connection restored');
        showNotification('success', 'Connection restored', 3000);
    });
    
    window.addEventListener('offline', () => {
        console.warn('✗ Connection lost');
        showNotification('error', 'No internet connection', 0);
    });
}

/**
 * Initialize language system
 */
function initializeLanguage() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 
                     localStorage.getItem('selectedLanguage') || 
                     'en';
    
    // Set document language if function exists
    if (typeof setLanguage === 'function') {
        setLanguage(savedLang);
    } else if (typeof switchLanguage === 'function') {
        switchLanguage(savedLang);
    }
    
    // Store as preferred
    localStorage.setItem('preferredLanguage', savedLang);
}

/**
 * Show notification toast
 */
function showNotification(type, message, duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9997;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    let bgColor = '#f0f0f0';
    let iconClass = 'fas fa-info-circle';
    let textColor = '#333';
    
    if (type === 'success') {
        bgColor = '#e8f5e9';
        iconClass = 'fas fa-check-circle';
        textColor = '#2e7d32';
    } else if (type === 'error') {
        bgColor = '#ffebee';
        iconClass = 'fas fa-exclamation-circle';
        textColor = '#c62828';
    } else if (type === 'warning') {
        bgColor = '#fff3e0';
        iconClass = 'fas fa-warning';
        textColor = '#e65100';
    }
    
    toast.style.background = bgColor;
    toast.style.color = textColor;
    
    toast.innerHTML = `
        <i class="${iconClass}" style="font-size: 1.2rem;"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: transparent; border: none; color: inherit; cursor: pointer; font-size: 1.2rem;">×</button>
    `;
    
    document.body.appendChild(toast);
    
    if (duration > 0) {
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, duration);
    }
    
    return toast;
}

/**
 * Make API request with better error handling
 */
async function makeApiRequest(method, endpoint, data = null) {
    try {
        const url = API_CONFIG.BASE_URL + endpoint;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const token = TokenManager.getToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || result.message || `HTTP ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error(`API ${method} ${endpoint} failed:`, error);
        throw error;
    }
}

/**
 * Verify backend endpoints exist and are accessible
 */
async function verifyBackendEndpoints() {
    console.log('Verifying backend endpoints...');
    
    const endpoints = [
        API_CONFIG.ENDPOINTS.HEALTH,
        API_CONFIG.ENDPOINTS.LOGIN,
        API_CONFIG.ENDPOINTS.REGISTER,
        API_CONFIG.ENDPOINTS.PROFILE,
        API_CONFIG.ENDPOINTS.GROUPS
    ];
    
    const results = {};
    
    for (const endpoint of endpoints) {
        try {
            const url = API_CONFIG.BASE_URL + endpoint;
            const response = await fetch(url, { method: 'OPTIONS' });
            results[endpoint] = response.ok ? '✓' : `✗ ${response.status}`;
        } catch (error) {
            results[endpoint] = '✗ ' + error.message;
        }
    }
    
    console.table(results);
    return results;
}

/**
 * Clear all user data and perform logout
 */
function performLogout() {
    // Disconnect socket
    if (typeof SocketManager !== 'undefined') {
        SocketManager.disconnect();
    }
    
    // Clear tokens and user data
    TokenManager.logout();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}

// Export for use in console
window.AppInit = {
    initializeApp,
    checkBackendStatus,
    verifyBackendEndpoints,
    makeApiRequest,
    showNotification,
    performLogout,
    logDebugInfo: () => {
        console.log('=== Smart Ikimina Frontend Debug ===');
        console.log('API Base URL:', API_CONFIG.BASE_URL);
        console.log('Is Logged In:', TokenManager.isLoggedIn());
        console.log('User:', TokenManager.getUser());
        console.log('Token:', TokenManager.getToken() ? '✓ Present' : '✗ Missing');
        console.log('Backend Status: Checking...');
        checkBackendStatus();
    }
};

console.log('✓ App initialization script loaded');
