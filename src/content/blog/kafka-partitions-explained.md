---
title: "Kafka Partitions Explained"
description: "What a Kafka partition really is, how keys map to ordering, and why consumer groups live or die by partition count."
pubDate: 2026-07-28
author: "Pankaj Chauhan"
category: "Distributed Systems"
tags:
  - Kafka
  - Distributed Systems
  - Messaging
heroImage: "/images/blog/kafka-partitions.svg"
heroImageAlt: "Parallel stream illustration representing Kafka partitions"
draft: false
featured: false
trending: true
---

Kafka’s unit of parallelism is the partition, not the topic. A topic is a name. A partition is an ordered, append-only log that lives on a broker and can be replicated to others.

If you remember one sentence, remember this: **ordering is per partition, throughput scales with partitions, and a consumer group can only run as many active consumers as there are partitions.**

## Anatomy of a partition

Each partition is a sequence of records with monotonically increasing offsets. Producers append. Consumers read from an offset they remember.

Replication copies the log to follower brokers. The leader handles reads and writes. The controller tracks the in-sync replica set. Durability is a function of `acks`, `min.insync.replicas`, and whether you wait for the ISR.

```text
topic: payments
  partition 0: offset 0, 1, 2, 3, ...
  partition 1: offset 0, 1, 2, ...
  partition 2: offset 0, 1, 2, 3, 4, ...
```

A record has a key, a value, and metadata. The key is optional, but it is how you ask Kafka to keep related records together.

## How records find a partition

The default partitioner hashes the key:

```text
partition = hash(key) % num_partitions
```

Records with the same key land in the same partition and therefore keep their relative order. Records with no key are spread for throughput, and you give up key-based ordering.

Changing partition count later reshuffles that hash. If you depend on key affinity, adding partitions is not a free operation. You may need a new topic and a migration.

## Consumers and the group protocol

A consumer group assigns each partition to one group member. That is how Kafka gives you competing consumers without double-processing a partition.

- 12 partitions and 3 consumers → about 4 partitions each.
- 12 partitions and 12 consumers → one each.
- 12 partitions and 20 consumers → 8 consumers idle.

Rebalances pause work. Sticky and cooperative assignors reduce that pause, but they do not change the partition ceiling.

Offsets are committed per partition. If you process records and crash before commit, you re-read. If you commit before processing, you can skip. Exactly-once inside Kafka is a specific transactional design, not a default.

## Operational levers

Partition count is a capacity plan:

| Goal | Lever |
| --- | --- |
| More consumer parallelism | More partitions |
| Preserve order for an entity | Key by entity ID |
| Survive broker loss | Replication factor 3, ISR policy |
| Bound replay time | Retention and compaction |

Too many small partitions create metadata and file-handle overhead. Too few create hot logs and idle consumers.

Compacted topics deserve a special note. Compaction keeps the latest value per key inside a partition. It is not a generic database. It is a changelog.

Design the key first. Then pick a partition count that matches expected consumer instances for the next growth stage. Kafka is easy to “just add a topic” to, and expensive to re-partition after producers are live.
