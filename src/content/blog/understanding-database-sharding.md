---
title: "Understanding Database Sharding"
description: "How sharding actually works: partition keys, scatter-gather queries, resharding, and the operational costs that diagrams leave out."
pubDate: 2026-06-15
updatedDate: 2026-07-02
author: "Pankaj Chauhan"
category: "Databases"
tags:
  - Databases
  - Sharding
  - System Design
heroImage: "/images/blog/database-sharding.svg"
heroImageAlt: "Illustration of a database split across several shards"
draft: false
featured: true
trending: false
---

Sharding splits a dataset across multiple databases so that no single machine has to store or serve everything. The idea is simple. The operational surface is not.

You shard when vertical scaling is no longer enough: the working set no longer fits in memory, writes saturate a primary, or backups and failovers take too long.

## Choosing a shard key

The shard key decides which node owns a row. A good key has three properties:

- **High cardinality**, so rows spread out.
- **Stable**, because changing it later means migrating data.
- **Aligned with queries**, so most requests hit one shard.

User ID is a common key for multi-tenant products. Time is a tempting key for events, and a dangerous one: new writes pile onto the newest shard and create a hot partition.

Hashing the key spreads load. Range partitioning keeps nearby keys together, which helps range scans and hurts if traffic clusters.

```text
shard = hash(user_id) % shard_count
```

Fixed modulus hashing is easy until `shard_count` changes. Consistent hashing or a directory service avoids moving every row during expansion.

## Query patterns change

Once data is partitioned, any query that does not include the shard key becomes a scatter-gather query. Each shard does work. Tail latency becomes the max of N machines instead of one.

Cross-shard transactions are the other cliff. Two-phase commit exists, but most teams design it away:

- Keep a transaction inside one shard.
- Use sagas for multi-shard workflows.
- Accept eventual consistency for derived views.

Secondary indexes are local to a shard unless you build a global index. Search and unique constraints that span the whole dataset need extra machinery.

## Resharding

Growth is not a one-time split. You will add shards, retire bad keys, and isolate noisy tenants.

Approaches include:

1. **Split a hot shard** into two by range or hash bucket.
2. **Move a tenant** onto a dedicated shard.
3. **Rebuild** into a new cluster and cut over with dual writes or replication.

During migration you need a source of truth for key location. A lookup table, a hashing scheme with virtual nodes, or a proxy such as Vitess or a custom router all exist to answer: *where is this key now?*

## What sharding does not fix

Sharding does not remove the need for backups, schema migrations, or query hygiene. It multiplies them. A slow migration now runs N times. A missing index is N incidents. Observability has to be shard-aware or you will debug the wrong node.

A useful test before you shard: can you get another 12 months from read replicas, partitioning inside one database, or archiving cold data? Sharding is a tax you should postpone until the alternative taxes are higher.

When you do shard, document the key, the routing rule, and the queries you refuse to support. That document will save more outages than any diagram of boxes and arrows.
