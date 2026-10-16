// ============================================================================
// দোকান খাতা (DokanKhata BD) — Fast Calculator + Optional POS + Receipt Engine
// ============================================================================

const STORAGE_KEY = 'dokankhata_shop_state_v2';

// Helper: Convert English numbers to Bangla digits for display
const enToBnDigits = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};
const bnToEnDigits = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

function toBanglaNum(num) {
  const n = Number(num) || 0;
  return n.toLocaleString('en-IN').replace(/[0-9]/g, d => enToBnDigits[d] || d);
}

function normalizeToEnglishDigits(str) {
  return String(str).replace(/[০-৯]/g, d => bnToEnDigits[d] || d);
}

// Initial Seed State for a Typical Bangladeshi Shopkeeper (with POS Products & Receipts)
const defaultShopState = {
  shopName: 'বিসমিল্লাহ মুদি ও ভ্যারাইটিজ স্টোর',
  shopAddress: 'চকবাজার মেইন রোড, ঢাকা • মোবাইল: ০১৭১১-২২৩৩৪৪',
  licenseKey: 'DOKAN-1500-DEMO',
  packageTitle: 'স্ট্যান্ডার্ড লাইফটাইম + POS (১,৫০০ ৳)',
  cloudBackupActive: true,
  lastSync: 'আজ রাত ৮:৩০',
  smsBalance: 485,
  selectedCustomerId: 'c1',
  selectedItemTag: '',
  showPosQuickStrip: true,
  autoShowReceipt: false,
  products: [
    { id: 'p1', name: 'মিনিকেট চাল (৫ কেজি)', price: 360, unit: 'বস্তা', icon: '🌾', stock: 25 },
    { id: 'p2', name: 'সয়াবিন তেল (১ লিটার)', price: 175, unit: 'বোতল', icon: '🛢️', stock: 40 },
    { id: 'p3', name: 'ফার্মের ডিম (১ হালি)', price: 55, unit: 'হালি', icon: '🥚', stock: 60 },
    { id: 'p4', name: 'লাক্স সাবান (মাঝারি)', price: 60, unit: 'পিস', icon: '🧼', stock: 35 },
    { id: 'p5', name: 'ফেসওয়াশ / ক্রিম', price: 220, unit: 'পিস', icon: '💄', stock: 18 },
    { id: 'p6', name: 'সুতি টি-শার্ট / পোশাক', price: 380, unit: 'পিস', icon: '👕', stock: 15 },
    { id: 'p7', name: 'চিনি (১ কেজি)', price: 135, unit: 'কেজি', icon: '🍚', stock: 50 }
  ],
  customers: [
    { id: 'c1', name: 'করিম ভাই (রিকশা গ্যারেজ)', phone: '01711334455', due: 450, lastUpdated: 'আজ সকাল ১০:১৫' },
    { id: 'c2', name: 'রহিম ভাবী (৩য় তলা)', phone: '01819223344', due: 1280, lastUpdated: 'গতকাল' },
    { id: 'c3', name: 'সুমন মেম্বার', phone: '01912556677', due: 850, lastUpdated: '৩ দিন আগে' },
    { id: 'c4', name: 'আকলিমা আপা (বিউটি পার্লার)', phone: '01611998877', due: 320, lastUpdated: 'আজ দুপুর ১:২০' },
    { id: 'c5', name: 'আল-আমিন ভাই (চায়ের দোকান)', phone: '01755667788', due: 0, lastUpdated: 'পরিশোধিত' }
  ],
  transactions: [
    {
      id: 'MEMO-1005',
      type: 'CASH_SALE',
      amount: 535,
      customerName: 'নগদ কাস্টমার',
      note: 'মিনিকেট চাল (৫ কেজি) x১, সয়াবিন তেল (১ লিটার) x১',
      items: [
        { name: 'মিনিকেট চাল (৫ কেজি)', qty: 1, price: 360, unit: 'বস্তা' },
        { name: 'সয়াবিন তেল (১ লিটার)', qty: 1, price: 175, unit: 'বোতল' }
      ],
      time: 'সকাল ০৯:৩০',
      date: '১৬ অক্টোবর ২০২৬'
    },
    {
      id: 'MEMO-1004',
      type: 'BAKI_GIVEN',
      amount: 450,
      customerId: 'c1',
      customerName: 'করিম ভাই (রিকশা গ্যারেজ)',
      customerPhone: '01711334455',
      previousDue: 0,
      newDue: 450,
      note: 'মুদি সদাই ও ডিম',
      items: [
        { name: 'মুদি সদাই ও ডিম', qty: 1, price: 450, unit: 'লট' }
      ],
      time: 'সকাল ১০:১৫',
      date: '১৬ অক্টোবর ২০২৬'
    },
    {
      id: 'MEMO-1003',
      type: 'BAKI_JAMA',
      amount: 500,
      customerId: 'c2',
      customerName: 'রহিম ভাবী (৩য় তলা)',
      customerPhone: '01819223344',
      previousDue: 1780,
      newDue: 1280,
      note: 'বাকি খাতা জমা',
      items: [
        { name: 'পূর্বের বাকি পরিশোধ (জমা)', qty: 1, price: 500, unit: '' }
      ],
      time: 'দুপুর ১২:১০',
      date: '১৬ অক্টোবর ২০২৬'
    },
    {
      id: 'MEMO-1002',
      type: 'CASH_SALE',
      amount: 280,
      customerName: 'নগদ কাস্টমার',
      note: 'ফেসওয়াশ / ক্রিম x১, লাক্স সাবান x১',
      items: [
        { name: 'ফেসওয়াশ / ক্রিম', qty: 1, price: 220, unit: 'পিস' },
        { name: 'লাক্স সাবান (মাঝারি)', qty: 1, price: 60, unit: 'পিস' }
      ],
      time: 'দুপুর ০১:৪৫',
      date: '১৬ অক্টোবর ২০২৬'
    },
    {
      id: 'MEMO-1001',
      type: 'EXPENSE',
      amount: 200,
      customerName: 'দোকান খরচ',
      note: 'ভ্যান ভাড়া ও চা-নাস্তা',
      items: [
        { name: 'ভ্যান ভাড়া ও চা-নাস্তা', qty: 1, price: 200, unit: '' }
      ],
      time: 'বিকাল ০৪:২০',
      date: '১৬ অক্টোবর ২০২৬'
    }
  ]
};

let shopState = loadShopState();
let calcExpr = '';
let activePosCart = []; // [{ id, name, price, unit, qty }]
let currentReceiptData = null;
let lastGeneratedLicenseKey = null;

function loadShopState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultShopState));
      return JSON.parse(JSON.stringify(defaultShopState));
    }
    const parsed = JSON.parse(raw);
    if (!parsed.products) parsed.products = defaultShopState.products;
    if (!parsed.shopAddress) parsed.shopAddress = defaultShopState.shopAddress;
    return parsed;
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultShopState));
  }
}

