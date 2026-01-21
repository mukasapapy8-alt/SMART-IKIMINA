# 🎬 Step-by-Step Visual Setup Guide

## Visual Walkthrough

### Part 1: PostgreSQL Installation (5 minutes)

```
┌─────────────────────────────────────────┐
│ Step 1: Download PostgreSQL             │
├─────────────────────────────────────────┤
│ Visit: postgresql.org/download/windows  │
│ Click "Download" button                 │
│ Run the installer (postgresql-15.exe)   │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Step 2: Run Installer                   │
├─────────────────────────────────────────┤
│ Click "Next" through setup              │
│ ✓ Install PostgreSQL Server             │
│ ✓ Install pgAdmin 4                     │
│ ✓ Install Command Line Tools            │
│ When asked: Set password for postgres   │
│ (Remember this password!)               │
└─────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Step 3: Verify Installation             │
├─────────────────────────────────────────┤
│ Open Command Prompt                     │
│ Type: psql --version                    │
│ Should show: psql (PostgreSQL) 15.x     │
└─────────────────────────────────────────┘
                   │
                   ▼
           Installation Complete ✓
```

### Part 2: Create Database (2 minutes)

```
┌──────────────────────────────────────────┐
│ Option A: Using pgAdmin (Easiest)        │
├──────────────────────────────────────────┤
│                                          │
│ 1. Open pgAdmin (starts automatically)  │
│ 2. Right-click "Databases"              │
│ 3. Click "Create" > "Database"          │
│ 4. Name: ekimina_db                     │
│ 5. Owner: postgres                      │
│ 6. Click "Save"                         │
│                                          │
└──────────────────────────────────────────┘

        OR

┌──────────────────────────────────────────┐
│ Option B: Using Command Line             │
├──────────────────────────────────────────┤
│                                          │
│ 1. Open Command Prompt                  │
│ 2. Run: psql -U postgres                │
│ 3. Enter password (from step 2)         │
│ 4. Run: CREATE DATABASE ekimina_db;     │
│ 5. Run: \l (to verify)                  │
│ 6. Type: \q (to exit)                   │
│                                          │
└──────────────────────────────────────────┘

           Database Created ✓
```

### Part 3: Configure Backend (3 minutes)

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Open .env File                                  │
├─────────────────────────────────────────────────────────┤
│ Location: C:\Users\user\EKIMINA-SERVER\.env             │
│ Open with: Notepad (or VS Code)                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Step 2: Update Configuration                            │
├─────────────────────────────────────────────────────────┤
│ Find these lines and update:                            │
│                                                         │
│ DATABASE_URL=                                          │
│   postgresql://postgres:YOUR_PASSWORD@localhost:5432  │
│                              ⬆️                        │
│                        Your password!                  │
│                                                         │
│ Example:                                               │
│ DATABASE_URL=postgresql://postgres:mypassword123@    │
│              localhost:5432/ekimina_db                │
│                                                         │
│ Save the file (Ctrl+S)                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
          Configuration Complete ✓
```

### Part 4: Start Backend (2 minutes)

```
┌──────────────────────────────────────────┐
│ Step 1: Open Command Prompt              │
├──────────────────────────────────────────┤
│ Press: Win + R                           │
│ Type: cmd                                │
│ Press: Enter                             │
└──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ Step 2: Navigate to Backend              │
├──────────────────────────────────────────┤
│ Type: cd C:\Users\user\EKIMINA-SERVER    │
│ Press: Enter                             │
└──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ Step 3: Run Migrations                   │
├──────────────────────────────────────────┤
│ Type: npm run migrate                    │
│ Press: Enter                             │
│ Wait for: "Migrations complete"          │
└──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ Step 4: Start Server                     │
├──────────────────────────────────────────┤
│ Type: npm run dev                        │
│ Press: Enter                             │
│                                          │
│ You should see:                          │
│ ✓ Database connected successfully        │
│ 🚀 Server running on                     │
│    http://localhost:5000                 │
│ 🔌 WebSocket notifications enabled       │
└──────────────────────────────────────────┘
              ✓ Backend Ready!
```

### Part 5: Open Frontend (1 minute)

```
┌──────────────────────────────────────────────┐
│ Option A: Direct File (Easiest)              │
├──────────────────────────────────────────────┤
│ 1. Press: Win + E (File Explorer)           │
│ 2. Navigate: C:\Users\user\frontend          │
│ 3. Double-click: login.html                  │
│ 4. Opens in default browser                  │
│                                              │
│ Your frontend is now connected to backend! ✓ │
└──────────────────────────────────────────────┘

        OR

