---
title: "Prototype pollution via user-controlled object key"
level: high
file_ranges:
  - filepath: "server/modules/cases/cases.routes.ts"
    range_start: 119
    range_end: 119
---
PCI DSS Req 6.2.4: User-supplied file fieldname used directly as object key allowing prototype pollution. Fixed: sanitize with allowlist regex and explicit checks.