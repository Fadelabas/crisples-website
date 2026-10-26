import { SITE_CONFIG, formatPrice, whatsappUrl } from './config.js';
import { PRODUCTS, getProduct } from './products.js';
import {
  addToCart,
  clearCart,
  getCart,
  getCartCount,
  removeFromCart,
  subscribe,
  updateQuantity,
} from './store.js';

const icon = (name) => {
  const icons = {
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.8 8h10.4l1.1 12H5.7L6.8 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="fill"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z"/><path d="M8.7 8.2c.3-.7.7-.7 1-.7l.5.1c.2 0 .3.1.4.4l.7 1.6c.1.3 0 .5-.1.7l-.5.6c-.2.2-.3.4-.1.7.5 1 1.3 1.8 2.3 2.3.3.2.5.1.7-.1l.8-1c.2-.2.4-.3.7-.2l1.6.8c.3.1.5.2.5.4.1.2.1 1-.3 1.8-.4.8-1.5 1.5-2.5 1.5-.8 0-2.4-.4-4.1-1.8-2-1.6-3.2-4-3.3-4.2-.1-.2-.8-1.1-.8-2.1s.5-1.5.7-1.8Z"/></svg>',
  };
  return icons[name] || '';
};

const pageName = document.body.dataset.page || 'home';
const navHref = pageName === 'product' ? 'shop.html' : `${pageName === 'home' ? 'index' : pageName}.html`;

function headerTemplate() {
  return `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="announcement"><p>${SITE_CONFIG.announcement}</p></div>
    <header class="site-header" data-header>
      <div class="nav-shell container">
        <button class="icon-button mobile-menu-toggle" type="button" data-menu-open aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">${icon('menu')}</button>
        <a class="brand" href="index.html" aria-label="Crisples home"><img src="assets/images/crisples-logo.png" alt="Crisples" width="545" height="232"></a>
        <nav class="desktop-nav" aria-label="Primary navigation">
          ${SITE_CONFIG.navigation.map((item) => `<a href="${item.href}" ${item.href === navHref ? 'aria-current="page"' : ''}>${item.label}</a>`).join('')}
        </nav>
        <div class="nav-actions">
          <a class="button button-small button-whatsapp desktop-whatsapp" href="${whatsappUrl('Hello Crisples 👋 I would like to ask about ordering.')}" target="_blank" rel="noreferrer">${icon('whatsapp')}<span>Order on WhatsApp</span></a>
          <button class="cart-button" type="button" data-cart-open aria-label="Open cart">
            ${icon('bag')}<span class="cart-count" data-cart-count>0</span>
          </button>
        </div>
      </div>
    </header>
    <div class="mobile-menu" id="mobile-menu" data-mobile-menu aria-hidden="true">
      <div class="mobile-menu-top">
        <img src="assets/images/crisples-logo.png" alt="Crisples" width="545" height="232">
        <button class="icon-button" type="button" data-menu-close aria-label="Close menu">${icon('close')}</button>
      </div>
      <nav aria-label="Mobile navigation">
        ${SITE_CONFIG.navigation.map((item, index) => `<a href="${item.href}" style="--menu-index:${index}">${item.label}<span>${icon('arrow')}</span></a>`).join('')}
      </nav>
      <a class="button button-whatsapp button-block" href="${whatsappUrl('Hello Crisples 👋 I would like to ask about ordering.')}" target="_blank" rel="noreferrer">${icon('whatsapp')} Order on WhatsApp</a>
      <p class="mobile-menu-note">Just apples. Just crunch.</p>
    </div>
    <div class="menu-scrim" data-menu-scrim></div>
  `;
}

