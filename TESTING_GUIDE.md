# Payment Receipt Upload - Testing Guide

## Quick Test Steps

### 1. Open Payment Modal
- Navigate to user dashboard
- Click "💳 Make Payment" in sidebar menu
- ✅ Payment modal should open
- ✅ Form fields visible (Amount, Method, Receipt Upload)
- ✅ "Send Request" button visible

### 2. Test Payment Method Toggle
- In modal, select "Mobile Money" from dropdown
  - ✅ Mobile Number field appears
  - ✅ Bank Details field hidden
- Select "Bank Transfer"
  - ✅ Bank Details field appears
  - ✅ Mobile Number field hidden

### 3. Test File Upload - UI
- Click on the dashed border upload area
  - ✅ File dialog opens
- Select a PDF or image file (JPG/PNG)
  - ✅ Upload area disappears
  - ✅ File preview shows with filename
  - ✅ "Remove" button visible
- Click "Remove" button
  - ✅ Preview disappears
  - ✅ Upload area appears again

### 4. Test File Validation - Client Side
**Test: Invalid file type**
- Try uploading a .docx or .txt file
  - ✅ Alert: "Please select a PDF or image file (JPG, PNG)"
  - ✅ File not selected

**Test: File too large**
- Try uploading a file > 5MB
  - ✅ Alert: "File size must be less than 5MB"
  - ✅ File not selected

**Test: Valid file**
- Upload a JPG, PNG, or PDF < 5MB
  - ✅ File preview shows
  - ✅ Filename displayed

### 5. Test Form Validation
**Test: Missing amount**
- Leave amount blank
- Click "Send Request"
  - ✅ Alert: "Please enter amount"

**Test: Amount too low**
- Enter 25000 (below 50,000 minimum)
- Click "Send Request"
  - ✅ Alert: "Minimum amount is 50,000 RWF"

**Test: Missing method**
- Don't select payment method
- Fill other fields
- Click "Send Request"
  - ✅ Alert: "Please select payment method"

**Test: Missing receipt**
- Fill all fields except receipt
- Click "Send Request"
  - ✅ Alert: "Please upload a payment receipt"

### 6. Test Successful Submission (Requires Backend)
**Assuming backend endpoint is ready:**
- Fill form:
  - Amount: 50000
  - Method: Mobile Money
  - Mobile: +250781234567
  - Receipt: Valid PDF/image
- Click "Send Request"
  - ✅ Button shows loading spinner
  - ✅ Button disabled
  - ✅ Network request visible in DevTools
  - ✅ Success message appears
  - ✅ Modal closes
  - ✅ Form clears

### 7. Test Form Clearing
After successful submission:
- Open payment modal again
  - ✅ Amount field is empty
  - ✅ Method is reset to default
  - ✅ Mobile/Bank fields hidden
  - ✅ Receipt upload area shows (no file selected)

### 8. Browser Console Verification
Open DevTools (F12) → Console tab:
- When file is selected:
  - ✅ No errors
  - ✅ File object logged (if you add console.log)
- When form submitted:
  - ✅ Network request shows in Network tab
  - ✅ FormData includes all fields
  - ✅ Authorization header present (Bearer token)
  - ✅ File data in request body

### 9. Network Tab Inspection
In DevTools → Network tab:
- Submit payment request
- Look for POST request to `/api/payments/request`
- Check request:
  - ✅ Method: POST
  - ✅ Content-Type: multipart/form-data
  - ✅ Authorization: Bearer {token}
  - ✅ FormData includes:
    - amount
    - method
    - receipt (file)
    - groupId
    - mobileNumber (if provided)
- Check response:
  - ✅ Status 201 Created (if backend ready)
  - ✅ Contains request ID
  - ✅ Status: "pending"

---

## Test Scenarios

### Scenario 1: Happy Path
1. Open modal
2. Fill amount: 50000
3. Select method: Mobile Money
4. Enter mobile: +250781234567
5. Upload receipt: sample.pdf
6. Click "Send Request"
✅ Expected: Success, modal closes, confirmation message

### Scenario 2: Invalid File
1. Open modal
2. Try to upload: document.docx
✅ Expected: Error alert, file not selected

### Scenario 3: Large File
1. Open modal
2. Try to upload: 10mb_video.mp4
✅ Expected: Error alert, file not selected

### Scenario 4: Incomplete Form
1. Open modal
2. Enter amount: 100000
3. Leave method empty
4. Skip receipt
5. Click "Send Request"
✅ Expected: Validation error alerts

### Scenario 5: Submit and Retry
1. Complete form
2. Click "Send Request" → Success
3. Open modal again
✅ Expected: All fields cleared, ready for new request

