# TaskFlow — Modern MERN Stack Project Management SaaS

[![Node.js Version](https://img.shields.io/badge/Node.js-v24.x-68a063.svg?logo=node.js)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.x-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express-4.x-black.svg?logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

TaskFlow is a production-grade, portfolio-ready project management SaaS application engineered on the full **MERN Stack** (MongoDB, Express, React + Vite, Node.js) with Tailwind CSS. It empowers product teams to track initiatives, organize sprint tasks across an interactive multi-column Kanban board, manage project member roles, execute subtask checklists, collaborate via threaded comments, and monitor dynamic workspace metrics in real-time.

---

## Architecture Overview

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │               TaskFlow React Client                    │
                                    │            (Vite + Tailwind CSS + Axios)               │
                                    └──────────────────────────┬─────────────────────────────┘
                                                               │ JWT Bearer Headers
                                                               ▼
                                    ┌────────────────────────────────────────────────────────┐
                                    │               TaskFlow Express API                     │
                                    │                (/api/v1 REST Router)                   │
                                    └────────────┬─────────────┬─────────────┬────────────────┘
                                                 │             │             │
                                        ┌────────▼────┐ ┌──────▼──────┐ ┌────▼────────┐
                                        │ Auth & RBAC │ │ Controllers │ │ Validations │
                                        │ Middleware  │ │ & Services  │ │ & Handlers  │
                                        └────────┬────┘ └──────┬──────┘ └────┬────────┘
                                                 │             │             │
                                                 └─────────────┼─────────────┘
                                                               ▼
                                    ┌────────────────────────────────────────────────────────┐
                                    │               MongoDB Database                         │
                                    │          (Users, Projects, Tasks,                      │
                                    │           Comments, Audit Streams)                     │
                                    └────────────────────────────────────────────────────────┘
```

---

## Key Features

- **Enterprise Authentication & Security:**
  - Secure user registration and login with `bcryptjs` password hashing (10 salt rounds).
  - Stateless JSON Web Token (`JWT`) authentication with Bearer token request interceptor.
  - Granular Role-Based Access Control (`RBAC`) per project (`owner`, `admin`, `member`, `viewer`).
  - Automatic session expiration detection with seamless redirection to login.
- **Projects Workspace:**
  - Create and manage initiatives with custom prefixes (e.g., `TF`, `PRJ`), descriptions, categories, and colors.
  - Team member roster management: invite collaborators by email, modify roles, and remove members.
  - Real-time project progress calculation derived directly from database task completion ratios.
  - Cascade project deletion ensuring related tasks, subtasks, and comments are properly cleaned up.
- **Interactive Multi-Column Kanban Board:**
  - 5 customizable stages: `Backlog`, `To Do`, `In Progress`, `In Review`, and `Done`.
  - Native HTML5 Drag-and-Drop with optimistic client-side updates and MongoDB persistence.
  - Responsive horizontal panning on tablet/mobile with mobile-friendly stage selector tabs.
  - Live search filter across task titles, descriptions, and auto-generated task identifiers.
  - Priority filtering (`Urgent`, `High`, `Medium`, `Low`).
- **Deep Task Details & Collaboration:**
  - Inline editing of task titles, descriptions, priorities, and column status stages.
  - Dynamic subtask checklists with instant completion toggling and persistence.
  - Threaded comment feed allowing team members to communicate per task.
  - Due date tracking and member assignment badges.
- **Dynamic Workspace Analytics (Zero Fake Stats):**
  - KPI widgets: Total Tasks, In Progress count, Completed count, and Overdue SLA flags.
  - Segmented status distribution bar displaying true proportions across active tasks.
  - Critical path sprint priority listing filtered for high and urgent pending items.
  - Real-time team audit feed displaying chronological actions across all projects.
- **User Profile & Customization:**
  - Self-service profile management: update display name, organization affiliation, and avatar theme color.
  - System-wide non-blocking Toast notifications for all create, update, delete, and movement operations.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | React 18, Vite 6, Tailwind CSS 3 | High-performance SPA with modern responsive SaaS styling |
| **Icons** | Lucide React | Crisp, accessible, and lightweight SVG icon system |
| **HTTP Client** | Axios | Request/response interceptor pipeline for JWT and error normalization |
| **Backend API** | Node.js (v24), Express.js (v4) | RESTful API server with modular controllers and routers |
| **Database** | MongoDB v8 & Mongoose ODM | Document-oriented persistence with schemas and compound indexing |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` | Secure stateless auth and cryptographic password hashing |
| **Validation** | `express-validator` | Request parameter validation and centralized error formatting |

---

## Monorepo Directory Structure

```
taskflow/
├── package.json                   # Monorepo root npm run scripts
├── README.md                      # Comprehensive documentation
├── AGENTS.md                      # Agent operating protocols & architecture guidelines
├── .gitignore                     # Git ignore rules for node_modules, .env, and local db
│
├── server/                        # Express + Node.js Backend API
│   ├── package.json
│   ├── .env                       # Backend environment variables
│   ├── .env.example
│   ├── render.yaml                # Render cloud deployment blueprint
│   ├── server.js                  # Express application entrypoint
│   ├── config/
│   │   └── db.js                  # Mongoose connection & lifecycle events
│   ├── models/
│   │   ├── User.js                # User accounts & bcrypt hashing
│   │   ├── Project.js             # Projects, unique keys, & members array
│   │   ├── Task.js                # Tasks, priorities, columns, & subtasks
│   │   ├── Comment.js             # Task discussion comments
│   │   └── Activity.js            # Audit stream & action log
│   ├── middleware/
│   │   ├── auth.js                # JWT Bearer verification
│   │   ├── checkProjectRole.js    # Granular project RBAC authorization
│   │   ├── validate.js            # Express-validator result handler
│   │   └── errorHandler.js        # Centralized error response formatter
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── commentController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── commentRoutes.js
│   │   └── dashboardRoutes.js
│   └── test_backend.js            # 16-point automated API test suite
│
└── client/                        # React + Vite Frontend SPA
    ├── package.json
    ├── vite.config.js             # Vite development & build setup
    ├── tailwind.config.js         # Custom SaaS color palette & typography
    ├── vercel.json                # Vercel deployment SPA rewrite configuration
    ├── .env                       # Frontend environment variables
    ├── .env.example
    └── src/
        ├── App.jsx                # Application routes & provider wrappers
        ├── main.jsx               # React DOM root entrypoint
        ├── index.css              # Tailwind base, utilities, & custom scrollbars
        ├── context/
        │   ├── AuthContext.jsx    # Persistent auth state & user session
        │   └── ToastContext.jsx   # Non-blocking notification toasts
        ├── services/
        │   ├── api.js             # Axios client with JWT request interceptor
        │   ├── authService.js
        │   ├── projectService.js
        │   ├── taskService.js
        │   ├── commentService.js
        │   └── dashboardService.js
        ├── components/
        │   ├── common/            # Button, Input, Modal, Badge, Avatar, Card, ProtectedRoute
        │   └── layout/            # AppLayout, Sidebar, Topbar
        └── pages/
            ├── LandingPage.jsx    # Public product marketing & showcase
            ├── LoginPage.jsx      # Authentication with 1-click Demo Autofill
            ├── RegisterPage.jsx   # Workspace onboarding
            ├── DashboardPage.jsx  # Live MongoDB metrics & activity stream
            ├── ProjectsPage.jsx   # Project initiatives & member management
            ├── BoardPage.jsx      # Multi-column drag-and-drop Kanban
            └── ProfilePage.jsx    # Account preferences & theme settings
```

---

## Setup & Local Installation

### Prerequisites
- **Node.js:** v18.x, v20.x, or v24.x
- **npm:** v9.x or higher
- **MongoDB:** Local `mongod` service running or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=super_secure_jwt_secret_key_production_ready
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Install Dependencies & Start Services

**Terminal 1 — Backend API:**
```bash
cd server
npm install
node server.js
# Server running at: http://localhost:5000
# Health check: http://localhost:5000/api/v1/health
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm install
npm run dev
# Client available at: http://localhost:5173
```

---

## REST API Overview

All API endpoints are prefixed under `/api/v1`.

| Module | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | Public | Verify server & database status |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register new account & return JWT |
| | `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT |
| | `GET` | `/api/v1/auth/me` | Authenticated | Retrieve authenticated user profile |
| | `PUT` | `/api/v1/auth/profile` | Authenticated | Update display name, organization, avatar |
| **Projects** | `GET` | `/api/v1/projects` | Authenticated | List user's projects with progress % |
| | `POST` | `/api/v1/projects` | Authenticated | Create project initiative (caller = owner) |
| | `GET` | `/api/v1/projects/:id` | Member | Get project details & roster |
| | `PUT` | `/api/v1/projects/:id` | Owner/Admin | Update project settings |
| | `DELETE`| `/api/v1/projects/:id` | Owner only | Delete project and cascade tasks |
| | `POST` | `/api/v1/projects/:id/members` | Owner/Admin | Add team member by email |
| | `PATCH`| `/api/v1/projects/:id/members/:userId` | Owner/Admin | Modify member role |
| | `DELETE`| `/api/v1/projects/:id/members/:userId` | Owner/Admin | Remove member from project |
| **Tasks** | `GET` | `/api/v1/projects/:id/tasks` | Member | Query tasks with search & priority filters |
| | `POST` | `/api/v1/projects/:id/tasks` | Member+ | Create task with auto-generated key number |
| | `GET` | `/api/v1/tasks/:id` | Member | Get task details, checklist, & comments |
| | `PUT` | `/api/v1/tasks/:id` | Member+ | Update task title, description, priority |
| | `PATCH`| `/api/v1/tasks/:id/status` | Member+ | Move column / update Kanban order |
| | `DELETE`| `/api/v1/tasks/:id` | Member+ | Delete task and linked comments |
| | `POST` | `/api/v1/tasks/:id/subtasks` | Member+ | Add checklist subtask item |
| | `PATCH`| `/api/v1/tasks/:id/subtasks/:subId` | Member+ | Toggle subtask complete / incomplete |
| | `DELETE`| `/api/v1/tasks/:id/subtasks/:subId` | Member+ | Remove subtask item |
| **Comments**| `GET` | `/api/v1/tasks/:id/comments` | Member | Fetch chronological comments thread |
| | `POST` | `/api/v1/tasks/:id/comments` | Member+ | Post comment to task discussion |
| | `DELETE`| `/api/v1/comments/:id` | Author/Admin | Delete comment |
| **Dashboard**| `GET` | `/api/v1/dashboard/stats` | Authenticated | Dynamic aggregate workspace metrics |
| | `GET` | `/api/v1/projects/:id/analytics` | Member | Project-specific velocity and breakdown |
| | `GET` | `/api/v1/projects/:id/activity` | Member | Paginated project activity audit stream |

---

## Verification & Automated Test Suites

TaskFlow includes dual-layer automated verification suites covering both backend REST security and frontend integration:

### Backend Test Suite (16 Test Cases)
```bash
cd server
node test_backend.js
```
- Tests health check, user registration, JWT generation, login, protected routes, project creation, member role management, task numbering, column reordering, subtask toggling, comments, live analytics aggregation, and unauthorized RBAC denial.

### Frontend Integration Audit (13 Test Cases)
```bash
cd client
node verify_frontend_integration.js
```
- Tests client-side Axios pipeline, Bearer token injection, session refresh persistence, project creation, Kanban drag-and-drop persistence, subtask state changes, and 401 unauthenticated route guarding.

---

## Deployment Guide

### Frontend Deployment (Vercel)
1. Push your repository to GitHub.
2. In the Vercel dashboard, click **Add New Project** and select the repository.
3. Configure the settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-backend-service.onrender.com/api/v1`
5. Click **Deploy**. SPA rewrites are automatically governed by [`client/vercel.json`](file:///C:/Users/Suguna%20Latha/.gemini/antigravity/scratch/taskflow/client/vercel.json).

### Backend Deployment (Render)
1. In Render, create a new **Web Service** connected to your repository.
2. Configure the settings:
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI` = `mongodb+srv://<user>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority`
   - `JWT_SECRET` = `<Generate a secure 64-character random string>`
   - `CLIENT_URL` = `https://your-taskflow-app.vercel.app`
4. Click **Create Web Service**.

### Database Deployment (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) or whitelist your Render service IPs.
3. Under **Database Access**, create a database user and secure password.
4. Obtain the connection string URI and set it as `MONGODB_URI` in your Render backend settings.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
