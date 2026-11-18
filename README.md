# hookrelay

Reliable webhook delivery as a service. Register endpoints, send events, and
hookrelay delivers them with signed payloads, retries with exponential backoff
and a dead-letter queue for deliveries that never succeed.

> Work in progress. The roadmap below shows what is planned.

## Stack

- NestJS 12 with TypeScript
- PostgreSQL 16 with TypeORM
- Vitest and oxlint
- Docker Compose for local development

## Getting started

```bash
cp .env.example .env        # set DATABASE_PASSWORD
docker compose up -d db
npm install
npm run start:dev
```

## Roadmap

- [ ] Typed configuration and database connection
- [ ] Endpoint registry (CRUD)
- [ ] Event ingestion
- [ ] HMAC signed deliveries
- [ ] Retries with exponential backoff
- [ ] Dead-letter queue and manual redelivery
- [ ] Dashboard (separate repository)

## License

MIT
