# USHASRI Farms – Homepage

Static site: `index.html`, `robots.txt`, `sitemap.xml`. No build step.

## Run locally
    python3 -m http.server 8000   # then open http://localhost:8000

## Edit settings
Open `index.html` and edit the `CONFIG` block near the bottom:
- `FEEDBACK_FORM_URL` – your Google Form link
- `MAP_EMBED_URL` – optional Google Maps embed src
- `WA_MESSAGE` – default WhatsApp message

Replace `https://www.example.com/` (canonical, og:url, JSON-LD, robots.txt, sitemap.xml) with your real domain.

## Push to a NEW GitHub repo (keeps your original repo untouched)
    cd ushasri-farms
    git init && git add . && git commit -m "USHASRI Farms homepage"
    git branch -M main
    git remote add origin https://github.com/<you>/ushasri-farms-site.git
    git push -u origin main

## Deploy free
GitHub Pages: repo Settings > Pages > Deploy from branch `main` / root. Or drag the folder onto Netlify / Cloudflare Pages.

## Later
Add pages (e.g. `oyster-mushrooms.html`), then add a nav `<li>` and a sitemap `<url>`.
