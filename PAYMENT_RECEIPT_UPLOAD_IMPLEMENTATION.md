# Payment Receipt Upload Implementation

## Overview
Enhanced the payment workflow to require receipt uploads with leader verification before payments are recorded to the database.

## Changes Made

### 1. **Enhanced Payment Modal UI** (Lines 1193-1263)
   - Added file upload section with drag-and-drop styling
   - File input filters: `.pdf, .jpg, .jpeg, .png`
   - Maximum file size: 5MB (with UI indication)
   - File preview section showing filename and remove button
   - Changed button from "Pay Now" to "Send Request"
   - Added informational message about leader verification

### 2. **Replaced `processPayment()` with `submitPaymentRequest()`** (Lines 1725-1795)

   **Functionality:**
   - Validates amount (minimum 50,000 RWF)
   - Validates payment method selected
   - Validates receipt file is uploaded
   - Validates file type (PDF, JPG, PNG only)
   - Validates file size (max 5MB)
   - Creates FormData with multipart file upload
   - Includes optional mobile/bank details
   - Sends POST request to `http://localhost:5000/api/payments/request`
   - Shows loading indicator during submission
   - Closes modal and clears form on success
   - Handles errors with user-friendly messages

   **API Integration:**
   ```javascript
   POST /api/payments/request
   Headers: Authorization: Bearer {token}
   Body: FormData with:
     - amount
     - method
     - receipt (file)
     - groupId
     - mobileNumber (optional)
     - bankDetails (optional)
   ```

### 3. **Added `clearReceiptUpload()` Function** (Lines 1797-1801)
   - Clears the file input value
   - Hides the preview section
   - Shows the upload area again

### 4. **Added `clearPaymentForm()` Function** (Lines 1803-1811)
   - Resets all form fields:
     - paymentAmount
     - paymentMethod
     - paymentMobile
     - paymentBank
   - Calls `clearReceiptUpload()` to reset file upload

### 5. **Added File Input Event Listener** (Lines 1604-1626)
   - Listens to `change` event on `#paymentReceipt` input
   - Client-side file validation:
     - Validates file type (PDF, JPG, PNG only)
     - Validates file size (max 5MB)
     - Shows error alerts if validation fails
   - On successful validation:
     - Hides upload area
     - Shows preview section
     - Displays filename in `#receiptFileName`

## User Workflow

### Current (Old) Flow:
```
User fills form → Clicks "Pay Now" → Payment processed immediately
```

### New Flow:
```
1. User fills payment form
2. Selects payment method (Mobile/Bank)
3. Uploads receipt (JPG, PNG, or PDF)
   - File preview shows with filename
4. Clicks "Send Request" button
5. Request sent to backend with:
   - Amount, method, payment details
   - Receipt file (multipart)
6. Backend creates payment request (status: pending)
7. Backend notifies group leader
8. Leader approves in leader-dashboard
9. Payment recorded to database
10. User receives confirmation
```

## Translation Keys Added
- `amountRequired`: "Please enter amount"
- `methodRequired`: "Please select payment method"
- `receiptRequired`: "Please upload a payment receipt"
- `invalidFileType`: "Please upload a PDF or image file (JPG, PNG)"
- `fileTooLarge`: "File size must be less than 5MB"
- `sending`: "Sending..."
- `paymentRequestSent`: "Payment request sent to leader for approval. We will notify you once it is verified."
- `errorSubmittingPayment`: "Error: [error message]"

## Backend Requirements

### 1. **Payment Request Endpoint**
```
POST /api/payments/request
Content-Type: multipart/form-data

Required Fields:
- amount: number (>= 50000)
- method: string ("mobile" or "bank")
- receipt: file (PDF/JPG/PNG, max 5MB)
- groupId: string

Optional Fields:
- mobileNumber: string
- bankDetails: string

Response:
{
  "id": "request_id",
  "status": "pending",
  "amount": 50000,
  "method": "mobile",
  "groupId": "group_id",
  "userId": "user_id",
  "receiptUrl": "/uploads/receipts/...",
  "createdAt": "2024-..."
}
```

### 2. **Payment Approval Endpoint** (Not yet implemented on frontend)
```
POST /api/payments/approve/{requestId}
Headers: Authorization: Bearer {leader_token}

Body:
{
  "approved": true/false,
  "notes": "optional notes"
}

Response:
{
  "id": "request_id",
  "status": "approved/rejected",
  "updatedAt": "2024-..."
}
```

