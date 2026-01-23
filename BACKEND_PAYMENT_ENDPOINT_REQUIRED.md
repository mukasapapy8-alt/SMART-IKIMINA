# Backend Implementation Required: Payment Request Endpoint

## Status

**Current State:** ❌ Endpoint not implemented (404 Not Found)
**Error Message:** `Failed to load resource: the server responded with a status of 404`
**Endpoint:** `POST /api/payments/request`

---

## What Needs to Be Done

The backend needs to implement the payment request endpoint to accept file uploads and process payment requests from users.

---

## Endpoint Specification

### `POST /api/payments/request`

**Purpose:** Accept payment requests with receipt file uploads from users

**Request Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}
```

**Request Body (FormData):**
```
amount: "50000" (string representation of number)
method: "mobile" (or "bank" or "cash")
receipt: [File object] (binary file)
groupId: "group_123"
mobileNumber: "+250781234567" (optional)
bankDetails: "Account: 1234567890" (optional)
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
  "receiptUrl": "/uploads/receipts/user_789_preq_abc123_1705329045.pdf",
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

- **400 Bad Request:** Validation failed
```json
{
  "error": "Validation error",
  "details": {
    "amount": "Amount must be at least 50000",
    "receipt": "Receipt file is required"
  }
}
```

- **401 Unauthorized:** Invalid or missing token
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

- **403 Forbidden:** User not member of group
```json
{
  "error": "Forbidden",
  "message": "You are not a member of this group"
}
```

- **413 Payload Too Large:** File exceeds 5MB
```json
{
  "error": "File too large",
  "message": "File size must not exceed 5MB"
}
```

---

## Implementation Guide

### Step 1: Create Route Handler

**File:** `routes/payments.js` or similar

```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');
const authenticate = require('../middleware/authenticate');
const paymentController = require('../controllers/paymentController');

// Configure multer for file upload
const upload = multer({
  dest: 'uploads/receipts/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Submit payment request with receipt
router.post('/request', authenticate, upload.single('receipt'), paymentController.submitPaymentRequest);

module.exports = router;
```

### Step 2: Register Routes in App

**File:** `app.js` or `server.js`

```javascript
const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);
```

### Step 3: Create Controller

**File:** `controllers/paymentController.js`

```javascript
const PaymentRequest = require('../models/PaymentRequest');
const Group = require('../models/Group');
const User = require('../models/User');

exports.submitPaymentRequest = async (req, res) => {
  try {
    // Validate required fields
    const { amount, method, groupId, mobileNumber, bankDetails } = req.body;
    
    if (!amount || amount < 50000) {
      return res.status(400).json({ error: 'Amount must be at least 50,000 RWF' });
    }
    
    if (!method) {
      return res.status(400).json({ error: 'Payment method is required' });
    }
    
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Receipt file is required' });
    }
    
    // Verify user is member of group
    const group = await Group.findById(groupId).populate('members');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const isMember = group.members.some(m => m.userId.toString() === req.user.id && m.status === 'approved');
    if (!isMember && group.leaderId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }
    
    // Create payment request record
    const paymentRequest = new PaymentRequest({
      userId: req.user.id,
      groupId: groupId,
      amount: parseInt(amount),
      method: method,
      receiptFileName: req.file.originalname,
      receiptMimeType: req.file.mimetype,
      receiptSize: req.file.size,
      receiptPath: req.file.path,
      receiptUrl: `/uploads/receipts/${req.file.filename}`,
      mobileNumber: mobileNumber || null,
      bankDetails: bankDetails || null,
      status: 'pending'
    });
    
    await paymentRequest.save();
    
    // TODO: Send notification to group leader
    // notificationService.notifyLeader(groupId, {...});
    
    res.status(201).json({
      id: paymentRequest._id,
      status: paymentRequest.status,
      amount: paymentRequest.amount,
      method: paymentRequest.method,
      groupId: paymentRequest.groupId,
      userId: paymentRequest.userId,
      receiptUrl: paymentRequest.receiptUrl,
      receiptFileName: paymentRequest.receiptFileName,
      createdAt: paymentRequest.createdAt,
      leaderNotified: true
    });
    
  } catch (error) {
    console.error('Payment request error:', error);
    res.status(500).json({ error: 'Failed to submit payment request', details: error.message });
  }
};
```

### Step 4: Create Data Model

**File:** `models/PaymentRequest.js`

