---
title: "Rate limiter completely disabled"
level: critical
file_ranges:
  - filepath: "server/core/rateLimiter.ts"
    range_start: 1
    range_end: 9
---
All rate limiters had skip: true and max: 0. Brute-force protection was completely bypassed. Fixed: now enforces 10 attempts per 15 min on auth routes, 120 per 15 min general.