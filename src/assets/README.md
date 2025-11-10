Image assets guidance
=====================

This folder holds application-controlled image assets that are bundled by Vite.

Recommendations
---------------
- Keep UI and branding images (logos, icons, illustrations) in `src/assets/` so Vite can fingerprint them in production.
- Use SVG for logos and simple illustrations. Prefer inline or imported SVG for styling and accessibility.
- Generate WebP and AVIF variants for photos and large rasters. Keep an appropriate JPEG/PNG fallback for older browsers.
- Use kebab-case names without spaces, e.g. `goc-logo.svg`, `eva-logo.svg`, `hero-1600.webp`.

Optimization workflow (example)
------------------------------
1. Keep a high-quality source (PSD/AI/large PNG/TIFF) in a separate repo or directory.
2. Use a build or CI step to generate WebP/AVIF/JPEG sizes using `sharp`.
3. Serve responsive images with `<picture>` and `srcset`.

See `../scripts/optimize-images.js` for a small example script that uses `sharp` to generate WebP/JPEG variants.
