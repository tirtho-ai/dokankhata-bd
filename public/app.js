// ============================================================================
// দোকান খাতা (DokanKhata BD) — Shopkeeper Mobile App Logic (v6)
// ============================================================================

const STORAGE_KEY = 'dokankhata_shop_state_v3';
const SESSION_KEY = 'dokankhata_user_session';

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
  const rounded = Math.round(n * 100) / 100;
  if (typeof shopState !== 'undefined' && shopState.language === 'en') {
    return rounded.toLocaleString('en-US');
  }
  return rounded.toLocaleString('en-IN').replace(/[0-9]/g, d => enToBnDigits[d] || d);
}

function normalizeToEnglishDigits(str) {
  return String(str || '').replace(/[০-৯]/g, d => bnToEnDigits[d] || d);
}

// Full Bilingual (Bangla / English) Translation Dictionary
const I18N = {
  bn: {
    appTitle: 'দোকান খাতা — বেচাকেনা ও বাকির হিসাব',
    loginTitle: 'দোকান খাতা',
    loginSub: 'বেচাকেনা ও বাকির ডিজিটাল খাতা',
    loginUserLabel: 'ইউজার আইডি বা মোবাইল নাম্বার *',
    loginUserPlaceholder: 'যেমন: demo বা 017XXXXXXXX',
    loginPassLabel: 'পাসওয়ার্ড *',
    loginPassPlaceholder: 'আপনার পাসওয়ার্ড দিন',
    loginBtn: 'লগইন করুন ➔',
    loginHelp: '💡 <strong>লগইন করতে পারছেন না?</strong> অ্যাডমিন বা প্ল্যাটফর্ম কর্তৃপক্ষের দেওয়া ইউজার আইডি ও পাসওয়ার্ড ব্যবহার করুন।',
    topbarLangLabel: 'English',
    topbarReceiptLabel: 'রসিদ',
    syncStatusBackup: 'ব্যাকআপ',
    sumTodayCash: 'আজকের নগদ বিক্রি',
    sumTotalBaki: 'মার্কেটে মোট বাকি',
    sumCashInHand: 'ক্যাশবাক্সে নগদ আছে',
    voiceTitle: '🎙️ মুখে বললেই হিসাব লেখা হবে!',
    voiceLiveText: 'বলুন বা নিচের ঘরে কিবোর্ডের মাইক 🎤 দিয়ে বলুন (যেমন: "তাহের ভাই ১৫০ বাকি")',
    voiceBtn: '🎤 বলুন',
    voicePlaceholder: '🎤 মোবাইলে কিবোর্ডের মাইক চেপে বলুন বা নাম/টাকা ঠিক করুন...',
    voiceGo: 'এন্ট্রি ✓',
    posToggle: '🛒 পণ্য বাছাই',
    newProductBtn: '+ নতুন পণ্য',
    autoReceipt: '🧾 অটো রসিদ',
    productSearchPlaceholder: '🔍 পণ্যের নাম বা কোড নাম্বার লিখে খুঁজুন...',
    calcExprDefault: 'হিসাব তুলুন',
    calcPreviewMemo: '🧾 মেমো দেখুন',
    custBarLabel: '👤 কাস্টমার লিস্ট:',
    custSearchPlaceholder: '🔍 নাম বা মোবাইল নাম্বার দিয়ে খুঁজুন...',
    newCustomerBtn: '+ নতুন কাস্টমার',
    actCashSale: 'নগদ বিক্রি',
    actCashSaleSub: '১ ট্যাপে ক্যাশ জমা',
    actBakiGiven: 'বাকি খাতায় যোগ',
    actBakiGivenSub: 'কাস্টমারের নামে বাকি',
    actBakiJama: 'বাকি টাকা আদায়',
    actBakiJamaSub: 'কাস্টমার জমা দিলো',
    actExpense: 'দোকান খরচ/মাল কেনা',
    actExpenseSub: 'ক্যাশ থেকে খরচ',
    tabFast: 'দ্রুত হিসাব',
    tabPos: 'পণ্য তালিকা',
    tabBaki: 'বাকির খাতা',
    tabKhata: 'আজকের খাতা',
    tabServices: 'সার্ভিস',
    lblProdCode: 'পণ্য কোড নাম্বার (ঐচ্ছিক)',
    prodCodePlaceholder: 'যেমন: 101 বা খালি রাখুন',
    lblProdPrice: 'বিক্রয় মূল্য (৳) *',
    lblProdName: 'পণ্যের নাম *',
    lblProdUnit: 'একক (Unit)',
    lblProdStock: 'বর্তমান স্টক পরিমাণ (ঐচ্ছিক)',
    btnSaveProduct: '✅ পণ্য তালিকায় সেভ করুন',
    bakiHeader: 'মার্কেটে মোট পাওনা (বাকি)',
    bakiSearchPlaceholder: '🔍 কাস্টমারের নাম বা মোবাইল দিয়ে খুঁজুন...',
    khataHeader: '📊 আজকের পূর্ণাঙ্গ হিসাব (ডিজিটাল খাতা)',
    khataCashSale: 'নগদ বিক্রি (+)',
    khataBakiJama: 'বাকি আদায়/জমা (+)',
    khataBakiGiven: 'আজ নতুন বাকি দেওয়া',
    khataExpense: 'দোকানের খরচ/মাল কেনা (-)',
    khataNetCash: 'এখন ক্যাশ বাক্সে নগদ থাকার কথা:',
    khataTxnsTitle: '📝 আজকের সকল লেনদেন ও রসিদ',
    khataBackupBtn: '⬇️ ব্যাকআপ ডাউনলোড'
  },
  en: {
    appTitle: 'DokanKhata BD — Smart Ledger & POS',
    loginTitle: 'DokanKhata BD',
    loginSub: 'Digital Business Ledger & POS',
    loginUserLabel: 'User ID or Phone Number *',
    loginUserPlaceholder: 'e.g. demo or 017XXXXXXXX',
    loginPassLabel: 'Password *',
    loginPassPlaceholder: 'Enter your password',
    loginBtn: 'Login ➔',
    loginHelp: '💡 <strong>Need help?</strong> Use the User ID & Password provided by your platform administrator.',
    topbarLangLabel: 'বাংলা',
    topbarReceiptLabel: 'Receipt',
    syncStatusBackup: 'Backup',
    sumTodayCash: "Today's Cash Sale",
    sumTotalBaki: 'Total Market Due',
    sumCashInHand: 'Cash in Drawer',
    voiceTitle: '🎙️ Voice Automated Ledger!',
    voiceLiveText: 'Speak or use keyboard mic 🎤 below (e.g., "Customer John 150 Due")',
    voiceBtn: '🎤 Speak',
    voicePlaceholder: '🎤 Tap mic or type customer name & amount...',
    voiceGo: 'Enter ✓',
    posToggle: '🛒 Select Product',
    newProductBtn: '+ New Product',
    autoReceipt: '🧾 Auto Receipt',
    productSearchPlaceholder: '🔍 Search product by name or code...',
    calcExprDefault: 'Enter Calculation',
    calcPreviewMemo: '🧾 View Memo',
    custBarLabel: '👤 Customer List:',
    custSearchPlaceholder: '🔍 Search customer by name or phone...',
    newCustomerBtn: '+ New Customer',
    actCashSale: 'Cash Sale',
    actCashSaleSub: '1-Tap Cash In',
    actBakiGiven: 'Add to Credit',
    actBakiGivenSub: 'Record Credit Sale',
    actBakiJama: 'Collect Due',
    actBakiJamaSub: 'Credit Payment In',
    actExpense: 'Shop Expense',
    actExpenseSub: 'Expense / Purchase',
    tabFast: 'Fast Calc',
    tabPos: 'Products',
    tabBaki: 'Due Ledger',
    tabKhata: 'Daily Ledger',
    tabServices: 'Services',
    lblProdCode: 'Product Code (Optional)',
    prodCodePlaceholder: 'e.g. 101 or leave empty',
    lblProdPrice: 'Sale Price (৳) *',
    lblProdName: 'Product Name *',
    lblProdUnit: 'Unit',
    lblProdStock: 'Current Stock Quantity (Optional)',
    btnSaveProduct: '✅ Save to Products',
    bakiHeader: 'Total Outstanding Customer Due',
    bakiSearchPlaceholder: '🔍 Search customer by name or phone...',
    khataHeader: "📊 Today's Complete Digital Ledger",
    khataCashSale: 'Cash Sale (+)',
    khataBakiJama: 'Due Payment Collected (+)',
    khataBakiGiven: 'New Due Given Today',
    khataExpense: 'Shop Expense / Purchases (-)',
    khataNetCash: 'Expected Cash in Drawer:',
    khataTxnsTitle: "📝 Today's Transactions & Receipts",
    khataBackupBtn: '⬇️ Download Backup'
  }
};

