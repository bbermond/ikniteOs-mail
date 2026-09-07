# IkniteOS Mail

Email signature generator. Pick a template, fill in your details, crop a photo,
and paste a working signature into Gmail, Outlook or Apple Mail.

A product of [IkniteOS](https://ikniteos.com). Runs at `mail.ikniteos.com`.

## Why it exists

Signature generators usually fall over in one of four places. This one is built
around those four problems.

| Problem | What this does |
| --- | --- |
| Outlook ignores flexbox, grid and most modern CSS | Every template renders nested tables with inline styles only |
| Copying gives the recipient raw markup | The copy button writes `text/html` to the clipboard, so Gmail pastes a rendered signature |
| Portraits get squashed into non-square boxes | Photos are cropped to a true square on a canvas before upload, and the markup locks width and height |
| Images stop loading months later | Uploads are content hashed and served `immutable`, so a URL never changes meaning |

## Stack

Next.js 15 App Router, React 19, TypeScript, Tailwind. No database. Two server
routes: one accepts an image upload, one accepts a lead.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```

`npm run build && npm start` for a production build. `npm run typecheck` for types.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes in production | Absolute base for image URLs inside signatures. Wrong value means broken images in other people's inboxes |
| `UPLOAD_DIR` | yes in production | Must be a persistent volume. Ephemeral storage means every deploy breaks every signature already sent |
| `GHL_API_TOKEN` | no | GoHighLevel Private Integration token |
| `GHL_LOCATION_ID` | no | GoHighLevel location that receives leads |

Without the GHL pair the app still works. Leads are appended to
`$UPLOAD_DIR/leads.ndjson` regardless, so a CRM outage never loses one.

## Deploying to Railway

1. New project, deploy from this repo. Nixpacks config is committed.
2. Add a volume mounted at `/data`.
3. Set the four environment variables. `UPLOAD_DIR=/data/uploads`.
4. Add the custom domain and point a CNAME at it.

`nixpacks.toml` copies `public` and `.next/static` into the standalone output.
Without that step the app boots but serves no CSS.

## Adding a template

Templates are pure functions. A template takes `SignatureData` and a `Colorway`
and returns an HTML string. Nothing else in the app needs to change.

1. Copy `src/templates/compact.ts` as a starting point.
2. Declare `colorways` and a `capabilities` object. Capabilities drive which
   fields the editor shows, so a template without a photo simply says so and the
   upload control disappears.
3. Export a `Template` and add it to the array in `src/templates/index.ts`.

Rules that keep templates working in real mail clients:

- Tables for layout. No flex, no grid, no positioning.
- Inline styles only. No classes, no `<style>` block.
- Explicit `width` and `height` attributes on every `<img>`.
- Run user input through `esc()` and every URL through `safeUrl()`.
- Wrap output in `tidy()` so whitespace between cells does not become gaps.

## Lead capture

Design and preview are free. The gate appears on export, once someone has
already seen their finished signature, which is where intent is highest.

The form takes name, work email, company, optional website and team size, and an
explicit consent tick. Free mailbox domains are rejected, there is a honeypot
field, and the route is rate limited per IP. The consent wording and timestamp
are stored with the record.

## Layout

```
src/
  app/            routes, API handlers, global CSS
  components/     Editor, PhotoCropper, LeadGate
  lib/            clipboard, storage, lead validation and GHL
  templates/      one file per template, plus shared types and helpers
```

## Roadmap

- Team mode: one brand kit, many people, CSV in and a zip out
- Real social icons rather than text links
- Saved brand kits behind a light account
- Direct install into Google Workspace and Microsoft 365
