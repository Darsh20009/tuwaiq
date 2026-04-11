---
title: "VAPID encryption private key exposed in logs"
level: critical
file_ranges:
  - filepath: "server/core/pushNotifications.ts"
    range_start: 12
    range_end: 16
---
PCI DSS Req 3.6: VAPID private key was printed to stdout on startup. Fixed: removed key from log.