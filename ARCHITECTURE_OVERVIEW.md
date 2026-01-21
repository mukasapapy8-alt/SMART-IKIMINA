# Smart Ikimina - Architecture & Integration Overview

## Project Structure

```
C:\Users\user\
├── frontend/                          # Frontend - Static HTML/CSS/JS
│   ├── js/
│   │   └── api.js                    # ⭐ API Client (Already configured!)
│   ├── login.html                    # Login & Registration
│   ├── user-dashboard.html           # User Dashboard
│   ├── leader-dashboard.html         # Group Leader Dashboard
│   ├── Site-adminstrator-dashboard.html
│   ├── tontine-groups-management.html
│   ├── ikimina.html                  # Home page
│   ├── BACKEND_INTEGRATION_SETUP.md  # Setup guide
│   └── INTEGRATION_CHECKLIST.md      # This checklist
│
└── EKIMINA-SERVER/                   # Backend - Node.js/Express/TypeScript
    ├── src/
    │   ├── index.ts                  # Main server file
    │   ├── config/
    │   │   └── database.ts           # PostgreSQL connection
    │   ├── routes/                   # API endpoints
    │   │   ├── authRoutes.ts
    │   │   ├── groupRoutes.ts
    │   │   ├── contributionRoutes.ts
    │   │   ├── loanRoutes.ts
    │   │   └── notificationRoutes.ts
    │   ├── controllers/              # Business logic
    │   ├── middlewares/              # Auth, error handling
    │   └── services/
    │       └── notificationService.ts # Real-time with Socket.IO
    ├── .env                          # Environment variables
    ├── package.json                  # Dependencies
    └── tsconfig.json                 # TypeScript config
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Frontend)                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    HTML Pages                              │  │
│  │  - login.html                                              │  │
│  │  - user-dashboard.html                                     │  │
│  │  - leader-dashboard.html                                   │  │
│  │  - Site-adminstrator-dashboard.html                        │  │
│  └─────────────────┬───────────────────────────────────────────┘  │
│                    │                                              │
│  ┌─────────────────▼───────────────────────────────────────────┐  │
│  │                    api.js                                   │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │ API Client Functions:                              │   │  │
│  │  │ - AuthAPI.login()                                  │   │  │
│  │  │ - GroupsAPI.create()                               │   │  │
│  │  │ - ContributionsAPI.create()                        │   │  │
│  │  │ - LoansAPI.request()                               │   │  │
│  │  │ - NotificationsAPI.getAll()                        │   │  │
│  │  └────────────────┬──────────────────────────────────┘   │  │
│  │  ┌────────────────▼──────────────────────────────────┐   │  │
│  │  │ Token Manager:                                   │   │  │
│  │  │ - localStorage.authToken (JWT)                   │   │  │
│  │  │ - localStorage.user (User profile)               │   │  │
│  │  └────────────────┬──────────────────────────────────┘   │  │
│  └─────────────────┬───────────────────────────────────────────┘  │
│                    │                                              │
│  ┌─────────────────▼───────────────────────────────────────────┐  │
│  │                 Socket.IO Client                           │  │
│  │  - Real-time notifications                                │  │
│  │  - Group events                                           │  │
│  │  - Approval notifications                                 │  │
│  └──────────────────┬──────────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────────────┘
                      │ HTTP + WebSocket (Port 5000)
                      │
┌─────────────────────▼──────────────────────────────────────────────┐
│                   Express.js Backend Server                        │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │              CORS Middleware                             │    │
│  │ Allowed Origins:                                         │    │
│  │ - http://localhost:3000                                  │    │
│  │ - http://localhost:5173                                  │    │
│  │ - http://127.0.0.1:3000                                  │    │
│  │ - http://127.0.0.1:5173                                  │    │
│  │ - $FRONTEND_URL (from .env)                              │    │
│  └──────────────────┬────────────────────────────────────────┘    │
│  ┌──────────────────▼────────────────────────────────────────┐    │
│  │            JWT Authentication Middleware                 │    │
│  │  - Verifies Bearer token                                 │    │
│  │  - Extracts user ID                                      │    │
│  │  - Attaches user to request                              │    │
│  └──────────────────┬────────────────────────────────────────┘    │
│  ┌──────────────────▼────────────────────────────────────────┐    │
│  │              API Routes (/api/*)                         │    │
│  │  ├── /auth/login          (POST)                        │    │
│  │  ├── /auth/register       (POST)                        │    │
│  │  ├── /auth/profile        (GET)                         │    │
│  │  ├── /groups              (GET, POST)                   │    │
│  │  ├── /groups/join         (POST)                        │    │
│  │  ├── /groups/:id/*        (Various)                     │    │
│  │  ├── /contributions/*     (Various)                     │    │
│  │  ├── /loans/*             (Various)                     │    │
│  │  ├── /notifications/*     (Various)                     │    │
│  │  └── /admin-codes/*       (Various)                     │    │
│  └──────────────────┬────────────────────────────────────────┘    │
│  ┌──────────────────▼────────────────────────────────────────┐    │
│  │          Controllers (Business Logic)                    │    │
│  │  - authController.ts                                     │    │
│  │  - groupController.ts                                    │    │
│  │  - contributionController.ts                             │    │
│  │  - loanController.ts                                     │    │
│  └──────────────────┬────────────────────────────────────────┘    │
│  ┌──────────────────▼────────────────────────────────────────┐    │
│  │         Services (Features & Real-time)                  │    │
│  │  - notificationService.ts (Socket.IO)                    │    │
│  │  - Email notifications                                   │    │
│  │  - Real-time group updates                               │    │
│  └──────────────────┬────────────────────────────────────────┘    │
│  ┌──────────────────▼────────────────────────────────────────┐    │
│  │          PostgreSQL Database Driver (pg)                 │    │
│  │  - Connection pooling                                    │    │
│  │  - Query execution                                       │    │
│  └──────────────────┬────────────────────────────────────────┘    │
└─────────────────────┼──────────────────────────────────────────────┘
                      │ TCP Connection (Port 5432)
                      │
┌─────────────────────▼──────────────────────────────────────────────┐
│                    PostgreSQL Database                             │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  Tables:                                                 │    │
│  │  - users                 (user accounts & auth)          │    │
│  │  - groups                (tontine groups)                │    │
│  │  - memberships           (user group memberships)        │    │
│  │  - contributions         (money contributions)           │    │
│  │  - loans                 (loan requests)                 │    │
│  │  - notifications         (notification history)         │    │
│  │  - admin_codes           (group creation codes)          │    │
│  └───────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

## Communication Flow Example: User Login

```
1. User opens login.html
   ↓