### 3. **Payment Recording Endpoint** (Not yet implemented on frontend)
```
POST /api/payments/record/{requestId}

Response:
{
  "id": "payment_id",
  "status": "recorded",
  "recordedAt": "2024-...",
  "contributionUpdated": true
}
```

## File Storage

The backend should:
1. Accept multipart file uploads in `receipt` field
2. Validate file type and size on server-side (security)
3. Store file in `/uploads/receipts/` directory
4. Generate secure URL for file access
5. Store filename/path reference in payment_requests table

## Security Considerations

✅ **Frontend Validation:**
- File type checking (MIME type)
- File size validation (5MB limit)
- Amount validation (min 50,000 RWF)

⚠️ **Backend Validation Needed:**
- Re-validate file type and size
- Re-validate all form fields
- Verify user is member of group
- Verify user token and permissions
- Scan file for malware (optional but recommended)
- Verify JWT token validity

## Testing Checklist

- [ ] Click "Make Payment" button - modal opens
- [ ] Select payment method (Mobile Money/Bank Transfer)
  - [ ] Mobile Money shows mobile field
  - [ ] Bank Transfer shows bank field
- [ ] Click upload area - file dialog opens
- [ ] Select file - preview shows filename
- [ ] Try uploading >5MB file - error alert shows
- [ ] Try uploading invalid file type - error alert shows
- [ ] Upload valid receipt (PDF/JPG/PNG) - preview displays
- [ ] Click "Remove" button - preview clears, upload area shows
- [ ] Fill all fields and click "Send Request" - loading spinner shows
- [ ] Verify API call in browser network tab
- [ ] Verify FormData includes all fields including file
- [ ] On success:
  - [ ] Modal closes
  - [ ] Form clears
  - [ ] Success message shows
  - [ ] Dashboard refreshes
- [ ] On error:
  - [ ] Error message shows
  - [ ] Form stays open for retry
  - [ ] File remains selected

## Next Steps

1. **Create Backend Endpoints** (Critical)
   - `/api/payments/request` - POST payment request with file
   - `/api/payments/approve/{id}` - Leader approves/rejects
   - `/api/payments/record/{id}` - Record payment to database

2. **Create Leader Dashboard Interface**
   - Add "Pending Payments" section in `leader-dashboard.html`
   - Show list of payment requests awaiting approval
   - Display receipt preview
   - Approve/reject buttons
   - Notes field for leader comments

3. **Add Notification System**
   - Notify leader when payment request received
   - Notify user when payment approved/rejected
   - Update status in user dashboard

4. **Add Payment History Tracking**
   - Show pending payment requests in user dashboard
   - Show payment status (pending/approved/rejected)
   - Show receipts in contribution history

5. **Add Receipt Preview Modal**
   - Click on receipt in history to view it
   - Download receipt option
   - Share receipt with group

## Code Files Modified

- **user-dashboard.html**
  - Lines 1193-1263: Payment modal HTML (enhanced with file upload)
  - Lines 1698-1730: Modal open/close functions (unchanged)
  - Lines 1725-1795: submitPaymentRequest() function (REPLACED processPayment)
  - Lines 1797-1811: clearReceiptUpload() & clearPaymentForm() functions (NEW)
  - Lines 1604-1626: File input event listener (NEW)

## Deployment Notes

1. Ensure file upload directory exists: `/uploads/receipts/`
2. Set proper permissions on upload directory (writable by app)
3. Configure max file size in server (e.g., 5MB)
4. Add CORS headers if frontend/backend on different domains
5. Configure JWT token validation for payment endpoints
6. Add file cleanup task to remove old receipts periodically
7. Consider CDN/cloud storage for scalability

## Success Criteria

✅ User can upload receipt file (JPG/PNG/PDF)
✅ File preview shows filename after selection
✅ Form validates before submission
✅ Payment request sent to backend with file
✅ Leader receives notification of pending payment
✅ Leader can approve/reject payment
✅ Payment recorded to database after approval
✅ User notified of approval/rejection
✅ Payment appears in contribution history

## Related Files

- `leader-dashboard.html` - (Future) Add payment approval interface
- Backend API - Payment request/approval/recording endpoints
- Database schema - payment_requests table (if needed)
- Notification system - Alert leaders of pending payments
