# Whale Girl · The Unreached (鲸鱼娘 · 未至之境)

English | [中文](README.zh.md)

A dark-only dsh skin built on a **video background**: a cyber-fantasy night where a
blue-haired girl's eye streams code under cyan data rain. The chrome is drawn as a
**holographic instrument panel floating in the night** — every surface is thin
translucent glass with the footage moving behind it, structure is a 1px cold-blue
hairline, and cyan is reserved for state.

## What it is

- **Pure assets**: `skin.json` (v2 manifest) + `skin.css` (full `--dsw-alias-*` token
  remap) + `patches.css` (L3 free selectors) + one video. No package.json, no build
  step, no hooks.
- **The first skin in this repository whose background is a video**
  (`backgroundMedia.type = "video"`). Every other skin with artwork ships a still
  image or a webp, so the video path is exercised here for the first time.
- **Dark only**: the same dark palette is declared for light and dark, and the skin
  is rendered identically whichever theme the system asks for.

## Palette

Every value was sampled from the footage, not invented:

| role | value | where it came from |
| --- | --- | --- |
| night | `#05070D` | the deepest water around the frame |
| panel | `#0A1020` | glass fill, one step above night |
| raised | `#142847` | hover surfaces, pills |
| hairline | `#1E3A6B` | the cold blue in the shadow detail |
| brand | `#3A7BFF` | the electric blue of the logotype |
| accent | `#39FFD1` | the cyan in the eye and the data rain |
| ink | `#E8F1FF` | body text |
| muted | `#8FA8CC` | the blue-grey of the rain filaments, used for
  secondary/tertiary text |

## The background video

The source clip is 26.67s / 1920x1080 / 24fps / 10.4 Mbps with **46px of pure black
top and bottom**. Shipping it as-is would let `object-fit: cover` spread those bars
across the viewport, so it is baked first:

| step | what happens |
| --- | --- |
| crop | `crop=1920:988:0:46` — the two black bars are removed (measured with `cropdetect`) |
| downscale | 1664 wide (856 high) / 24fps / CRF 28 / preset slow / yuv420p / +faststart |
| grade | `eq=contrast=1.05:saturation=1.06` — **brightness is not touched** |
| loop | the last 1.2s cross-fades into the first 1.2s: 640 frames in, **611 frames /
  25.46s / 6.63 MB** out |

The cross-fade makes the seam real rather than approximate: the last output frame is
followed in the source by the first output frame, so the join is a pair of consecutive
original frames. The self-check compares the join against the **95th percentile** of
the frame-to-frame difference (measured 2.00 vs 5.46), not the mean — the cross-fade
region is a double exposure whose adjacent difference is artificially low.

`scrim` paints only the bottom band (where the composer sits) and nothing at all at
the top: an early revision had a top gradient that the user identified as "the black
background above the wallpaper".

## How far the footage survives compositing

A translucent skin can dim its own background without anyone noticing. The check
takes the decoded video frame and the composited screenshot of the same frame and runs
a least-squares regression between them over a patch of pure picture: the **slope** is
how much contrast survives, the **correlation** is whether the image was smeared.

| | slope | corr |
| --- | --- | --- |
| this skin | **0.397** | **0.997** |

Correlation 0.997 means no blur. There is no `backdrop-filter` anywhere in this skin:
an early revision used frosted glass and the correlation fell to 0.87, which is what
"the background looks blurry" looked like in numbers.

## The holographic layer

Beyond the token remap, `patches.css` carries the rules that turn the shell's own
chrome into the panel described above. Each one was found by measurement, not by
guessing class names:

- **Surfaces** — the engine's ground, its three global darkening coats and the reading
  veil are all zeroed, so the footage is the ground. Panels, menus, the composer card,
  tooltips, approval cards, the settings dialog and the right-hand dock all become
  glass with a 1px hairline; corner brackets in cyan mark entries and overlays only.
- **Icons** — the shell's icon set is already 1px line art (`fill: none`, `stroke:
  currentColor`), and every stroke resolved to one of five shell slate blues. They now
  rest in electric blue and turn cyan on hover/expanded/current. The file-type badges in
  the dock's file browser were the only full-colour icons in the whole skin; the ones
  with hard-coded hex are re-filled, the ones driven by `--dsw-static-neutral-*` are
  re-pointed through those tokens.
- **Text** — the generator owns `label-primary/secondary/tertiary/dimmed/caption`; the
  shell re-declares them inside the composer and the session header, and those two
  scopes are re-pointed so the same semantic level does not render at two brightnesses.
- **Fonts** — the UI reads in Cascadia Mono (chrome and readouts) with DengXian for the
  Chinese, plus Bahnschrift for the display face. Prose stays in the proportional text
  face; monospace is for readouts, as the language asks.
- **Code** — code blocks and inline code are pulled into the skin's own monospace; the
  shell's code stack starts with `SF Mono`, which does not exist on Windows and was
  silently falling back to Consolas.

## Accessibility notes

Contrast is measured against the **composited** background (video + scrim + glass +
panels) by hiding the text layer and sampling the screenshot, then comparing against
the declared text colour:

| element | median | over the brightest 5% |
| --- | --- | --- |
| composer placeholder | 10.81:1 | 2.92:1 |
| new-session label | 14.82:1 | 13.73:1 |
| model pill | 9.78:1 | 5.81:1 |
| usage card | 16.05:1 | 13.67:1 |

The composer placeholder is the one element that can fall under 4.5:1, and only where
the footage is at its brightest behind it. It is intentionally dim (a placeholder), but
it is the first thing to revisit if the artwork or the panel opacity changes.

## Preview

`preview/light.jpg` and `preview/dark.jpg` are the same render — this skin is dark only.
They are captured from the try-on page against the shipped video, not from a colour card.

## License

The skin engineering (`skin.json` / `skin.css` / `patches.css`, the palette and every
holographic rule) is the author's original work. The background video was provided by
the author as source footage and processed by the bake pipeline described above. Both
are released under [CC BY-NC-SA 4.0](LICENSE): attribution required, non-commercial,
share-alike.
