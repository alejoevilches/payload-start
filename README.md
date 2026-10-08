# payload-start

A Payload CMS 3 + Next.js 16 boilerplate with the parts every marketing/content site ends up needing, already wired:

- **Pages** built from blocks, with a catch-all route (`/about`, `/services/roofing`, …) and `/` as the home slug.
- **Posts** (blog) with a Lexical rich text editor, tables, categories, excerpt and featured image.
- **SEO**: per-document meta title/description, Open Graph, `noindex`/`nofollow`, canonical URL, JSON-LD scripts, site-wide defaults, `sitemap.xml` and `robots.txt`.
- **Automatic redirects**: changing the slug of a published page or post creates a 301 and keeps older redirects pointing to the new path. A `Redirects` collection lets you manage them by hand too.
- **Drafts and live preview** for pages and posts.
- **Globals**: Header (logo + nav), Footer (links) and Site Settings (phone, email, SEO defaults, tracking IDs).
- **Tracking**: Google Tag Manager, Google Analytics and Meta Pixel, loaded only when an ID is set.
- **Tailwind CSS 4** with `@tailwindcss/typography`.
- One example block (`titleSubtitle`) to copy from.

It does not include brand styling, real blocks, icons, forms or a design system: those are per project.

## Requirements

- Node `^18.20.2 || >=20.9.0`
- pnpm `^9 || ^10 || ^11`
- A PostgreSQL database (a `docker-compose.yml` with Postgres 16 is included)

## Starting a new project

1. Copy the boilerplate into your new project folder and rename the project (`name` in `package.json`).
2. Create your env file and fill it in:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL`: Postgres connection string. The default matches the bundled docker-compose.
   - `PAYLOAD_SECRET`: any long random string (`openssl rand -hex 24`).
   - `NEXT_PUBLIC_SITE_URL`: production URL, used by the sitemap/canonical when Site Settings has no URL.
   - `MEDIA_DIR`: where uploads are stored. Defaults to `./media`.
3. Start the database (skip if you bring your own):
   ```bash
   docker compose up -d
   ```
4. Install, then create the first migration. The boilerplate ships **without migrations**, so each project generates its own:
   ```bash
   pnpm install
   pnpm payload migrate:create initial
   pnpm payload migrate
   ```
5. Run it:
   ```bash
   pnpm dev
   ```
6. Open `http://localhost:3000/admin`, create the first user, then:
   - fill **Site Settings** (site URL, site name, title suffix, default description and OG image, tracking IDs),
   - create a page with slug `/` (the home page),
   - set the Header nav links and the Footer links.

`pnpm build` runs `payload migrate` before `next build`, so production deploys apply pending migrations automatically.

### Scripts

| Script | What it does |
|---|---|
| `pnpm dev` / `pnpm devsafe` | Dev server (`devsafe` clears `.next` first) |
| `pnpm build` / `pnpm start` | Migrate + production build / serve it |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after changing any collection, global or block |
| `pnpm generate:importmap` | Regenerate the admin import map after adding custom admin components |
| `pnpm payload migrate:create <name>` | Create a migration from your schema changes |
| `pnpm lint` | ESLint |

## Project structure

```
src/
  blocks/        Block definitions (Payload side)
  collections/   Pages, Posts, Redirects, Users, Media
  globals/       Header, Footer, SiteSettings
  fields/seo.ts  Reusable SEO field group
  hooks/         Redirect creation on slug change
  lib/           SEO metadata, draft-aware queries, path helpers
  components/    RenderBlocks, layout, JSON-LD, tracking, rich text
    ui/          Block components (React side)
  app/
    (frontend)/  Site routes: home, [...slug], blog, blog/[post]
    (payload)/   Admin and API routes (managed by Payload)
    sitemap.ts, robots.ts
```

## Adding a block

1. **Define it** in `src/blocks/MyBlock.ts`:
   ```ts
   import type { Block } from 'payload'

   export const MyBlock: Block = {
     slug: 'myBlock',
     fields: [{ name: 'heading', type: 'text', required: true }],
   }
   ```
