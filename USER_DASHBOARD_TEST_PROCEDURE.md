# User Dashboard Access Control - Test Procedure

**Issue:** All users blocked with "not a member" error  
**Fix Applied:** Enhanced response format detection + property name flexibility  
**Test Date:** January 21, 2026

---

## Pre-Test Checklist

- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] File saved: `user-dashboard.html`
- [ ] F12 Developer Tools available
- [ ] Backend server running
- [ ] Test user accounts ready

---

## Test Procedure

### Test 1: Approved Member Can Access ✅

**Setup:**
- User: Jean Marie (or any approved user)
- Status: Approved member in a group
- Browser: Fresh tab, cache cleared

**Steps:**
1. Open browser console (F12)
2. Go to login page
3. Login with approved user
4. Watch console for messages

**Expected Console Output:**
```
=== User Dashboard Initializing ===
User not logged in, redirecting to login
[or: User is logged in]

=== STRICT APPROVAL CHECK: Only approved users allowed ===
🔍 STRICT: Checking membership approval status...

=== RAW Groups Response ===
Full response: [...]

✅ Response is directly an array (or .groups property or .data property)
✅ Found X groups to check

📍 Checking group: "Group Name"
  ✅ User is leader... OR
  📋 Checking X members
    ✅ FOUND APPROVED MEMBERSHIP

📊 Membership Summary:
  - Found in groups: true
  - Has approved membership: true

✅ ACCESS GRANTED: User has approved membership, loading dashboard
```

**Expected Result:**
- ✅ Dashboard loads
- ✅ No alert shown
- ✅ User sees their dashboard

**Pass/Fail:** ___________

---

### Test 2: Pending Member Is Blocked ✅

**Setup:**
- User: Someone with pending membership
- Status: Pending (not approved)
- Browser: Fresh tab

**Steps:**
1. Open browser console (F12)
2. Go to login page
3. Login with pending user
4. Watch for alert and redirect

**Expected Console Output:**
```
🔍 STRICT: Checking membership approval status...

✅ Response is directly an array
✅ Found X groups to check

📍 Checking group: "Group Name"
  ❌ FOUND UNAPPROVED MEMBERSHIP in "Group Name" (status: "pending")

📊 Membership Summary:
  - Found in groups: true
  - Has approved membership: false
  - Memberships: [{groupName: "...", status: "pending", isApproved: false}]

❌ ACCESS DENIED: User exists but has no approved memberships
```

**Expected Result:**
- ✅ Alert appears: "Access Denied: Your membership is pending approval..."
- ✅ Redirects to login.html
- ✅ Dashboard doesn't load

**Pass/Fail:** ___________

---

### Test 3: Group Leader Auto-Approved ✅

**Setup:**
- User: Group leader
- Status: Leader of one or more groups
- Browser: Fresh tab

**Steps:**
1. Open browser console (F12)
2. Login with leader account
3. Check console messages

**Expected Console Output:**
```
📍 Checking group: "My Group"
  Group leader ID: [user-id]
  Current user ID: [user-id]
  ✅ User is leader of group "My Group", auto-approved

✅ ACCESS GRANTED: User has approved membership, loading dashboard
```

**Expected Result:**
- ✅ Dashboard loads
- ✅ No approval check needed
- ✅ Marked as "leader"

**Pass/Fail:** ___________

---

### Test 4: Site Admin Bypasses All Checks ✅

**Setup:**
- User: Site admin
- Status: role = "site_admin"
- Browser: Fresh tab

**Steps:**
1. Open browser console (F12)
2. Login with admin account
3. Check console messages

**Expected Console Output:**
```
User role: site_admin

console.log('=== STRICT APPROVAL CHECK: Only approved users allowed ===');

✅ User is a site admin, granting access
```

**No group checking happens!**

**Expected Result:**
- ✅ Dashboard loads immediately
- ✅ No membership verification
- ✅ No alert shown

**Pass/Fail:** ___________

---

### Test 5: Non-Member Is Blocked ✅

**Setup:**
- User: New user, never joined any group
- Status: Not a member of any group
- Browser: Fresh tab

**Steps:**
1. Open browser console (F12)
2. Login with non-member account
3. Check alert and redirect

