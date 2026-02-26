# Partner Logos — Upload Checklist

This folder is the **single source of truth** for all BuWa Digital partner logos.
All logos referenced in `src/data/partners.json` must live here.

---

## ✅ Before You Upload

- [ ] Format: `.png` preferred — `.webp` or `.jpg` accepted
- [ ] Filename: **lowercase + hyphens only** — no spaces, no apostrophes, no uppercase
- [ ] Filename examples:
  - ✅ `robinson-neal-boxing-academy.png`
  - ✅ `century-21.png`
  - ✅ `popup-par-tee.png`
  - ❌ `RobinsonNeal.png` (uppercase)
  - ❌ `bill's music.png` (apostrophe + space)
- [ ] One file per real business — no location variants unless intentional
- [ ] After uploading, add the entry to `src/data/partners.json`

---

## 📋 partners.json Entry Format

```json
{
  "name": "Display Name of Business",
  "logo": "exact-filename.png",
  "url": "https://example.com"
}
```

- `name` — display name shown on the site
- `logo` — exact filename in this folder
- `url` — full URL, or `null` if none

---

## 🏠 Host vs Community Partners

| Array | Who belongs here |
|-------|-----------------|
| `hostPartners` | Businesses that physically host a BuWa TV screen |
| `communityPartners` | Marketing clients and other partners without a screen |

---

## 🚦 Running the Validator

After making any changes to `partners.json` or this folder, run:

```bash
npm run validate:partners
```

This checks:
- Every logo in JSON exists in this folder
- No duplicate partner names across arrays
- No duplicate logo filenames across arrays
- All filenames follow the lowercase-kebab-case convention

The validator also runs automatically on every pull request via GitHub Actions.
