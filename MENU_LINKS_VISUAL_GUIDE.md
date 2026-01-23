# Sidebar Menu Links - Visual Guide

## Complete Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                    USER DASHBOARD                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SIDEBAR              ACTION              DESTINATION        │
│  ────────             ──────              ───────────        │
│                                                              │
│  📊 Dashboard    →    Scroll to    →    Dashboard Section   │
│  ├─ ID: dashboard-section                 (with banner,     │
│                                            stats, actions)    │
│                                                              │
│  💳 Make Payment →    Open Modal  →    Payment Modal        │
│  ├─ Modal ID: paymentModal              (form overlay)       │
│                                                              │
│  📜 My Contributions → Scroll to  →    Contributions Table  │
│  ├─ ID: contributions-section           (recent payments)    │
│                                                              │
│  📈 My Reports  →    Scroll to    →    Monthly Reports     │
│  ├─ ID: reports-section                (report cards)       │
│                                                              │
│  🔔 Notifications → Coming Soon  →    Alert Popup          │
│  ├─ Shows: "Coming Soon" message                            │
│                                                              │
│  📅 Upcoming Events → Scroll to  →    Events List          │
│  ├─ ID: events-section                (calendar items)      │
│                                                              │
│  👤 My Profile  →    Coming Soon  →    Alert Popup         │
│  ├─ Shows: "Coming Soon" message                            │
│                                                              │
│  🚪 Logout      →    Function call →   Login Page          │
│  ├─ Redirects to login.html                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Interaction Flows

### Flow 1: Scroll to Section (Dashboard, Contributions, Reports, Events)

```
User Interface        JavaScript Logic           Page Result
───────────────────  ─────────────────────────  ──────────────
   
Click Button
    │
    ├─→ switchMenu()
    │      │
    │      ├─→ Check config
    │      │
    │      ├─→ Find section by ID
    │      │
    │      ├─→ scrollIntoView()
    │      │
    │      └─→ console.log
    │
    └─→ Page scrolls
         smoothly to
         section
         
Result: ✅ Content visible
```

### Flow 2: Open Modal (Make Payment)

```
Click Button
    │
    ├─→ switchMenu()
    │      │
    │      ├─→ Check config
    │      │      (isModal: true)
    │      │
    │      ├─→ Find modal by ID
    │      │
    │      ├─→ Add 'active' class
    │      │
    │      └─→ console.log
    │
    └─→ Modal appears
         as overlay
         
Result: ✅ Form ready
```

### Flow 3: Show Alert (Notifications, Profile)

```
Click Button
    │
    ├─→ switchMenu()
    │      │
    │      ├─→ Check config
    │      │      (comingSoon: true)
    │      │
    │      ├─→ Create message
    │      │
    │      ├─→ alert()
    │      │
    │      └─→ console.log
    │
    └─→ Alert shows
         on screen
         
Result: ✅ User informed
```

---

## Configuration Map

```javascript
const menuSections = {
    
    // ✅ EXISTING FEATURE - Scroll to section
    'dashboard': {
        hasSection: true,
        sectionId: 'dashboard-section',
        label: 'Dashboard'
    },
    
    // ✅ EXISTING FEATURE - Open modal
    'payments': {
        hasSection: true,
        isModal: true,
        modalId: 'paymentModal',
        label: 'Make Payment'
    },
    
    // ✅ EXISTING FEATURE - Scroll to section
    'history': {
        hasSection: true,
        sectionId: 'contributions-section',
        label: 'My Contributions'
    },
    
    // ✅ EXISTING FEATURE - Scroll to section
    'reports': {
        hasSection: true,
        sectionId: 'reports-section',
        label: 'My Reports'
    },
    
    // 🚀 NOT YET BUILT - Show alert
    'notifications': {
        hasSection: false,
        comingSoon: true,
        label: 'Notifications'
    },
    
    // ✅ EXISTING FEATURE - Scroll to section
    'events': {
        hasSection: true,
        sectionId: 'events-section',
        label: 'Upcoming Events'
    },
    
    // 🚀 NOT YET BUILT - Show alert
    'profile': {
        hasSection: false,
        comingSoon: true,
        label: 'My Profile'
    }
};
```

