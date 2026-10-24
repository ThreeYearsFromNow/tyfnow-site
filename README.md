# tyfnow-site

Three Years From Now website. Plain HTML, CSS and JS, no build step. Netlify publishes the repo root; `_build/` holds the page assembler and is excluded by `netlify.toml`.

## V06 build (23 Oct 2026)

- Home, How we work and Work: one page stylesheet each (`css/v06-home.css`, `css/v06-how-we-work.css`, `css/v06-work.css`).
- `css/v06-chrome.css`: the shared utility strip, header, mobile menu, footer and cookie notice, on every page.
- `css/v06-legacy.css`: brings Contact, Privacy, Terms and the blog onto the V06 palette and type. These pages still use `site.css` and `pages.css` underneath.
- `css/v06-base.css`: self-hosted Inter (variable, Latin subset), stored as `fonts/InterVariable-latin.woff`.
- `js/v06.js`: the mobile menu. `js/site.js` still runs cookies, analytics and `data-track`.
- No inline styles or scripts anywhere, so the Content-Security-Policy in `netlify.toml` stays strict.
- `_build/build_work_blog.py` expects the old header and footer, so it is out of date. Update it before regenerating the blog.
