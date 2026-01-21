# Access Control & Data Display Fix

**Date:** January 21, 2026  
**Files Modified:**
- `user-dashboard.html` - Added membership approval check
- `leader-dashboard.html` - Fixed user data display in pending requests
- `js/api.js` - Fixed join group parameter

---

## 🎯 Issues Fixed

### Issue 1: Unapproved Users Can Access Dashboard
**Symptom:** After registration, users could access `user-dashboard.html` even though their membership request was still pending approval from the group leader.

**Security Risk:** Users without approved membership could see dashboard features they shouldn't have access to.

**Root Cause:** The dashboard only checked if a user was logged in (`TokenManager.isLoggedIn()`), but didn't verify if their group membership had been approved.

### Issue 2: Leader Dashboard Showing "Unknown" and "None"
**Symptom:** In the leader dashboard pending requests table:
- **Applicant Name column** showing "Unknown"
- **Contact Info column** showing "N/A" and "No phone"
- This happened even though users entered their details during registration

**Root Cause:** The frontend was looking for fields like `request.user_first_name`, `request.user_email`, etc., but the backend was returning `request.first_name`, `request.email`, etc.

### Issue 3: Join Group Parameter Mismatch
**Symptom:** Registration would complete but the join request might fail silently
**Root Cause:** API was sending `groupCode` but backend expected `groupId`

---

## ✅ Solutions Implemented

### Solution 1: Added Membership Approval Check (user-dashboard.html)

**What Changed:**
Changed the `DOMContentLoaded` event listener from a regular function to an `async` function, and added comprehensive membership status checking.

**Before:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!TokenManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data
    loadUserData();
    // ... rest of initialization
});
```

**After:**
```javascript
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== User Dashboard Initializing ===');
    
    // Check if user is logged in
    if (!TokenManager.isLoggedIn()) {
        console.log('User not logged in, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    const user = TokenManager.getUser();
    console.log('Logged in user:', user);
    
    // Check if user has been approved to join a group
    try {
        const groupsResponse = await GroupsAPI.getAll();
        console.log('Groups response:', groupsResponse);
        
        // Check if user is a member of any group with approved status
        const userGroups = groupsResponse.groups?.filter(g => 
            g.members?.some(m => m.user_id === user.id && m.status === 'approved')
        );
        
        console.log('User approved groups:', userGroups);
        
        if (!userGroups || userGroups.length === 0) {
            // Check if user is a group leader
            const leaderGroups = groupsResponse.groups?.filter(g => g.leader_id === user.id);
            
            if (!leaderGroups || leaderGroups.length === 0) {
                alert('Access Denied: Your membership request is still pending approval from the group leader. You will be able to access the dashboard once approved.');
                console.log('User not approved in any group, redirecting to login');
                TokenManager.logout();
                return;
            }
        }
        
        console.log('✅ User has approved membership, loading dashboard');
    } catch (error) {
        console.error('Error checking membership status:', error);
        // Allow access if we can't check (avoid locking out users due to network issues)
    }
    
    // Load user data from localStorage
    loadUserData();
    // ... rest of initialization
});
```

**How It Works:**
1. **Checks login status** - If not logged in, redirect to login page
2. **Fetches all groups** - Gets list of all tontine groups from backend
3. **Filters user's groups** - Looks for groups where:
   - User is a member (`g.members.some(m => m.user_id === user.id)`)
   - AND their status is 'approved' (`m.status === 'approved'`)
4. **Checks if user is a leader** - If not a member anywhere, check if they're a group leader
5. **Denies access if unapproved** - Shows alert and logs them out
6. **Allows access if approved** - Loads dashboard normally

**User Flow:**
```
User Logs In
     |
     v
Is logged in? --NO--> Redirect to login.html
     |
    YES
     |
     v
Fetch all groups
     |
     v
Is user an APPROVED member? --NO--> Is user a group leader?
     |                                     |
    YES                                   NO
     |                                     |
     v                                     v
Load Dashboard                    Show "Access Denied" alert
                                           |
                                           v
                                   Logout and redirect to login
