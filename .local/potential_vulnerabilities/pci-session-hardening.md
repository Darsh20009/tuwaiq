---
title: "Weak session secret fallback and excessive 30-day session"
level: high
file_ranges:
  - filepath: "server/index.ts"
    range_start: 125
    range_end: 141
---
PCI DSS Req 8.2.4: Session fell back to hardcoded weak secret. 30-day maxAge violates idle-timeout policy. Fixed: production exits if secret weak; maxAge 8 hours; httpOnly cookie.