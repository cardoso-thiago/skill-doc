---
name: SQL Query Optimization
description: Analyze and optimize slow SQL queries for PostgreSQL, MySQL, and SQLite. Covers index strategies, execution plan analysis, query rewriting, and schema normalization patterns.
license: MIT
---

# SQL Query Optimization

Transform slow, resource-intensive queries into lightning-fast operations through systematic analysis and optimization.

## Core Capabilities

- **Execution plan analysis**: Read EXPLAIN/EXPLAIN ANALYZE output and identify bottlenecks
- **Index strategy**: B-tree, GIN, GiST, partial, and composite index design
- **Query rewriting**: Common Table Expressions, window functions, and anti-pattern fixes
- **Schema normalization**: 1NF through BCNF with practical denormalization tradeoffs
- **Connection pooling**: PgBouncer, HikariCP configuration for high-traffic workloads

## When to Use

Use this skill when you need to:
- Speed up a query taking more than 100ms
- Reduce database CPU/memory usage
- Design indexes for a new schema
- Diagnose N+1 query problems in ORM code

## Example: Before and After

**Before** (3.2s on 10M rows):
```sql
SELECT * FROM orders 
WHERE YEAR(created_at) = 2024 
  AND status != 'cancelled';
```

**After** (12ms with proper index):
```sql
-- Add index first:
CREATE INDEX idx_orders_created_status 
  ON orders (created_at, status) 
  WHERE status != 'cancelled';

-- Rewritten query (sargable):
SELECT id, user_id, total, created_at FROM orders
WHERE created_at >= '2024-01-01' 
  AND created_at < '2025-01-01'
  AND status != 'cancelled';
```

## Key Principles

1. **Measure before optimizing** — use EXPLAIN ANALYZE, not intuition
2. **Sargable predicates** — avoid functions on indexed columns in WHERE clauses
3. **Cover your queries** — include all SELECT columns in composite indexes
4. **Partial indexes** for filtered datasets cut index size dramatically
