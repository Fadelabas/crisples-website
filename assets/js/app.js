import { SITE_CONFIG, formatPrice, whatsappUrl } from './config.js';
import { PRODUCTS, getProduct } from './products.js';
import { getCart, getCartCount, updateQuantity, removeFromCart } from './store.js';
import { buildOrderMessage, icon, initShell, openCheckout, productCard, showToast } from './site-shell.js';

initShell();
document.querySelectorAll('[data-whatsapp-contact]').forEach((link) => {
  link.href = whatsappUrl('Hello Crisples 👋 I would like to get in touch.');
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initReveal() {
  const items = [...document.querySelectorAll('.reveal')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });
  items.forEach((item) => observer.observe(item));
}

function initParallax() {
  if (reduceMotion) return;
  const nodes = [...document.querySelectorAll('[data-parallax]')];
  if (!nodes.length) return;
  let ticking = false;
  const update = () => {
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.025;
        node.style.setProperty('--parallax-y', `${offset}px`);
      }
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

function initQuantityControls() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-qty-minus], [data-qty-plus]');
    if (!button) return;
    const wrapper = button.closest('[data-quantity]');
    const input = wrapper?.querySelector('input');
    if (!input) return;
    const next = Math.max(1, (Number.parseInt(input.value, 10) || 1) + (button.hasAttribute('data-qty-plus') ? 1 : -1));
    input.value = next;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.72, behavior: 'smooth' }));
    carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.72, behavior: 'smooth' }));
  });
}

function initShopPage() {
  const target = document.querySelector('[data-product-list]');
  if (target) target.innerHTML = PRODUCTS.map((product) => productCard(product, 'product-card-wide')).join('');
}

function initProductPage() {
  const root = document.querySelector('[data-product-detail]');
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const product = getProduct(params.get('id'));
  document.title = `${product.name} | Crisples`;
  root.innerHTML = `
    <div class="product-gallery reveal">
      <div class="product-gallery-main">
        <img src="${product.images[0]}" alt="${product.name}" width="1600" height="1600" data-gallery-main>
        <span class="product-card-badge">100% Apples</span>
      </div>
      <div class="product-thumbs" aria-label="Product images">
        ${product.images.map((image, index) => `<button type="button" class="${index === 0 ? 'is-active' : ''}" data-gallery-thumb="${image}" aria-label="View product image ${index + 1}"><img src="${image}" alt="" width="1600" height="1600"></button>`).join('')}
      </div>
    </div>
    <div class="product-info reveal">
      <p class="eyebrow">${product.eyebrow}</p>
      <h1>${product.name}</h1>
      <p class="product-price">${formatPrice(product.price)}</p>
      <p class="product-lead">${product.detail}</p>
      <ul class="product-benefits-list">${product.benefits.map((benefit) => `<li><span>✓</span>${benefit}</li>`).join('')}</ul>
      <div class="product-buy-row">
        <div class="quantity-control" data-quantity>
          <button type="button" data-qty-minus aria-label="Decrease quantity">${icon('minus')}</button>
          <input id="product-quantity" type="number" min="1" value="1" inputmode="numeric" aria-label="Quantity">
          <button type="button" data-qty-plus aria-label="Increase quantity">${icon('plus')}</button>
        </div>
        <button class="button button-primary button-grow button-tall" type="button" data-add="${product.id}" data-quantity-target="#product-quantity" data-open-cart="true">Add to Cart</button>
      </div>
      <button class="button button-whatsapp button-block button-tall" type="button" data-product-whatsapp>${icon('whatsapp')} Order on WhatsApp</button>
      <p class="micro-copy">Price and delivery details are confirmed directly with Crisples.</p>
      <div class="product-detail-note"><span>Perfect with</span><p>${product.pairings.join(' · ')}</p></div>
    </div>`;

  root.addEventListener('click', (event) => {
    const thumb = event.target.closest('[data-gallery-thumb]');
    if (thumb) {
      root.querySelector('[data-gallery-main]').src = thumb.dataset.galleryThumb;
      root.querySelectorAll('[data-gallery-thumb]').forEach((node) => node.classList.toggle('is-active', node === thumb));
    }
    if (event.target.closest('[data-product-whatsapp]')) {
      const quantity = Number.parseInt(root.querySelector('#product-quantity').value, 10) || 1;
      const message = `Hello Crisples 👋\n\nI would like to order:\n• ${product.name} × ${quantity}\n\nPlease confirm the price and delivery details.`;
      window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
    }
  });
}

