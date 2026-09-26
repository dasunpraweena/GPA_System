# GPA System

A full-stack web application for calculating, tracking, and managing student GPAs and academic performance.

---

## 🏛️ System Architecture

| Area | Architecture Pattern | Technology |
|---|---|---|
| **Frontend** | MVVM (Model-View-ViewModel) using Custom Hooks | React + Vite |
| **Backend** | Layered (Routes → Controllers → Services → Repositories) | Node.js + Express (ES Modules) |
| **Database** | Relational Database | MySQL |

---

## 📂 Project Structure

```text
GPA_System/
├── frontend/                     # React Frontend (MVVM)
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── assets/               # Media assets (images, SVGs, icons)
│   │   ├── context/              # React context providers (Auth, Theme)
│   │   ├── models/               # Domain models, calculation logic, data shapes
│   │   ├── services/             # API client & communication with backend
│   │   ├── styles/               # Global styles, variables, theme tokens
│   │   ├── utils/                # Helper utilities and validators
│   │   ├── viewmodels/           # Custom hooks encapsulating state & presentation logic
│   │   ├── views/                # Presentation UI layer
│   │   │   ├── components/       # Reusable UI elements (Buttons, Cards, Modals)
│   │   │   └── pages/            # Full-page views consuming ViewModels
│   │   ├── App.jsx               # App component & routing
│   │   ├── main.jsx              # React root entry point
│   │   └── index.css             # Base styles
│   ├── .env.example              # Frontend environment template
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Express Backend
│   ├── src/
│   │   ├── config/               # DB connection & environment configurations
│   │   │   ├── db.js             # MySQL pool setup
│   │   │   └── env.js            # Environment loader
│   │   ├── controllers/          # HTTP request handlers (status codes, JSON)
│   │   ├── middlewares/          # Auth, error handling, validation middlewares
│   │   │   └── errorHandler.js   # Centralized error handler
│   │   ├── models/               # Schemas, DTOs, and entity definitions
│   │   ├── repositories/         # Data access layer (MySQL SQL queries)
│   │   ├── routes/               # API route definitions
│   │   │   └── index.js          # Root router
│   │   ├── services/             # Business logic & domain workflows
│   │   ├── utils/                # Custom error classes, response helpers
│   │   │   ├── AppError.js       # Operational error class
│   │   │   └── responseHelper.js # Standardized API response formatters
│   │   ├── app.js                # Express app setup & middleware mounting
│   │   └── server.js             # Server bootstrap & listener
│   ├── .env.example              # Backend environment template
│   ├── .gitignore
│   └── package.json
│
├── .gitignore                    # Global git ignore
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env     # Configure your MySQL credentials
npm run dev              # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env     # Configure your backend API endpoint
npm run dev              # Starts Vite dev server on http://localhost:5173
```