**Expected Console Output:**
```
✅ Found X groups to check

📍 Checking group: "Group 1"
  ℹ️ Group "Group 1" has no members
📍 Checking group: "Group 2"
  ℹ️ Group "Group 2" has no members

📊 Membership Summary:
  - Found in groups: false
  - Has approved membership: false

❌ ACCESS DENIED: User not found in any group
```

**Expected Result:**
- ✅ Alert appears: "You are not a member of any group. Please join first."
- ✅ Redirects to register.html
- ✅ Dashboard doesn't load

**Pass/Fail:** ___________

---

### Test 6: Multiple Memberships (Mixed Status) ✅

**Setup:**
- User: Member of multiple groups with different statuses
  - Group A: Approved
  - Group B: Pending
  - Group C: Rejected
- Browser: Fresh tab

**Steps:**
1. Open browser console (F12)
2. Login with this user
3. Check console output

**Expected Console Output:**
```
📍 Checking group: "Group A"
  ✅ FOUND APPROVED MEMBERSHIP in "Group A" (status: "approved")

📍 Checking group: "Group B"
  ❌ FOUND UNAPPROVED MEMBERSHIP in "Group B" (status: "pending")

📍 Checking group: "Group C"
  ❌ FOUND UNAPPROVED MEMBERSHIP in "Group C" (status: "rejected")

📊 Membership Summary:
  - Found in groups: true
  - Has approved membership: true
  - Memberships: [
      {groupName: "Group A", status: "approved", isApproved: true},
      {groupName: "Group B", status: "pending", isApproved: false},
      {groupName: "Group C", status: "rejected", isApproved: false}
    ]

✅ ACCESS GRANTED: User has approved membership, loading dashboard
```

**Expected Result:**
- ✅ Dashboard loads (has at least one approved)
- ✅ No alert shown
- ✅ Shows all memberships in console

**Pass/Fail:** ___________

---

## If Response Format is Different

### Test: What If API Returns Different Structure?

**Expected:** Code handles multiple formats
- ✅ Direct array: `[group1, group2, ...]`
- ✅ .groups wrapper: `{groups: [...]}`
- ✅ .data wrapper: `{data: [...]}`

**If something different:**
```
❌ Invalid groups response structure
Expected one of: [array], {groups: [array]}, {data: [array]}
Got: {customKey: [...]}
```

**Action:** Report this to development team with format shown

---

## If Property Names are Different

### Test: What If API Uses Different Field Names?

**Code now handles:**
- ✅ `leader_id`, `leaderId`, `lead_id`
- ✅ `members`, `users`, `groupMembers`
- ✅ `user_id`, `userId`, `id`

**If console shows:**
```
❌ Members is not an array in group "Name"
Members value: undefined
```

**Action:** Backend uses different property name
- Check what the actual property is
- Report to development team

---

## Summary Report

| Test | Expected | Result | Pass/Fail |
|------|----------|--------|-----------|
| 1. Approved Member | Dashboard loads | | |
| 2. Pending Member | Blocked, alert shown | | |
| 3. Group Leader | Auto-approved, loads | | |
| 4. Site Admin | Bypasses check, loads | | |
| 5. Non-Member | Blocked, redirect to register | | |
| 6. Mixed Status | Loads if 1+ approved | | |
| Response Format | One format detected | | |
| Property Names | Matches available | | |

---

## Debugging Output Template

**If issue occurs, collect and share:**

```
=== DEBUG INFO ===
Test Date: ___________
User: ___________
Expected: ___________
Actual: ___________

Console Output:
[Paste entire console output here]

Alert Message (if any):
[Paste exactly]

Redirect Destination:
[login.html / register.html / dashboard loaded]

Response Format Detected:
[✅ Response is directly an array]
[OR ✅ Response has .groups property]
[OR ✅ Response has .data property]
[OR ❌ Invalid groups response structure]

Additional Notes:
[Any other observations]
```

---

## Rollback Plan

If all tests fail and need to revert:

1. Contact development team
2. Revert `user-dashboard.html` to previous version
3. Clear browser cache (Ctrl+Shift+Delete)
4. Test again

---

**Test Status:** READY  
**Test Date:** ___________  
**Tester Name:** ___________  
**Result Summary:** ✅ PASS / ❌ FAIL / 🔧 NEEDS ADJUSTMENT  

