# BuWa Digital — Development Workflow

## Branch Strategy

| Branch | Environment | Purpose |
|--------|-------------|----------|
| `dev` | Vercel Preview URL | Development & UAT testing |
| `main` | buwadigital.com | Production |

## Workflow

1. All changes are made on the `dev` branch
2. Vercel auto-deploys a preview URL for testing
3. Once approved, `dev` is merged into `main`
4. Production deploys automatically via Vercel

## Notes
- Never push untested changes directly to `main`
- Each feature/fix should be committed to `dev` first
