---
title: "Why Scaling writes is the hardest problem "
description: Sometimes Writing to database is more hard than reading.
pubDate: 2026-04-03
author: Pankaj Chauhan
category: System Design
heroImage: /images/blog/dknfxihczujqguwwhhbxsk.jpg
draft: true
featured: false
trending: false
---
Scaling writes is harder compared to reads. Because when you read the data, you are not changing anything. So, using replicas and caching, it becomes easy to make reads fast.

Writes are tough because they change the single source of truth. When multiple people are trying to modify the same document, then the system must coordinate to maintain consistency.

Generally, one primary database handles all the write operations, but it becomes a bottleneck under high load.

**Some of the major write bottlenecks are:**

1. **Lock Contention:** It means when multiple people are trying to access the same shared resource, they will block each other. Basically, they are trying to change the same row of a table.
2. **Disk I/O Limits:** When you write to disk, it is generally slower than reading because every database write involves disk operations like index updates. Also writes the changes to WAL (Write Ahead Log). So the data can be recovered if the database crashes.
3. **Hot Key:** Even when database is sharded ad you have 100 shards, if all request for that shard goes to same single shard then will will become bottlenecks and this is hot key problem.

**How to handle this issue ?**

**1. Vertical Scaling :** We can upgrade the hardware (CPU, or add more RAM) which will give more space to database. We can also optimize the database writes by reducing the number of indexes. Also we can tune the database settings like optimizing the storage engines. 

**2. Sharding & Partitioning :** When single machine is not enough then we move to horizontal scaling.\
sharding means splitting the database into multiple pieces ( Partitions).\
Each shard handles its own portion. We can shard by userid or region 

**3. Queuing** : If lots of data coming for writes, then one more best way to handle this is put all the data in queue and consume it in steady rate.

**4. Batching :** Another way to handle write performance is doing more things in one operation. Means bulk write in one shot. Batching means grouping multiple write action together and performing them as one operation.
