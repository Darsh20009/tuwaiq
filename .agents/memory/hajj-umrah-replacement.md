---
name: Hajj → Umrah replacement & admin kafala toggles
description: Where the umrah/hajj chapter swap lives and how admin controls it
---

**Files changed:**
- `client/src/components/SiteBookSection.tsx` — umrah chapter, cost 3000 SAR, icon, labels
- `client/src/components/QuickDonateStrip.tsx` — umrah quick amounts (max 3000)
- `client/src/pages/admin/AdminSettings.tsx` — adds umrahEnabled/umrahCost/hajjEnabled/hajjCost controls (rendered in "إعدادات الكفالات" card)
- `server/modules/donations/donations.controller.ts` — getUmrahStats reads cost from MongoDB settings collection

**Why:** User wants umrah shown publicly; hajj hidden but controllable from admin panel.

**How to apply:** Admin can re-enable hajj by toggling `hajjEnabled` in settings and adding a new chapter entry back in SiteBookSection.
