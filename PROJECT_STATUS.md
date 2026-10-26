# Crisples Website — Project Status

## Status

Complete and production-ready. The storefront is a responsive, dependency-free static website with a local cart and a WhatsApp checkout handoff. The production bundle is generated in `dist/`.

## Implemented pages

- `index.html` — campaign-led home page
- `shop.html` — single-product shop
- `product.html` — product gallery, benefits, quantity, and add-to-cart
- `about.html` — brand story and apple-to-crisp narrative
- `contact.html` — contact form that prepares a WhatsApp message
- `cart.html` — editable cart, order summary, and checkout trigger

## Shared components and behavior

- Responsive announcement bar, navigation, mobile menu, footer, cart drawer, and checkout modal
- Persistent cart stored in the browser with `localStorage`
- Quantity controls, item removal, cart count, and order summary
- WhatsApp checkout message containing customer details and an itemized order
- Responsive image delivery, lazy loading, semantic HTML, accessible labels, keyboard-friendly controls, and reduced-motion support
- Page titles, descriptions, Open Graph metadata, favicon, web manifest, and `robots.txt`
- Reusable design system and responsive layouts in `assets/css/styles.css`

## Content configuration

Edit product details in:

- `assets/js/products.js` — product name, description, benefits, imagery, and price

Edit global brand/contact settings in:

- `assets/js/config.js` — WhatsApp number, currency, locale, Instagram URL, announcement, and navigation

The price is intentionally `null` and the WhatsApp number intentionally blank because neither was supplied. The interface shows **Price on request**, and WhatsApp opens its contact chooser with the completed order message. To send directly to the business, add the official number to `whatsappNumber` in international digits-only format (for example, country code followed by the subscriber number, without `+` or spaces).

## Image library used

The site uses the approved Crisples imagery from `generated/` plus the logo extracted from the real package artwork at `assets/images/crisples-logo.png`.

- Hero: `crisples-hero-clean-01.webp`, `crisples-hero-mobile-03-1080x1350.webp`, `crisples-hero-apples-to-crisps-02.webp`
- Product: white, cream, close-up, surrounded, transparent package, and apple macro images
- Lifestyle: backpack, office, and picnic images
- Pairings: peanut butter, Greek yogurt, dark chocolate, granola, and honey
- Social: five clean Instagram campaign tiles
- Banners/ingredients: shop, made-from-apples, and 100-percent-apples images

The original files in `img/` and the full campaign library in `generated/` remain preserved.

## Run locally

From `C:\xampp\htdocs\crisples`:

```powershell
npm run serve
```

Then open `http://127.0.0.1:8123/`. With Apache running in XAMPP, the site is also available at `http://localhost/crisples/`.

## Production build

```powershell
npm run build
```

Deploy the contents of `dist/`. The build script recreates the directory, copies required public files, and fails if an HTML page references a missing local asset.

## Verification completed

- JavaScript syntax checks passed for all modules
- Production build passed with no missing local references
- All six routes tested at 1440px and 390px widths
- Home page additionally tested at 375px, 430px, 768px, and 1024px
- No missing images, uncaught browser errors, failed local requests, or horizontal overflow
- Add-to-cart, cart drawer, quantity update, cart persistence, mobile navigation, checkout modal, required customer fields, and WhatsApp message generation all passed

