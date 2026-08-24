---
title: "System Design Interview: Designing a Rate Limiter"
description: "A complete rate limiter design: algorithms, Redis implementations, distributed coordination, and the interview trade-offs that matter."
pubDate: 2026-08-20
updatedDate: 2026-08-22
author: "Pankaj Chauhan"
category: "System Design"
tags:
  - Rate Limiting
  - Redis
  - System Design
  - Interviews
heroImage: "/images/blog/rate-limiter.svg"
heroImageAlt: "Token bucket illustration used to explain rate limiting"
draft: false
featured: true
trending: true
---

A rate limiter decides whether a request may proceed. In interviews, the prompt is usually “protect an API.” In production, the prompt is “protect this API, this user, this IP, and this expensive endpoint, without adding a new outage mode.”

Start by pinning the requirement:

- Limit: 100 requests / minute / API key
- Decision latency: low milliseconds
- Accuracy: approximate is acceptable
- Failure mode: fail open or fail closed?

That last question is the one many answers skip. If Redis is down, do you block everyone or risk a flood?

## Algorithms

**Fixed window** counts events in a clock bucket. It is simple and bursty at window edges. Two windows can admit almost 2N requests around the boundary.

**Sliding window log** stores timestamps and drops the old ones. It is accurate and memory-heavy.

**Sliding window counter** approximates the previous window with a weighted count. It is the usual practical compromise.

**Token bucket** adds tokens at a steady rate and allows bursts up to bucket size. **Leaky bucket** smooths traffic to a constant drain rate.

For APIs, token bucket is the design people actually ship: burst is a feature, not a bug.

```text
tokens = min(capacity, tokens + rate * elapsed)
if tokens >= cost:
  tokens -= cost
  allow
else:
  deny
```

## Where the limiter lives

Options, from local to global:

1. **In-process** counters. Fast, wrong across replicas.
2. **Gateway / reverse proxy** (NGINX, Envoy, API gateway).
3. **Central store** such as Redis, used by every instance.

If you have more than one app instance, local limits are per replica. Attackers multiply their quota by your autoscaling group. Interviews should mention this without being asked.

## Redis implementation sketch

A token bucket can be a hash plus a Lua script so read-modify-write stays atomic:

```lua
local data = redis.call("HMGET", KEYS[1], "tokens", "ts")
-- recompute tokens from now - ts
-- if enough, decrement and allow, else deny
```

Fixed window is `INCR` + `EXPIRE` on `key:windowId`. It is easier to explain and often good enough.

For distributed limits, Redis is a single region story. Multi-region limits need either sticky routing, regional quotas, or a more complex consensus path. Most products choose regional limits.

## HTTP behavior

Denied requests should be explicit:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 12
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1771800000
```

Clients can back off. Support teams can debug. Your future self can tell a quota from an application error.

## Interview checklist

- Name the key: user, IP, token, route, or a tuple.
- Pick an algorithm and say what bursts you allow.
- Put state in Redis and mention atomicity.
- Decide fail open versus fail closed.
- Return 429 with `Retry-After`.
- Talk about hot keys (one celebrity user) and sharding the counter.
- Mention that rate limiting is not authentication.

A strong close: rate limiting protects capacity. It does not replace authn, authz, or backpressure inside the service. If the expensive query still runs for allowed requests, you have a limiter and you still have a fire.
