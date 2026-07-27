---
name: SMTP configuration
description: How cPanel SMTP is wired up; FROM_EMAIL must match auth user
---

**Rule:** `FROM_EMAIL` must equal `SMTP_USER` (info@qirox.online) or cPanel will reject auth.

**Why:** cPanel mail servers reject messages where the FROM differs from the authenticated user.

**How to apply:** `server/mail.ts` has `FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || "..."` — keep this fallback chain intact.

Env vars set: `SMTP_HOST=server222.web-hosting.com`, `SMTP_PORT=465`, `SMTP_USER=info@qirox.online`
Secret set: `SMTP_PASS`