function saveShopState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shopState));
  renderAllShopUI();
}

// ============================================================================
// UI RENDERING
// ============================================================================

function renderAllShopUI() {
  // Header & License Info
  document.getElementById('uiShopName').textContent = shopState.shopName;
  document.getElementById('srvPackageTitle').textContent = shopState.packageTitle;
  document.getElementById('srvLicenseKey').textContent = shopState.licenseKey;
  document.getElementById('srvSmsBalance').textContent = toBanglaNum(shopState.smsBalance);
  document.getElementById('syncStatusText').textContent = shopState.cloudBackupActive ? 'সুরক্ষিত' : 'অফলাইন';

  const autoRcpCheckbox = document.getElementById('autoReceiptCheckbox');
  if (autoRcpCheckbox) autoRcpCheckbox.checked = Boolean(shopState.autoShowReceipt);

  const cloudBadge = document.getElementById('srvCloudBadge');
  if (shopState.cloudBackupActive) {
    cloudBadge.textContent = `চালু (${shopState.lastSync})`;
    cloudBadge.style.background = '#dcfce7';
    cloudBadge.style.color = '#166534';
  } else {
    cloudBadge.textContent = 'বন্ধ আছে';
    cloudBadge.style.background = '#fee2e2';
    cloudBadge.style.color = '#991b1b';
  }

  // Calculate Totals
  let todayCashSale = 0;
  let todayBakiGiven = 0;
  let todayBakiJama = 0;
  let todayExpense = 0;

  shopState.transactions.forEach(tx => {
    if (tx.type === 'CASH_SALE') todayCashSale += tx.amount;
    if (tx.type === 'BAKI_GIVEN') todayBakiGiven += tx.amount;
    if (tx.type === 'BAKI_JAMA') todayBakiJama += tx.amount;
    if (tx.type === 'EXPENSE') todayExpense += tx.amount;
  });

  const totalMarketBaki = shopState.customers.reduce((sum, c) => sum + (Number(c.due) || 0), 0);
  const netCashInHand = todayCashSale + todayBakiJama - todayExpense;

  // Top Summary Strip
  document.getElementById('sumTodayCash').textContent = '৳ ' + toBanglaNum(todayCashSale);
  document.getElementById('sumTotalBaki').textContent = '৳ ' + toBanglaNum(totalMarketBaki);
  document.getElementById('sumCashInHand').textContent = '৳ ' + toBanglaNum(netCashInHand);

  // Baki Badge count
  const bakiCustomersCount = shopState.customers.filter(c => c.due > 0).length;
  document.getElementById('navBakiCount').textContent = toBanglaNum(bakiCustomersCount);
  document.getElementById('bakiTabTotal').textContent = '৳ ' + toBanglaNum(totalMarketBaki);

  // Daily Khata Summary
  document.getElementById('khataCashSale').textContent = '৳ ' + toBanglaNum(todayCashSale);
  document.getElementById('khataBakiJama').textContent = '৳ ' + toBanglaNum(todayBakiJama);
  document.getElementById('khataBakiGiven').textContent = '৳ ' + toBanglaNum(todayBakiGiven);
  document.getElementById('khataExpense').textContent = '৳ ' + toBanglaNum(todayExpense);
  document.getElementById('khataNetCash').textContent = '৳ ' + toBanglaNum(netCashInHand);

  renderQuickPosStrip();
  renderPosProductCatalog();
  renderQuickCustomers();
  renderBakiCustomerList();
  renderTransactionTimeline();
}

// ============================================================================
// OPTIONAL POS PRODUCT SELECTION & CATALOG (পস পণ্য ও স্টক)
// ============================================================================

function togglePosQuickStrip() {
  shopState.showPosQuickStrip = !shopState.showPosQuickStrip;
  const strip = document.getElementById('posQuickStrip');
  const arrow = document.getElementById('posToggleArrow');
  if (shopState.showPosQuickStrip) {
    strip.classList.remove('hidden');
    arrow.textContent = '▾';
  } else {
    strip.classList.add('hidden');
    arrow.textContent = '▸';
  }
  saveShopState();
}

function toggleAutoReceipt(checked) {
  shopState.autoShowReceipt = checked;
  saveShopState();
  showToast(checked ? '🧾 অটো রসিদ চালু হয়েছে (প্রতি বিক্রির পর মেমো দেখাবে)' : '🧾 অটো রসিদ বন্ধ করা হয়েছে');
}

function renderQuickPosStrip() {
  const container = document.getElementById('quickPosProductList');
  if (!container) return;
  container.innerHTML = '';

  const strip = document.getElementById('posQuickStrip');
  if (strip) {
    strip.classList.toggle('hidden', !shopState.showPosQuickStrip);
  }

  shopState.products.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'pos-prod-chip';
    btn.onclick = () => addProductToPosCart(p.id);
    btn.innerHTML = `
      <span>${p.icon || '📦'} ${p.name}</span>
      <span class="p-price">৳${toBanglaNum(p.price)}</span>
    `;
    container.appendChild(btn);
  });
}

