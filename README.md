# Crisples Website

A premium, responsive storefront for Crisples dried apple crisps. The site combines campaign-led product storytelling with a lightweight shopping cart and a WhatsApp checkout handoff.

## Main features

- Responsive Home, Shop, Product, About, Contact, and Cart pages
- Persistent browser cart powered by `localStorage`
- Quantity controls, cart drawer, order summary, and item removal
- Customer-details checkout modal with a generated WhatsApp order message
- Responsive campaign imagery, lazy loading, and accessible semantic markup
- SEO metadata, Open Graph tags, web manifest, and production security headers
- Dependency-free frontend and optimized static production bundle

## Technologies

- HTML5
- Modern CSS
- Vanilla JavaScript ES modules
- Node.js production build script
- GitHub Pages and GitHub Actions

## Local installation

Requirements: Node.js 18+ and PHP for the included local server command.

```bash
git clone <repository-url>
cd crisples-website
npm run serve
```

Open `http://127.0.0.1:8123/`.

No npm dependencies are required for the website or build.

## Production build

```bash
npm run build
```

The deployable site is generated in `dist/`. The build validates local page references and copies only campaign images actually used by the storefront.

## Project structure

```text
crisples-website/
├── assets/
│   ├── css/styles.css
│   ├── images/crisples-logo.png
│   └── js/
│       ├── app.js
│       ├── config.js
│       ├── products.js
│       ├── site-shell.js
│       └── store.js
├── generated/          # Crisples campaign image library
├── img/                # Original supplied brand references
├── scripts/
│   ├── build.mjs
│   └── qa-browser.mjs
├── index.html
├── shop.html
├── product.html
├── about.html
├── contact.html
├── cart.html
├── .github/workflows/deploy-pages.yml
└── package.json
```

## Configuration

### WhatsApp checkout

Set the official international WhatsApp number in `assets/js/config.js`:

```js
whatsappNumber: '961XXXXXXXX'
```

Use digits only, including the country code. When it is blank, checkout opens WhatsApp's contact chooser with the completed order message.

### Product and pricing data

Edit `assets/js/products.js` to update product copy, images, benefits, or price. A `null` price displays **Price on request** and avoids publishing an unverified price.

## Deployment

GitHub Actions runs `npm run build` and deploys `dist/` to GitHub Pages after every push to `main`. The workflow can also be started manually from the repository's Actions tab.

To run the browser QA suite against a deployed environment, set `QA_BASE_URL` before running `node scripts/qa-browser.mjs`.
