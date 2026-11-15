/* STEM Coaching extras: notice board, phone notifications, progress graph, activity log, teacher password help.
   Plugs into the existing site; app.js does not need to change. */
(function () {
  'use strict';

  var NOTIFY_URL = 'https://stem-notify-947770205223.asia-south1.run.app'; // address of the stem-notify server, set after deploying it
  var VAPID = 'BBXhATr_IPGztepcLbvIvz-sbE5mudDeKPdr3VO_wG109ZufhmY5LBov6aCpX80XKR1bHdXsmhLLaFNlsPz6OCM';
  var TEACHER = 'teacher@stemcoaching.app';
  var CLASSES = ['6', '7', '8', '9', '10', '11', '12', 'Dropper'];
  // Collections whose changes by the teacher or staff are written to the activity log
  var WATCH = { marks: 1, attendance: 1, payments: 1, coupons: 1, tests: 1, students: 1, series: 1, schedules: 1, qbank: 1, keys: 1, staff: 1, demos: 1, notices: 1, winners: 1, dailyquiz: 1, site: 1 };

  var db, auth, me = null, fab = null, sheet = null, buf = {}, timer = null, cache = [];

  /* ---------- small helpers ---------- */
  function el(tag, a, kids) {
    var e = document.createElement(tag);
    if (a) for (var k in a) {
      if (k === 'text') e.textContent = a[k];
      else if (k === 'class') e.className = a[k];
      else if (k.slice(0, 2) === 'on') e[k] = a[k];
      else e.setAttribute(k, a[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function ms(t) { return t && t.toMillis ? t.toMillis() : (typeof t === 'number' ? t : 0); }
  function fmt(m) {
    if (!m) return '';
    return new Date(m).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  }
  function clsName(c) { return c === 'Dropper' ? 'Dropper batch' : 'Class ' + c; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function clearEl(e) { while (e.firstChild) e.removeChild(e.firstChild); return e; }
  function now() { return firebase.firestore.FieldValue.serverTimestamp(); }

  function callNotify(path, body, noAuth) {
    if (NOTIFY_URL.indexOf('PASTE') > -1) return Promise.reject(new Error('the notification server is not connected yet'));
    var base = NOTIFY_URL.replace(/\/$/, '');
    function go(h) {
      return fetch(base + path, { method: 'POST', headers: h, body: JSON.stringify(body || {}) }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) throw new Error(j.error || ('error ' + r.status));
          return j;
        });
      });
    }
    if (noAuth) return go({ 'Content-Type': 'application/json' });
    return auth.currentUser.getIdToken().then(function (t) {
      return go({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + t });
    });
  }

  /* ---------- activity log: records what the teacher and staff change ---------- */
  function hint(d) {
    if (!d || typeof d !== 'object') return '';
    return String(d.name || d.title || d.roll || d.testId || d.uid || '').slice(0, 40);
  }
  function note(act, ref, data) {
    if (!me || me.role === 'student' || !ref || !ref.parent) return;
    var c = ref.parent.id;
    if (!WATCH[c]) return;
    var k = act + '|' + c;
    var b = buf[k] || (buf[k] = { act: act, c: c, n: 0, ids: [] });
    b.n++;
    if (b.ids.length < 5) { var h = hint(data); b.ids.push(ref.id + (h ? ' (' + h + ')' : '')); }
    clearTimeout(timer);
    timer = setTimeout(flush, 4000);
  }
  function flush() {
    if (!me) return;
    Object.keys(buf).forEach(function (k) {
      var b = buf[k]; delete buf[k];
      var label = ({ set: 'Saved', update: 'Updated', del: 'Deleted' })[b.act] + ' ' + b.c;
      var detail = b.n + ' item' + (b.n > 1 ? 's' : '') + ': ' + b.ids.join(', ');
      db.collection('activity').add({
        by: me.email || '', role: me.role,
        act: label.slice(0, 79), detail: detail.slice(0, 490), at: now()
      }).catch(function () {});
    });
  }
  function patch() {
    try {
      var DR = firebase.firestore.DocumentReference.prototype;
      var WB = firebase.firestore.WriteBatch.prototype;
      [['set', 'set'], ['update', 'update'], ['delete', 'del']].forEach(function (p) {
        var o = DR[p[0]];
        if (o && !o.sx) {
          DR[p[0]] = function () { try { note(p[1], this, arguments[0]); } catch (e) {} return o.apply(this, arguments); };
          DR[p[0]].sx = 1;
        }
        var w = WB[p[0]];
        if (w && !w.sx) {
          WB[p[0]] = function () { try { note(p[1], arguments[0], arguments[1]); } catch (e) {} return w.apply(this, arguments); };
          WB[p[0]].sx = 1;
        }
      });
    } catch (e) {}
    window.addEventListener('pagehide', flush);
  }

  /* ---------- phone notifications ---------- */
  function pushSupported() {
    try {
      return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window &&
        !!firebase.messaging && firebase.messaging.isSupported();
    } catch (e) { return false; }
  }
  function saveToken(tok) {
    var ref = db.doc('devices/' + me.uid);
    return ref.get().then(function (s) {
      var arr = (s.exists && s.data().tokens) || [];
      arr = arr.filter(function (t) { return t !== tok; });
      arr.push(tok);
      return ref.set({ uid: me.uid, tokens: arr.slice(-5), at: now() });
    });
  }
  function enablePush() {
    var o = (firebase.app().options) || {};
    if (!o.messagingSenderId || !o.appId) {
      return Promise.resolve({ ok: false, msg: 'Notification setup is incomplete on the website (Firebase app details are missing).' });
    }
    return Notification.requestPermission().then(function (p) {
      if (p !== 'granted') return { ok: false, msg: 'Notifications are blocked. Allow notifications for this site in your phone settings, then try again.' };
      return navigator.serviceWorker.getRegistration('/')
        .then(function (r) { return r || navigator.serviceWorker.register('/sw.js'); })
        .then(function (r) { return navigator.serviceWorker.ready.then(function () { return r; }); })
        .then(function (reg) { return firebase.messaging().getToken({ vapidKey: VAPID, serviceWorkerRegistration: reg }); })
        .then(function (tok) {
          if (!tok) return { ok: false, msg: 'Could not get a notification token. Please try again.' };
          return saveToken(tok).then(function () { return { ok: true }; });
        });
    }).catch(function (e) {
      return { ok: false, msg: 'Could not turn on notifications. ' + (e && e.message ? e.message : '') };
    });
  }
  function pushBox() {
    var box = el('div', { class: 'sx-push' });
    if (!pushSupported()) {
      var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !navigator.standalone;
      box.appendChild(el('p', { class: 'sx-m', text: ios
        ? 'To get notifications on iPhone: tap Share, choose Add to Home Screen, then open the app from your Home Screen and come back here.'
        : 'This phone or browser does not support notifications.' }));
      return box;
    }
    if (window.Notification && Notification.permission === 'granted') {
      box.appendChild(el('p', { class: 'sx-ok', text: 'Phone notifications are on.' }));
      return box;
    }
    var msg = el('p', { class: 'sx-m', text: 'Get test reminders and class notices on your phone.' });
    var btn = el('button', { class: 'sx-btn', text: 'Turn on phone notifications' });
    btn.onclick = function () {
      btn.disabled = true; msg.textContent = 'Turning on…';
      enablePush().then(function (r) {
        if (r.ok) box.parentNode.replaceChild(pushBox(), box);
        else { msg.textContent = r.msg; btn.disabled = false; }
      });
    };
    box.appendChild(msg); box.appendChild(btn);
    return box;
  }

  /* ---------- notice board ---------- */
  function canPost() { return me && (me.role === 'teacher' || (me.role === 'staff' && me.perms.indexOf('notices') > -1)); }
  function loadNotices() {
    return db.collection('notices').orderBy('at', 'desc').limit(40).get().then(function (s) {
      var arr = [];
      s.forEach(function (d) {
        var n = d.data(); n.id = d.id; n.ms = ms(n.at);
        if (me.role === 'student') {
          if (!(n.cls === 'all' || (Array.isArray(n.cls) && n.cls.indexOf(me.cls) > -1))) return;
        }
        arr.push(n);
      });
      cache = arr;
      return arr;
    });
  }
  function refreshDot() {
    if (!me) return;
    loadNotices().then(function (arr) {
      var seen = parseInt(lsGet('sxSeen') || '0', 10);
      var unread = arr.filter(function (n) { return n.ms > seen; }).length;
      var d = document.getElementById('sx-dot');
      if (d) d.style.display = unread ? 'block' : 'none';
    }).catch(function () {});
  }
  function composer(done) {
    var t = el('input', { class: 'sx-in', maxlength: '80', placeholder: 'Notice title' });
    var m = el('textarea', { class: 'sx-in', rows: '3', maxlength: '500', placeholder: 'Write the notice' });
    var checks = {};
    var wrap = el('div', { class: 'sx-cls' });
    ['all'].concat(CLASSES).forEach(function (c) {
      var cb = el('input', { type: 'checkbox' });
      checks[c] = cb;
      wrap.appendChild(el('label', { class: 'sx-chk' }, [cb, el('span', { text: c === 'all' ? 'All classes' : clsName(c) })]));
    });
    var st = el('p', { class: 'sx-m' });
    var btn = el('button', { class: 'sx-btn', text: 'Post notice' });
    btn.onclick = function () {
      var title = t.value.trim(), text = m.value.trim();
      var sel = CLASSES.filter(function (c) { return checks[c].checked; });
      var all = checks.all.checked;
      if (!title || !text) { st.textContent = 'Add a title and the notice text.'; return; }
      if (!all && !sel.length) { st.textContent = 'Choose All classes or at least one class.'; return; }
      btn.disabled = true; st.textContent = 'Posting…';
      db.collection('notices').add({ title: title, body: text, cls: all ? 'all' : sel, by: me.email || '', at: now() })
        .then(function (ref) {
          st.textContent = 'Posted. Sending phone notifications…';
          return callNotify('/notice', { id: ref.id }).then(function (r) {
            st.textContent = 'Posted. Notification sent to ' + (r.sent || 0) + ' phone' + (r.sent === 1 ? '' : 's') + '.';
          }, function (e) {
            st.textContent = 'Posted, but notifications were not sent: ' + e.message + '.';
          });
        })
        .then(function () { setTimeout(done, 1800); }, function () {
          st.textContent = 'Could not post the notice. Check your permission and try again.';
          btn.disabled = false;
        });
    };
    return el('div', { class: 'sx-card' }, [el('b', { text: 'New notice' }), t, m, wrap, btn, st]);
  }
  function viewNotices(b) {
    clearEl(b);
    b.appendChild(pushBox());
    if (canPost()) b.appendChild(composer(function () { viewNotices(b); }));
    var list = el('div', { class: 'sx-list' }, [el('p', { class: 'sx-m', text: 'Loading…' })]);
    b.appendChild(list);
    loadNotices().then(function (arr) {
      clearEl(list);
      if (!arr.length) { list.appendChild(el('p', { class: 'sx-m', text: 'No notices yet.' })); return; }
      arr.forEach(function (n) {
        var who = n.cls === 'all' ? 'All classes' : (Array.isArray(n.cls) ? n.cls.map(clsName).join(', ') : '');
        var card = el('div', { class: 'sx-card' }, [
          el('b', { text: n.title || 'Notice' }),
          el('p', { class: 'sx-t', text: n.body || '' }),
          el('p', { class: 'sx-m', text: fmt(n.ms) + (who ? ' · ' + who : '') })
        ]);
        if (canPost()) {
          card.appendChild(el('button', {
            class: 'sx-del', text: 'Delete notice',
            onclick: function () {
              if (!confirm('Delete this notice?')) return;
              db.collection('notices').doc(n.id).delete().then(function () { viewNotices(b); });
            }
          }));
        }
        list.appendChild(card);
      });
      if (arr[0]) lsSet('sxSeen', String(arr[0].ms));
      var d = document.getElementById('sx-dot'); if (d) d.style.display = 'none';
    }).catch(function () {
      clearEl(list);
      list.appendChild(el('p', { class: 'sx-m', text: 'Could not load notices. Check your internet and try again.' }));
    });
  }

  /* ---------- rank and progress graph (students) ---------- */
  function chart(pts) {
    var W = 320, H = 150, pl = 30, pr = 8, pt = 10, pb = 14, ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('class', 'sx-chart');
    function add(n, a) { var e = document.createElementNS(ns, n); for (var k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; }
    function ys(v) { return pt + (H - pt - pb) * (1 - Math.max(0, Math.min(100, v)) / 100); }
    var n = pts.length;
    function xs(i) { return n === 1 ? pl + (W - pl - pr) / 2 : pl + (W - pl - pr) * i / (n - 1); }
    [0, 50, 100].forEach(function (v) {
      var y = ys(v);
      add('line', { x1: pl, x2: W - pr, y1: y, y2: y, stroke: '#d5dbe8', 'stroke-width': 1 });
      add('text', { x: pl - 4, y: y + 3, 'text-anchor': 'end', 'font-size': 9, fill: '#667' }).textContent = v + '%';
    });
    add('polyline', { points: pts.map(function (p, i) { return xs(i) + ',' + ys(p.pct); }).join(' '), fill: 'none', stroke: '#17306b', 'stroke-width': 2 });
    pts.forEach(function (p, i) { add('circle', { cx: xs(i), cy: ys(p.pct), r: 3.5, fill: '#17306b' }); });
    return svg;
  }
  function viewProgress(b) {
    clearEl(b);
    b.appendChild(el('p', { class: 'sx-m', text: 'Loading…' }));
    db.collection('myranks').where('uid', '==', me.uid).get().then(function (s) {
      var arr = [];
      s.forEach(function (d) { arr.push(d.data()); });
      arr.sort(function (x, y) { return (x.atMs || 0) - (y.atMs || 0); });
      clearEl(b);
      if (!arr.length) {
        b.appendChild(el('p', { class: 'sx-m', text: 'Your rank and progress graph will appear here after your teacher publishes test results.' }));
        return;
      }
      var last = arr[arr.length - 1];
      var best = arr.reduce(function (m, x) { return x.rank && x.rank < m ? x.rank : m; }, 1e9);
      var avg = Math.round(arr.reduce(function (t, x) { return t + (x.pct || 0); }, 0) / arr.length);
      b.appendChild(el('div', { class: 'sx-card' }, [
        el('b', { text: 'Latest rank: ' + last.rank + ' of ' + last.total }),
        el('p', { class: 'sx-t', text: (last.title || 'Test') + ': ' + last.score + ' / ' + last.max + ' (' + Math.round(last.pct) + '%)' }),
        el('p', { class: 'sx-m', text: 'Best rank: ' + (best === 1e9 ? '-' : best) + ' · Average score: ' + avg + '% · Tests: ' + arr.length })
      ]));
      b.appendChild(el('div', { class: 'sx-card' }, [el('b', { text: 'Score in each test (%)' }), chart(arr.slice(-12))]));
      arr.slice().reverse().forEach(function (x) {
        b.appendChild(el('div', { class: 'sx-row' }, [
          el('span', { text: x.title || 'Test' }),
          el('span', { text: x.score + '/' + x.max + ' · Rank ' + x.rank + '/' + x.total })
        ]));
      });
    }).catch(function () {
      clearEl(b);
      b.appendChild(el('p', { class: 'sx-m', text: 'Could not load your progress. Check your internet and try again.' }));
    });
  }

  /* ---------- activity log (teacher only) ---------- */
  function viewActivity(b) {
    clearEl(b);
    b.appendChild(el('p', { class: 'sx-m', text: 'Loading…' }));
    db.collection('activity').orderBy('at', 'desc').limit(100).get().then(function (s) {
      clearEl(b);
      b.appendChild(el('button', { class: 'sx-btn', text: 'Refresh', onclick: function () { viewActivity(b); } }));
      if (s.empty) { b.appendChild(el('p', { class: 'sx-m', text: 'No activity yet. Changes made by you and your staff will be listed here.' })); return; }
      s.forEach(function (d) {
        var a = d.data();
        b.appendChild(el('div', { class: 'sx-card' }, [
          el('b', { text: a.act || '' }),
          el('p', { class: 'sx-t', text: a.detail || '' }),
          el('p', { class: 'sx-m', text: fmt(ms(a.at)) + ' · ' + (a.by || '') + (a.role === 'staff' ? ' (staff)' : '') })
        ]));
      });
    }).catch(function () {
      clearEl(b);
      b.appendChild(el('p', { class: 'sx-m', text: 'Could not load the activity log.' }));
    });
  }

  /* ---------- panel ---------- */
  function close() { if (sheet && sheet.parentNode) sheet.parentNode.removeChild(sheet); sheet = null; }
  function open(tab) {
    close();
    var tabs = me.role === 'student' ? [['n', 'Notices'], ['p', 'My progress']]
      : (me.role === 'teacher' ? [['n', 'Notices'], ['a', 'Activity log']] : [['n', 'Notices']]);
    tab = tab || 'n';
    var body = el('div', { class: 'sx-body' });
    var head = el('div', { class: 'sx-tabs' });
    tabs.forEach(function (t) {
      head.appendChild(el('button', { class: 'sx-tab' + (t[0] === tab ? ' on' : ''), text: t[1], onclick: function () { open(t[0]); } }));
    });
    head.appendChild(el('button', { class: 'sx-x', text: 'Close', onclick: close }));
    sheet = el('div', { class: 'sx-ov', onclick: function (e) { if (e.target === sheet) close(); } }, [el('div', { class: 'sx-sh' }, [head, body])]);
    document.body.appendChild(sheet);
    if (tab === 'n') viewNotices(body); else if (tab === 'p') viewProgress(body); else viewActivity(body);
  }
  function css() {
    if (document.getElementById('sx-css')) return;
    var s = el('style', { id: 'sx-css' });
    s.textContent =
      '.sx-fab{position:fixed;right:14px;bottom:14px;width:50px;height:50px;border-radius:50%;border:0;background:#17306b;color:#fff;font-size:22px;box-shadow:0 2px 8px rgba(0,0,0,.3);z-index:9990;cursor:pointer}' +
      '.sx-dot{display:none;position:absolute;top:6px;right:6px;width:11px;height:11px;border-radius:50%;background:#e53935;border:2px solid #fff}' +
      '.sx-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9995;display:flex;align-items:flex-end;justify-content:center}' +
      '.sx-sh{background:#fff;color:#1b2333;width:100%;max-width:560px;max-height:88vh;border-radius:14px 14px 0 0;display:flex;flex-direction:column;overflow:hidden}' +
      '.sx-tabs{display:flex;gap:6px;padding:10px;border-bottom:1px solid #e3e7f0;align-items:center}' +
      '.sx-tab{border:1px solid #c9d1e3;background:#fff;color:#17306b;border-radius:16px;padding:6px 12px;font-size:14px}' +
      '.sx-tab.on{background:#17306b;color:#fff;border-color:#17306b}' +
      '.sx-x{margin-left:auto;border:0;background:none;color:#555;font-size:14px;padding:6px}' +
      '.sx-body{padding:10px 12px 18px;overflow:auto}' +
      '.sx-card{border:1px solid #e3e7f0;border-radius:10px;padding:10px;margin:8px 0;display:block}' +
      '.sx-t{margin:6px 0;white-space:pre-wrap;font-size:14px;line-height:1.5}' +
      '.sx-m{margin:6px 0;color:#667;font-size:13px;line-height:1.45}' +
      '.sx-ok{margin:6px 0;color:#1b7a3a;font-size:14px}' +
      '.sx-in{display:block;width:100%;box-sizing:border-box;margin:8px 0;padding:8px;border:1px solid #c9d1e3;border-radius:8px;font-size:15px;font-family:inherit}' +
      '.sx-cls{display:flex;flex-wrap:wrap;gap:6px 14px;margin:6px 0}' +
      '.sx-chk{display:flex;align-items:center;gap:5px;font-size:14px}' +
      '.sx-btn{background:#17306b;color:#fff;border:0;border-radius:8px;padding:9px 14px;font-size:15px;margin:6px 0}' +
      '.sx-btn:disabled{opacity:.6}' +
      '.sx-del{background:none;border:0;color:#c62828;font-size:13px;padding:4px 0}' +
      '.sx-row{display:flex;justify-content:space-between;gap:10px;padding:8px 2px;border-bottom:1px solid #eef1f7;font-size:14px}' +
      '.sx-chart{width:100%;height:auto;display:block}';
    document.head.appendChild(s);
  }
  function build() {
    if (fab) return;
    css();
    fab = el('button', { class: 'sx-fab', 'aria-label': 'Notices', title: 'Notices', onclick: function () { open('n'); } },
      [el('span', { text: '🔔' }), el('i', { class: 'sx-dot', id: 'sx-dot' })]);
    document.body.appendChild(fab);
    refreshDot();
  }
  function teardown() {
    close();
    if (fab && fab.parentNode) fab.parentNode.removeChild(fab);
    fab = null;
  }

  /* ---------- sign-in handling ---------- */
  function onUser(u) {
    teardown();
    me = null;
    if (!u) return;
    var m = { uid: u.uid, email: u.email || '', role: '', perms: [], cls: '' };
    if (m.email === TEACHER) { m.role = 'teacher'; me = m; build(); return; }
    Promise.all([
      db.doc('staff/' + u.uid).get().catch(function () { return null; }),
      db.doc('students/' + u.uid).get().catch(function () { return null; })
    ]).then(function (r) {
      var st = r[0], sd = r[1];
      if (st && st.exists) { m.role = 'staff'; m.perms = st.data().perms || []; }
      else if (sd && sd.exists) { m.role = 'student'; m.cls = String(sd.data().cls || ''); }
      else return;
      me = m;
      build();
      // if notifications were already allowed on this phone, quietly keep the token fresh
      if (pushSupported() && window.Notification && Notification.permission === 'granted') enablePush();
    });
  }

  /* ---------- teacher password help (footer link, works before login) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('#sx-treset') : null;
    if (!a) return;
    e.preventDefault();
    if (!confirm('Send a password reset link to the owner email? Only the owner receives it.')) return;
    callNotify('/teacher-reset', {}, true).then(function () {
      alert('If this request is allowed, a reset link has been emailed to the owner. Open it, set a new password, then log in again.');
    }, function (err) {
      alert('Could not send the link: ' + err.message + '.');
    });
  });

  /* ---------- start when the app has set up Firebase ---------- */
  var tries = 0;
  (function wait() {
    if (window.firebase && firebase.apps && firebase.apps.length && firebase.auth && firebase.firestore) {
      auth = firebase.auth(); db = firebase.firestore();
      patch();
      auth.onAuthStateChanged(onUser);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshDot(); });
      return;
    }
    if (++tries < 200) setTimeout(wait, 300);
  })();
})();
