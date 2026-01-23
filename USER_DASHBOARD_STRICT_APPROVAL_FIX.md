# User Dashboard - Strict Approval Access Control

**Date:** January 21, 2026  
**File Modified:** `user-dashboard.html`  
**Issue:** Ensure ONLY approved users can access the user dashboard  
**Status:** ✅ IMPLEMENTED

## Overview

Enhanced the user dashboard access control to enforce strict approval requirements. Only users with approved group memberships (or site admins) can now access the dashboard. Unapproved, pending, or rejected members are blocked with clear messaging.

## Changes Made

### Location
File: `user-dashboard.html`  
Lines: 1365-1519 (DOMContentLoaded event handler)

### Before vs After

**Before:**
- Basic membership checks
- Could allow pending users in some edge cases
- Ambiguous error messages
- Limited logging for debugging

**After:**
```
✅ STRICT approval enforcement:
  - Site admins: Always allowed
  - Group leaders: Auto-approved for their own groups
  - Regular members: MUST have "approved" or "active" status
  - Pending members: BLOCKED → redirect to login
  - Rejected members: BLOCKED → redirect to login
  - Non-members: BLOCKED → redirect to register
```

## Implementation Details

### Access Control Flow

```
User tries to access /user-dashboard.html
    ↓
Check if logged in? YES
    ↓
Get user from token
    ↓
Is user a site admin?
    YES → ✅ GRANT ACCESS
    NO → Continue to strict check
    ↓
Fetch all groups from API
    ↓
For each group:
    ├─ Is user the leader? YES → AUTO-APPROVED
    └─ Is user a member? YES → Check status
        ├─ Status = "approved" OR "active"? YES → ✅ GRANT ACCESS
        └─ Status = "pending" OR "rejected"? YES → ❌ BLOCK
    ↓
Final Decision:
    ├─ Has at least one approved membership? YES → ✅ LOAD DASHBOARD
    └─ NO → ❌ REDIRECT with specific message
```

### New Code Structure

```javascript
console.log('=== STRICT APPROVAL CHECK: Only approved users allowed ===');

// Two-tier system:
// 1. Site admins bypass everything
if (user.role === 'site_admin') {
    console.log('✅ User is a site admin, granting access');
}
// 2. Everyone else (leaders + members) requires approval
else {
    // MANDATORY approval verification
    try {
        console.log('🔍 STRICT: Checking membership approval status...');
        
        // Collect all user memberships for reporting
        let userMemberships = [];
        let hasApprovedMembership = false;
        
        // Check all groups for user
        for (const group of groupsResponse.groups) {
            // Leader auto-approval
            if (group.leader_id === user.id) {
                hasApprovedMembership = true;
                userMemberships.push({
                    groupName: group.name,
                    status: 'approved',
                    reason: 'leader'
                });
            }
            
            // Member approval check
            for (const member of group.members) {
                if (member.user_id === user.id) {
                    const isApproved = member.status === 'approved' || 
                                      member.status === 'active';
                    
                    userMemberships.push({
                        groupName: group.name,
                        status: member.status,
                        isApproved: isApproved
                    });
                    
                    if (isApproved) {
                        hasApprovedMembership = true;
                    }
                }
            }
        }
        
        // BLOCK access if not approved
        if (!hasApprovedMembership) {
            // Distinguish between "not a member" vs "pending"
            if (!foundUserInAnyGroup) {
                alert('Access Denied: You are not a member of any group. Join first.');
                window.location.href = 'register.html';
            } else {
                alert('Access Denied: Your membership is pending approval.');
                window.location.href = 'login.html';
            }
            return;
        }
        
        console.log('✅ ACCESS GRANTED: User has approved membership');
    } catch (error) {
        // SECURITY FIRST: Deny on any error
        console.error('❌ CRITICAL: Error checking membership');
        alert('Access Denied: Unable to verify membership status.');
        window.location.href = 'login.html';
        return;
    }
}

// Only reached if access is approved
loadUserData();
```

## Approval Statuses

**✅ APPROVED (Access Granted):**
- User is a group leader (auto-approved)
- Member status = "approved"
- Member status = "active"
- User is a site admin

**❌ BLOCKED (Access Denied):**
- Member status = "pending"
- Member status = "rejected"
- User is not a member of any group
- Any API errors during verification

## Console Logging

The dashboard now provides detailed approval logs:

