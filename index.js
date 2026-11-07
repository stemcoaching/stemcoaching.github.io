const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const crypto = require('crypto');
admin.initializeApp();
const db = admin.firestore(), FV = admin.firestore.FieldValue;

const KEY = process.env.RAZORPAY_KEY_ID, SEC = process.env.RAZORPAY_KEY_SECRET;
const WH = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const BREVO = process.env.BREVO_KEY, FROM = process.env.MAIL_FROM;
const ORIGINS = ['https://stemcoaching.in', 'https://www.stemcoaching.in', 'https://stemcoaching.github.io'];

const fail = (c, m) => { const e = new Error(m); e.status = c; return e; };
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const same = (a, b) => { a = Buffer.from(String(a)); b = Buffer.from(String(b)); return a.length === b.length && crypto.timingSafeEqual(a, b); };

functions.http('stemApi', async (req, res) => {
  const o = req.headers.origin;
  if (ORIGINS.includes(o)) { res.set('Access-Control-Allow-Origin', o); res.set('Vary', 'Origin'); }
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).send('');
  try {
    if (req.headers['x-razorpay-signature']) return res.json(await webhook(req));
    if (req.method !== 'POST') throw fail(405, 'POST only');
    const t = (req.headers.authorization || '').replace(/^Bearer /, '');
    let u; try { u = await admin.auth().verifyIdToken(t); } catch (e) { throw fail(401, 'Please login again.'); }
    const b = req.body || {};
    const act = { status, sendcode, verifycode, order, verify }[b.action];
    if (!act) throw fail(400, 'Unknown action');
    res.json(await act(u, b));
  } catch (e) {
    console.error(e);
    res.status(e.status || 500).json({ error: e.status ? e.message : 'Something went wrong. Please try again.' });
  }
});

/* ---------- email verification ---------- */
async function status(u) {
  const d = await db.collection('emailv').doc(u.uid).get(), x = d.data() || {};
  return { verified: !!x.verified, email: x.email || '' };
}

async function sendcode(u, b) {
  const email = String(b.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) throw fail(400, 'Please enter a valid email address.');
  const ref = db.collection('emailv').doc(u.uid), x = (await ref.get()).data() || {};
  if (x.sent && Date.now() - x.sent < 60000) throw fail(429, 'Please wait one minute before asking for another code.');
  const code = String(crypto.randomInt(100000, 1000000));
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'STEM Coaching Institute', email: FROM },
      to: [{ email }],
      subject: 'Your STEM Coaching verification code',
      htmlContent: `<p>Your verification code is <b style="font-size:22px">${code}</b></p><p>It is valid for 10 minutes. If you did not ask for it, please ignore this email.</p>`
    })
  });
  if (!r.ok) { console.error(await r.text()); throw fail(502, 'Could not send the email. Please check the address and try again.'); }
  await ref.set({ email, codeHash: sha(u.uid + code), exp: Date.now() + 600000, tries: 0, sent: Date.now(), verified: false });
  return { ok: true };
}

async function verifycode(u, b) {
  const ref = db.collection('emailv').doc(u.uid), x = (await ref.get()).data();
  if (!x || !x.codeHash || x.exp < Date.now()) throw fail(400, 'This code has expired. Please ask for a new code.');
  if (x.tries >= 5) throw fail(429, 'Too many wrong attempts. Please ask for a new code.');
  if (!same(sha(u.uid + String(b.code || '').trim()), x.codeHash)) {
    await ref.update({ tries: FV.increment(1) });
    throw fail(400, 'The code is not correct.');
  }
  await ref.update({ verified: true, verifiedAt: FV.serverTimestamp(), codeHash: FV.delete() });
  return { ok: true };
}

