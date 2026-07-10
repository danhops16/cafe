# Allstar Eateries website

Static site for [allstareateries.com](https://allstareateries.com), built with Vite.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in values for Clover ordering + menu sync.

## Menu sync

The menu page loads from `public/menu-data.json`, generated from Clover POS. Item photos use images uploaded in Clover when available, otherwise local fallback photos in `public/images/menu/`.

```bash
npm run sync-menu
```

`npm run build` runs sync first (skips if Clover credentials are missing).

## Automatic deploy

GitHub Actions workflow `.github/workflows/sync-menu-deploy.yml`:

- Syncs menu from Clover
- Builds the site
- Deploys to Namecheap via rsync

Triggers: every 6 hours, every push to `main`, or manual **Run workflow**.

### Required GitHub repository secrets

| Secret | Value |
|--------|--------|
| `CLOVER_MERCHANT_ID` | e.g. `BST7C3XG23T31` |
| `CLOVER_API_TOKEN` | Inventory read token from Clover |
| `VITE_CLOVER_ORDERING_URL` | Clover online ordering URL |
| `NAMECHEAP_SSH_PRIVATE_KEY` | Private SSH key for `posbphre@business184.web-hosting.com` |
| `NAMECHEAP_SSH_HOST` | `business184.web-hosting.com` |
| `NAMECHEAP_SSH_PORT` | `21098` |
| `NAMECHEAP_SSH_USER` | `posbphre` |

Manual deploy from your machine:

```bash
npm run build
rsync -avz --delete -e ssh dist/ namecheap:~/allstareateries.com/
```
