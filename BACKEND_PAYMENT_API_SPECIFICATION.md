# Backend Implementation Guide for Payment Receipt Upload

## API Endpoints to Implement

### 1. Submit Payment Request (WITH FILE UPLOAD)

**Endpoint:** `POST /api/payments/request`

**Request:**
```
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}

Body (FormData):
- amount: "50000" (number as string)
- method: "mobile" or "bank"
- receipt: <File object>
- groupId: "group_123"
- mobileNumber: "+250781234567" (optional)
- bankDetails: "Account: 1234567890, Bank: XYZ" (optional)
```

**Response (201 Created):**
```json
{
  "id": "preq_abc123def456",
  "status": "pending",
  "amount": 50000,
  "currency": "RWF",
  "method": "mobile",
  "groupId": "group_123",
  "userId": "user_789",
  "receiptUrl": "/uploads/receipts/user_789_preq_abc123_1234567890.pdf",
  "receiptFileName": "screenshot.jpg",
  "receiptMimeType": "image/jpeg",
  "receiptSize": 245678,
  "mobileNumber": "+250781234567",
  "bankDetails": null,
  "notes": "",
  "createdAt": "2024-01-15T10:30:45Z",
  "updatedAt": "2024-01-15T10:30:45Z",
  "leaderNotified": true
}
```

**Error Responses:**

- 400 Bad Request - Missing fields or invalid values
```json
{
  "error": "Validation error",
  "details": {
    "amount": "Amount must be at least 50000",
    "receipt": "Receipt file is required"
  }
}
```

- 401 Unauthorized - Invalid token or not authenticated
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

- 403 Forbidden - User not member of group
```json
{
  "error": "Forbidden",
  "message": "You are not a member of this group"
}
```

- 413 Payload Too Large - File exceeds 5MB
```json
{
  "error": "File too large",
  "message": "File size must not exceed 5MB"
}
```

---

### 2. Get Payment Requests (For Leader/User)

**Endpoint:** `GET /api/payments/requests`

**Query Parameters:**
```
groupId: "group_123" (required for leaders, optional for users)
status: "pending" or "approved" or "rejected" (optional)
limit: 20 (optional, default 20)
offset: 0 (optional, default 0)
```

**Response:**
```json
{
  "total": 5,
  "limit": 20,
  "offset": 0,
  "data": [
    {
      "id": "preq_abc123def456",
      "status": "pending",
      "amount": 50000,
      "method": "mobile",
      "groupId": "group_123",
      "userId": "user_789",
      "userName": "John Doe",
      "receiptUrl": "/uploads/receipts/...",
      "receiptFileName": "payment.jpg",
      "createdAt": "2024-01-15T10:30:45Z",
      "approvedAt": null,
      "approvedBy": null,
      "approverName": null
    },
    {
      "id": "preq_xyz789abc123",
      "status": "approved",
      "amount": 75000,
      "method": "bank",
      "groupId": "group_123",
      "userId": "user_321",
      "userName": "Jane Smith",
      "receiptUrl": "/uploads/receipts/...",
      "receiptFileName": "receipt.pdf",
      "createdAt": "2024-01-14T15:20:30Z",
      "approvedAt": "2024-01-15T11:45:00Z",
      "approvedBy": "leader_111",
      "approverName": "Peter Mwase"
    }
  ]
}
```

---

### 3. Approve Payment Request

**Endpoint:** `POST /api/payments/requests/{requestId}/approve`

**Headers:**
```
Authorization: Bearer {leader_jwt_token}
```

**Request Body:**
```json
{
  "approved": true,
  "notes": "Receipt verified. Payment is valid."
}
```

**Response (200 OK):**
```json
{
  "id": "preq_abc123def456",
  "status": "approved",
  "amount": 50000,
  "method": "mobile",
  "groupId": "group_123",
  "userId": "user_789",
  "approvedAt": "2024-01-15T11:00:00Z",
  "approvedBy": "leader_111",
  "approverName": "Peter Mwase",
  "notes": "Receipt verified. Payment is valid.",
  "nextAction": "Payment will be recorded to database"
}
```

**Error Responses:**