function renderPosProductCatalog() {
  const container = document.getElementById('posCatalogList');
  if (!container) return;
  const query = (document.getElementById('posSearchInput')?.value || '').trim().toLowerCase();
  container.innerHTML = '';

  const filtered = shopState.products.filter(p => p.name.toLowerCase().includes(query));

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:24px;color:#64748b;">কোনো পণ্য পাওয়া যায়নি</div>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pos-item-card';
    card.innerHTML = `
      <div class="pos-item-left">
        <div class="pos-item-icon">${p.icon || '📦'}</div>
        <div>
          <div class="pos-item-name">${p.name}</div>
          <div class="pos-item-meta">মূল্য: <strong>৳ ${toBanglaNum(p.price)}</strong> / ${p.unit || 'পিস'} • স্টক: ${toBanglaNum(p.stock || 0)} ${p.unit || ''}</div>
        </div>
      </div>
      <div class="pos-item-right">
        <button class="btn-pos-sell" onclick="addProductFromCatalog('${p.id}')">+ মেমোতে যোগ</button>
        <button class="btn-pos-del" onclick="deletePosProduct('${p.id}')" title="মুছুন">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function addProductToPosCart(prodId) {
  const prod = shopState.products.find(p => p.id === prodId);
  if (!prod) return;

  const existing = activePosCart.find(item => item.id === prod.id);
  if (existing) {
    existing.qty += 1;
  } else {
    activePosCart.push({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      unit: prod.unit || 'পিস',
      qty: 1
    });
  }

  updateCalcScreen();
  showToast(`🛒 "${prod.name}" (৳${toBanglaNum(prod.price)}) মেমোতে যোগ হয়েছে!`);
}

function addProductFromCatalog(prodId) {
  addProductToPosCart(prodId);
  switchAppTab('fast');
}

function removeCartItem(prodId) {
  activePosCart = activePosCart.filter(item => item.id !== prodId);
  updateCalcScreen();
}

function clearPosCart() {
  activePosCart = [];
  updateCalcScreen();
}

function handleAddProduct(e) {
  e.preventDefault();
  const name = document.getElementById('newProdName').value.trim();
  const price = parseInt(document.getElementById('newProdPrice').value, 10) || 0;
  const unit = document.getElementById('newProdUnit').value;
  const icon = document.getElementById('newProdIcon').value;
  const stock = parseInt(document.getElementById('newProdStock').value, 10) || 0;

  if (!name || price <= 0) return;

  shopState.products.unshift({
    id: 'p-' + Date.now(),
    name,
    price,
    unit,
    icon,
    stock
  });

  document.getElementById('newProdName').value = '';
  document.getElementById('newProdPrice').value = '';
  closeModal('newProductModal');
  saveShopState();
  showToast(`✅ নতুন পণ্য "${name}" (৳${toBanglaNum(price)}) যুক্ত হয়েছে!`);
}

function deletePosProduct(prodId) {
  shopState.products = shopState.products.filter(p => p.id !== prodId);
  saveShopState();
  showToast('🗑️ পণ্যটি তালিকা থেকে মুছে ফেলা হয়েছে');
}

function renderQuickCustomers() {
  const container = document.getElementById('quickCustomerList');
  container.innerHTML = '';

  const selectedCust = shopState.customers.find(c => c.id === shopState.selectedCustomerId) || shopState.customers[0];
  if (selectedCust) {
    shopState.selectedCustomerId = selectedCust.id;
    document.getElementById('selectedCustBakiHint').textContent = `${selectedCust.name.split(' ')[0]}-এর খাতায়`;
  }

  shopState.customers.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cust-chip' + (c.id === shopState.selectedCustomerId ? ' selected' : '');
    btn.onclick = () => {
      shopState.selectedCustomerId = c.id;
      renderQuickCustomers();
    };
    btn.innerHTML = `
      <span>${c.name}</span>
      ${c.due > 0 ? `<span class="cust-chip-due">৳${toBanglaNum(c.due)}</span>` : ''}
    `;
    container.appendChild(btn);
  });
}

function renderBakiCustomerList() {
  const container = document.getElementById('bakiCustomerList');
  const query = (document.getElementById('bakiSearchInput')?.value || '').trim().toLowerCase();
  container.innerHTML = '';

  const filtered = shopState.customers
    .filter(c => c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query)))
    .sort((a, b) => b.due - a.due);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:24px;color:#64748b;">কোনো কাস্টমার পাওয়া যায়নি</div>`;
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement('div');
    card.className = 'customer-row-card';
    card.innerHTML = `
      <div class="cr-top" onclick="openCustomerDetail('${c.id}')">
        <div>
          <div class="cr-name">${c.name}</div>
          <div class="cr-phone">📞 ${c.phone || 'নাম্বার নেই'} • আপডেট: ${c.lastUpdated}</div>
        </div>
        <div class="cr-due-amount" style="color:${c.due > 0 ? '#dc2626' : '#059669'}">
          ${c.due > 0 ? `৳ ${toBanglaNum(c.due)}` : 'পরিশোধিত'}
        </div>
      </div>
      <div class="cr-actions">
        <button class="cr-btn jama" onclick="quickCollectBaki('${c.id}')">📥 বাকি জমা নিন</button>
        <button class="cr-btn sms" onclick="sendTagadaSMS('${c.id}')">📩 তাগাদা SMS</button>
        <button class="cr-btn wa" onclick="sendWhatsAppTagada('${c.id}')">💬 WhatsApp</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderTransactionTimeline() {
  const container = document.getElementById('transactionTimeline');
  container.innerHTML = '';

  const typeMeta = {
    'CASH_SALE': { label: '💵 নগদ বিক্রি', color: '#059669', sign: '+' },
    'BAKI_GIVEN': { label: '📕 বাকি দেওয়া হলো', color: '#dc2626', sign: '' },
    'BAKI_JAMA': { label: '📥 বাকি টাকা আদায়', color: '#2563eb', sign: '+' },
    'EXPENSE': { label: '📤 দোকান খরচ/মাল ক্রয়', color: '#d97706', sign: '-' }
  };

  shopState.transactions.forEach(tx => {
    const meta = typeMeta[tx.type] || typeMeta.CASH_SALE;
    const div = document.createElement('div');
    div.className = `tx-item ${tx.type}`;
    div.innerHTML = `
      <div style="flex:1;">
        <div class="tx-title">${meta.label} — ${tx.customerName}</div>
        <div class="tx-meta">${tx.note || 'সাধারণ লেনদেন'} • 🕒 ${tx.time}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="tx-amt" style="color:${meta.color}">
          ${meta.sign}৳ ${toBanglaNum(tx.amount)}
        </div>
        <button class="btn-outline-sm" onclick="openReceiptById('${tx.id}')" title="এই লেনদেনের রসিদ দেখুন">🧾 রসিদ</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// ============================================================================
// FAST CALCULATOR & POS CART EVALUATION (২ সেকেন্ডে হিসাব)
// ============================================================================

function evaluateManualCalc(expr) {
  if (!expr) return 0;
  try {
    const clean = expr.replace(/[^0-9+]/g, '');
    const parts = clean.split('+').filter(Boolean);
    return parts.reduce((sum, p) => sum + (parseInt(p, 10) || 0), 0);
  } catch (e) {
    return 0;
  }
}

function getPosCartTotal() {
  return activePosCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getGrandTotalAmount() {
  return getPosCartTotal() + evaluateManualCalc(calcExpr);
}

function pressCalc(key) {
  if (key === 'C') {
    calcExpr = '';
    activePosCart = [];
  } else if (key === 'BACK') {
    calcExpr = calcExpr.slice(0, -1);
  } else if (key === '+50') {
    calcExpr = calcExpr ? `${calcExpr}+50` : '50';
  } else if (key === '+100') {
    calcExpr = calcExpr ? `${calcExpr}+100` : '100';
  } else if (key === '+') {
    if (calcExpr && !calcExpr.endsWith('+')) {
      calcExpr += '+';
    }
  } else {
    calcExpr += key;
  }

  updateCalcScreen();
}

function updateCalcScreen() {
  // Render Active Cart Bar if POS items are selected
  const cartBar = document.getElementById('activeCartBar');
  const cartList = document.getElementById('activeCartItemsList');
  if (activePosCart.length > 0) {
    cartBar.classList.remove('hidden');
    cartList.innerHTML = activePosCart.map(item => `
      <span class="cart-pill">
        ${item.name} ×${toBanglaNum(item.qty)} (৳${toBanglaNum(item.price * item.qty)})
        <button onclick="removeCartItem('${item.id}')">✕</button>
      </span>
    `).join('');
  } else {
    cartBar.classList.add('hidden');
    cartList.innerHTML = '';
  }

  const grandTotal = getGrandTotalAmount();
  const cartTotal = getPosCartTotal();

  let exprDisplay = '';
  if (cartTotal > 0 && calcExpr) {
    const manualStr = calcExpr.split('+').map(p => p ? toBanglaNum(p) : '').join(' + ');
    exprDisplay = `পণ্য ৳${toBanglaNum(cartTotal)} + (${manualStr})`;
  } else if (cartTotal > 0) {
    exprDisplay = `নির্বাচিত পণ্যের মোট: ৳${toBanglaNum(cartTotal)}`;
  } else if (calcExpr) {
    exprDisplay = calcExpr.split('+').map(p => p ? toBanglaNum(p) : '').join(' + ');
  } else {
    exprDisplay = 'পণ্য ছুঁয়ে দিন অথবা সরাসরি টাকা তুলুন (যেমন: ৫০ + ৩০)';
  }

  document.getElementById('calcExpression').textContent = exprDisplay;
  document.getElementById('calcTotal').textContent = toBanglaNum(grandTotal);
}

function toggleItemTag(tag) {
  if (shopState.selectedItemTag === tag) {
    shopState.selectedItemTag = '';
  } else {
    shopState.selectedItemTag = tag;
  }
  document.querySelectorAll('.item-tag').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.includes(shopState.selectedItemTag) && shopState.selectedItemTag !== '');
  });
}

