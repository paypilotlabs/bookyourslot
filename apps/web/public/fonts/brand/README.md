# Brand fonts (supplied manually — never in git)

Download and drop here:

| File to create   | Font                                                        | Used for                                  |
| ---------------- | ----------------------------------------------------------- | ----------------------------------------- |
| `manoyri.woff2`  | Manoyri (graphicpear.com/manoyri-font)                      | BookYourSlot wordmark / logo / favicon    |
| `unique.woff2`   | Unique — free variable condensed (Behance gallery 160832905) | Marketing display headlines (`font-display`) |

If a download gives you `.otf`/`.ttf` instead of `.woff2`, drop those and ask
Claude to convert, or convert yourself (`npx -y ttf2woff2 < in.ttf > out.woff2`).
For Unique, prefer the **variable** file if the download offers one.

After adding the files:

1. Marketing pages pick them up automatically (`font-script` / `font-display`
   utilities in `apps/web/styles/globals.css`).
2. Regenerate the logo/favicon/OG assets so the wordmark and favicon render in
   Manoyri (the script auto-detects the files):
   run `scripts/generate-brand-assets.mjs` with `fontkit` + `png-to-ico`
   available (see the script header), then commit the regenerated files in
   `apps/web/public/`.

Until the files exist the site falls back to Cal Sans and the favicon stays a
letterless brand tile. Verify each font's license permits self-hosted web
embedding before shipping; the raw files stay out of git either way.
