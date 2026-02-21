# Partner Logos

This folder is the source of truth for partner logos used across the site.

## Folder structure

- `hosts/`: Host partners (locations that host screens)
- `non-hosts/`: Non-host partners / community partners

## Where the partner list comes from

Partner names + logo filenames are defined in:

- `src/data/buwatv/partners.json`
  - `hostPartners`: host partners (logos should live in `hosts/`)
  - `communityPartners`: non-host partners (logos should live in `non-hosts/`)

Pages render logos dynamically from this data (no manual duplication in markup).

## Adding / updating a logo

1. Drop the file into the correct folder:
   - Host → `public/buwatv/uploads/partners/hosts/`
   - Non-host → `public/buwatv/uploads/partners/non-hosts/`
2. Add/update the entry in `src/data/buwatv/partners.json` so `logo` matches the filename exactly.

## Recommended Logo Specs

- Format: PNG or WebP (transparent background preferred)
- Max height: ~200px (will be scaled down to 70px)
- Max width: ~400px (will be scaled down to 150px)