function buildTransactionItemsAndNote(type, manualAmount, defaultLabel) {
  const customNote = document.getElementById('customNoteInput').value.trim();
  const tagNote = [shopState.selectedItemTag, customNote].filter(Boolean).join(' - ');

  const items = activePosCart.map(i => ({
    id: i.id,
    name: i.name,
    qty: i.qty,
    price: i.price,
    unit: i.unit
  }));

  if (manualAmount > 0) {
    items.push({
      name: tagNote || defaultLabel,
      qty: 1,
      price: manualAmount,
      unit: ''
    });
  }

  // Deduct stock for POS items if it's a sale
  if (type === 'CASH_SALE' || type === 'BAKI_GIVEN') {
    activePosCart.forEach(cartItem => {
      const prod = shopState.products.find(p => p.id === cartItem.id);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - cartItem.qty);
      }
    });
  }

  const cartSummary = activePosCart.map(i => `${i.name} x${toBanglaNum(i.qty)}`).join(', ');
  const combinedNote = [cartSummary, tagNote].filter(Boolean).join(' • ') || defaultLabel;

  return { items, note: combinedNote };
}

function recordInstantTransaction(type) {
  const amount = getGrandTotalAmount();
  if (amount <= 0) {
    showToast('⚠️ অনুগ্রহ করে আগে পণ্য বাছাই করুন বা টাকার পরিমাণ তুলুন!');
    return;
  }

  const manualAmount = evaluateManualCalc(calcExpr);
  const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  const todayDate = new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  const memoId = 'MEMO-' + String(1001 + shopState.transactions.length);

  const selectedCustomer = shopState.customers.find(c => c.id === shopState.selectedCustomerId) || shopState.customers[0];
  let newTx = null;

  if (type === 'CASH_SALE') {
    const { items, note } = buildTransactionItemsAndNote(type, manualAmount, 'নগদ পণ্য বিক্রি');
    newTx = {
      id: memoId,
      type: 'CASH_SALE',
      amount,
      customerName: selectedCustomer ? `${selectedCustomer.name} (নগদ)` : 'নগদ কাস্টমার',
      customerPhone: selectedCustomer?.phone || '',
      note,
      items,
      time: nowTime,
      date: todayDate
    };
    shopState.transactions.unshift(newTx);
    showToast(`✅ নগদ বিক্রি ৳${toBanglaNum(amount)} সেভ হয়েছে!`);
  } else if (type === 'BAKI_GIVEN') {
    if (!selectedCustomer) {
      openModal('newCustomerModal');
      return;
    }
    const prevDue = selectedCustomer.due;
    selectedCustomer.due += amount;
    selectedCustomer.lastUpdated = `আজ ${nowTime}`;
    const { items, note } = buildTransactionItemsAndNote(type, manualAmount, 'বাকি পণ্য বিক্রি');

    newTx = {
      id: memoId,
      type: 'BAKI_GIVEN',
      amount,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone || '',
      previousDue: prevDue,
      newDue: selectedCustomer.due,
      note,
      items,
      time: nowTime,
      date: todayDate
    };
    shopState.transactions.unshift(newTx);
    showToast(`📕 ${selectedCustomer.name}-এর নামে ৳${toBanglaNum(amount)} বাকি লেখা হয়েছে!`);
  } else if (type === 'BAKI_JAMA') {
    if (!selectedCustomer) return;
    const prevDue = selectedCustomer.due;
    selectedCustomer.due = Math.max(0, selectedCustomer.due - amount);
    selectedCustomer.lastUpdated = `আজ ${nowTime}`;

    newTx = {
      id: memoId,
      type: 'BAKI_JAMA',
      amount,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone || '',
      previousDue: prevDue,
      newDue: selectedCustomer.due,
      note: 'বাকি খাতা জমা',
      items: [{ name: 'পূর্বের বাকি পরিশোধ (জমা)', qty: 1, price: amount, unit: '' }],
      time: nowTime,
      date: todayDate
    };
    shopState.transactions.unshift(newTx);
    showToast(`📥 ${selectedCustomer.name} থেকে ৳${toBanglaNum(amount)} বাকি আদায় হয়েছে!`);
  } else if (type === 'EXPENSE') {
    const { items, note } = buildTransactionItemsAndNote(type, manualAmount, 'মাল কেনা / দোকান খরচ');
    newTx = {
      id: memoId,
      type: 'EXPENSE',
      amount,
      customerName: 'দোকান খরচ',
      note,
      items,
      time: nowTime,
      date: todayDate
    };
    shopState.transactions.unshift(newTx);
    showToast(`📤 দোকান খরচ ৳${toBanglaNum(amount)} ক্যাশ থেকে বাদ দেওয়া হয়েছে!`);
  }

  // Reset Calculator & Active Cart
  calcExpr = '';
  activePosCart = [];
  document.getElementById('customNoteInput').value = '';
  shopState.selectedItemTag = '';
  document.querySelectorAll('.item-tag').forEach(btn => btn.classList.remove('selected'));
  updateCalcScreen();
  saveShopState();

  // If Auto-Receipt is enabled, immediately pop up the Cash Memo!
  if (shopState.autoShowReceipt && newTx) {
    renderReceiptModal(newTx);
  }
}

