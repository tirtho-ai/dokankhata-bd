const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'platform_db.json');

// Initial seed data for the Business Owner (Super Admin) & Demo Shops
const initialDB = {
  licenses: [
    {
      key: 'DOKAN-1500-DEMO',
      shopName: 'বিসমিল্লাহ মুদি স্টোর',
      ownerName: 'হাজী মো: আব্দুল করিম',
      phone: '01711223344',
      shopType: 'মুদি দোকান (Grocery)',
      packageTitle: 'স্ট্যান্ডার্ড লাইফটাইম (১,৫০০ ৳)',
      oneTimePrice: 1500,
      status: 'ACTIVE',
      createdAt: '2026-10-10T10:00:00Z',
      activatedAt: '2026-10-10T10:05:00Z',
      addons: {
        cloudBackup: {
          active: true,
          plan: 'Yearly (৫০০ ৳/বছর)',
          expiresAt: '2027-10-10',
          lastSync: 'আজ রাত ৮:৩০'
        },
        smsPack: {
          active: true,
          balance: 485,
          totalPurchased: 500
        },
        voiceInputPro: {
          active: true
        }
      }
    },
    {
      key: 'DOKAN-1000-2026',
      shopName: 'মায়ের দোয়া কসমেটিক্স',
      ownerName: 'মো: সাইফুল ইসলাম',
      phone: '01819887766',
      shopType: 'কসমেটিক্স ও ভ্যারাইটিজ',
      packageTitle: 'বেসিক লাইফটাইম (১,০০০ ৳)',
      oneTimePrice: 1000,
      status: 'ACTIVE',
      createdAt: '2026-10-14T12:00:00Z',
      activatedAt: '2026-10-14T12:30:00Z',
      addons: {
        cloudBackup: {
          active: false,
          plan: 'নেই',
          expiresAt: null,
          lastSync: null
        },
        smsPack: {
          active: true,
          balance: 92,
          totalPurchased: 100
        },
        voiceInputPro: {
          active: true
        }
      }
    },
    {
      key: 'DOKAN-2500-VIP1',
      shopName: 'নিউ ফ্যাশন বস্ত্রালয়',
      ownerName: 'আলহাজ্ব রফিকুল ইসলাম',
      phone: '01911554433',
      shopType: 'কাপড়ের দোকান (Clothing)',
      packageTitle: 'প্রিমিয়াম প্রো লাইফটাইম (২,৫০০ ৳)',
      oneTimePrice: 2500,
      status: 'UNUSED',
      createdAt: '2026-10-16T08:00:00Z',
      activatedAt: null,
      addons: {
        cloudBackup: {
          active: true,
          plan: '1 Year Free Included',
          expiresAt: '2027-10-16',
          lastSync: null
        },
        smsPack: {
          active: true,
          balance: 500,
          totalPurchased: 500
        },
        voiceInputPro: {
          active: true
        }
      }
    }
  ],
  addonSales: [
    { id: 'ADD-1', shopName: 'বিসমিল্লাহ মুদি স্টোর', type: 'বাৎসরিক ক্লাউড ব্যাকআপ প্যাক', amount: 500, date: '2026-10-10' },
    { id: 'ADD-2', shopName: 'বিসমিল্লাহ মুদি স্টোর', type: '৫০০ তাগাদা এসএমএস প্যাক', amount: 250, date: '2026-10-11' },
    { id: 'ADD-3', shopName: 'মায়ের দোয়া কসমেটিক্স', type: '১০০ তাগাদা এসএমএস প্যাক', amount: 60, date: '2026-10-14' }
  ],
  cloudBackups: {},
  smsLogs: []
};

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf8');
      return initialDB;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return initialDB;
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 200, { ok: true });
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // API 1: Get Admin Overview (Licenses, Revenue, Add-ons)
  if (pathname === '/api/admin/overview' && req.method === 'GET') {
    const db = loadDB();
    const oneTimeRevenue = db.licenses.reduce((sum, l) => sum + (Number(l.oneTimePrice) || 0), 0);
    const addonRevenue = db.addonSales.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    return sendJSON(res, 200, {
      licenses: db.licenses,
      addonSales: db.addonSales,
      smsLogs: db.smsLogs.slice(-20).reverse(),
      stats: {
        totalShops: db.licenses.length,
        activeShops: db.licenses.filter(l => l.status === 'ACTIVE').length,
        oneTimeRevenue,
        addonRevenue,
        totalRevenue: oneTimeRevenue + addonRevenue
      }
    });
  }

  // API 2: Generate a new License Key for a Shopkeeper (500 - 2500 BDT)
  if (pathname === '/api/admin/generate-license' && req.method === 'POST') {
    const body = await parseBody(req);
    const db = loadDB();
    const price = Number(body.oneTimePrice) || 1500;
    const randomCode = crypto.randomBytes(2).toString('hex').toUpperCase();
    const key = `DOKAN-${price}-${randomCode}`;

    const includeCloud = price >= 2000 || Boolean(body.includeCloud);
    const initialSms = price >= 2500 ? 500 : price >= 1500 ? 100 : 20;

    const newLicense = {
      key,
      shopName: body.shopName || 'নতুন দোকান',
      ownerName: body.ownerName || 'দোকানদার ভাই',
      phone: body.phone || '01700000000',
      shopType: body.shopType || 'মুদি দোকান (Grocery)',
      packageTitle: body.packageTitle || `লাইফটাইম লাইসেন্স (${price} ৳)`,
      oneTimePrice: price,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      addons: {
        cloudBackup: {
          active: includeCloud,
          plan: includeCloud ? 'Yearly (অন্তর্ভুক্ত)' : 'নেই',
          expiresAt: includeCloud ? '2027-10-16' : null,
          lastSync: null
        },
        smsPack: {
          active: true,
          balance: initialSms,
          totalPurchased: initialSms
        },
        voiceInputPro: {
          active: true
        }
      }
    };

    db.licenses.unshift(newLicense);
    saveDB(db);
    return sendJSON(res, 200, { success: true, license: newLicense });
  }

  // API 3: Verify / Activate License Key from Shopkeeper Mobile App
  if (pathname === '/api/license/verify' && req.method === 'POST') {
    const body = await parseBody(req);
    const key = (body.key || '').trim().toUpperCase();
    const db = loadDB();
    const found = db.licenses.find(l => l.key.toUpperCase() === key);

    if (!found) {
      return sendJSON(res, 404, {
        success: false,
        message: 'দুঃখিত! এই লাইসেন্স কোডটি সঠিক নয়। অনুগ্রহ করে সঠিক কোড দিন।'
      });
    }

    found.status = 'ACTIVE';
    if (!found.activatedAt) {
      found.activatedAt = new Date().toISOString();
    }
    if (body.shopName) found.shopName = body.shopName;
    if (body.phone) found.phone = body.phone;

    saveDB(db);
    return sendJSON(res, 200, {
      success: true,
      message: 'অভিনন্দন! আপনার দোকানের লাইফটাইম লাইসেন্স সফলভাবে চালু হয়েছে।',
      license: found
    });
  }

  // API 4: Add Monthly/Yearly Extra Service Package (Cloud Backup / SMS Pack)
  if (pathname === '/api/admin/activate-addon' && req.method === 'POST') {
    const body = await parseBody(req);
    const db = loadDB();
    const license = db.licenses.find(l => l.key === body.key);
    if (!license) {
      return sendJSON(res, 404, { success: false, message: 'লাইসেন্স পাওয়া যায়নি' });
    }

    const addonType = body.addonType; // 'CLOUD_YEARLY', 'CLOUD_MONTHLY', 'SMS_500', 'SMS_200'
    let amount = 0;
    let label = '';

    if (addonType === 'CLOUD_YEARLY') {
      license.addons.cloudBackup = {
        active: true,
        plan: 'বাৎসরিক ক্লাউড ব্যাকআপ (৫০০ ৳/বছর)',
        expiresAt: '2027-10-16',
        lastSync: 'এইমাত্র চালু হয়েছে'
      };
      amount = 500;
      label = 'বাৎসরিক ক্লাউড ব্যাকআপ প্যাক (১ বছর)';
    } else if (addonType === 'CLOUD_MONTHLY') {
      license.addons.cloudBackup = {
        active: true,
        plan: 'মাসিক ক্লাউড ব্যাকআপ (৫০ ৳/মাস)',
        expiresAt: '2026-11-16',
        lastSync: 'এইমাত্র চালু হয়েছে'
      };
      amount = 50;
      label = 'মাসিক ক্লাউড ব্যাকআপ প্যাক (১ মাস)';
    } else if (addonType === 'SMS_500') {
      license.addons.smsPack.active = true;
      license.addons.smsPack.balance += 500;
      license.addons.smsPack.totalPurchased += 500;
      amount = 250;
      label = '৫০০ তাগাদা এসএমএস প্যাক';
    } else if (addonType === 'SMS_200') {
      license.addons.smsPack.active = true;
      license.addons.smsPack.balance += 200;
      license.addons.smsPack.totalPurchased += 200;
      amount = 120;
      label = '২০০ তাগাদা এসএমএস প্যাক';
    }

    db.addonSales.unshift({
      id: 'ADD-' + Date.now(),
      shopName: license.shopName,
      key: license.key,
      type: label,
      amount,
      date: new Date().toISOString().split('T')[0]
    });

    saveDB(db);
    return sendJSON(res, 200, {
      success: true,
      message: `${license.shopName}-এ "${label}" সফলভাবে চালু হয়েছে!`,
      license
    });
  }

  // API 5: Cloud Backup Sync (Save shop data to server)
  if (pathname === '/api/cloud/sync' && req.method === 'POST') {
    const body = await parseBody(req);
    const db = loadDB();
    const key = body.licenseKey || 'DOKAN-1500-DEMO';
    const license = db.licenses.find(l => l.key === key);

    if (license && !license.addons.cloudBackup.active) {
      return sendJSON(res, 403, {
        success: false,
        needsSubscription: true,
        message: 'ক্লাউড ব্যাকআপ চালু নেই! মাত্র ৫০ টাকা/মাস বা ৫০০ টাকা/বছর প্যাকেজ নিয়ে আপনার হিসাব আজীবন সুরক্ষিত রাখুন।'
      });
    }

    const nowStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    db.cloudBackups[key] = {
      updatedAt: new Date().toISOString(),
      shopData: body.shopData
    };
    if (license) {
      license.addons.cloudBackup.lastSync = `আজ ${nowStr}`;
    }
    saveDB(db);

    return sendJSON(res, 200, {
      success: true,
      lastSync: `আজ ${nowStr}`,
      message: 'আলহামদুলিল্লাহ! আপনার দোকানের সকল হিসাব ক্লাউড সার্ভারে নিরাপদে ব্যাকআপ হয়েছে।'
    });
  }

  // API 6: Send Automated Baki Reminder SMS (Bulk SMS Gateway Integration ready)
  if (pathname === '/api/sms/send' && req.method === 'POST') {
    const body = await parseBody(req);
    const db = loadDB();
    const key = body.licenseKey || 'DOKAN-1500-DEMO';
    const license = db.licenses.find(l => l.key === key);

    if (license && license.addons.smsPack.balance <= 0) {
      return sendJSON(res, 403, {
        success: false,
        needsRecharge: true,
        message: 'আপনার এসএমএস ব্যালেন্স শেষ! ২০০ টাকায় ৫০০ এসএমএস প্যাক রিচার্জ করুন।'
      });
    }

    if (license) {
      license.addons.smsPack.balance -= 1;
    }

    const logEntry = {
      id: 'SMS-' + Date.now(),
      shopName: body.shopName || 'বিসমিল্লাহ মুদি স্টোর',
      customerName: body.customerName,
      phone: body.phone,
      amount: body.amount,
      message: body.message,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };
    db.smsLogs.push(logEntry);
    saveDB(db);

    return sendJSON(res, 200, {
      success: true,
      remainingSms: license ? license.addons.smsPack.balance : 99,
      message: `${body.customerName}-এর নাম্বারে (${body.phone}) তাগাদা এসএমএস পাঠানো হয়েছে!`
    });
  }

  // Serve Static Files from public/
  let filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath).toLowerCase();

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(path.join(PUBLIC_DIR, 'index.html')).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 দোকান খাতা (DokanKhata BD) সার্ভার চালু হয়েছে!`);
  console.log(`👉 অ্যাপ ও অ্যাডমিন প্যানেল লিংক: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
