# Payment Receipt Upload - Visual Guide

## User Experience Flow

### Step 1: Open Payment Modal
```
User Dashboard
└─ Sidebar Menu
   └─ 💳 Make Payment ← User clicks here
      └─ Payment Modal Opens
```

### Step 2: Payment Modal Appears
```
┌─────────────────────────────────────┐
│ Make a Payment                      │
├─────────────────────────────────────┤
│                                     │
│ Upload your payment receipt for    │
│ verification by your group leader  │
│                                     │
│ Amount (RWF)     [_____________]  │
│                                     │
│ Payment Method   [Select ▼]        │
│                                     │
│ Mobile Number    [_____________]   │
│ (shown if Mobile selected)          │
│                                     │
│ Bank Details     [_____________]   │
│ (shown if Bank selected)            │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ Upload Payment Receipt        │  │
│ │  📎 Click to upload or        │  │
│ │     drag and drop             │  │
│ │                               │  │
│ │ Accepted: PDF, JPG, PNG       │  │
│ │ Max size: 5MB                 │  │
│ └───────────────────────────────┘  │
│                                     │
│ Important: Receipt will be        │
│ verified by group leader          │
│                                     │
│              [Send Request]  [X]   │
└─────────────────────────────────────┘
```

### Step 3: After File Selection
```
┌─────────────────────────────────────┐
│ Make a Payment                      │
├─────────────────────────────────────┤
│                                     │
│ [Form fields...]                   │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ ✓ receipt.pdf                 │  │
│ │ 🎉 File uploaded successfully │  │
│ │              [Remove]         │  │
│ └───────────────────────────────┘  │
│                                     │
│              [Send Request]  [X]   │
└─────────────────────────────────────┘
```

### Step 4: Sending Request
```
┌─────────────────────────────────────┐
│ Make a Payment                      │
├─────────────────────────────────────┤
│                                     │
│ [Form fields...]                   │
│                                     │
│    [⏳ Sending...]  [X]            │
│ (Button disabled, loading spinner)  │
│                                     │
└─────────────────────────────────────┘
```

### Step 5: Success
```
✅ Success Alert
"Payment request sent to leader for approval. 
We will notify you once it is verified."

Modal closes
Form clears
```

---

## Error Scenarios

### Missing Amount
```
User clicks "Send Request" without amount
└─ Alert appears: ⚠️ "Please enter amount"
└─ Modal stays open
└─ User can fix and retry
```

### Amount Too Low
```
User enters 25000 (< 50000 minimum)
└─ Clicks "Send Request"
└─ Alert appears: ⚠️ "Minimum amount is 50,000 RWF"
└─ Modal stays open
```

### Invalid File Type
```
User selects document.docx
└─ Tries to upload
└─ Alert: ⚠️ "Please select a PDF or image file (JPG, PNG)"
└─ File not selected
└─ Upload area still shows
```

### File Too Large
```
User selects 10mb_video.mp4
└─ Tries to upload
└─ Alert: ⚠️ "File size must be less than 5MB"
└─ File not selected
└─ Upload area still shows
```

### No Receipt Uploaded
```
User fills form but skips receipt
└─ Clicks "Send Request"
└─ Alert: ⚠️ "Please upload a payment receipt"
└─ Modal stays open
```

### Network Error (Backend issue)
```
User completes form correctly
└─ Clicks "Send Request"
└─ Button shows loading spinner
└─ Backend doesn't respond
└─ Alert: ⚠️ "Error: [error details]"
└─ Button re-enabled
└─ User can retry
```

---

## Form Fields Visibility

### Payment Method: Mobile Money Selected
```
┌────────────────────────────────┐
│ Payment Method [Mobile Money ▼]│
├────────────────────────────────┤
│ ✓ Mobile Number                │
│   [+250__________] (visible)   │
│                                │
│ ✗ Bank Details                 │
│   [________________] (hidden)   │
└────────────────────────────────┘
```

### Payment Method: Bank Transfer Selected
```
┌────────────────────────────────┐
│ Payment Method [Bank Transfer ▼]│
├────────────────────────────────┤
│ ✗ Mobile Number                │
│   [+250__________] (hidden)    │
│                                │
│ ✓ Bank Details                 │
│   [________________] (visible)  │
└────────────────────────────────┘
```

---

## Data Flow Visualization

```
User's Browser
│
├─ Form Input
│  ├─ amount: "50000"
│  ├─ method: "mobile"
│  ├─ mobileNumber: "+250781234567"
│  └─ receipt: [File object]
│
└─ Form Validation
   ├─ amount >= 50000? ✓
   ├─ method selected? ✓
   ├─ receipt exists? ✓
   ├─ receipt.type in [jpg, png, pdf]? ✓
   └─ receipt.size <= 5MB? ✓
      │
      └─ All checks pass ✓
         │
         └─ Create FormData
            ├─ amount
            ├─ method
            ├─ receipt (binary)
            ├─ groupId
            ├─ mobileNumber
            └─ [Content-Type: multipart/form-data]
               │
               └─ POST /api/payments/request
                  ├─ Header: Authorization: Bearer {token}
                  ├─ Header: Content-Type: multipart/form-data
                  └─ Body: FormData with file
                     │
                     └─ Backend Processing
                        (Not yet implemented)
                        ├─ Validate file
                        ├─ Store file
                        ├─ Create request record
                        ├─ Set status: pending
                        └─ Notify leader
                           │
                           └─ Response 201
                              ├─ requestId: "preq_abc123"
                              ├─ status: "pending"
                              └─ createdAt: "2024-01-15..."
                                 │
                                 └─ Frontend
                                    ├─ Hide loading spinner
                                    ├─ Show success message
                                    ├─ Close modal
                                    ├─ Clear form
                                    └─ Refresh dashboard
```