// Clean Initial State
const defaultShopState = {
  shopName: 'আমার দোকান',
  shopAddress: 'বাংলাদেশ',
  shopPhone: '',
  language: 'bn',
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
    if (typeof parsed.shopPhone !== 'string') parsed.shopPhone = '';
    if (!parsed.language) parsed.language = 'bn';
    // Always start with no customer stuck selected
    parsed.selectedCustomerId = '';
    return parsed;
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultShopState));
  }
}

function saveShopState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shopState));
  renderAllShopUI();
}

function checkCustomerSession() {
  const gate = document.getElementById('customerLoginGate');
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    if (gate) gate.classList.remove('hidden');
    return false;
  }
  try {
    const session = JSON.parse(raw);
    if (!session || !session.key) {
      if (gate) gate.classList.remove('hidden');
      return false;
    }
    // Session is valid
    if (session.language) shopState.language = session.language;
    if (session.shopName) shopState.shopName = session.shopName;
    if (session.shopAddress) shopState.shopAddress = session.shopAddress;
    if (session.shopPhone) shopState.shopPhone = session.shopPhone;
    if (session.key) shopState.licenseKey = session.key;
    if (session.packageTitle) shopState.packageTitle = session.packageTitle;

    if (gate) gate.classList.add('hidden');
    return true;
  } catch (e) {
    if (gate) gate.classList.remove('hidden');
    return false;
  }
}

