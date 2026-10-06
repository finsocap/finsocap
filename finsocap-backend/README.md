# FinSoCap Central REST API Engine (A-to-Z Backend + MySQL + Express + Prisma)

Welcome to the standalone backend repository of **FinSoCap CRM & Operations Platform**.  
This backend serves as the single source of truth for:
1. **FinSoCap Web Operations Dashboard** (React / Next.js)
2. **FinSoCap Partner Mobile Application** (Flutter / Android & iOS)

---

## 🛠️ Architecture & Tech Stack
- **Folder**: `finsocap-backend/` (Fully decoupled, ready for separate repository or VPS/Cloud hosting)
- **Runtime**: Node.js v20+ / TypeScript (Strict ESM)
- **Framework**: Express.js (RESTful API Architecture)
- **Database**: MySQL 8.0+
- **ORM**: Prisma ORM (Type-safe models, relationships & migrations)
- **File Uploads**: Multer (Aadhaar, PAN, Shop Photos, Registration PDFs)
- **Authentication**: JWT (JSON Web Tokens) with 30-day mobile session validity & Bcrypt password encryption
- **Deployment Compatibility**: Docker, Railway, Render, VPS (Hostinger, AWS EC2, DigitalOcean)

---

## 🚀 Setup & Local Running

### 1. Install Dependencies
```bash
cd finsocap-backend
npm install
```

### 2. Configure Database in `.env`
Set your MySQL connection string in `.env`:
```env
PORT=5000
DATABASE_URL="mysql://root:your_mysql_password@localhost:3306/finsocap_db"
JWT_SECRET="finsocap_super_secret_jwt_key_2026_finance_corp"
```

### 3. Generate Prisma Client & Migrate Database
```bash
# Push schema directly to MySQL:
npx prisma db push

# Or run Prisma migrations:
npm run prisma:migrate
```

### 4. Seed Initial Data
Seeds default users (Admin, CA, CS), catalog services, and initial partners:
```bash
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```
The API server starts at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/health`

---

## 📑 Complete A-to-Z API Directory

### 🔐 1. Authentication & Session (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/login` | Admin & Staff login | Public |
| POST | `/api/auth/partner-login` | Flutter Partner login (Phone + Password) | Public |
| GET | `/api/auth/me` | Fetch authenticated user/partner profile | Bearer Token |

---

### 🤝 2. Franchise Partners (`/api/partners`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/partners/register` | New Branch Application ("Apply for Branch") | Public |
| GET | `/api/partners` | List all partners (filters: status, tier, search) | Bearer Token |
| GET | `/api/partners/:id` | Get single partner details + KYC docs + tasks | Bearer Token |
| PATCH | `/api/partners/:id/approve` | Admin approves pending franchise | Admin Only |
| PATCH | `/api/partners/:id/toggle-status` | Toggle Active / Deactivated | Admin Only |
| PUT | `/api/partners/:id` | Update profile information | Bearer Token |
| POST | `/api/partners/:id/change-password`| Change partner password | Bearer Token |

---

### 📂 3. Document & Media Uploads (`/api/upload`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/upload/single` | Upload 1 file (multipart/form-data: `file`) | Public |
| POST | `/api/upload/multiple` | Upload up to 5 files (multipart/form-data: `files`) | Public |
*Uploaded documents are saved to `/uploads` and served statically via `http://localhost:5000/uploads/<filename>`.*

---

### 📦 4. Products & Services Catalog (`/api/services`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/services` | Get all catalog services (category, price, SLA) | Public |
| GET | `/api/services/:id` | Get single service | Public |
| POST | `/api/services` | Add new catalog service | Admin Only |
| PUT | `/api/services/:id` | Update service pricing or SLA | Admin Only |
| DELETE | `/api/services/:id` | Remove catalog service | Admin Only |

---

### 📋 5. Tasks & Workflow Engine (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/tasks` | Get tasks (filter by partnerId, status, assignee) | Bearer Token |
| GET | `/api/tasks/:id` | Get complete task details with timeline comments | Bearer Token |
| POST | `/api/tasks` | Create new client case / application | Bearer Token |
| PUT | `/api/tasks/:id` | Update task status or assignee | Bearer Token |
| POST | `/api/tasks/:id/comments` | Add update comment to task timeline | Bearer Token |
| POST | `/api/tasks/:id/complete` | Complete task & issue compliance certificate | Bearer Token |

