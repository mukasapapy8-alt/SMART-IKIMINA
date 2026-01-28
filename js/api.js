// API Configuration for Smart Ikimina Frontend
const API_CONFIG = {
    // Change this to your deployed URL when you deploy to Render
    BASE_URL: 'http://localhost:5000/api',
    
    // Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        
        // Admin Codes
        VALIDATE_CODE: '/admin-codes/validate',
        GENERATE_CODE: '/admin-codes/generate',
        
        // Groups
        GROUPS: '/groups',
        GROUPS_ACTIVE: '/groups/active',  // Get all active/approved groups (for registration)
        JOIN_GROUP: '/groups/join',
        CREATE_GROUP: '/groups',  // Fixed: backend uses POST /groups, not /groups/create
        PENDING_GROUPS: '/groups/pending/all',  // Site admin: get all pending groups
        APPROVE_GROUP: '/groups/:groupId/approve',  // Site admin: approve a group
        REJECT_GROUP: '/groups/:groupId/reject',  // Site admin: reject a group
        PENDING_REQUESTS: '/groups/:groupId/pending-requests',
        APPROVE_MEMBER: '/groups/approve-member',
        REMOVE_MEMBER: '/groups/remove-member',
        
        // Contributions
        CONTRIBUTIONS: '/contributions',
        MY_CONTRIBUTIONS: '/contributions/my-contributions',
        APPROVE_CONTRIBUTION: '/contributions/approve',
        
        // Loans
        LOANS: '/loans',
        REQUEST_LOAN: '/loans/request',
        APPROVE_LOAN: '/loans/approve',
        MY_LOANS: '/loans/my-loans',
        
        // Payments (To be implemented by backend)
        PAYMENT_REQUEST: '/payments/request',
        PAYMENT_REQUESTS: '/payments/requests',
        APPROVE_PAYMENT: '/payments/requests/:paymentId/approve',
        REJECT_PAYMENT: '/payments/requests/:paymentId/reject',
        RECORD_PAYMENT: '/payments/requests/:paymentId/record',
        GET_RECEIPT: '/payments/receipts/:fileId',
        
        // Notifications
        NOTIFICATIONS: '/notifications',
        UNREAD_NOTIFICATIONS: '/notifications/unread',
        MARK_READ: '/notifications/:id/read',
        MARK_ALL_READ: '/notifications/read-all',
        
        // Health Check
        HEALTH: '/health'
    }
};

// Token management
const TokenManager = {
    getToken: () => localStorage.getItem('authToken'),
    setToken: (token) => localStorage.setItem('authToken', token),
    removeToken: () => localStorage.removeItem('authToken'),
    
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    removeUser: () => localStorage.removeItem('user'),
    
    isLoggedIn: () => !!localStorage.getItem('authToken'),
    
    logout: () => {
        TokenManager.removeToken();
        TokenManager.removeUser();
        window.location.href = 'login.html';
    }
};

// API Helper Functions
const API = {
    // Make authenticated request
    async request(endpoint, options = {}) {
        const url = API_CONFIG.BASE_URL + endpoint;
        const token = TokenManager.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            console.log('API Response:', { url, status: response.status, ok: response.ok, data });
            
            // Check for 401 (Unauthorized) - token expired or invalid
            if (response.status === 401) {
                TokenManager.logout();
                throw new Error('Session expired. Please login again.');
            }
            
            if (!response.ok) {
                const error = data.error || data.message || 'Request failed';
                throw new Error(error);
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // GET request
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    // POST request
    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },
    
    // PUT request
    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },
    
    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Auth API Functions
const AuthAPI = {
    async login(email, password) {
        const data = await API.post(API_CONFIG.ENDPOINTS.LOGIN, { email, password });
        if (data.token) {
            TokenManager.setToken(data.token);
            TokenManager.setUser(data.user);
        }
        return data;
    },
    
    async register(userData) {
        const data = await API.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
        if (data.token) {
            TokenManager.setToken(data.token);
            TokenManager.setUser(data.user);
        }
        return data;
    },
    
    async getProfile() {
        return API.get(API_CONFIG.ENDPOINTS.PROFILE);
    },
    
    async forgotPassword(email) {
        return API.post(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, { email });
    },
    
    async resetPassword(token, newPassword) {
        return API.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, { token, newPassword });
    },
    
    async validateAdminCode(code) {
        return API.post(API_CONFIG.ENDPOINTS.VALIDATE_CODE, { code });
    }
};

