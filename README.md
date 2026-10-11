# AKR Portal

An app-store style start page for popular websites. No build step, no dependencies.

- **For you**: horizontal rows per category, plus *Your apps* (favorites) and *Recently opened*.
- **Categories**: filter chips and a list view.
- **My apps**: your favorites.
- **App details**: tap an app for its page with **Open** and **Add to My apps**.
- **Settings** (gear icon): theme, open in new tab, show recents, skip the details page, clear/reset.

Settings, favorites and recents are saved in the browser's `localStorage` (per device, no account).

## Run

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Deploys as-is to GitHub Pages, Netlify, Vercel, or any static host.

## Edit links

All links live in `assets/sites.js`. Add a site to a category:

```js
{ id: "example", name: "Example", url: "https://example.com", desc: "Short description" }
```

## Why it's built this way (legal hygiene)

- **Links only.** Sites are opened in a new tab, never iframed or scraped, so no content is copied.
- **No logos.** Cards use generated letter badges instead of company logos, to avoid trademark/logo-usage issues.
- **Non-affiliation notice** in the footer.
- **No tracking.** No cookies, analytics, remote fonts, or third-party favicon services, so no cookie banner is needed. If you add analytics or affiliate links later, add a privacy policy / cookie consent and disclose the affiliate relationship.

## About "auto-login" to listed sites

A portal cannot sign users in to other websites: each site keeps its own login cookies, which browsers
don't let other sites read or set. Storing users' passwords for those sites to replay them would be a
serious security and legal risk (and looks like phishing). The good news: if a user is already signed in
to a site in their browser, opening it from the portal keeps them signed in automatically.
