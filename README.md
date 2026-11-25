# Ninotchca's creative portfolio

A static site (plain HTML, CSS and JavaScript — no build step) showing carousel design and editing work.

## Run locally
```
python -m http.server 8000
```
Open http://localhost:8000

## Add a carousel
1. Export each slide as `01.jpg`, `02.jpg`, … (1080 × 1350 px) into `assets/carousels/<project-id>/`.
2. Add one object to the `projects` list at the top of the gallery section in `js/main.js` (id, tab label, slide count, title, summary).

## Files you still need to add
- `assets/images/portrait.png` — your portrait
- `assets/fonts/Sloop-Script-Regular.ttf` — the signature font

## Deploy
Import the GitHub repo in Vercel. Framework preset: **Other**. Leave build command and output directory empty.
