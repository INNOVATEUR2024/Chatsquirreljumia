import { categories, banners, products, flashProducts, generateProducts, universes, immoListings, taxiListings, emploiListings, restoListings, allUniverseData } from './data.js';

// ─── Universe theme config ───
const UNIVERSE_CONFIG = {
  all:      { label: 'Tout le site',      searchPlaceholder: 'Que cherchez-vous ?',              icon: 'apps',        theme: null },
  shopping: { label: 'Shopping',          searchPlaceholder: 'Chercher un produit, une marque…', icon: 'shopping_bag', theme: 'shopping' },
  immo:     { label: 'Immobilier',        searchPlaceholder: 'Chercher un bien immobilier…',      icon: 'home',        theme: 'immo' },
  taxi:     { label: 'Taxi & Transport',  searchPlaceholder: 'Chercher un chauffeur, une zone…',  icon: 'local_taxi',  theme: 'taxi' },
  emploi:   { label: 'Emploi',            searchPlaceholder: 'Chercher un emploi, une entreprise…',icon: 'work',       theme: 'emploi' },
  resto:    { label: 'Restauration',      searchPlaceholder: 'Chercher un plat ou un restaurant…', icon: 'restaurant', theme: 'resto' },
};

// ─── Universe-specific category definitions ───
const UNIVERSE_CATEGORIES = {
  immo:   [
    { id: 'i-all', name: 'Tous', icon: 'apps' },
    { id: 'i-maison', name: 'Maison/Villa', icon: 'house' },
    { id: 'i-appart', name: 'Appartement', icon: 'apartment' },
    { id: 'i-terrain', name: 'Terrain', icon: 'landscape' },
    { id: 'i-location', name: 'Location', icon: 'vpn_key' },
    { id: 'i-vente', name: 'Vente', icon: 'sell' },
  ],
  taxi:   [
    { id: 't-all', name: 'Tous', icon: 'apps' },
    { id: 't-vtc', name: 'VTC', icon: 'local_taxi' },
    { id: 't-moto', name: 'Moto Express', icon: 'two_wheeler' },
    { id: 't-premium', name: 'Premium', icon: 'star' },
    { id: 't-eco', name: 'Économique', icon: 'savings' },
  ],
  emploi: [
    { id: 'e-all', name: 'Tous', icon: 'apps' },
    { id: 'e-cdi', name: 'CDI', icon: 'work' },
    { id: 'e-cdd', name: 'CDD', icon: 'work_history' },
    { id: 'e-stage', name: 'Stage', icon: 'school' },
    { id: 'e-tech', name: 'Tech & IT', icon: 'computer' },
    { id: 'e-commerce', name: 'Commerce', icon: 'storefront' },
  ],
  resto:  [
    { id: 'r-all', name: 'Tous', icon: 'apps' },
    { id: 'r-local', name: 'Cuisine Locale', icon: 'flag' },
    { id: 'r-fast', name: 'Fast Food', icon: 'fastfood' },
    { id: 'r-pizza', name: 'Pizza', icon: 'local_pizza' },
    { id: 'r-poisson', name: 'Poisson/Mer', icon: 'set_meal' },
    { id: 'r-dessert', name: 'Desserts', icon: 'icecream' },
  ],
};

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// ─── Constants ───
const CART_KEY = 'chatsquirrel_cart_v1';
const SESSION_KEY = 'chatsquirrel_user';

// ─── Shared utilities ───
const formatPrice = price => `${price.toLocaleString('fr-FR')} FCFA`;
const buildDescription = title =>
  `Ce ${title} est soigneusement sélectionné pour répondre aux attentes du marché ivoirien. Profitez d'une qualité premium, d'une livraison rapide à Abidjan et partout en Côte d'Ivoire, et du meilleur rapport qualité-prix. Stock limité, commandez dès maintenant !`;

function debounce(fn, ms) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ─── Apply universe theme ───
function applyUniverseTheme(universe) {
  const config = UNIVERSE_CONFIG[universe] || UNIVERSE_CONFIG.all;
  // Set data attribute for CSS theming
  document.body.dataset.universe = config.theme || '';
  // Update all search placeholders
  const ph = config.searchPlaceholder;
  const inputs = ['#searchInput', '#searchOverlayInput', '#catSearchInput'];
  inputs.forEach(sel => {
    const el = $(sel);
    if (el) el.placeholder = ph;
  });
  // Animate main content for smooth transition
  const mainContents = $$('.tab-scroll-body');
  mainContents.forEach(el => {
    el.classList.remove('universe-transition');
    requestAnimationFrame(() => el.classList.add('universe-transition'));
  });
}

// ─── Session / Auth ───
function getUser() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } }
function setUser(u) { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function isLoggedIn() { return !!getUser(); }

// Mock user for demo
const MOCK_USER = { name: 'Kouassi Jean', phone: '+225 07 08 09 10', email: 'kouassi@chatsquirrel.ci' };

// ─── Cart state ───
function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); }

const state = {
  cart: loadCart(),
  products: products.slice(),
  flashProducts: flashProducts.slice(),
  searchQuery: '',
  selectedCategoryId: 0,
  catSelectedId: 1,
  catUniverseSelectedId: null,
  currentUniverse: 'all',
  searchUniverse: 'all',
  publishStep: 1,
  publishUniverse: null,
};

const allProducts = [...products, ...flashProducts];
const productById = new Map(allProducts.map(p => [p.id, p]));
// Also index universe data
const universeDataById = new Map([...immoListings, ...taxiListings, ...emploiListings, ...restoListings].map(i => [i.id, i]));

// ─── Cart operations ───
const cartTotal = () => state.cart.reduce((s, i) => s + i.price * i.qty, 0);
const cartCount = () => state.cart.reduce((s, i) => s + i.qty, 0);

function updateBadge() {
  const n = cartCount();
  $$('#cartBadge, #cartBadge2, #cartBadge3').forEach(b => {
    if (!b) return;
    b.textContent = n;
    b.classList.add('pop');
    setTimeout(() => b.classList.remove('pop'), 200);
  });
}

function addToCart(product) {
  const existing = state.cart.find(i => i.id === product.id);
  if (existing) { existing.qty++; } else { state.cart.push({ ...product, qty: 1 }); }
  saveCart();
  updateBadge();
  showToast('Produit ajouté au panier ✓');
}

function changeQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart.splice(state.cart.indexOf(item), 1);
  saveCart();
  updateBadge();
  renderCartView();
}

function removeFromCart(productId) {
  const idx = state.cart.findIndex(i => i.id === productId);
  if (idx !== -1) state.cart.splice(idx, 1);
  saveCart();
  updateBadge();
  renderCartView();
}

// ─── Product card factory ───
function createProductCard(p) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.dataset.id = p.id;
  article.innerHTML = `
    <div class="img-wrap">
      <img src="${p.image}" alt="${p.title}" loading="lazy" decoding="async">
      ${p.discount ? `<span class="discount">-${p.discount}%</span>` : ''}
    </div>
    <div class="product-info">
      <h3 class="product-title">${p.title}</h3>
      <div>
        <span class="product-price">${formatPrice(p.price)}</span>
        <span class="old-price">${formatPrice(p.oldPrice)}</span>
      </div>
      <button class="add-btn" data-id="${p.id}" aria-label="Ajouter ${p.title} au panier">AJOUTER</button>
    </div>
  `;
  return article;
}

function bindProductCards(container) {
  if (!container) return;
  container.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = productById.get(Number(btn.dataset.id));
      if (p) addToCart(p);
    });
  });
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.add-btn')) return;
      const p = productById.get(Number(card.dataset.id));
      if (p) openDetailView(p);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// DRAWER
// ═══════════════════════════════════════════════════════════════════
const universeIconMap = { all:'apps', shopping:'shopping_bag', immo:'home', taxi:'local_taxi', emploi:'work', resto:'restaurant' };

