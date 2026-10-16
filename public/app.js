// ============================================================================
// দোকান খাতা (DokanKhata BD) — Shopkeeper Mobile App Logic
// ============================================================================

const STORAGE_KEY = 'dokankhata_shop_state_v3';

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
  return Math.round(n * 100 / 100).toLocaleString('en-IN').replace(/[0-9]/g, d => enToBnDigits[d] || d);
}

function normalizeToEnglishDigits(str) {
  return String(str).replace(/[০-৯]/g, d => bnToEnDigits[d] || d);
}

// Clean Initial State (No Demo Products, No Demo Customers, No Demo Transactions)
const defaultShopState = {
  shopName: 'আমার দোকান',
  shopAddress: 'বাংলাদেশ',
  licenseKey: 'DOKAN-1500-DEMO',
  packageTitle: 'লাইফটাইম লাইসেন্স',
  cloudBackupActive: true,
  lastSync: 'সুরক্ষিত',
  smsBalance: 100,
  selectedCustomerId: '',
  autoShowReceipt: false,
  products: [],
  customers: [],
  transactions: []
};

let shopState = loadShopState();
let calcExpr = '';
let activePosCart = []; // [{ id, code, name, price, unit, qty }]
let currentReceiptData = null;

function loadShopState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultShopState));
      return JSON.parse(JSON.stringify(defaultShopState));
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.products)) parsed.products = [];
    if (!Array.isArray(parsed.customers)) parsed.customers = [];
    if (!Array.isArray(parsed.transactions)) parsed.transactions = [];
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

  document.getElementById('sumTodayCash').textContent = '৳ ' + toBanglaNum(todayCashSale);
  document.getElementById('sumTotalBaki').textContent = '৳ ' + toBanglaNum(totalMarketBaki);
  document.getElementById('sumCashInHand').textContent = '৳ ' + toBanglaNum(netCashInHand);

  const bakiCustomersCount = shopState.customers.filter(c => c.due > 0).length;
  document.getElementById('navBakiCount').textContent = toBanglaNum(bakiCustomersCount);
  document.getElementById('bakiTabTotal').textContent = '৳ ' + toBanglaNum(totalMarketBaki);

  document.getElementById('khataCashSale').textContent = '৳ ' + toBanglaNum(todayCashSale);
  document.getElementById('khataBakiJama').textContent = '৳ ' + toBanglaNum(todayBakiJama);
  document.getElementById('khataBakiGiven').textContent = '৳ ' + toBanglaNum(todayBakiGiven);
  document.getElementById('khataExpense').textContent = '৳ ' + toBanglaNum(todayExpense);
  document.getElementById('khataNetCash').textContent = '৳ ' + toBanglaNum(netCashInHand);

  renderProductDropdownList();
  renderPosProductCatalog();
  renderCustomerDropdown();
  renderBakiCustomerList();
  renderTransactionTimeline();
}

// ============================================================================
// PRODUCT DROPDOWN SYSTEM (পণ্য বাছাই — নাম বা কোড দিয়ে সার্চ)
// ============================================================================

function toggleProductDropdown(forceState) {
  const panel = document.getElementById('productDropdownPanel');
  const arrow = document.getElementById('posToggleArrow');
  const shouldOpen = typeof forceState === 'boolean' ? forceState : panel.classList.contains('hidden');

  if (shouldOpen) {
    panel.classList.remove('hidden');
    arrow.textContent = '▴';
    renderProductDropdownList();
    setTimeout(() => {
      document.getElementById('productDropdownSearchInput')?.focus();
    }, 50);
  } else {
    panel.classList.add('hidden');
    arrow.textContent = '▾';
  }
}

function renderProductDropdownList() {
  const container = document.getElementById('productDropdownList');
  if (!container) return;

  const rawQuery = (document.getElementById('productDropdownSearchInput')?.value || '').trim().toLowerCase();
  const normalizedQuery = normalizeToEnglishDigits(rawQuery);
  container.innerHTML = '';

  if (shopState.products.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:12px;color:#64748b;font-size:12.5px;">
        এখনও কোনো পণ্য যোগ করা হয়নি। উপরে <strong>"+ নতুন পণ্য"</strong> বাটনে ক্লিক করে পণ্য ও কোড নাম্বার যোগ করুন।
      </div>
    `;
    return;
  }

  const filtered = shopState.products.filter(p => {
    const codeStr = normalizeToEnglishDigits(p.code || '').toLowerCase();
    const nameStr = (p.name || '').toLowerCase();
    return nameStr.includes(rawQuery) || codeStr.includes(normalizedQuery);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:10px;color:#64748b;font-size:12.5px;">এই নাম বা কোডের কোনো পণ্য পাওয়া যায়নি</div>`;
    return;
  }

  filtered.forEach(p => {
    const row = document.createElement('div');
    row.className = 'dd-prod-row';
    row.onclick = () => {
      addProductToPosCart(p.id);
    };
    row.innerHTML = `
      <div>
        <span class="dd-prod-code">#${p.code || '-'}</span>
        <strong>${p.name}</strong>
        <small style="color:#64748b;">(${p.unit || 'পিস'})</small>
      </div>
      <strong style="color:#059669;">৳ ${toBanglaNum(p.price)} +</strong>
    `;
    container.appendChild(row);
  });
}

