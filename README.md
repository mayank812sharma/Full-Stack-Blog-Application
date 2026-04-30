# BlogApp — Full Stack Production Blog Platform

A production-ready, SaaS-level blogging platform built with **Next.js 14**, **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication**.

---

## 🏗️ Project Architecture

```
blogapp/
├── backend/          # Node.js + Express REST API
│   ├── config/       # DB connection
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth, error handling, validation
│   ├── models/       # Mongoose schemas (User, Blog, Comment, Category)
│   ├── routes/       # Express routers
│   └── utils/        # Helpers, seeder
│
└── frontend/         # Next.js 14 App Router
    ├── app/          # Pages (SSR + CSR)
    │   ├── page.tsx            # Home (SSR + ISR)
    │   ├── blog/[slug]/        # Blog detail (SSR)
    │   ├── auth/login|register # Auth pages
    │   ├── dashboard/          # User dashboard
    │   ├── admin/              # Admin panel
    │   ├── profile/            # Profile settings
    │   ├── search/             # Search & explore
    │   └── user/[username]/    # Public profile (SSR)
    ├── components/   # Reusable UI components
    ├── lib/          # API client, utilities
    └── store/        # Zustand auth store
```

---

## 🚀 Features

### Frontend
- **SSR + ISR** via Next.js App Router for SEO-optimised pages
- Modern, responsive UI with CSS custom properties (supports dark mode)
- Protected routes for authenticated users and admins
- React Query for server state management and caching
- Zustand for global auth state (persisted)
- React Hook Form + Zod for validated forms
- Markdown editor with live preview for blog writing
- Real-time like, save, comment interactions
- Category filtering, full-text search, pagination
- Toast notifications, loading skeletons, error states

### Backend
- RESTful API with clean MVC architecture
- JWT authentication with role-based access control (user / admin)
- MongoDB indexing for query performance (text, compound, sparse)
- Pagination on all list endpoints
- Rate limiting (global + stricter on auth routes)
- Security: Helmet, CORS, mongo-sanitize, XSS-clean, bcrypt (12 rounds)
- Soft-delete for comments, slug generation for blogs
- Full-text search on blogs (title, content, tags, excerpt)
- Admin controls: manage users, toggle active, promote roles, feature posts

### Database
- Optimised MongoDB schemas with proper indexing
- Virtual fields for computed values (likeCount, commentCount)
- Aggregation-ready structure

---

## ⚙️ Setup & Installation

### 1. Clone and install

```bash
# Backend
cd backend
cp .env.example .env        # Fill in MONGO_URI and JWT_SECRET
npm install
npm run seed                # Seeds demo data
npm run dev                 # Starts on :5000

# Frontend
cd frontend
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL
npm install
npm run dev                 # Starts on :3000
```

### 2. Environment variables

**Backend `.env`**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/blogapp
JWT_SECRET=your_super_secret_32_char_minimum_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Frontend `.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Demo accounts (after seeding)
| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | admin@blogapp.com      | Admin@1234  |
| User  | john@blogapp.com       | John@1234   |

---

## 📡 API Reference

| Method | Endpoint                          | Auth     | Description              |
|--------|-----------------------------------|----------|--------------------------|
| POST   | /api/auth/register                | Public   | Register new user        |
| POST   | /api/auth/login                   | Public   | Login                    |
| GET    | /api/auth/me                      | Private  | Get current user         |
| PUT    | /api/auth/change-password         | Private  | Change password          |
| GET    | /api/blogs                        | Public   | List blogs (paginated)   |
| GET    | /api/blogs/featured               | Public   | Featured blogs           |
| GET    | /api/blogs/:slug                  | Public   | Single blog              |
| POST   | /api/blogs                        | Private  | Create blog              |
| PUT    | /api/blogs/:id                    | Private  | Update blog              |
| DELETE | /api/blogs/:id                    | Private  | Delete blog              |
| POST   | /api/blogs/:id/like               | Private  | Toggle like              |
| POST   | /api/blogs/:id/save               | Private  | Toggle save              |
| GET    | /api/comments/:blogId             | Public   | Get comments             |
| POST   | /api/comments/:blogId             | Private  | Add comment              |
| DELETE | /api/comments/:id                 | Private  | Delete comment           |
| GET    | /api/categories                   | Public   | List categories          |
| GET    | /api/users/:username              | Public   | Public user profile      |
| PUT    | /api/users/profile                | Private  | Update profile           |
| POST   | /api/users/:id/follow             | Private  | Follow/unfollow          |
| GET    | /api/admin/stats                  | Admin    | Dashboard stats          |
| GET    | /api/admin/users                  | Admin    | All users                |
| PATCH  | /api/admin/users/:id/toggle-active| Admin    | Toggle user active       |
| PATCH  | /api/admin/users/:id/role         | Admin    | Update user role         |
| GET    | /api/admin/blogs                  | Admin    | All blogs                |
| PATCH  | /api/admin/blogs/:id/feature      | Admin    | Toggle featured          |
| DELETE | /api/admin/blogs/:id              | Admin    | Delete any blog          |

---

## 🛡️ Security Practices
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days
- Rate limiting: 100 req/15min globally, 20 req/15min on auth routes
- MongoDB sanitisation prevents NoSQL injection
- Helmet sets secure HTTP headers
- CORS restricted to `CLIENT_URL`
- Input validation on all endpoints (express-validator)

---

## 🧱 Tech Stack

| Layer      | Technology                                 |
|------------|--------------------------------------------|
| Frontend   | Next.js 14, React 18, TypeScript           |
| Styling    | Tailwind CSS, CSS Custom Properties        |
| State      | Zustand, React Query (TanStack)            |
| Forms      | React Hook Form + Zod                      |
| Backend    | Node.js, Express.js                        |
| Database   | MongoDB, Mongoose                          |
| Auth       | JWT (jsonwebtoken), bcryptjs               |
| Security   | Helmet, express-rate-limit, mongo-sanitize |
| Deployment | Vercel (frontend), Railway/Render (backend)|

---

Built as a production-grade, resume-worthy project demonstrating full stack engineering at scale.