### Scenario 6: Remove File and Reupload
1. Upload receipt.pdf
2. Click "Remove"
3. Upload screenshot.jpg
4. Click "Send Request"
✅ Expected: New file sent (screenshot.jpg, not receipt.pdf)

---

## Backend Testing (When Available)

### Test Endpoint Response
```bash
# Using cURL to test backend
curl -X POST http://localhost:5000/api/payments/request \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -F "amount=50000" \
  -F "method=mobile" \
  -F "groupId=group_123" \
  -F "mobileNumber=+250781234567" \
  -F "receipt=@/path/to/receipt.pdf"
```

Expected response:
```json
{
  "id": "preq_abc123",
  "status": "pending",
  "amount": 50000,
  "method": "mobile",
  "receiptUrl": "/uploads/receipts/...",
  "createdAt": "2024-01-15T10:30:45Z",
  "leaderNotified": true
}
```

### Check Leader Notification
1. Open leader-dashboard.html
2. Look for pending payments notification
3. Should show payment request from user

---

## Troubleshooting

### Issue: File preview doesn't appear
- **Check:** File selected was valid type and size
- **Solution:** Check browser console for errors
- **Debug:** Add `console.log('File:', this.files[0])` in event listener

### Issue: "Send Request" button not responding
- **Check:** All form fields filled
- **Check:** Receipt file selected
- **Check:** Amount >= 50000
- **Solution:** Check browser console for JavaScript errors

### Issue: Network request shows 404
- **Check:** Backend endpoint URL correct
- **Solution:** Verify `/api/payments/request` endpoint exists on backend
- **Debug:** Check backend logs

### Issue: FormData not sending file
- **Check:** File input has ID `paymentReceipt`
- **Check:** File selected (not empty)
- **Solution:** Verify `document.getElementById('paymentReceipt').files[0]` returns file

### Issue: CORS error
- **Check:** Backend has CORS configured
- **Check:** Correct origin in CORS headers
- **Solution:** Backend must allow requests from frontend domain

### Issue: Token errors
- **Check:** User logged in
- **Check:** Token in localStorage
- **Check:** Token not expired
- **Solution:** Re-login if needed

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Can tab to all form fields
- [ ] Can select file using keyboard
- [ ] Can submit form using Enter key
- [ ] Can close modal using Escape key

### Screen Reader Testing
- [ ] Form labels associated with inputs
- [ ] File upload area has accessible label
- [ ] Success/error messages announced
- [ ] Button loading state announced

---

## Performance Testing

### File Upload Performance
- [ ] 5MB file uploads in < 30 seconds
- [ ] UI doesn't freeze during upload
- [ ] Cancel button works during upload
- [ ] Progress indication visible

### Form Response Time
- [ ] Form validation < 100ms
- [ ] File preview appears instantly
- [ ] Modal opens/closes smoothly

---

## Mobile Testing

### On Mobile Device/Browser
- [ ] File upload opens device file selector
- [ ] Can select from Photos
- [ ] Can select from Files app
- [ ] Form fields responsive
- [ ] Modal readable on small screen
- [ ] Buttons easily clickable

---

## Security Testing

### SQL Injection
- [ ] Try entering SQL in form fields
- [ ] Application should handle safely

### File Upload Security
- [ ] Only PDF/JPG/PNG accepted
- [ ] Large files rejected
- [ ] Invalid extensions rejected
- [ ] No executable files accepted

### Authentication
- [ ] Unauthenticated user can't submit
- [ ] Invalid token rejected
- [ ] Expired token handled gracefully

---

## Documentation Files Created

1. **PAYMENT_RECEIPT_UPLOAD_IMPLEMENTATION.md**
   - Overview of changes
   - User workflow
   - Backend requirements
   - Testing checklist

2. **BACKEND_PAYMENT_API_SPECIFICATION.md**
   - API endpoint specifications
   - Database schema
   - File upload handling
   - Notification system
   - Error handling

3. **TESTING_GUIDE.md** (this file)
   - Quick test steps
   - Test scenarios
   - Troubleshooting guide

---

## Success Criteria

✅ File upload area visible in payment modal
✅ Can select files (filtered to PDF/JPG/PNG)
✅ File preview shows after selection
✅ Remove button clears file
✅ Form validates all fields
✅ "Send Request" button works
✅ Loading indicator shows during submission
✅ Success message displays
✅ Modal closes and form clears
✅ Network request includes file
✅ Backend receives complete data
✅ Payment request created with pending status
✅ Leader notified of pending payment

---

## Next Steps After Implementation

1. ✅ Frontend implementation complete
2. ⏳ Backend endpoints implementation
3. ⏳ Leader approval interface
4. ⏳ Payment recording logic
5. ⏳ Notification system
6. ⏳ Integration testing
7. ⏳ User acceptance testing
8. ⏳ Deploy to production