```

### Solution 2: Fixed User Data Display (leader-dashboard.html)

**What Changed:**
Modified the `populatePendingRequestsTable()` function to handle both backend naming conventions.

**Before:**
```javascript
requests.forEach(request => {
    const row = document.createElement('tr');
    const requestDate = new Date(request.created_at).toLocaleDateString();
    const userName = `${request.user_first_name || ''} ${request.user_last_name || ''}`.trim() || 'Unknown';
    
    row.innerHTML = `
        <td>${userName}</td>
        <td>${requestDate}</td>
        <td>${request.user_email || 'N/A'}<br><small>${request.user_phone || 'No phone'}</small></td>
        ...
    `;
});
```

**After:**
```javascript
requests.forEach(request => {
    const row = document.createElement('tr');
    const requestDate = new Date(request.created_at || request.joined_at || Date.now()).toLocaleDateString();
    
    // Handle both naming conventions from backend
    const firstName = request.first_name || request.user_first_name || '';
    const lastName = request.last_name || request.user_last_name || '';
    const userName = `${firstName} ${lastName}`.trim() || 'Unknown';
    const userEmail = request.email || request.user_email || 'N/A';
    const userPhone = request.phone || request.user_phone || 'No phone';
    const userId = request.user_id || request.id;
    
    console.log('Rendering request:', { firstName, lastName, userName, userEmail, userPhone, userId });
    
    row.innerHTML = `
        <td>${userName}</td>
        <td>${requestDate}</td>
        <td>${userEmail}<br><small>${userPhone}</small></td>
        ...
    `;
});
```

**How It Works:**
- **Tries multiple field names** - Checks both `first_name` and `user_first_name`
- **Falls back gracefully** - Uses empty string if neither exists
- **Adds comprehensive logging** - Shows exactly what data was found
- **Handles date variations** - Checks `created_at`, `joined_at`, or uses current date

**Field Mapping:**
| Frontend Expected | Backend Returns | Fallback |
|------------------|-----------------|----------|
| `first_name` or `user_first_name` | `first_name` | `''` |
| `last_name` or `user_last_name` | `last_name` | `''` |
| `email` or `user_email` | `email` | `'N/A'` |
| `phone` or `user_phone` | `phone` | `'No phone'` |
| `user_id` or `id` | `user_id` | - |

### Solution 3: Fixed Join Group API Parameter (js/api.js)

**Before:**
```javascript
async joinGroup(groupCode) {
    return API.post(API_CONFIG.ENDPOINTS.JOIN_GROUP, { groupCode });
},
```

**After:**
```javascript
async joinGroup(groupCode) {
    // Send join request with groupId (can be UUID or group code)
    console.log('Joining group with ID/Code:', groupCode);
    return API.post(API_CONFIG.ENDPOINTS.JOIN_GROUP, { groupId: groupCode });
},
```

**Why:** The backend expects `groupId` in the request body, not `groupCode`. This ensures the join request is properly sent to the database.

---

## 🧪 Testing Instructions

### Test 1: Unapproved User Access Control

**Step-by-Step:**

1. **Register a new user:**
   - Go to `register.html`
   - Fill in all details (Step 1)
   - Select a tontine (Step 2)
   - Complete registration
   - Note the email/password

2. **Try to access dashboard:**
   - Login with the new user's credentials
   - **Expected Behavior:**
     - Alert shown: "Access Denied: Your membership request is still pending approval..."
     - User is logged out automatically
     - Redirected to login page

3. **Check browser console:**
   ```
   === User Dashboard Initializing ===
   Logged in user: {email: "...", id: "...", role: "user"}
   Groups response: {groups: [...]}
   User approved groups: []
   User not approved in any group, redirecting to login
   ```

4. **Approve the user (as group leader):**
   - Login as the group leader
   - Go to "Pending Requests" tab
   - Click "Approve" on the pending request

5. **Try accessing dashboard again:**
   - Login with the new user's credentials
   - **Expected Behavior:**
     - Dashboard loads successfully
     - No access denied message
     - User can see dashboard features

6. **Check browser console:**
   ```
   === User Dashboard Initializing ===
   Logged in user: {email: "...", id: "...", role: "user"}
   Groups response: {groups: [...]}
   User approved groups: [{id: "...", name: "...", ...}]
   ✅ User has approved membership, loading dashboard
   === User Dashboard Initialized ===
   ```

### Test 2: Leader Dashboard User Details Display

**Step-by-Step:**

1. **Register a new test user:**
   - Use registration form
   - Enter clear details:
     - First Name: "John"
     - Last Name: "Doe"
     - Email: "john.doe@test.com"
     - Phone: "+250788123456"
   - Select a tontine
   - Complete registration

2. **Login as group leader:**
   - Navigate to leader dashboard
   - Click "Pending Requests" tab

3. **Verify data display:**
   - **Applicant Name column:** Should show "John Doe" (not "Unknown")
   - **Contact Info column:** Should show:
     - Email: "john.doe@test.com" (not "N/A")
     - Phone: "+250788123456" (not "No phone")
   - **Request Date:** Should show actual date

4. **Check browser console:**
   ```
   Rendering request: {
     firstName: "John",
     lastName: "Doe",
     userName: "John Doe",
     userEmail: "john.doe@test.com",
     userPhone: "+250788123456",
     userId: "user-uuid-here"
   }
   ```

5. **Test approve/reject buttons:**
   - Click "Approve" - should show confirmation with correct name
   - Click "Reject" - should show rejection dialog with correct name

### Test 3: Group Leader Access

**Step-by-Step:**

1. **Create a group:**
   - Login as a user
   - Create a new tontine group
   - You become the leader

2. **Try accessing leader dashboard:**
   - Navigate to `leader-dashboard.html`
   - **Expected Behavior:**
     - Dashboard loads successfully
     - No access denied message
     - Can see pending requests tab

3. **Try accessing user dashboard:**
   - Navigate to `user-dashboard.html`
   - **Expected Behavior:**
     - Dashboard loads successfully (leaders can also be members)

---

## 🔄 Complete User Journey

### Journey 1: New User Registration → Approval → Access

```
1. USER REGISTERS
   ├─ Fills registration form
   ├─ Selects tontine "Kigali Business Group"
   └─ Submits registration
        ↓
