# Semester — Software Engineering GPA Management System
**Sabaragamuwa University of Sri Lanka (SUSL) — Faculty of Computing**

A full-stack GPA management web application for Software Engineering students and administrators at Sabaragamuwa University of Sri Lanka. Built with a React (Vite) MVVM frontend, modular Express backend, and MySQL database, meticulously faithful to the approved visual design and university grading policies.

---

## 🏛️ System Architecture

| Tier | Pattern / Architecture | Technologies & Libraries |
|---|---|---|
| **Frontend** | MVVM (Model-View-ViewModel) using Custom React Hooks | React 19, Vite, Vanilla CSS Design System |
| **Backend** | Modular Monolith (Routes → Middleware → Controllers → Services → Repositories) | Node.js, Express (ES Modules), JWT, bcryptjs, Multer, pdf-parse |
| **Database** | Relational Database with Transactional Integrity & Auditing | MySQL 8.0, `mysql2/promise` connection pool |

### Architectural Flow:
1. **Frontend (MVVM)**: Pure presentation views (`views/`) consume observable state and event handlers from custom hooks (`viewmodels/`), which interact with domain models (`models/`) and the HTTP service layer (`services/apiClient.js`).
2. **Backend (Layered Monolith)**:
   - **Routes**: Declare endpoint URL patterns and bind rate limiters and auth middlewares.
   - **Middlewares**: Enforce JWT authentication (`authenticate`), role-based access (`requireAdmin`), and student verification (`requireVerified`).
   - **Controllers**: Parse HTTP requests and return standardized JSON responses.
   - **Services**: Orchestrate business logic, conflict detection, email dispatch, and authoritative GPA calculations.
   - **Repositories**: Execute transactional SQL queries against MySQL database tables.

---

## 📋 Features

### 🔐 1. Authentication & Security
- **Domain Restriction**: Accepts university student emails strictly ending with `@ms.sab.ac.lk` (e.g. `22cse0373@ms.sab.ac.lk`).
- **Student ID Derivation**: Automatically derives and validates the student registration number (e.g. `22CSE0373`) directly from the verified email prefix.
- **Mailbox Ownership Verification**: Single-use, expiring cryptographic email tokens (24-hour validity) ensure mailbox ownership before granting access to academic records.
- **Account Recovery**: Secure forgot-password flow with expiring single-use reset tokens (1-hour validity).
- **Password Security**: Strong hashing with `bcryptjs` (salt rounds: 12).
- **Rate Limiting**: Defends against brute-force attacks via `express-rate-limit`.
- **Role Isolation**: Public registration creates student accounts only. Initial administrator accounts are provisioned via a secure setup command.

### 🎓 2. Student Experience
- **8-Semester Curriculum**: View subjects across all 4 years and 8 semesters.
- **Elective Selection**: Students can select or deselect their specific elective courses (core courses are strictly required).
- **Grade Management**: Students can enter and update personal grades (`A+` to `F`, and `AB · Absent`).
- **Precedence Protection**: Official exam-branch results imported by an administrator take precedence over student-entered grades and cannot be overwritten.
- **Authoritative GPA Engine**: Real-time calculation of Semester GPA, Yearly GPA, Cumulative GPA, and Credit-Weighted Final GPA.
- **State Persistence**: All elective selections and grades are durably stored in MySQL and preserved across logins and devices.

