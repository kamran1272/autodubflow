# Database package

Persistence and Prisma layer.

## Responsibilities

- Prisma
- schema.prisma
- migrations
- database client
- database repositories

## Rule

This package owns the data model and the persistence boundary. Application code should not need to know database internals beyond repository interfaces.