```javascript
const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 50000
  },
  currency: {
    type: String,
    default: 'RWF'
  },
  method: {
    type: String,
    enum: ['mobile', 'bank', 'cash'],
    required: true
  },
  receiptFileName: String,
  receiptMimeType: String,
  receiptSize: Number,
  receiptPath: String,
  receiptUrl: String,
  mobileNumber: String,
  bankDetails: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'recorded'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  rejectedAt: Date,
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  recordedAt: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
```

### Step 5: Setup Directory for File Uploads

```bash
mkdir -p uploads/receipts
chmod 755 uploads/receipts
```

---

## Installation Requirements

### NPM Packages

```bash
npm install multer
```

### File Upload Directory

Create if not exists:
```
project_root/
└── uploads/
    └── receipts/
```

---

## Testing with cURL

```bash
curl -X POST http://localhost:5000/api/payments/request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "amount=50000" \
  -F "method=mobile" \
  -F "groupId=group_123" \
  -F "mobileNumber=+250781234567" \
  -F "receipt=@/path/to/receipt.pdf"
```

---

## Frontend Integration

### Current Frontend Behavior

The frontend sends:
- **Method:** POST
- **URL:** `http://localhost:5000/api/payments/request`
- **Headers:** 
  - Authorization: Bearer {token}
  - (multer automatically sets Content-Type)
- **Body:** FormData with:
  - amount
  - method
  - receipt (file)
  - groupId
  - mobileNumber (if provided)
  - bankDetails (if provided)

### Frontend Error Handling

Enhanced to show:
- ✅ 404 Error: "Payment endpoint not yet implemented on backend"
- ✅ 401 Error: "Unauthorized. Your session may have expired"
- ✅ 403 Error: "You do not have permission to submit payment requests"
- ✅ Other errors with status code

---

## Database Schema Requirements

**PaymentRequest Collection/Table:**

```sql
CREATE TABLE payment_requests (
  id VARCHAR(50) PRIMARY KEY,
  userId VARCHAR(50) NOT NULL,
  groupId VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',
  method VARCHAR(20) NOT NULL,
  receiptFileName VARCHAR(255),
  receiptMimeType VARCHAR(50),
  receiptSize INT,
  receiptPath VARCHAR(500),
  receiptUrl VARCHAR(500),
  mobileNumber VARCHAR(20),
  bankDetails TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approvedBy VARCHAR(50),
  approvedAt DATETIME,
  rejectionReason TEXT,
  rejectedAt DATETIME,
  paymentId VARCHAR(50),
  recordedAt DATETIME,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (groupId) REFERENCES groups(id),
  FOREIGN KEY (approvedBy) REFERENCES users(id),
  
  INDEX (groupId),
  INDEX (userId),
  INDEX (status),
  INDEX (createdAt)
);
```

---

## Security Considerations

- ✅ **Authentication:** Require valid JWT token
- ✅ **Authorization:** Verify user is member of group
- ✅ **File Validation:** 
  - Check MIME type
  - Limit file size (5MB)
  - Rename files to prevent overwrite
- ✅ **Data Validation:** 
  - Amount >= 50,000
  - Valid group ID
  - Valid payment method
- ✅ **Error Handling:** Don't expose system paths or sensitive info

---

## Deployment Checklist

- [ ] Route handler created
- [ ] Controller implemented
- [ ] Data model created
- [ ] Database migrations run
- [ ] File upload directory created with proper permissions
- [ ] Multer configured
- [ ] Tests written and passing
- [ ] Error handling implemented
- [ ] File cleanup scheduled (old receipts)
- [ ] CDN/storage configured (if using cloud storage)
- [ ] Logging added
- [ ] Documentation updated

---

## Next Steps for Backend Team

1. Create `/api/payments/request` POST endpoint
2. Implement file upload handling
3. Create PaymentRequest model/schema
4. Add database table/collection
5. Test with cURL
6. Test with frontend (user-dashboard.html)
7. Implement notification system
8. Add payment approval endpoints
9. Add payment recording endpoints

---

## Frontend Status

✅ Payment modal UI complete with file upload
✅ Form validation implemented
✅ File preview working
✅ API call ready to send
✅ Error handling enhanced to show endpoint missing message
✅ Ready for backend integration once endpoint exists

---

## Current Error

**Frontend is working correctly.** The 404 error indicates the backend endpoint simply needs to be implemented.

**Error Message Seen:**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
localhost:5000/api/payments/request
```

**This is expected** until the backend endpoint is created.

---

**Priority:** HIGH - Blocks payment workflow from functioning end-to-end

**Estimated Time to Implement:** 2-4 hours for backend team

**Frontend Ready:** YES ✅
**Waiting for:** Backend implementation