// ============================================================================
// DIGITAL RECEIPT / CASH MEMO GENERATOR (রসিদ তৈরি, প্রিন্ট ও শেয়ার)
// ============================================================================

function openReceiptById(txId) {
  const tx = shopState.transactions.find(t => t.id === txId);
  if (!tx) return;
  renderReceiptModal(tx);
}

function showLastReceipt() {
  if (shopState.transactions.length === 0) {
    showToast('এখনও কোনো লেনদেন হয়নি!');
    return;
  }
  renderReceiptModal(shopState.transactions[0]);
}

function previewDraftReceipt() {
  const total = getGrandTotalAmount();
  if (total <= 0) {
    // If nothing typed on calculator, show the last completed sale receipt
    showLastReceipt();
    return;
  }

  const manualAmount = evaluateManualCalc(calcExpr);
  const selectedCustomer = shopState.customers.find(c => c.id === shopState.selectedCustomerId);
  const { items, note } = buildTransactionItemsAndNote('PREVIEW', manualAmount, 'খুচরা পণ্য');

  const draftTx = {
    id: 'DRAFT-MEMO',
    type: 'CASH_SALE',
    amount: total,
    customerName: selectedCustomer ? selectedCustomer.name : 'নগদ কাস্টমার',
    customerPhone: selectedCustomer?.phone || '',
    previousDue: selectedCustomer?.due || 0,
    newDue: selectedCustomer?.due || 0,
    note,
    items,
    time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
  };

  renderReceiptModal(draftTx);
}

function renderReceiptModal(tx) {
  currentReceiptData = tx;
  const statusBadges = {
    'CASH_SALE': { text: '✅ নগদ পরিশোধিত (PAID)', bg: '#dcfce7', color: '#166534' },
    'BAKI_GIVEN': { text: '📕 বাকি খাতায় যুক্ত (DUE)', bg: '#fee2e2', color: '#991b1b' },
    'BAKI_JAMA': { text: '📥 বাকি টাকা জমা রসিদ', bg: '#dbeafe', color: '#1e40af' },
    'EXPENSE': { text: '📤 দোকান খরচ ভাউচার', bg: '#fef3c7', color: '#92400e' }
  };
  const badge = statusBadges[tx.type] || statusBadges.CASH_SALE;

  const itemsList = (tx.items && tx.items.length > 0)
    ? tx.items
    : [{ name: tx.note || 'সাধারণ পণ্য', qty: 1, price: tx.amount, unit: '' }];

  const rowsHtml = itemsList.map((item, idx) => `
    <tr>
      <td>${toBanglaNum(idx + 1)}. ${item.name}</td>
      <td style="text-align:center;">${toBanglaNum(item.qty)} ${item.unit || ''}</td>
      <td style="text-align:right;">৳ ${toBanglaNum(item.price * item.qty)}</td>
    </tr>
  `).join('');

  let dueSummaryHtml = '';
  if (typeof tx.newDue === 'number') {
    dueSummaryHtml = `
      <div class="rcp-line" style="color:#475569;">
        <span>পূর্বের বকেয়া (বাকি):</span>
        <span>৳ ${toBanglaNum(tx.previousDue || 0)}</span>
      </div>
      <div class="rcp-line" style="color:#dc2626;font-weight:700;">
        <span>বর্তমান মোট বকেয়া (পাওনা):</span>
        <span>৳ ${toBanglaNum(tx.newDue)}</span>
      </div>
    `;
  }

  document.getElementById('printableReceiptArea').innerHTML = `
    <div class="rcp-shop-header">
      <h4>🏪 ${shopState.shopName}</h4>
      <p>${shopState.shopAddress || 'প্রোপ্রাইটর • ডিজিটাল ক্যাশ মেমো'}</p>
      <div style="display:inline-block;margin-top:5px;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700;background:${badge.bg};color:${badge.color};">
        ${badge.text}
      </div>
    </div>

    <div class="rcp-meta-rows">
      <div>
        <span>মেমো নং: <strong>#${tx.id}</strong></span>
        <span>তারিখ: ${tx.date || 'আজ'} (${tx.time})</span>
      </div>
      <div>
        <span>ক্রেতা: <strong>${tx.customerName}</strong></span>
        <span>${tx.customerPhone ? '📞 ' + tx.customerPhone : ''}</span>
      </div>
    </div>

    <table class="rcp-items-table">
      <thead>
        <tr>
          <th>বিবরণ (পণ্য)</th>
          <th style="text-align:center;">পরিমাণ</th>
          <th style="text-align:right;">টাকা</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="rcp-totals-box">
      <div class="rcp-line rcp-grand">
        <span>মোট বিল / লেনদেন:</span>
        <span>৳ ${toBanglaNum(tx.amount)}</span>
      </div>
      ${dueSummaryHtml}
    </div>

    <div class="rcp-footer">
      ধন্যবাদ! আবার আসবেন।<br/>
      <small>সফটওয়্যার: <strong>দোকান খাতা (DokanKhata BD)</strong></small>
    </div>
  `;

  openModal('receiptModal');
}

function buildPlainTextReceipt(tx) {
  const itemsList = (tx.items && tx.items.length > 0)
    ? tx.items.map(i => `• ${i.name} (${toBanglaNum(i.qty)}টি) = ৳${toBanglaNum(i.price * i.qty)}`).join('\n')
    : `• ${tx.note || 'পণ্য ক্রয়'} = ৳${toBanglaNum(tx.amount)}`;

  let text = `🧾 *${shopState.shopName}*\n`;
  text += `${shopState.shopAddress}\n`;
  text += `------------------------\n`;
  text += `মেমো নং: #${tx.id} | সময়: ${tx.time}\n`;
  text += `ক্রেতা: ${tx.customerName}\n`;
  text += `------------------------\n`;
  text += `${itemsList}\n`;
  text += `------------------------\n`;
  text += `*মোট টাকা: ৳ ${toBanglaNum(tx.amount)}*\n`;
  if (typeof tx.newDue === 'number') {
    text += `বর্তমান মোট বাকি: ৳ ${toBanglaNum(tx.newDue)}\n`;
  }
  text += `ধন্যবাদ!`;
  return text;
}

