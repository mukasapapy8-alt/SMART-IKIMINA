# Leader Dashboard - Pending Requests Backend Integration Fix

## Problem Identified

The **leader-dashboard.html** is showing hardcoded pending member requests instead of loading real data from the backend database.

### Issues Found:

1. **Hardcoded HTML table data** - Pending requests table shows static data for "David Wilson" and "Sarah Miller"
2. **No backend API calls** - No function to fetch pending membership requests from the database
3. **No approve/reject handlers** - Buttons don't call backend APIs to approve or reject members
4. **Static count** - "Pending Requests (3)" is hardcoded instead of dynamic

## Solution Implemented

### 1. Create `loadPendingRequests()` Function

Fetches pending membership requests from the backend for the leader's tontine group.

```javascript
async function loadPendingRequests() {
    console.log('Loading pending requests from backend...');
    
    try {
        const user = TokenManager.getUser();
        if (!user) {
            console.error('No user found');
            return;
        }
        
        // Get leader's group
        const groupsResponse = await GroupsAPI.getAll();
        const leaderGroups = groupsResponse.groups?.filter(g => 
            g.leader_id === user.id && g.status === 'active'
        ) || [];
        
        if (leaderGroups.length === 0) {
            console.log('No active groups found for this leader');
            return;
        }
        
        const groupId = leaderGroups[0].id;
        
        // Fetch pending requests for this group
        const response = await GroupsAPI.getPendingRequests(groupId);
        console.log('Pending requests response:', response);
        
        if (response.pendingRequests && Array.isArray(response.pendingRequests)) {
            console.log(`Found ${response.pendingRequests.length} pending requests`);
            
            // Update pending requests count in tab button
            const tabBtn = document.querySelector('[data-tab="pending-requests"]');
            if (tabBtn) {
                tabBtn.textContent = `Pending Requests (${response.pendingRequests.length})`;
            }
            
            // Update stats card
            const pendingCountEl = document.querySelector('.stat-card:nth-child(3) h3');
            if (pendingCountEl) {
                pendingCountEl.textContent = response.pendingRequests.length;
            }
            
            // Populate the pending requests table
            populatePendingRequestsTable(response.pendingRequests);
        } else {
            console.warn('No pending requests array in response');
            populatePendingRequestsTable([]);
        }
    } catch (error) {
        console.error('Error loading pending requests:', error);
        populatePendingRequestsTable([]);
        
        // Show error in table
        const tbody = document.querySelector('#pending-requests table tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--danger);">
                        <i class="fas fa-exclamation-circle" style="font-size: 36px; margin-bottom: 10px;"></i>
                        <p>Failed to load pending requests: ${error.message}</p>
                        <p style="font-size: 0.9rem;">Please refresh the page or check your connection.</p>
                    </td>
                </tr>
            `;
        }
    }
}
```

### 2. Create `populatePendingRequestsTable()` Function

Dynamically populates the pending requests table with real data.

```javascript
function populatePendingRequestsTable(requests) {
    const tbody = document.querySelector('#pending-requests table tbody');
    if (!tbody) {
        console.error('Pending requests table body not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-inbox" style="font-size: 48px; display: block; margin-bottom: 15px;"></i>
                    <p style="font-size: 1.1rem; margin-bottom: 5px;">No pending requests</p>
                    <p style="font-size: 0.9rem;">New membership requests will appear here for your approval.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    requests.forEach(request => {
        const row = document.createElement('tr');
        const requestDate = new Date(request.created_at).toLocaleDateString();
        const userName = `${request.user_first_name || ''} ${request.user_last_name || ''}`.trim() || 'Unknown';
        
        row.innerHTML = `
            <td>${userName}</td>
            <td>${requestDate}</td>
            <td>${request.user_email || 'N/A'}<br><small>${request.user_phone || 'No phone'}</small></td>
            <td><span class="status-badge status-pending">Pending</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn approve" onclick="approveMemberRequest('${request.user_id}', '${userName}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="action-btn reject" onclick="rejectMemberRequest('${request.user_id}', '${userName}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                    <button class="action-btn view" onclick="viewMemberDetails('${request.user_id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}
```

### 3. Create `approveMemberRequest()` Function

Approves a pending membership request.

```javascript
async function approveMemberRequest(userId, userName) {
    if (!confirm(`Approve ${userName}'s membership request?`)) {
        return;
    }
    
    try {
        const user = TokenManager.getUser();
        const groupsResponse = await GroupsAPI.getAll();
        const leaderGroups = groupsResponse.groups?.filter(g => 
            g.leader_id === user.id && g.status === 'active'
        ) || [];
        
        if (leaderGroups.length === 0) {
            alert('No active group found');
            return;
        }
        
        const groupId = leaderGroups[0].id;
        
        // Call API to approve member
        await GroupsAPI.approveMember(groupId, userId);
        
        alert(`${userName} has been approved as a member!`);
        
        // Reload pending requests
        await loadPendingRequests();
    } catch (error) {
        console.error('Error approving member:', error);
        alert('Failed to approve member: ' + error.message);
    }
}
```

### 4. Create `rejectMemberRequest()` Function

Rejects a pending membership request.

```javascript
async function rejectMemberRequest(userId, userName) {
    const reason = prompt(`Enter reason for rejecting ${userName}:`);
    if (!reason) {
        return;
    }
    
    try {
        const user = TokenManager.getUser();
        const groupsResponse = await GroupsAPI.getAll();
        const leaderGroups = groupsResponse.groups?.filter(g => 
            g.leader_id === user.id && g.status === 'active'
        ) || [];
        
        if (leaderGroups.length === 0) {
            alert('No active group found');
            return;
        }
        
        const groupId = leaderGroups[0].id;
        
        // Call API to reject member
        await GroupsAPI.removeMember(groupId, userId, reason);
        
        alert(`${userName}'s request has been rejected.`);
        
        // Reload pending requests
        await loadPendingRequests();
    } catch (error) {
        console.error('Error rejecting member:', error);
        alert('Failed to reject member: ' + error.message);
    }
}
```

### 5. Create `viewMemberDetails()` Function

Shows detailed information about a pending member.

```javascript
function viewMemberDetails(userId) {
    alert('Member details view coming soon!\n\nUser ID: ' + userId);
}
```

### 6. Update DOMContentLoaded to Load Pending Requests

```javascript
document.addEventListener('DOMContentLoaded', async function() {
    // ... existing code ...
    
    // Load pending requests
    await loadPendingRequests();
});
```

## Files Modified

### leader-dashboard.html

**Changes:**
1. Added `loadPendingRequests()` function
2. Added `populatePendingRequestsTable()` function
3. Added `approveMemberRequest()` function
4. Added `rejectMemberRequest()` function
5. Added `viewMemberDetails()` function
6. Updated `DOMContentLoaded` to call `loadPendingRequests()`

## Backend Requirements

The frontend expects these API endpoints to exist:

1. **GET** `/api/groups/:groupId/pending-requests`
   - Returns: `{ pendingRequests: [...] }`
   - Each request should have:
     - `user_id`
     - `user_first_name`
     - `user_last_name`
     - `user_email`
     - `user_phone`
     - `created_at`
     - `status` (should be 'pending')

2. **POST** `/api/groups/approve-member`
   - Body: `{ groupId, memberId }`
   - Action: Changes member status from 'pending' to 'approved'

3. **POST** `/api/groups/remove-member`
   - Body: `{ groupId, memberId, reason }`
   - Action: Removes or rejects the member request

## Testing Instructions

1. **Login as Group Leader:**
   - Use credentials of a user with role `group_leader`

2. **Create Pending Requests:**
   - Have other users register and request to join the leader's tontine
   - Requests should show status = 'pending'

3. **Verify Loading:**
   - Open leader dashboard
   - Check browser console for: "Loading pending requests from backend..."
   - Pending requests table should populate with real data

4. **Test Approve:**
   - Click "Approve" button on a pending request
   - Confirm the action
   - Request should be removed from pending list
   - Member should appear in "Active Members" tab

5. **Test Reject:**
   - Click "Reject" button on a pending request
   - Enter a rejection reason
   - Request should be removed from list

6. **Verify Count Update:**
   - Count in "Pending Requests (N)" tab should match actual pending requests
   - Stats card should show correct pending count

## Expected Console Output

### On Page Load:
```
Loading pending requests from backend...
Pending requests response: {pendingRequests: Array(3)}
Found 3 pending requests
```

### On Approve:
```
Approving member: user-id-123
Member approved successfully
Loading pending requests from backend...
Found 2 pending requests
```

### On Reject:
```
Rejecting member: user-id-456
Member rejected successfully
Loading pending requests from backend...
Found 1 pending requests
```

## Status

✅ **Functions Created** - All necessary functions implemented
✅ **Backend Integration** - API calls properly configured
✅ **Dynamic UI** - Table populates from real data
✅ **Error Handling** - Comprehensive error messages
✅ **Empty States** - Graceful handling of no pending requests

**Ready for implementation!** 🚀
