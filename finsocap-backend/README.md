# 🚀 FinSoCap Central REST API Documentation & cURL Collection
**Base Live URL:** `https://finsocap-api.onrender.com/api`  
*(Local testing: `http://localhost:5000/api`)*

---

### 1. PARTNER REGISTRATION ("Apply for Branch" Flow)
```bash
# Upload KYC Document / Shop Photo (Multipart Form)
curl -X POST https://finsocap-api.onrender.com/api/upload/single \
  -F "file=@/path/to/aadhaar_card.pdf"

# Submit Franchise Partner Application Form
curl -X POST https://finsocap-api.onrender.com/api/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ramesh Chandra Verma",
    "phone": "9876543210",
    "email": "ramesh@verma.com",
    "dob": "1992-08-15",
    "shopName": "Verma Digital Seva Kendra",
    "currentAddress": "Near Gandhi Chowk, Station Road (GPS: 25.5941, 85.1376)",
    "completeShopAddress": "Shop No 14, Main Market, Patna, Bihar - 800001",
    "city": "Patna",
    "state": "Bihar",
    "panNumber": "ABCDE1234F",
    "adhaarNumber": "1234 5678 9012",
    "password": "PartnerSecretPassword@123",
    "documents": [
      { "type": "panDoc", "fileName": "pan.pdf", "fileUrl": "/uploads/pan.pdf" },
      { "type": "adhaarDoc", "fileName": "aadhaar.pdf", "fileUrl": "/uploads/aadhaar.pdf" },
      { "type": "shopDoc", "fileName": "shop_photo.jpg", "fileUrl": "/uploads/shop.jpg" }
    ]
  }'
```

---

### 2. AUTHENTICATION & LOGIN (Mobile App & Admin)
```bash
# Flutter Partner Mobile App Login (Phone Number + Password)
curl -X POST https://finsocap-api.onrender.com/api/auth/partner-login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "password": "PartnerSecretPassword@123"
  }'

# Web Dashboard Admin / Team Login (Email + Password)
curl -X POST https://finsocap-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ankit.kumar@finsocap.com",
    "password": "Password@123"
  }'

# Fetch My Authenticated Profile (Send Token in Header)
curl -X GET https://finsocap-api.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 3. PRODUCTS & SERVICES CATALOG
```bash
# Get All Available Services (FSSAI, GST, Trademark, Company, DSC, etc.)
curl -X GET https://finsocap-api.onrender.com/api/services

# Create New Service in Catalog (Admin Only)
curl -X POST https://finsocap-api.onrender.com/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "ISO 9001 Certification",
    "category": "Quality Compliance",
    "recurring": false,
    "frequency": "One Time",
    "price": 8500,
    "gov": 1500,
    "time": "7 - 10 Days"
  }'
```

---

### 4. TASKS & CLIENT APPLICATION WORKFLOW (Core Engine)
```bash
# Create New Task / Client Case from Mobile App
curl -X POST https://finsocap-api.onrender.com/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "partner": "Ramesh Chandra Verma",
    "partnerPhone": "9876543210",
    "partnerId": "P-101",
    "client": "Amit Sweets & Restaurant",
    "phone": "9812345678",
    "business": "Food Retailer",
    "category": "Food & Beverage",
    "service": "FSSAI Registration (Basic)",
    "priority": "High",
    "due": "3 Days"
  }'

# Fetch Tasks List (Filter by Partner ID or Status)
curl -X GET "https://finsocap-api.onrender.com/api/tasks?partnerId=P-101&status=InProgress" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get Full Details of a Specific Task (With Comments & Files)
curl -X GET https://finsocap-api.onrender.com/api/tasks/T-1001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Update Task Status (e.g. SentForReview, InProgress, Completed)
curl -X PUT https://finsocap-api.onrender.com/api/tasks/T-1001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "InProgress",
    "assignee": "Pooja Mehta"
  }'

# Add Timeline Comment to Task
curl -X POST https://finsocap-api.onrender.com/api/tasks/T-1001/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "author": "CA Pooja Mehta",
    "text": "Electricity bill submitted. Applying on government portal today."
  }'

# Complete Task & Issue Official Licence / Certificate
curl -X POST https://finsocap-api.onrender.com/api/tasks/T-1001/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "licenseNumber": "FSSAI-2026-PAT-9841",
    "clientName": "Amit Sweets & Restaurant",
    "clientNumber": "9812345678",
    "partnerName": "Ramesh Chandra Verma",
    "partnerNumber": "9876543210",
    "serviceName": "FSSAI Registration (Basic)",
    "type": "FSSAI State Certificate",
    "issueDate": "06/10/2026",
    "expiryDate": "05/10/2027",
    "portalUser": "AMIT_FSSAI_98",
    "portalPassword": "SecretPassword@2026"
  }'
```

---

### 5. WALLET & QR TRANSACTIONS (Franchise Ledger)
```bash
# Get Partner Wallet Balance, Dues & Recent 50 Transactions
curl -X GET https://finsocap-api.onrender.com/api/wallet/partner/P-101 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Record Wallet Transaction (Credit, Debit, or UPI QR Payment)
curl -X POST https://finsocap-api.onrender.com/api/wallet/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "partnerId": "P-101",
    "amount": 2500,
    "type": "CREDIT",
    "description": "UPI QR Payment received for Task T-1001",
    "referenceId": "T-1001",
    "utrNumber": "UPI-428910481940"
  }'

# Get Overview of All Wallets & Dues (Admin Dashboard)
curl -X GET https://finsocap-api.onrender.com/api/wallet/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 6. DIGITAL SIGNATURE CERTIFICATES (DSC Hub)
```bash
# List All Class 3 DSC Records (USB Tokens)
curl -X GET "https://finsocap-api.onrender.com/api/dsc?search=HYP2003" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Register New USB Token DSC
curl -X POST https://finsocap-api.onrender.com/api/dsc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "holderName": "Vikram Singhania",
    "pan": "ABCDE6789G",
    "businessName": "Singhania Logistics Ltd",
    "dscClass": "Class 3 - Combo (Sign & Encrypt)",
    "usbSerial": "HYP2003-991240",
    "certifyingAuthority": "eMudhra",
    "expiryDate": "2027-10-05"
  }'
```

---

### 7. LIVE SUPPORT CHAT DESK
```bash
# Get All Chat Conversations
curl -X GET https://finsocap-api.onrender.com/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Send Message in Conversation Thread
curl -X POST https://finsocap-api.onrender.com/api/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "conversationId": "CONV_UUID_HERE",
    "senderId": "P-101",
    "senderName": "Ramesh Verma",
    "senderRole": "Partner",
    "text": "Sir, maine customer ka renewed electricity bill upload kar diya hai."
  }'
```

---

### 8. DASHBOARD ANALYTICS & EXECUTIVE KPIS
```bash
# Get Summary Counts (Total Partners, Open Tasks, Revenue Dues, SLA %)
curl -X GET https://finsocap-api.onrender.com/api/analytics/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 9. PARTNER PROFILE & CHANGE PASSWORD
```bash
# Update Partner Details
curl -X PUT https://finsocap-api.onrender.com/api/partners/P-101 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "new.email@verma.com",
    "shopName": "Verma Digital Services & CSC"
  }'

# Change Password from App Profile
curl -X POST https://finsocap-api.onrender.com/api/partners/P-101/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "PartnerSecretPassword@123",
    "newPassword": "NewStrongPassword@2026"
  }'
```
