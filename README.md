# Sumit Chauhan - Personal Portfolio Website

A fast, fully responsive single-page portfolio built with plain HTML, CSS and vanilla JavaScript — no framework, no build step. Cinematic video backdrop, live competitive-programming stats, open-source contributions and shipped projects.

[**Have a look**](https://sumit.today/)

---

## ✨ Features

* **Live coding profiles:** Codeforces, LeetCode, CodeChef and GeeksforGeeks stats are fetched live. There are no hard-coded ratings or solved counts anywhere in the markup.
* **One source of truth:** every stat on the page (hero, platform cards, dashboard, achievements total) is bound to a single state object, so a value can never disagree between two places.
* **Honest failure states:** if a platform can't be reached, the page says "Live data unavailable" instead of showing an old number. A freshness label shows when data was last synced.
* **Cinematic backdrop:** looping ridge footage with a layered grade (scrim, readability gradient, vignette). Phones, data-saver and reduced-motion visitors get a 44 KB still frame instead of the video.
* **Accessible:** keyboard-navigable tabs and menu, visible focus states, reduced-motion support, meaningful link text.

---

## 🧱 How the live data works

```
browser ──► /api/profiles/:platform  (Netlify Function, CDN-cached ~3 min)
   │              └─► Codeforces API · LeetCode GraphQL · CodeChef · GeeksforGeeks
   └─ if the function isn't reachable (GitHub Pages mirror, plain static preview):
         Codeforces official API directly, public fallbacks for the rest
```

| File | Role |
| --- | --- |
| `js/profile-sources.mjs` | Handles + profile URLs, fetch/timeout/retry helpers and one parser per platform. Shared by the browser and the function. |
| `js/live-profiles.mjs` | Browser state (`profileStats`), short localStorage cache, rendering of every `data-stat` binding, Sync button, freshness label. |
| `netlify/functions/profiles.mjs` | Server-side proxy for platforms that block cross-origin browser requests. Public data only — no keys or secrets. |
| `script.js` | Page UI: navigation, mobile menu, animations, backdrop video, dashboard tabs and the `PROJECTS` data the project cards are rendered from. |

To show a stat somewhere new, add an element with `data-stat="<platform>.<field>"` (e.g. `data-stat="codeforces.rating"`); it is filled automatically.

---

## 🚀 Getting Started

```sh
git clone https://github.com/Gosling-dude/Sumit-Chauhan.github.io.git
cd Sumit-Chauhan.github.io
npm start        # static server on http://localhost:8080
npm test         # parser + function tests (Node 18+, no dependencies)
```

The page needs to be served over HTTP (ES modules don't load from `file://`). A plain static server won't run the Netlify Function, so the live stats use the browser fallbacks there; `netlify dev` runs the function locally too.

---

## 🎨 Customization

* **Profile handles / URLs:** `PROFILES` in `js/profile-sources.mjs` (and the matching card links in `index.html`).
* **Projects:** the `PROJECTS` array at the top of `script.js`.
* **Experience & open source:** the timeline in `index.html` (`#experience`).
* **Resume, email and socials:** links in `index.html` (nav, hero, contact, footer).

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