function openDrawer() {
  const overlay = $('#drawerOverlay');
  const drawer = $('#drawer');
  if (!overlay || !drawer) return;
  renderDrawer();
  overlay.classList.add('open');
  drawer.classList.add('open');
}
function closeDrawer() {
  $('#drawerOverlay')?.classList.remove('open');
  $('#drawer')?.classList.remove('open');
}
function renderDrawer() {
  const user = getUser();
  const drawerUser = $('#drawerUser');
  if (drawerUser) {
    drawerUser.textContent = user ? `Connecté : ${user.name}` : 'Invité — Connectez-vous';
  }
  const nav = $('#drawerNav');
  if (!nav) return;
  const items = Object.entries(UNIVERSE_CONFIG).map(([id, cfg]) => ({ id, label: cfg.label, icon: cfg.icon }));
  nav.innerHTML = items.map(it => `
    <div class="drawer-nav-item ${state.currentUniverse === it.id ? 'active' : ''}" data-universe="${it.id}">
      <span class="material-icons-round">${it.icon}</span>${it.label}
    </div>`).join('');
  nav.querySelectorAll('.drawer-nav-item').forEach(el => {
    el.addEventListener('click', () => {
      state.currentUniverse = el.dataset.universe;
      state.catUniverseSelectedId = null; // Reset category selection
      state.searchUniverse = el.dataset.universe;
      applyUniverseTheme(state.currentUniverse);
      closeDrawer();
      switchTab('home');
      renderUniverseHomeSections();
    });
  });
  const links = $$('#drawer .drawer-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
      switchTab(link.dataset.tab);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH OVERLAY
// ═══════════════════════════════════════════════════════════════════
function openSearchOverlay() {
  const el = $('#searchOverlay');
  if (!el) return;
  // Sync search universe to active universe
  state.searchUniverse = state.currentUniverse;
  el.classList.add('open');
  renderSearchChips();
  renderSearchResults('');
  setTimeout(() => $('#searchOverlayInput')?.focus(), 350);
}
function closeSearchOverlay() {
  $('#searchOverlay')?.classList.remove('open');
}
function renderSearchChips() {
  const container = $('#searchUniverseChips');
  if (!container) return;
  const chips = Object.entries(UNIVERSE_CONFIG).map(([id, cfg]) => ({ id, label: cfg.label, icon: cfg.icon }));
  container.innerHTML = chips.map(c => `
    <div class="universe-chip ${state.searchUniverse === c.id ? 'active' : ''}" data-id="${c.id}">
      <span class="material-icons-round">${c.icon}</span>${c.label}
    </div>`).join('');
  container.querySelectorAll('.universe-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.searchUniverse = chip.dataset.id;
      renderSearchChips();
      renderSearchResults($('#searchOverlayInput')?.value || '');
    });
  });
}
function getUniverseLabel(item) {
  if (item.universe === 'immo') return 'Immobilier';
  if (item.universe === 'taxi') return 'Taxi';
  if (item.universe === 'emploi') return 'Emploi';
  if (item.universe === 'resto') return 'Restauration';
  return 'Shopping';
}
function getItemPrice(item) {
  if (item.universe === 'immo') return formatPrice(item.price) + (item.type === 'Location' ? '/mois' : '');
  if (item.universe === 'taxi') return formatPrice(item.price) + '/km';
  if (item.universe === 'emploi') return item.salary;
  if (item.universe === 'resto') return formatPrice(item.price);
  return formatPrice(item.price);
}
function renderSearchResults(query) {
  const container = $('#searchResults');
  if (!container) return;
  const q = query.trim().toLowerCase();

  let pool = [];
  const u = state.searchUniverse;
  if (u === 'all' || u === 'shopping') pool.push(...allProducts.map(p => ({ ...p, universe: 'shopping' })));
  if (u === 'all' || u === 'immo') pool.push(...immoListings);
  if (u === 'all' || u === 'taxi') pool.push(...taxiListings);
  if (u === 'all' || u === 'emploi') pool.push(...emploiListings);
  if (u === 'all' || u === 'resto') pool.push(...restoListings);

  const results = q ? pool.filter(item => {
    const searchableText = (item.title + ' ' + (item.restaurant || '') + ' ' + (item.company || '') + ' ' + (item.vehicle || '') + ' ' + (item.location || '')).toLowerCase();
    return searchableText.includes(q);
  }) : pool.slice(0, 20);

  if (results.length === 0) {
    container.innerHTML = `<div class="search-empty"><span class="material-icons-round">search_off</span><p>Aucun résultat pour "${query}"</p></div>`;
    return;
  }

  const groups = {};
  results.forEach(item => {
    const g = item.universe || 'shopping';
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  });

  const groupLabels = { shopping: '🛍️ Shopping', immo: '🏠 Immobilier', taxi: '🚖 Taxi & Transport', emploi: '💼 Emploi', resto: '🍔 Restauration' };
  let html = '';
  for (const [groupId, items] of Object.entries(groups)) {
    html += `<div class="search-result-group-title">${groupLabels[groupId] || groupId}</div>`;
    html += items.slice(0, 5).map(item => `
      <div class="search-result-item" data-id="${item.id}" data-universe="${item.universe || 'shopping'}">
        <img class="search-result-thumb" src="${item.image}" alt="" loading="lazy" onerror="this.style.background='#eee'">
        <div class="search-result-info">
          <p class="search-result-title">${item.title}</p>
          <span class="search-result-meta">${item.location || item.restaurant || item.company || ''}</span>
        </div>
        <span class="search-result-price">${getItemPrice(item)}</span>
      </div>`).join('');
  }
  container.innerHTML = html;

  container.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      const universe = el.dataset.universe;
      closeSearchOverlay();
      if (universe === 'shopping') {
        const p = productById.get(Number(id));
        if (p) openDetailView(p);
      } else {
        const item = universeDataById.get(id);
        if (item) openUniverseDetailView(item);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// UNIVERSE DETAIL VIEW (Polymorphic)
// ═══════════════════════════════════════════════════════════════════
function openUniverseDetailView(item) {
  ensureDetailView();
  const content = $('#detailContent');
  const footer = $('#detailFooter');

  const universeBadgeClass = item.universe;
  const universeBadgeIcon = { immo: 'home', taxi: 'local_taxi', emploi: 'work', resto: 'restaurant' }[item.universe];
  const universeBadgeLabel = { immo: 'Immobilier', taxi: 'Taxi & Transport', emploi: 'Emploi', resto: 'Restauration' }[item.universe];

  let detailHtml = `
    <div class="detail-hero">
      <img src="${item.image}" alt="${item.title}" loading="eager">
      <span class="detail-discount-badge" style="background:rgba(0,0,0,0.5)">${universeBadgeLabel}</span>
    </div>
    <div class="detail-body">
      <span class="universe-detail-badge ${universeBadgeClass}">
        <span class="material-icons-round">${universeBadgeIcon}</span>${universeBadgeLabel}
      </span>
      <h1 class="detail-title">${item.title}</h1>`;

  if (item.universe === 'immo') {
    detailHtml += `
      <div class="detail-prices">
        <span class="detail-price">${formatPrice(item.price)}${item.type === 'Location' ? '/mois' : ''}</span>
        <span style="font-size:12px;font-weight:700;padding:3px 8px;border-radius:10px;background:${item.type==='Vente'?'#e8f5e9':'#e3f2fd'};color:${item.type==='Vente'?'#43a047':'#1976d2'}">${item.type}</span>
      </div>
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:16px;color:var(--text-muted);font-size:13px;">
        <span class="material-icons-round" style="font-size:16px">location_on</span>${item.location}
        ${item.rooms > 0 ? `<span style="margin-left:8px">• ${item.rooms} pièce${item.rooms > 1 ? 's' : ''}</span>` : ''}
      </div>`;
  } else if (item.universe === 'taxi') {
    detailHtml += `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <span style="font-size:22px;font-weight:900;color:var(--primary)">${formatPrice(item.price)}/km</span>
        <span style="color:#f9a825;font-weight:700;font-size:13px;">★ ${item.rating} (${item.trips} courses)</span>
      </div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">🚗 ${item.vehicle}</div>`;
  } else if (item.universe === 'emploi') {
    detailHtml += `
      <div style="font-size:15px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">🏢 ${item.company}</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
        <span style="background:#e8f5e9;color:#43a047;font-size:11px;font-weight:800;padding:4px 10px;border-radius:10px;">${item.type}</span>
        <span style="background:#f3f3f3;color:#555;font-size:11px;font-weight:700;padding:4px 10px;border-radius:10px;">💰 ${item.salary}</span>
        <span style="background:#e3f2fd;color:#1976d2;font-size:11px;font-weight:700;padding:4px 10px;border-radius:10px;">📍 ${item.location}</span>
      </div>`;
  } else if (item.universe === 'resto') {
    detailHtml += `
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">🍽️ ${item.restaurant} — ${item.location}</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <span style="font-size:24px;font-weight:900;color:var(--primary)">${formatPrice(item.price)}</span>
        <span style="color:#f9a825;font-weight:700;font-size:13px">★ ${item.rating}</span>
      </div>`;
  }

  const simHtml = renderSimilarItems(item);
  detailHtml += `
      <div class="detail-desc-box">
        <strong>Description</strong>
        <p>${item.desc}</p>
      </div>
    </div>
    ${simHtml}
    <div style="height:16px"></div>`;

  content.innerHTML = detailHtml;
  content.querySelectorAll('[data-sim-id]').forEach(el => {
    el.addEventListener('click', () => {
      const it = universeDataById.get(el.dataset.simId);
      if (it) { closeDetailView(); setTimeout(() => openUniverseDetailView(it), 50); }
    });
  });

  // Polymorphic action button
  const actionBtns = {
    immo: { icon: 'calendar_today', label: 'Planifier une visite / Contacter', color: '#43a047' },
    taxi: { icon: 'local_taxi', label: 'Commander la course', color: '#f9a825' },
    emploi: { icon: 'send', label: 'Postuler maintenant', color: '#1976d2' },
    resto: { icon: 'add_shopping_cart', label: 'Commander ce plat', color: '#e53935' },
  };
  const btn = actionBtns[item.universe] || { icon: 'chat', label: 'Contacter', color: '#f68b1e' };

  footer.innerHTML = `
    <button class="detail-add-btn" id="universeActionBtn" style="background:${btn.color};box-shadow:0 4px 14px ${btn.color}55;">
      <span class="material-icons-round">${btn.icon}</span> ${btn.label}
    </button>`;

  $('#universeActionBtn').addEventListener('click', () => {
    if (item.universe === 'resto') {
      const pseudo = { ...item, id: item.id.charCodeAt(1), price: item.price };
      const existing = state.cart.find(i => i.id === pseudo.id);
      if (existing) existing.qty++; else state.cart.push({ ...item, id: pseudo.id, qty: 1 });
      saveCart(); updateBadge();
      showToast(`${item.title} ajouté au panier 🛒`);
      closeDetailView();
    } else if (item.universe === 'taxi') {
      showToast('🚖 Mise en relation avec le chauffeur…');
      setTimeout(() => showToast(`✅ ${item.title} est en route !`), 2000);
      closeDetailView();
    } else if (item.universe === 'emploi') {
      showToast('📩 Votre candidature a été envoyée !');
      closeDetailView();
    } else {
      showToast('📅 Demande de visite envoyée au vendeur !');
      closeDetailView();
    }
  });

  $('#detailScroll').scrollTop = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => { $('#detailView').classList.add('open'); }));
}

