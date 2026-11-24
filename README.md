# hookrelay

Reliable webhook delivery as a service. Register endpoints, send events, and
hookrelay delivers them with signed payloads, retries with exponential backoff
and a dead-letter queue for deliveries that never succeed.

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

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/endpoints` | Register a URL. The signing secret is returned once, in this response. |
| `GET` | `/endpoints` | List endpoints (without secrets). |
| `PATCH` | `/endpoints/:id` | Change the URL, description or enable/disable it. |
| `DELETE` | `/endpoints/:id` | Remove an endpoint and its deliveries. |
| `POST` | `/events` | Ingest an event. One delivery is queued per enabled endpoint. |
| `GET` | `/deliveries` | List deliveries, filter with `status`, `endpointId` and `limit`. |
| `POST` | `/deliveries/:id/redeliver` | Requeue a delivery that exhausted its attempts. |
| `GET` | `/health` | Liveness and database check. |

### Example

```bash
curl -X POST localhost:3000/endpoints \
  -H 'content-type: application/json' \
  -d '{"url": "https://example.com/hooks"}'

curl -X POST localhost:3000/events \
  -H 'content-type: application/json' \
  -d '{"type": "order.created", "payload": {"id": 42}}'
```

## How delivery works

1. An event is stored and one `pending` delivery is created for every enabled endpoint, in a single transaction.
2. A background worker claims due deliveries with `FOR UPDATE SKIP LOCKED`, so several instances can run side by side.
3. Each request is a JSON `POST` with a 10 second timeout and these headers:
   - `x-hookrelay-signature`: `t=<unix seconds>,v1=<HMAC-SHA256 of "<t>.<body>">`
   - `x-hookrelay-event` and `x-hookrelay-delivery`
4. Any 2xx answer marks the delivery as `delivered`. Anything else schedules a retry with exponential backoff and jitter (30s base, 1h cap by default).
5. After the last attempt the delivery becomes `failed`. It stays visible in `GET /deliveries?status=failed` and can be requeued with the redeliver endpoint.

### Verifying a signature

Recompute the HMAC over `"<t>.<raw body>"` with the endpoint secret, compare it with `v1` using a constant-time comparison, and reject timestamps older than a few minutes to block replays. `src/signing/signature.ts` is a reference implementation.

## Configuration

See [.env.example](.env.example). Delivery tuning: `DELIVERY_POLL_INTERVAL_MS`, `DELIVERY_BASE_DELAY_MS` and `DELIVERY_MAX_ATTEMPTS`.

## Scripts

```bash
npm test          # unit tests
npm run test:e2e  # needs the database from docker compose
npm run lint
npm run build
```

## Roadmap

- [x] Typed configuration and database connection
- [x] Endpoint registry (CRUD)
- [x] Event ingestion
- [x] HMAC signed deliveries
- [x] Retries with exponential backoff
- [x] Dead-letter state and manual redelivery
- [ ] Per-endpoint event type filters
- [ ] Delivery attempt history
- [ ] Dashboard (separate repository)

## License

MIT
