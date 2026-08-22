# AI Lead Machine

AI Lead Machine is a multi-tenant real-estate sales workspace for capturing enquiries, qualifying requirements, matching live inventory, scoring intent, scheduling follow-ups, and converting opportunities into appointments.

## Local development

```bash
npm install
npx prisma migrate deploy
npm run dev
```

The local development database can use the SQLite `file:` URL already present in `.env`. Production must use a managed PostgreSQL connection string and the committed migrations.

Create a first workspace at `/signup`, or use the seeded local account when the database has been seeded:

```bash
npx prisma db seed
```

## Environment variables

Keep `.env` and `.env.local` out of Git. Server-only values are required for deployment:

- `DATABASE_URL` — production PostgreSQL connection string
- `AUTH_SECRET` — long random Auth.js secret
- `NEXTAUTH_URL` — canonical application URL
- `OPENAI_API_KEY` — optional for hosted model responses; without it, the server keeps messages and uses the safe deterministic fallback
- `OPENAI_MODEL` — optional, defaults to `gpt-4o-mini`

Never expose `AUTH_SECRET`, `DATABASE_URL`, or `OPENAI_API_KEY` through a `NEXT_PUBLIC_` variable.

## Production deployment

```bash
npm run deploy:check
npx prisma generate
npx prisma migrate deploy
npm run build
```

Netlify should use `ai-lead-machine/` as the base directory, `npm run build` as the build command, and `.next` as the publish directory. Set all production environment variables in the Netlify site settings before the first deploy.

## Core workflow

The authenticated `/api/ai/chat` endpoint validates the request, enforces workspace isolation and rate limits, loads only that workspace's lead and available properties, stores both messages, extracts structured requirements, persists a deterministic lead score, schedules conservative follow-ups, and returns appointment intent without inventing a date or time.