// ═══════════════════════════════════════════════════════════════════
// UNIVERSE HOME SECTIONS
// ═══════════════════════════════════════════════════════════════════
function renderUniverseHomeSections() {
  const container = $('#universeHomeContent');
  if (!container) return;
  const u = state.currentUniverse;
  if (u === 'all' || u === 'shopping') {
    container.innerHTML = '';
    return; // default shopping view handled by existing sections
  }
  let html = '';
  if (u === 'immo') {
    html = `<div class="universe-section">
      <div class="universe-section-header">
        <h2><span class="material-icons-round" style="color:#43a047">home</span> Immobilier</h2>
        <a href="#" class="see-all">Voir tout</a>
      </div>
      <div class="immo-grid" id="immoGridHome"></div>
    </div>`;
  } else if (u === 'taxi') {
    html = `<div class="universe-section">
      <div class="universe-section-header">
        <h2><span class="material-icons-round" style="color:#f9a825">local_taxi</span> Taxi & Transport</h2>
        <a href="#" class="see-all">Voir tout</a>
      </div>
      <div class="taxi-row" id="taxiRowHome"></div>
    </div>`;
  } else if (u === 'emploi') {
    html = `<div class="universe-section">
      <div class="universe-section-header">
        <h2><span class="material-icons-round" style="color:#1976d2">work</span> Emploi</h2>
        <a href="#" class="see-all">Voir tout</a>
      </div>
      <div class="emploi-list" id="emploiListHome"></div>
    </div>`;
  } else if (u === 'resto') {
    html = `<div class="universe-section">
      <div class="universe-section-header">
        <h2><span class="material-icons-round" style="color:#e53935">restaurant</span> Restauration</h2>
        <a href="#" class="see-all">Voir tout</a>
      </div>
      <div class="resto-row" id="restoRowHome"></div>
    </div>`;
  }
  container.innerHTML = html;
  _populateUniverseSection(u);
}

function _populateUniverseSection(u) {
  if (u === 'immo') {
    const grid = $('#immoGridHome');
    if (!grid) return;
    grid.innerHTML = immoListings.map(item => `
      <div class="immo-card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="immo-card-body">
          <span class="immo-card-type ${item.type === 'Vente' ? 'vente' : 'location'}">${item.type}</span>
          <p class="immo-card-title">${item.title}</p>
          <div class="immo-card-price">${formatPrice(item.price)}${item.type==='Location'?'/mois':''}</div>
          <div class="immo-card-loc"><span class="material-icons-round" style="font-size:12px">location_on</span>${item.location}</div>
        </div>
      </div>`).join('');
    grid.querySelectorAll('.immo-card').forEach(card => {
      card.addEventListener('click', () => { const it = universeDataById.get(card.dataset.id); if (it) openUniverseDetailView(it); });
    });
  } else if (u === 'taxi') {
    const row = $('#taxiRowHome');
    if (!row) return;
    row.innerHTML = taxiListings.map(item => `
      <div class="taxi-card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="taxi-card-body">
          <p class="taxi-card-name">${item.title}</p>
          <div class="taxi-card-vehicle">${item.vehicle}</div>
          <div class="taxi-card-rating">★ ${item.rating}</div>
          <div class="taxi-card-price">${formatPrice(item.price)}/km</div>
        </div>
      </div>`).join('');
    row.querySelectorAll('.taxi-card').forEach(card => {
      card.addEventListener('click', () => { const it = universeDataById.get(card.dataset.id); if (it) openUniverseDetailView(it); });
    });
  } else if (u === 'emploi') {
    const list = $('#emploiListHome');
    if (!list) return;
    list.innerHTML = emploiListings.map(item => `
      <div class="emploi-card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="emploi-card-info">
          <p class="emploi-card-title">${item.title}</p>
          <div class="emploi-card-company">${item.company} • ${item.location}</div>
          <span class="emploi-card-type">${item.type}</span>
        </div>
        <span style="font-size:12px;font-weight:800;color:var(--primary)">${item.salary.split(' ')[0]}</span>
      </div>`).join('');
    list.querySelectorAll('.emploi-card').forEach(card => {
      card.addEventListener('click', () => { const it = universeDataById.get(card.dataset.id); if (it) openUniverseDetailView(it); });
    });
  } else if (u === 'resto') {
    const row = $('#restoRowHome');
    if (!row) return;
    row.innerHTML = restoListings.map(item => `
      <div class="resto-card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="resto-card-body">
          <div class="resto-card-name">${item.restaurant}</div>
          <p class="resto-card-title">${item.title}</p>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="resto-card-price">${formatPrice(item.price)}</div>
            <div class="resto-card-rating">★ ${item.rating}</div>
          </div>
        </div>
      </div>`).join('');
    row.querySelectorAll('.resto-card').forEach(card => {
      card.addEventListener('click', () => { const it = universeDataById.get(card.dataset.id); if (it) openUniverseDetailView(it); });
    });
  }
}

function renderAllUniverseSections() {
  const container = $('#universeHomeContent');
  if (!container) return;
  container.innerHTML = `
    <div class="universe-section">
      <div class="universe-section-header">
        <h2><span class="material-icons-round" style="color:#43a047">home</span> Immobilier</h2>
        <a href="#" class="see-all">Voir tout</a>
      </div>
      <div class="immo-grid" id="immoGridHome"></div>
    </div>
    <div class="universe-section">
      <div class="universe-section-header">
        <h2><span class="material-icons-round" style="color:#f9a825">local_taxi</span> Taxi & Transport</h2>
        <a href="#" class="see-all">Voir tout</a>
      </div>
      <div class="taxi-row" id="taxiRowHome"></div>
    </div>
    <div class="universe-section">
      <div class="universe-section-header">
        <h2><span class="material-icons-round" style="color:#e53935">restaurant</span> Restauration</h2>
        <a href="#" class="see-all">Voir tout</a>
      </div>
      <div class="resto-row" id="restoRowHome"></div>
    </div>
    <div class="universe-section">
      <div class="universe-section-header">
        <h2><span class="material-icons-round" style="color:#1976d2">work</span> Emploi</h2>
        <a href="#" class="see-all">Voir tout</a>
      </div>
      <div class="emploi-list" id="emploiListHome"></div>
    </div>`;
  _populateUniverseSection('immo');
  _populateUniverseSection('taxi');
  _populateUniverseSection('resto');
  _populateUniverseSection('emploi');
}