┌──────────────────────────────────────────────┐
│ Option B: With Local Server                  │
├──────────────────────────────────────────────┤
│ 1. Open Command Prompt (new window)         │
│ 2. cd C:\Users\user\frontend                │
│ 3. python -m http.server 8000               │
│ 4. Open: http://localhost:8000              │
└──────────────────────────────────────────────┘
```

### Part 6: Test & Verify (2 minutes)

```
┌────────────────────────────────────────────────┐
│ Test 1: Can You See the Login Page?            │
├────────────────────────────────────────────────┤
│ ✓ Yes → Continue to Test 2                    │
│ ✗ No  → Check browser URL is correct          │
└────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────┐
│ Test 2: Can You Register a New Account?        │
├────────────────────────────────────────────────┤
│ 1. Click "Register" link                      │
│ 2. Fill in: Email, Password, Full Name        │
│ 3. Click "Register"                           │
│ 4. Should see: Success message or error       │
│                                               │
│ Check browser console for errors (F12)        │
│ ✓ Registered → Continue to Test 3             │
│ ✗ Error    → Check backend terminal           │
└────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────┐
│ Test 3: Can You Login?                         │
├────────────────────────────────────────────────┤
│ 1. Fill in: Email, Password                   │
│ 2. Click "Login"                              │
│ 3. Should redirect to dashboard               │
│                                               │
│ ✓ Logged in → Success! ✓✓✓                   │
│ ✗ Error   → Check backend logs                │
└────────────────────────────────────────────────┘
```

---

## Troubleshooting Flowchart

```
Something not working?

         │
         ▼
    Backend Error?
    /          \
   /            \
  Y              N
  │              │
  ▼              ▼
Check            Frontend Error?
terminal        /           \
output         /             \
  │           Y               N
  │           │               │
  ▼           ▼               ▼
Search      Check        Check
error       browser      network
message     console      connection
  │           │             │
  ▼           ▼             ▼
 Fix        Look at    Is backend
error       error      running?
  │         code        /      \
  └─────────┘          Y        N
      │                │        │
      ▼                ▼        ▼
   Retry           Check      Start
              Network        backend
               tab
```

---

## Quick Reference Commands

### For Backend

```bash
# In: C:\Users\user\EKIMINA-SERVER

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run migrations (create tables)
npm run migrate

# Start development server
npm run dev

# Start production server
npm start
```

### For Database

```bash
# Open PostgreSQL CLI
psql -U postgres

# List databases
\l

# Connect to database
\c ekimina_db

# List tables
\dt

# Execute SQL query
SELECT * FROM users;

# Exit
\q
```

---

## File Locations Reference

```
Your Computer
│
├── C:\Users\user\
│   │
│   ├── frontend/                           ← Frontend code
│   │   ├── js/api.js                       ← API Client
│   │   ├── login.html                      ← Start here
│   │   ├── user-dashboard.html             ← After login
│   │   ├── leader-dashboard.html
│   │   ├── Site-adminstrator-dashboard.html
│   │   └── QUICK_REFERENCE.md              ← Documentation
│   │
│   ├── EKIMINA-SERVER/                     ← Backend code
│   │   ├── src/
│   │   │   ├── index.ts                    ← Main server
│   │   │   ├── routes/                     ← API endpoints
│   │   │   ├── controllers/                ← Logic
│   │   │   └── config/database.ts          ← DB config
│   │   ├── .env                            ← EDIT THIS! (Step 3)
│   │   ├── package.json
│   │   └── dist/                           ← Compiled code
│   │
│   └── PostgreSQL/                         ← Database
│       └── ekimina_db                      ← Your database
│
└── (Where PostgreSQL stores data)
```

---

## Success Indicators

When everything is working, you'll see:

### Backend Terminal
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

### Browser Console (F12)
```
API Config loaded. Base URL: http://localhost:5000/api
Connected to notifications
```

### Application
```
✓ Can see login page
✓ Can register new account
✓ Can login with email/password
✓ Can see dashboard
✓ Can see profile information
✓ Can create/join groups
✓ Can make contributions
✓ Real-time notifications appear
```

---

## Estimated Setup Time

| Step | Time |
|------|------|
| Install PostgreSQL | 5 min |
| Create Database | 2 min |
| Configure .env | 2 min |
| Run Migrations | 1 min |
| Start Backend | 1 min |
| Open Frontend | 1 min |
| Test Login | 2 min |
| **Total** | **~14 min** |

---

**You're all set! Follow these steps and your system will be running! 🚀**
