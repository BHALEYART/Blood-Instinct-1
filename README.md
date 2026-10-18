# Blood Instinct #1
A Web Comic by B.HaleyArt

Read it at **https://bhaleyart.github.io/Blood-Instinct-1/**

## Reader controls

| Action | Desktop | Phone |
| --- | --- | --- |
| Next / previous page | → / ← (or D / A, Space / Shift+Space), side buttons, or click the right / left third of the page | Swipe, or tap the right / left side of the page |
| First / last page | Home / End | Page grid |
| All pages | G | Grid button |
| Zoom (loads full-resolution art) | Z (Esc to exit) | Zoom button, then pinch |
| Scroll mode (all pages in one strip) | S | Strip button |
| Fullscreen | F | — |

Every page has its own link (`#cover`, `#page-7`, `#end`), browser back/forward work, and the reader remembers where you left off and which mode you used.

## Files

- `index.html`, `styles.css`, `viewer.js` — the viewer (no build step)
- `cover1.jpg`, `panel1.jpg` … `panel20.jpg` — full-resolution originals (used for zoom)
- `web/` — 1200px-wide WebP copies shown while reading (~180 KB vs ~2 MB each)
- `thumbs/` — small WebP thumbnails for the page grid
- `web/og-cover.jpg` — link-preview image

## Adding pages

1. Add the original as `panelN.jpg` in the repo root.
2. Generate the web and thumbnail copies (needs Python with Pillow):

   ```sh
   python3 -c "
   from PIL import Image; import sys
   for n in sys.argv[1:]:
       im = Image.open(n + '.jpg').convert('RGB')
       im.resize((1200, round(1200 * im.height / im.width)), Image.LANCZOS).save(f'web/{n}.webp', quality=82, method=6)
       im.resize((220, round(220 * im.height / im.width)), Image.LANCZOS).save(f'thumbs/{n}.webp', quality=72, method=6)
   " panel21
   ```

3. Add `'panel21'` to the `PAGES` list at the top of `viewer.js`.