// ═══════════════════════════════════════════════════════════════════
// PUBLISH FUNNEL
// ═══════════════════════════════════════════════════════════════════
function openPublishModal() {
  const overlay = $('#publishOverlay');
  if (!overlay) return;
  state.publishStep = 1;
  state.publishUniverse = null;
  renderPublishStep1();
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));
}
function closePublishModal() {
  $('#publishOverlay')?.classList.remove('open');
}
function renderPublishStep1() {
  $('#publishSheetTitle').textContent = 'Que souhaitez-vous publier ?';
  $('#publishBody').innerHTML = `
    <div class="publish-universe-grid">
      <button class="publish-universe-btn shopping" data-u="shopping">
        <span class="material-icons-round">shopping_bag</span>🛍️ Shopping
      </button>
      <button class="publish-universe-btn immo" data-u="immo">
        <span class="material-icons-round">home</span>🏠 Immobilier
      </button>
      <button class="publish-universe-btn taxi" data-u="taxi">
        <span class="material-icons-round">local_taxi</span>🚖 Taxi & Transport
      </button>
      <button class="publish-universe-btn resto" data-u="resto">
        <span class="material-icons-round">restaurant</span>🍔 Restauration
      </button>
    </div>`;
  $$('.publish-universe-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.publishUniverse = btn.dataset.u;
      renderPublishStep2(btn.dataset.u);
    });
  });
}
function renderPublishStep2(universe) {
  const titles = { shopping: '🛍️ Détails du produit', immo: '🏠 Détails du bien', taxi: '🚖 Détails du trajet', resto: '🍔 Détails du plat' };
  $('#publishSheetTitle').textContent = titles[universe] || 'Détails';
  let fields = '';
  if (universe === 'immo') {
    fields = `
      <div class="publish-field"><label>Titre de l'annonce</label><input type="text" placeholder="Ex: Villa 4 pièces à Cocody"></div>
      <div class="publish-field"><label>Type</label><select><option>Vente</option><option>Location</option></select></div>
      <div class="publish-field"><label>Nombre de pièces</label><input type="number" placeholder="Ex: 4" min="0"></div>
      <div class="publish-field"><label>Localisation</label><input type="text" placeholder="Ex: Cocody, Abidjan"></div>
      <div class="publish-field"><label>Description</label><textarea placeholder="Décrivez votre bien immobilier..."></textarea></div>`;
  } else if (universe === 'taxi') {
    fields = `
      <div class="publish-field"><label>Votre nom / Pseudo</label><input type="text" placeholder="Ex: Kouassi Koffi"></div>
      <div class="publish-field"><label>Type de véhicule</label><input type="text" placeholder="Ex: Toyota Camry 2022"></div>
      <div class="publish-field"><label>Zone de desserte</label><input type="text" placeholder="Ex: Grand Abidjan"></div>
      <div class="publish-field"><label>Description</label><textarea placeholder="Présentez votre service..."></textarea></div>`;
  } else if (universe === 'resto') {
    fields = `
      <div class="publish-field"><label>Nom du plat</label><input type="text" placeholder="Ex: Attiéké Poisson Braisé"></div>
      <div class="publish-field"><label>Nom du restaurant</label><input type="text" placeholder="Ex: Chez Mama Adjoua"></div>
      <div class="publish-field"><label>Ingrédients / Description</label><textarea placeholder="Décrivez votre plat..."></textarea></div>`;
  } else {
    fields = `
      <div class="publish-field"><label>Titre du produit</label><input type="text" placeholder="Ex: iPhone 13 128Go"></div>
      <div class="publish-field"><label>Catégorie</label><select><option>Mode</option><option>Chaussures</option><option>Électronique</option><option>Beauté</option></select></div>
      <div class="publish-field"><label>Description</label><textarea placeholder="Décrivez votre produit..."></textarea></div>`;
  }
  $('#publishBody').innerHTML = `
    <div class="publish-step-nav">
      <button class="publish-back-btn" id="publishBackBtn">← Retour</button>
      <div class="publish-progress">
        <div class="publish-progress-dot done"></div>
        <div class="publish-progress-dot done"></div>
        <div class="publish-progress-dot"></div>
      </div>
    </div>
    <div class="publish-form">${fields}</div>
    <div style="padding:0 20px 8px">
      <button class="publish-submit-btn" id="publishNext2">Suivant → Photos & Prix</button>
    </div>`;
  $('#publishBackBtn').addEventListener('click', renderPublishStep1);
  $('#publishNext2').addEventListener('click', renderPublishStep3);
}
function renderPublishStep3() {
  $('#publishSheetTitle').textContent = '📸 Photos & Prix';
  $('#publishBody').innerHTML = `
    <div class="publish-step-nav">
      <button class="publish-back-btn" id="publishBackBtn3">← Retour</button>
      <div class="publish-progress">
        <div class="publish-progress-dot done"></div>
        <div class="publish-progress-dot done"></div>
        <div class="publish-progress-dot done"></div>
      </div>
    </div>
    <div class="publish-form">
      <div class="publish-field"><label>Prix (FCFA)</label><input type="number" placeholder="Ex: 15000" min="0"></div>
      <div class="publish-photo-btn" id="addPhotoBtn">
        <span class="material-icons-round">add_photo_alternate</span> Ajouter des photos (max 4)
      </div>
    </div>
    <div style="padding:0 20px 24px">
      <button class="publish-submit-btn" id="publishFinalBtn">✅ Publier l'annonce</button>
    </div>`;
  $('#publishBackBtn3').addEventListener('click', () => renderPublishStep2(state.publishUniverse));
  $('#publishFinalBtn').addEventListener('click', () => {
    closePublishModal();
    const univLabels = { shopping: 'Shopping', immo: 'Immobilier', taxi: 'Taxi', resto: 'Restauration' };
    showToast(`✅ Annonce publiée sur ChatSquirrel — ${univLabels[state.publishUniverse] || 'votre univers'} !`);
    if (state.publishUniverse === 'immo' || state.publishUniverse === 'taxi' || state.publishUniverse === 'emploi' || state.publishUniverse === 'resto') {
      state.currentUniverse = state.publishUniverse;
      renderUniverseHomeSections();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════════════════════════════════
function switchTab(tabId) {
  $$('.tab-panel').forEach(p => p.classList.remove('active'));
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  const panel = $(`#tab-${tabId}`);
  const navItem = $(`.nav-item[data-tab="${tabId}"]`);
  if (panel) panel.classList.add('active');
  if (navItem) navItem.classList.add('active');

  if (tabId === 'categories') renderCategoriesTab();
  if (tabId === 'offers') renderOffersTab();
  if (tabId === 'account') renderAccountTab();
  if (tabId === 'home') {
    // Sync search universe to current universe for coherent context
    state.searchUniverse = state.currentUniverse;
  }
}

// ═══════════════════════════════════════════════════════════════════
// FULL-SCREEN DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════
function ensureDetailView() {
  if ($('#detailView')) return;
  const el = document.createElement('div');
  el.id = 'detailView';
  el.innerHTML = `
    <header class="sec-header" id="detailHeader">
      <button class="sec-header-back" id="detailBackBtn" aria-label="Retour">
        <span class="material-icons-round">arrow_back</span>
      </button>
      <h2 id="detailHeaderTitle">Détail produit</h2>
    </header>
    <div class="detail-scroll" id="detailScroll">
      <div id="detailContent"></div>
    </div>
    <div class="detail-footer" id="detailFooter"></div>
  `;
  document.body.appendChild(el);
  $('#detailBackBtn').addEventListener('click', () => closeDetailView());
}

function openDetailView(product, fromCart = false) {
  ensureDetailView();
  const content = $('#detailContent');
  const footer = $('#detailFooter');

  const simHtml = renderSimilarItems({ ...product, universe: 'shopping' });
  content.innerHTML = `
    <div class="detail-hero">
      <img src="${product.image}" alt="${product.title}" loading="eager" onerror="this.style.display='none'">
      <span class="detail-discount-badge">-${product.discount}%</span>
    </div>
    <div class="detail-body">
      <h1 class="detail-title">${product.title}</h1>
      <div class="detail-prices">
        <span class="detail-price">${formatPrice(product.price)}</span>
        <span class="detail-old-price">${formatPrice(product.oldPrice)}</span>
      </div>
      <div class="detail-desc-box">
        <strong>Description</strong>
        <p>${buildDescription(product.title)}</p>
      </div>
      <button class="detail-chat-btn" id="detailChatBtn" style="width:100%;padding:13px;background:#fff3e0;border:1.5px solid var(--primary);border-radius:10px;color:var(--primary);font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;">
        <span class="material-icons-round" style="font-size:18px">chat</span> Discuter avec le vendeur
      </button>
    </div>
    ${simHtml}
    <div style="height:16px"></div>
  `;

  footer.innerHTML = `
    <button class="detail-add-btn" id="detailAddBtn">
      <span class="material-icons-round">shopping_cart</span> AJOUTER AU PANIER
    </button>
  `;

  $('#detailAddBtn').addEventListener('click', () => {
    addToCart(product);
    closeDetailView();
    if (fromCart) openCartView();
  });

  content.querySelectorAll('[data-sim-id]').forEach(el => {
    el.addEventListener('click', () => {
      const p = productById.get(Number(el.dataset.simId));
      if (p) { closeDetailView(); setTimeout(() => openDetailView(p), 50); }
    });
  });

  $('#detailChatBtn').addEventListener('click', () => {
    if (!isLoggedIn()) { openAuthSheet('Pour discuter avec un vendeur, connectez-vous d\'abord.'); return; }
    const seller = mockSellers.find(s => s.categoryId === product.categoryId) || mockSellers[0];
    closeDetailView();
    openChatView(seller, product);
  });

  $('#detailBackBtn').onclick = () => {
    closeDetailView();
    if (fromCart) openCartView();
  };

  $('#detailScroll').scrollTop = 0;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    $('#detailView').classList.add('open');
  }));
}

function closeDetailView() {
  const el = $('#detailView');
  if (el) el.classList.remove('open');
}

// ═══════════════════════════════════════════════════════════════════
// FULL-SCREEN CART VIEW
// ═══════════════════════════════════════════════════════════════════
function ensureCartView() {
  if ($('#cartView')) return;
  const el = document.createElement('div');
  el.id = 'cartView';
  el.innerHTML = `
    <header class="sec-header" id="cartHeader">
      <button class="sec-header-back" id="cartBackBtn" aria-label="Retour">
        <span class="material-icons-round">arrow_back</span>
      </button>
      <h2>Mon Panier</h2>
      <span class="sec-header-meta" id="cartViewCount"></span>
    </header>
    <div class="cart-body">
      <div class="cart-items-wrap" id="cartItemsWrap"></div>
      <div class="cart-footer" id="cartFooter" style="display:none"></div>
    </div>
  `;
  document.body.appendChild(el);
  $('#cartBackBtn').addEventListener('click', closeCartView);
}

function openCartView() {
  ensureCartView();
  renderCartView();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $('#cartView').classList.add('open');
  }));
}