function renderPosProductCatalog() {
  const container = document.getElementById('posCatalogList');
  if (!container) return;
  const rawQuery = (document.getElementById('posSearchInput')?.value || '').trim().toLowerCase();
  const normalizedQuery = normalizeToEnglishDigits(rawQuery);
  container.innerHTML = '';

  const filtered = shopState.products.filter(p => {
    const codeStr = normalizeToEnglishDigits(p.code || '').toLowerCase();
    return (p.name || '').toLowerCase().includes(rawQuery) || codeStr.includes(normalizedQuery);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:24px;color:#64748b;">কোনো পণ্য তালিকাভুক্ত নেই। "+ নতুন পণ্য" বাটনে চাপ দিয়ে পণ্য যুক্ত করুন।</div>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pos-item-card';
    card.innerHTML = `
      <div class="pos-item-left">
        <div class="pos-item-icon" style="font-size:13px;font-weight:700;color:#065f46;">#${p.code || '-'}</div>
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
      code: prod.code || '',
      name: prod.name,
      price: prod.price,
      unit: prod.unit || 'পিস',
      qty: 1
    });
  }

  updateCalcScreen();
  showToast(`🛒 "${prod.name}" (৳${toBanglaNum(prod.price)}) যোগ হয়েছে!`);
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
  const code = document.getElementById('newProdCode').value.trim();
  const name = document.getElementById('newProdName').value.trim();
  const price = parseFloat(document.getElementById('newProdPrice').value) || 0;
  const unit = document.getElementById('newProdUnit').value;
  const stock = parseInt(document.getElementById('newProdStock').value, 10) || 0;

  if (!name || price <= 0) return;

  shopState.products.unshift({
    id: 'p-' + Date.now(),
    code: code || String(shopState.products.length + 101),
    name,
    price,
    unit,
    stock
  });

  document.getElementById('newProdCode').value = '';
  document.getElementById('newProdName').value = '';
  document.getElementById('newProdPrice').value = '';
  closeModal('newProductModal');
  saveShopState();
  showToast(`✅ পণ্য "[#${code}] ${name}" যুক্ত হয়েছে!`);
}

function deletePosProduct(prodId) {
  shopState.products = shopState.products.filter(p => p.id !== prodId);
  saveShopState();
  showToast('🗑️ পণ্যটি মুছে ফেলা হয়েছে');
}

function toggleAutoReceipt(checked) {
  shopState.autoShowReceipt = checked;
  saveShopState();
  showToast(checked ? '🧾 অটো রসিদ চালু হয়েছে' : '🧾 অটো রসিদ বন্ধ করা হয়েছে');
}

// ============================================================================
// CUSTOMER LIST DROPDOWN (কাস্টমার লিস্ট)
// ============================================================================

function renderCustomerDropdown() {
  const select = document.getElementById('customerSelectDropdown');
  if (!select) return;

  select.innerHTML = `<option value="">-- কাস্টমার সিলেক্ট করুন --</option>`;

  shopState.customers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name}${c.due > 0 ? ` (বাকি: ৳${toBanglaNum(c.due)})` : ''}`;
    if (c.id === shopState.selectedCustomerId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  const selectedCust = shopState.customers.find(c => c.id === shopState.selectedCustomerId);
  document.getElementById('selectedCustBakiHint').textContent = selectedCust
    ? `${selectedCust.name}-এর খাতায়`
    : 'কাস্টমারের নামে বাকি';
}

function selectCustomerFromDropdown(custId) {
  shopState.selectedCustomerId = custId;
  renderCustomerDropdown();
}

function renderBakiCustomerList() {
  const container = document.getElementById('bakiCustomerList');
  const query = (document.getElementById('bakiSearchInput')?.value || '').trim().toLowerCase();
  container.innerHTML = '';

  const filtered = shopState.customers
    .filter(c => c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query)))
    .sort((a, b) => b.due - a.due);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:24px;color:#64748b;">কোনো কাস্টমার যোগ করা হয়নি। "+ নতুন কাস্টমার" বাটনে চাপ দিয়ে কাস্টমার যুক্ত করুন।</div>`;
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

  if (shopState.transactions.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:#64748b;">আজ এখনও কোনো লেনদেন হয়নি</div>`;
    return;
  }

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
// FULL CALCULATOR WITH +, -, ×, ÷, = AND POS CART
// ============================================================================

function evaluateManualCalc(expr) {
  if (!expr) return 0;
  try {
    // Keep only digits, ., +, -, *, /
    let clean = expr.replace(/[^0-9.+\-*/]/g, '');
    // Trim trailing operators so ongoing typing still shows live total
    clean = clean.replace(/[+\-*/.]+$/, '');
    if (!clean) return 0;
    const result = Function(`"use strict"; return (${clean})`)();
    if (!isFinite(result) || isNaN(result)) return 0;
    return Math.round(result * 100) / 100;
  } catch (e) {
    return 0;
  }
}

function getPosCartTotal() {
  return activePosCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getGrandTotalAmount() {
  return Math.max(0, Math.round((getPosCartTotal() + evaluateManualCalc(calcExpr)) * 100) / 100);
}

function pressCalc(key) {
  const operators = ['+', '-', '*', '/'];

  if (key === 'C') {
    calcExpr = '';
    activePosCart = [];
  } else if (key === 'BACK') {
    calcExpr = calcExpr.slice(0, -1);
  } else if (key === '=') {
    const val = evaluateManualCalc(calcExpr);
    calcExpr = val > 0 ? String(val) : '';
  } else if (key === '+100') {
    calcExpr = calcExpr ? `${calcExpr}+100` : '100';
  } else if (operators.includes(key)) {
    if (!calcExpr && getPosCartTotal() > 0) {
      // Allow continuing math from cart total if needed
      calcExpr = '';
    }
    if (calcExpr) {
      const lastChar = calcExpr.slice(-1);
      if (operators.includes(lastChar)) {
        calcExpr = calcExpr.slice(0, -1) + key;
      } else {
        calcExpr += key;
      }
    }
  } else {
    calcExpr += key;
  }

  updateCalcScreen();
}

function formatExprForDisplay(expr) {
  return expr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/\-/g, ' − ')
    .replace(/[0-9]/g, d => enToBnDigits[d] || d);
}

function updateCalcScreen() {
  const cartBar = document.getElementById('activeCartBar');
  const cartList = document.getElementById('activeCartItemsList');
  if (activePosCart.length > 0) {
    cartBar.classList.remove('hidden');
    cartList.innerHTML = activePosCart.map(item => `
      <span class="cart-pill">
        ${item.code ? `[#${item.code}] ` : ''}${item.name} ×${toBanglaNum(item.qty)} (৳${toBanglaNum(item.price * item.qty)})
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
    exprDisplay = `পণ্য ৳${toBanglaNum(cartTotal)} + (${formatExprForDisplay(calcExpr)})`;
  } else if (cartTotal > 0) {
    exprDisplay = `নির্বাচিত পণ্যের মোট: ৳${toBanglaNum(cartTotal)}`;
  } else if (calcExpr) {
    exprDisplay = formatExprForDisplay(calcExpr);
  } else {
    exprDisplay = 'হিসাব তুলুন';
  }

  document.getElementById('calcExpression').textContent = exprDisplay;
  document.getElementById('calcTotal').textContent = toBanglaNum(grandTotal);
}

function buildTransactionItemsAndNote(type, manualAmount, defaultLabel) {
  const items = activePosCart.map(i => ({
    id: i.id,
    code: i.code,
    name: i.name,
    qty: i.qty,
    price: i.price,
    unit: i.unit
  }));

  if (manualAmount > 0) {
    items.push({
      name: defaultLabel,
      qty: 1,
      price: manualAmount,
      unit: ''
    });
  }

  if (type === 'CASH_SALE' || type === 'BAKI_GIVEN') {
    activePosCart.forEach(cartItem => {
      const prod = shopState.products.find(p => p.id === cartItem.id);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - cartItem.qty);
      }
    });
  }

  const cartSummary = activePosCart.map(i => `${i.name} x${toBanglaNum(i.qty)}`).join(', ');
  const combinedNote = cartSummary || defaultLabel;

  return { items, note: combinedNote };
}

function recordInstantTransaction(type) {
  const amount = getGrandTotalAmount();
  if (amount <= 0) {
    showToast('⚠️ অনুগ্রহ করে আগে টাকার পরিমাণ তুলুন বা পণ্য বাছাই করুন!');
    return;
  }

  const manualAmount = evaluateManualCalc(calcExpr);
  const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  const todayDate = new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  const memoId = 'MEMO-' + String(1001 + shopState.transactions.length);

  const selectedCustomer = shopState.customers.find(c => c.id === shopState.selectedCustomerId);
  let newTx = null;

  if (type === 'CASH_SALE') {
    const { items, note } = buildTransactionItemsAndNote(type, manualAmount, 'নগদ বিক্রি');
    newTx = {
      id: memoId,
      type: 'CASH_SALE',
      amount,
      customerName: selectedCustomer ? selectedCustomer.name : 'নগদ কাস্টমার',
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
      showToast('⚠️ বাকি লেখার জন্য আগে কাস্টমার লিস্ট থেকে কাস্টমার সিলেক্ট করুন বা "+ নতুন কাস্টমার" যোগ করুন!');
      openModal('newCustomerModal');
      return;
    }
    const prevDue = selectedCustomer.due;
    selectedCustomer.due += amount;
    selectedCustomer.lastUpdated = `আজ ${nowTime}`;
    const { items, note } = buildTransactionItemsAndNote(type, manualAmount, 'বাকি বিক্রি');

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
    if (!selectedCustomer) {
      showToast('⚠️ বাকি জমা নেওয়ার জন্য আগে কাস্টমার লিস্ট থেকে কাস্টমার সিলেক্ট করুন!');
      return;
    }
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
    const { items, note } = buildTransactionItemsAndNote(type, manualAmount, 'দোকান খরচ / মাল কেনা');
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

  calcExpr = '';
  activePosCart = [];
  toggleProductDropdown(false);
  updateCalcScreen();
  saveShopState();

  if (shopState.autoShowReceipt && newTx) {
    renderReceiptModal(newTx);
  }
}

// ============================================================================
// DIGITAL RECEIPT / CASH MEMO GENERATOR
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
    showLastReceipt();
    return;
  }

  const manualAmount = evaluateManualCalc(calcExpr);
  const selectedCustomer = shopState.customers.find(c => c.id === shopState.selectedCustomerId);
  const { items, note } = buildTransactionItemsAndNote('PREVIEW', manualAmount, 'খুচরা পণ্য');

  const draftTx = {
    id: 'DRAFT',
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
      <td>${toBanglaNum(idx + 1)}. ${item.code ? `[#${item.code}] ` : ''}${item.name}</td>
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
      <p>${shopState.shopAddress || 'ডিজিটাল ক্যাশ মেমো'}</p>
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
  showToast('📋 ক্যাশ মেমো কপি হয়েছে!');
}

// ============================================================================
// BANGLA VOICE-TO-ACCOUNTING ENGINE
// ============================================================================

let recognition = null;
let isListening = false;

function toggleVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('micBtn');
  const liveText = document.getElementById('voiceLiveText');

  if (!SpeechRec) {
    showToast('⚠️ এই ব্রাউজারে ভয়েস মাইক সাপোর্ট করছে না (Google Chrome ব্যবহার করুন)');
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
    liveText.textContent = 'এখন মুখে বলুন...';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    processVoiceTranscript(transcript);
  };

  recognition.onerror = () => {
    liveText.textContent = 'ভয়েস শোনা যায়নি, আবার চেষ্টা করুন।';
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('listening');
    micBtn.textContent = '🎤 বলুন';
  };

  recognition.start();
}

function processVoiceTranscript(spokenText) {
  const liveText = document.getElementById('voiceLiveText');
  liveText.innerHTML = `🗣️ বলেছেন: <strong>"${spokenText}"</strong>`;

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
// CLOUD BACKUP & LICENSE ACTIVATION
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
  showToast(`✅ "${packName}" চালুর অনুরোধ পাঠানো হয়েছে!`);
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

window.addEventListener('DOMContentLoaded', () => {
  renderAllShopUI();
  updateCalcScreen();
  if ('caches' in window) {
    caches.keys().then(keys => {
      keys.forEach(k => {
        if (k !== 'dokankhata-v4') caches.delete(k);
      });
    });
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.update();
    }).catch(() => {});
  }
});
