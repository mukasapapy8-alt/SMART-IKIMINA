# Site Admin: Tontine Approval Process

## 📋 Overview

When a user creates a tontine, it starts in **"pending"** status. Site administrators must review and approve these requests before they become active.

---

## 🔄 Complete Workflow for Site Admin

```
User Creates Tontine
    ↓
Site Admin receives notification
    ↓
Admin logs in to Admin Dashboard
    ↓
Admin sees "Pending Tontine Requests"
    ↓
Admin clicks to view details
    ↓
Admin reviews:
    ├─ Group name & description
    ├─ Leader information
    ├─ Max members
    ├─ Contribution amount
    └─ Other tontine details
    ↓
Admin decides:
    ├─ [APPROVE] - Tontine becomes active
    ├─ [REJECT] - Tontine is disabled
    └─ [ASK FOR CHANGES] - Request more info
    ↓
System sends notification to user
    ↓
If APPROVED:
    ├─ Tontine status → "active"
    ├─ Group leader can manage it
    ├─ Other users can join
    └─ Contributions can start
    ↓
If REJECTED:
    ├─ Tontine status → "rejected"
    ├─ Leader notified with reason
    ├─ Can create new tontine
    └─ Cannot revive rejected tontine
```

---

## 🖥️ Admin Dashboard Features

### **Pending Approvals Section**

The admin dashboard shows:

```
Pending Tontine Requests
├─ Kigali Business Circle
│  ├─ Created By: John Doe
│  ├─ Email: john@example.com
│  ├─ Phone: +250712345678
│  ├─ Status: PENDING ⏳
│  ├─ Created: Jan 19, 2026 2:30 PM
│  ├─ Members: 1/30
│  ├─ Contribution: 50,000 RWF/month
│  └─ Actions:
│     ├─ [View Details]
│     ├─ [Approve] ✅
│     └─ [Reject] ❌
│
├─ Social Cooperative Fund
│  ├─ Created By: Jane Smith
│  ├─ Status: PENDING ⏳
│  └─ [View Details] [Approve] [Reject]
│
└─ Plus 3 more pending...
```

---

## ✅ Approval Process

### **Step 1: Access Admin Dashboard**
- Login as site admin
- Click "Admin Dashboard"
- Go to "Pending Approvals" section

### **Step 2: Review Request**
Click on the tontine to see:
- Group name & description
- Leader name, email, phone
- Maximum members allowed
- Contribution amount & currency
- Meeting frequency
- Cycle dates (if provided)

### **Step 3: Verify Information**
Check:
- ✅ Is the group name appropriate?
- ✅ Is the description clear?
- ✅ Is leader information valid?
- ✅ Are contribution amounts reasonable?
- ✅ Are max members within policy?

### **Step 4: Make Decision**

#### **Option A: Approve**
1. Click [Approve] button
2. Optionally add approval message
3. Click [Confirm Approval]
4. System sends notification to user

#### **Option B: Reject**
1. Click [Reject] button
2. Provide reason (required)
3. Click [Confirm Rejection]
4. System sends notification with reason

#### **Option C: Request Changes**
1. Click [Request Changes]
2. List required changes
3. Send to leader
4. Leader can edit and resubmit

---

## 📧 Notifications Sent

### **When Tontine Is Created:**
**To:** All Site Admins  
**Subject:** New Tontine Request - Review Required  
**Content:**
```
New tontine created and requires your approval!

Group Name: Kigali Business Circle
Created By: John Doe (john@example.com)
Max Members: 30
Contribution: 50,000 RWF/month

Action Required:
- Review the tontine details
- Approve if appropriate
- Reject if not compliant with policies

Login to admin dashboard to review.
```

### **When Approved:**
**To:** Tontine Leader  
**Subject:** Your Tontine "Kigali Business Circle" Has Been Approved ✅  
**Content:**
```
Congratulations!

Your tontine "Kigali Business Circle" has been approved and is now active.

Tontine Code: IKI-TN-2026-456
Status: ACTIVE ✅

You can now:
✓ Invite members to join
✓ Share the tontine code
✓ Set up your first meeting
✓ Configure payment methods
✓ Start collecting contributions

Login to your dashboard to get started.
```

### **When Rejected:**
**To:** Tontine Leader  
**Subject:** Your Tontine "Kigali Business Circle" Requires Changes  
**Content:**
```
Thank you for creating a tontine!

Your tontine "Kigali Business Circle" needs some adjustments before approval.

Reason: The contribution amount seems too low for the group size.

Please:
1. Review the feedback
2. Make necessary changes
3. Resubmit for approval

We appreciate your cooperation!
```

---

## 🔐 Admin Permissions

### **Site Admin Can:**
- ✅ View all pending tontines
- ✅ View all active tontines
- ✅ View all rejected tontines
- ✅ Approve pending tontines
- ✅ Reject pending tontines
- ✅ View tontine details
- ✅ View group leader information
- ✅ Manually create tontines
- ✅ Manually activate tontines
- ✅ Manually deactivate tontines
- ✅ Send messages to leaders
- ✅ Ban problematic groups

### **Site Admin Cannot:**
- ❌ Join tontines as member
- ❌ Make contributions
- ❌ Approve their own tontine (if they create one)
- ❌ Delete tontines permanently
- ❌ Edit tontine details after approval

