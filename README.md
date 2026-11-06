# Truskill Assessment Operations & Observability System

> **Single Source of Truth** for MCQ question bank inventory, standardized examination registration & naming, dynamic multi-section composition building, AI blueprint extraction, and deployment tracking across Testpress and Truskill LMS.

---

## 🚀 Key Modules & Capabilities

1. **Authentication & RBAC**:
   - `SUPERADMIN`: Full administrative control, Master Data management (Colleges, Subjects, Topics), and user creation.
   - `STAFF`: Day-to-day operations (updating question bank counts, registering examinations, blueprint extraction, and marking deployment milestones).

2. **Question Bank Observability**:
   - Subject inventory categorized into **3 fixed difficulty levels**: Level I (Easy), Level II (Medium), Level III (Hard).
   - Folder paths tracked per difficulty level.
   - Live automatic question total calculations (`Total = Easy + Medium + Hard`).
   - Direct update mechanism capturing deltas, mandatory change descriptions, user attribution, and timestamps (Asia/Kolkata).

3. **Master Data Governance (Superadmin Only)**:
   - **Colleges**: Name, unique uppercase College Code (e.g. `DYPCOE`, `SBUP`, `JSPM`), and independent sequence counters.
   - **Subjects & Topics**: Hierarchical structure with stable internal IDs (`TOP-00001`). Topic renames automatically reflect across all current examinations.
   - **Soft Delete / Archival**: Permanent deletion is prohibited. Archived records cannot be selected for new exams, while historical records remain intact.

4. **Examination Registry & Atomic Naming Engine**:
   - **3 Exam Categories**:
     - `Global`: Platform-wide assessment with free manual title.
     - `College Training`: Training program assessment (`TR`).
     - `College Regular`: Regular college assessment (`RG`).
   - **Standardized Formula**: `COLLEGECODE-TR/RG-TITLE-###` (e.g. `DYPCOE-TR-Aptitude Assessment-001`).
   - Atomic sequence counters prevent duplicate code allocation. Title edits preserve the original allocated unique code.

5. **Dynamic Composition Builder & AI Blueprint Extraction**:
   - Multi-section builder (e.g. *Arithmetic Core*, *Verbal Ability*).
   - Dynamic autocomplete search for topics, strictly filtered to active topics under the section's Subject.
   - Live calculations: Topic percentage `(Topic Qs / Section Total) * 100`, section totals, and exam totals.
   - Strict validations: Topic count matches difficulty sum; section questions match sum of topics.
   - **Groq Vision Multimodal AI**: Upload blueprint images (PNG, JPG, JPEG) to extract topic distributions and reconcile them with master topics.

6. **Deployment Tracking & Subsequent Updates**:
   - **Linear Pipeline**: `Registered` → `Testpress Pending` → `Testpress Completed` → `Truskill LMS Completed` → `Overall Completed`.
   - **Subsequent Update Engine**: Modifications after initial completion trigger version increments (`V1` → `V2`) and independent platform update confirmation flags (`Testpress Update Pending`, `LMS Update Pending`) without wiping historical completion data.

7. **Audit Trail**:
   - Immutable chronological log recording user, timestamp (IST), before/after values, and mandatory change descriptions.

---

## 🛠️ Quick Start (Local Development)

### 1. Prerequisites
- Node.js v20+ or v22+
- npm

### 2. Setup Environment
All sensitive credentials are kept in `.env` (which is git-ignored):
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="" # Paste your key when ready
JWT_SECRET="truskill-dev-jwt-secret-key-change-in-production"
NEXT_PUBLIC_APP_TIMEZONE="Asia/Kolkata"
```

### 3. Initialize & Seed Database
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 👥 Default Demo Accounts

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `admin@truskill.com` | `admin123` | Full access + Master Data + User Management |
| **Staff** | `staff@truskill.com` | `staff123` | Operational access (Question Bank & Exams) |

*(Quick-fill buttons are available on the `/login` screen for fast testing).*

---

## ☁️ Production Deployment on Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete truskill assessment ops implementation"
   git push origin main
   ```
2. **Import into Vercel**:
   - Connect the repository on [vercel.com](https://vercel.com).
   - Add a **Vercel Postgres (Neon)** or **Supabase** database from the Vercel Storage tab.
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
   - In Vercel Environment Variables, add:
     - `DATABASE_URL` (injected automatically by Vercel Postgres)
     - `GROQ_API_KEY` (your Groq API Key)
     - `JWT_SECRET` (secure random string)
   - Deploy!