async function handleCustomerLogin(e) {
  if (e) e.preventDefault();
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const errorBadge = document.getElementById('loginErrorBadge');
  const btn = document.getElementById('btnCustomerLoginText');

  const username = (usernameInput.value || '').trim();
  const password = (passwordInput.value || '').trim();

  if (!username || !password) {
    if (errorBadge) {
      errorBadge.textContent = shopState.language === 'en'
        ? 'Please enter both User ID and Password'
        : 'ইউজার আইডি ও পাসওয়ার্ড উভয়ই দিন।';
      errorBadge.classList.add('show');
    }
    return;
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = shopState.language === 'en' ? 'Verifying...' : 'যাচাই করা হচ্ছে...';

  try {
    const res = await fetch('/api/shop/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success && data.shop) {
      const shop = data.shop;
      const session = {
        username: shop.username,
        key: shop.key,
        shopName: shop.shopName,
        shopAddress: shop.shopAddress || '',
        shopPhone: shop.shopPhone || '',
        language: shop.language || 'bn',
        packageTitle: shop.packageTitle
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      shopState.licenseKey = shop.key;
      shopState.shopName = shop.shopName;
      shopState.shopAddress = shop.shopAddress || '';
      shopState.shopPhone = shop.shopPhone || '';
      shopState.language = shop.language || 'bn';
      if (shop.packageTitle) shopState.packageTitle = shop.packageTitle;

      saveShopState();
      applyLanguage(shopState.language);

      document.getElementById('customerLoginGate').classList.add('hidden');
      if (errorBadge) errorBadge.classList.remove('show');
      showToast(shopState.language === 'en' ? '✅ Welcome! Login successful.' : '✅ স্বাগতম! সফলভাবে লগইন হয়েছে।');
    } else {
      if (errorBadge) {
        errorBadge.textContent = data.message || (shopState.language === 'en' ? 'Invalid User ID or Password!' : 'ভুল ইউজার আইডি বা পাসওয়ার্ড!');
        errorBadge.classList.add('show');
      }
    }
  } catch (err) {
    if (errorBadge) {
      errorBadge.textContent = shopState.language === 'en' ? 'Network error! Please check connection.' : 'সার্ভার সংযোগ সমস্যা! ইন্টারনেট চেক করুন।';
      errorBadge.classList.add('show');
    }
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function logoutShopkeeper() {
  const confirmMsg = shopState.language === 'en'
    ? 'Are you sure you want to log out?'
    : 'আপনি কি নিশ্চিত যে দোকান খাতা থেকে বের হতে চান?';
  if (!confirm(confirmMsg)) return;

  localStorage.removeItem(SESSION_KEY);
  const gate = document.getElementById('customerLoginGate');
  if (gate) gate.classList.remove('hidden');
  document.getElementById('loginPassword').value = '';
  showToast(shopState.language === 'en' ? 'Logged out successfully' : 'লগআউট সফল হয়েছে');
}

function toggleAppLanguage(targetLang) {
  const newLang = targetLang || (shopState.language === 'en' ? 'bn' : 'en');
  setAppLanguage(newLang);
}

function setAppLanguage(newLang) {
  shopState.language = newLang;
  saveShopState();
  applyLanguage(newLang);

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const sess = JSON.parse(raw);
      sess.language = newLang;
      localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
      fetch('/api/shop/update-lang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: shopState.licenseKey, language: newLang })
      }).catch(() => {});
    }
  } catch (e) {}

  showToast(newLang === 'en' ? '🌐 Language switched to English' : '🌐 ভাষা বাংলায় পরিবর্তন করা হয়েছে');
}

function applyLanguage(lang) {
  const l = lang === 'en' ? 'en' : 'bn';
  const t = I18N[l];
  document.documentElement.lang = l;
  document.title = t.appTitle;

  // Login Gate texts
  const loginTitleEl = document.getElementById('loginTitleText');
  if (loginTitleEl) loginTitleEl.textContent = t.loginTitle;
  const loginSubEl = document.getElementById('loginSubText');
  if (loginSubEl) loginSubEl.textContent = t.loginSub;
  const lblLoginUser = document.getElementById('lblLoginUser');
  if (lblLoginUser) lblLoginUser.textContent = t.loginUserLabel;
  const loginUserInput = document.getElementById('loginUsername');
  if (loginUserInput) loginUserInput.placeholder = t.loginUserPlaceholder;
  const lblLoginPass = document.getElementById('lblLoginPass');
  if (lblLoginPass) lblLoginPass.textContent = t.loginPassLabel;
  const loginPassInput = document.getElementById('loginPassword');
  if (loginPassInput) loginPassInput.placeholder = t.loginPassPlaceholder;
  const btnLogin = document.getElementById('btnCustomerLoginText');
  if (btnLogin) btnLogin.textContent = t.loginBtn;
  const loginHelp = document.getElementById('loginHelpNote');
  if (loginHelp) loginHelp.innerHTML = t.loginHelp;

  const btnBn = document.getElementById('loginLangBtnBn');
  const btnEn = document.getElementById('loginLangBtnEn');
  if (btnBn && btnEn) {
    btnBn.classList.toggle('active', l === 'bn');
    btnEn.classList.toggle('active', l === 'en');
  }

  // Topbar
  const topbarLangLabel = document.getElementById('topbarLangLabel');
  if (topbarLangLabel) topbarLangLabel.textContent = t.topbarLangLabel;
  const topbarReceiptLabel = document.getElementById('topbarReceiptLabel');
  if (topbarReceiptLabel) topbarReceiptLabel.textContent = t.topbarReceiptLabel;

  // Summary strip
  const sumTodayCash = document.getElementById('sumLblTodayCash');
  if (sumTodayCash) sumTodayCash.textContent = t.sumTodayCash;
  const sumTotalBaki = document.getElementById('sumLblTotalBaki');
  if (sumTotalBaki) sumTotalBaki.textContent = t.sumTotalBaki;
  const sumCashInHand = document.getElementById('sumLblCashInHand');
  if (sumCashInHand) sumCashInHand.textContent = t.sumCashInHand;

  // Voice box
  const voiceHeaderStrong = document.querySelector('.voice-header strong');
  if (voiceHeaderStrong) voiceHeaderStrong.textContent = t.voiceTitle;
  const voiceLiveP = document.getElementById('voiceLiveText');
  if (voiceLiveP) voiceLiveP.textContent = t.voiceLiveText;
  const micBtn = document.getElementById('micBtn');
  if (micBtn) micBtn.textContent = t.voiceBtn;
  const voiceTextInput = document.getElementById('voiceTextInput');
  if (voiceTextInput) voiceTextInput.placeholder = t.voicePlaceholder;
  const voiceGoBtn = document.querySelector('.voice-go-btn');
  if (voiceGoBtn) voiceGoBtn.textContent = t.voiceGo;

  // Optional features bar
  const togglePosBtn = document.getElementById('togglePosDropdownBtn');
  if (togglePosBtn) togglePosBtn.innerHTML = `${t.posToggle} <span id="posToggleArrow">▾</span>`;
  const autoReceiptSpan = document.querySelector('.receipt-toggle-label span');
  if (autoReceiptSpan) autoReceiptSpan.textContent = t.autoReceipt;
  const prodSearchInput = document.getElementById('productDropdownSearchInput');
  if (prodSearchInput) prodSearchInput.placeholder = t.productSearchPlaceholder;

  // Calculator display & buttons
  const previewMemoBtn = document.querySelector('.preview-memo-btn');
  if (previewMemoBtn) previewMemoBtn.textContent = t.calcPreviewMemo;
  const custBarLabel = document.querySelector('.cust-bar-label');
  if (custBarLabel) custBarLabel.textContent = t.custBarLabel;
  const custSearchInput = document.getElementById('customerQuickSearchInput');
  if (custSearchInput) custSearchInput.placeholder = t.custSearchPlaceholder;

  // Instant actions
  const btnCashStrong = document.querySelector('.btn-cash strong');
  const btnCashSmall = document.querySelector('.btn-cash small');
  if (btnCashStrong) btnCashStrong.textContent = t.actCashSale;
  if (btnCashSmall) btnCashSmall.textContent = t.actCashSaleSub;

  const btnBakiStrong = document.querySelector('.btn-baki strong');
  const btnBakiSmall = document.querySelector('.btn-baki small');
  if (btnBakiStrong) btnBakiStrong.textContent = t.actBakiGiven;
  if (btnBakiSmall && !shopState.selectedCustomerId) btnBakiSmall.textContent = t.actBakiGivenSub;

  const btnJamaStrong = document.querySelector('.btn-jama strong');
  const btnJamaSmall = document.querySelector('.btn-jama small');
  if (btnJamaStrong) btnJamaStrong.textContent = t.actBakiJama;
  if (btnJamaSmall) btnJamaSmall.textContent = t.actBakiJamaSub;

  const btnExpenseStrong = document.querySelector('.btn-expense strong');
  const btnExpenseSmall = document.querySelector('.btn-expense small');
  if (btnExpenseStrong) btnExpenseStrong.textContent = t.actExpense;
  if (btnExpenseSmall) btnExpenseSmall.textContent = t.actExpenseSub;

  // Bottom nav
  const navFast = document.querySelector('.bottom-nav button[data-tab="fast"] span:last-child');
  if (navFast) navFast.textContent = t.tabFast;
  const navPos = document.querySelector('.bottom-nav button[data-tab="pos"] span:last-child');
  if (navPos) navPos.textContent = t.tabPos;
  const navBaki = document.querySelector('.bottom-nav button[data-tab="baki"] span:nth-child(2)');
  if (navBaki) navBaki.textContent = t.tabBaki;
  const navKhata = document.querySelector('.bottom-nav button[data-tab="khata"] span:last-child');
  if (navKhata) navKhata.textContent = t.tabKhata;
  const navServices = document.querySelector('.bottom-nav button[data-tab="services"] span:last-child');
  if (navServices) navServices.textContent = t.tabServices;

  // New product modal
  const lblProdCode = document.getElementById('lblProdCode');
  if (lblProdCode) lblProdCode.textContent = t.lblProdCode;
  const newProdCode = document.getElementById('newProdCode');
  if (newProdCode) newProdCode.placeholder = t.prodCodePlaceholder;
  const lblProdPrice = document.getElementById('lblProdPrice');
  if (lblProdPrice) lblProdPrice.textContent = t.lblProdPrice;
  const lblProdName = document.getElementById('lblProdName');
  if (lblProdName) lblProdName.textContent = t.lblProdName;
  const lblProdUnit = document.getElementById('lblProdUnit');
  if (lblProdUnit) lblProdUnit.textContent = t.lblProdUnit;
  const lblProdStock = document.getElementById('lblProdStock');
  if (lblProdStock) lblProdStock.textContent = t.lblProdStock;
  const btnSaveProd = document.getElementById('btnSaveProduct');
  if (btnSaveProd) btnSaveProd.textContent = t.btnSaveProduct;

  // Due Tab
  const bakiHdrSpan = document.querySelector('.baki-header-card div span');
  if (bakiHdrSpan) bakiHdrSpan.textContent = t.bakiHeader;
  const bakiSearch = document.getElementById('bakiSearchInput');
  if (bakiSearch) bakiSearch.placeholder = t.bakiSearchPlaceholder;

  // Daily Tab
  const khataH3 = document.querySelector('.daily-cashbox-card h3');
  if (khataH3) khataH3.textContent = t.khataHeader;
  const cbSpans = document.querySelectorAll('.cashbox-grid .cb-item span');
  if (cbSpans.length >= 4) {
    cbSpans[0].textContent = t.khataCashSale;
    cbSpans[1].textContent = t.khataBakiJama;
    cbSpans[2].textContent = t.khataBakiGiven;
    cbSpans[3].textContent = t.khataExpense;
  }
  const netCashSpan = document.querySelector('.net-cash-banner span');
  if (netCashSpan) netCashSpan.textContent = t.khataNetCash;
  const txnTitleH4 = document.querySelector('.section-title-row h4');
  if (txnTitleH4) txnTitleH4.textContent = t.khataTxnsTitle;
  const exportBtn = document.querySelector('.section-title-row button');
  if (exportBtn) exportBtn.textContent = t.khataBackupBtn;
}

// ============================================================================
// UI RENDERING
// ============================================================================

function renderAllShopUI() {
  document.getElementById('uiShopName').textContent = shopState.shopName || 'আমার দোকান';
  const subParts = [shopState.shopAddress, shopState.shopPhone].filter(Boolean);
  const subEl = document.getElementById('uiShopSubInfo');
  if (subEl) {
    subEl.textContent = subParts.length > 0
      ? subParts.join(' • 📞 ')
      : 'দোকানের নাম, ঠিকানা ও নাম্বার সেট করুন ✎';
  }

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
  renderCustomerSelectionState();
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
  const rawPrice = document.getElementById('newProdPrice').value;
  const price = parseFloat(normalizeToEnglishDigits(rawPrice)) || 0;
  const unit = document.getElementById('newProdUnit').value;
  const rawStock = document.getElementById('newProdStock').value;
  const stock = parseInt(normalizeToEnglishDigits(rawStock), 10) || 0;

  if (!name) {
    showToast(shopState.language === 'en' ? '⚠️ Please enter product name' : '⚠️ পণ্যের নাম লিখুন');
    return;
  }
  if (price <= 0) {
    showToast(shopState.language === 'en' ? '⚠️ Please enter a valid price' : '⚠️ সঠিক বিক্রয় মূল্য দিন');
    return;
  }

  shopState.products.unshift({
    id: 'p-' + Date.now(),
    code: code || '',
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
  const codePrefix = code ? `[#${code}] ` : '';
  showToast(shopState.language === 'en' ? `✅ Product "${codePrefix}${name}" saved!` : `✅ পণ্য "${codePrefix}${name}" যুক্ত হয়েছে!`);
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
// SEARCHABLE CUSTOMER LIST WITH AUTO-RESET AFTER BILL
// ============================================================================

function renderCustomerSelectionState() {
  const searchWrap = document.getElementById('customerSearchWrap');
  const badge = document.getElementById('selectedCustomerBadge');
  const badgeText = document.getElementById('selectedCustomerBadgeText');
  const hint = document.getElementById('selectedCustBakiHint');

  const selectedCust = shopState.customers.find(c => c.id === shopState.selectedCustomerId);

  if (selectedCust) {
    searchWrap.classList.add('hidden');
    badge.classList.remove('hidden');
    badgeText.textContent = `${selectedCust.name} ${selectedCust.phone ? '(' + selectedCust.phone + ')' : ''} • বাকি: ৳${toBanglaNum(selectedCust.due)}`;
    if (hint) hint.textContent = `${selectedCust.name}-এর খাতায়`;
  } else {
    shopState.selectedCustomerId = '';
    searchWrap.classList.remove('hidden');
    badge.classList.add('hidden');
    if (hint) hint.textContent = 'কাস্টমারের নামে বাকি';
  }
}

function openCustomerSearchDropdown() {
  const dd = document.getElementById('customerSearchDropdownList');
  if (!dd) return;
  dd.classList.remove('hidden');
  renderCustomerSearchDropdown();
}

function renderCustomerSearchDropdown() {
  const dd = document.getElementById('customerSearchDropdownList');
  const input = document.getElementById('customerQuickSearchInput');
  if (!dd || !input) return;

  const rawQuery = input.value.trim().toLowerCase();
  const normQuery = normalizeToEnglishDigits(rawQuery);
  dd.classList.remove('hidden');
  dd.innerHTML = '';

  if (shopState.customers.length === 0) {
    dd.innerHTML = `<div style="padding:10px;text-align:center;color:#64748b;font-size:12px;">কোনো কাস্টমার নেই। "+ নতুন কাস্টমার" চাপুন।</div>`;
    return;
  }

  const matches = shopState.customers.filter(c => {
    const nameMatch = (c.name || '').toLowerCase().includes(rawQuery);
    const phoneNorm = normalizeToEnglishDigits(c.phone || '').toLowerCase();
    const phoneMatch = normQuery && phoneNorm.includes(normQuery);
    return !rawQuery || nameMatch || phoneMatch;
  });

  if (matches.length === 0) {
    dd.innerHTML = `<div style="padding:10px;text-align:center;color:#64748b;font-size:12px;">এই নাম বা নাম্বারের কাস্টমার পাওয়া যায়নি</div>`;
    return;
  }

  matches.forEach(c => {
    const item = document.createElement('div');
    item.className = 'cust-dd-item';
    item.onclick = () => selectCustomerForCurrentBill(c.id);
    item.innerHTML = `
      <div>
        <strong>${c.name}</strong>
        ${c.phone ? `<small style="color:#64748b;margin-left:6px;">📞 ${c.phone}</small>` : ''}
      </div>
      <span style="font-weight:700;color:${c.due > 0 ? '#dc2626' : '#059669'};">
        ${c.due > 0 ? 'বাকি: ৳' + toBanglaNum(c.due) : '৳০'}
      </span>
    `;
    dd.appendChild(item);
  });
}

function selectCustomerForCurrentBill(custId) {
  shopState.selectedCustomerId = custId;
  const input = document.getElementById('customerQuickSearchInput');
  const dd = document.getElementById('customerSearchDropdownList');
  if (input) input.value = '';
  if (dd) dd.classList.add('hidden');
  renderCustomerSelectionState();
}

function clearSelectedCustomer() {
  shopState.selectedCustomerId = '';
  const input = document.getElementById('customerQuickSearchInput');
  const dd = document.getElementById('customerSearchDropdownList');
  if (input) input.value = '';
  if (dd) dd.classList.add('hidden');
  renderCustomerSelectionState();
}

// Close customer search dropdown when clicking outside
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('customerSearchWrap');
  const dd = document.getElementById('customerSearchDropdownList');
  if (wrap && dd && !wrap.contains(e.target)) {
    dd.classList.add('hidden');
  }
});

function renderBakiCustomerList() {
  const container = document.getElementById('bakiCustomerList');
  const rawQuery = (document.getElementById('bakiSearchInput')?.value || '').trim().toLowerCase();
  const normQuery = normalizeToEnglishDigits(rawQuery);
  container.innerHTML = '';

  const filtered = shopState.customers
    .filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes(rawQuery);
      const phoneMatch = normalizeToEnglishDigits(c.phone || '').includes(normQuery);
      return nameMatch || phoneMatch;
    })
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
    let clean = expr.replace(/[^0-9.+\-*/]/g, '');
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
  let res = expr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/\-/g, ' − ');
  if (shopState && shopState.language === 'en') {
    return res;
  }
  return res.replace(/[0-9]/g, d => enToBnDigits[d] || d);
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
    exprDisplay = shopState.language === 'en'
      ? `Items ৳${toBanglaNum(cartTotal)} + (${formatExprForDisplay(calcExpr)})`
      : `পণ্য ৳${toBanglaNum(cartTotal)} + (${formatExprForDisplay(calcExpr)})`;
  } else if (cartTotal > 0) {
    exprDisplay = shopState.language === 'en'
      ? `Selected items total: ৳${toBanglaNum(cartTotal)}`
      : `নির্বাচিত পণ্যের মোট: ৳${toBanglaNum(cartTotal)}`;
  } else if (calcExpr) {
    exprDisplay = formatExprForDisplay(calcExpr);
  } else {
    exprDisplay = shopState.language === 'en' ? 'Enter Calculation' : 'হিসাব তুলুন';
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
      showToast('⚠️ বাকি লেখার জন্য আগে কাস্টমার লিস্ট থেকে নাম বা নাম্বার দিয়ে কাস্টমার সিলেক্ট করুন!');
      const searchIn = document.getElementById('customerQuickSearchInput');
      if (searchIn) {
        searchIn.focus();
        openCustomerSearchDropdown();
      }
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
      const searchIn = document.getElementById('customerQuickSearchInput');
      if (searchIn) {
        searchIn.focus();
        openCustomerSearchDropdown();
      }
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

  // AUTO-RESET: Clear calculator, cart, AND selected customer so next bill starts fresh!
  calcExpr = '';
  activePosCart = [];
  shopState.selectedCustomerId = '';
  clearSelectedCustomer();
  toggleProductDropdown(false);
  updateCalcScreen();
  saveShopState();

  if (shopState.autoShowReceipt && newTx) {
    renderReceiptModal(newTx);
  }
}

