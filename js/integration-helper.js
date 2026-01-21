// Frontend-Backend Integration Helper
// This file provides utilities to ensure perfect integration

/**
 * Check if backend is running and accessible
 */
async function checkBackendConnection() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.HEALTH);
        const data = await response.json();
        console.log('✓ Backend is running:', data);
        return true;
    } catch (error) {
        console.error('✗ Backend is not accessible:', error);
        showConnectionError();
        return false;
    }
}

/**
 * Show connection error banner
 */
function showConnectionError() {
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff4444;
        color: white;
        padding: 15px 20px;
        text-align: center;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    banner.innerHTML = `
        <i class="fas fa-exclamation-circle"></i> 
        Cannot connect to backend. Make sure the server is running on ${API_CONFIG.BASE_URL}
    `;
    document.body.appendChild(banner);
    
    // Auto-hide after 10 seconds
    setTimeout(() => banner.remove(), 10000);
}

/**
 * Validate API response format
 */
function validateApiResponse(response) {
    if (!response) {
        throw new Error('Empty response from server');
    }
    
    // Check if response has required fields
    if (typeof response === 'object') {
        // If it has error property, it's an error response
        if (response.error) {
            throw new Error(response.error);
        }
        // If it has message property (from backend errors)
        if (response.message && response.status === 'error') {
            throw new Error(response.message);
        }
    }
    
    return response;
}

/**
 * Format API error messages for display
 */
function formatApiError(error) {
    if (typeof error === 'string') {
        return error;
    }
    
    if (error.message) {
        return error.message;
    }
    
    if (error.error) {
        return error.error;
    }
    
    return 'An error occurred. Please try again.';
}

/**
 * Handle common API errors
 */
function handleApiError(error, context = '') {
    console.error('API Error in ' + context + ':', error);
    
    const message = formatApiError(error);
    
    // Show user-friendly error message
    if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('401')) {
        alert('Your session has expired. Please login again.');
        TokenManager.logout();
    } else if (message.toLowerCase().includes('forbidden') || message.toLowerCase().includes('403')) {
        alert('You do not have permission to perform this action.');
    } else if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('404')) {
        alert('The requested resource was not found.');
    } else if (message.toLowerCase().includes('conflict') || message.toLowerCase().includes('409')) {
        alert('This item already exists. ' + message);
    } else {
        alert('Error: ' + message);
    }
    
    return message;
}

/**
 * Show loading spinner
 */
function showLoading(element, show = true) {
    if (!element) return;
    
    if (show) {
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        element.disabled = true;
    } else {
        element.disabled = false;
    }
}

/**
 * Hide loading spinner
 */
function hideLoading(element, text = '') {
    if (!element) return;
    element.innerHTML = text;
    element.disabled = false;
}

/**
 * Format currency for display
 */
function formatCurrency(amount, currency = 'RWF') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Initialize dashboard after login
 */
async function initializeDashboard() {
    try {
        // Check if user is logged in
        if (!TokenManager.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
        
        // Load user data
        const user = TokenManager.getUser();
        console.log('User data:', user);
        
        // Show welcome message
        const userNameElement = document.getElementById('userName');
        if (userNameElement && user) {
            userNameElement.textContent = user.full_name || user.email;
        }
        
        // Load notifications if available
        try {
            const notifications = await NotificationsAPI.getUnread();
            console.log('Unread notifications:', notifications);
        } catch (error) {
            console.warn('Could not load notifications:', error);
        }
        
        return true;
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        return false;
    }
}

/**
 * Safely call API function with error handling
 */
async function callAPI(apiFunction, ...args) {
    try {
        return await apiFunction(...args);
    } catch (error) {
        handleApiError(error, apiFunction.name);
        throw error;
    }
}

/**
 * Get user's authentication token
 */
function getAuthHeader() {
    const token = TokenManager.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Check if user has specific role
 */
function hasRole(role) {
    const user = TokenManager.getUser();
    return user && user.role === role;
}

/**
 * Check if user is admin
 */
function isAdmin() {
    return hasRole('site_admin');
}

/**
 * Check if user is group leader
 */
function isGroupLeader() {
    return hasRole('group_leader');
}

/**
 * Debug: Log current state
 */
function logDebugInfo() {
    console.group('Debug Information');
    console.log('API Base URL:', API_CONFIG.BASE_URL);
    console.log('Is Logged In:', TokenManager.isLoggedIn());
    console.log('User Data:', TokenManager.getUser());
    console.log('Auth Token:', TokenManager.getToken() ? '✓ Present' : '✗ Missing');
    console.groupEnd();
}

// Check backend connection when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkBackendConnection();
});

// Export functions
window.IntegrationHelper = {
    checkBackendConnection,
    showConnectionError,
    validateApiResponse,
    formatApiError,
    handleApiError,
    showLoading,
    hideLoading,
    formatCurrency,
    formatDate,
    initializeDashboard,
    callAPI,
    getAuthHeader,
    hasRole,
    isAdmin,
    isGroupLeader,
    logDebugInfo
};

console.log('Integration Helper loaded');