---

## File Upload Process

```
Step 1: Click Upload Area
└─ File dialog opens
   └─ User browses system

Step 2: Select File
└─ File selected: "receipt.pdf"
└─ onChange event fires

Step 3: Validate File
├─ Check type: "application/pdf" ✓
├─ Check size: 1.2MB < 5MB ✓
└─ All valid ✓

Step 4: Show Preview
├─ Hide upload area
├─ Show preview section
├─ Display filename
└─ Show "Remove" button

Step 5: Ready to Submit
└─ User reviews form
└─ Clicks "Send Request"
```

---

## Browser Developer Tools View

### Network Tab - Request Details
```
POST /api/payments/request

Request Headers:
  Authorization: Bearer eyJhbGci...
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
  Host: localhost:5000

Request Payload (FormData):
  ----WebKitFormBoundary7MA4YWxkTrZu0gW
  Content-Disposition: form-data; name="amount"
  
  50000
  ----WebKitFormBoundary7MA4YWxkTrZu0gW
  Content-Disposition: form-data; name="method"
  
  mobile
  ----WebKitFormBoundary7MA4YWxkTrZu0gW
  Content-Disposition: form-data; name="receipt"; filename="receipt.pdf"
  Content-Type: application/pdf
  
  [binary file data...]
  ----WebKitFormBoundary7MA4YWxkTrZu0gW
  Content-Disposition: form-data; name="groupId"
  
  group_123
  ----WebKitFormBoundary7MA4YWxkTrZu0gW--

Response (201 Created):
  {
    "id": "preq_abc123",
    "status": "pending",
    "amount": 50000,
    "method": "mobile",
    "receiptUrl": "/uploads/receipts/user_789_preq_abc123_1705329045.pdf"
  }
```

### Console View
```javascript
// When file selected
File: {
  name: "receipt.pdf",
  size: 1234567,
  type: "application/pdf",
  lastModified: 1705329045000
}

// When form submitted
Payment request submitted: {
  id: "preq_abc123",
  status: "pending",
  createdAt: "2024-01-15T10:30:45Z"
}
```

---

## Mobile View

```
┌──────────────────────┐
│ 🔼 User Dashboard    │
├──────────────────────┤
│ 💳 Make Payment  ← ✓ │
├──────────────────────┤
│ Make a Payment       │
│ ┌────────────────┐   │
│ │ Amount         │   │
│ │ [____________] │   │
│ │                │   │
│ │ Method         │   │
│ │ [Select ▼]     │   │
│ │                │   │
│ │ Mobile Number  │   │
│ │ [____________] │   │
│ │                │   │
│ │ 📎 Upload      │   │
│ │  Tap to upload │   │
│ │                │   │
│ │ [Send Request] │   │
│ │                │   │
│ └────────────────┘   │
└──────────────────────┘
```

---

## Timeline - What Happens

```
T+0s:   User clicks "Make Payment"
T+0.1s: Modal appears
T+1s:   User fills form
T+5s:   User selects file
T+5.2s: File validated
T+5.3s: Preview shows
T+8s:   User clicks "Send Request"
T+8.1s: Form validation runs
T+8.2s: Loading spinner appears
T+8.3s: FormData created
T+8.4s: Network request sent
T+8.5s: Backend receives request
T+12s:  Backend processes file (simulated)
T+12.1s: Backend creates request record
T+12.2s: Response sent to frontend
T+12.3s: Success message shown
T+12.5s: Modal closes
T+12.6s: Form clears
T+12.7s: Dashboard refreshes
T+13s:  User sees updated dashboard
```

---

## Color Scheme

- **Primary (Blue):** Buttons, links
- **Success (Green):** File accepted, success messages
- **Warning (Orange):** File size warning
- **Error (Red):** Error alerts
- **Muted (Gray):** Helper text, disabled states

---

## Animations

- **Modal Open:** Fade in + slide up (200ms)
- **File Preview:** Slide down (100ms)
- **Button Loading:** Spinner rotation (infinite)
- **Success Alert:** Fade in (200ms)
- **Modal Close:** Slide down + fade out (200ms)

---

## Accessibility Features

✓ All form fields have labels
✓ File upload area has accessible name
✓ Error messages announced to screen readers
✓ Keyboard navigation supported (Tab, Enter)
✓ Escape key closes modal
✓ Focus indicators visible
✓ Color not only indicator (text + icons)
✓ Sufficient contrast ratios

---

## Translation Strings

The following text will be translated based on user language:
- Form labels
- Error messages
- Success messages
- Button text
- Helper text

Currently supported: English, Kinyarwanda, French

---

## Summary

**Users will experience:**
1. ✓ Simple form to make payment
2. ✓ Easy file upload with preview
3. ✓ Clear error messages if anything goes wrong
4. ✓ Confirmation when request sent
5. ✓ Assurance that leader will verify payment
6. ✓ Next: Notification when payment approved

**Developers will see:**
1. ✓ FormData with complete file upload
2. ✓ Proper multipart encoding
3. ✓ JWT authentication included
4. ✓ All form data in request body
5. ✓ Ready for backend processing
