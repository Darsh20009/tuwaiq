---
name: SEO middleware notes
description: How server/seo.ts static/dynamic lookup is structured; pre-existing TS errors
---

**Rule:** Static SEO map `STATIC_SEO` is checked at TWO points: step 2 (early, before DB) and step 5 (fallback). Both check `!seoData` so no double-apply.

**Why:** Step 2 was added to catch `/service/umrah`, `/service/hajj`, `/service/water` before the DB lookup. Step 5 is the original fallback.

**Routes covered:** `/service/umrah`, `/service/hajj`, `/service/orphan`, `/service/families`, `/service/water` — all added to STATIC_SEO.

**AEO FAQ entries added:** 6 new Q&A entries covering "أشهر جمعية"، "كفالة عمرة"، "زكاة"، "السويدي"، "إيبان".

**Pre-existing TS errors (safe to ignore):** Profile.tsx `dir` prop, routes.ts ObjectId overload, index.ts duplicate key — all existed before; dev server uses esbuild and ignores them.
