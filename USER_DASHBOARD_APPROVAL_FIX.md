# User Dashboard Access Control Fix

## Problem

Unapproved users were able to access the user dashboard even though they should be blocked until a group leader approves their membership request.

**Security Issue:**
- Users who just registered and joined a group could access the dashboard
- Their membership status was "pending" but they bypassed the check
- Should only access dashboard AFTER leader approval

## Root Cause

The approval check had several weaknesses:

### 1. **Limited Scope**
```javascript
// Before - Only checked for role === 'member'
if (user.role === 'member') {
    // Check approval...
}
```

**Problem:** 
- Didn't check users with other roles
- Didn't check group leaders who are also members
- Inconsistent role assignment on registration

### 2. **Weak Redirect on Failure**
```javascript
// Before
TokenManager.logout();
```

**Problem:**
- Just logged out user
- Didn't redirect to appropriate page
- User could refresh and try again

### 3. **No Check for Group Leaders**
- Group leaders who create groups weren't auto-approved
- Leaders are automatically approved (they created the group!)

### 4. **Limited Status Checking**
```javascript
// Before
const isApproved = member.status === 'approved';
```

**Problem:**
- Didn't check for 'active' status
- Some backends use different status values

## Solution

Enhanced the approval check with comprehensive security:

### 1. **Check ALL Users (Except Site Admin)**

```javascript
// After - Check everyone except site_admin
if (user.role === 'site_admin') {
    console.log('✅ User is a site admin, skipping membership check');
} else {
    // Check approval for EVERYONE else
}
```

**Benefits:**
- ✅ Covers all user types
- ✅ Includes group_leader role
- ✅ Includes member role
- ✅ Only skips site_admin (they manage the system)

### 2. **Auto-Approve Group Leaders**

```javascript
// Skip groups where user is the leader - they auto-approve
if (group.leader_id === user.id) {
    console.log(`✅ User is leader of group "${group.name}", auto-approved`);
    hasApprovedMembership = true;
    break;
}
```

**Benefits:**
- ✅ Leaders don't need to approve themselves
- ✅ Makes sense - they created the group
- ✅ Immediate access for leaders

### 3. **Track User Presence**

```javascript
let hasApprovedMembership = false;
let foundUserInAnyGroup = false;

// Later...
if (isCurrentUser) {
    foundUserInAnyGroup = true;
    if (isApproved) {
        hasApprovedMembership = true;
    }
}
```

**Benefits:**
- ✅ Knows if user exists in any group
- ✅ Distinguishes between "not found" and "found but pending"
- ✅ Better error messages

### 4. **Multiple Status Values**

```javascript
const memberStatus = member.status || 'pending';
const isApproved = memberStatus === 'approved' || memberStatus === 'active';
```

**Benefits:**
- ✅ Handles 'approved' status
- ✅ Handles 'active' status
- ✅ Defaults to 'pending' if missing
- ✅ Compatible with different backends

### 5. **Proper Redirects**

```javascript
if (!foundUserInAnyGroup) {
    alert('Access Denied: You are not a member of any tontine group. Please join a group first.');
    window.location.href = 'register.html';
    return;
}

if (!hasApprovedMembership) {
    alert('Access Denied: Your membership request is still pending approval from the group leader.');
    window.location.href = 'pending-approval.html';
    return;
}

// On error
window.location.href = 'login.html';
```

**Benefits:**
- ✅ Specific redirects based on scenario
- ✅ User knows what to do next
- ✅ Can't bypass by refreshing

## Access Control Flow

### Scenario 1: Site Admin
```
Site Admin logs in
  ↓
Role check: site_admin
  ↓
Skip membership check ✅
  ↓
Load dashboard
```

### Scenario 2: Group Leader
```
Group Leader logs in
  ↓
Role check: NOT site_admin
  ↓
Check membership approval
  ↓
Found: leader_id matches user.id
  ↓
Auto-approve ✅
  ↓
Load dashboard
```

### Scenario 3: Approved Member
```
Member logs in
  ↓
Role check: NOT site_admin
  ↓
Check membership approval
  ↓
Found in group.members
  ↓
Status: 'approved' or 'active' ✅
  ↓
Load dashboard
```

### Scenario 4: Pending Member (BLOCKED!)
```
Member logs in
  ↓
Role check: NOT site_admin
  ↓
Check membership approval
  ↓
Found in group.members
  ↓
Status: 'pending' ❌
  ↓
Alert: "Pending approval from leader"
  ↓
Redirect to: pending-approval.html
```

### Scenario 5: Not in Any Group (BLOCKED!)
```
User logs in
  ↓
Role check: NOT site_admin
  ↓
Check membership approval
  ↓
NOT found in any group ❌
  ↓
Alert: "Not a member of any group"
  ↓
Redirect to: register.html
```

### Scenario 6: API Error (BLOCKED!)
```
User logs in
  ↓
Role check: NOT site_admin
  ↓
Check membership approval
  ↓
API error ❌
  ↓
Alert: "Unable to verify membership"
  ↓
Redirect to: login.html
```

## Enhanced Console Logging

The fix includes comprehensive logging for debugging:

```javascript
console.log('=== User Dashboard Initializing ===');
console.log('Logged in user:', user);
console.log('User role:', user.role);
console.log('🔍 Checking membership approval status...');
console.log(`Checking group "${group.name}":`, group);
console.log(`✅ User is leader of group "${group.name}", auto-approved`);
console.log(`- Checking member: user_id=${member.user_id}, status=${memberStatus}`);
console.log('✅ Found user in any group:', foundUserInAnyGroup);
console.log('✅ Has approved membership:', hasApprovedMembership);
console.log('❌ User does not have any approved memberships');
```