---

## 📊 Dashboard Metrics

The admin dashboard shows summary:

```
Tontine Overview
├─ Total Tontines: 25
├─ Active: 20 ✅
├─ Pending: 3 ⏳
├─ Rejected: 2 ❌
└─ Archived: 0

Pending Approvals
├─ This Week: 3
├─ Average Wait: 2.3 days
└─ Oldest: 5 days
```

---

## 🔍 Detailed View

When clicking a pending tontine, admin sees:

```
─────────────────────────────────────────
GROUP INFORMATION
─────────────────────────────────────────
Name: Kigali Business Circle
Description: A collaborative savings group for entrepreneurs
Status: PENDING ⏳
Created: Jan 19, 2026 2:30 PM
Code: IKI-TN-2026-456

─────────────────────────────────────────
LEADER INFORMATION
─────────────────────────────────────────
Name: John Doe
Email: john@example.com
Phone: +250712345678
ID: 123456789
Created Account: Jan 15, 2026
Previous Groups: None

─────────────────────────────────────────
TONTINE SETTINGS
─────────────────────────────────────────
Max Members: 30
Members Joined: 1 (just the leader)
Contribution Amount: 50,000 RWF
Frequency: Monthly
Meeting: Not configured yet

─────────────────────────────────────────
APPROVAL OPTIONS
─────────────────────────────────────────
[Approve]          [Request Changes]          [Reject]

Notes for Admin (optional):
[Text field]

[Cancel]  [Submit Decision]
─────────────────────────────────────────
```

---

## ⚠️ Approval Guidelines

### **Approve If:**
✅ Group name is clear and appropriate  
✅ Leader information is complete and valid  
✅ Description explains group purpose  
✅ Contribution amounts are reasonable  
✅ Max members is within policy  
✅ No policy violations detected  

### **Reject If:**
❌ Group name is offensive or inappropriate  
❌ Leader information is incomplete or suspicious  
❌ Description is unclear or misleading  
❌ Contribution amounts violate regulations  
❌ Max members exceeds policy limit  
❌ Group could facilitate fraud or illegal activity  
❌ Leader has history of violations  

### **Request Changes If:**
⚠️ Information is unclear but fixable  
⚠️ Contribution amounts need justification  
⚠️ Group size needs adjustment  
⚠️ Description needs clarification  
⚠️ Policy violation can be addressed  

---

## 📋 Approval Checklist

Before approving, verify:

- [ ] Group name is appropriate
- [ ] Leader is verified member
- [ ] Group description is clear
- [ ] Contribution amounts are entered
- [ ] Max members is specified
- [ ] Meeting frequency is set
- [ ] No policy violations
- [ ] No duplicate groups
- [ ] Leader hasn't created too many groups
- [ ] Contribution rates comply with regulations
- [ ] Group size is reasonable
- [ ] No suspicious activity detected

---

## 🚀 After Approval

Once approved, the tontine:

1. **Status Changes:** pending → active
2. **Visibility:** Appears in group search
3. **Members:** Others can request to join
4. **Leader Access:** Can access leader dashboard
5. **Contributions:** Can start collecting
6. **Notifications:** Sent to leader
7. **Logging:** Approval logged in audit trail

---

## 📊 Approval Statistics

Track metrics:

```
Approval Statistics
├─ Total Requests: 150
├─ Approved: 140 (93%)
├─ Rejected: 5 (3%)
├─ Pending: 5 (3%)
├─ Average Approval Time: 1.2 days
├─ Fastest Approval: 5 minutes
├─ Slowest Approval: 7 days
└─ Rejections by Reason:
   ├─ Inappropriate name: 2
   ├─ Suspicious leader: 1
   ├─ Invalid amounts: 1
   └─ Other: 1
```

---

## 🔗 Backend API Reference

### **Admin Only Endpoint: Approve Group**

**Endpoint:** `POST /api/groups/:groupId/approve`

**Request:**
```json
{
    "approvalMessage": "Approved - meets all requirements"
}
```

**Headers:**
```
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
    "message": "Group approved successfully",
    "group": {
        "id": "grp_abc123",
        "status": "active",
        "approvedAt": "2026-01-19T12:00:00Z",
        "approvedBy": "admin_id_123"
    }
}
```

**Response (403 Forbidden):**
```json
{
    "error": "Only site administrators can approve groups"
}
```

---

## 💡 Best Practices

✅ **Review promptly:** Don't let requests sit too long  
✅ **Provide feedback:** Tell leaders why you approve/reject  
✅ **Be consistent:** Apply same standards to all requests  
✅ **Document decisions:** Keep records for audit trail  
✅ **Communicate clearly:** Send detailed notifications  
✅ **Set expectations:** Explain approval timeline upfront  
✅ **Monitor patterns:** Watch for suspicious behavior  
✅ **Request changes:** Rather than reject, ask to improve  

---

## 🆘 Support

If you have questions:
- Contact site admin team
- Check documentation
- Review past approval decisions
- Ask for guidance on policies

---

**The tontine approval workflow is designed to ensure only legitimate groups get activated.** 🎯

**For technical details, see: `TONTINE_CREATION_WORKFLOW.md`**
