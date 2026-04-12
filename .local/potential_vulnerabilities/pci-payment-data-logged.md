---
title: "Payment plaintext data logged to stdout"
level: critical
file_ranges:
  - filepath: "server/rajhi.ts"
    range_start: 314
    range_end: 314
---
PCI DSS Req 3.4: Payment plaintext JSON including portal passwords and decrypted callback data were logged via console.log. Fixed: removed all sensitive logs from payment flow.