function closeCartView() {
  const el = $('#cartView');
  if (el) el.classList.remove('open');
}

function renderCartView() {
  const wrap = $('#cartItemsWrap');
  const footer = $('#cartFooter');
  const countEl = $('#cartViewCount');
  if (!wrap) return;

  const n = cartCount();
  if (countEl) countEl.textContent = n > 0 ? `${n} article${n > 1 ? 's' : ''}` : '';

  if (state.cart.length === 0) {
    wrap.innerHTML = `
      <div class="cart-empty">
        <span class="material-icons-round">shopping_cart</span>
        <p>Votre panier est vide</p>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  wrap.innerHTML = state.cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.parentElement.style.background='#eee'">
      </div>
      <div class="cart-item-info">
        <p class="cart-item-title">${item.title}</p>
        <span class="cart-item-price">${formatPrice(item.price)}</span>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn minus" data-id="${item.id}" aria-label="Diminuer">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn plus" data-id="${item.id}" aria-label="Augmenter">+</button>
        <button class="qty-btn del" data-id="${item.id}" aria-label="Supprimer">
          <span class="material-icons-round">delete_outline</span>
        </button>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('.qty-btn.minus').forEach(b =>
    b.addEventListener('click', e => { e.stopPropagation(); changeQty(Number(b.dataset.id), -1); }));
  wrap.querySelectorAll('.qty-btn.plus').forEach(b =>
    b.addEventListener('click', e => { e.stopPropagation(); changeQty(Number(b.dataset.id), 1); }));
  wrap.querySelectorAll('.qty-btn.del').forEach(b =>
    b.addEventListener('click', e => { e.stopPropagation(); removeFromCart(Number(b.dataset.id)); }));

  wrap.querySelectorAll('.cart-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.cart-item-actions')) return;
      const id = Number(el.dataset.id);
      const product = productById.get(id) || state.cart.find(i => i.id === id);
      if (product) { closeCartView(); openDetailView(product, true); }
    });
  });

  if (footer) {
    footer.style.display = '';
    footer.innerHTML = `
      <div class="cart-total-row">
        <span>Total</span>
        <strong>${formatPrice(cartTotal())}</strong>
      </div>
      <button class="cart-order-btn">PASSER LA COMMANDE</button>
    `;
    footer.querySelector('.cart-order-btn').addEventListener('click', () => {
      if (!isLoggedIn()) { closeCartView(); openAuthSheet('Connectez-vous pour finaliser votre commande.'); return; }
      showToast('Commande en cours de validation…');
      closeCartView();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// AUTH SHEET (Lazy Authentication)
// ═══════════════════════════════════════════════════════════════════
function openAuthSheet(message = 'Connectez-vous pour continuer.') {
  let overlay = $('#authOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'auth-overlay';
    overlay.id = 'authOverlay';
    overlay.innerHTML = `
      <div class="auth-sheet">
        <button class="auth-sheet-close" id="authSheetClose">✕</button>
        <p class="auth-sheet-title">Identification requise</p>
        <p class="auth-sheet-sub" id="authSheetSub"></p>
        <div class="auth-sheet-btns">
          <button class="auth-sheet-btn primary" id="authSheetLogin">Se connecter</button>
          <button class="auth-sheet-btn secondary" id="authSheetSignup">Créer un compte</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAuthSheet(); });
    $('#authSheetClose').addEventListener('click', closeAuthSheet);
    $('#authSheetLogin').addEventListener('click', () => { simulateLogin(); closeAuthSheet(); });
    $('#authSheetSignup').addEventListener('click', () => { simulateLogin(); closeAuthSheet(); showToast('Compte créé avec succès ! Bienvenue.'); });
  }
  $('#authSheetSub').textContent = message;
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('open')));
}

function closeAuthSheet() {
  const overlay = $('#authOverlay');
  if (overlay) { overlay.classList.remove('open'); setTimeout(() => renderAccountTab(), 350); }
}

function simulateLogin() {
  setUser(MOCK_USER);
  renderAccountTab();
  showToast(`Bienvenue, ${MOCK_USER.name} !`);
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: CATÉGORIES TAB — Context-Aware
// ═══════════════════════════════════════════════════════════════════
function getUniverseItems(universe) {
  // Returns the item pool for the current universe
  if (!universe || universe === 'all' || universe === 'shopping') return allProducts;
  if (universe === 'immo') return immoListings;
  if (universe === 'taxi') return taxiListings;
  if (universe === 'emploi') return emploiListings;
  if (universe === 'resto') return restoListings;
  return allProducts;
}

function getUniverseSidebarCategories(universe) {
  if (!universe || universe === 'all' || universe === 'shopping') {
    return categories.filter(c => c.id !== 0);
  }
  return UNIVERSE_CATEGORIES[universe] || [];
}

function renderUniverseItems(items, container) {
  // Render a list of universe-specific items (immo, taxi, emploi, resto) OR products
  container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = `<div class="cat-section-title" style="grid-column:1/-1">Aucun résultat</div>`;
    return;
  }
  const first = items[0];
  if (first.universe === 'immo') {
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(2, 1fr)';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'immo-card';
      card.dataset.id = item.id;
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="immo-card-body">
          <span class="immo-card-type ${item.type === 'Vente' ? 'vente' : 'location'}">${item.type}</span>
          <p class="immo-card-title">${item.title}</p>
          <div class="immo-card-price">${formatPrice(item.price)}${item.type==='Location'?'/mois':''}</div>
          <div class="immo-card-loc"><span class="material-icons-round" style="font-size:12px">location_on</span>${item.location}</div>
        </div>`;
      card.addEventListener('click', () => openUniverseDetailView(item));
      container.appendChild(card);
    });
  } else if (first.universe === 'taxi') {
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(2, 1fr)';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'taxi-card';
      card.dataset.id = item.id;
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="taxi-card-body">
          <p class="taxi-card-name">${item.title}</p>
          <div class="taxi-card-vehicle">${item.vehicle}</div>
          <div class="taxi-card-rating">★ ${item.rating}</div>
          <div class="taxi-card-price">${formatPrice(item.price)}/km</div>
        </div>`;
      card.addEventListener('click', () => openUniverseDetailView(item));
      container.appendChild(card);
    });
  } else if (first.universe === 'emploi') {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gridTemplateColumns = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'emploi-card';
      card.style.cssText = 'border-radius:14px;margin-bottom:8px;grid-column:1/-1;';
      card.dataset.id = item.id;
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="emploi-card-info">
          <p class="emploi-card-title">${item.title}</p>
          <div class="emploi-card-company">${item.company} • ${item.location}</div>
          <span class="emploi-card-type">${item.type}</span>
        </div>
        <span style="font-size:12px;font-weight:800;color:var(--primary);flex-shrink:0">${item.salary.split(' ')[0]}</span>`;
      card.addEventListener('click', () => openUniverseDetailView(item));
      container.appendChild(card);
    });
  } else if (first.universe === 'resto') {
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(2, 1fr)';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'resto-card';
      card.dataset.id = item.id;
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="resto-card-body">
          <div class="resto-card-name">${item.restaurant}</div>
          <p class="resto-card-title">${item.title}</p>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="resto-card-price">${formatPrice(item.price)}</div>
            <div class="resto-card-rating">★ ${item.rating}</div>
          </div>
        </div>`;
      card.addEventListener('click', () => openUniverseDetailView(item));
      container.appendChild(card);
    });
  } else {
    // Shopping products
    container.style.display = '';
    container.style.gridTemplateColumns = '';
    const frag = document.createDocumentFragment();
    items.forEach(p => frag.appendChild(createProductCard(p)));
    container.appendChild(frag);
    bindProductCards(container);
  }
}