2. User enters email & password, clicks "Login"
   ↓
3. JavaScript calls: AuthAPI.login(email, password)
   ↓
4. api.js builds request:
   - URL: http://localhost:5000/api/auth/login
   - Method: POST
   - Headers: { Content-Type: application/json }
   - Body: { email, password }
   ↓
5. HTTP POST sent to backend
   ↓
6. Express receives request at /api/auth
   ↓
7. CORS middleware allows request (frontend origin is allowed)
   ↓
8. authController.login() executes:
   - Validates email & password
   - Queries users table from PostgreSQL
   - Compares password with bcrypt hash
   - Generates JWT token
   - Returns token & user data
   ↓
9. Response sent back to frontend:
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": { "id": "123", "email": "user@example.com", "role": "member" }
   }
   ↓
10. api.js receives response
   ↓
11. TokenManager stores:
    - localStorage.authToken = token
    - localStorage.user = user data
   ↓
12. Frontend redirects to: user-dashboard.html
   ↓
13. Dashboard loads and API calls automatically include token:
    Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." }
   ↓
14. User is now authenticated!
```

## API Request Example: Create a Group

```javascript
// In user-dashboard.html JavaScript

const groupData = {
    name: "My Tontine Group",
    description: "We save together",
    maxMembers: 50,
    contributionAmount: 10000,
    currency: "RWF",
    meetingFrequency: "monthly"
};

// Call API
GroupsAPI.create(groupData)
    .then(response => {
        console.log('Group created:', response);
        // Redirect to group page
        window.location.href = 'tontine-groups-management.html?groupId=' + response.group.id;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to create group: ' + error.message);
    });

// Behind the scenes:
// 1. api.js builds request
// 2. Adds Bearer token from localStorage
// 3. Sends POST to http://localhost:5000/api/groups/create
// 4. Backend verifies JWT token
// 5. Backend creates group in PostgreSQL
// 6. Backend creates membership record
// 7. Backend emits Socket.IO event to admins
// 8. Response sent back to frontend
// 9. Real-time notification appears on admin dashboard
```

## Real-time Notifications Flow

```
1. Backend event occurs (e.g., new group request)
   ↓
2. notificationService.ts emits Socket.IO event:
   socket.emit('notification', { title, message, data })
   ↓
3. All connected clients receive event
   ↓
4. SocketManager.showNotification() displays toast
   ↓
5. User sees real-time notification instantly
   ↓
6. Notification stored in database for history
```

## Environment Variables

### Backend (.env)
```env
# Database connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/ekimina_db

# Security
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost

# Cloudinary (image storage)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Admin code for creating groups
ADMIN_GROUP_CODE=SECRET123
```

### Frontend (api.js - Already Set)
```javascript
API_CONFIG.BASE_URL = 'http://localhost:5000/api'
```

## Security Features

✅ **Authentication**
- JWT tokens with expiry
- Password hashing with bcryptjs
- Token stored in localStorage

✅ **Authorization**
- Role-based access (admin, leader, member)
- Protected endpoints
- Group membership verification

✅ **API Security**
- CORS whitelist for allowed origins
- Input validation
- SQL injection prevention (via pg driver)

✅ **Data Protection**
- Passwords never sent unencrypted
- Bearer token authentication
- HTTPS ready for production

## Deployment Checklist

When deploying to production:

### Backend
- [ ] Update DATABASE_URL to production database
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Deploy to Render.com, Heroku, AWS, etc.
- [ ] Update FRONTEND_URL to production domain

### Frontend
- [ ] Update API_CONFIG.BASE_URL to production backend URL
- [ ] Update SOCKET_URL if using WebSockets
- [ ] Enable HTTPS
- [ ] Deploy to Vercel, Netlify, GitHub Pages, etc.
- [ ] Update CORS allowed origins

## Testing Endpoints

Use this curl command to test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "Server is running",
  "timestamp": "2024-01-19T12:00:00.000Z"
}
```

Test login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Summary

✅ **Frontend is ready** - HTML pages with integrated API client
✅ **Backend is ready** - Express server with all endpoints
⏳ **Database setup** - Need to create PostgreSQL database
⏳ **Environment config** - Need to set .env variables
⏳ **Start backend** - Run `npm run dev`
⏳ **Test connection** - Verify login works

**Next Step:** Follow BACKEND_INTEGRATION_SETUP.md to complete the setup!