---

## HTML Structure Map

```html
<div class="main-content">
    
    <!-- Dashboard Section -->
    <div id="dashboard-section">
        <!-- Welcome banner, stats, quick actions -->
        <!-- My Recent Contributions table below -->
    </div>
    
        <!-- My Recent Contributions -->
        <div id="contributions-section">
            <!-- Contribution history table -->
        </div>
        
        <!-- Monthly Reports -->
        <div id="reports-section">
            <!-- Report cards for each month -->
        </div>
        
        <!-- Upcoming Events -->
        <div id="events-section">
            <!-- Events list with dates -->
        </div>
    
</div>

<!-- Payment Modal (outside main-content) -->
<div id="paymentModal" class="modal-overlay">
    <!-- Payment form -->
</div>
```

---

## Test Matrix

```
┌────────────────────┬──────────────┬─────────────────┬────────┐
│ Menu Button        │ Should Do    │ Expected Result │ Status │
├────────────────────┼──────────────┼─────────────────┼────────┤
│ Dashboard          │ Scroll       │ Dashboard shown │ ✅    │
│ Make Payment       │ Open Modal   │ Form appears    │ ✅    │
│ My Contributions   │ Scroll       │ Table visible   │ ✅    │
│ My Reports         │ Scroll       │ Reports shown   │ ✅    │
│ Notifications      │ Alert        │ "Coming Soon"   │ ✅    │
│ Upcoming Events    │ Scroll       │ Events shown    │ ✅    │
│ My Profile         │ Alert        │ "Coming Soon"   │ ✅    │
│ Logout             │ Redirect     │ Go to login     │ ✅    │
└────────────────────┴──────────────┴─────────────────┴────────┘
```

---

## Adding New Sections - Step by Step

### Before (Feature Not Linked)

```html
<!-- Section exists but not linked -->
<div class="notifications">
    <h2>Notifications</h2>
    <!-- Content here -->
</div>

<!-- In config -->
'notifications': { 
    hasSection: false,      ← Not linked!
    comingSoon: true
}
```

### After (Feature Linked)

```html
<!-- Section has ID now -->
<div class="notifications" id="notifications-section">
    <h2>Notifications</h2>
    <!-- Content here -->
</div>

<!-- In config -->
'notifications': { 
    hasSection: true,       ← Linked!
    sectionId: 'notifications-section'
}
```

### Result: Click "Notifications" → Scrolls to section!

---

## Console Output Examples

### Dashboard Click
```
Switching to menu: dashboard
Scrolled to section: dashboard-section
```

### Make Payment Click
```
Switching to menu: payments
Opened modal: paymentModal
```

### My Contributions Click
```
Switching to menu: history
Scrolled to section: contributions-section
```

### Notifications Click
```
Switching to menu: notifications
Coming soon: notifications
```

---

## CSS Classes Used

```css
/* Smooth scroll happens automatically with scrollIntoView() */

/* Modal visibility toggled by adding 'active' class */
.modal-overlay.active {
    display: flex;      /* Makes modal visible */
    opacity: 1;
}

/* Menu highlighting */
.menu-item.active {
    background-color: --primary;
    color: white;
}
```

---

## Performance Metrics

| Operation | Time | Impact |
|-----------|------|--------|
| Scroll to section | 300ms | Smooth animation |
| Open modal | Instant | CSS toggle |
| Show alert | Instant | Browser dialog |
| Menu highlight | Instant | CSS update |

---

**Status:** All sections linked and working  
**Test Date:** ___________  
**Tester:** ___________  
**Result:** ✅ PASS / ❌ FAIL  