// ============================================================================
// DIGITAL RECEIPT / CASH MEMO + HIGH-RES JPG IMAGE GENERATOR FOR WHATSAPP
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
      <h4>🏪 ${shopState.shopName || 'আমার দোকান'}</h4>
      <p>📍 ঠিকানা: ${shopState.shopAddress || 'বাংলাদেশ'}</p>
      <p>📞 মোবাইল: ${shopState.shopPhone || 'দেওয়া হয়নি'}</p>
      <div style="display:inline-block;margin-top:6px;padding:3px 12px;border-radius:99px;font-size:11.5px;font-weight:700;background:${badge.bg};color:${badge.color};">
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
      <small>ডিজিটাল ক্যাশ মেমো • <strong>দোকান খাতা</strong></small>
    </div>
  `;

  openModal('receiptModal');
}

// Generate an actual High-Resolution Visual Receipt Image (Canvas -> JPG/PNG)
function generateReceiptCanvas(tx) {
  const itemsList = (tx.items && tx.items.length > 0)
    ? tx.items
    : [{ name: tx.note || 'সাধারণ পণ্য', qty: 1, price: tx.amount, unit: '' }];

  const width = 680;
  const baseHeight = 460;
  const rowHeight = 38;
  const height = baseHeight + (itemsList.length * rowHeight);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Paper Background
  ctx.fillStyle = '#fffef9';
  ctx.fillRect(0, 0, width, height);

  // Top Green Header Banner
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, width, 125);

  // Shop Name, Address, Phone
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
  ctx.fillText(shopState.shopName || 'আমার দোকান', width / 2, 44);

  ctx.fillStyle = '#d1fae5';
  ctx.font = '600 17px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
  ctx.fillText(`ঠিকানা: ${shopState.shopAddress || 'বাংলাদেশ'}`, width / 2, 76);
  ctx.fillText(`মোবাইল: ${shopState.shopPhone || '-'}`, width / 2, 104);

  // Status Badge
  const statusLabels = {
    'CASH_SALE': 'নগদ পরিশোধিত (PAID)',
    'BAKI_GIVEN': 'বাকি খাতায় যুক্ত (DUE)',
    'BAKI_JAMA': 'বাকি টাকা জমা রসিদ',
    'EXPENSE': 'দোকান খরচ ভাউচার'
  };
  const statusText = statusLabels[tx.type] || statusLabels.CASH_SALE;

  let y = 160;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
  ctx.fillText(`ক্যাশ মেমো / রসিদ — [${statusText}]`, width / 2, y);

  y += 28;
  ctx.strokeStyle = '#94a3b8';
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(30, y);
  ctx.lineTo(width - 30, y);
  ctx.stroke();

  // Meta Info (Memo No, Date, Customer)
  y += 30;
  ctx.textAlign = 'left';
  ctx.font = '600 17px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(`মেমো নং: #${tx.id}`, 35, y);
  ctx.textAlign = 'right';
  ctx.fillText(`তারিখ: ${tx.date || 'আজ'} (${tx.time})`, width - 35, y);

  y += 28;
  ctx.textAlign = 'left';
  ctx.fillText(`ক্রেতা: ${tx.customerName}`, 35, y);
  if (tx.customerPhone) {
    ctx.textAlign = 'right';
    ctx.fillText(`মোবাইল: ${tx.customerPhone}`, width - 35, y);
  }

  y += 18;
  ctx.beginPath();
  ctx.moveTo(30, y);
  ctx.lineTo(width - 30, y);
  ctx.stroke();

  // Table Header
  y += 28;
  ctx.fillStyle = '#064e3b';
  ctx.font = 'bold 17px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('বিবরণ (পণ্য)', 35, y);
  ctx.textAlign = 'center';
  ctx.fillText('পরিমাণ', width / 2 + 40, y);
  ctx.textAlign = 'right';
  ctx.fillText('টাকা', width - 35, y);

  y += 12;
  ctx.setLineDash([]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(30, y);
  ctx.lineTo(width - 30, y);
  ctx.stroke();

  // Table Rows
  ctx.font = '600 17px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#0f172a';
  itemsList.forEach((item, idx) => {
    y += rowHeight;
    const label = `${toBanglaNum(idx + 1)}. ${item.code ? '[#' + item.code + '] ' : ''}${item.name}`;
    ctx.textAlign = 'left';
    ctx.fillText(label.slice(0, 34), 35, y);
    ctx.textAlign = 'center';
    ctx.fillText(`${toBanglaNum(item.qty)} ${item.unit || ''}`, width / 2 + 40, y);
    ctx.textAlign = 'right';
    ctx.fillText(`৳ ${toBanglaNum(item.price * item.qty)}`, width - 35, y);
  });

  // Totals Divider
  y += 22;
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(30, y);
  ctx.lineTo(width - 30, y);
  ctx.stroke();

  // Grand Total
  y += 34;
  ctx.font = 'bold 24px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#064e3b';
  ctx.textAlign = 'left';
  ctx.fillText('মোট বিল / লেনদেন:', 35, y);
  ctx.textAlign = 'right';
  ctx.fillText(`৳ ${toBanglaNum(tx.amount)}`, width - 35, y);

  // Previous & Current Due
  if (typeof tx.newDue === 'number') {
    y += 30;
    ctx.font = '600 17px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText('পূর্বের বকেয়া (বাকি):', 35, y);
    ctx.textAlign = 'right';
    ctx.fillText(`৳ ${toBanglaNum(tx.previousDue || 0)}`, width - 35, y);

    y += 28;
    ctx.font = 'bold 19px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'left';
    ctx.fillText('বর্তমান মোট বকেয়া (পাওনা):', 35, y);
    ctx.textAlign = 'right';
    ctx.fillText(`৳ ${toBanglaNum(tx.newDue)}`, width - 35, y);
  }

  // Footer
  y += 42;
  ctx.textAlign = 'center';
  ctx.font = '600 15px "Noto Sans Bengali", "Hind Siliguri", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('ধন্যবাদ! আবার আসবেন। • ডিজিটাল ক্যাশ মেমো (দোকান খাতা)', width / 2, y);

  // Outer Border
  ctx.setLineDash([]);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  return canvas;
}

