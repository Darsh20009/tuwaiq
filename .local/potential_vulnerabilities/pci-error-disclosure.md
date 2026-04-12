---
title: "Internal error messages exposed in HTTP 500 responses"
level: high
file_ranges:
  - filepath: "server/modules/cases/cases.routes.ts"
    range_start: 63
    range_end: 63
---
PCI DSS Req 6.2.4: Raw e.message returned in 500 responses leaking internal details. Fixed: generic safe message returned; real error logged server-side only.