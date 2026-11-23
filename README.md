# Therapie N25 – Website

One-page website for Therapie N25 (Physiotherapie & Osteopathie, München), German with an English version at `/en/`.
Built with [Astro](https://astro.build) as a static site: the build output is plain HTML/CSS/JS plus optimised images.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

## Build & upload to STRATO

```bash
npm run build      # writes the finished site to dist/
```

Upload the **contents** of `dist/` (not the folder itself) into the web root of the STRATO package via SFTP
(e.g. FileZilla or Cyberduck; host and login are in the STRATO customer area under *SFTP*).
Replace the old files. No server-side software is needed.

## Preview on GitHub Pages

Every push to `main` builds the site and publishes it via `.github/workflows/deploy.yml`.

1. Repo → Settings → Pages → Build and deployment → Source: **GitHub Actions** (one-time).
2. Preview: https://k-it-ai.github.io/therapie-n25/ (marked `noindex`, so Google ignores it).

To serve the real domain from GitHub instead of STRATO later: enter `www.therapie-n25.de` under
Settings → Pages → Custom domain and point the domain's DNS at GitHub (STRATO DNS settings: CNAME `www` →
`k-it-ai.github.io`). The workflow detects the domain automatically: links drop the `/therapie-n25` prefix and
`noindex` is removed.

## Where to change things

| What | Where |
|---|---|
| All texts (DE + EN), team, opening hours, address | `src/i18n/content.ts` |
| Photos (file + alt text) | `src/assets/photos/`, `src/lib/photos.ts` |
| Hero slideshow photos | `src/components/Hero.astro` (`slides`) |
| Room photos | `rooms.items[].photos` in `src/i18n/content.ts` |
| Social preview image (WhatsApp etc.) | `public/og-therapie-n25.jpg` |
| Colours, fonts, spacing | `src/styles/global.css` (`:root`) |
| Impressum / Datenschutz | `src/pages/impressum/`, `src/pages/datenschutz/` |

### Placeholders still to fill
- **Team photo** – `src/components/Team.astro` (`.team-photo`): replace the placeholder with a `<Picture>`.

### Location map
`src/assets/map.svg` is drawn from OpenStreetMap data by `scripts/build-map.py` (see the comment at the top
of the script for the two commands). The credit "© OpenStreetMap-Mitwirkende" next to the map is required by
the OpenStreetMap licence (ODbL).

## Notes
- Fonts are self-hosted (no Google Fonts request).
- No third-party requests: the map is a static image, fonts are self-hosted.
- "Route planen" opens Apple Maps on Apple devices, the app chooser on Android and Google Maps elsewhere.