- 403 Forbidden - Only group leader can approve
```json
{
  "error": "Forbidden",
  "message": "Only group leader can approve payments"
}
```

- 404 Not Found - Payment request doesn't exist
```json
{
  "error": "Not found",
  "message": "Payment request not found"
}
```

- 409 Conflict - Already approved/rejected
```json
{
  "error": "Conflict",
  "message": "This payment request has already been processed"
}
```

---

### 4. Reject Payment Request

**Endpoint:** `POST /api/payments/requests/{requestId}/reject`

**Headers:**
```
Authorization: Bearer {leader_jwt_token}
```

**Request Body:**
```json
{
  "reason": "Receipt image is unclear. Please resubmit with better quality."
}
```

**Response (200 OK):**
```json
{
  "id": "preq_abc123def456",
  "status": "rejected",
  "amount": 50000,
  "method": "mobile",
  "groupId": "group_123",
  "userId": "user_789",
  "rejectedAt": "2024-01-15T11:00:00Z",
  "rejectedBy": "leader_111",
  "rejectionReason": "Receipt image is unclear. Please resubmit with better quality.",
  "canResubmit": true
}
```

---

### 5. Record Approved Payment to Database

**Endpoint:** `POST /api/payments/requests/{requestId}/record`

**Headers:**
```
Authorization: Bearer {admin_jwt_token}  (or automated by system)
```

**Response (200 OK):**
```json
{
  "paymentId": "pay_abc123def456",
  "requestId": "preq_abc123def456",
  "status": "recorded",
  "amount": 50000,
  "recordedAt": "2024-01-15T11:05:00Z",
  "contributionUpdated": true,
  "newContributionTotal": 150000
}
```

---

### 6. Get Receipt File

**Endpoint:** `GET /api/payments/receipts/{fileId}`

**Response:** File download (Content-Type varies: image/jpeg, application/pdf, etc.)

**Error:**
- 404 Not Found - Receipt doesn't exist
- 403 Forbidden - User doesn't have permission to view receipt

---

## Database Schema

### Table: `payment_requests`

```sql
CREATE TABLE payment_requests (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  group_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',
  payment_method VARCHAR(20) NOT NULL,  -- 'mobile', 'bank'
  mobile_number VARCHAR(20),
  bank_details TEXT,
  
  -- Receipt file info
  receipt_filename VARCHAR(255) NOT NULL,
  receipt_mime_type VARCHAR(50) NOT NULL,
  receipt_size INT NOT NULL,
  receipt_path VARCHAR(500) NOT NULL,  -- e.g., /uploads/receipts/...
  receipt_url VARCHAR(500),
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, approved, rejected, recorded
  notes TEXT,
  
  -- Leader approval
  approved_by VARCHAR(50),
  approved_at DATETIME,
  rejection_reason TEXT,
  rejected_at DATETIME,
  
  -- Recording
  payment_id VARCHAR(50),  -- Link to final payment record
  recorded_at DATETIME,
  
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX (group_id),
  INDEX (user_id),
  INDEX (status),
  INDEX (created_at)
);
```

### Table: `payments` (Updated)

```sql
-- Add new fields to existing payments table or create separate record
ALTER TABLE payments ADD COLUMN (
  request_id VARCHAR(50),
  receipt_verified BOOLEAN DEFAULT FALSE,
  verified_by VARCHAR(50),
  verified_at DATETIME,
  FOREIGN KEY (request_id) REFERENCES payment_requests(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);
```

---

## File Upload Handling

### Directory Structure
```
/uploads/
  /receipts/
    /user_789/
      - user_789_preq_abc123_1234567890.pdf
      - user_789_preq_xyz789_1234567891.jpg
```

### Filename Format
```
{userId}_{requestId}_{timestamp}.{extension}

Example: user_789_preq_abc123_1705329045.pdf
```

### Security Measures

1. **Validate MIME type:**
   ```javascript
   const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
   if (!allowedMimes.includes(file.mimetype)) {
     throw new Error('Invalid file type');
   }
   ```

2. **Check file extension:**
   ```javascript
   const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
   if (!allowedExts.includes(path.extname(filename).toLowerCase())) {
     throw new Error('Invalid file extension');
   }
   ```

