# Tim Raja Main Site

React/Vite rebuild of `timrajahypnotherapy.com`, with the legacy WordPress site archived inside this repository.

## Included

- `archive/`: raw page snapshots, extracted text, media metadata, downloaded assets, and reference screenshots from the live site
- `public/archive-assets/`: locally served copies of the archived site assets used by the rebuild
- `src/`: the new React application
- `scripts/archive_site.py`: crawler used to preserve the live site
- `scripts/generate_page_data.py`: turns the archive into page data for the React app

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm start`

`npm start` serves the built SPA with a small Node server and SPA fallback, which is suitable for Railway once the project is built.