function filterUniverseItemsByCategory(items, catId) {
  const u = state.currentUniverse;
  if (!catId || String(catId).endsWith('-all') || catId === 0) return items;
  if (u === 'immo') {
    if (catId === 'i-location') return items.filter(i => i.type === 'Location');
    if (catId === 'i-vente') return items.filter(i => i.type === 'Vente');
    if (catId === 'i-terrain') return items.filter(i => i.title.toLowerCase().includes('terrain'));
    if (catId === 'i-appart') return items.filter(i => i.title.toLowerCase().includes('appartement') || i.title.toLowerCase().includes('studio'));
    if (catId === 'i-maison') return items.filter(i => i.title.toLowerCase().includes('villa') || i.title.toLowerCase().includes('maison') || i.title.toLowerCase().includes('duplex'));
    return items;
  }
  if (u === 'taxi') {
    if (catId === 't-vtc') return items.filter(i => i.title.toLowerCase().includes('vtc'));
    if (catId === 't-moto') return items.filter(i => i.title.toLowerCase().includes('moto'));
    if (catId === 't-premium') return items.filter(i => i.rating >= 4.8);
    if (catId === 't-eco') return items.filter(i => i.price <= 400);
    return items;
  }
  if (u === 'emploi') {
    if (catId === 'e-cdi') return items.filter(i => i.type === 'CDI');
    if (catId === 'e-cdd') return items.filter(i => i.type === 'CDD');
    if (catId === 'e-tech') return items.filter(i => i.title.toLowerCase().includes('tech') || i.title.toLowerCase().includes('développ') || i.title.toLowerCase().includes('digital'));
    if (catId === 'e-commerce') return items.filter(i => i.title.toLowerCase().includes('commercial') || i.title.toLowerCase().includes('marketing'));
    return items;
  }
  if (u === 'resto') {
    if (catId === 'r-local') return items.filter(i => ['Attiéké', 'Kedjenou', 'Riz sauce', 'Thiébou'].some(k => i.title.includes(k)));
    if (catId === 'r-fast') return items.filter(i => i.restaurant.toLowerCase().includes('fast') || i.title.toLowerCase().includes('burger'));
    if (catId === 'r-pizza') return items.filter(i => i.title.toLowerCase().includes('pizza'));
    if (catId === 'r-poisson') return items.filter(i => i.title.toLowerCase().includes('poisson') || i.title.toLowerCase().includes('crabe') || i.title.toLowerCase().includes('thiébou'));
    return items;
  }
  return items;
}

function renderCategoriesTab() {
  const sidebar = $('#catSidebar');
  const productsContainer = $('#catProducts');
  if (!sidebar || !productsContainer) return;

  const universe = state.currentUniverse;
  const isShoppingMode = !universe || universe === 'all' || universe === 'shopping';

  if (isShoppingMode) {
    // Classic shopping categories
    productsContainer.style.display = '';
    productsContainer.style.gridTemplateColumns = '';
    sidebar.innerHTML = categories.filter(c => c.id !== 0).map(c => `
      <div class="cat-sidebar-item ${c.id === state.catSelectedId ? 'active' : ''}" data-cat="${c.id}">
        <span class="material-icons-round">${c.icon}</span>
        ${c.name}
      </div>`).join('');
    sidebar.querySelectorAll('.cat-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        state.catSelectedId = Number(item.dataset.cat);
        renderCategoriesTab();
      });
    });
    const catProds = allProducts.filter(p => p.categoryId === state.catSelectedId);
    const catName = categories.find(c => c.id === state.catSelectedId)?.name || '';
    productsContainer.innerHTML = `<div class="cat-section-title">${catName} (${catProds.length} articles)</div>`;
    const frag = document.createDocumentFragment();
    catProds.forEach(p => frag.appendChild(createProductCard(p)));
    productsContainer.appendChild(frag);
    bindProductCards(productsContainer);
  } else {
    // Universe-specific categories
    const univCats = getUniverseSidebarCategories(universe);
    if (!state.catUniverseSelectedId) state.catUniverseSelectedId = univCats[0]?.id;
    sidebar.innerHTML = univCats.map(c => `
      <div class="cat-sidebar-item ${c.id === state.catUniverseSelectedId ? 'active' : ''}" data-cat="${c.id}">
        <span class="material-icons-round">${c.icon}</span>
        ${c.name}
      </div>`).join('');
    sidebar.querySelectorAll('.cat-sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        state.catUniverseSelectedId = item.dataset.cat;
        renderCategoriesTab();
      });
    });
    const allUnivItems = getUniverseItems(universe);
    const filtered = filterUniverseItemsByCategory(allUnivItems, state.catUniverseSelectedId);
    const selCat = univCats.find(c => c.id === state.catUniverseSelectedId);
    productsContainer.innerHTML = `<div class="cat-section-title" style="grid-column:1/-1">${selCat?.name || ''} (${filtered.length} résultats)</div>`;
    renderUniverseItems(filtered, productsContainer);
  }
}