3. **Validate file size:**
   ```javascript
   const maxSize = 5 * 1024 * 1024; // 5MB
   if (file.size > maxSize) {
     throw new Error('File too large');
   }
   ```

4. **Store outside public folder** (optional for privacy)
   - Access via authenticated endpoint only
   - Use unique filename to prevent guessing

5. **Scan for malware** (optional but recommended)
   - Use ClamAV or similar
   - Quarantine suspicious files

---

## Notification System

### Notify Group Leader

When payment request is created:

```javascript
// Send notification to group leader
const notification = {
  type: 'payment_request',
  title: 'New Payment Request',
  message: `${userName} submitted a payment of ${amount} RWF for approval`,
  actionUrl: `/leader-dashboard#pending-payments`,
  requestId: paymentRequest.id,
  userId: user_id,
  groupId: group_id,
  amount: amount,
  createdAt: new Date()
};

// Store in notifications table and send real-time alert
```

### Notify User of Approval/Rejection

```javascript
const notification = {
  type: 'payment_status',
  title: status === 'approved' ? 'Payment Approved' : 'Payment Rejected',
  message: status === 'approved' 
    ? `Your payment of ${amount} RWF has been approved` 
    : `Your payment request was rejected: ${rejectionReason}`,
  actionUrl: `/user-dashboard#contributions`,
  requestId: paymentRequest.id,
  status: status,
  createdAt: new Date()
};
```

---

## Processing Workflow

```
1. User submits form with receipt
   ↓
2. Backend validates file (type, size, MIME)
   ↓
3. Save file to /uploads/receipts/
   ↓
4. Create payment_request record (status: pending)
   ↓
5. Send notification to group leader
   ↓
6. Return success to frontend
   ↓
7. Frontend shows "Request sent" message
   ↓
8. [LEADER DASHBOARD]
   ↓
9. Leader sees pending payment in dashboard
   ↓
10. Leader reviews receipt
   ↓
11. Leader clicks Approve/Reject
   ↓
12. Backend updates payment_request status
   ↓
13. If approved: Create final payment record
   ↓
14. Send notification to user
   ↓
15. User sees payment confirmed in dashboard
```

---

## Error Handling Checklist

- [ ] Invalid JWT token
- [ ] User not authenticated
- [ ] User not member of group
- [ ] Missing required fields
- [ ] Amount below minimum (50,000 RWF)
- [ ] File not included
- [ ] File type invalid
- [ ] File size exceeds limit
- [ ] File upload fails
- [ ] Database write fails
- [ ] Notification send fails
- [ ] Concurrent approval attempts
- [ ] Request already processed
- [ ] Request not found
- [ ] Leader no longer has permission

---

## Testing with cURL

```bash
# Submit payment request
curl -X POST http://localhost:5000/api/payments/request \
  -H "Authorization: Bearer {jwt_token}" \
  -F "amount=50000" \
  -F "method=mobile" \
  -F "groupId=group_123" \
  -F "receipt=@/path/to/receipt.pdf"

# Get pending payments for leader
curl -X GET "http://localhost:5000/api/payments/requests?groupId=group_123&status=pending" \
  -H "Authorization: Bearer {leader_token}"

# Approve payment
curl -X POST http://localhost:5000/api/payments/requests/preq_abc123/approve \
  -H "Authorization: Bearer {leader_token}" \
  -H "Content-Type: application/json" \
  -d '{"approved": true, "notes": "Verified"}'

# Record payment
curl -X POST http://localhost:5000/api/payments/requests/preq_abc123/record \
  -H "Authorization: Bearer {admin_token}"
```

---

## Next Frontend Tasks

1. **Leader Dashboard** - Add pending payments section
2. **Payment History** - Show payment status (pending/approved/rejected)
3. **Receipt Preview** - Modal to view uploaded receipt
4. **Notification Badge** - Show pending payment count
5. **Resubmit Option** - Allow resubmitting rejected payments

---

## Performance Considerations

- Store receipt path in database (don't re-read from disk each time)
- Cache leader's pending payments list
- Limit payment request history to last 3 months by default
- Use pagination for large lists
- Consider CDN for receipt file delivery
- Archive old completed payments monthly
