# AKR Portal

A static start page with categorized quick links to popular websites. No build step, no dependencies.

## Run

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Deploys as-is to GitHub Pages, Netlify, Vercel, or any static host.

## Edit links

All links live in `assets/sites.js`. Add a site to a category:

```js
{ name: "Example", url: "https://example.com", desc: "Short description" }
```

## Why it's built this way (legal hygiene)

- **Links only.** Sites are opened in a new tab, never iframed or scraped, so no content is copied.
- **No logos.** Cards use generated letter badges instead of company logos, to avoid trademark/logo-usage issues.
- **Non-affiliation notice** in the footer.
- **No tracking.** No cookies, analytics, remote fonts, or third-party favicon services, so no cookie banner is needed. If you add analytics or affiliate links later, add a privacy policy / cookie consent and disclose the affiliate relationship.