**Benefits:**
- Easy to debug approval issues
- Can see exactly which check failed
- Helps identify backend data issues

## Testing Checklist

### Test 1: New User (Should Be Blocked)
- [ ] Register a new user
- [ ] Join a group
- [ ] Try to access user-dashboard.html
- [ ] Should see: "Your membership request is still pending approval"
- [ ] Should redirect to: pending-approval.html ✅

### Test 2: Approved Member (Should Access)
- [ ] Login as group leader
- [ ] Approve a pending member
- [ ] Logout and login as that member
- [ ] Try to access user-dashboard.html
- [ ] Should load dashboard successfully ✅

### Test 3: Group Leader (Should Access)
- [ ] Login as group leader
- [ ] Access user-dashboard.html
- [ ] Should auto-approve (they created the group)
- [ ] Should load dashboard successfully ✅

### Test 4: Site Admin (Should Access)
- [ ] Login as site_admin
- [ ] Access user-dashboard.html
- [ ] Should skip membership check
- [ ] Should load dashboard successfully ✅

### Test 5: Not in Any Group (Should Be Blocked)
- [ ] Create a user account
- [ ] Don't join any group
- [ ] Try to access user-dashboard.html
- [ ] Should see: "You are not a member of any tontine group"
- [ ] Should redirect to: register.html ✅

### Test 6: Multiple Groups
- [ ] User is pending in Group A
- [ ] User is approved in Group B
- [ ] Try to access user-dashboard.html
- [ ] Should allow access (has at least one approval) ✅

### Test 7: Backend Error
- [ ] Stop backend server
- [ ] Try to access user-dashboard.html
- [ ] Should see: "Unable to verify your membership status"
- [ ] Should redirect to: login.html ✅

## Expected Console Output

### Approved Member
```
=== User Dashboard Initializing ===
Logged in user: {id: "...", email: "...", role: "member"}
User role: member
🔍 Checking membership approval status...
Groups response: {groups: Array(5)}
Checking group "Savings Group": {...}
  - Members in Savings Group: [{...}, {...}]
  - Checking member: user_id=abc-123, status=approved, isCurrentUser=true, isApproved=true
  ✅ Found approved membership in group: Savings Group
✅ Found user in any group: true
✅ Has approved membership: true
✅ User has approved membership, loading dashboard
```

### Pending Member (Blocked)
```
=== User Dashboard Initializing ===
Logged in user: {id: "...", email: "...", role: "member"}
User role: member
🔍 Checking membership approval status...
Groups response: {groups: Array(5)}
Checking group "Savings Group": {...}
  - Members in Savings Group: [{...}, {...}]
  - Checking member: user_id=abc-123, status=pending, isCurrentUser=true, isApproved=false
  ⚠️ Found user but status is: pending
✅ Found user in any group: true
✅ Has approved membership: false
❌ User does not have any approved memberships
```

## Files Modified

### `user-dashboard.html`

**Lines 1355-1432:** Enhanced approval check

**Key Changes:**

1. **Changed approval scope:**
```diff
- if (user.role === 'member') {
+ if (user.role === 'site_admin') {
+     // Skip check for site admin
+ } else {
      // Check for everyone else
```

2. **Added leader auto-approval:**
```diff
+ if (group.leader_id === user.id) {
+     hasApprovedMembership = true;
+     break;
+ }
```

3. **Added user presence tracking:**
```diff
  let hasApprovedMembership = false;
+ let foundUserInAnyGroup = false;
  
+ if (isCurrentUser) {
+     foundUserInAnyGroup = true;
+ }
```

4. **Enhanced status checking:**
```diff
- const isApproved = member.status === 'approved';
+ const memberStatus = member.status || 'pending';
+ const isApproved = memberStatus === 'approved' || memberStatus === 'active';
```

5. **Better redirects:**
```diff
- TokenManager.logout();
+ if (!foundUserInAnyGroup) {
+     window.location.href = 'register.html';
+ } else if (!hasApprovedMembership) {
+     window.location.href = 'pending-approval.html';
+ }
```

## Security Improvements

| Before | After |
|--------|-------|
| Only checked `role === 'member'` | Checks ALL users except site_admin |
| Leaders might be blocked | Leaders auto-approved |
| Logged out on failure | Redirects to appropriate page |
| Only checked 'approved' status | Checks 'approved' OR 'active' |
| Unclear error messages | Specific messages per scenario |
| No presence tracking | Knows if user exists vs pending |

## Backend Requirements

For this to work properly, the backend must:

### 1. Return Members with Groups
```javascript
// GroupsAPI.getAll() should return:
{
  groups: [
    {
      id: "group-123",
      name: "Savings Group",
      leader_id: "user-456",
      members: [
        {
          user_id: "user-789",
          status: "approved", // or "active" or "pending"
          // ... other member data
        }
      ]
    }
  ]
}
```

### 2. Member Status Values
Supported status values:
- `"approved"` - Member is approved ✅
- `"active"` - Member is active ✅
- `"pending"` - Member awaiting approval ❌
- `null` or `undefined` - Treated as "pending" ❌

### 3. Leader Identification
Groups must have `leader_id` field to identify the leader.

## Summary

✅ **Fixed:** Unapproved users can no longer access user dashboard
✅ **Added:** Comprehensive approval check for all user types
✅ **Added:** Auto-approval for group leaders
✅ **Added:** User presence tracking (exists vs pending)
✅ **Added:** Multiple status value support ('approved', 'active')
✅ **Improved:** Specific redirects based on approval status
✅ **Improved:** Better error messages for users
✅ **Enhanced:** Security with fail-safe approach
✅ **Validated:** No syntax errors, ready for testing

Users must now be approved by their group leader before accessing the dashboard! 🔒