// Groups API Functions
const GroupsAPI = {
    async getAll() {
        return API.get(API_CONFIG.ENDPOINTS.GROUPS);
    },
    
    async getActive() {
        // Get all active/approved groups available for joining (for registration)
        return API.get(API_CONFIG.ENDPOINTS.GROUPS_ACTIVE);
    },
    
    async getById(groupId) {
        return API.get(`${API_CONFIG.ENDPOINTS.GROUPS}/${groupId}`);
    },
    
    async create(groupData) {
        console.log('GroupsAPI.create called with:', groupData);
        console.log('Using endpoint:', API_CONFIG.ENDPOINTS.CREATE_GROUP);
        console.log('Full URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_GROUP);
        return API.post(API_CONFIG.ENDPOINTS.CREATE_GROUP, groupData);
    },
    
    async joinGroup(groupCode) {
        // Send join request with groupId (can be UUID or group code)
        console.log('Joining group with ID/Code:', groupCode);
        return API.post(API_CONFIG.ENDPOINTS.JOIN_GROUP, { groupId: groupCode });
    },
    
    async getPendingRequests(groupId) {
        return API.get(`/groups/${groupId}/pending-requests`);
    },
    
    async getMembers(groupId) {
        // Get all members of a group with full user details
        return API.get(`/groups/${groupId}/members`);
    },
    
    async getActiveMembers(groupId) {
        // Get only approved/active members of a group
        return API.get(`/groups/${groupId}/members?status=approved`);
    },
    
    async getPendingGroups() {
        // Site admin only: get all pending groups awaiting approval
        return API.get(API_CONFIG.ENDPOINTS.PENDING_GROUPS);
    },
    
    async approveGroup(groupId) {
        // Site admin only: approve a pending group
        return API.post(API_CONFIG.ENDPOINTS.APPROVE_GROUP.replace(':groupId', groupId), {});
    },
    
    async rejectGroup(groupId, reason) {
        // Site admin only: reject a pending group
        return API.post(API_CONFIG.ENDPOINTS.REJECT_GROUP.replace(':groupId', groupId), { reason });
    },
    
    async approveMember(groupId, userId) {
        console.log('API.approveMember called with:', { groupId, userId });
        // Backend expects userId (not memberId) and groupId
        return API.post(API_CONFIG.ENDPOINTS.APPROVE_MEMBER, { groupId, userId });
    },
    
    async removeMember(groupId, userId, reason) {
        console.log('API.removeMember called with:', { groupId, userId, reason });
        // Backend expects userId (not memberId) and groupId
        return API.post(API_CONFIG.ENDPOINTS.REMOVE_MEMBER, { groupId, userId, reason });
    }
};

// Contributions API Functions
const ContributionsAPI = {
    async getAll(groupId) {
        return API.get(`${API_CONFIG.ENDPOINTS.CONTRIBUTIONS}?groupId=${groupId}`);
    },
    
    async getMyContributions() {
        return API.get(API_CONFIG.ENDPOINTS.MY_CONTRIBUTIONS);
    },
    
    async create(contributionData) {
        return API.post(API_CONFIG.ENDPOINTS.CONTRIBUTIONS, contributionData);
    },
    
    async approve(contributionId) {
        return API.post(`${API_CONFIG.ENDPOINTS.CONTRIBUTIONS}/${contributionId}/approve`);
    }
};

// Loans API Functions
const LoansAPI = {
    async getAll(groupId) {
        return API.get(`${API_CONFIG.ENDPOINTS.LOANS}?groupId=${groupId}`);
    },
    
    async getMyLoans() {
        return API.get(API_CONFIG.ENDPOINTS.MY_LOANS);
    },
    
    async request(loanData) {
        return API.post(API_CONFIG.ENDPOINTS.REQUEST_LOAN, loanData);
    },
    
    async approve(loanId) {
        return API.post(`${API_CONFIG.ENDPOINTS.LOANS}/${loanId}/approve`);
    }
};

// Notifications API Functions
const NotificationsAPI = {
    async getAll() {
        return API.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
    },
    
    async getUnread() {
        return API.get(API_CONFIG.ENDPOINTS.UNREAD_NOTIFICATIONS);
    },
    
    async markAsRead(notificationId) {
        return API.post(`/notifications/${notificationId}/read`);
    },
    
    async markAllAsRead() {
        return API.post(API_CONFIG.ENDPOINTS.MARK_ALL_READ);
    }
};

// Socket.IO Connection for Real-time Notifications
let socket = null;

const SocketManager = {
    connect() {
        if (socket) return;
        
        const token = TokenManager.getToken();
        if (!token) return;
        
        // Load Socket.IO client if not loaded
        if (typeof io === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = () => this.initSocket(token);
            document.head.appendChild(script);
        } else {
            this.initSocket(token);
        }
    },
    
    initSocket(token) {
        socket = io(API_CONFIG.BASE_URL.replace('/api', ''), {
            auth: { token }
        });
        
        socket.on('connect', () => {
            console.log('Connected to notifications');
        });
        
        socket.on('notification', (notification) => {
            console.log('New notification:', notification);
            this.showNotification(notification);
        });
        
        socket.on('disconnect', () => {
            console.log('Disconnected from notifications');
        });
    },
    
    joinGroup(groupId) {
        if (socket) {
            socket.emit('join_group', groupId);
        }
    },
    
    leaveGroup(groupId) {
        if (socket) {
            socket.emit('leave_group', groupId);
        }
    },
    
    showNotification(notification) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="notification-content">
                <strong>${notification.title}</strong>
                <p>${notification.message}</p>
            </div>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('notification-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-toast-styles';
            style.textContent = `
                .notification-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    max-width: 350px;
                }
                .notification-toast .notification-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #2E5BFF, #00D4AA);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .notification-toast button {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #999;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => toast.remove(), 5000);
    },
    
    disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    }
};

// Utility function to redirect based on user role
function redirectToDashboard(role) {
    switch (role) {
        case 'site_admin':
            window.location.href = 'Site-adminstrator-dashboard.html';
            break;
        case 'group_leader':
            window.location.href = 'leader-dashboard.html';
            break;
        default:
            window.location.href = 'user-dashboard.html';
    }
}

// Check authentication on protected pages
function requireAuth() {
    if (!TokenManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize Socket connection if logged in
document.addEventListener('DOMContentLoaded', () => {
    if (TokenManager.isLoggedIn()) {
        try {
            SocketManager.connect();
        } catch (error) {
            console.warn('Socket connection failed:', error);
        }
    }
});

// Global error handler for API responses
window.addEventListener('fetch', (event) => {
    // This is for monitoring fetch requests in development
    console.log('API Call:', event.request.url);
});

// Prevent unauthorized access to protected pages
function requireAuthOnPage() {
    if (!TokenManager.isLoggedIn()) {
        // Store the current page in case user wants to redirect back
        const currentPage = window.location.pathname.split('/').pop();
        localStorage.setItem('redirectAfterLogin', currentPage);
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize page with authentication check
if (document.currentScript && document.currentScript.src.includes('api.js')) {
    // Only run if on a protected page (user-dashboard, leader-dashboard, etc.)
    const protectedPages = ['user-dashboard', 'leader-dashboard', 'Site-adminstrator-dashboard', 'tontine-groups-management'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.some(page => currentPage.includes(page))) {
        document.addEventListener('DOMContentLoaded', () => {
            if (!requireAuthOnPage()) {
                return;
            }
            
            // Load user profile if needed
            try {
                const user = TokenManager.getUser();
                if (user) {
                    // Profile is already loaded from token
                    console.log('User logged in:', user.email);
                }
            } catch (error) {
                console.error('Error loading user:', error);
            }
        });
    }
}

console.log('API Config loaded. Base URL:', API_CONFIG.BASE_URL);