// Search in categories tab
function initCatSearch() {
  const input = $('#catSearchInput');
  if (!input) return;
  input.addEventListener('input', debounce(e => {
    const q = e.target.value.trim().toLowerCase();
    const productsContainer = $('#catProducts');
    if (!productsContainer) return;
    const universe = state.currentUniverse;
    const isShoppingMode = !universe || universe === 'all' || universe === 'shopping';
    if (isShoppingMode) {
      const base = q ? allProducts.filter(p => p.title.toLowerCase().includes(q)) :
                       allProducts.filter(p => p.categoryId === state.catSelectedId);
      const label = q ? `Résultats pour "${e.target.value.trim()}"` : (categories.find(c => c.id === state.catSelectedId)?.name || '');
      productsContainer.innerHTML = `<div class="cat-section-title">${label} (${base.length} articles)</div>`;
      const frag = document.createDocumentFragment();
      base.forEach(p => frag.appendChild(createProductCard(p)));
      productsContainer.appendChild(frag);
      bindProductCards(productsContainer);
    } else {
      const pool = getUniverseItems(universe);
      const base = q ? pool.filter(item => {
        const txt = (item.title + ' ' + (item.restaurant||'') + ' ' + (item.company||'') + ' ' + (item.vehicle||'') + ' ' + (item.location||'')).toLowerCase();
        return txt.includes(q);
      }) : pool;
      productsContainer.innerHTML = `<div class="cat-section-title" style="grid-column:1/-1">${q ? `Résultats pour "${e.target.value.trim()}"` : (UNIVERSE_CONFIG[universe]?.label||'')} (${base.length})</div>`;
      renderUniverseItems(base, productsContainer);
    }
  }, 200));
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: OFFRES TAB
// ═══════════════════════════════════════════════════════════════════
const promobanners = [
  { color: '#ff7043', icon: 'flash_on', title: 'Méga Soldes', sub: 'Jusqu\'à -40% sur tout' },
  { color: '#5c6bc0', title: 'Nouvelles Arrivées', sub: 'Découvrez les tendances tech', icon: 'devices' },
  { color: '#66bb6a', title: 'Mode Africaine', sub: 'Wax, Kente & plus', icon: 'checkroom' },
  { color: '#ec407a', title: 'Beauté & Soins', sub: 'Offres exclusives beauté', icon: 'spa' },
];

let offersCountdownTotal = 3600 * 5 + 22 * 60 + 14;
let offersCountdownEl = null;

function renderOffersTab() {
  const container = $('#offersContent');
  if (!container) return;
  const saleProducts = allProducts.filter(p => p.discount >= 25);
  const newProducts = allProducts.filter(p => p.discount < 25).slice(0, 8);

  container.innerHTML = `
    <!-- Promo Banners -->
    <div style="display:flex;gap:10px;overflow-x:auto;padding:14px;scrollbar-width:none;">
      ${promobanners.map(b => `
        <div style="min-width:200px;height:100px;border-radius:14px;background:${b.color};padding:14px 16px;flex-shrink:0;position:relative;overflow:hidden;cursor:pointer;">
          <span class="material-icons-round" style="position:absolute;right:-10px;bottom:-10px;font-size:80px;color:rgba(255,255,255,.15)">${b.icon}</span>
          <div style="position:relative;z-index:1">
            <div style="color:#fff;font-size:15px;font-weight:800;">${b.title}</div>
            <div style="color:rgba(255,255,255,.85);font-size:11px;margin-top:4px;">${b.sub}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Flash Sales Section -->
    <div class="offers-section-header">
      <h3><span style="color:#ffcc00">⚡</span> Ventes Flash</h3>
      <span class="countdown" id="offersCountdown">--:--:--</span>
    </div>
    <div class="offers-grid" id="offersFlashGrid"></div>

    <!-- New Arrivals -->
    <div class="offers-section-header" style="margin-top:14px">
      <h3>🆕 Nouveautés</h3>
    </div>
    <div class="offers-grid" id="offersNewGrid"></div>
  `;

  const flashGrid = $('#offersFlashGrid');
  const newGrid = $('#offersNewGrid');
  const frag1 = document.createDocumentFragment();
  const frag2 = document.createDocumentFragment();
  saleProducts.forEach(p => frag1.appendChild(createProductCard(p)));
  newProducts.forEach(p => frag2.appendChild(createProductCard(p)));
  flashGrid.appendChild(frag1);
  newGrid.appendChild(frag2);
  bindProductCards(flashGrid);
  bindProductCards(newGrid);

  offersCountdownEl = $('#offersCountdown');
  updateOffersCountdown();
}

function updateOffersCountdown() {
  if (!offersCountdownEl || !document.body.contains(offersCountdownEl)) return;
  const h = String(Math.floor(offersCountdownTotal / 3600)).padStart(2, '0');
  const m = String(Math.floor((offersCountdownTotal % 3600) / 60)).padStart(2, '0');
  const s = String(offersCountdownTotal % 60).padStart(2, '0');
  offersCountdownEl.textContent = `${h}:${m}:${s}`;
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: COMPTE TAB
// ═══════════════════════════════════════════════════════════════════
const privateMenuItems = ['mes-commandes', 'inbox', 'favoris', 'bons', 'gestion', 'vendeurs'];

const accountMenuGroups = [
  {
    title: 'Mon Espace',
    items: [
      { id: 'mes-commandes', icon: 'receipt_long', color: '#fff3e0', iconColor: '#f68b1e', label: 'Mes Commandes', badge: null, private: true },
      { id: 'inbox', icon: 'chat_bubble_outline', color: '#e3f2fd', iconColor: '#1976d2', label: 'Boîte de réception', badge: '3', private: true },
      { id: 'favoris', icon: 'favorite_border', color: '#fce4ec', iconColor: '#e91e63', label: 'Mes Favoris', badge: null, private: true },
      { id: 'bons', icon: 'local_activity', color: '#f3e5f5', iconColor: '#9c27b0', label: 'Bons d\'achat', badge: null, private: true },
    ]
  },
  {
    title: 'Vendeurs',
    items: [
      { id: 'vendeurs', icon: 'store', color: '#e8f5e9', iconColor: '#43a047', label: 'Vendeurs Suivis', badge: null, private: true },
      { id: 'devenir-vendeur', icon: 'sell', color: '#fffde7', iconColor: '#f9a825', label: 'Devenir Vendeur', badge: null, private: false },
    ]
  },
  {
    title: 'Aide & Informations',
    items: [
      { id: 'aide', icon: 'help_outline', color: '#f5f5f5', iconColor: '#757575', label: 'Aide & Assistance', badge: null, private: false },
      { id: 'confidentialite', icon: 'privacy_tip', color: '#f5f5f5', iconColor: '#757575', label: 'Politique de Confidentialité', badge: null, private: false },
      { id: 'parametres', icon: 'settings', color: '#f5f5f5', iconColor: '#757575', label: 'Paramètres de la boutique', badge: null, private: false },
    ]
  }
];

function renderAccountTab() {
  const container = $('#accountContent');
  if (!container) return;
  const user = getUser();

  container.innerHTML = `
    <div class="account-hero">
      ${user ? `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;">${user.name[0]}</div>
          <div>
            <p class="account-hero-greeting">Bonjour, ${user.name.split(' ')[0]} !</p>
            <p class="account-hero-sub">${user.email}</p>
          </div>
        </div>
        <button id="logoutBtn" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);color:#fff;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Se déconnecter</button>
      ` : `
        <p class="account-hero-greeting">Bonjour, Invité !</p>
        <p class="account-hero-sub">Connectez-vous pour profiter de toutes les fonctionnalités.</p>
        <div class="account-auth-btns">
          <button class="account-auth-btn login" id="accountLoginBtn">Se connecter</button>
          <button class="account-auth-btn signup" id="accountSignupBtn">Créer un compte</button>
        </div>
      `}
    </div>
    ${accountMenuGroups.map(group => `
      <div class="account-section">
        <p class="account-section-title">${group.title}</p>
        ${group.items.map(item => `
          <div class="account-menu-item" data-item="${item.id}">
            <div class="account-menu-icon" style="background:${item.color}">
              <span class="material-icons-round" style="color:${item.iconColor}">${item.icon}</span>
            </div>
            <span class="account-menu-label">${item.label}</span>
            ${item.badge ? `<span class="account-menu-badge">${item.badge}</span>` : ''}
            <span class="material-icons-round account-menu-arrow">chevron_right</span>
          </div>
        `).join('')}
      </div>
    `).join('')}
    <div style="height:20px"></div>
  `;

  $('#accountLoginBtn')?.addEventListener('click', () => openAuthSheet('Connectez-vous pour accéder à votre espace personnel.'));
  $('#accountSignupBtn')?.addEventListener('click', () => openAuthSheet('Créez un compte pour profiter de toutes les fonctionnalités.'));
  $('#logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    renderAccountTab();
    showToast('Vous avez été déconnecté.');
  });

  container.querySelectorAll('.account-menu-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.item;
      const item = accountMenuGroups.flatMap(g => g.items).find(i => i.id === id);
      if (!item) return;
      if (item.private && !isLoggedIn()) {
        openAuthSheet(`Connectez-vous pour accéder à "${item.label}".`);
        return;
      }
      if (id === 'inbox') { openInboxView(); return; }
      if (id === 'aide') { showToast('Aide disponible au 0800 000 000'); return; }
      if (id === 'confidentialite') { showToast('Politique de confidentialité Jumia CI'); return; }
      if (id === 'parametres') { showToast('Paramètres de la boutique'); return; }
      if (id === 'devenir-vendeur') { showToast('Inscription vendeur bientôt disponible'); return; }
      showToast(`${item.label} — Section en cours de développement`);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: INBOX / CHAT
// ═══════════════════════════════════════════════════════════════════
const mockSellers = [
  { id: 's1', name: 'Tech Store CI', initials: 'TS', color: '#5c6bc0', categoryId: 3, lastMsg: 'Bonjour ! Comment puis-je vous aider ?', time: '10:42', unread: 2 },
  { id: 's2', name: 'Mode Abidjan', initials: 'MA', color: '#e91e63', categoryId: 1, lastMsg: 'Le pagne est disponible en taille L.', time: 'Hier', unread: 0 },
  { id: 's3', name: 'Chaussures Prestige', initials: 'CP', color: '#43a047', categoryId: 2, lastMsg: 'Livraison sous 48h à Abidjan.', time: 'Lun', unread: 1 },
  { id: 's4', name: 'Beauté Royale', initials: 'BR', color: '#f9a825', categoryId: 4, lastMsg: 'Merci pour votre commande !', time: 'Dim', unread: 0 },
];

// In-memory messages store
const chatMessages = {};

function getMsgs(sellerId) {
  if (!chatMessages[sellerId]) {
    chatMessages[sellerId] = [
      { id: 1, senderId: sellerId, text: 'Bonjour ! Je suis là pour vous aider. N\'hésitez pas à poser vos questions.', time: '10:40' },
    ];
  }
  return chatMessages[sellerId];
}

function ensureInboxView() {
  if ($('#inboxView')) return;
  const el = document.createElement('div');
  el.id = 'inboxView';
  el.innerHTML = `
    <header class="sec-header">
      <button class="sec-header-back" id="inboxBackBtn"><span class="material-icons-round">arrow_back</span></button>
      <h2>Boîte de réception</h2>
    </header>
    <div class="inbox-list" id="inboxList"></div>
  `;
  document.body.appendChild(el);
  $('#inboxBackBtn').addEventListener('click', closeInboxView);
}

function openInboxView() {
  ensureInboxView();
  const list = $('#inboxList');
  list.innerHTML = mockSellers.map(s => `
    <div class="inbox-item" data-seller="${s.id}">
      <div class="inbox-avatar" style="background:${s.color}">${s.initials}</div>
      <div class="inbox-info">
        <p class="inbox-name">${s.name}</p>
        <p class="inbox-preview">${s.lastMsg}</p>
      </div>
      <div class="inbox-meta">
        <span class="inbox-time">${s.time}</span>
        ${s.unread ? `<span class="inbox-unread">${s.unread}</span>` : ''}
      </div>
    </div>
  `).join('');
  list.querySelectorAll('.inbox-item').forEach(item => {
    item.addEventListener('click', () => {
      const seller = mockSellers.find(s => s.id === item.dataset.seller);
      if (seller) { closeInboxView(); openChatView(seller, null); }
    });
  });
  requestAnimationFrame(() => requestAnimationFrame(() => $('#inboxView').classList.add('open')));
}

function closeInboxView() {
  const el = $('#inboxView');
  if (el) el.classList.remove('open');
}

function ensureChatView() {
  if ($('#chatView')) return;
  const el = document.createElement('div');
  el.id = 'chatView';
  el.innerHTML = `
    <header class="sec-header">
      <button class="sec-header-back" id="chatBackBtn"><span class="material-icons-round">arrow_back</span></button>
      <h2 id="chatSellerName">Vendeur</h2>
    </header>
    <div class="chat-messages" id="chatMessages"></div>
    <div class="chat-input-bar">
      <input class="chat-input" id="chatInput" type="text" placeholder="Écrire un message...">
      <button class="chat-send-btn" id="chatSendBtn"><span class="material-icons-round">send</span></button>
    </div>
  `;
  document.body.appendChild(el);
  $('#chatBackBtn').addEventListener('click', closeChatView);
}

function openChatView(seller, product = null) {
  ensureChatView();
  $('#chatSellerName').textContent = seller.name;
  const msgs = getMsgs(seller.id);

  function renderMessages() {
    const container = $('#chatMessages');
    const myId = 'me';
    let html = '';
    if (product) {
      html += `<div class="chat-product-ref"><strong>${product.title}</strong>${formatPrice(product.price)} — Question sur ce produit</div>`;
    }
    html += msgs.map(m => {
      const isMe = m.senderId === myId;
      return `
        <div class="chat-bubble-wrap ${isMe ? 'me' : 'them'}">
          <div class="chat-bubble">${m.text}<div class="chat-time">${m.time}</div></div>
        </div>
      `;
    }).join('');
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  renderMessages();

  const input = $('#chatInput');
  const sendBtn = $('#chatSendBtn');
  // Remove previous listeners by cloning
  const newSend = sendBtn.cloneNode(true);
  sendBtn.parentNode.replaceChild(newSend, sendBtn);
  const newInput = input.cloneNode(true);
  input.parentNode.replaceChild(newInput, input);

  function sendMessage() {
    const text = $('#chatInput').value.trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    msgs.push({ id: Date.now(), senderId: 'me', text, time });
    $('#chatInput').value = '';
    renderMessages();
    // Simulate seller reply after 1.2s
    setTimeout(() => {
      const replies = [
        'Merci pour votre message ! Je vous réponds dans les plus brefs délais.',
        'Oui, cet article est disponible. Souhaitez-vous plus d\'informations ?',
        'Je peux vous faire un bon prix si vous prenez 2 articles !',
        'Livraison gratuite à Abidjan pour toute commande supérieure à 20 000 FCFA.',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      msgs.push({ id: Date.now() + 1, senderId: seller.id, text: reply, time: replyTime });
      renderMessages();
    }, 1200);
  }

  $('#chatSendBtn').addEventListener('click', sendMessage);
  $('#chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

  requestAnimationFrame(() => requestAnimationFrame(() => $('#chatView').classList.add('open')));
}

function closeChatView() {
  const el = $('#chatView');
  if (el) el.classList.remove('open');
}

// ─── Carousel ───
function renderCarousel() {
  const track = $('#carouselTrack');
  const dots = $('#carouselDots');
  if (!track || !dots) return;

  banners.forEach(b => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.style.backgroundImage = `url('${b}')`;
    slide.setAttribute('role', 'img');
    slide.setAttribute('aria-label', 'Bannière promotionnelle');
    track.appendChild(slide);
  });

  banners.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.dataset.index = i;
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dots.appendChild(dot);
  });

  let current = 0;
  const update = () => {
    track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;
    dots.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  };
  const goTo = index => { current = (index + banners.length) % banners.length; update(); };

  dots.addEventListener('click', e => {
    if (e.target.classList.contains('carousel-dot')) goTo(Number(e.target.dataset.index));
  });

  let interval = setInterval(() => goTo(current + 1), 4500);
  const hero = $('#heroCarousel');
  hero?.addEventListener('pointerenter', () => clearInterval(interval), { passive: true });
  hero?.addEventListener('pointerleave', () => { interval = setInterval(() => goTo(current + 1), 4500); }, { passive: true });
  update();
}

// ─── Home Categories (horizontal chips) ───
function renderCategories() {
  const grid = $('#categoryGrid');
  if (!grid) return;
  const fragment = document.createDocumentFragment();
  categories.forEach(c => {
    const a = document.createElement('a');
    a.href = '#';
    a.className = `category-item ${c.id === state.selectedCategoryId ? 'active' : ''}`;
    a.dataset.id = c.id;
    a.innerHTML = `
      <div class="category-icon"><span class="material-icons-round">${c.icon}</span></div>
      <span>${c.name}</span>
    `;
    fragment.appendChild(a);
  });
  grid.replaceChildren(fragment);
  grid.addEventListener('click', e => {
    const item = e.target.closest('.category-item');
    if (!item) return;
    e.preventDefault();
    state.selectedCategoryId = Number(item.dataset.id);
    renderCategories();
    renderFilteredProducts();
  });
}

// ─── Products ───
function renderProducts() {
  const flashContainer = $('#flashProducts');
  if (flashContainer) {
    const fragment = document.createDocumentFragment();
    state.flashProducts.forEach(p => fragment.appendChild(createProductCard(p)));
    flashContainer.replaceChildren(fragment);
    bindProductCards(flashContainer);
  }
  renderFilteredProducts();
}

function filterProducts() {
  let list = [...state.products];
  if (state.selectedCategoryId !== 0) list = list.filter(p => p.categoryId === state.selectedCategoryId);
  if (state.searchQuery) list = list.filter(p => p.title.toLowerCase().includes(state.searchQuery));
  return list;
}

function renderFilteredProducts() {
  const grid = $('#productsGrid');
  if (!grid) return;
  const list = filterProducts();
  const fragment = document.createDocumentFragment();
  list.forEach(p => fragment.appendChild(createProductCard(p)));
  grid.replaceChildren(fragment);
  bindProductCards(grid);
  const h2 = document.querySelector('.products-section .section-header h2');
  if (h2) {
    h2.textContent = state.selectedCategoryId === 0
      ? 'Pour vous'
      : (categories.find(c => c.id === state.selectedCategoryId)?.name || 'Tous');
  }
}

function loadMore() {
  const more = generateProducts(8, state.products.length + 1);
  state.products.push(...more);
  more.forEach(p => productById.set(p.id, p));
  const grid = $('#productsGrid');
  const fragment = document.createDocumentFragment();
  more.forEach(p => fragment.appendChild(createProductCard(p)));
  grid.appendChild(fragment);
  bindProductCards(grid);
  showToast(`${more.length} produits ajoutés`);
}

// ─── Countdown (shared timer) ───
function startCountdowns() {
  let homeTotal = 2 * 3600 + 14 * 60 + 38;
  setInterval(() => {
    homeTotal = homeTotal > 0 ? homeTotal - 1 : 2 * 3600 + 14 * 60 + 38;
    const h = String(Math.floor(homeTotal / 3600)).padStart(2, '0');
    const m = String(Math.floor((homeTotal % 3600) / 60)).padStart(2, '0');
    const s = String(homeTotal % 60).padStart(2, '0');
    const el = $('#countdown');
    if (el) el.textContent = `${h}:${m}:${s}`;

    // Offers countdown
    offersCountdownTotal = offersCountdownTotal > 0 ? offersCountdownTotal - 1 : 5 * 3600 + 22 * 60 + 14;
    updateOffersCountdown();
  }, 1000);
}

// ─── Similar items recommendation (same universe/category) ───
function renderSimilarItems(currentItem) {
  const universe = currentItem.universe || 'shopping';
  let pool = [];
  if (universe === 'shopping') {
    pool = allProducts.filter(p => p.categoryId === currentItem.categoryId && p.id !== currentItem.id).slice(0, 4);
  } else {
    pool = getUniverseItems(universe).filter(i => i.id !== currentItem.id).slice(0, 4);
  }
  if (!pool.length) return '';
  const title = { shopping:'Produits similaires', immo:'Biens similaires', taxi:'Autres chauffeurs', emploi:'Offres similaires', resto:'Plats similaires' }[universe] || 'Similaires';
  let html = `<div style="padding:18px 16px 0"><strong style="font-size:15px;font-weight:800">${title}</strong></div><div style="display:flex;gap:10px;overflow-x:auto;padding:12px 16px 0;scrollbar-width:none;">`;
  pool.forEach(item => {
    html += `<div data-sim-id="${item.id}" data-sim-universe="${universe}" style="min-width:130px;background:#f8f8f8;border-radius:12px;overflow:hidden;cursor:pointer;flex-shrink:0;border:1px solid rgba(0,0,0,0.06)">
      <img src="${item.image}" alt="${item.title}" style="width:100%;height:90px;object-fit:cover;display:block" loading="lazy">
      <div style="padding:8px 8px 10px">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${item.title}</p>
        <span style="font-size:12px;font-weight:900;color:var(--alert)">${universe==='emploi'?item.salary:formatPrice(item.price)}</span>
      </div>
    </div>`;
  });
  html += '</div>';
  return html;
}

// ─── Init ───
function init() {
  applyUniverseTheme(state.currentUniverse);
  renderCarousel();
  renderCategories();
  renderProducts();
  renderAllUniverseSections();
  startCountdowns();
  initCatSearch();
  renderAccountTab();

  $('#loadMore')?.addEventListener('click', loadMore);
  $('#schoolBtn')?.addEventListener('click', () => showToast('Section École bientôt disponible'));

  // Drawer
  $('#menuBtn')?.addEventListener('click', openDrawer);
  $$('.menu-btn').forEach(btn => btn.addEventListener('click', openDrawer));
  $('#drawerOverlay')?.addEventListener('click', closeDrawer);
  $('#drawerClose')?.addEventListener('click', closeDrawer);

  // Search overlay
  $('#homeSearchBar')?.addEventListener('click', openSearchOverlay);
  $('#searchInput')?.addEventListener('focus', openSearchOverlay);
  $('#searchOverlayClose')?.addEventListener('click', closeSearchOverlay);
  $('#searchOverlayInput')?.addEventListener('input', debounce(e => {
    renderSearchResults(e.target.value);
  }, 200));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSearchOverlay(); closeDrawer(); closePublishModal(); } });

  // Publish FAB
  $('#publishFab')?.addEventListener('click', openPublishModal);
  $('#publishClose')?.addEventListener('click', closePublishModal);
  $('#publishOverlay')?.addEventListener('click', e => { if (e.target === $('#publishOverlay')) closePublishModal(); });

  // All cart buttons
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', openCartView);
  });

  // Bottom nav
  $$('.bottom-nav .nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      switchTab(item.dataset.tab);
    });
  });

  // serviceWorker registration
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('js/sw.js').catch(() => {});

  updateBadge();
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();