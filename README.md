<img width="2865" height="1651" alt="Screenshot 2025-12-18 105710" src="https://github.com/user-attachments/assets/44cccbfd-f435-4d27-b0c3-4ae5344d3fcf" />

# ServiTask — Task Management System untuk Bisnis Jasa

**ServiTask** adalah sistem manajemen kerja berbasis web yang dirancang khusus untuk **bisnis jasa** seperti agency, software house, konsultan, studio kreatif, dan tim profesional lainnya.

Platform ini membantu mengelola **organisasi, tim, klien, project, task, dan kolaborasi** dalam satu sistem terintegrasi dengan arsitektur modern, aman, dan scalable.

---

## Tujuan Produk

ServiTask bertujuan untuk membantu bisnis jasa:

- Mengelola banyak organisasi & klien dalam satu akun
- Menyusun workflow project dan task secara terstruktur
- Mendukung kolaborasi tim lintas role
- Memberikan transparansi progres kepada klien
- Menjadi fondasi sistem kerja digital jangka panjang

---

## Scope Produk

### Scope v1

**Core System**
- Authentication & User Account (register, login, logout, reset password)
- Multi-Organization & Membership
- Role & Permission Management
- Organization Settings
- Module / Feature Toggle (basic)

**Team & Collaboration**
- Team Management (invite, role, aktif/nonaktif)
- Comments & Attachments
- Notifications (in-app sederhana)

**Client & Project**
- Client Management (CRUD)
- Project Management (CRUD + member)
- Client Portal (view progres & komentar)

**Task & Productivity**
- Task Management (Board & List)
- Subtasks
- Time Tracking (manual entry)
- Dashboard (role-aware)

---

## Teknologi & Stack

### Stack Utama
- **Frontend & Backend**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS (opsional: shadcn/ui)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**:
  - Custom Auth (JWT + HttpOnly Cookie + Session Table)

---

## Arsitektur Sistem

- API menggunakan **Next.js Route Handlers** (`/app/api`)
- **Multi-tenant by Organization**
  - Hampir semua tabel memiliki `organization_id`
  - Semua query difilter berdasarkan organisasi aktif
- Layer arsitektur:
  - UI (React Components)
  - API Routes (Controller)
  - Service / Repository (opsional)
  - Database (PostgreSQL via Prisma)

---

## Role & Permission (v1)

### Role yang Digunakan
1. Super Admin (Global)
2. Owner (Pemilik Organisasi)
3. Admin
4. Project Manager (PM)
5. Member / Staff
6. Client

### Ringkasan Akses (v1)

| Fitur / Aksi | SA | Owner | Admin | PM | Member | Client |
|-------------|----|-------|-------|----|--------|--------|
| Kelola organisasi | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invite & ubah role user | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| CRUD client | ✅ | ✅ | ✅ | Terbatas | Read | Read |
| CRUD project | ✅ | ✅ | ✅ | Project-nya | ❌ | ❌ |
| CRUD task | ✅ | ✅ | ✅ | Project-nya | Terbatas | ❌ |
| Komentar task | ✅ | ✅ | ✅ | ✅ | ✅ | Opsional |
| Time tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Dashboard | ✅ | ✅ | ✅ | Subset | Subset | Client View |

---

## Domain Model (Entity)

- User
- Session
- Organization
- Role
- OrganizationUser
- Client
- Project
- ProjectMember
- Task
- Subtask
- TaskComment
- TaskAttachment
- TimeEntry
- Notification
- Module
- OrganizationModule
- (Opsional) Invite, PasswordResetToken

---

## Modul Utama

### Auth & User Account
- Register → otomatis membuat organisasi & owner
- Login / Logout
- Reset password
- Profile management

### Organization & Team
- Multi-organization
- Switch organisasi aktif
- Team management & role

### Client & Project
- Client CRUD
- Project CRUD & member assignment
- Status project (planned, ongoing, on_hold, completed)

### Task Management
- Board & List view
- Status: todo, in_progress, review, done
- Priority: low, medium, high, urgent
- Subtasks
- Comments & attachments

### Time Tracking
- Manual time entry per task
- Laporan waktu per user / project / client

### Client Portal
- Dashboard khusus klien
- View progres project & task
- Komentar (opsional)

### Notifications
- Task assignment
- Komentar baru
- In-app notification bell

### 📊 Dashboard
- Role-aware dashboard:
  - Owner/Admin: overview organisasi
  - PM: project & task terkait
  - Member: task harian & overdue
  - Client: progres project

---

## Struktur Folder (Next.js App Router)

/app
/(public)
/(app)
/(client)
/api
/lib
/components
middleware.ts

## Roadmap Development

**Phase 0** — Setup Project & Database  
**Phase 1** — Auth, Organization, Dashboard  
**Phase 2** — Team & Client Management  
**Phase 3** — Projects & Tasks (Core Feature)  
**Phase 4** — Time Tracking & Reports  
**Phase 5** — Client Portal  
**Phase 6** — Notifications & Dashboard Matang  

---

## Author

Project **ServiTask** ini **sepenuhnya dirancang dan dikembangkan oleh**:

**Ferdy Salsabilla**  
_Full-Stack Developer_

Project ini dibangun dengan pendekatan **clean architecture**, **multi-tenant system**, serta mempertimbangkan **skalabilitas dan kebutuhan enterprise** sejak tahap awal perancangan.

## 📄 Lisensi

Lisensi akan ditentukan sesuai kebutuhan bisnis & distribusi.

---

**ServiTask**  
_Satu sistem kerja digital untuk mengelola tim, project, dan kolaborasi._