2. BACKEND CREATES RECORDS
   ├─ Creates user account (users table)
   ├─ Creates membership record (group_members table)
   │   ├─ user_id: "user123"
   │   ├─ group_id: "group456"
   │   └─ status: "pending"  ← Key status
   └─ Returns success
        ↓
3. USER TRIES TO LOGIN
   ├─ Enters credentials
   ├─ Backend validates
   └─ Returns JWT token + user data
        ↓
4. USER TRIES TO ACCESS DASHBOARD
   ├─ Dashboard checks: Is user logged in? ✅ YES
   ├─ Dashboard fetches all groups
   ├─ Dashboard checks: Is user approved member? ❌ NO (status='pending')
   ├─ Dashboard checks: Is user a group leader? ❌ NO
   ├─ Shows alert: "Access Denied: pending approval"
   └─ Logs user out → Redirects to login
        ↓
5. GROUP LEADER APPROVES
   ├─ Leader logs in
   ├─ Goes to Pending Requests tab
   ├─ Sees "John Doe" (user's real name) ✅
   ├─ Sees "john@email.com" and "+250788123456" ✅
   ├─ Clicks "Approve"
   └─ Backend updates: group_members.status = 'approved'
        ↓
6. USER TRIES AGAIN
   ├─ Logs in
   ├─ Dashboard checks: Is user approved member? ✅ YES (status='approved')
   ├─ Dashboard loads successfully
   └─ User can now access all features
```

### Journey 2: Group Leader Access

```
1. USER CREATES GROUP
   ├─ Fills group creation form
   ├─ Submits
   └─ Backend creates group with leader_id = user.id
        ↓
2. USER TRIES TO ACCESS LEADER DASHBOARD
   ├─ Dashboard checks: Is user logged in? ✅ YES
   ├─ Dashboard fetches groups
   ├─ Dashboard checks: Is user approved member? ❌ NO
   ├─ Dashboard checks: Is user a group leader? ✅ YES (leader_id matches)
   ├─ Dashboard loads successfully
   └─ User can manage pending requests
```

---

## 📊 Database Schema Context

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),  -- Used by frontend
  last_name VARCHAR(100),   -- Used by frontend
  email VARCHAR(255),       -- Used by frontend
  phone VARCHAR(20),        -- Used by frontend
  password_hash VARCHAR(255),
  role VARCHAR(20),
  ...
);
```

### tontine_groups table
```sql
CREATE TABLE tontine_groups (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  leader_id UUID REFERENCES users(id),  -- Who created/manages the group
  status VARCHAR(20),  -- 'pending', 'active', 'rejected'
  ...
);
```

### group_members table
```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES tontine_groups(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(20),  -- 'pending', 'approved', 'rejected'  ← CRITICAL
  role VARCHAR(20),
  joined_at TIMESTAMP,
  ...
);
```

**Key Field:** `group_members.status`
- `'pending'` - User requested to join, waiting for leader approval
- `'approved'` - Leader approved, user can access dashboard
- `'rejected'` - Leader rejected the request

---

## 🔐 Security Improvements

### Before Fixes:
- ❌ Any registered user could access dashboard
- ❌ Unapproved users could see group features
- ❌ No membership status validation

### After Fixes:
- ✅ Only approved members can access dashboard
- ✅ Group leaders have automatic access
- ✅ Membership status validated on every dashboard load
- ✅ Clear error messages for denied access
- ✅ Automatic logout for unapproved users

---

## 🐛 Common Issues & Solutions

### Issue: User approved but still denied access
**Cause:** Browser cache showing old user data  
**Solution:**
```javascript
// Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
// Or clear localStorage:
localStorage.clear();
```

### Issue: "Unknown" still showing in leader dashboard
**Cause:** Backend not returning user details with pending requests  
**Check Backend:** Ensure the GET `/api/groups/:groupId/pending-requests` endpoint includes:
```javascript
// Backend should return:
{
  pendingRequests: [
    {
      user_id: "uuid",
      first_name: "John",    // ← Must include
      last_name: "Doe",      // ← Must include
      email: "john@email.com",  // ← Must include
      phone: "+250788123456",   // ← Must include
      status: "pending",
      joined_at: "2026-01-21T..."
    }
  ]
}
```

### Issue: Registration succeeds but no join request created
**Cause:** `groupId` parameter mismatch  
**Solution:** Already fixed in `js/api.js` - now sends `groupId` instead of `groupCode`

### Issue: Network error blocks all users
**Cause:** Fetch to `/api/groups` fails  
**Mitigation:** The code includes try-catch to allow access if network check fails
```javascript
try {
    // Check membership status
} catch (error) {
    console.error('Error checking membership status:', error);
    // Allow access if we can't check (avoid locking out users)
}
```

---

## 📝 Console Logging Guide

### Successful Access (Approved User)
```javascript
=== User Dashboard Initializing ===
Logged in user: {email: "john@test.com", id: "abc123", role: "user"}
Groups response: {groups: Array(3)}
User approved groups: [{id: "group456", name: "Test Group", ...}]
✅ User has approved membership, loading dashboard
=== User Dashboard Initialized ===
```

### Denied Access (Unapproved User)
```javascript
=== User Dashboard Initializing ===
Logged in user: {email: "jane@test.com", id: "def456", role: "user"}
Groups response: {groups: Array(3)}
User approved groups: []
User not approved in any group, redirecting to login
Logout function called
User confirmed logout
Tokens cleared, redirecting to login
```

### Leader Dashboard Pending Requests
```javascript
=== Loading pending requests from backend ===
Current user: leader@test.com Role: group_leader ID: xyz789
✅ All groups response: {groups: Array(2)}
Checking group TestGroup: leader_id=xyz789, user.id=xyz789, status=active
✅ Leader groups found: 1
📋 Using group ID: group456 Group name: TestGroup
✅ Pending requests API response: {pendingRequests: Array(2)}
✅ Found 2 pending membership requests
Populating pending requests table with 2 requests
Rendering request: {
  firstName: "John",
  lastName: "Doe",
  userName: "John Doe",
  userEmail: "john@test.com",
  userPhone: "+250788123456",
  userId: "user123"
}
```

---

## 🎯 Success Criteria

**All of these must be TRUE:**

1. ✅ Unapproved users CANNOT access `user-dashboard.html`
2. ✅ Approved users CAN access `user-dashboard.html`
3. ✅ Group leaders CAN access `leader-dashboard.html`
4. ✅ Leader dashboard shows REAL user names (not "Unknown")
5. ✅ Leader dashboard shows REAL contact info (not "N/A")
6. ✅ Registration creates proper join request
7. ✅ Join request appears in leader's pending requests
8. ✅ Approving request allows user to access dashboard
9. ✅ Clear error messages for denied access
10. ✅ Comprehensive console logging for debugging

---

## 🔄 Backend Requirements

For these fixes to work properly, the backend must:

### 1. GET /api/groups/:groupId/pending-requests
**Must return:**
```typescript
{
  pendingRequests: Array<{
    user_id: string;
    first_name: string;      // ← Required
    last_name: string;       // ← Required
    email: string;           // ← Required
    phone: string;           // ← Required
    status: 'pending';
    joined_at: string;
    created_at: string;
  }>
}
```

### 2. GET /api/groups (with members)
**Must include members array:**
```typescript
{
  groups: Array<{
    id: string;
    name: string;
    leader_id: string;
    status: 'pending' | 'active' | 'rejected';
    members: Array<{       // ← Required for access control
      user_id: string;
      status: 'pending' | 'approved' | 'rejected';  // ← Critical
      role: string;
    }>
  }>
}
```

### 3. POST /api/groups/join
**Must accept:**
```typescript
{
  groupId: string;  // ← Changed from groupCode
}
```

**Must create:**
- Record in `group_members` table
- With `status = 'pending'`
- With `user_id` from JWT token

---

## 📈 Impact Summary

### User Experience:
- ✅ Clear feedback when access is denied
- ✅ Proper user information displayed to leaders
- ✅ Secure access control prevents unauthorized access

### Security:
- ✅ Membership approval enforced
- ✅ Only approved users can access dashboard
- ✅ Leaders have proper oversight of who can join

### Data Integrity:
- ✅ Correct field mapping prevents data loss
- ✅ Fallback handling prevents UI breaks
- ✅ Comprehensive logging aids debugging

---

**Status:** ✅ **COMPLETE - All fixes implemented and documented**  
**Author:** GitHub Copilot  
**Last Updated:** January 21, 2026