function footerTemplate() {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <img src="assets/images/crisples-logo.png" alt="Crisples" width="545" height="232">
          <p>Just apples. Just crunch.</p>
        </div>
        <div class="footer-links">
          <p class="footer-label">Explore</p>
          ${SITE_CONFIG.navigation.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}
        </div>
        <div class="footer-links">
          <p class="footer-label">Stay close</p>
          <a href="${SITE_CONFIG.instagramUrl}" target="_blank" rel="noreferrer">${SITE_CONFIG.instagramHandle}</a>
          <a href="${whatsappUrl('Hello Crisples 👋')}" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
        <div class="footer-cta">
          <p class="eyebrow">Ready for a crunch?</p>
          <a class="text-link" href="shop.html">Shop Crisples ${icon('arrow')}</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>© ${new Date().getFullYear()} Crisples. All rights reserved.</p>
        <p>Premium dried apple crisps.</p>
      </div>
    </footer>
  `;
}

function cartLayerTemplate() {
  return `
    <div class="drawer-scrim" data-cart-scrim></div>
    <aside class="cart-drawer" data-cart-drawer aria-hidden="true" aria-label="Shopping cart">
      <div class="drawer-header">
        <div><p class="eyebrow">Your selection</p><h2>Cart <span data-drawer-count>(0)</span></h2></div>
        <button class="icon-button" type="button" data-cart-close aria-label="Close cart">${icon('close')}</button>
      </div>
      <div class="drawer-body" data-cart-items></div>
      <div class="drawer-footer" data-cart-footer></div>
    </aside>
    <dialog class="checkout-modal" data-checkout-modal>
      <div class="checkout-panel">
        <div class="checkout-heading">
          <div><p class="eyebrow">Almost there</p><h2>Complete your order</h2><p>We’ll prepare the order message for WhatsApp.</p></div>
          <button class="icon-button" type="button" data-checkout-close aria-label="Close checkout">${icon('close')}</button>
        </div>
        <form class="checkout-form" data-checkout-form>
          <div class="checkout-fields">
            <label><span>Full Name</span><input name="name" autocomplete="name" required placeholder="Your full name"></label>
            <label><span>Phone</span><input name="phone" type="tel" autocomplete="tel" required placeholder="Your phone number"></label>
            <label><span>Area</span><input name="area" autocomplete="address-level2" required placeholder="Your area"></label>
            <label class="field-wide"><span>Address</span><input name="address" autocomplete="street-address" required placeholder="Delivery address"></label>
            <label class="field-wide"><span>Order Notes <small>Optional</small></span><textarea name="notes" rows="3" placeholder="Anything we should know?"></textarea></label>
          </div>
          <div class="checkout-summary" data-checkout-summary></div>
          <button class="button button-primary button-block button-tall" type="submit">${icon('whatsapp')} Complete Order on WhatsApp</button>
          <p class="checkout-note">No delivery charge is added here. Crisples can confirm delivery details directly.</p>
        </form>
      </div>
    </dialog>
    <div class="toast" data-toast role="status" aria-live="polite"></div>
  `;
}

function cartRows() {
  return getCart().map((item) => {
    const product = getProduct(item.id);
    return `
      <article class="cart-line" data-cart-line="${product.id}">
        <a href="product.html?id=${product.id}" class="cart-line-image"><img src="${product.cardImage}" alt="${product.name}" width="1600" height="1600"></a>
        <div class="cart-line-info">
          <a href="product.html?id=${product.id}" class="cart-line-title">${product.name}</a>
          <p>${formatPrice(product.price)}</p>
          <div class="cart-line-controls">
            <div class="quantity-control quantity-small" aria-label="Quantity for ${product.name}">
              <button type="button" data-cart-decrease="${product.id}" aria-label="Decrease quantity">${icon('minus')}</button>
              <span>${item.quantity}</span>
              <button type="button" data-cart-increase="${product.id}" aria-label="Increase quantity">${icon('plus')}</button>
            </div>
            <button class="remove-link" type="button" data-cart-remove="${product.id}">Remove</button>
          </div>
        </div>
      </article>`;
  }).join('');
}

function cartTotals() {
  const lines = getCart().map((item) => ({ ...item, product: getProduct(item.id) }));
  const allPriced = lines.length > 0 && lines.every(({ product }) => Number.isFinite(product.price));
  const subtotal = allPriced ? lines.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0) : null;
  return { lines, subtotal };
}

function renderCart() {
  const cart = getCart();
  document.querySelectorAll('[data-cart-count]').forEach((node) => node.textContent = getCartCount());
  const drawerCount = document.querySelector('[data-drawer-count]');
  if (drawerCount) drawerCount.textContent = `(${getCartCount()})`;
  const body = document.querySelector('[data-cart-items]');
  const footer = document.querySelector('[data-cart-footer]');
  if (!body || !footer) return;
  if (!cart.length) {
    body.innerHTML = `<div class="empty-cart"><div class="empty-cart-icon">${icon('bag')}</div><h3>Your cart is ready for a crunch.</h3><p>Add Crisples and it will appear here.</p><a href="shop.html" class="button button-primary">Shop Crisples</a></div>`;
    footer.innerHTML = '';
  } else {
    body.innerHTML = cartRows();
    const { subtotal } = cartTotals();
    footer.innerHTML = `
      <div class="subtotal-row"><span>Subtotal</span><strong>${subtotal === null ? 'Confirmed on WhatsApp' : formatPrice(subtotal)}</strong></div>
      <p>Delivery details are confirmed directly with Crisples.</p>
      <button class="button button-primary button-block button-tall" type="button" data-checkout-open>Checkout</button>
      <a class="button button-ghost button-block" href="cart.html">View full cart</a>`;
  }
  renderCheckoutSummary();
  window.dispatchEvent(new CustomEvent('crisples:cart-updated', { detail: getCart() }));
}

function renderCheckoutSummary() {
  const summary = document.querySelector('[data-checkout-summary]');
  if (!summary) return;
  const { lines, subtotal } = cartTotals();
  summary.innerHTML = `
    <p class="checkout-summary-title">Order summary</p>
    ${lines.map(({ product, quantity }) => `<div class="checkout-summary-line"><span>${product.shortName} × ${quantity}</span><span>${product.price === null ? 'To confirm' : formatPrice(product.price * quantity)}</span></div>`).join('')}
    <div class="checkout-total"><span>Total</span><strong>${subtotal === null ? 'Confirmed on WhatsApp' : formatPrice(subtotal)}</strong></div>`;
}

export function buildOrderMessage(customer) {
  const { lines, subtotal } = cartTotals();
  const orderLines = lines.map(({ product, quantity }) => `• ${product.name} × ${quantity}${product.price === null ? '' : ` — ${formatPrice(product.price * quantity)}`}`);
  return [
    'Hello Crisples 👋', '', 'I would like to place an order:', '', 'Order:', ...orderLines,
    '', `Subtotal: ${subtotal === null ? 'Please confirm price' : formatPrice(subtotal)}`,
    '', 'Customer:', `Name: ${customer.name}`, `Phone: ${customer.phone}`, `Area: ${customer.area}`, `Address: ${customer.address}`,
    '', `Notes: ${customer.notes || '—'}`,
  ].join('\n');
}

export function showToast(message) {
  const toast = document.querySelector('[data-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

export function openCart() {
  document.querySelector('[data-cart-drawer]')?.setAttribute('aria-hidden', 'false');
  document.querySelector('[data-cart-drawer]')?.classList.add('is-open');
  document.querySelector('[data-cart-scrim]')?.classList.add('is-open');
  document.body.classList.add('no-scroll');
}

export function closeCart() {
  document.querySelector('[data-cart-drawer]')?.setAttribute('aria-hidden', 'true');
  document.querySelector('[data-cart-drawer]')?.classList.remove('is-open');
  document.querySelector('[data-cart-scrim]')?.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
}

export function openCheckout() {
  if (!getCart().length) return;
  closeCart();
  renderCheckoutSummary();
  const modal = document.querySelector('[data-checkout-modal]');
  if (modal && !modal.open) modal.showModal();
}

function closeCheckout() {
  document.querySelector('[data-checkout-modal]')?.close();
}

function openMenu() {
  const menu = document.querySelector('[data-mobile-menu]');
  menu?.classList.add('is-open'); menu?.setAttribute('aria-hidden', 'false');
  document.querySelector('[data-menu-scrim]')?.classList.add('is-open');
  document.querySelector('[data-menu-open]')?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
}

function closeMenu() {
  const menu = document.querySelector('[data-mobile-menu]');
  menu?.classList.remove('is-open'); menu?.setAttribute('aria-hidden', 'true');
  document.querySelector('[data-menu-scrim]')?.classList.remove('is-open');
  document.querySelector('[data-menu-open]')?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}

function bindGlobalEvents() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, a');
    if (!target) return;
    if (target.matches('[data-menu-open]')) openMenu();
    if (target.matches('[data-menu-close], [data-menu-scrim]')) closeMenu();
    if (target.matches('[data-cart-open]')) openCart();
    if (target.matches('[data-cart-close], [data-cart-scrim]')) closeCart();
    if (target.matches('[data-checkout-open]')) openCheckout();
    if (target.matches('[data-checkout-close]')) closeCheckout();
    if (target.matches('[data-add]')) {
      const id = target.dataset.add;
      const selector = target.dataset.quantityTarget;
      const amount = selector ? document.querySelector(selector)?.value : target.dataset.quantity;
      addToCart(id, amount || 1);
      showToast('Crisples added to your cart.');
      if (target.dataset.openCart === 'true') openCart();
    }
    if (target.matches('[data-cart-increase]')) updateQuantity(target.dataset.cartIncrease, (getCart().find((item) => item.id === target.dataset.cartIncrease)?.quantity || 0) + 1);
    if (target.matches('[data-cart-decrease]')) updateQuantity(target.dataset.cartDecrease, (getCart().find((item) => item.id === target.dataset.cartDecrease)?.quantity || 0) - 1);
    if (target.matches('[data-cart-remove]')) removeFromCart(target.dataset.cartRemove);
    if (target.matches('[data-cart-clear]')) clearCart();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeCart(); closeMenu(); }
  });

  document.querySelector('[data-checkout-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(form.entries());
    window.open(whatsappUrl(buildOrderMessage(customer)), '_blank', 'noopener,noreferrer');
  });

  const modal = document.querySelector('[data-checkout-modal]');
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeCheckout();
  });
}

export function productCard(product = PRODUCTS[0], extraClass = '') {
  return `
    <article class="product-card ${extraClass}">
      <a class="product-card-media" href="product.html?id=${product.id}">
        <img src="${product.cardImage}" alt="${product.name} package with dried apple crisps" width="1600" height="1600" loading="lazy">
        <span class="product-card-badge">100% Apples</span>
      </a>
      <div class="product-card-body">
        <div><p class="eyebrow">${product.eyebrow}</p><h3><a href="product.html?id=${product.id}">${product.name}</a></h3></div>
        <p class="product-card-price">${formatPrice(product.price)}</p>
        <p>${product.description}</p>
        <div class="product-card-actions">
          <button class="button button-primary" type="button" data-add="${product.id}" data-open-cart="true">Add to Cart</button>
          <a class="round-link" href="product.html?id=${product.id}" aria-label="View ${product.name}">${icon('arrow')}</a>
        </div>
      </div>
    </article>`;
}

export function initShell() {
  document.querySelector('[data-site-header]').innerHTML = headerTemplate();
  document.querySelector('[data-site-footer]').innerHTML = footerTemplate();
  document.querySelector('[data-site-layers]').innerHTML = cartLayerTemplate();
  bindGlobalEvents();
  subscribe(renderCart);
  renderCart();

  const header = document.querySelector('[data-header]');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
}

export { icon, renderCart };
