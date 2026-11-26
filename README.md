# Therapie N25 – Website

One-page website for Therapie N25 (Physiotherapie & Osteopathie, München), German with an English version at `/en/`.
Built with [Astro](https://astro.build) as a static site: the build output is plain HTML/CSS/JS plus optimised images.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
```

## Live site on STRATO

The live site runs on the STRATO web space in the folder `/web` (the domain points there in the STRATO login).
Every push to `main` builds the site and uploads it automatically (`.github/workflows/deploy.yml`, about 3 minutes).
Test address before the switch: http://dev.therapie-n25.de (points to `/web`, hidden from search engines).

The workflow builds the site for `https://www.therapie-n25.de` and uploads
it with `scripts/deploy-sftp.sh`. It needs, under Settings → Secrets and variables → Actions:

| Kind | Name | Value |
|---|---|---|
| Secret | `STRATO_SFTP_HOST` | SFTP server from the STRATO login, without port (port 22 is used) |
| Secret | `STRATO_SFTP_USER` | SFTP user |
| Secret | `STRATO_SFTP_PASSWORD` | its password |
| Variable (optional) | `STRATO_SFTP_DIR` | target folder; leave it out when the SFTP user only sees its own folder (`/web`), as set up now |

Safety: the upload only goes into an empty folder or one it filled before (marker file `.therapie-n25-deploy`),
so a wrong folder setting can never delete the other folders on the web space. Files that no longer exist in
the build are removed from the target folder.

`public/.htaccess` (Apache): `therapie-n25.de` → `www.`, the "page not found" page, browser caching and security
headers. HTTPS itself: "SSL erzwingen" in the STRATO login.

Manual alternative: `npm run build`, then upload the **contents** of `dist/` (including `.htaccess`) into `/web`
with FileZilla.

## Where to change things

| What | Where |
|---|---|
| All texts (DE + EN), team, opening hours, address | `src/i18n/content.ts` |
| Photos (file + alt text) | `src/assets/photos/`, `src/lib/photos.ts` |
| Hero slideshow photos | `src/components/Hero.astro` (`slides`: `set` 'wide' = screens wider than tall, 'tall' = upright screens, 'both' = both; `landscape` adds a second photo of the same subject for wide screens) |
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
- "Route planen" opens the default navigation app on iPhone/iPad (iOS 18.4+, `geo-navigation:` link) and Android (`geo:`), Apple Maps on Mac and Google Maps elsewhere; older iPhones/iPads and the in-app browsers of Instagram, Facebook, Messenger, LinkedIn and TikTok get a small Apple Maps / Google Maps menu (Android in-app browsers: Google Maps).
