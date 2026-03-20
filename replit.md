# Workspace

## Overview

TechPath — an internship & job suggestion platform for engineering students and tech professionals.
pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui + Wouter (routing) + React Query + Framer Motion
- **API framework**: Express 5 + express-session
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Auth**: Session-based auth with bcryptjs
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── techpath/           # React + Vite frontend (TechPath)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
│   └── src/seed.ts         # Demo data seeder
└── package.json
```

## Features

### User Roles
- **Student/Professional** — Browse jobs, complete profile, apply, generate resume
- **Recruiter** — Post jobs/internships, manage applications, update candidate status
- **Admin** — Manage all users and job listings

### Pages (Student/Professional)
- Landing page with hero + feature highlights
- Login / Register with role selection
- Multi-step profile setup (7 steps: personal info, education, experience, projects, skills, certifications, preferences)
- Jobs feed with advanced filters (location, tech stack, type, pay, experience level)
- Job detail page with apply button
- My Applications with status tracking
- ATS Resume Builder with 4 templates (modern, classic, minimal, bold)

### Pages (Recruiter)
- Recruiter dashboard with stats
- Post new job form
- View and manage applications with status updates

### Pages (Admin)
- Admin dashboard
- All users management
- All jobs management

## Database Schema

- `users` — email, passwordHash, name, role (student/recruiter/admin), profileComplete
- `profiles` — userId, headline, skills (JSONB), education (JSONB), experience (JSONB), projects (JSONB), certifications (JSONB), preferences
- `jobs` — recruiterId, company, title, description, type, techStack (JSONB), pay range, experienceLevel, status
- `applications` — jobId, userId, coverLetter, status (pending/reviewing/shortlisted/rejected/offered)

## Demo Accounts

- Student: `student@example.com` / `password123`
- Recruiter: `recruiter@techcorp.com` / `password123`
- Admin: `admin@techpath.com` / `password123`

## API Endpoints

- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current user
- `GET/PUT /api/profile` — Profile management
- `GET/POST /api/jobs` — List/create jobs
- `GET/PUT/DELETE /api/jobs/:id` — Job CRUD
- `GET/POST /api/applications` — Applications
- `PUT /api/applications/:id/status` — Update status
- `POST /api/resume/generate` — Generate HTML resume
- `GET /api/admin/users` — Admin: all users
- `GET /api/admin/jobs` — Admin: all jobs
- `GET /api/recruiter/applications` — Recruiter: all applications

## Development

```bash
# Run codegen after API spec changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run push

# Seed demo data
pnpm --filter @workspace/scripts run seed
```
