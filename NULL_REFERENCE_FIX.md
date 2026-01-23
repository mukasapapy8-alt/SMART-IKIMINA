# Cannot Read Properties of Null - Fix

## Error
```
TypeError: Cannot read properties of null (reading 'querySelectorAll')
    at window.viewMemberDetails (leader-dashboard.html:2229:45)
```

## Problem
The `viewMemberDetails` function was trying to get the active members table using:
```javascript
const activeMembersTable = document.getElementById('activeMembersTableBody');
const rows = activeMembersTable.querySelectorAll('tr');
```

However, there is no element with ID `activeMembersTableBody` in the HTML, so `getElementById` returned `null`, causing the error when trying to call `querySelectorAll` on `null`.

## Root Cause
The active members table structure in the HTML is:
```html
<div id="active-members" class="tab-content active">
    <div class="table-container">
        <table>
            <thead>...</thead>
            <tbody>
                <!-- No ID attribute here -->
            </tbody>
        </table>
    </div>
</div>
```

The `<tbody>` element doesn't have an ID attribute.

## Solution

### Changed Selector
Updated the function to use the correct CSS selector that matches the actual HTML structure:

**Before:**
```javascript
const activeMembersTable = document.getElementById('activeMembersTableBody');
const rows = activeMembersTable.querySelectorAll('tr');
```

**After:**
```javascript
const activeMembersTable = document.querySelector('#active-members table tbody');

if (!activeMembersTable) {
    console.error('❌ Active members table not found in DOM');
    // Fetch from API instead
    fetchMemberDetailsFromAPI(userId, groupId);
    return;
}

const rows = activeMembersTable.querySelectorAll('tr');
```

### Key Improvements

1. **Correct Selector:**
   - Changed from `getElementById('activeMembersTableBody')`
   - To `querySelector('#active-members table tbody')`
   - Matches the actual HTML structure

2. **Null Check:**
   - Added safety check: `if (!activeMembersTable)`
   - Prevents error if element doesn't exist
   - Provides helpful console error message

3. **Graceful Fallback:**
   - If table not found, falls back to API
   - Calls `fetchMemberDetailsFromAPI(userId, groupId)`
   - Ensures modal still opens with data

## Why This Selector Works

The CSS selector `'#active-members table tbody'` means:
1. Find element with ID `active-members` (the tab content div)
2. Find a `<table>` element inside it
3. Find a `<tbody>` element inside the table

This matches the HTML structure exactly:
```
div#active-members
  └─ div.table-container
      └─ table
          └─ tbody  ← We select this
```

## Comparison with Other Selectors in Code

### populateActiveMembersTable (Line 1902) ✅
```javascript
const tbody = document.querySelector('#active-members table tbody');
```
This was already correct!

### removeMember (Line 2977) ✅
```javascript
const rows = document.querySelectorAll('#active-members table tbody tr');
```
This was already correct!

### viewMemberDetails (Line 2228) ❌ → ✅
**Was:** `document.getElementById('activeMembersTableBody')`
**Now:** `document.querySelector('#active-members table tbody')`
Now consistent with other functions!

## Testing Checklist

- [ ] Hard refresh page (Ctrl+Shift+R)
- [ ] Open browser console (F12)
- [ ] Navigate to Active Members tab
- [ ] Click eye icon on any member
- [ ] Verify no error in console
- [ ] Verify modal opens with member details
- [ ] Check console for: `🔍 Viewing member details for userId: ...`

## Expected Console Output

**Success (table found in DOM):**
```
🔍 Viewing member details for userId: abc-123-def-456
✅ Member details populated: {
  name: "John Doe",
  email: "john@example.com",
  phone: "+250123456789",
  joinDate: "1/15/2026",
  userId: "abc-123-def-456",
  status: "Active"
}
```

**Fallback (table not found, using API):**
```
🔍 Viewing member details for userId: abc-123-def-456
❌ Active members table not found in DOM
📡 Fetching member details from API...
API Response: {members: Array(10)}
✅ Member details populated: {...}
```

## Files Modified

### `leader-dashboard.html`
- **Line 2228-2237:** Fixed selector and added null check
  - Changed `getElementById` to `querySelector`
  - Added null check with error logging
  - Added fallback to API fetch

## Related Issues Fixed

This fix ensures consistency across all table selections in the file:
- ✅ `populateActiveMembersTable()` uses querySelector
- ✅ `removeMember()` uses querySelector  
- ✅ `viewMemberDetails()` now uses querySelector (FIXED)

## Prevention

To prevent similar issues in the future:

### Best Practice 1: Use Descriptive IDs
If you need to use `getElementById`, add an ID to the element:
```html
<tbody id="activeMembersTableBody">
```

### Best Practice 2: Always Check for Null
Before calling methods on DOM elements:
```javascript
const element = document.getElementById('someId');
if (!element) {
    console.error('Element not found');
    return;
}
element.doSomething();
```

### Best Practice 3: Use querySelector for Consistency
`querySelector` is more flexible and matches CSS selector syntax:
```javascript
// These are equivalent:
document.getElementById('myId')
document.querySelector('#myId')

// But querySelector can do more:
document.querySelector('#parent .child')
document.querySelector('table tbody tr:first-child')
```

## Summary

✅ **Fixed:** Null reference error when clicking eye icon
✅ **Changed:** Selector from `getElementById('activeMembersTableBody')` to `querySelector('#active-members table tbody')`
✅ **Added:** Null check with graceful fallback to API
✅ **Improved:** Consistency with other table selectors in the file
✅ **Validated:** No syntax errors, ready for testing

The eye icon should now work without errors! 🎉
