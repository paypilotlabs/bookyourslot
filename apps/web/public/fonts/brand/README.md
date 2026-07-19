# Brand fonts (supplied manually — licensed files, never in git)

Download from your Envato Elements account and drop here:

| File to create          | Envato item                                  |
| ----------------------- | -------------------------------------------- |
| `howells-script.woff2`  | Howells Script Font (brand name / wordmark)  |
| `willow.woff2`          | Willow Typeface — Bold Serif (display text)  |

If Envato only gives you `.otf`/`.ttf`, drop those and ask Claude to convert,
or convert yourself (e.g. `npx -y ttf2woff2 < in.ttf > out.woff2`).

After adding the files:

1. The marketing pages pick them up automatically (`font-script` /
   `font-display` utilities defined in `apps/web/styles/globals.css`).
2. Regenerate the logo/favicon/email assets from Howells:
   `npx -y -p fontkit -p png-to-ico node scripts/generate-brand-assets.mjs`
   (or run it with NODE_PATH pointing at a dir where those two packages are
   installed). Commit the regenerated files in `apps/web/public/`.

The font binaries are gitignored on purpose — the Envato license does not
permit redistributing the raw files in a public repo.
