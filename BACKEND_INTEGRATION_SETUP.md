# Backend & Frontend Integration Setup Guide

## Overview
Your project has two parts:
- **Frontend**: HTML/CSS/JS in `c:\Users\user\frontend\`
- **Backend**: Node.js/Express/TypeScript in `c:\Users\user\EKIMINA-SERVER\`

## Current Status

✅ **Frontend**: API client (`api.js`) is already configured  
❌ **Backend**: Needs PostgreSQL database to run

## Step-by-Step Setup

### Step 1: Set Up PostgreSQL Database

#### Option A: Install PostgreSQL Locally (Recommended)
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user
4. Open pgAdmin (comes with PostgreSQL) or psql terminal

#### Option B: Use Docker (Alternative)
```bash
docker run --name ekimina-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ekimina_db -p 5432:5432 -d postgres
```

### Step 2: Create the Database

Using pgAdmin or psql:
```sql
CREATE DATABASE ekimina_db;
```

### Step 3: Update Backend Environment Variables

Edit `c:\Users\user\EKIMINA-SERVER\.env`:

```env
# Database (update with your actual credentials)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ekimina_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost

# Cloudinary (optional for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Code (for creating groups)
ADMIN_GROUP_CODE=SECRET123
```

### Step 4: Run Database Migrations

```bash
cd c:\Users\user\EKIMINA-SERVER
npm run migrate
```

### Step 5: Start the Backend Server

```bash
cd c:\Users\user\EKIMINA-SERVER
npm run dev
```

Expected output:
```
✓ Database connected successfully
🚀 Server running on http://localhost:5000
🔌 WebSocket notifications enabled
🔌 API endpoints:
   Auth: /api/auth/*
   Groups: /api/groups/*
   Contributions: /api/contributions/*
   Loans: /api/loans/*
   Notifications: /api/notifications/*
```

### Step 6: Verify Frontend API Configuration

Check `c:\Users\user\frontend\js\api.js`:
- Base URL: `http://localhost:5000/api` ✅

The frontend is already configured to connect to your backend!

### Step 7: Test the Connection

In your browser console, run:
```javascript
// Check if API is configured
console.log(API_CONFIG.BASE_URL);

// Try a health check
API.get('/health').then(data => console.log('Backend is running:', data));
```

## API Endpoints Available

All endpoints require authentication (JWT token in `Authorization` header):

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get current user profile

### Groups (Tontines)
- `GET /api/groups` - List all groups
- `POST /api/groups/create` - Create new group
- `POST /api/groups/join` - Join existing group
- `GET /api/groups/:groupId` - Get group details
- `GET /api/groups/:groupId/pending-requests` - Get pending member requests
- `POST /api/groups/approve-member` - Approve member request
- `POST /api/groups/remove-member` - Remove member

### Contributions
- `GET /api/contributions` - List contributions
- `POST /api/contributions` - Make contribution
- `GET /api/contributions/my-contributions` - Get user's contributions
- `POST /api/contributions/:id/approve` - Approve contribution

### Loans
- `GET /api/loans` - List loans
- `POST /api/loans/request` - Request loan
- `GET /api/loans/my-loans` - Get user's loans
- `POST /api/loans/:id/approve` - Approve loan

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread` - Get unread notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all as read

## Troubleshooting

### Backend won't start: "Database connection failed"
- Make sure PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Check your PostgreSQL username/password

### CORS errors
- Ensure `FRONTEND_URL` in backend .env matches your frontend URL
- Frontend should be on `http://localhost` (no specific port for static HTML)

### JWT token errors
- Make sure you're logged in before accessing protected endpoints
- Check that token is stored in `localStorage.authToken`

### WebSocket (real-time notifications) not working
- Ensure Socket.IO is properly initialized
- Check browser console for connection errors

## Development Workflow

1. **Terminal 1** - Start Backend:
   ```bash
   cd c:\Users\user\EKIMINA-SERVER
   npm run dev
   ```

2. **Terminal 2** - Start Frontend (if using a server):
   ```bash
   # If you have a simple HTTP server
   cd c:\Users\user\frontend
   python -m http.server 8000
   # Then open http://localhost:8000
   ```
   
   **Or** simply open HTML files directly:
   ```
   file:///c:/Users/user/frontend/login.html
   ```

## Next Steps

1. ✅ Set up PostgreSQL database
2. ✅ Update `.env` with your database credentials
3. ✅ Run migrations
4. ✅ Start backend server
5. ✅ Test login/register
6. ✅ Verify all features work
7. ✅ Deploy when ready

## Deployment

When deploying to production:
1. Deploy backend to Render.com, Heroku, or similar
2. Update frontend `API_CONFIG.BASE_URL` to your production backend URL
3. Update backend `FRONTEND_URL` to your production frontend URL
4. Use environment variables instead of hardcoded URLs
5. Enable HTTPS for all endpoints
