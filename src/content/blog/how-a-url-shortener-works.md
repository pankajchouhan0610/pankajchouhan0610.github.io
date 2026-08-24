---
title: "How a URL Shortener Works"
description: "System design for a URL shortener: encoding, storage, redirects, caching, and the abuse problems that appear at real traffic."
pubDate: 2026-05-02
author: "Pankaj Chauhan"
category: "System Design"
tags:
  - System Design
  - HTTP
  - Databases
heroImage: "/images/blog/url-shortener.svg"
heroImageAlt: "Illustration of a long URL being compressed into a short code"
draft: false
featured: false
trending: false
---

A URL shortener maps a long URL to a short code and redirects clients that hit the short link. The product looks tiny. The production system is a write-light, read-heavy cache problem with a surprisingly sharp abuse edge.

## The write path

A client submits a URL. The service validates it, stores a mapping, and returns a short code.

Two common ways to generate the code:

1. **Hash the URL** and take the first N characters of a base62 encoding. Collisions require a retry.
2. **Allocate an integer ID** from a counter or Snowflake-style generator, then encode that ID in base62.

```text
id = 125
base62(125) -> "cb"
https://techlist.dev/cb
```

IDs are easier to reason about. You control uniqueness. You can shard the ID space. You can estimate capacity from key length: 6 base62 characters give about 56 billion codes.

Custom aliases are a separate uniqueness constraint and a moderation problem.

## The read path

A GET to the short path should be fast:

```http
GET /cb HTTP/1.1
Host: techlist.dev
```

```http
HTTP/1.1 301 Moved Permanently
Location: https://example.com/very/long/path
Cache-Control: public, max-age=86400
```

Use 301 if the mapping is permanent and you want browsers and CDNs to cache the redirect. Use 302 or 307 if you need to change targets or count every click on the origin.

The hot path is:

1. Lookup code in cache.
2. On miss, lookup in the database.
3. Fill the cache.
4. Return the redirect.

Redis or the CDN can absorb most reads. The database is the source of truth for creates, updates, and expiry.

## Data model

A minimal row is enough to start:

```text
code        PK
target_url
created_at
expires_at  nullable
owner_id    nullable
status      active | disabled
```

Click analytics should not live on this row. Append events to a log or a separate store. Mixing counters into the redirect transaction is how you turn a cacheable 301 into a write storm.

## Abuse and safety

Open redirectors get used for phishing. You will need:

- Blocklists for known bad domains
- Rate limits on create
- Captchas or auth for bulk creation
- The ability to disable a code instantly
- HTTPS-only redirects

Preview pages (an interstitial) reduce surprise for humans and add latency. Many public shorteners eventually add them for untrusted links.

## Scale notes

The first bottleneck is usually not storage. It is generating unique codes under concurrent writes, then surviving a cache stampede after a popular link hits social media.

Techniques that help:

- Single-flight cache fills
- Partition codes by prefix
- Pre-generate ID batches
- Put the redirect API on a separate, boring stack from the dashboard

A URL shortener is a good system-design exercise because every neat encoding trick still has to survive HTTP caching, spam, and a key that must not be guessed for private links. If links are sensitive, make codes long and unguessable. Base62 of a small autoincrement ID is not a secret.