function shareReceiptWhatsApp() {
  if (!currentReceiptData) return;
  const text = buildPlainTextReceipt(currentReceiptData);
  const phoneClean = (currentReceiptData.customerPhone || '').replace(/[^0-9]/g, '');
  const bdPhone = phoneClean ? (phoneClean.startsWith('88') ? phoneClean : `88${phoneClean}`) : '';
  const waUrl = bdPhone
    ? `https://wa.me/${bdPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

function copyReceiptText() {
  if (!currentReceiptData) return;
  const text = buildPlainTextReceipt(currentReceiptData);
  navigator.clipboard?.writeText(text);
  showToast('📋 ক্যাশ মেমো কপি হয়েছে! এখন যেকোনো জায়গায় পেস্ট করতে পারবেন।');
}

// ============================================================================
// BANGLA VOICE-TO-ACCOUNTING ENGINE (বাংলা ভয়েস ইনপুট ম্যাজিক)
// ============================================================================

let recognition = null;
let isListening = false;

function toggleVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('micBtn');
  const liveText = document.getElementById('voiceLiveText');

  if (!SpeechRec) {
    showToast('💡 আপনার ব্রাউজারে সরাসরি মাইক না থাকলে নিচের ১-ট্যাপ ভয়েস বাটনগুলো ক্লিক করে টেস্ট করুন!');
    return;
  }

  if (isListening && recognition) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRec();
  recognition.lang = 'bn-BD';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('listening');
    micBtn.textContent = '🛑 শুনছি...';
    liveText.textContent = 'এখন মুখে বলুন... (যেমন: "করিম ভাই ২৫০ টাকা বাকি")';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    simulateVoiceCommand(transcript);
  };

  recognition.onerror = () => {
    liveText.textContent = 'ভয়েস শোনা যায়নি। নিচের ডেমো বাটনে ট্যাপ করে পরীক্ষা করুন।';
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('listening');
    micBtn.textContent = '🎤 বলুন';
  };

  recognition.start();
}

function simulateVoiceCommand(spokenText) {
  const liveText = document.getElementById('voiceLiveText');
  liveText.innerHTML = `🗣️ আপনি বলেছেন: <strong>"${spokenText}"</strong>`;

  const normalized = normalizeToEnglishDigits(spokenText);
  let amount = 0;
  const numMatch = normalized.match(/\d+/);
  if (numMatch) {
    amount = parseInt(numMatch[0], 10);
  } else {
    const wordMap = { 'পঞ্চাশ': 50, 'একশ': 100, 'দেড়শ': 150, 'দুইশ': 200, 'আড়াইশ': 250, 'তিনশ': 300, 'পাঁচশ': 500, 'হাজার': 1000 };
    for (const [word, val] of Object.entries(wordMap)) {
      if (spokenText.includes(word)) {
        amount = val;
        break;
      }
    }
  }

  if (amount <= 0) {
    showToast('⚠️ ভয়েসে টাকার পরিমাণ বোঝা যায়নি!');
    return;
  }

  let txType = 'CASH_SALE';
  if (spokenText.includes('বাকি') || spokenText.includes('পাওনা')) {
    txType = 'BAKI_GIVEN';
  } else if (spokenText.includes('জমা') || spokenText.includes('আদায়') || spokenText.includes('দিলো')) {
    txType = 'BAKI_JAMA';
  } else if (spokenText.includes('খরচ') || spokenText.includes('ভাড়া')) {
    txType = 'EXPENSE';
  }

  if (txType === 'BAKI_GIVEN' || txType === 'BAKI_JAMA') {
    let matchedCust = shopState.customers.find(c => {
      const firstWord = c.name.split(' ')[0];
      return spokenText.includes(firstWord);
    });

    if (!matchedCust) {
      const nameGuess = spokenText.replace(/[০-৯0-9]+|টাকা|বাকি|জমা|নগদ|বিক্রি/g, '').trim() || 'নতুন কাস্টমার';
      matchedCust = {
        id: 'c-' + Date.now(),
        name: nameGuess,
        phone: '',
        due: 0,
        lastUpdated: 'এইমাত্র'
      };
      shopState.customers.unshift(matchedCust);
    }
    shopState.selectedCustomerId = matchedCust.id;
  }

  activePosCart = [];
  calcExpr = String(amount);
  updateCalcScreen();
  recordInstantTransaction(txType);
}

// ============================================================================
// BAKI KHATA, SMS TAGADA & WHATSAPP REMINDERS
// ============================================================================

function handleAddCustomer(e) {
  e.preventDefault();
  const name = document.getElementById('newCustName').value.trim();
  const phone = document.getElementById('newCustPhone').value.trim();
  const initialBaki = parseInt(document.getElementById('newCustInitialBaki').value, 10) || 0;

  if (!name) return;

  const newCust = {
    id: 'c-' + Date.now(),
    name,
    phone,
    due: initialBaki,
    lastUpdated: 'এইমাত্র যুক্ত'
  };

  shopState.customers.unshift(newCust);
  shopState.selectedCustomerId = newCust.id;

  if (initialBaki > 0) {
    shopState.transactions.unshift({
      id: 'MEMO-' + String(1001 + shopState.transactions.length),
      type: 'BAKI_GIVEN',
      amount: initialBaki,
      customerId: newCust.id,
      customerName: newCust.name,
      customerPhone: phone,
      previousDue: 0,
      newDue: initialBaki,
      note: 'পূর্বের খাতার বাকি জের',
      items: [{ name: 'পূর্বের খাতার বাকি জের', qty: 1, price: initialBaki, unit: '' }],
      time: 'শুরুতে যোগ',
      date: 'আজ'
    });
  }

  closeModal('newCustomerModal');
  document.getElementById('newCustName').value = '';
  document.getElementById('newCustPhone').value = '';
  document.getElementById('newCustInitialBaki').value = '0';

  saveShopState();
  showToast(`✅ কাস্টমার "${name}" যুক্ত হয়েছে!`);
}

function quickCollectBaki(custId) {
  openCustomerDetail(custId);
}

function openCustomerDetail(custId) {
  const cust = shopState.customers.find(c => c.id === custId);
  if (!cust) return;

  document.getElementById('cdModalTitle').textContent = `📕 ${cust.name}`;
  const custTx = shopState.transactions.filter(t => t.customerId === custId || t.customerName === cust.name);

  const historyHtml = custTx.length
    ? custTx.map(t => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:13px;">
          <span>${t.type === 'BAKI_GIVEN' ? '📕 বাকি' : '📥 জমা'} — ${t.note || ''} (${t.time})</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <strong style="color:${t.type === 'BAKI_GIVEN' ? '#dc2626' : '#059669'}">৳ ${toBanglaNum(t.amount)}</strong>
            <button class="btn-outline-sm" onclick="closeModal('customerDetailModal');openReceiptById('${t.id}')">🧾</button>
          </div>
        </div>
      `).join('')
    : '<p style="font-size:12.5px;color:#64748b;">কোনো লেনদেন পাওয়া যায়নি</p>';

  document.getElementById('cdModalContent').innerHTML = `
    <div style="background:#fef2f2;border:1px solid #fecaca;padding:12px;border-radius:10px;text-align:center;margin-bottom:12px;">
      <span style="font-size:12px;color:#991b1b;">বর্তমান মোট পাওনা (বাকি)</span>
      <h2 style="color:#dc2626;font-size:26px;">৳ ${toBanglaNum(cust.due)}</h2>
      <small style="color:#64748b;">📞 ${cust.phone || 'মোবাইল নাম্বার দেওয়া নেই'}</small>
    </div>

    <div style="background:#f8fafc;padding:10px;border-radius:10px;margin-bottom:12px;">
      <label style="font-size:12.5px;font-weight:700;display:block;margin-bottom:6px;">📥 বাকি টাকা জমা নিন বা নতুন বাকি যোগ করুন:</label>
      <div style="display:flex;gap:6px;">
        <input type="number" id="cdQuickAmount" placeholder="টাকার পরিমাণ" value="${cust.due > 0 ? cust.due : ''}" style="flex:1;padding:8px;border:1.5px solid #cbd5e1;border-radius:8px;" />
        <button onclick="submitCustomerModalTx('${cust.id}', 'BAKI_JAMA')" style="background:#2563eb;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-weight:700;cursor:pointer;">জমা নিন</button>
        <button onclick="submitCustomerModalTx('${cust.id}', 'BAKI_GIVEN')" style="background:#dc2626;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-weight:700;cursor:pointer;">+ বাকি</button>
      </div>
    </div>

    <h5 style="margin-bottom:6px;font-size:13px;">লেনদেন ও রসিদসমূহ:</h5>
    <div style="max-height:180px;overflow-y:auto;margin-bottom:12px;">
      ${historyHtml}
    </div>

    <div style="display:flex;gap:8px;">
      <button class="cr-btn sms" onclick="sendTagadaSMS('${cust.id}')">📩 তাগাদা SMS পাঠান</button>
      <button class="cr-btn wa" onclick="sendWhatsAppTagada('${cust.id}')">💬 WhatsApp তাগাদা</button>
    </div>
  `;

  openModal('customerDetailModal');
}