/* ---------- payments ---------- */
async function order(u, b) {
  if (!(await status(u)).verified) throw fail(403, 'Please verify your email first.');
  const k = String(b.series || '');
  const sd = await db.collection('series').doc(k).get();
  if (!sd.exists || sd.data().active === false) throw fail(400, 'This test series is not available.');
  const s = sd.data(), st = (await db.collection('students').doc(u.uid).get()).data();
  if (!st) throw fail(400, 'Your student account is not active.');
  if ((st.plans || []).includes(k)) throw fail(400, 'You already have this test series.');
  let pct = 0, coupon = '';
  const c = String(b.coupon || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (c) {
    const cd = await db.collection('coupons').doc(c).get(), cx = cd.data();
    if (!cd.exists || cx.active === false || !(cx.pct > 0 && cx.pct <= 100)) throw fail(400, 'This coupon code is not valid.');
    pct = cx.pct; coupon = c;
  }
  const rupees = Math.round(s.price * (100 - pct) / 100);
  if (!(rupees >= 1)) throw fail(400, 'This series cannot be bought online. Please contact the institute.');
  const r = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(KEY + ':' + SEC).toString('base64'), 'content-type': 'application/json' },
    body: JSON.stringify({ amount: rupees * 100, currency: 'INR', receipt: 'o' + Date.now(), notes: { uid: u.uid, series: k, coupon } })
  });
  const o = await r.json();
  if (!r.ok) { console.error(o); throw fail(502, 'Could not start the payment. Please try again.'); }
  await db.collection('orders').doc(o.id).set({ uid: u.uid, series: k, title: s.title || k, rupees, coupon, status: 'created', at: FV.serverTimestamp() });
  return { key: KEY, amount: o.amount, orderId: o.id, title: s.title || k, email: (await status(u)).email };
}

async function verify(u, b) {
  const sig = crypto.createHmac('sha256', SEC).update(b.orderId + '|' + b.paymentId).digest('hex');
  if (!same(sig, b.signature)) throw fail(400, 'Payment could not be verified.');
  const od = (await db.collection('orders').doc(String(b.orderId)).get()).data();
  if (!od || od.uid !== u.uid) throw fail(400, 'Order not found.');
  return { ok: true, no: await fulfil(b.orderId, b.paymentId) };
}

async function fulfil(orderId, paymentId) {
  const oref = db.collection('orders').doc(orderId);
  const all = await db.collection('payments').get();
  const mx = all.docs.reduce((a, d) => Math.max(a, parseInt(String(d.data().no || '').split('/').pop(), 10) || 0), 0);
  return db.runTransaction(async t => {
    const od = await t.get(oref);
    if (!od.exists) return null;
    const o = od.data();
    if (o.status === 'paid') return o.no;
    const cref = db.collection('counters').doc('receipt'), cd = await t.get(cref);
    const sref = db.collection('students').doc(o.uid), st = (await t.get(sref)).data() || {};
    const n = Math.max((cd.data() || {}).n || 0, mx) + 1;
    const no = 'STEM/' + new Date().getFullYear() + '/' + String(n).padStart(4, '0');
    t.set(cref, { n });
    t.set(db.collection('payments').doc(paymentId), {
      uid: o.uid, name: st.name || '', roll: st.roll || '', cls: st.cls || '', series: o.series, seriesTitle: o.title,
      amount: o.rupees, method: 'Online (Razorpay)', note: 'Razorpay ' + paymentId + (o.coupon ? ', coupon ' + o.coupon : ''),
      date: admin.firestore.Timestamp.now(), no, at: FV.serverTimestamp()
    });
    t.set(sref, { plans: FV.arrayUnion(o.series), notests: false }, { merge: true });
    t.update(oref, { status: 'paid', paymentId, no });
    return no;
  });
}

/* Safety net: Razorpay tells us about every successful payment, even if the student closed the page */
async function webhook(req) {
  if (!WH) throw fail(400, 'Webhook is not set up.');
  const sig = crypto.createHmac('sha256', WH).update(req.rawBody).digest('hex');
  if (!same(sig, req.headers['x-razorpay-signature'])) throw fail(400, 'Bad signature.');
  const ev = req.body;
  if (ev.event === 'payment.captured' || ev.event === 'order.paid') {
    const p = ev.payload.payment.entity;
    await fulfil(p.order_id, p.id);
  }
  return { ok: true };
}
