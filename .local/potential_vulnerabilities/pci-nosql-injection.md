---
title: "NoSQL injection - MongoDB operator keys not sanitized"
level: high
file_ranges:
  - filepath: "server/index.ts"
    range_start: 54
    range_end: 58
---
PCI DSS Req 6.2.4: MongoDB dollar-operator injection not blocked. Fixed: noSqlSanitizer middleware strips all keys starting with dollar sign and prototype keys from all requests.