function downloadReceiptJPG() {
  if (!currentReceiptData) return;
  const canvas = generateReceiptCanvas(currentReceiptData);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `cash-memo-${currentReceiptData.id}.jpg`;
  a.click();
  showToast('🖼️ রসিদ ছবি (JPG) ডাউনলোড হয়েছে!');
}

async function shareReceiptAsImageWhatsApp() {
  if (!currentReceiptData) return;
  const canvas = generateReceiptCanvas(currentReceiptData);

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], `memo-${currentReceiptData.id}.jpg`, { type: 'image/jpeg' });

    // 1. Mobile Native File Share (Directly attaches the Receipt Image to WhatsApp!)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${shopState.shopName} - ক্যাশ মেমো #${currentReceiptData.id}`,
          text: `${shopState.shopName} — মোট বিল: ৳${toBanglaNum(currentReceiptData.amount)}`
        });
        return;
      } catch (err) {
        // User cancelled or fallback needed
      }
    }

    // 2. Desktop / Fallback: Copy Image to Clipboard + Download JPG + Open WhatsApp
    try {
      canvas.toBlob(async (pngBlob) => {
        if (pngBlob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
          showToast('📋 রসিদের ছবি কপি হয়েছে! WhatsApp চ্যাটে গিয়ে Ctrl+V (Paste) চাপুন!');
        }
      }, 'image/png');
    } catch (e) {}

    // Also download the JPG so they have the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memo-${currentReceiptData.id}.jpg`;
    a.click();

    // Open WhatsApp Chat for that customer
    const phoneClean = (currentReceiptData.customerPhone || '').replace(/[^0-9]/g, '');
    const bdPhone = phoneClean ? (phoneClean.startsWith('88') ? phoneClean : `88${phoneClean}`) : '';
    const caption = `🧾 *${shopState.shopName}* — মেমো #${currentReceiptData.id} (মোট: ৳${toBanglaNum(currentReceiptData.amount)})`;
    const waUrl = bdPhone
      ? `https://wa.me/${bdPhone}?text=${encodeURIComponent(caption)}`
      : `https://wa.me/?text=${encodeURIComponent(caption)}`;
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 600);
  }, 'image/jpeg', 0.95);
}

