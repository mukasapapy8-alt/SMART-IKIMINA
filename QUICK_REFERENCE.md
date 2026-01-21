# Quick Reference Card

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Database
```bash
# Install PostgreSQL from https://www.postgresql.org/download/windows/
# Create database in pgAdmin or psql:
CREATE DATABASE ekimina_db;

# Update C:\Users\user\EKIMINA-SERVER\.env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ekimina_db
```

### Step 2: Start Backend
```bash
cd C:\Users\user\EKIMINA-SERVER
npm run migrate
npm run dev
```

Expected output:
```
✓ Database connected successfully
🚀 Server running on http://localhost:5000
```

### Step 3: Open Frontend
```
file:///C:/Users/user/frontend/login.html
```

---

## 📁 Important Files

| File | Location | Purpose |
|------|----------|---------|
| API Client | `frontend/js/api.js` | All API functions |
| Backend Server | `EKIMINA-SERVER/src/index.ts` | Express app |
| Database | Local PostgreSQL | Data storage |
| Environment | `EKIMINA-SERVER/.env` | Configuration |

---

## 🔗 API Base URL

**Development:** `http://localhost:5000/api`  
**Production:** Update when deploying

---

## 🔑 Key Functions in api.js

### Authentication
```javascript
AuthAPI.login(email, password)
AuthAPI.register(userData)
AuthAPI.getProfile()
```

### Groups
```javascript
GroupsAPI.getAll()
GroupsAPI.create(groupData)
GroupsAPI.joinGroup(groupCode)
GroupsAPI.getPendingRequests(groupId)
```

### Contributions
```javascript
ContributionsAPI.create(contributionData)
ContributionsAPI.getMyContributions()
ContributionsAPI.approve(contributionId)
```

### Loans
```javascript
LoansAPI.request(loanData)
LoansAPI.getMyLoans()
LoansAPI.approve(loanId)
```

### Notifications
```javascript
NotificationsAPI.getAll()
NotificationsAPI.getUnread()
SocketManager.connect()
```

---

## 🧪 Test Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/health \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### In Browser Console
```javascript
// Check API config
console.log(API_CONFIG.BASE_URL)

// Test connection
API.get('/health').then(d => console.log('✓ Connected', d))

// Check authentication
console.log(TokenManager.getToken())
console.log(TokenManager.getUser())
```

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| "Database connection failed" | PostgreSQL not running or wrong .env |
| "CORS error" | Backend CORS not configured for frontend URL |
| "Token not found" | User not logged in, login first |
| "Port 5000 already in use" | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| "Cannot find module" | Run `npm install` in backend folder |

---

## 📊 Frontend Pages

| Page | URL | Purpose |
|------|-----|---------|
| Login | `login.html` | Register & Login |
| Dashboard | `user-dashboard.html` | Main user area |
| Leader | `leader-dashboard.html` | Group leader area |
| Admin | `Site-adminstrator-dashboard.html` | Admin area |
| Groups | `tontine-groups-management.html` | Manage groups |
| Home | `ikimina.html` | Landing page |

---

## 🔒 Authentication Flow

```
1. User registers/logs in
   ↓
2. Backend validates & sends JWT token
   ↓
3. Frontend stores: localStorage.authToken
   ↓
4. API automatically adds: Authorization: Bearer {token}
   ↓
5. User stays logged in until logout
```

---

## 📱 Real-time Notifications

```
1. Backend event occurs
   ↓
2. Socket.IO emits event
   ↓
3. Frontend receives instantly
   ↓
4. Toast notification appears
```

---

## 🛠️ Development Workflow

**Terminal 1 - Backend:**
```bash
cd C:\Users\user\EKIMINA-SERVER
npm run dev
```

**Terminal 2 - Frontend (Optional):**
```bash
cd C:\Users\user\frontend
python -m http.server 8000
# Visit http://localhost:8000
```

---

## 📦 Dependencies

**Backend:**
- express - Web framework
- pg - PostgreSQL driver
- jsonwebtoken - JWT tokens
- bcryptjs - Password hashing
- socket.io - Real-time notifications
- cors - Cross-origin requests

**Frontend:**
- Vanilla JavaScript (no framework needed!)
- Socket.IO client library (loaded from CDN)
- Font Awesome icons (loaded from CDN)

---

## 🌐 Deployed URLs

When deploying:

```javascript
// Update in api.js
API_CONFIG.BASE_URL = 'https://your-backend.com/api'
```

**Example:**
- Backend: `https://ekimina-backend.onrender.com`
- Frontend: `https://ekimina-frontend.vercel.app`

---

## ✅ Checklist

- [ ] PostgreSQL installed
- [ ] Database created: `ekimina_db`
- [ ] `.env` file configured
- [ ] Backend dependencies installed: `npm install`
- [ ] Database migrated: `npm run migrate`
- [ ] Backend running: `npm run dev`
- [ ] Frontend accessible: `login.html`
- [ ] Can login: ✓
- [ ] Real-time notifications working: ✓
- [ ] All features tested: ✓

---

## 📚 Documentation Files

- `BACKEND_INTEGRATION_SETUP.md` - Detailed setup guide
- `INTEGRATION_CHECKLIST.md` - Complete checklist
- `ARCHITECTURE_OVERVIEW.md` - System architecture
- `QUICK_REFERENCE.md` - This file

---

## 💡 Tips

1. Always check browser console for errors
2. Always check backend terminal for logs
3. Use `require('auth')` for protected pages
4. Token expires every 7 days, user must re-login
5. Save tokens securely, never expose JWT_SECRET
6. Test on localhost before deploying

---

## 🎯 Next Steps

1. ✅ Read BACKEND_INTEGRATION_SETUP.md
2. ✅ Set up PostgreSQL
3. ✅ Configure .env
4. ✅ Start backend
5. ✅ Test login flow
6. ✅ Explore features
7. ✅ Fix any issues
8. ✅ Deploy to production

---

**Questions?** Check the documentation files or backend API_DOCUMENTATION.md
