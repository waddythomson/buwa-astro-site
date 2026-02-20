# Partner Logos for Carousel

Copy these files to `public/uploads/partners/` in your BuWa TV project.

## Current Logos

| File | Business |
|------|----------|
| `roxannes-market.png` | Roxanne's Market ✅ |
| `devine-nail-spa.png` | Devine Nail Spa (need logo) |
| `true-pharmacy.png` | True Pharmacy (need logo) |
| `triangle-pharmacy.png` | Triangle Pharmacy (need logo) |
| `san-jose.png` | San Jose Mexican Restaurant (need logo) |
| `que-bueno.png` | Que Bueno (need logo) |
| `gervais-nail-spa.png` | Gervais Nail Spa (need logo) |
| `bierkeller.png` | Bierkeller Brewing (need logo) |

## Adding New Logos

1. Save the logo file to `public/uploads/partners/` with a kebab-case filename
2. Add a `<div class="logo-item">` entry in both the original AND duplicate sets in the carousel HTML
3. The logo should be a PNG or WebP with transparent background for best results

## Recommended Logo Specs

- Format: PNG or WebP (transparent background preferred)
- Max height: ~200px (will be scaled down to 70px)
- Max width: ~400px (will be scaled down to 150px)

## Carousel Behavior

- Logos appear grayscale and slightly faded by default
- On hover: full color, full opacity, slight scale up
- Carousel pauses on hover
- Loops infinitely (that's why each logo appears twice in the HTML)