### 🛡️ 3. Administrator Experience
- **Student Directory**: Search and inspect all student accounts by name, registration number, or email, with verification status and academic results.
- **Curriculum Management**: Edit subject credit counts (1–30) and toggle GPA/Non-GPA inclusion with required change reasons.
- **Curriculum Audit History**: Full audit trail of credit and GPA setting adjustments.
- **PDF Result Import Pipeline**:
  1. **Upload**: Upload official exam-branch result PDFs (e.g. `SE3104.pdf`).
  2. **Intelligent Text Extraction**: Automatically extracts subject code, examination batch, attempt groups (`Main group`, `1st attempt`, `2nd attempt`), registration numbers, and grades.
  3. **Account Matching & Conflict Review**: Matches candidate registration numbers to verified accounts and categorizes rows:
     - `Ready`: Matched account with no existing grade conflict (selected by default).
     - `Conflict`: Existing grade differs from PDF grade (requires explicit admin authorization to replace).
     - `Unmatched`: Registration number has no registered account yet (held pending future registration).
     - `Absent · review`: Grade is `AB` (held for policy review).
     - `Repeat attempt · review`: Repeat attempts held for policy confirmation.
  4. **Transactional Application**: Selected updates are applied in a single database transaction, recording previous vs. new values in `import_audit_history` and automatically updating affected student GPAs.

---

## 📊 GPA Calculation Engine & University Rules

- **Grade Point Values**:
  | Grade | Grade Points |
  |---|---|
  | A+ | 4.0 |
  | A  | 4.0 |
  | A- | 3.7 |
  | B+ | 3.3 |
  | B  | 3.0 |
  | B- | 2.7 |
  | C+ | 2.3 |
  | C  | 2.0 |
  | C- | 1.7 |
  | D+ | 1.3 |
  | D  | 1.0 |
  | F  | 0.0 |
  | AB | Absent (Preserved as result status; flagged for review; not counted as 0 or excluded) |

- **Semester, Yearly & Cumulative GPA**:
  $$\text{GPA} = \frac{\sum (\text{Grade Points} \times \text{Credits})}{\sum \text{Graded GPA Credits}}$$
- **Weighted Final GPA**:
  $$\text{Final GPA} = \frac{\sum (\text{Year Weight} \times \text{Yearly Credits} \times \text{Yearly GPA})}{\sum (\text{Year Weight} \times \text{Yearly Credits})}$$
  - **Year 1**: 20% weight ($0.20$)
  - **Year 2**: 20% weight ($0.20$)
  - **Year 3**: 30% weight ($0.30$)
  - **Year 4**: 30% weight ($0.30$)
- **Exclusions**: Non-GPA subjects, unselected electives, and grades not yet received are excluded from graded credit counts.
- **Failures**: `F` grade contributes $0.0$ grade points but includes its credits in the denominator.
- **Precision**: Full floating-point precision throughout; rounded to 2 decimal places strictly on display (`3.72`). Displays `—` when no eligible grades exist.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MySQL**: 8.0+ running on `localhost:3306` (or configured host)
- **MySQL Workbench**

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and enter your MySQL root password:
   ```bash
   cp .env.example .env
   ```
   Example configuration in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development

   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=gpa_system_db

   CLIENT_ORIGIN=http://localhost:5173
   JWT_SECRET=susl_se_gpa_super_secret_jwt_key_2026
   JWT_EXPIRES_IN=7d
   ```

4. **Run Database Migrations & Curriculum Seeding**:
   ```bash
   npm run migrate
   ```
   *(This creates all 7 tables in MySQL `gpa_system_db` and seeds the 75 official Software Engineering subjects across all 8 semesters).*

5. **Create Initial Administrator**:
   ```bash
   npm run seed:admin
   ```
   *(Creates the initial admin account `admin@ms.sab.ac.lk` with default password `AdminPass123!@#` or configured via `ADMIN_PASSWORD` in `.env`).*

6. **Generate Sample Result PDF**:
   ```bash
   node src/database/createSamplePdf.js
   ```
   *(Generates a valid test result sheet `sample_data/SE3104.pdf` ready for admin upload testing).*

7. **Run Automated Test Suite**:
   ```bash
   npm test
   ```
   *(Executes all 16 unit and end-to-end integration tests covering GPA formulas, auth validations, permissions, and conflict detection).*

8. **Start Backend Server**:
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   ```

---

### 3. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create or verify `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run Frontend Development Server**:
   ```bash
   npm run dev
   # App runs on http://localhost:5173
   ```

---

## 🔑 Default Credentials & Testing Flow