```
=== User Dashboard Initializing ===
Logged in user: {email: "john@example.com", id: "user-123", role: "member"}
User role: member

=== STRICT APPROVAL CHECK: Only approved users allowed ===
🔍 STRICT: Checking membership approval status...
Groups response: {groups: [...]}

Checking group "Tontine Group A":
  - Checking member: user_id=user-123, status="approved", isApproved=true
  ✅ Found APPROVED membership in group: Tontine Group A

Checking group "Tontine Group B":
  - Checking member: user_id=user-123, status="pending", isApproved=false
  ❌ Found user but status is UNAPPROVED: "pending"

📊 Membership Summary:
  - Found in groups: true
  - Has approved membership: true
  - Memberships: [{groupName: "Group A", status: "approved", isApproved: true}, ...]

✅ ACCESS GRANTED: User has approved membership, loading dashboard
```

## User Scenarios

### Scenario 1: Approved Member ✅
- User logs in
- Has "approved" status in at least one group
- **Result:** Dashboard loads normally

### Scenario 2: Pending Member ❌
- User logs in
- Has "pending" status in all groups
- **Alert:** "Access Denied: Your membership is pending approval from the group leader. You will be able to access the dashboard once approved."
- **Redirect:** Back to login.html

### Scenario 3: Rejected Member ❌
- User logs in
- Has "rejected" status in all groups
- **Alert:** "Access Denied: Your membership is pending approval from the group leader. You will be able to access the dashboard once approved."
- **Redirect:** Back to login.html

### Scenario 4: Non-Member ❌
- User logs in
- Not a member of any group
- **Alert:** "Access Denied: You are not a member of any tontine group. Please join a group first."
- **Redirect:** To register.html

### Scenario 5: Group Leader ✅
- User logs in
- Is the leader of at least one group
- **Result:** Auto-approved, dashboard loads

### Scenario 6: Site Admin ✅
- User logs in
- Role = "site_admin"
- **Result:** Bypasses all checks, dashboard loads

### Scenario 7: Approved Leader (Dual Role) ✅
- User is both a group leader AND approved member
- **Result:** Dashboard loads (multiple approval paths)

## Error Handling

**If API call fails during approval check:**
- Logs detailed error to console
- Shows: "Access Denied: Unable to verify your membership status. Please try logging in again or contact support."
- Redirects to login.html (SECURITY FIRST)
- Prevents any partial access

## Testing Checklist

- [ ] **Test 1: Approved Member**
  - Login with approved user
  - Dashboard should load
  - Check console for "✅ ACCESS GRANTED" message

- [ ] **Test 2: Pending Member**
  - Login with pending user
  - Should see "pending approval" alert
  - Should redirect to login.html
  - Check console for "❌ ACCESS DENIED: User exists but has no approved memberships"

- [ ] **Test 3: Group Leader**
  - Login with leader user
  - Dashboard should load
  - Check console for "✅ Found APPROVED membership"

- [ ] **Test 4: Site Admin**
  - Login with site admin
  - Dashboard should load
  - Check console for "✅ User is a site admin, granting access"

- [ ] **Test 5: Non-member**
  - Create new user account (not a group member)
  - Try to access user-dashboard.html directly
  - Should see "not a member" alert
  - Should redirect to register.html

- [ ] **Test 6: API Error Handling**
  - With console open, trigger network error
  - Should see "❌ CRITICAL: Error checking membership status"
  - Should redirect to login.html
  - Should show "Unable to verify membership" alert

- [ ] **Test 7: Multiple Memberships**
  - Create user with multiple group memberships:
     - Group A: pending
     - Group B: approved
     - Group C: rejected
  - Should still grant access (has at least one approved)
  - Console should show all memberships

## Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Approval Requirement** | Loose | STRICT |
| **Error Handling** | Basic | Comprehensive |
| **Logging** | Minimal | Detailed with emoji indicators |
| **Redirect Logic** | Generic | Context-aware (register vs login) |
| **Membership Display** | Not shown | Full membership summary |
| **API Error Response** | Allow access | Deny access (security first) |
| **Site Admin Bypass** | ✅ Included | ✅ Included |
| **Group Leader Auto-Approval** | ✅ Included | ✅ Included + tracked |

## Security Benefits

1. **Defense in Depth:** Multiple verification methods
2. **Fail-Safe:** Denies on error rather than allowing
3. **Audit Trail:** Detailed console logging
4. **Clear Messaging:** Users know why they're blocked
5. **Status Flexibility:** Accepts both "approved" and "active"
6. **Edge Case Handling:** Handles multi-role users correctly

## Related Fixes

- **leader-dashboard.html:** Similar strict approval for group leaders
- **login.html:** Initial authentication
- **register.html:** For unapproved users to join groups
- **Site Admin Dashboard:** Unrestricted admin access

## Deployment Notes

**No breaking changes:**
- Existing approved users: No impact
- New pending users: Blocked (intended behavior)
- Admins: No impact

**Rollback Plan:**
If issues occur, revert to previous version at lines 1365-1519 in user-dashboard.html

---

**Last Updated:** January 21, 2026  
**Status:** Ready for testing  
**Next Step:** Test with real users in different approval states
