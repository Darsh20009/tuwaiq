# جمعية طويق للخدمات الإنسانية — منصة متكاملة

## نظرة عامة
منصة متكاملة لجمعية طويق للخدمات الإنسانية (ترخيص رقم: **1000820300**) تتضمن:
- **موقع عام**: التبرعات، التطوع، الأخبار، خدمات الجمعية
- **لوحة إدارة شاملة**: ERP كامل للإدارة والمالية والموارد البشرية
- **نظام إدارة الموظفين**: لوحات تحكم حسب الدور، شات داخلي، بريد داخلي

## UI Design System — Light Mode Only
- **ThemeProvider REMOVED** — no dark mode; always light mode
- **CSS Variables** in `client/src/index.css`: HSL variables for `:root` only (emerald #2E8B57, teal, gold accent) with glassmorphism utilities (`.glass-card`, `.btn-premium`, `.luxury-card`, `.text-gradient`)
- **Premium Navbar** at `client/src/components/Navbar.tsx`: top info bar, glassmorphism scroll effect, "تبرع الآن" gradient CTA (no dark toggle), Arabic RTL layout with clean white dropdowns
- **3 Hardcoded Services** in Home.tsx `staticServices` array (always rendered): سقيا الماء, سلة رمضانية, إفطار صائم — each with pricing tiers + icons
- **Wave Dividers**: SVG wave dividers added to StatsSection and CTASection for premium visual flow
- **Dotted Pattern Backgrounds**: Radial dot patterns on green sections for subtle texture
- **WebAuthn Biometric Login**: routes at `/api/auth/webauthn/challenge|register|authenticate`; "الدخول بالبصمة" button in Login.tsx

## Admin System — Power Features
### إدارة التبرعات (`/admin/donations`)
- **مسار**: `GET /api/admin/donations` — كل التبرعات مع فلاتر (حالة، نوع، تاريخ، بحث)
- **تأكيد/رفض يدوي**: `PATCH /api/admin/donations/:id` — تغيير الحالة + ملاحظة إدارية
- **حذف**: `DELETE /api/admin/donations/:id`
- **تصدير CSV**: `GET /api/admin/donations/export` — CSV بترميز UTF-8 مع BOM

### إدارة التحويلات البنكية (`/admin/transfers`)
- **تصدير CSV**: `GET /api/bank-transfers/export`
- **حذف**: `DELETE /api/bank-transfers/:id`
- **رفض مع ملاحظة**: تمرير notes عند PATCH

### إدارة الأخبار (`/admin/news`) — نظام مستقل في MongoDB
- **Collection**: `news` في MongoDB — مستقلة عن collection المحتوى
- **GET /api/news**: قائمة الأخبار المنشورة للعموم (مع cache 2 دقيقة)
- **GET /api/news?all=1**: كل الأخبار للأدمن (مع الخاصة) — cache 30 ثانية
- **GET /api/news/:id**: خبر واحد بالـ id أو slug
- **POST /api/news**: إضافة خبر جديد (admin/manager/editor)
- **PUT /api/news/:id**: تعديل خبر (admin/manager/editor)
- **PATCH /api/news/:id/publish**: نشر/إخفاء سريع
- **DELETE /api/news/:id**: حذف خبر
- **الحقول**: title, titleEn, summary, summaryEn, content, contentEn, imageUrl, category, isPublished, slug, createdAt, updatedAt
- **صفحة الأخبار `/news`**: تصميم رسمي — لوجو في الهيرو + أرقام رسمية + breadcrumb + كروت احترافية

## نظام الإشعارات الكامل (3 طبقات)
- **NotificationModel** محدّث: حقول type/body/link/icon مضافة
- **PushSubscriptionModel**: تخزين اشتراكات Web Push (endpoint + keys)
- **WebSocket**: `server/core/websocket.ts` — إشعارات فورية عبر `/ws?userId=`
- **Web Push (VAPID)**: `server/core/pushNotifications.ts` — `web-push` — مفاتيح VAPID من env
- **fireNotify / fireNotifyAdmins**: `server/core/notifications.ts` — دالة موحّدة تُرسل للـ 3 طبقات
- **Routes**: `GET/PATCH/DELETE /api/notifications` + `POST /subscribe` + `GET /vapid-key`
- **Frontend**: hook `use-notifications.ts` (WebSocket listener + mutations) + صفحة `/notifications`
- **Navbar Bell**: 🔔 مع badge للإشعارات غير المقروءة — في Desktop وMobile
- **Service Worker**: `public/sw.js` — يستقبل Push notifications ويفتح الرابط عند الضغط

## صفحة طويق للخير (`/tuwaiq-khair`)
- **4 تبويبات**: مواقيت الصلاة — القبلة — القرآن الكريم — الأذكار
- **مواقيت الصلاة**: تحديد موقع تلقائي + AlAdhan API — يبرز الصلاة القادمة + عداد تنازلي
- **القبلة**: حساب جيودسي دقيق + بوصلة ديناميكية من orientation الجهاز + المسافة للكعبة
- **القرآن**: مشغّل صوتي — 4 قراء (العفاسي، السديس، الحذيفي، المنشاوي) — 11 سورة
- **الأذكار**: عداد تفاعلي لـ 6 أذكار مع progress bar + reset

## User Preferences
Preferred communication style: Simple, everyday language (Arabic).

## System Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query v5
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Language**: Arabic RTL, Cairo/Tajawal fonts

### Backend — Modular Monolith Architecture
- **Runtime**: Node.js + Express 5 + TypeScript (ESM)
- **Database**: MongoDB — dual connection:
  - Native driver (legacy CMS/HR/Admin routes in `server/routes.ts`)
  - Mongoose ODM (new modules in `server/modules/`)
- **Auth**: Dual system (backward-compatible):
  - Passport.js session auth (existing CMS/Admin pages)
  - JWT access token (15min) + refresh token (7 days, httpOnly cookie) for new API modules
- **Security**: helmet (CSP for Rajhi iframes), express-rate-limit (100/15min general, 10/15min auth, 30/15min donations)
- **Email**: SMTP2GO HTTP API (primary) + SMTP fallback
- **Modules** (`server/modules/`):
  - `auth/` — JWT register/login/refresh/me
  - `users/` — CRUD with role-based access
  - `campaigns/` — Campaign CRUD + progress tracking
  - `donations/` — Create donation, link campaign, generate certificates, gamification
  - `payments/` — Neoleap/Al Rajhi, bank transfer integrations (PayMob removed)
  - `beneficiaries/` — Beneficiary case management
  - `deliveries/` — Delivery assignment and tracking
  - `reports/` — Daily/monthly aggregations, top donors, campaign performance
- **Core** (`server/core/`):
  - `database.ts` — Mongoose connection
  - `auth.middleware.ts` — JWT middleware (requireAuth, requireRole, optionalAuth)
  - `errors.ts` — AppError, NotFoundError, ValidationError, UnauthorizedError
  - `logger.ts` — Structured logger
  - `rateLimiter.ts` — Rate limit configs
- **Models** (`server/models/`): User, Campaign, Donation, Payment, Beneficiary, Delivery, Notification, AuditLog

## Employee System — Role-Based Dashboards

### Roles & Dashboards
| Role | Dashboard URL | Features |
|------|--------------|---------|
| admin/manager | /admin | Full ERP admin panel |
| accountant | /employee → AccountantDashboard | Transfer approvals, donation tracking |
| programmer | /employee → ProgrammerDashboard | System tasks management |
| sales | /employee → SalesDashboard | Poster tools, Canva link |
| delivery | /delivery | Delivery orders |
| employee | /employee → Dashboard | General employee view |

### Employee Onboarding Flow
1. Admin approves job application with role assignment
2. System creates user account + generates setup token (48h expiry)
3. Branded email sent to employee with setup link
4. Employee visits `/setup-password?token=...` to set password
5. Employee logs in with their email + new password

### Employee IDs
Format: `TQ-0001`, `TQ-0002`, etc.
Stored as `employeeId` field on user documents.

## Key API Endpoints

### Auth & Setup
- `POST /api/auth/setup-password` — Set initial password via token
- `GET /api/auth/verify-setup-token?token=...` — Verify setup token

### Admin
- `PATCH /api/admin/users/:id/role` — Change employee role
- `POST /api/admin/users/:id/resend-setup` — Resend setup email
- `PATCH /api/job-applications/:id/status` — Approve/reject + create account

### Internal Chat
- `GET /api/chat/contacts` — List employee contacts
- `GET /api/chat/messages?with=:userId` — Chat messages
- `POST /api/chat/messages` — Send message
- `GET /api/chat/unread-count` — Unread count

### Internal Mail
- `GET /api/internal-mail?box=inbox|sent`
- `POST /api/internal-mail` — Send mail (addressed by employeeId)
- `PATCH /api/internal-mail/:id/read`
- `GET /api/internal-mail/unread-count`

### System Tasks
- `GET /api/system-tasks` — All tasks (programmer/admin)
- `POST /api/system-tasks` — Create task (admin)
- `PATCH /api/system-tasks/:id/status` — Update status

## MongoDB Collections
- `users` — All users (employees + donors)
- `donations` — Donation records
- `bank_transfers` — Bank transfer verifications
- `job_applications` — Job applications
- `chat_messages` — Internal chat messages
- `internal_mail` — Internal mail messages
- `system_tasks` — Developer task management
- `pages`, `news_articles`, `jobs`, etc.

## Payment Gateway — Neoleap / Al Rajhi Bank (iPayPipe AES-192-CBC)
Integration file: `server/rajhi.ts`

**Integration Mode: Browser Redirect** (confirmed from official PHP7 iPayPipe SDK)
- AES-192-CBC encryption with first 24 bytes of ResourceKey, IV = `PGKEYENCDECIVSPC`
- Plaintext = URL query string: `amt=&action=&responseURL=&errorURL=&trackid=&udf1=...&currencycode=682&langid=AR&id=&password=&`
- Encrypt → hex → build redirect URL locally (NO server-to-server call needed)
- Redirect URL: `{gateway}/PaymentHTTP.htm?param=paymentInit&trandata={hex}&errorURL=...&responseURL=...&tranportalId=...`

**Active Production Credentials** (stored in MongoDB `settings` collection):
| Field                   | Value                              |
|-------------------------|------------------------------------|
| `rajhiTranportalId`     | `B0EN812lxCZ5gwa`                 |
| `rajhiTranportalPassword` | `$1j$179KA!lplLE`               |
| `rajhiResourceKey`      | `60851692600660851692600660851692` |
| `rajhiTerminalId`       | `PG580400`                         |
| `rajhiMerchantId`       | `600004862`                        |

Fallback to env vars: `RAJHI_TRANPORTAL_ID`, `RAJHI_TRANPORTAL_PASSWORD`, `RAJHI_RESOURCE_KEY`
Production callback URL: `https://tuwaiqassociation.sa/api/donations/rajhi-callback`
Set `APP_URL=https://tuwaiqassociation.sa` in production env vars.

Flow: POST /api/donations → buildRajhiPayment() → build redirect URL → frontend redirects donor →
Al Rajhi gateway page → Neoleap POSTs to /api/donations/rajhi-callback → verifyRajhiCallback() → redirect /payment-result

## Environment Variables
- `MONGODB_URI` — MongoDB connection string
- `SESSION_SECRET` — Session secret key
- `SMTP2GO_API_KEY` — Email API key (primary)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — SMTP fallback
- `APP_URL` — Base URL for links (default: https://tuwaiq-sa.online)
- `RAJHI_MERCHANT_ID`, `RAJHI_TERMINAL_ID`, `RAJHI_SECRET_KEY` — Payment (optional, overridden by DB settings)

## File Structure
```
client/src/
├── pages/
│   ├── admin/         # Admin panel pages
│   ├── employee/      # Employee dashboards & tools
│   │   ├── AccountantDashboard.tsx
│   │   ├── ProgrammerDashboard.tsx
│   │   ├── SalesDashboard.tsx
│   │   ├── Chat.tsx
│   │   ├── InternalMail.tsx
│   │   └── ...
│   ├── delivery/      # Delivery agent pages
│   └── SetupPassword.tsx
├── components/
│   ├── AppSidebar.tsx    # Role-based sidebar
│   ├── DeliverySidebar.tsx
│   └── ...
server/
├── routes.ts    # All API routes
├── mail.ts      # Email templates + sending (improved formal Arabic templates)
├── pdf.ts       # PDF generation — certificate + invoice (pdfkit + Amiri Arabic font)
├── fonts/       # Amiri-Regular.ttf + Amiri-Bold.ttf (Arabic RTL font for PDFs)
├── storage.ts   # MongoDB storage interface
└── index.ts     # Server entry point
```

## PDF Generation & Guest Email Receipt
- **`server/pdf.ts`**: Generates professional A4 Arabic PDFs using `pdfkit` + Amiri font
  - `generateCertificatePDF(opts)` — donation certificate with green header, verse, ornaments, stamp
  - `generateInvoicePDF(opts)` — formal invoice/receipt with table, payment details, totals
- **Endpoint**: `POST /api/donations/:id/send-pdf` — accepts `{ email }`, generates both PDFs, emails as attachments
- **`client/src/pages/PaymentResult.tsx`**: Success screen now shows email input for guest donors to receive their PDF documents without logging in
