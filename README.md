# TakenWalk

Need something? We'll walk for you. A hyperlocal community-commerce and errand network for Piwoyi, Abuja — connecting people, Walkers, and local businesses.

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and AUTH_SECRET at minimum
npx prisma migrate dev
npm run db:seed        # categories, Piwoyi geography, and the admin login — no fake businesses/jobs
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin tools live under `/admin/piwoyi` (sign in with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` from your `.env`).

## Environment variables

See `.env.example` for the full annotated list. Only `DATABASE_URL` and `AUTH_SECRET` are required to boot — everything else degrades gracefully:

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth session signing (`openssl rand -base64 32`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | For `db:seed` | Creates the one seeded admin login — no public sign-up |
| `NEXT_PUBLIC_MAP_STYLE_URL` | No | MapLibre style URL; defaults to OpenFreeMap's free "positron" style |
| `NOMINATIM_BASE_URL` | No | Geocoding provider base URL; defaults to the public Nominatim instance |
| `GEOCODING_USER_AGENT` | Strongly recommended in production | Identifies your app to Nominatim per its usage policy |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob for photo uploads; falls back to local disk in dev |
| `DEMO_MODE` | No | Must be exactly `"true"` to seed/show demo data — never set this in production |

## Mapping & geocoding architecture

TakenWalk's map runs entirely on **open-source, key-free infrastructure** — no Google Maps, no Google Geocoding, no API keys to provision before the map works.

- **Map rendering**: [MapLibre GL JS](https://maplibre.org/) — a vector map rendered client-side, styled by whatever style URL `NEXT_PUBLIC_MAP_STYLE_URL` points at.
- **Map data**: [OpenStreetMap](https://www.openstreetmap.org/), served by [OpenFreeMap](https://openfreemap.org/)'s public instance — free, no API key, no request limits, updated weekly from the full OSM planet dataset. Swappable to MapTiler/Stadia/a self-hosted style by changing one env var.
- **Geocoding**: [Nominatim](https://nominatim.org/), OSM's geocoder, hidden behind a small provider abstraction at `src/lib/geocoding/` (`geocodeAddress()`, `reverseGeocode()`). The public Nominatim instance is rate-limited to 1 request/second and requires a real identifying `User-Agent` — set `GEOCODING_USER_AGENT` before production use. Geocoding only ever runs from admin create/edit actions, **never on public map load**, and the result is saved to the database immediately — the address is never re-geocoded on subsequent visits.
- **Coordinates are the source of truth**: once a business has `latitude`/`longitude` saved, the map reads those directly from the database. Geocoding (address → coordinates) only happens once, when an admin looks up an address or edits it; reverse geocoding (coordinates → address) is display-only and never overwrites the saved coordinates.
- **User location**: the browser's native Geolocation API, requested only when someone taps "Use My Location" — never automatically, and never continuously tracked.
- **Clustering**: MapLibre's built-in GeoJSON clustering (`cluster: true`) — no extra dependency, scales to thousands of markers.

To swap either the tile provider or the geocoding provider later: change `NEXT_PUBLIC_MAP_STYLE_URL` for tiles, or edit the one `activeProvider` line in `src/lib/geocoding/index.ts` for geocoding. No other file needs to know.

## Key commands

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build/serve
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check
- `npm run db:seed` — seed real infrastructure data (categories, Piwoyi geography, admin login) — safe to re-run
- `npm run db:seed:demo` — seed **demo-only** data for local UI testing (requires `DEMO_MODE=true`; never run this against a production database)

## No-fabrication policy

The database starts empty. Businesses, Walkers, jobs, and community posts are added by the founder physically visiting Piwoyi and using `/admin/piwoyi/map`, or by real usage of the platform — never seeded or faked. Demo data (`npm run db:seed:demo`) is tagged `isDemoData: true` and is filtered out of every public and admin view unless `DEMO_MODE=true` is explicitly set.