---

### 💳 6. Wallet & QR Ledger (`/api/wallet`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/wallet/partner/:partnerId`| Get partner wallet, balance & last 50 transactions | Bearer Token |
| POST | `/api/wallet/transaction` | Record credit / debit transaction or settlement | Bearer Token |
| GET | `/api/wallet/all` | Admin overview of all partner wallets & dues | Admin Only |

---

### 🔑 7. Digital Signature Certificates / DSC Hub (`/api/dsc`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/dsc` | List all Class 3 USB tokens (search, filter status) | Bearer Token |
| POST | `/api/dsc` | Register new DSC token | Admin Only |
| PUT | `/api/dsc/:id` | Update holder info or renewal expiry date | Admin Only |
| DELETE | `/api/dsc/:id` | Remove DSC record | Admin Only |

---

### 💬 8. Live Support & Chat Desk (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/chat/conversations` | List conversation threads | Bearer Token |
| GET | `/api/chat/conversations/:id/messages`| Get chat history for conversation | Bearer Token |
| POST | `/api/chat/conversations` | Start new conversation thread | Bearer Token |
| POST | `/api/chat/messages` | Send message in conversation | Bearer Token |

---

### 📝 9. CMS Blog Studio (`/api/blogs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/blogs` | Get published articles (category, search) | Public |
| GET | `/api/blogs/:slug` | Read full article by URL slug | Public |
| POST | `/api/blogs` | Create & publish new article | Admin Only |
| PUT | `/api/blogs/:id` | Update article | Admin Only |
| DELETE | `/api/blogs/:id` | Delete article | Admin Only |

---

### 📊 10. Dashboard Analytics & KPIs (`/api/analytics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/analytics/stats` | Partner counts, task SLA, platform balances | Bearer Token |

---

### 👥 11. CRM Masters (`/api/crm`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/crm/clients` | List clients | Bearer Token |
| POST | `/api/crm/clients` | Add client | Bearer Token |
| PUT | `/api/crm/clients/:id` | Update client | Bearer Token |
| GET | `/api/crm/licences` | List compliance certificates | Bearer Token |
| PUT | `/api/crm/licences/:id`| Update certificate | Bearer Token |
| DELETE | `/api/crm/licences/:id`| Delete certificate | Bearer Token |
| GET | `/api/crm/users` | List team staff & executives | Admin Only |
| POST | `/api/crm/users` | Add team member | Admin Only |

---

## 📱 Quick Reference for the Flutter App Developer

### 1. Document Upload (Multipart)
Send KYC documents to `/api/upload/single` first:
```bash
curl -X POST http://localhost:5000/api/upload/single \
  -F "file=@/path/to/aadhaar.pdf"
```
Response gives: `{ "fileUrl": "/uploads/aadhaar-123456.pdf" }`. Pass this `fileUrl` in the registration request.

### 2. Partner Registration Payload
```json
POST /api/partners/register
{
  "name": "Ramesh Verma",
  "phone": "9876543210",
  "email": "ramesh@verma.com",
  "dob": "1990-05-20",
  "shopName": "Verma Digital Kendra",
  "currentAddress": "25.5941, 85.1376 (Near Station)",
  "completeShopAddress": "Main Road, Patna, Bihar - 800001",
  "panNumber": "ABCDE1234F",
  "adhaarNumber": "1234 5678 9012",
  "password": "SecretPassword@123",
  "documents": [
    { "type": "panDoc", "fileName": "pan.pdf", "fileUrl": "/uploads/pan.pdf" },
    { "type": "adhaarDoc", "fileName": "aadhaar.pdf", "fileUrl": "/uploads/aadhaar.pdf" },
    { "type": "shopDoc", "fileName": "shop.jpg", "fileUrl": "/uploads/shop.jpg" }
  ]
}
```

### 3. Partner Login Payload
```json
POST /api/auth/partner-login
{
  "mobile": "9876543210",
  "password": "SecretPassword@123"
}
```
Store the returned `token` in Flutter `SharedPreferences` or `flutter_secure_storage` and send in headers:
`Authorization: Bearer <token>`.