| Role | Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@ms.sab.ac.lk` | `AdminPass123!@#` | Full administrative access to curriculum, student directory, and PDF result imports |
| **Student (Example)** | `22cse0373@ms.sab.ac.lk` | Any chosen password upon registration | Registered student (Student ID: `22CSE0373`) |

> **Note on Email Verification during Local Development:**
> When registering a new student account, the single-use verification link is dispatched and printed directly to the backend terminal console for instant one-click verification testing.

---

## 📂 Project Directory Structure

```text
GPA_System/
├── backend/
│   ├── sample_data/
│   │   └── SE3104.pdf                 # Generated sample result sheet
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  # MySQL connection pool
│   │   │   └── env.js                 # Environment configuration
│   │   ├── database/
│   │   │   ├── curriculumData.js      # 8-semester curriculum data definitions
│   │   │   ├── migrate.js             # Database migration runner
│   │   │   ├── schema.sql             # MySQL DDL schema definitions
│   │   │   └── seedAdmin.js           # Secure initial admin provisioning
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # authenticate, requireAdmin, requireVerified
│   │   │   ├── errorHandler.js        # Global error handling middleware
│   │   │   ├── rateLimiter.js         # Rate limiting on auth endpoints
│   │   │   └── upload.middleware.js   # Multer PDF storage configuration
│   │   ├── modules/
│   │   │   ├── auth/                  # Register, verify, login, recover
│   │   │   ├── curriculum/            # Semester subjects, credit editing, audit trail
│   │   │   ├── gpa/                   # Pure authoritative GPA calculation engine
│   │   │   ├── imports/               # PDF upload, parsing, review, and transactional apply
│   │   │   ├── results/               # Student grades and elective selections
│   │   │   └── users/                 # Student directory and profile inspections
│   │   ├── routes/
│   │   │   └── index.js               # Central API router
│   │   ├── utils/
│   │   │   ├── AppError.js            # Operational error class
│   │   │   ├── constants.js           # SUSL grade points & year weights
│   │   │   ├── mailer.js              # Verification & reset email dispatcher
│   │   │   └── responseHelper.js      # Standard JSON response formatters
│   │   ├── app.js                     # Express application setup
│   │   └── server.js                  # Server bootstrap & migration runner
│   ├── tests/
│   │   ├── auth.test.js               # Domain & reg no derivation tests
│   │   ├── gpa.test.js                # Authoritative GPA formula tests
│   │   ├── integration.test.js        # End-to-end integration test
│   │   ├── pdfImport.test.js          # Conflict and attempt group tests
│   │   └── permissions.test.js        # Role-based middleware tests
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # JWT session provider
│   │   ├── services/
│   │   │   └── apiClient.js           # Centralized API client
│   │   ├── viewmodels/
│   │   │   ├── useAuthViewModel.js    # Auth state & screens ViewModel
│   │   │   ├── useCurriculumViewModel.js # Curriculum editor ViewModel
│   │   │   ├── useGpaCalculatorViewModel.js # Student GPA & courses ViewModel
│   │   │   ├── useImportViewModel.js  # PDF import & review ViewModel
│   │   │   └── useUsersViewModel.js   # Student directory ViewModel
│   │   ├── views/
│   │   │   ├── components/
│   │   │   │   └── Navbar.jsx         # Header & navigation
│   │   │   └── pages/
│   │   │       ├── AdminDashboard.jsx # Admin management (Curriculum, Users, Imports)
│   │   │       ├── AuthPage.jsx       # Login, Register, Verify, Reset screens
│   │   │       └── StudentDashboard.jsx # Student 4-year GPA overview & semester courses
│   │   ├── App.jsx                    # Root view routing
│   │   ├── index.css                  # Design system CSS matching visual design
│   │   └── main.jsx                   # React root entry
│   ├── .env.example
│   ├── index.html                     # Favicon, fonts, and meta tags
│   └── package.json
│
├── .gitignore
├── GPA-UI-Design.html                 # Visual reference prototype
└── README.md
```