# Atlas Massage Therapy website

The website for [Atlas Massage Therapy](https://kidjlee.github.io/Atlas-Website/), a registered massage therapy clinic in Abbotsford, BC. Appointments are booked through the clinic's existing [JaneApp page](https://atlasabbotsford.janeapp.com/).

Built with [Astro](https://astro.build) and Tailwind CSS. It's a static site: no server, database, or accounts.

## Updating clinic details

Almost everything you'd want to change lives in **`src/data/site.ts`**:

- Phone number, email, and address
- Business hours
- JaneApp booking links (the main page and each therapist's page)
- Therapist names, titles, and bios
- Treatments and prices

Change the file, push to `main`, and the site redeploys automatically in about a minute.

### Photos

| What | Where |
| --- | --- |
| Therapist headshots | `src/assets/team/<therapist-slug>.jpg` (the slug matches `photo` in `site.ts`) |
| Home page photos | `src/assets/photos/` (free Unsplash images; swap in real clinic photos anytime by keeping the same file names) |
| Storefront sign | `src/assets/storefront-sign.jpg` |

### Logo

The logo is rebuilt as a vector from the storefront sign. To regenerate it, along with the favicon and social sharing image:

```sh
node scripts/build-logo.mjs
node scripts/build-og.mjs
```

If you get the original logo file, replace `src/assets/logo/logo.svg` (the site version) and `public/logo.svg`.

## Working locally

```sh
npm install
npm run dev       # http://localhost:4321/Atlas-Website/
npm run build     # production build in dist/
npm run preview   # preview the production build
```

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages using `.github/workflows/deploy.yml`.

Live preview: https://kidjlee.github.io/Atlas-Website/

## Connecting the clinic's domain

1. **DNS.** At the domain registrar, add:
   - Four `A` records for the root domain (`@`), pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`
   - A `CNAME` record for `www` pointing to `kidjlee.github.io`
2. **CNAME file.** Create `public/CNAME` containing only the domain, for example `atlasmassagetherapy.ca`.
3. **Site URL.** In `.github/workflows/deploy.yml`, uncomment the `env:` block and set `SITE_URL` to `https://your-domain` and `BASE_PATH` to `/`.
4. **GitHub settings.** Push the changes. Then, in the repo's **Settings → Pages**, enter the domain under **Custom domain**. Tick **Enforce HTTPS** once the certificate is ready, which can take up to an hour.