// ============================================================================
// SMART BANGLA VOICE-TO-ACCOUNTING ENGINE (WITH FUZZY CUSTOMER NAME MATCHING)
// ============================================================================

let recognition = null;
let isListening = false;
let latestInterimTranscript = '';

// Normalize Bangla phonetic variations so slightly misheard names still match existing customers!
function normalizeBanglaPhonetic(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/ভাই|ভাবী|ভাবি|আপা|চাচা|মামা|কাকা|সাহেব|হাজী|ডাক্তার|মেম্বার/g, '')
    .replace(/[ঈই]/g, 'ই')
    .replace(/[ঊউ]/g, 'উ')
    .replace(/[শষস]/g, 'স')
    .replace(/[ড়ঢ়র]/g, 'র')
    .replace(/[ণন]/g, 'ন')
    .replace(/[যজ]/g, 'জ')
    .replace(/[তৎ]/g, 'ত')
    .replace(/[োও]/g, 'ও')
    .replace(/[েএ]/g, 'এ')
    .replace(/[^ঀ-৿a-z0-9]/g, '')
    .trim();
}

function editDistance(a, b) {
  if (!a || !b) return 99;
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function findBestMatchingCustomer(spokenText) {
  if (shopState.customers.length === 0) return null;

  const cleanSpoken = spokenText.replace(/[০-৯0-9]+|টাকা|বাকি|জমা|নগদ|বিক্রি|আদায়|খরচ/g, '').trim();
  const normSpoken = normalizeBanglaPhonetic(cleanSpoken);
  if (!normSpoken) return null;

  let bestCust = null;
  let bestScore = 99;

  for (const c of shopState.customers) {
    const firstWord = c.name.split(' ')[0];
    if (spokenText.includes(firstWord) || cleanSpoken.includes(firstWord)) {
      return c; // Direct match
    }
    const normCust = normalizeBanglaPhonetic(c.name);
    const normFirst = normalizeBanglaPhonetic(firstWord);

    if (normCust && (normSpoken.includes(normCust) || normCust.includes(normSpoken))) {
      return c;
    }

    const dist1 = editDistance(normSpoken, normCust);
    const dist2 = editDistance(normSpoken, normFirst);
    const minDist = Math.min(dist1, dist2);

    // Allow up to 2 phonetic character differences (e.g., তাহের vs তাহির)
    if (minDist <= 2 && minDist < bestScore) {
      bestScore = minDist;
      bestCust = c;
    }
  }

  return bestCust;
}

function toggleVoiceRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('micBtn');
  const liveText = document.getElementById('voiceLiveText');
  const voiceInput = document.getElementById('voiceTextInput');

  if (!SpeechRec) {
    if (voiceInput) voiceInput.focus();
    showToast('🎤 নিচের ঘরে ট্যাপ করে আপনার মোবাইল কিবোর্ডের মাইক বাটন চেপে বলুন!');
    return;
  }

  if (isListening && recognition) {
    recognition.stop();
    return;
  }

  try {
    recognition = new SpeechRec();
    recognition.lang = 'bn-BD';
    // interimResults = true ensures Android Chrome captures speech even if onend fires quickly!
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;
    latestInterimTranscript = '';

    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add('listening');
      micBtn.textContent = '🛑 শুনছি...';
      liveText.textContent = 'এখন স্পষ্ট করে বলুন... (যেমন: "তাহের ভাই ১৫০ টাকা বাকি")';
    };

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += t;
        } else {
          interimStr += t;
        }
      }
      latestInterimTranscript = (finalStr || interimStr).trim();
      if (voiceInput && latestInterimTranscript) {
        voiceInput.value = latestInterimTranscript;
      }
      if (finalStr) {
        const toProcess = finalStr.trim();
        latestInterimTranscript = '';
        processVoiceTranscript(toProcess);
      }
    };

    recognition.onerror = (err) => {
      if (err.error === 'not-allowed') {
        liveText.textContent = 'মাইক্রোফোন পারমিশন দেওয়া নেই। নিচের ঘরে কিবোর্ডের মাইক 🎤 ব্যবহার করুন।';
      } else {
        liveText.textContent = 'শোনা যায়নি। নিচের ঘরে কিবোর্ডের মাইক 🎤 চেপে বলুন বা লিখে "এন্ট্রি ✓" চাপুন।';
      }
      if (voiceInput) voiceInput.focus();
    };

    recognition.onend = () => {
      isListening = false;
      micBtn.classList.remove('listening');
      micBtn.textContent = '🎤 বলুন';
      // If Android Chrome ended with only interim result, process it now!
      if (latestInterimTranscript) {
        const pending = latestInterimTranscript;
        latestInterimTranscript = '';
        processVoiceTranscript(pending);
      }
    };

    recognition.start();
  } catch (e) {
    if (voiceInput) voiceInput.focus();
    showToast('🎤 নিচের বক্সে কিবোর্ডের মাইক দিয়ে বলুন');
  }
}

