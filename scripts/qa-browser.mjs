import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const qaDir = path.join(root, '.visual-qa');
const profileDir = path.join(qaDir, 'chrome-profile');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9227;
const base = 'http://127.0.0.1:8123';

await mkdir(qaDir, { recursive: true });
await rm(profileDir, { recursive: true, force: true });

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true });

async function waitForDebugger() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0; this.pending = new Map(); this.waiters = new Map(); this.events = [];
  }
  async open() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id); this.pending.delete(data.id);
        data.error ? reject(new Error(data.error.message)) : resolve(data.result);
      } else if (data.method) {
        this.events.push(data);
        const waiters = this.waiters.get(data.method) || [];
        this.waiters.delete(data.method); waiters.forEach((resolve) => resolve(data.params));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  wait(method, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeout);
      const done = (value) => { clearTimeout(timer); resolve(value); };
      this.waiters.set(method, [...(this.waiters.get(method) || []), done]);
    });
  }
  async eval(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
    return result.result.value;
  }
  close() { this.ws.close(); }
}

let cdp;
const results = [];
try {
  await waitForDebugger();
  const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(base + '/index.html')}`, { method: 'PUT' }).then((r) => r.json());
  cdp = new CDP(target.webSocketDebuggerUrl); await cdp.open();
  await Promise.all(['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable'].map((method) => cdp.send(method)));

  async function viewport(width, height) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  }

  async function navigate(route) {
    cdp.events = [];
    const loaded = cdp.wait('Page.loadEventFired');
    await cdp.send('Page.navigate', { url: `${base}/${route}` });
    await loaded;
    await cdp.eval(`(() => {
      document.querySelectorAll('img[loading="lazy"]').forEach(img => img.loading = 'eager');
      return Promise.all([...document.images].map(img => img.complete ? true : new Promise(r => { img.addEventListener('load',r,{once:true}); img.addEventListener('error',r,{once:true}); }))).then(() => document.fonts?.ready);
    })()`);
  }

  async function audit(route, width, height) {
    await viewport(width, height); await navigate(route);
    const info = await cdp.eval(`(async () => ({
      title: document.title,
      h1: document.querySelector('h1')?.textContent.trim() || '',
      brokenImages: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src),
      brokenLinks: (await Promise.all([...new Set([...document.querySelectorAll('a[href]')]
        .map(link => new URL(link.href, location.href))
        .filter(url => url.origin === location.origin)
        .map(async url => {
          try { const response = await fetch(url.href, { method: 'HEAD' }); return response.ok ? null : url.href; }
          catch { return url.href; }
        }))])).filter(Boolean),
      overflow: document.documentElement.scrollWidth - innerWidth,
      header: Boolean(document.querySelector('.site-header')),
      footer: Boolean(document.querySelector('.site-footer')),
      main: Boolean(document.querySelector('main'))
    }))()`);
    const problems = cdp.events.filter((event) =>
      event.method === 'Runtime.exceptionThrown' ||
      (event.method === 'Log.entryAdded' && ['error', 'warning'].includes(event.params.entry.level)) ||
      (event.method === 'Network.responseReceived' && event.params.response.status >= 400)
    ).map((event) => ({ method: event.method, params: event.params }));
    results.push({ route, width, ...info, problems: problems.length });
    if (info.brokenImages.length || info.brokenLinks.length || info.overflow > 1 || problems.length || !info.header || !info.footer || !info.main) {
      throw new Error(`Audit failed ${route} @ ${width}px: ${JSON.stringify({ info, problems }, null, 2)}`);
    }
  }

  async function screenshot(name, width, height) {
    await viewport(width, height);
    await cdp.eval(`document.querySelectorAll('.reveal').forEach(node => node.classList.add('is-visible'))`);
    const metrics = await cdp.send('Page.getLayoutMetrics');
    const fullHeight = Math.min(Math.ceil(metrics.cssContentSize.height), 9000);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, fromSurface: true, clip: { x: 0, y: 0, width, height: fullHeight, scale: 1 } });
    await writeFile(path.join(qaDir, `${name}.png`), Buffer.from(shot.data, 'base64'));
  }

  async function screenshotViewport(name, width, height) {
    await viewport(width, height);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    await writeFile(path.join(qaDir, `${name}.png`), Buffer.from(shot.data, 'base64'));
  }

  const pages = ['index.html', 'shop.html', 'product.html?id=crisples-dried-apple-crisps', 'about.html', 'contact.html', 'cart.html'];
  for (const route of pages) await audit(route, 1440, 1000);
  for (const route of pages) await audit(route, 390, 844);
  for (const width of [375, 430, 768, 1024]) await audit('index.html', width, width < 600 ? 844 : 900);

  await viewport(1440, 1000); await navigate('index.html'); await screenshotViewport('home-1440-viewport', 1440, 1000); await screenshot('home-1440', 1440, 1000);
  await navigate('shop.html'); await screenshot('shop-1440', 1440, 1000);
  await navigate('product.html?id=crisples-dried-apple-crisps'); await screenshot('product-1440', 1440, 1000);
  await viewport(390, 844); await navigate('index.html'); await screenshotViewport('home-390-viewport', 390, 844); await screenshot('home-390', 390, 844);
  await navigate('product.html?id=crisples-dried-apple-crisps'); await screenshotViewport('product-390-viewport', 390, 844); await screenshot('product-390', 390, 844);

  await viewport(1440, 1000); await navigate('index.html');
  const interaction = await cdp.eval(`(async () => {
    document.querySelector('[data-add]').click();
    const added = JSON.parse(localStorage.getItem('crisples-cart-v1') || '[]');
    const drawerOpen = document.querySelector('[data-cart-drawer]').classList.contains('is-open');
    document.querySelector('[data-cart-increase]').click();
    const increased = JSON.parse(localStorage.getItem('crisples-cart-v1') || '[]');
    document.querySelector('[data-checkout-open]').click();
    const modalOpen = document.querySelector('[data-checkout-modal]').open;
    const fields = ['name','phone','area','address','notes'].map(name => Boolean(document.querySelector('[data-checkout-form] [name="' + name + '"]')));
    window.__openedUrl = '';
    window.open = (url) => { window.__openedUrl = url; return null; };
    const values = {name:'QA Customer',phone:'000000',area:'Test Area',address:'Test Address',notes:'QA only'};
    Object.entries(values).forEach(([name,value]) => document.querySelector('[data-checkout-form] [name="' + name + '"]').value = value);
    document.querySelector('[data-checkout-form]').requestSubmit();
    return { added, drawerOpen, increased, modalOpen, fields, openedUrl: window.__openedUrl };
  })()`);
  if (interaction.added?.[0]?.quantity !== 1 || !interaction.drawerOpen || interaction.increased?.[0]?.quantity !== 2 || !interaction.modalOpen || interaction.fields.some((field) => !field) || !decodeURIComponent(interaction.openedUrl).includes('QA Customer')) {
    throw new Error(`Interaction test failed: ${JSON.stringify(interaction, null, 2)}`);
  }
  results.push({ interaction: 'cart + checkout + WhatsApp payload', passed: true });

  await navigate('index.html');
  const persistence = await cdp.eval(`JSON.parse(localStorage.getItem('crisples-cart-v1') || '[]')`);
  if (persistence?.[0]?.quantity !== 2) throw new Error('Cart did not persist after navigation');
  results.push({ interaction: 'cart persistence', passed: true });
  await cdp.eval(`localStorage.removeItem('crisples-cart-v1')`);

  await viewport(390, 844); await navigate('index.html');
  const mobileMenu = await cdp.eval(`(() => { document.querySelector('[data-menu-open]').click(); const opened=document.querySelector('[data-mobile-menu]').classList.contains('is-open'); document.querySelector('[data-menu-close]').click(); return {opened, closed:!document.querySelector('[data-mobile-menu]').classList.contains('is-open')}; })()`);
  if (!mobileMenu.opened || !mobileMenu.closed) throw new Error('Mobile menu interaction failed');
  results.push({ interaction: 'mobile menu open/close', passed: true });

  console.log(JSON.stringify({ passed: true, results }, null, 2));
} finally {
  cdp?.close();
  chrome.kill();
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}