function fullCartMarkup() {
  const cart = getCart();
  if (!cart.length) return `<div class="cart-page-empty reveal"><div>${icon('bag')}</div><h2>Your cart is feeling light.</h2><p>Add a little apple crunch to get started.</p><a href="shop.html" class="button button-primary">Shop Crisples</a></div>`;
  const rows = cart.map((item) => {
    const product = getProduct(item.id);
    return `<article class="cart-page-line">
      <a href="product.html?id=${product.id}" class="cart-page-image"><img src="${product.cardImage}" alt="${product.name}" width="1600" height="1600"></a>
      <div class="cart-page-copy"><p class="eyebrow">Dried apple snack</p><h3><a href="product.html?id=${product.id}">${product.name}</a></h3><p>${formatPrice(product.price)}</p></div>
      <div class="quantity-control" aria-label="Quantity for ${product.name}">
        <button type="button" data-page-decrease="${product.id}" aria-label="Decrease quantity">${icon('minus')}</button><span>${item.quantity}</span><button type="button" data-page-increase="${product.id}" aria-label="Increase quantity">${icon('plus')}</button>
      </div>
      <button class="remove-link" type="button" data-page-remove="${product.id}">Remove</button>
    </article>`;
  }).join('');
  return `<div class="cart-page-layout"><div class="cart-page-lines">${rows}</div><aside class="cart-page-summary"><p class="eyebrow">Order summary</p><h2>${getCartCount()} ${getCartCount() === 1 ? 'item' : 'items'}</h2><div class="summary-row"><span>Subtotal</span><strong>Confirmed on WhatsApp</strong></div><p>No delivery charge is added online. Crisples will confirm pricing and delivery directly.</p><button class="button button-primary button-block button-tall" type="button" data-page-checkout>Continue to Checkout</button><a class="text-link" href="shop.html">Continue shopping ${icon('arrow')}</a></aside></div>`;
}

function initCartPage() {
  const root = document.querySelector('[data-full-cart]');
  if (!root) return;
  const render = () => { root.innerHTML = fullCartMarkup(); initReveal(); };
  render();
  window.addEventListener('crisples:cart-updated', render);
  root.addEventListener('click', (event) => {
    const increase = event.target.closest('[data-page-increase]');
    const decrease = event.target.closest('[data-page-decrease]');
    const remove = event.target.closest('[data-page-remove]');
    if (increase) updateQuantity(increase.dataset.pageIncrease, (getCart().find((item) => item.id === increase.dataset.pageIncrease)?.quantity || 0) + 1);
    if (decrease) updateQuantity(decrease.dataset.pageDecrease, (getCart().find((item) => item.id === decrease.dataset.pageDecrease)?.quantity || 0) - 1);
    if (remove) removeFromCart(remove.dataset.pageRemove);
    if (event.target.closest('[data-page-checkout]')) openCheckout();
  });
}

function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const message = `Hello Crisples 👋\n\nName: ${data.name}\nPhone: ${data.phone}\n\nMessage:\n${data.message}`;
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
    showToast('Your message is ready in WhatsApp.');
  });
}

function initHomeProduct() {
  const target = document.querySelector('[data-home-product]');
  if (target) target.innerHTML = productCard(PRODUCTS[0], 'product-card-featured');
}

initQuantityControls();
initShopPage();
initProductPage();
initCartPage();
initContactForm();
initHomeProduct();
initCarousels();
initReveal();
initParallax();

document.documentElement.classList.add('js-ready');