function runVoiceTextCommand() {
  const input = document.getElementById('voiceTextInput');
  if (!input || !input.value.trim()) {
    showToast('⚠️ আগে মুখে বলুন বা নিচের ঘরে নাম ও টাকা লিখুন!');
    return;
  }
  const text = input.value.trim();
  input.value = '';
  processVoiceTranscript(text);
}

function processVoiceTranscript(spokenText) {
  const liveText = document.getElementById('voiceLiveText');
  const voiceInput = document.getElementById('voiceTextInput');
  liveText.innerHTML = `🗣️ বলেছেন: <strong>"${spokenText}"</strong>`;
  if (voiceInput) voiceInput.value = spokenText;

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
    showToast('⚠️ ভয়েসে টাকার পরিমাণ বোঝা যায়নি! নিচের ঘরে টাকা লিখে "এন্ট্রি ✓" চাপুন।');
    return;
  }

  let txType = 'CASH_SALE';
  if (spokenText.includes('বাকি') || spokenText.includes('পাওনা') || spokenText.toLowerCase().includes('baki')) {
    txType = 'BAKI_GIVEN';
  } else if (spokenText.includes('জমা') || spokenText.includes('আদায়') || spokenText.includes('দিলো') || spokenText.toLowerCase().includes('jama')) {
    txType = 'BAKI_JAMA';
  } else if (spokenText.includes('খরচ') || spokenText.includes('ভাড়া')) {
    txType = 'EXPENSE';
  }

  if (txType === 'BAKI_GIVEN' || txType === 'BAKI_JAMA') {
    let matchedCust = findBestMatchingCustomer(spokenText);

    if (!matchedCust) {
      const nameGuess = spokenText.replace(/[০-৯0-9]+|টাকা|বাকি|জমা|নগদ|বিক্রি|আদায়|খরচ|baki|taka|jama/gi, '').trim();
      if (nameGuess) {
        matchedCust = {
          id: 'c-' + Date.now(),
          name: nameGuess,
          phone: '',
          due: 0,
          lastUpdated: 'এইমাত্র'
        };
        shopState.customers.unshift(matchedCust);
      }
    }
    if (matchedCust) {
      shopState.selectedCustomerId = matchedCust.id;
    }
  }

  if (voiceInput) voiceInput.value = '';
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
  const msg = `আসসালামু আলাইকুম ${cust.name},\n*${shopState.shopName}* (${shopState.shopAddress})-এ আপনার বর্তমান বাকি হিসাব: *৳ ${toBanglaNum(cust.due)}*।\nঅনুগ্রহ করে সুবিধামতো পরিশোধ করার অনুরোধ রইলো।`;
  const phoneClean = (cust.phone || '').replace(/[^0-9]/g, '');
  const bdPhone = phoneClean.startsWith('88') ? phoneClean : `88${phoneClean}`;
  const waUrl = `https://wa.me/${bdPhone}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

// ============================================================================
// CLOUD BACKUP & SEPARATE SHOP NAME / ADDRESS / PHONE SETTINGS
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
  const shopPhone = document.getElementById('modalShopPhoneInput')?.value.trim();
  const key = document.getElementById('modalLicenseKeyInput').value.trim().toUpperCase();

  if (shopName) shopState.shopName = shopName;
  if (typeof shopAddress === 'string') shopState.shopAddress = shopAddress;
  if (typeof shopPhone === 'string') shopState.shopPhone = shopPhone;

  try {
    const res = await fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, shopName: shopState.shopName, phone: shopState.shopPhone })
    });
    const data = await res.json();
    if (data.success) {
      shopState.licenseKey = data.license.key;
      if (shopName) shopState.shopName = shopName;
      shopState.packageTitle = data.license.packageTitle;
      shopState.cloudBackupActive = data.license.addons.cloudBackup.active;
      shopState.smsBalance = data.license.addons.smsPack.balance;
      saveShopState();
      closeModal('licenseModal');
      showToast('✅ দোকানের নাম, ঠিকানা, নাম্বার ও লাইসেন্স সেভ হয়েছে!');
    } else {
      saveShopState();
      closeModal('licenseModal');
      showToast('✅ দোকানের নাম, ঠিকানা ও মোবাইল নাম্বার সেভ হয়েছে!');
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
    document.getElementById('modalShopNameInput').value = shopState.shopName || '';
    if (document.getElementById('modalShopAddressInput')) {
      document.getElementById('modalShopAddressInput').value = shopState.shopAddress || '';
    }
    if (document.getElementById('modalShopPhoneInput')) {
      document.getElementById('modalShopPhoneInput').value = shopState.shopPhone || '';
    }
    document.getElementById('modalLicenseKeyInput').value = shopState.licenseKey || '';
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
  }, 3500);
}

window.addEventListener('DOMContentLoaded', () => {
  checkCustomerSession();
  applyLanguage(shopState.language || 'bn');
  renderAllShopUI();
  updateCalcScreen();
  if ('caches' in window) {
    caches.keys().then(keys => {
      keys.forEach(k => {
        if (k !== 'dokankhata-v6') caches.delete(k);
      });
    });
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js?v=6').then(reg => {
      reg.update();
    }).catch(() => {});
  }
});
