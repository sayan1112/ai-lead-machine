This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy to Netlify

This repository has two apps at the root level. The Netlify deployment target is the Next.js app in `ai-lead-machine/`.

### 1) Create site from Git

1. In Netlify, choose **Add new site** -> **Import an existing project**.
2. Connect your Git provider and select this repository.

### 2) Build settings

Use these exact settings:

- **Base directory**: `ai-lead-machine`
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `20`

These are already configured in the root `netlify.toml`.

### 3) Environment variables

Set these in Netlify Site settings -> Environment variables:

- `DATABASE_URL` = your production PostgreSQL connection string
- `AUTH_SECRET` (or `NEXTAUTH_SECRET`) = strong random secret (32+ chars)
- `NEXTAUTH_URL` = your Netlify site URL (for example `https://your-site-name.netlify.app`)

You can verify required deployment variables at any time with:

```bash
npm run deploy:check
```

This command runs in strict mode and fails if required deployment variables are missing.

### 4) Prisma database setup

Before first production use, run Prisma migrations against your production database.

Recommended:

```bash
npx prisma migrate deploy
```

If you use a CI/CD migration step, run it with the same `DATABASE_URL` as production.

### 5) Verify deployment

After deploy, confirm:

1. `/login` loads successfully.
2. API routes under `/api/auth/[...nextauth]` return expected responses.
3. App can read/write data in the production PostgreSQL database.

### Troubleshooting

- If build fails with Prisma connection errors, re-check `DATABASE_URL` format and database network access rules.
- If auth callbacks fail, verify `NEXTAUTH_URL` matches the live Netlify URL exactly.
- Do not add SPA redirect rules for this app; Netlify Next.js runtime handles routing automatically.
