# Site Administrator Dashboard - Backend Integration

## Summary of Changes

### 1. **Frontend API Integration (js/api.js)**

#### Added New Endpoint
```javascript
REJECT_GROUP: '/groups/:groupId/reject',  // Site admin: reject a group
```

#### Added New API Function
```javascript
async rejectGroup(groupId, reason) {
    // Site admin only: reject a pending group
    return API.post(API_CONFIG.ENDPOINTS.REJECT_GROUP.replace(':groupId', groupId), { reason });
}
```

### 2. **Site Administrator Dashboard (Site-adminstrator-dashboard.html)**

#### Added Authentication and Data Loading Functions
- **`logout()`** - Clears session and redirects to login
- **`loadAdminData()`** - Verifies user is logged in and has site_admin role
- **`loadPendingTontines()`** - Fetches pending tontines from backend (already existed)
- **`loadUsers()`** - Fetches all users from backend
- **`loadAllGroups()`** - Fetches all groups from backend
- **`updateStats()`** - Updates dashboard statistics with real data
- **`updatePendingTable()`** - Renders pending tontines table
- **`viewTontineDetails(tontineId)`** - Shows detailed tontine information

#### Updated Action Functions
- **`approveAdmin(id)`** → Now calls `GroupsAPI.approveGroup(id)` and reloads data
- **`rejectAdmin(id)`** → Now calls `GroupsAPI.rejectGroup(id, reason)` and reloads data

#### Features Implemented
✅ Logout functionality working
✅ Authentication check (site_admin only)
✅ Load pending tontines from backend
✅ Approve tontines via backend API
✅ Reject tontines via backend API with reason
✅ Real-time statistics (pending count, total groups, total users, active groups)
✅ View tontine details modal
✅ Auto-refresh after approve/reject

### 3. **Backend Changes (EKIMINA-SERVER)**

#### Updated groupRoutes.ts
- Added `rejectGroup` to imports
- Added route: `router.post('/:groupId/reject', authMiddleware, roleMiddleware(['site_admin']), rejectGroup);`

#### Existing Backend Functions Used
- `getPendingGroups()` - Returns all pending tontines
- `approveGroup(groupId)` - Approves a pending tontine, sets status='active'
- `rejectGroup(groupId, reason)` - Rejects a pending tontine, sets status='rejected', sends notification

## How It Works

### Admin Login Flow
1. Admin logs in with credentials (muhirejacques71@gmail.com or mukasapapy8@gmail.com)
2. System checks if user role is 'site_admin'
3. If not site_admin, redirects to user-dashboard with error message
4. If site_admin, loads dashboard with pending tontines

### Pending Tontines Display
1. Dashboard calls `loadPendingGroups()` on page load
2. Function calls backend API: `GET /api/groups/pending/all`
3. Backend returns all tontines with status='pending'
4. Frontend displays them in a table with Approve/Reject/View buttons

### Approve Tontine Flow
1. Admin clicks "Approve" button
2. Confirmation dialog appears
3. On confirmation, calls `GroupsAPI.approveGroup(tontineId)`
4. Backend updates tontine status to 'active'
5. Backend sends notification to group leader
6. Frontend reloads pending tontines list (approved one removed)
7. Group leader can now access leader-dashboard

### Reject Tontine Flow
1. Admin clicks "Reject" button
2. Prompt asks for rejection reason
3. Calls `GroupsAPI.rejectGroup(tontineId, reason)`
4. Backend updates tontine status to 'rejected'
5. Backend sends notification to group leader with reason
6. Frontend reloads pending tontines list (rejected one removed)

### View Details Flow
1. Admin clicks "View" button
2. System finds tontine in local data
3. Displays alert with all tontine details (name, leader, location, contribution amount, etc.)

## Testing Instructions

### 1. Test Admin Login
```
URL: http://localhost:5000 → Click login
Email: muhirejacques71@gmail.com
Password: Admin@Autho25
Expected: Redirects to Site-adminstrator-dashboard.html
```

### 2. Test Pending Tontines Load
```
Expected: Table shows all tontines with status='pending'
If no pending tontines: Shows "No pending tontines at the moment"
```

### 3. Test Approve Functionality
```
1. Click "Approve" on any pending tontine
2. Confirm in dialog
3. Expected: Success message, tontine removed from pending list
4. Login as the tontine creator
5. Expected: Can now access leader-dashboard.html
```

### 4. Test Reject Functionality
```
1. Click "Reject" on any pending tontine
2. Enter reason (e.g., "Incomplete information")
3. Expected: Success message, tontine removed from pending list
4. Tontine status set to 'rejected' in database
```

### 5. Test Logout
```
1. Click "Logout" in sidebar
2. Expected: Confirmation dialog
3. Confirm logout
4. Expected: Redirected to login.html, session cleared
```

## API Endpoints Used

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/groups/pending/all` | Get all pending tontines | site_admin |
| POST | `/api/groups/:groupId/approve` | Approve a tontine | site_admin |
| POST | `/api/groups/:groupId/reject` | Reject a tontine | site_admin |

## Database Changes

No schema changes required. Using existing columns:
- `tontine_groups.status` - Can be 'pending', 'active', 'rejected'
- All location fields already exist (country, province, district, sector, cell, village)

## Security Features

✅ Authentication required (JWT token)
✅ Role-based access control (site_admin only)
✅ Backend validates user role on each request
✅ Frontend redirects non-admins to appropriate dashboard
✅ Audit logging for all approve/reject actions

## Next Steps (Optional Enhancements)

1. **Statistics Dashboard** - Add real-time charts for user growth, group creation trends
2. **User Management Section** - View/edit/deactivate user accounts
3. **Financial Reports** - View total contributions, loans, balances
4. **Activity Log** - Display audit log from database instead of hardcoded data
5. **Email Notifications** - Send emails when tontines are approved/rejected
6. **Bulk Actions** - Approve/reject multiple tontines at once
7. **Search and Filter** - Search pending tontines by name, location, date

## Files Modified

### Frontend
- `Site-adminstrator-dashboard.html` - Added backend integration functions
- `js/api.js` - Added REJECT_GROUP endpoint and rejectGroup() function

### Backend
- `src/routes/groupRoutes.ts` - Added reject route

## Status

✅ **Complete** - Site administrator dashboard is fully integrated with backend
✅ **Tested** - All core functionality working (logout, load pending, approve, reject)
✅ **Deployed** - Backend running on http://localhost:5000

## Admin Credentials

**Account 1:**
- Email: muhirejacques71@gmail.com
- Password: Admin@Autho25
- Role: site_admin

**Account 2:**
- Email: mukasapapy8@gmail.com
- Password: Admin@Autho25
- Role: site_admin
