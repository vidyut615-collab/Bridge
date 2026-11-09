# Bridge — Assessment Operations & Observability Platform

> **Internal Operations Platform** • Powered by Truskill
>
> **Single Source of Truth** for MCQ question bank inventory, standardized examination registration & naming, dynamic multi-section composition building, AI blueprint extraction, and deployment tracking across Testpress and Truskill LMS.

---

## 🚀 Key Modules & Capabilities

1. **Authentication & RBAC**:
   - `SUPERADMIN`: Full administrative control, Master Data management (Colleges, Subjects, Topics), and user provisioning.
   - `STAFF`: Operational access (updating question bank counts, registering examinations, blueprint extraction, and marking deployment milestones).

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
     - `Global`: Platform-wide assessment with custom title.
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
Copy the example environment file:
```bash
cp .env.example .env
```

Configure your `.env` variables:
```env
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="your-groq-api-key"
JWT_SECRET="your-secure-random-jwt-secret"
NEXT_PUBLIC_APP_TIMEZONE="Asia/Kolkata"
```

> [!NOTE]
> All credentials and secrets are kept in `.env`, which is strictly ignored by version control. Never commit sensitive keys or database binaries to the repository.

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

## 👥 Access & Roles

| Role | Permissions & Scope |
| :--- | :--- |
| **Superadmin** | Full access to Master Data governance, Colleges, Subjects, Topics, User Administration, and System Audit Logs |
| **Staff** | Question Bank inventory updates, Examination Registry, Dynamic Blueprint Builder, and Deployment pipeline management |

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
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` (or use Supabase / Neon / Vercel Postgres).
   - Configure Environment Variables in the Vercel Project Dashboard:
     - `DATABASE_URL` (PostgreSQL connection string with pooling)
     - `GROQ_API_KEY` (Groq API Key for Vision Blueprint Extraction)
     - `JWT_SECRET` (A strong, random 32+ character secret)
     - `NEXT_PUBLIC_APP_TIMEZONE` (`Asia/Kolkata`)
   - Trigger deployment.