function submitCustomerModalTx(custId, type) {
  const amt = parseInt(document.getElementById('cdQuickAmount').value, 10) || 0;
  if (amt <= 0) {
    showToast('⚠️ টাকার পরিমাণ লিখুন');
    return;
  }
  shopState.selectedCustomerId = custId;
  activePosCart = [];
  calcExpr = String(amt);
  closeModal('customerDetailModal');
  recordInstantTransaction(type);
}

async function sendTagadaSMS(custId) {
  const cust = shopState.customers.find(c => c.id === custId);
  if (!cust) return;
  if (cust.due <= 0) {
    showToast('এই কাস্টমারের কোনো বাকি নেই!');
    return;
  }

  const msg = `আসসালামু আলাইকুম ${cust.name}, "${shopState.shopName}"-এ আপনার পূর্বের বাকি ৳${toBanglaNum(cust.due)}। সুবিধামতো পরিশোধ করার অনুরোধ রইলো। ধন্যবাদ।`;

  try {
    const res = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: shopState.licenseKey,
        shopName: shopState.shopName,
        customerName: cust.name,
        phone: cust.phone || '017XXXXXXXX',
        amount: cust.due,
        message: msg
      })
    });
    const data = await res.json();
    if (data.success) {
      shopState.smsBalance = data.remainingSms;
      saveShopState();
      showToast(`📩 ${data.message} (অবশিষ্ট SMS: ${toBanglaNum(data.remainingSms)})`);
    } else {
      showToast(`⚠️ ${data.message}`);
    }
  } catch (e) {
    showToast(`📩 [অফলাইন কিউ] "${msg}" মেসেজটি প্রস্তুত হয়েছে!`);
  }
}

function sendWhatsAppTagada(custId) {
  const cust = shopState.customers.find(c => c.id === custId);
  if (!cust) return;
  const msg = `আসসালামু আলাইকুম ${cust.name},\n*${shopState.shopName}*-এ আপনার বর্তমান বাকি হিসাব: *৳ ${toBanglaNum(cust.due)}*।\nঅনুগ্রহ করে সুবিধামতো পরিশোধ করার অনুরোধ রইলো।`;
  const phoneClean = (cust.phone || '').replace(/[^0-9]/g, '');
  const bdPhone = phoneClean.startsWith('88') ? phoneClean : `88${phoneClean}`;
  const waUrl = `https://wa.me/${bdPhone}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

// ============================================================================
// CLOUD BACKUP, LICENSE ACTIVATION & ADMIN DASHBOARD
// ============================================================================

async function triggerCloudSync() {
  try {
    const res = await fetch('/api/cloud/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: shopState.licenseKey,
        shopData: shopState
      })
    });
    const data = await res.json();
    if (data.success) {
      shopState.cloudBackupActive = true;
      shopState.lastSync = data.lastSync;
      saveShopState();
      showToast(`☁️ ${data.message}`);
    } else {
      showToast(`⚠️ ${data.message}`);
      switchAppTab('services');
    }
  } catch (e) {
    showToast('☁️ লোকাল অফলাইন মেমোরিতে সকল হিসাব সুরক্ষিত আছে!');
  }
}

async function verifyShopLicense() {
  const shopName = document.getElementById('modalShopNameInput').value.trim();
  const shopAddress = document.getElementById('modalShopAddressInput')?.value.trim();
  const key = document.getElementById('modalLicenseKeyInput').value.trim().toUpperCase();

  if (shopName) shopState.shopName = shopName;
  if (shopAddress) shopState.shopAddress = shopAddress;

  try {
    const res = await fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, shopName: shopState.shopName })
    });
    const data = await res.json();
    if (data.success) {
      shopState.licenseKey = data.license.key;
      shopState.shopName = data.license.shopName;
      shopState.packageTitle = data.license.packageTitle;
      shopState.cloudBackupActive = data.license.addons.cloudBackup.active;
      shopState.smsBalance = data.license.addons.smsPack.balance;
      saveShopState();
      closeModal('licenseModal');
      showToast(`🎉 ${data.message}`);
    } else {
      showToast(`❌ ${data.message}`);
    }
  } catch (e) {
    saveShopState();
    closeModal('licenseModal');
    showToast('✅ দোকানের তথ্য আপডেট হয়েছে!');
  }
}

function exportShopDataJSON() {
  const blob = new Blob([JSON.stringify(shopState, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dokankhata-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  showToast('⬇️ আপনার দোকানের ব্যাকআপ ফাইল ডাউনলোড হয়েছে!');
}

function requestAddonFromShop(packName) {
  showToast(`✅ "${packName}" চালুর অনুরোধ পাঠানো হয়েছে! অ্যাডমিন প্যানেল থেকে ১ ক্লিকে চালু করুন।`);
}

// ============================================================================
// ENTREPRENEUR / SUPER-ADMIN BUSINESS PANEL LOGIC
// ============================================================================

async function loadAdminDashboard() {
  try {
    const res = await fetch('/api/admin/overview');
    const data = await res.json();

    document.getElementById('admTotalShops').textContent = toBanglaNum(data.stats.totalShops) + ' টি';
    document.getElementById('admOneTimeRev').textContent = '৳ ' + toBanglaNum(data.stats.oneTimeRevenue);
    document.getElementById('admAddonRev').textContent = '৳ ' + toBanglaNum(data.stats.addonRevenue);
    document.getElementById('admTotalRev').textContent = '৳ ' + toBanglaNum(data.stats.totalRevenue);

    const tbody = document.getElementById('adminLicenseTableBody');
    tbody.innerHTML = '';

    data.licenses.forEach(lic => {
      const tr = document.createElement('tr');
      const cloudStatus = lic.addons?.cloudBackup?.active
        ? `<span style="color:#059669;font-weight:700;">✅ চালু (${lic.addons.cloudBackup.plan})</span>`
        : `<span style="color:#dc2626;font-weight:600;">❌ বন্ধ</span>`;

      tr.innerHTML = `
        <td><code style="background:#f1f5f9;padding:4px 8px;border-radius:6px;font-weight:700;">${lic.key}</code></td>
        <td>
          <strong>${lic.shopName}</strong><br/>
          <small style="color:#64748b;">${lic.ownerName} • 📞 ${lic.phone} (${lic.shopType})</small>
        </td>
        <td><strong>৳ ${toBanglaNum(lic.oneTimePrice)}</strong><br/><small>${lic.packageTitle}</small></td>
        <td>${cloudStatus}</td>
        <td><strong>${toBanglaNum(lic.addons?.smsPack?.balance || 0)}</strong> টি SMS</td>
        <td>
          <div class="addon-action-btns">
            <button class="btn-xs" onclick="adminActivateAddon('${lic.key}', 'CLOUD_YEARLY')">+☁️ ১ বছর ব্যাকআপ (৫০০৳)</button>
            <button class="btn-xs" onclick="adminActivateAddon('${lic.key}', 'CLOUD_MONTHLY')">+☁️ মাসিক ব্যাকআপ (৫০৳)</button>
            <button class="btn-xs" onclick="adminActivateAddon('${lic.key}', 'SMS_500')">+📩 ৫০০ SMS (২৫০৳)</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
  }
}

