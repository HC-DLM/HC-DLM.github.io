# HC-DLM project page

Static site, no build step. Open `index.html` directly or serve the folder from any static host
(GitHub Pages, Netlify, or `python -m http.server 8000 --bind 127.0.0.1` for a local look).
Fonts and KaTeX load from CDNs; without network the page still renders with system fonts and the
one display equation shows as LaTeX source.

## Before publishing

Edit `config.js` only:

- `authors`, `affiliations`: filled. Add `url` for homepages or `equal: true` for shared first authorship.
- `links.arxiv`: the arXiv abstract URL once announced. `links.code`: the repository URL.
- `bibtex`: replace `XXXX.XXXXX` with the arXiv identifier.

Every value that still starts with `TODO` renders with an amber background, so an unfilled field is
visible on the page itself.

## Files

- `index.html`: page content. The hero card holds the reverse-process diagram (inline SVG) above the sentence demo;
  `demo.js` re-triggers the diagram's one-shot arrow animations on every demo step, so the two stay in sync. Numbers are copied from the paper's Sudoku,
  Countdown, LM1B and ablation tables; `check_numbers.py` verifies the table cells against the LaTeX sources.
  The structural comparison table follows the appendix table on hybrid models.
- `style.css`: light, Inter-based layout in the style of the Cola-DLM project page (kicker + bold heading per section,
  black pill buttons, white cards, grey-header comparison table with our row tinted). Blue marks the latent, coral
  the token feedback and our rows.
- `main.js`: fills the hero (authors, buttons) and BibTeX from `config.js`.
- `demo.js`: the scripted one-sentence denoising illustration in the hero (8 steps, hand-written read-outs so two
  revisions are visible; the scaffold row re-noises with a linear schedule from a seeded PRNG). It is labelled as a
  simulation on the page and is not model output.
- `assets/`: figures exported from the paper's `figures/*.pdf` at 300 dpi as WebP, plus the two algorithm boxes
  re-typeset as standalone LaTeX in `<paper>/tmp/alg_renders/` (algpseudocode, no float wrapper) and exported the same way.

## Checks

```
python check_numbers.py ../../6ab32113c9d64122f4dc0686/tables
```
