/* ============================================================
   DIGITAL CLOSET — script.js
   Pure Vanilla JavaScript: ES6+, localStorage, DOM Manipulation
   ============================================================ */

/* ============================================================
   SECTION 1: STATE & CONSTANTS
   ============================================================ */

const KEYS = {
  USERS:         'dc_users',
  CURRENT_USER:  'dc_current_user',
  CLOTHES:       'dc_clothes',
  OUTFITS:       'dc_outfits',
  DARK_MODE:     'dc_dark_mode',
};

const CATEGORY_EMOJI = {
  Top:       '👕',
  Bottom:    '👖',
  Shoes:     '👟',
  Jacket:    '🧥',
  Accessory: '💍',
};

let activeFilter = 'All';
let searchQuery  = '';
let currentGeneratedOutfit = null;

// Build outfit selections
let buildSelections = {
  top:         null,
  bottom:      null,
  shoes:       null,
  jacket:      null,
  accessories: [],
};

// Pending base64 image for add/edit form
let pendingImageBase64 = null;

/* ============================================================
   SECTION 2: LOCALSTORAGE HELPERS
   ============================================================ */

function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ============================================================
   SECTION 3: AUTH HELPERS
   ============================================================ */

function getCurrentUser() { return lsGet(KEYS.CURRENT_USER, null); }
function setCurrentUser(user) { lsSet(KEYS.CURRENT_USER, user); }
function clearCurrentUser() { localStorage.removeItem(KEYS.CURRENT_USER); }

function findUserByEmail(email) {
  const users = lsGet(KEYS.USERS, []);
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function registerUser({ username, email, password }) {
  const users = lsGet(KEYS.USERS, []);
  if (findUserByEmail(email)) return { ok: false, message: 'An account with this email already exists.' };
  const newUser = { id: uid(), username, email, password };
  users.push(newUser);
  lsSet(KEYS.USERS, users);
  return { ok: true, user: newUser };
}

function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user)                  return { ok: false, message: 'No account found with this email.' };
  if (user.password !== password) return { ok: false, message: 'Incorrect password.' };
  return { ok: true, user };
}

/* ============================================================
   SECTION 4: CLOTHING CRUD
   ============================================================ */

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function getClothes() {
  const user = getCurrentUser();
  if (!user) return [];
  const all = lsGet(KEYS.CLOTHES, {});
  return all[user.id] || [];
}

function saveClothes(items) {
  const user = getCurrentUser();
  if (!user) return;
  const all = lsGet(KEYS.CLOTHES, {});
  all[user.id] = items;
  lsSet(KEYS.CLOTHES, all);
}

function addClothingItem(data) {
  const items = getClothes();
  const newItem = { id: uid(), ...data, createdAt: Date.now() };
  items.push(newItem);
  saveClothes(items);
  return newItem;
}

function updateClothingItem(id, data) {
  const items = getClothes().map(item =>
    item.id === id ? { ...item, ...data, updatedAt: Date.now() } : item
  );
  saveClothes(items);
}

function deleteClothingItem(id) {
  saveClothes(getClothes().filter(item => item.id !== id));
}

function getClothingById(id) {
  return getClothes().find(item => item.id === id) || null;
}

/* ============================================================
   SECTION 5: OUTFIT CRUD
   ============================================================ */

function getOutfits() {
  const user = getCurrentUser();
  if (!user) return [];
  const all = lsGet(KEYS.OUTFITS, {});
  return all[user.id] || [];
}

function saveOutfitsToStorage(outfits) {
  const user = getCurrentUser();
  if (!user) return;
  const all = lsGet(KEYS.OUTFITS, {});
  all[user.id] = outfits;
  lsSet(KEYS.OUTFITS, all);
}

// Outfit structure: { top: {}, bottom: {}, shoes: {}, jacket: {}, accessories: [] }
function saveOutfit(outfit) {
  const outfits = getOutfits();
  const newOutfit = { id: uid(), ...outfit, savedAt: Date.now() };
  outfits.push(newOutfit);
  saveOutfitsToStorage(outfits);
  return newOutfit;
}

function deleteOutfit(id) {
  saveOutfitsToStorage(getOutfits().filter(o => o.id !== id));
}

/* ============================================================
   SECTION 6: DARK MODE
   ============================================================ */

function applyDarkMode(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  const icon = document.getElementById('dark-icon');
  if (icon) icon.textContent = isDark ? '☀' : '☽';
  lsSet(KEYS.DARK_MODE, isDark);
}

function loadDarkMode() {
  applyDarkMode(lsGet(KEYS.DARK_MODE, false));
}

/* ============================================================
   SECTION 7: TOAST NOTIFICATION
   ============================================================ */

let toastTimer = null;