async function handleGenerateLicense(e) {
  e.preventDefault();
  const shopName = document.getElementById('genShopName').value.trim();
  const ownerName = document.getElementById('genOwnerName').value.trim();
  const phone = document.getElementById('genPhone').value.trim();
  const shopType = document.getElementById('genShopType').value;
  const oneTimePrice = Number(document.getElementById('genPrice').value);

  const res = await fetch('/api/admin/generate-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shopName,
      ownerName,
      phone,
      shopType,
      oneTimePrice,
      packageTitle: `লাইফটাইম লাইসেন্স (${toBanglaNum(oneTimePrice)} ৳)`
    })
  });
  const data = await res.json();
  if (data.success) {
    lastGeneratedLicenseKey = data.license.key;
    document.getElementById('newLicenseCodeText').textContent = data.license.key;
    document.getElementById('newlyGeneratedBox').classList.remove('hidden');
    document.getElementById('genShopName').value = '';
    document.getElementById('genOwnerName').value = '';
    document.getElementById('genPhone').value = '';
    loadAdminDashboard();
    showToast(`🎉 নতুন লাইসেন্স "${data.license.key}" তৈরি হয়েছে!`);
  }
}

async function adminActivateAddon(key, addonType) {
  const res = await fetch('/api/admin/activate-addon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, addonType })
  });
  const data = await res.json();
  if (data.success) {
    if (shopState.licenseKey === key) {
      shopState.cloudBackupActive = data.license.addons.cloudBackup.active;
      shopState.lastSync = data.license.addons.cloudBackup.lastSync || 'চালু';
      shopState.smsBalance = data.license.addons.smsPack.balance;
      saveShopState();
    }
    loadAdminDashboard();
    showToast(`✅ ${data.message}`);
  }
}

function useGeneratedLicenseInApp() {
  if (!lastGeneratedLicenseKey) return;
  switchPlatformMode('shop');
  openModal('licenseModal');
  document.getElementById('modalLicenseKeyInput').value = lastGeneratedLicenseKey;
  verifyShopLicense();
}

function updateBusinessCalculator() {
  const shopsPerMonth = Number(document.getElementById('simShopsRange').value);
  const avgPrice = Number(document.getElementById('simPriceRange').value);

  document.getElementById('simShopsLabel').textContent = `${toBanglaNum(shopsPerMonth)} টি দোকান/মাস`;
  document.getElementById('simPriceLabel').textContent = `৳ ${toBanglaNum(avgPrice)} / দোকান`;

  const monthlyOneTime = shopsPerMonth * avgPrice;
  const yearlyShops = shopsPerMonth * 12;
  const yearlyRecurring = Math.round(yearlyShops * 0.5 * 800);

  document.getElementById('simMonthlyOneTime').textContent = `৳ ${toBanglaNum(monthlyOneTime)} / মাস`;
  document.getElementById('simYearlyRecurring').textContent = `৳ ${toBanglaNum(yearlyRecurring)} / বছর (প্যাসিভ আয়!)`;
}

// ============================================================================
// NAVIGATION, MODALS & TOAST
// ============================================================================

function switchAppTab(tabName) {
  document.querySelectorAll('.app-tab').forEach(sec => sec.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');

  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });
}

function switchPlatformMode(mode) {
  const shopView = document.getElementById('shopAppView');
  const adminView = document.getElementById('adminPanelView');
  const shopBtn = document.getElementById('modeShopBtn');
  const adminBtn = document.getElementById('modeAdminBtn');

  if (mode === 'admin') {
    shopView.classList.add('hidden');
    adminView.classList.remove('hidden');
    shopBtn.classList.remove('active');
    adminBtn.classList.add('active');
    loadAdminDashboard();
    updateBusinessCalculator();
  } else {
    adminView.classList.add('hidden');
    shopView.classList.remove('hidden');
    adminBtn.classList.remove('active');
    shopBtn.classList.add('active');
    renderAllShopUI();
  }
}

function openModal(id) {
  if (id === 'licenseModal') {
    document.getElementById('modalShopNameInput').value = shopState.shopName;
    if (document.getElementById('modalShopAddressInput')) {
      document.getElementById('modalShopAddressInput').value = shopState.shopAddress || '';
    }
    document.getElementById('modalLicenseKeyInput').value = shopState.licenseKey;
  }
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

let toastTimer = null;
function showToast(msg) {
  const box = document.getElementById('toastBox');
  box.textContent = msg;
  box.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    box.classList.add('hidden');
  }, 3200);
}

// Register PWA Service Worker & Initialize
window.addEventListener('DOMContentLoaded', () => {
  renderAllShopUI();
  updateCalcScreen();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