2. **Register it** in `src/collections/Pages.ts`, in the `components` blocks array.
3. **Build the component** in `src/components/ui/MyBlock.tsx`. Props are the block's fields; see `TitleSubtitle.tsx` for how to type them from `Page['components']`.
4. **Render it** by adding a case in `src/components/RenderBlocks.tsx`:
   ```tsx
   case 'myBlock': return <MyBlock key={block.id} {...block} />
   ```
5. Run `pnpm generate:types`, then `pnpm payload migrate:create add-my-block` (blocks create tables in Postgres).

To use custom blocks inside blog posts, add `BlocksFeature({ blocks: [...] })` to the Lexical editor in `Posts.ts` and a matching converter in `BlogRichText.tsx`.

## Conventions

- **Slugs**: the home page uses slug `/`. Every other page uses its path without the leading slash, nested paths allowed (`services/roofing`). Posts live under `/blog/<slug>`; the `/blog` index is a regular page with slug `blog`, so give it a block that lists posts.
- **Redirects**: when a *published* page or post changes slug, a 301 from the old path is created automatically (see `src/hooks/redirectOnSlugChange.ts`). Redirects are resolved in the page routes via `handleRedirect` in `src/lib/seo.ts`.
- **Drafts**: both collections have drafts enabled. The admin "Preview" button opens `/api/preview`, which turns on Next draft mode for logged-in users; a banner lets you exit. Public queries always filter by `_status = published` through `publishedQuery` (`src/lib/published.ts`), so use it for any new query on these collections.
- **SEO**: add `seoField` (`src/fields/seo.ts`) to any new routable collection, call `buildMetadata` in its `generateMetadata`, render `<JsonLd />`, and add it to `src/app/sitemap.ts`.
- **Categories**: `Posts.category` is a plain select. Change its options in `src/collections/Posts.ts` for each project.
- **Theme**: replace the placeholder tokens in `@theme` (`src/app/(frontend)/styles.css`).

## Changing the database

Postgres is the default (`@payloadcms/db-postgres`). To use another database, swap the adapter:

1. Remove the current adapter and install the new one, keeping the version equal to the other `@payloadcms/*` packages:
   ```bash
   pnpm remove @payloadcms/db-postgres
   pnpm add @payloadcms/db-mongodb@<same version>   # or @payloadcms/db-sqlite
   ```
2. Edit the `db` key in `src/payload.config.ts`:
   ```ts
   import { mongooseAdapter } from '@payloadcms/db-mongodb'

   db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
   // sqlite: sqliteAdapter({ client: { url: process.env.DATABASE_URL || '' } })
   ```
3. Update `DATABASE_URL` in `.env` / `.env.example` and the service in `docker-compose.yml`.
4. MongoDB has no migrations: change the `build` script in `package.json` to run only `next build` (drop `payload migrate &&`). SQLite and Postgres keep using migrations.
5. Delete `src/migrations` if present, then run `pnpm generate:types`.

Using the database without Docker: just point `DATABASE_URL` at any reachable instance (local install, Supabase, Neon, RDS…) and delete `docker-compose.yml`.

## Media storage

Uploads are written to `MEDIA_DIR` (default `./media`), which only works on a persistent disk. On serverless or ephemeral hosts, use a storage adapter, for example `@payloadcms/storage-s3` or `@payloadcms/storage-vercel-blob`, added to `plugins` in `src/payload.config.ts` with the `media` collection enabled. Image sizes used for Open Graph (`og`, 1200×630) are defined in `src/collections/Media.ts`.

## Docker image

The included `Dockerfile` builds a standalone image. If you use it, add `output: 'standalone'` to `next.config.ts` and make sure the migration step runs at deploy time against your production database.

## Customising per project: checklist

- [ ] `name` / `description` in `package.json`
- [ ] Colors and fonts in `styles.css`
- [ ] Blocks (`src/blocks`, `src/components/ui`, `RenderBlocks`)
- [ ] `Posts.category` options
- [ ] Header / Footer components in `src/components/layout`
- [ ] Site Settings content in the admin
- [ ] Database and media storage for your host
- [ ] `pnpm payload migrate:create initial`

## Keeping up with boilerplate updates

The boilerplate is meant to be copied, not installed as a dependency, so updates are manual: compare the files under `src/collections`, `src/globals`, `src/fields`, `src/hooks`, `src/lib` and `src/app` against your project (a `git diff --no-index` between the two folders works well), and keep your block and layout customisations.