function showToast(message, type = '', duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.className = 'toast';
  if (type) toast.classList.add(type);
  toast.textContent = message;
  toast.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), duration);
}

/* ============================================================
   SECTION 8: PAGE NAVIGATION
   ============================================================ */

function navigateTo(pageName) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.add('hidden');
    p.classList.remove('active');
  });

  const target = document.getElementById(`page-${pageName}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageName);
  });

  closeMobileMenu();

  switch (pageName) {
    case 'dashboard':        renderDashboard();        break;
    case 'closet':           renderCloset();           break;
    case 'add-item':         setupAddItemPage(null);   break;
    case 'outfit-generator': setupOutfitGenerator();   break;
    case 'build-outfit':     setupBuildOutfit();       break;
    case 'ai-tryon':         setupAiTryOn();           break;
    case 'saved-outfits':    renderSavedOutfits();     break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   SECTION 9: DASHBOARD
   ============================================================ */

function renderDashboard() {
  const user    = getCurrentUser();
  const clothes = getClothes();
  const outfits = getOutfits();

  const name = document.getElementById('dashboard-user-name');
  if (name) name.textContent = user ? user.username : 'there';

  setText('stat-total-clothes', clothes.length);
  setText('stat-total-outfits', outfits.length);
  setText('stat-tops',    clothes.filter(c => c.category === 'Top').length);
  setText('stat-bottoms', clothes.filter(c => c.category === 'Bottom').length);
}

/* ============================================================
   SECTION 10: CLOSET PAGE
   ============================================================ */

function renderCloset() {
  const grid       = document.getElementById('clothes-grid');
  const emptyState = document.getElementById('closet-empty');
  if (!grid) return;

  const clothes = getClothes();

  let filtered = activeFilter === 'All'
    ? clothes
    : clothes.filter(c => c.category === activeFilter);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q));
  }

  grid.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach((item, i) => {
    const card = buildClothingCard(item, i);
    grid.appendChild(card);
  });
}

function buildClothingCard(item, index) {
  const card = document.createElement('div');
  card.className = 'clothing-card';
  card.style.animationDelay = `${index * 0.05}s`;

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img-wrap';

  if (item.imageBase64 || item.imageUrl) {
    const img = document.createElement('img');
    img.src = item.imageBase64 || item.imageUrl;
    img.alt = item.name;
    img.loading = 'lazy';
    img.onerror = () => {
      imgWrap.innerHTML = `<div class="card-placeholder">${CATEGORY_EMOJI[item.category] || '👗'}</div>`;
    };
    imgWrap.appendChild(img);
  } else {
    imgWrap.innerHTML = `<div class="card-placeholder">${CATEGORY_EMOJI[item.category] || '👗'}</div>`;
  }

  const body = document.createElement('div');
  body.className = 'card-body';
  body.innerHTML = `
    <div class="card-name">${escHtml(item.name)}</div>
    <div class="card-meta">
      <span class="card-tag">${escHtml(item.category)}</span>
      <span class="card-tag accent">${escHtml(item.season)}</span>
      <span class="card-tag">
        <span class="card-color-dot" style="background:${cssColor(item.color)}"></span>
        ${escHtml(item.color)}
      </span>
    </div>
  `;

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-ghost';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => openEditItem(item.id));

  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn-danger';
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => handleDeleteClothing(item.id));

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  card.appendChild(imgWrap);
  card.appendChild(body);
  card.appendChild(actions);

  return card;
}

/* ============================================================
   SECTION 11: ADD / EDIT ITEM PAGE (with file upload)
   ============================================================ */

function setupAddItemPage(itemId) {
  const form      = document.getElementById('clothing-form');
  const titleEl   = document.getElementById('add-item-title');
  const cancelBtn = document.getElementById('cancel-edit-btn');

  form.reset();
  clearFieldErrors();
  document.getElementById('edit-item-id').value = '';
  document.getElementById('image-preview').classList.add('hidden');
  pendingImageBase64 = null;

  // Reset file label text
  const fileLabel = document.querySelector('.file-upload-text');
  if (fileLabel) fileLabel.textContent = 'Choose an image…';

  if (itemId) {
    const item = getClothingById(itemId);
    if (!item) return;

    titleEl.textContent = 'Edit Clothing Item';
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('item-name').value     = item.name;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-color').value    = item.color;
    document.getElementById('item-season').value   = item.season;

    // Show existing image if available
    const existingImg = item.imageBase64 || item.imageUrl;
    if (existingImg) {
      pendingImageBase64 = existingImg;
      showImagePreviewSrc(existingImg);
      if (fileLabel) fileLabel.textContent = 'Image loaded — choose another to replace';
    }

    cancelBtn.classList.remove('hidden');
  } else {
    titleEl.textContent = 'Add Clothing Item';
    cancelBtn.classList.add('hidden');
  }
}

function openEditItem(itemId) {
  navigateTo('add-item');
  setupAddItemPage(itemId);
}

function showImagePreviewSrc(src) {
  const preview = document.getElementById('image-preview');
  if (!preview) return;
  preview.src = src;
  preview.classList.remove('hidden');
}

function handleClothingFormSubmit(e) {
  e.preventDefault();
  clearFieldErrors();

  const id       = document.getElementById('edit-item-id').value.trim();
  const name     = document.getElementById('item-name').value.trim();
  const category = document.getElementById('item-category').value;
  const color    = document.getElementById('item-color').value.trim();
  const season   = document.getElementById('item-season').value;

  let isValid = true;

  if (!name) {
    showFieldError('item-name-error', 'Please enter a clothing name.');
    isValid = false;
  }
  if (!category) {
    showFieldError('item-category-error', 'Please select a category.');
    isValid = false;
  }
  if (!color) {
    showFieldError('item-color-error', 'Please enter a color.');
    isValid = false;
  }
  if (!season) {
    showFieldError('item-season-error', 'Please select a season.');
    isValid = false;
  }

  if (!isValid) return;

  const data = { name, category, color, season, imageBase64: pendingImageBase64 || null };

  if (id) {
    updateClothingItem(id, data);
    showToast('Item updated successfully!', 'success');
  } else {
    addClothingItem(data);
    showToast('Item added to your closet!', 'success');
  }

  pendingImageBase64 = null;
  navigateTo('closet');
}

/* ============================================================
   SECTION 12: OUTFIT GENERATOR
   ============================================================ */

function setupOutfitGenerator() {
  currentGeneratedOutfit = null;
  const saveBtn    = document.getElementById('save-outfit-btn');
  const outfitDisp = document.getElementById('outfit-display');
  const emptyState = document.getElementById('generator-empty');

  if (saveBtn)    saveBtn.classList.add('hidden');
  if (outfitDisp) outfitDisp.classList.add('hidden');
  if (emptyState) emptyState.classList.add('hidden');
}

function handleGenerateOutfit() {
  const clothes = getClothes();

  const tops    = clothes.filter(c => c.category === 'Top');
  const bottoms = clothes.filter(c => c.category === 'Bottom');
  const shoes   = clothes.filter(c => c.category === 'Shoes');

  const outfitDisplay = document.getElementById('outfit-display');
  const emptyState    = document.getElementById('generator-empty');
  const saveBtn       = document.getElementById('save-outfit-btn');
  const outfitCards   = document.getElementById('outfit-cards');

  if (!tops.length || !bottoms.length || !shoes.length) {
    outfitDisplay.classList.add('hidden');
    emptyState.classList.remove('hidden');
    saveBtn.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  const top    = tops[Math.floor(Math.random() * tops.length)];
  const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
  const shoe   = shoes[Math.floor(Math.random() * shoes.length)];

  // Pick optional jacket & accessory
  const jackets     = clothes.filter(c => c.category === 'Jacket');
  const accessories = clothes.filter(c => c.category === 'Accessory');
  const jacket = jackets.length > 0 && Math.random() > 0.5
    ? jackets[Math.floor(Math.random() * jackets.length)]
    : null;
  const accessory = accessories.length > 0 && Math.random() > 0.5
    ? accessories[Math.floor(Math.random() * accessories.length)]
    : null;

  currentGeneratedOutfit = {
    top,
    bottom,
    shoes: shoe,
    jacket: jacket || null,
    accessories: accessory ? [accessory] : [],
  };

  outfitCards.innerHTML = '';
  const pieces = [
    { label: '👕 Top',    item: top    },
    { label: '👖 Bottom', item: bottom },
    { label: '👟 Shoes',  item: shoe   },
  ];
  if (jacket)     pieces.push({ label: '🧥 Jacket',    item: jacket });
  if (accessory)  pieces.push({ label: '💍 Accessory', item: accessory });

  pieces.forEach(({ label, item }) => {
    outfitCards.appendChild(buildOutfitItemCard(label, item));
  });

  outfitDisplay.classList.remove('hidden');
  saveBtn.classList.remove('hidden');
}

function buildOutfitItemCard(label, item) {
  const card = document.createElement('div');
  card.className = 'outfit-item-card';

  const labelEl = document.createElement('div');
  labelEl.className = 'outfit-item-label';
  labelEl.textContent = label;

  const inner = buildClothingCard(item, 0);
  const actions = inner.querySelector('.card-actions');
  if (actions) actions.remove();

  card.appendChild(labelEl);
  card.appendChild(inner);

  return card;
}

function handleSaveOutfit() {
  if (!currentGeneratedOutfit) return;

  saveOutfit(currentGeneratedOutfit);
  showToast('Outfit saved!', 'success');

  currentGeneratedOutfit = null;
  document.getElementById('save-outfit-btn').classList.add('hidden');
  document.getElementById('outfit-display').classList.add('hidden');
  updateDashboardStats();
}

/* ============================================================
   SECTION 13: BUILD YOUR OWN OUTFIT PAGE
   ============================================================ */

function setupBuildOutfit() {
  // Reset selections
  buildSelections = { top: null, bottom: null, shoes: null, jacket: null, accessories: [] };

  const content = document.getElementById('build-outfit-content');
  const preview = document.getElementById('build-outfit-preview');
  const empty   = document.getElementById('build-outfit-empty');

  if (preview) preview.classList.add('hidden');
  if (empty)   empty.classList.add('hidden');

  const clothes = getClothes();
  const tops    = clothes.filter(c => c.category === 'Top');
  const bottoms = clothes.filter(c => c.category === 'Bottom');
  const shoes   = clothes.filter(c => c.category === 'Shoes');

  if (!tops.length || !bottoms.length || !shoes.length) {
    if (content) content.innerHTML = '';
    if (empty)   empty.classList.remove('hidden');
    return;
  }

  if (!content) return;
  content.innerHTML = '';

  // Tops section (select 1)
  content.appendChild(buildSelectSection('top', 'Tops', tops, 'Required — choose 1', false));
  // Bottoms section (select 1)
  content.appendChild(buildSelectSection('bottom', 'Bottoms', bottoms, 'Required — choose 1', false));
  // Shoes section (select 1)
  content.appendChild(buildSelectSection('shoes', 'Shoes', shoes, 'Required — choose 1', false));

  const jackets     = clothes.filter(c => c.category === 'Jacket');
  const accessories = clothes.filter(c => c.category === 'Accessory');

  if (jackets.length) {
    content.appendChild(buildSelectSection('jacket', 'Jackets', jackets, 'Optional — max 1', false));
  }
  if (accessories.length) {
    content.appendChild(buildSelectSection('accessories', 'Accessories', accessories, 'Optional — select multiple', true));
  }

  // Create Outfit button
  const createWrap = document.createElement('div');
  createWrap.className = 'build-outfit-create';
  const createBtn = document.createElement('button');
  createBtn.className = 'btn btn-primary';
  createBtn.style.cssText = 'padding:14px 48px;font-size:1rem;';
  createBtn.textContent = '✦ Create Outfit';
  createBtn.addEventListener('click', handleCreateBuiltOutfit);
  createWrap.appendChild(createBtn);
  content.appendChild(createWrap);
}

function buildSelectSection(type, title, items, hint, multi) {
  const section = document.createElement('div');
  section.className = 'build-outfit-section';

  const header = document.createElement('div');
  header.className = 'build-section-header';
  header.innerHTML = `
    <span class="build-section-badge">${multi ? 'Multi' : '1'}</span>
    <span class="build-section-title">${title}</span>
    <span class="build-section-hint">${hint}</span>
  `;

  const grid = document.createElement('div');
  grid.className = 'build-items-grid';

  items.forEach((item, i) => {
    const card = buildSelectableCard(item, i, type, multi);
    grid.appendChild(card);
  });

  section.appendChild(header);
  section.appendChild(grid);
  return section;
}

function buildSelectableCard(item, index, type, multi) {
  const card = document.createElement('div');
  card.className = 'selectable-card';
  card.style.animationDelay = `${index * 0.05}s`;
  card.dataset.id = item.id;
  card.dataset.type = type;

  // Image
  const imgWrap = document.createElement('div');
  imgWrap.className = 'selectable-img-wrap';

  if (item.imageBase64 || item.imageUrl) {
    const img = document.createElement('img');
    img.src = item.imageBase64 || item.imageUrl;
    img.alt = item.name;
    img.loading = 'lazy';
    img.onerror = () => {
      imgWrap.innerHTML = `<div class="selectable-placeholder">${CATEGORY_EMOJI[item.category] || '👗'}</div>`;
    };
    imgWrap.appendChild(img);
  } else {
    imgWrap.innerHTML = `<div class="selectable-placeholder">${CATEGORY_EMOJI[item.category] || '👗'}</div>`;
  }

  const body = document.createElement('div');
  body.className = 'selectable-body';
  body.innerHTML = `
    <div class="selectable-name">${escHtml(item.name)}</div>
    <div class="selectable-meta">${escHtml(item.color)} · ${escHtml(item.season)}</div>
  `;

  card.appendChild(imgWrap);
  card.appendChild(body);

  card.addEventListener('click', () => {
    if (multi) {
      // Toggle accessories
      const idx = buildSelections.accessories.findIndex(a => a.id === item.id);
      if (idx > -1) {
        buildSelections.accessories.splice(idx, 1);
        card.classList.remove('selected');
      } else {
        buildSelections.accessories.push(item);
        card.classList.add('selected');
      }
    } else if (type === 'jacket') {
      // Toggle jacket (optional, max 1)
      if (buildSelections.jacket && buildSelections.jacket.id === item.id) {
        buildSelections.jacket = null;
        card.classList.remove('selected');
      } else {
        // Deselect previous jacket card
        document.querySelectorAll(`.selectable-card[data-type="jacket"]`).forEach(c => c.classList.remove('selected'));
        buildSelections.jacket = item;
        card.classList.add('selected');
      }
    } else {
      // Required single selection
      document.querySelectorAll(`.selectable-card[data-type="${type}"]`).forEach(c => c.classList.remove('selected'));
      buildSelections[type] = item;
      card.classList.add('selected');
    }
  });

  return card;
}

function handleCreateBuiltOutfit() {
  if (!buildSelections.top || !buildSelections.bottom || !buildSelections.shoes) {
    showToast('Please select a Top, Bottom, and Shoes.', 'error');
    return;
  }

  // Hide builder, show preview
  const content = document.getElementById('build-outfit-content');
  const preview = document.getElementById('build-outfit-preview');
  const result  = document.getElementById('build-outfit-result');

  if (content) content.classList.add('hidden');
  if (preview) preview.classList.remove('hidden');
  if (result)  result.innerHTML = '';

  const pieces = [
    { label: '👕 Top',    item: buildSelections.top },
    { label: '👖 Bottom', item: buildSelections.bottom },
    { label: '👟 Shoes',  item: buildSelections.shoes },
  ];
  if (buildSelections.jacket) {
    pieces.push({ label: '🧥 Jacket', item: buildSelections.jacket });
  }
  buildSelections.accessories.forEach(acc => {
    pieces.push({ label: '💍 Accessory', item: acc });
  });

  pieces.forEach(({ label, item }) => {
    result.appendChild(buildOutfitItemCard(label, item));
  });
}

function handleSaveBuiltOutfit() {
  if (!buildSelections.top || !buildSelections.bottom || !buildSelections.shoes) return;

  const outfit = {
    top:         buildSelections.top,
    bottom:      buildSelections.bottom,
    shoes:       buildSelections.shoes,
    jacket:      buildSelections.jacket || null,
    accessories: [...buildSelections.accessories],
  };

  saveOutfit(outfit);
  showToast('Outfit saved!', 'success');
  updateDashboardStats();
  navigateTo('saved-outfits');
}

/* ============================================================
   SECTION 14: SAVED OUTFITS
   ============================================================ */

function renderSavedOutfits() {
  const grid       = document.getElementById('outfits-grid');
  const emptyState = document.getElementById('outfits-empty');
  if (!grid) return;

  const outfits = getOutfits();
  grid.innerHTML = '';

  if (outfits.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  outfits.forEach((outfit, i) => {
    const card = buildSavedOutfitCard(outfit, i);
    grid.appendChild(card);
  });
}

function buildSavedOutfitCard(outfit, index) {
  const card = document.createElement('div');
  card.className = 'saved-outfit-card';
  card.style.animationDelay = `${index * 0.06}s`;

  const date = new Date(outfit.savedAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const header = document.createElement('div');
  header.className = 'saved-outfit-header';
  header.innerHTML = `
    <span class="saved-outfit-title">✦ Outfit #${index + 1}</span>
    <span style="font-size:.78rem;opacity:.8">${date}</span>
  `;

  const list = document.createElement('div');
  list.className = 'outfit-items-list';

  // Support both new structure {top, bottom, shoes, jacket, accessories}
  // and legacy structure {topId, bottomId, shoesId}
  const pieces = [];

  if (outfit.top) {
    pieces.push({ label: 'Top',    item: outfit.top });
    pieces.push({ label: 'Bottom', item: outfit.bottom });
    pieces.push({ label: 'Shoes',  item: outfit.shoes });
    if (outfit.jacket) {
      pieces.push({ label: 'Jacket', item: outfit.jacket });
    }
    if (outfit.accessories && outfit.accessories.length) {
      outfit.accessories.forEach(acc => pieces.push({ label: 'Accessory', item: acc }));
    }
  } else {
    // Legacy: look up by id
    const clothes = getClothes();
    const findItem = id => clothes.find(c => c.id === id) || null;
    pieces.push({ label: 'Top',    item: findItem(outfit.topId) });
    pieces.push({ label: 'Bottom', item: findItem(outfit.bottomId) });
    pieces.push({ label: 'Shoes',  item: findItem(outfit.shoesId) });
  }

  pieces.forEach(({ label, item }) => {
    list.appendChild(buildOutfitMiniItem(label, item));
  });

  const footer = document.createElement('div');
  footer.className = 'saved-outfit-footer';

  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn-danger btn-sm';
  delBtn.textContent = 'Delete Outfit';
  delBtn.addEventListener('click', () => {
    deleteOutfit(outfit.id);
    showToast('Outfit deleted.', '');
    renderSavedOutfits();
    updateDashboardStats();
  });

  footer.appendChild(delBtn);

  card.appendChild(header);
  card.appendChild(list);
  card.appendChild(footer);

  return card;
}

function buildOutfitMiniItem(label, item) {
  const row = document.createElement('div');
  row.className = 'outfit-mini-item';

  if (item) {
    const imgSrc = item.imageBase64 || item.imageUrl;
    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = item.name;
      img.loading = 'lazy';
      img.onerror = () => { img.replaceWith(makeMiniPlaceholder(item.category)); };
      row.appendChild(img);
    } else {
      row.appendChild(makeMiniPlaceholder(item.category));
    }

    const info = document.createElement('div');
    info.className = 'outfit-mini-info';
    info.innerHTML = `
      <div class="outfit-mini-name">${escHtml(item.name)}</div>
      <div class="outfit-mini-cat">${escHtml(label)} · ${escHtml(item.color)}</div>
    `;
    row.appendChild(info);
  } else {
    row.innerHTML = `
      <div class="outfit-mini-placeholder">❓</div>
      <div class="outfit-mini-info">
        <div class="outfit-mini-name" style="color:var(--clr-text-muted)">(Item removed)</div>
        <div class="outfit-mini-cat">${escHtml(label)}</div>
      </div>
    `;
  }

  return row;
}

function makeMiniPlaceholder(category) {
  const el = document.createElement('div');
  el.className = 'outfit-mini-placeholder';
  el.textContent = CATEGORY_EMOJI[category] || '👗';
  return el;
}

/* ============================================================
   SECTION 15: AI VIRTUAL TRY-ON PAGE
   ============================================================ */

function setupAiTryOn() {
  const clothes = getClothes();

  const populateSelect = (selectId, category) => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const items = clothes.filter(c => c.category === category);
    // Keep default option, remove old items
    while (sel.options.length > 1) sel.remove(1);
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      sel.appendChild(opt);
    });
  };

  populateSelect('ai-top-select',    'Top');
  populateSelect('ai-bottom-select', 'Bottom');
  populateSelect('ai-shoes-select',  'Shoes');
  populateSelect('ai-jacket-select', 'Jacket');

  // Accessories chips
  const accList = document.getElementById('ai-accessories-list');
  if (accList) {
    accList.innerHTML = '';
    const accessories = clothes.filter(c => c.category === 'Accessory');
    if (accessories.length === 0) {
      accList.innerHTML = '<p class="ai-no-items">No accessories in your closet.</p>';
    } else {
      accessories.forEach(item => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'ai-accessory-chip';
        chip.textContent = item.name;
        chip.dataset.id = item.id;
        chip.addEventListener('click', () => chip.classList.toggle('selected'));
        accList.appendChild(chip);
      });
    }
  }

  // Hide previous result
  const result = document.getElementById('ai-result');
  if (result) result.classList.add('hidden');

  // AI photo upload handler
  const aiPhotoInput = document.getElementById('ai-photo-input');
  if (aiPhotoInput) {
    aiPhotoInput.onchange = null; // reset
    aiPhotoInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const previewWrap = document.getElementById('ai-photo-preview-wrap');
        const preview     = document.getElementById('ai-photo-preview');
        if (preview) preview.src = ev.target.result;
        if (previewWrap) previewWrap.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    });
  }

  const clearBtn = document.getElementById('ai-photo-clear');
  if (clearBtn) {
    clearBtn.onclick = null;
    clearBtn.addEventListener('click', () => {
      const previewWrap = document.getElementById('ai-photo-preview-wrap');
      const photoInput  = document.getElementById('ai-photo-input');
      if (previewWrap) previewWrap.classList.add('hidden');
      if (photoInput)  photoInput.value = '';
    });
  }
}

function handleAiGenerate() {
  const clothes = getClothes();
  const findById = id => clothes.find(c => c.id === id) || null;

  const topId    = document.getElementById('ai-top-select')?.value;
  const bottomId = document.getElementById('ai-bottom-select')?.value;
  const shoesId  = document.getElementById('ai-shoes-select')?.value;
  const jacketId = document.getElementById('ai-jacket-select')?.value;

  const selectedAccChips = document.querySelectorAll('.ai-accessory-chip.selected');
  const selectedAccNames = [...selectedAccChips].map(c => c.textContent);

  const result      = document.getElementById('ai-result');
  const resultItems = document.getElementById('ai-result-items');

  if (resultItems) {
    resultItems.innerHTML = '';

    const addChip = (label, id) => {
      if (!id) return;
      const item = findById(id);
      if (!item) return;
      const chip = document.createElement('div');
      chip.className = 'ai-result-item-chip';
      chip.innerHTML = `<span>${CATEGORY_EMOJI[item.category] || '👗'}</span> <span>${escHtml(label)}:</span> <strong>${escHtml(item.name)}</strong>`;
      resultItems.appendChild(chip);
    };

    addChip('Top', topId);
    addChip('Bottom', bottomId);
    addChip('Shoes', shoesId);
    addChip('Jacket', jacketId);

    selectedAccNames.forEach(name => {
      const chip = document.createElement('div');
      chip.className = 'ai-result-item-chip';
      chip.innerHTML = `<span>💍</span> <span>Accessory:</span> <strong>${escHtml(name)}</strong>`;
      resultItems.appendChild(chip);
    });
  }

  if (result) result.classList.remove('hidden');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ============================================================
   SECTION 16: FORM VALIDATION HELPERS
   ============================================================ */

function showFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   SECTION 17: AUTH FORM HANDLERS
   ============================================================ */

function handleLoginSubmit(e) {
  e.preventDefault();
  clearFieldErrors();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  let isValid    = true;

  if (!email) {
    showFieldError('login-email-error', 'Email is required.');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showFieldError('login-email-error', 'Enter a valid email address.');
    isValid = false;
  }
  if (!password) {
    showFieldError('login-password-error', 'Password is required.');
    isValid = false;
  }
  if (!isValid) return;

  const result = loginUser(email, password);
  if (result.ok) {
    setCurrentUser(result.user);
    showApp();
  } else {
    document.getElementById('login-form-error').textContent = result.message;
  }
}

function handleSignupSubmit(e) {
  e.preventDefault();
  clearFieldErrors();

  const username = document.getElementById('signup-username').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm  = document.getElementById('signup-confirm').value;
  let isValid    = true;

  if (!username || username.length < 2) {
    showFieldError('signup-username-error', 'Username must be at least 2 characters.');
    isValid = false;
  }
  if (!email) {
    showFieldError('signup-email-error', 'Email is required.');
    isValid = false;
  } else if (!isValidEmail(email)) {
    showFieldError('signup-email-error', 'Enter a valid email address.');
    isValid = false;
  }
  if (!password || password.length < 6) {
    showFieldError('signup-password-error', 'Password must be at least 6 characters.');
    isValid = false;
  }
  if (confirm !== password) {
    showFieldError('signup-confirm-error', 'Passwords do not match.');
    isValid = false;
  }
  if (!isValid) return;

  const result = registerUser({ username, email, password });
  if (result.ok) {
    setCurrentUser(result.user);
    showToast(`Welcome, ${username}! 🎉`, 'success');
    showApp();
  } else {
    document.getElementById('signup-form-error').textContent = result.message;
  }
}

/* ============================================================
   SECTION 18: APP LIFECYCLE
   ============================================================ */

function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  const user = getCurrentUser();
  const nameEl = document.getElementById('nav-user-name');
  if (nameEl && user) nameEl.textContent = user.username;

  navigateTo('dashboard');
}

function showAuth(screen = 'login') {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');

  document.getElementById('login-screen').classList.toggle('hidden', screen !== 'login');
  document.getElementById('signup-screen').classList.toggle('hidden', screen !== 'signup');
  clearFieldErrors();
}

function handleLogout() {
  clearCurrentUser();
  showToast('Signed out. See you soon!', '');
  showAuth('login');
}

function updateDashboardStats() {
  renderDashboard();
}

/* ============================================================
   SECTION 19: MOBILE MENU
   ============================================================ */

let mobileMenuOpen = false;

function toggleMobileMenu() {
  mobileMenuOpen = !mobileMenuOpen;
  document.getElementById('mobile-menu').classList.toggle('hidden', !mobileMenuOpen);
}

function closeMobileMenu() {
  mobileMenuOpen = false;
  document.getElementById('mobile-menu').classList.add('hidden');
}

/* ============================================================
   SECTION 20: UTILITY HELPERS
   ============================================================ */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cssColor(colorName) {
  const colorMap = {
    red: '#e74c3c', blue: '#3498db', green: '#27ae60', yellow: '#f1c40f',
    orange: '#e67e22', purple: '#9b59b6', pink: '#e91e63', black: '#1a1916',
    white: '#f5f3ef', grey: '#95a5a6', gray: '#95a5a6', brown: '#795548',
    navy: '#001f5b', beige: '#f5deb3', cream: '#fffdd0', ivory: '#fffff0',
  };
  const lower = (colorName || '').toLowerCase();
  return colorMap[lower] || colorName || '#ccc';
}

/* ============================================================
   SECTION 21: DELETE CLOTHING
   ============================================================ */

function handleDeleteClothing(id) {
  if (!confirm('Delete this item from your closet?')) return;
  deleteClothingItem(id);
  showToast('Item removed from your closet.', '');
  renderCloset();
  updateDashboardStats();
}

/* ============================================================
   SECTION 22: EVENT LISTENERS — INIT
   ============================================================ */

function initApp() {
  // ------- Auth -------
  document.getElementById('login-form')
    .addEventListener('submit', handleLoginSubmit);

  document.getElementById('signup-form')
    .addEventListener('submit', handleSignupSubmit);

  document.getElementById('go-to-signup')
    .addEventListener('click', e => { e.preventDefault(); showAuth('signup'); });

  document.getElementById('go-to-login')
    .addEventListener('click', e => { e.preventDefault(); showAuth('login'); });

  // ------- Logout -------
  document.getElementById('logout-btn')
    .addEventListener('click', handleLogout);

  const mobileLogout = document.getElementById('mobile-logout');
  if (mobileLogout) mobileLogout.addEventListener('click', e => { e.preventDefault(); handleLogout(); });

  // ------- Dark mode toggle -------
  document.getElementById('dark-toggle')
    .addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark-mode');
      applyDarkMode(isDark);
    });

  // ------- Desktop nav links -------
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  // ------- Mobile nav links -------
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      if (link.dataset.page) navigateTo(link.dataset.page);
    });
  });

  // ------- Hamburger -------
  document.getElementById('hamburger')
    .addEventListener('click', toggleMobileMenu);

  // ------- Quick action cards (dashboard) -------
  document.querySelectorAll('.action-card').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // ------- Clothing form (add/edit) -------
  document.getElementById('clothing-form')
    .addEventListener('submit', handleClothingFormSubmit);

  // File upload — read as base64
  document.getElementById('item-image-file')
    .addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;

      const fileLabel = document.querySelector('.file-upload-text');
      if (fileLabel) fileLabel.textContent = file.name;

      const reader = new FileReader();
      reader.onload = ev => {
        pendingImageBase64 = ev.target.result;
        showImagePreviewSrc(pendingImageBase64);
      };
      reader.readAsDataURL(file);
    });

  // Cancel edit button
  document.getElementById('cancel-edit-btn')
    .addEventListener('click', () => navigateTo('closet'));

  // ------- Search -------
  document.getElementById('search-input').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderCloset();
  });

  // ------- Category filter chips -------
  document.getElementById('filter-chips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    renderCloset();
  });

  // ------- Outfit generator -------
  document.getElementById('generate-btn')
    .addEventListener('click', handleGenerateOutfit);

  document.getElementById('save-outfit-btn')
    .addEventListener('click', handleSaveOutfit);

  // ------- Outfit generator navigation buttons -------
  document.getElementById('build-outfit-nav-btn')
    .addEventListener('click', () => navigateTo('build-outfit'));

  document.getElementById('ai-tryon-nav-btn')
    .addEventListener('click', () => navigateTo('ai-tryon'));

  // ------- Build outfit page -------
  document.getElementById('save-built-outfit-btn')
    .addEventListener('click', handleSaveBuiltOutfit);

  document.getElementById('rebuild-outfit-btn')
    .addEventListener('click', () => {
      document.getElementById('build-outfit-preview').classList.add('hidden');
      const content = document.getElementById('build-outfit-content');
      if (content) content.classList.remove('hidden');
      setupBuildOutfit();
    });

  // ------- AI Try-On generate button -------
  document.getElementById('ai-generate-btn')
    .addEventListener('click', handleAiGenerate);

  // ------- Empty state buttons -------
  document.getElementById('generator-empty')
    .querySelector('.btn[data-page]')
    ?.addEventListener('click', () => navigateTo('add-item'));

  document.getElementById('outfits-empty')
    .querySelector('.btn[data-page]')
    ?.addEventListener('click', () => navigateTo('outfit-generator'));

  document.getElementById('closet-empty')
    .querySelector('.btn[data-page]')
    ?.addEventListener('click', () => navigateTo('add-item'));

  document.getElementById('build-outfit-empty')
    .querySelector('.btn[data-page]')
    ?.addEventListener('click', () => navigateTo('add-item'));

  // ------- Close mobile menu when clicking outside -------
  document.addEventListener('click', e => {
    if (mobileMenuOpen && !e.target.closest('#mobile-menu') && !e.target.closest('#hamburger')) {
      closeMobileMenu();
    }
  });
}

/* ============================================================
   SECTION 23: BOOT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadDarkMode();
  initApp();

  const user = getCurrentUser();
  if (user) {
    showApp();
  } else {
    showAuth('login');
  }
});
