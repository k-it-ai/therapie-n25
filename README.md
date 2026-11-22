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

## Where to change things

| What | Where |
|---|---|
| All texts (DE + EN), team, opening hours, address | `src/i18n/content.ts` |
| Photos (file + alt text) | `src/assets/photos/`, `src/lib/photos.ts` |
| Hero slideshow photos | `src/components/Hero.astro` (`slides`) |
| Room photos | `rooms.items[].photos` in `src/i18n/content.ts` |
| Colours, fonts, spacing | `src/styles/global.css` (`:root`) |
| Impressum / Datenschutz | `src/pages/impressum/`, `src/pages/datenschutz/` |

### Placeholders still to fill
- **Team photo** – `src/components/Team.astro` (`.team-photo`): replace the placeholder with a `<Picture>`.
- **Impressum** – "Webdesign & Entwicklung" name.

## Notes
- Fonts are self-hosted (no Google Fonts request).
- Google Maps loads only after the visitor clicks "Karte laden" (GDPR); the privacy page describes this.
- "Route planen" opens Apple Maps on Apple devices, the app chooser on Android and Google Maps elsewhere.
