(function () {
  'use strict';

  /* ---------- utseende (lys/mørk) ---------- */
  function setTheme(t) {                     // 'auto' | 'light' | 'dark'
    var root = document.documentElement;
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t);
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('tb_theme', t); } catch (e) { }
  }
  var savedTheme = 'auto';
  try { savedTheme = localStorage.getItem('tb_theme') || 'auto'; } catch (e) { }
  setTheme(savedTheme);
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var uid = function () { return Math.random().toString(36).slice(2, 9); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var parseIso = function (s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  var addDays = function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
  var startOfWeek = function (d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  function isoWeek(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    var y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - y0) / 86400000 + 1) / 7);
  }
  var nf = function (n) { return Math.round(n).toLocaleString('nb-NO'); };
  var exCount = function (n) { return n + (n === 1 ? ' øvelse' : ' øvelser'); };
  var fmtNum = function (n) { return (Math.round(n * 10) / 10).toLocaleString('nb-NO'); };
  var num = function (v) { var n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : 0; };

  var DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  var DAYS_LONG = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
  var KINDS = {
    styrke: { label: 'Styrke', unit: 'Reps', cls: 'k1' },
    kondisjon: { label: 'Kondisjon', unit: 'Min', cls: 'k2' },
    mobilitet: { label: 'Mobilitet', unit: 'Sek', cls: 'k3' },
    core: { label: 'Core', unit: 'Sek', cls: 'k3' }
  };
  var VIEWS = ['uke', 'okt', 'programmer', 'hjemme', 'fremgang'];

  function defaults() {
    var ex = function (name, sets, reps, kg) { return { id: uid(), name: name, sets: sets, reps: reps, kg: kg || 0 }; };
    var p1 = { id: uid(), name: 'Overkropp', kind: 'styrke', exercises: [ex('Benkpress', 3, 8, 60), ex('Roing med stang', 3, 10, 50), ex('Skulderpress', 3, 10, 30), ex('Nedtrekk', 3, 10, 45)] };
    var p2 = { id: uid(), name: 'Underkropp', kind: 'styrke', exercises: [ex('Knebøy', 4, 6, 80), ex('Rumensk markløft', 3, 8, 70), ex('Utfall', 3, 10, 20), ex('Tåhev', 3, 15, 40)] };
    var p3 = { id: uid(), name: 'Intervaller', kind: 'kondisjon', exercises: [ex('Rolig oppvarming', 1, 10), ex('Hard intervall', 4, 4), ex('Nedjogg', 1, 10)] };
    var p4 = { id: uid(), name: 'Mobilitet', kind: 'mobilitet', exercises: [ex('Hoftebøyer-strekk', 2, 45), ex('Brystrygg-rotasjon', 2, 30), ex('Hamstring-strekk', 2, 45)] };
    return { programs: [p1, p2, p3, p4], plans: { a: { week: [p1.id, null, p2.id, null, p3.id, p4.id, null], goal: 4 }, h: { week: [null, null, null, null, null, null, null], goal: 4 } }, active: 'a', last: {}, rest: 90, log: [], hint: true };
  }
  function normalize(s) {
    s.programs = Array.isArray(s.programs) ? s.programs : [];
    var emptyWeek = function () { return [null, null, null, null, null, null, null]; };
    var okWeek = function (w) { return (Array.isArray(w) && w.length === 7) ? w : emptyWeek(); };
    if (!s.plans) s.plans = { a: { week: okWeek(s.week), goal: s.goal > 0 ? s.goal : 3 }, h: { week: emptyWeek(), goal: 4 } };
    ['a', 'h'].forEach(function (k) {
      var pl = s.plans[k] || {};
      s.plans[k] = { week: okWeek(pl.week), goal: pl.goal > 0 ? pl.goal : (k === 'a' ? 3 : 4) };
    });
    delete s.week; delete s.goal;
    s.active = s.active === 'h' ? 'h' : 'a';
    s.log = Array.isArray(s.log) ? s.log : [];
    s.last = s.last || {};
    s.rest = s.rest || 90;
    s.pr = (s.pr && typeof s.pr === 'object') ? s.pr : {};
    var st0 = s.settings || {};
    s.settings = {
      sound: st0.sound !== false, vibrate: st0.vibrate !== false,
      inc: st0.inc > 0 ? st0.inc : 2.5, bar: st0.bar > 0 ? st0.bar : 20,
      plates: Array.isArray(st0.plates) && st0.plates.length ? st0.plates : [25, 20, 15, 10, 5, 2.5, 1.25],
      name: typeof st0.name === 'string' ? st0.name : ''
    };
    s.body = Array.isArray(s.body) ? s.body : [];
    // Ukeplaner ligger i planList. Det gamle feltet plans står urørt, så eldre versjoner av appen ikke ødelegger noe.
    var toItems = function (w) { return okWeek(w).map(function (x) { return Array.isArray(x) ? x.filter(function (y) { return typeof y === 'string' && y; }) : (x ? [x] : []); }); };
    if (!Array.isArray(s.planList) || !s.planList.length) {
      s.planList = [
        { id: 'a', name: 'Vanlig uke', week: toItems(s.plans.a.week), goal: s.plans.a.goal },
        { id: 'h', name: 'Hjemmeuke', week: toItems(s.plans.h.week), goal: s.plans.h.goal }];
      s.activePlan = s.active;
    }
    s.planList.forEach(function (pl) {
      pl.id = pl.id || uid();
      pl.name = typeof pl.name === 'string' ? pl.name : 'Plan';
      pl.week = toItems(pl.week);
      pl.goal = pl.goal > 0 ? pl.goal : 3;
    });
    if (!s.planList.some(function (pl) { return pl.id === s.activePlan; })) s.activePlan = s.planList[0].id;
    s.over = (s.over && typeof s.over === 'object') ? s.over : {};
    var iv = s.iv || {};
    s.iv = {
      work: iv.work > 0 ? iv.work : 40,
      rest: iv.rest >= 0 ? iv.rest : 20,
      rounds: iv.rounds > 0 ? iv.rounds : 8,
      ex: Array.isArray(iv.ex) ? iv.ex : ['Jumping jacks', 'Høye knær', 'Burpees', 'Knebøy']
    };
    return s;
  }

  var state = null;
  function curPlan() {
    for (var i = 0; i < state.planList.length; i++) if (state.planList[i].id === state.activePlan) return state.planList[i];
    return state.planList[0];
  }
  try { var raw = localStorage.getItem('tb_state'); if (raw) state = JSON.parse(raw); } catch (e) { }
  state = normalize(state || defaults());
  var sess = null;
  try { var rs = localStorage.getItem('tb_sess'); if (rs) sess = JSON.parse(rs); } catch (e) { }

  var view = 'uke', weekOffset = 0, armed = '', shownEx = {};
  var iv = null, ivTimer = null, celebrate = null;
  var editScope = 'all', managing = false;
  var EXT = { views: {}, actions: {}, fields: {}, nav: {}, keep: {} };   // sider og handlinger fra andre filer (mer.js)
  var openLog = null, exSel = null, hold = null, holdT = null;   // åpen økt i historikken, valgt øvelse i grafen, tidtaker for holdøvelser           // ukeplan: endre alle uker eller bare den viste, plan-meny åpen   // intervalltimer som kjører, nye rekorder å vise
  var touched = false, ref = null;
  var P = function (id) { return state.programs.filter(function (p) { return p.id === id; })[0]; };
  var todayIdx = function () { return (new Date().getDay() + 6) % 7; };

  /* ---------- persistence ---------- */
  var syncLabels = { loading: 'Henter …', saving: 'Lagrer …', saved: 'Lagret', local: 'Lagret lokalt', error: 'Kunne ikke lagre' };
  function setSync(k) { var el = $('#sync'); if (el) { el.textContent = syncLabels[k]; el.setAttribute('data-state', k); } }
  var saveT = null, saving = false, again = false;
  function save() {
    touched = true;
    try { localStorage.setItem('tb_state', JSON.stringify(state)); } catch (e) { }
    if (!ref) { setSync('local'); return; }
    setSync('saving');
    clearTimeout(saveT);
    saveT = setTimeout(flush, 700);
  }
  function flush() {
    if (!ref) return;
    if (saving) { again = true; return; }
    saving = true;
    ref.set(JSON.parse(JSON.stringify(state))).then(function () { setSync('saved'); }, function () { setSync('error'); }).then(function () {
      saving = false;
      if (again) { again = false; flush(); }
    });
  }
  function saveDraft() {
    try { if (sess) localStorage.setItem('tb_sess', JSON.stringify(sess)); else localStorage.removeItem('tb_sess'); } catch (e) { }
  }

  /* ---------- views ---------- */
  function kindTag(k) { var K = KINDS[k] || KINDS.styrke; return '<span class="kind"><i class="' + K.cls + '"></i>' + K.label + '</span>'; }
  function dateLabel(d) { return d.getDate() + '. ' + MONTHS[d.getMonth()]; }

  function hintBox() {
    if (!state.hint) return '';
    return '<div class="hint"><span>Eksempelprogrammer er lagt inn for å vise hvordan det fungerer. Rediger dem eller slett det du ikke trenger.</span><button class="btn btn-sm" data-act="hint-x">Skjul</button></div>';
  }

  /* ---------- ukeplaner ---------- */
  function shownMon() { return addDays(startOfWeek(new Date()), weekOffset * 7); }
  function overKey(plan, mon) { return plan.id + '|' + iso(mon); }
  function hasOverride(plan, mon, i) { var o = state.over[overKey(plan, mon)]; return !!(o && o[i]); }
  // Øktene for en dag: unntaket for den uka hvis det finnes, ellers planen.
  function dayItems(plan, mon, i) { var o = state.over[overKey(plan, mon)]; return (o && o[i]) ? o[i] : plan.week[i]; }
  // Listen som skal endres. «Bare denne uka» lager en kopi av dagen første gang den endres.
  function editList(i) {
    var plan = curPlan();
    if (editScope !== 'week') return plan.week[i];
    var k = overKey(plan, shownMon()), o = state.over[k] || (state.over[k] = {});
    if (!o[i]) o[i] = plan.week[i].slice();
    return o[i];
  }
  function itemInfo(x) {
    if (x === 'iv') { var c = state.iv; return { name: 'Intervalltimer', kind: 'kondisjon', sub: c.work + '/' + c.rest + ' × ' + c.rounds }; }
    var p = P(x);
    return p ? { name: p.name, kind: p.kind, sub: exCount(p.exercises.length) } : null;
  }
  // Kobler planlagte økter mot det som er logget den dagen. Hver logget økt teller bare én gang.
  function matchDay(items, dIso) {
    var logs = state.log.filter(function (l) { return l.d === dIso; }), used = {};
    var done = items.map(function (x) {
      if (!itemInfo(x)) return null;
      for (var k = 0; k < logs.length; k++) if (!used[k] && logs[k].pid === x) { used[k] = true; return logs[k]; }
      return null;
    });
    return { done: done, extra: logs.filter(function (l, k) { return !used[k]; }) };
  }
  function nextPlanned(plan) {
    var t0 = new Date();
    for (var k = 1; k <= 7; k++) {
      var d = addDays(t0, k), idx = (d.getDay() + 6) % 7;
      var its = dayItems(plan, startOfWeek(d), idx).filter(function (x) { return !!itemInfo(x); });
      if (its.length) return { d: d, idx: idx, items: its, k: k };
    }
    return null;
  }

  // Én planlagt økt: navn, type og enten status (gjort / ikke gjort) eller Start.
  function itemRow(x, i, j, state_, canEdit) {
    var info = itemInfo(x);
    if (!info) return '';
    var act = '';
    if (state_ === 'done') act = '<span class="st st-ok">✓ Gjort</span>';
    else if (state_ === 'miss') act = '<span class="st st-miss">Ikke gjort</span>';
    else if (state_ === 'today') {
      if (x === 'iv') act = iv ? '<button class="btn btn-sm" data-act="iv-open">Åpne</button>' : (sess ? '' : '<button class="btn btn-sm btn-primary" data-act="iv-open">Start</button>');
      else if (sess && sess.pid === x) act = '<button class="btn btn-sm" data-act="start" data-p="' + esc(x) + '">Fortsett</button>';
      else if (!sess && !iv) act = '<button class="btn btn-sm btn-primary" data-act="start" data-p="' + esc(x) + '">Start</button>';
    }
    if (canEdit) act += '<button class="icon-btn rm" data-act="day-rm" data-i="' + i + '" data-j="' + j + '" aria-label="Fjern ' + esc(info.name) + ' fra ' + DAYS_LONG[i].toLowerCase() + '">×</button>';
    return '<div class="ditem is-' + state_ + '"><div class="dmain"><div class="pn">' + esc(info.name) + '</div><div class="dmeta">' + kindTag(info.kind) + ' <span class="sub">· ' + esc(info.sub) + '</span></div></div>' +
      '<div class="dact">' + act + '</div></div>';
  }
  function itemState(done, dIso, todayIso) { return done ? 'done' : (dIso < todayIso ? 'miss' : (dIso === todayIso ? 'today' : 'later')); }

  function viewUke() {
    var plan = curPlan(), mon = shownMon();
    var days = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return addDays(mon, i); });
    var isos = days.map(iso), todayIso = iso(new Date());
    var data = days.map(function (d, i) {
      var items = dayItems(plan, mon, i), m = matchDay(items, isos[i]);
      return { items: items, done: m.done, extra: m.extra };
    });
    var planned = 0, doneP = 0, missed = 0, extra = 0, segs = '';
    data.forEach(function (dd, i) {
      dd.items.forEach(function (x, j) {
        if (!itemInfo(x)) return;
        planned++;
        var st = itemState(dd.done[j], isos[i], todayIso);
        if (st === 'done') doneP++;
        if (st === 'miss') missed++;
        segs += '<span class="seg' + (st === 'done' ? ' on' : st === 'miss' ? ' miss' : '') + '"></span>';
      });
      extra += dd.extra.length;
    });
    var logged = state.log.filter(function (l) { return isos.indexOf(l.d) > -1; }).length;
    var wk = isoWeek(mon);

    var h = '<div class="sec-head"><div><h2>Uke ' + wk + '</h2><p class="sub">' + dateLabel(days[0]) + ' – ' + dateLabel(days[6]) + (weekOffset === 0 ? ' · denne uka' : '') + '</p></div>' +
      '<div class="weeknav"><button class="btn btn-sm" data-act="wk-prev" aria-label="Forrige uke">←</button>' +
      '<button class="btn btn-sm" data-act="wk-now"' + (weekOffset === 0 ? ' disabled' : '') + '>Denne uka</button>' +
      '<button class="btn btn-sm" data-act="wk-next" aria-label="Neste uke">→</button></div></div>';

    // Planvalg og administrasjon
    h += '<div class="planbar"><div class="chips" role="group" aria-label="Velg ukeplan">' + state.planList.map(function (pl) {
      return '<button class="chip" data-act="plan-sw" data-k="' + esc(pl.id) + '" aria-pressed="' + (pl.id === plan.id) + '">' + esc(pl.name || 'Uten navn') + '</button>';
    }).join('') + '</div><button class="btn btn-sm btn-ghost" data-act="plan-manage" aria-expanded="' + managing + '">' + (managing ? 'Lukk' : 'Administrer planer') + '</button></div>';
    if (managing) {
      var only = state.planList.length < 2;
      h += '<div class="panel planmanage"><div class="row"><label for="plan-name">Navn på planen<input id="plan-name" class="inp" data-f="plan-name" maxlength="40" value="' + esc(plan.name) + '"></label></div>' +
        '<div class="row-actions"><button class="btn btn-sm" data-act="plan-new">+ Ny tom plan</button><button class="btn btn-sm" data-act="plan-copy">Kopier denne planen</button>' +
        '<button class="btn btn-sm btn-ghost btn-danger" data-act="plan-del"' + (only ? ' disabled title="Du må ha minst én plan"' : '') + '>' + (armed === 'plan-del' ? 'Slett «' + esc(plan.name) + '» for godt?' : 'Slett planen') + '</button></div></div>';
    }
    if (plan.week.every(function (l) { return !l.length; })) {
      h += '<div class="hint"><span>«' + esc(plan.name) + '» er tom. Legg til økter på dagene nedenfor, eller fyll uka med et forslag av hjemmeøkter.</span><button class="btn btn-sm btn-primary" data-act="home-fill">Fyll med hjemmeøkter</button></div>';
    }
    h += hintBox();

    // I dag
    if (weekOffset === 0) {
      var ti = todayIdx(), tItems = data[ti].items.filter(function (x) { return !!itemInfo(x); });
      h += '<section class="panel today" aria-labelledby="today-h"><div class="today-h"><h3 id="today-h">I dag</h3><span class="sub">' + DAYS_LONG[ti] + ' ' + dateLabel(days[ti]) + (state.settings.name ? ' · Lykke til, ' + esc(state.settings.name) + '!' : '') + '</span></div>';
      if (sess) h += '<p>Du har en økt i gang: <b>' + esc(sess.name) + '</b>. <button class="btn btn-sm" data-act="go-okt">Fortsett økta</button></p>';
      else if (iv) h += '<p>Intervalltimeren går. <button class="btn btn-sm" data-act="iv-open">Åpne timeren</button></p>';
      if (tItems.length) {
        h += '<div class="ditems">';
        data[ti].items.forEach(function (x, j) { h += itemRow(x, ti, j, itemState(data[ti].done[j], isos[ti], todayIso), false); });
        h += '</div>';
      } else {
        var nx = nextPlanned(plan);
        h += '<p class="sub">Hviledag i dag.' + (nx ? ' Neste: <b>' + nx.items.map(function (x) { return esc(itemInfo(x).name); }).join(' og ') + '</b> ' + (nx.k === 1 ? 'i morgen' : 'på ' + DAYS_LONG[nx.idx].toLowerCase()) + '.' : ' Ingen økter planlagt den neste uka.') + '</p>';
      }
      if (data[ti].extra.length) h += '<div class="extras">' + data[ti].extra.map(function (l) { return '<span class="done-tag">✓ ' + esc(l.name) + ' · ' + l.min + ' min</span>'; }).join('') + '</div>';
      h += '</section>';
    }

    // Fremdrift for uka
    var goal = plan.goal;
    if (planned) {
      h += '<div class="panel goalbar"><div class="txt tnum">' + doneP + ' av ' + planned + ' planlagt</div><div class="meter" aria-hidden="true">' + segs + '</div>';
    } else {
      var gs = '';
      for (var g = 0; g < Math.min(goal, 14); g++) gs += '<span class="seg' + (g < logged ? ' on' : '') + '"></span>';
      h += '<div class="panel goalbar"><div class="txt tnum">' + logged + ' av ' + goal + ' økter</div><div class="meter" aria-hidden="true">' + gs + '</div>';
    }
    h += '<div class="stepper">Ukemål <button class="btn btn-sm" data-act="goal-dec" aria-label="Senk ukemål">−</button><b class="tnum">' + goal + '</b><button class="btn btn-sm" data-act="goal-inc" aria-label="Øk ukemål">+</button></div>';
    var notes = [];
    if (missed) notes.push(missed + ' ikke gjort');
    if (extra) notes.push(extra + (extra === 1 ? ' ekstra økt' : ' ekstra økter'));
    notes.push(logged + ' av ukemålet på ' + goal + (logged >= goal ? ' · ukemålet er nådd' : ''));
    h += '<p class="goalnote">' + notes.join(' · ') + '</p></div>';

    // Hva endringer gjelder
    h += '<div class="scopebar"><span class="sub">Endringer gjelder</span><div class="planswitch" role="group" aria-label="Hva endringer gjelder">' +
      '<button class="btn" data-act="scope" data-k="all" aria-pressed="' + (editScope === 'all') + '">Alle uker</button>' +
      '<button class="btn" data-act="scope" data-k="week" aria-pressed="' + (editScope === 'week') + '">Bare uke ' + wk + '</button></div></div>';

    // Dagene
    var opts = '<option value="">+ Legg til</option>' + state.programs.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>'; }).join('') + '<option value="iv">Intervalltimer</option>';
    h += '<div class="week">';
    days.forEach(function (d, i) {
      var dd = data[i], isToday = isos[i] === todayIso, ov = hasOverride(plan, mon, i);
      var body = '';
      dd.items.forEach(function (x, j) { body += itemRow(x, i, j, itemState(dd.done[j], isos[i], todayIso), true); });
      if (!dd.items.some(function (x) { return !!itemInfo(x); })) body += '<div class="rest-day">Hviledag</div>';
      dd.extra.forEach(function (l) { body += '<span class="done-tag">✓ ' + esc(l.name) + ' · ' + l.min + ' min</span>'; });
      var foot = '<select class="inp" data-f="day-add" data-i="' + i + '" aria-label="Legg til økt på ' + DAYS_LONG[i].toLowerCase() + '">' + opts + '</select>';
      if (ov) foot += '<button class="linkbtn" data-act="day-reset" data-i="' + i + '">Tilbakestill til planen</button>';
      h += '<article class="day' + (isToday ? ' is-today' : '') + (ov ? ' is-over' : '') + '"><div class="day-head"><span class="dow">' + DAYS[i] + '</span><span class="dnum tnum">' + d.getDate() + '</span>' + (isToday ? '<span class="today-tag">I dag</span>' : '') + (ov ? '<span class="ovtag">Bare denne uka</span>' : '') + '</div>' +
        '<div class="day-body">' + body + '</div><div class="day-foot">' + foot + '</div></article>';
    });
    return h + '</div>';
  }

  function sessProgress() {
    var t = 0, d = 0;
    sess.rows.forEach(function (r) { r.sets.forEach(function (s) { t++; if (s.done) d++; }); });
    return d + ' av ' + t + ' sett fullført';
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h ? h + ':' + pad(m) + ':' + pad(s) : pad(m) + ':' + pad(s);
  }
  var CHECK = '<'+'svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/><'+'/svg>';
  var PLAY = '<'+'svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/><'+'/svg>';
  var RATE = ['Veldig lett', 'Lett', 'Passe', 'Tung', 'Helt maks'];

  function viewOkt() {
    if (!sess && iv) return viewInterval();
    if (!sess) {
      var plannedIds = dayItems(curPlan(), startOfWeek(new Date()), todayIdx());
      var h = ivSetup();
      h += '<div class="sec-head"><div><h2>Start en økt</h2><p class="sub">Velg et program. Vekter og reps fylles inn fra forrige gang.</p></div></div>';
      if (!state.programs.length) return h + '<p class="empty">Du har ingen programmer ennå. Lag ett under Programmer.</p>';
      h += '<div class="sess-list">';
      state.programs.forEach(function (p) {
        h += '<article class="panel pick"><div><div class="pn">' + esc(p.name) + (plannedIds.indexOf(p.id) > -1 ? '<span class="badge">Planlagt i dag</span>' : '') + '</div>' + kindTag(p.kind) + ' <span class="sub">· ' + p.exercises.length + ' øvelser</span></div>' +
          '<button class="btn btn-primary" data-act="start" data-p="' + esc(p.id) + '">Start økt</button></article>';
      });
      return h + '</div>';
    }
    var K = KINDS[sess.kind] || KINDS.styrke, kg = sess.kind === 'styrke', nk = kg ? '' : ' nokg';
    var timed = K.unit === 'Sek';                                   // holdøvelser får egen tidtaker per sett
    if (timed) nk += ' hold';
    var out = '<div class="sess-head"><div><h2 class="sess-title">' + esc(sess.name) + '</h2><p class="sub" id="sess-prog">' + sessProgress() + '</p></div><div class="timer tnum" id="elapsed" aria-label="Tid brukt">' + fmtTime((Date.now() - sess.start) / 1000) + '</div></div>';
    sess.rows.forEach(function (r, ri) {
      var canShow = !!(window.TBAnim && TBAnim.has(r.name)), open = canShow && !!shownEx[r.name];
      var rec = rowRecord(r);
      out += '<article class="panel ex"><div class="ex-top"><h3>' + esc(r.name) + '</h3><span class="plan">Plan: ' + esc(r.plan) + (rec ? ' · Rekord: ' + esc(prText(rec)) : '') + '</span></div>';
      var sg = suggestion(r);
      if (sg && sg.last) out += '<p class="lastline">Sist (' + dateLabel(parseIso(sg.last.d)) + '): ' + esc(setsText(sg.last.sets, sess.kind)) + '</p>';
      if (sg && sg.text && !r.bumped) out += '<div class="sugg"><span>' + esc(sg.text) + '</span><button class="btn btn-sm" data-act="bump" data-r="' + ri + '">Bruk forslaget</button></div>';
      if (canShow) out += '<div><button class="btn btn-sm btn-ghost" data-act="show-ex" data-r="' + ri + '" aria-expanded="' + open + '">' + (open ? 'Skjul animasjon' : 'Vis hvordan') + '</button></div>';
      if (open) out += '<div class="ex-anim">' + TBAnim.html(r.name) + '</div>';
      out += '<div class="fieldlab' + nk + '"><span>Sett</span>' + (kg ? '<span>Kg</span>' : '') + '<span>' + K.unit + '</span>' + (timed ? '<span></span>' : '') + '<span></span></div>';
      r.sets.forEach(function (s, si) {
        out += '<div class="setrow' + nk + '"><span class="n">' + (si + 1) + '</span>' +
          (kg ? '<input class="inp" type="number" inputmode="decimal" step="0.5" min="0" data-f="sk" data-r="' + ri + '" data-s="' + si + '" value="' + esc(s.kg) + '" aria-label="Kilo, sett ' + (si + 1) + '">' : '') +
          '<input class="inp" type="number" inputmode="decimal" min="0" data-f="sr" data-r="' + ri + '" data-s="' + si + '" value="' + esc(s.reps) + '" aria-label="' + K.unit + ', sett ' + (si + 1) + '">' +
          (timed ? '<button class="holdbtn' + (hold && hold.r === ri && hold.s === si ? ' running' : '') + '" id="hold-' + ri + '-' + si + '" data-act="hold" data-r="' + ri + '" data-s="' + si + '" aria-label="' + (hold && hold.r === ri && hold.s === si ? 'Stopp tidtakeren' : 'Start tidtaker for sett ' + (si + 1)) + '">' +
            (hold && hold.r === ri && hold.s === si ? Math.max(0, Math.ceil((hold.end - Date.now()) / 1000)) : PLAY) + '</button>' : '') +
          '<button class="check' + (s.done ? ' done' : '') + '" data-act="setdone" data-r="' + ri + '" data-s="' + si + '" aria-pressed="' + (s.done ? 'true' : 'false') + '" aria-label="Sett ' + (si + 1) + ' fullført">' + CHECK + '</button></div>';
        if (s.done && beatsRecord(r.name, s)) out += '<div class="pr-new"><span class="prtag">Ny rekord</span> ' + esc(prText(setRec(sess.kind, s))) + '</div>';
      });
      out += '<div><button class="btn btn-sm btn-ghost" data-act="addset" data-r="' + ri + '">+ Legg til sett</button></div></article>';
    });
    out += '<section class="panel rateset" aria-labelledby="rate-h"><h3 id="rate-h">Hvordan gikk økta?</h3><div class="chips" role="group" aria-label="Hvor tung var økta">' +
      RATE.map(function (t, i) { return '<button class="chip" data-act="rate" data-k="' + (i + 1) + '" aria-pressed="' + (sess.rate === i + 1) + '">' + t + '</button>'; }).join('') + '</div>' +
      '<label class="sr" for="sess-note">Notat</label><textarea id="sess-note" class="inp note" data-f="snote" rows="2" maxlength="500" placeholder="Notat (valgfritt), for eksempel hvordan kroppen kjentes">' + esc(sess.note || '') + '</textarea></section>';
    out += '<div class="sess-foot"><button class="btn btn-primary" data-act="finish">Fullfør økt</button><button class="btn btn-ghost' + (armed === 'cancel' ? ' btn-danger' : '') + '" data-act="cancel">' + (armed === 'cancel' ? 'Forkast økta?' : 'Avbryt økt') + '</button><span class="msg" id="sess-msg" role="alert"></span></div>';
    return out;
  }

  function viewProg() {
    var h = '<div class="sec-head"><div><h2>Programmer</h2><p class="sub">Bygg økter du kan legge i ukeplanen.</p></div><button class="btn btn-primary" data-act="add-prog">+ Nytt program</button></div>' + hintBox();
    if (!state.programs.length) h += '<p class="empty">Ingen programmer. Trykk «Nytt program» for å begynne.</p>';
    state.programs.forEach(function (p) {
      var K = KINDS[p.kind] || KINDS.styrke, kg = p.kind === 'styrke', nk = kg ? '' : ' nokg';
      var kopts = Object.keys(KINDS).map(function (k) { return '<option value="' + k + '"' + (k === p.kind ? ' selected' : '') + '>' + KINDS[k].label + '</option>'; }).join('');
      h += '<article class="panel prog"><div class="prog-top"><input class="inp name-in" data-f="pname" data-p="' + esc(p.id) + '" value="' + esc(p.name) + '" aria-label="Programnavn" maxlength="40">' +
        '<select class="inp" data-f="pkind" data-p="' + esc(p.id) + '" aria-label="Type">' + kopts + '</select></div>';
      h += '<div><div class="exlab' + nk + '"><span>Øvelse</span><span>Sett</span><span>' + K.unit + '</span>' + (kg ? '<span>Kg</span>' : '') + '<span></span></div></div>';
      p.exercises.forEach(function (e) {
        h += '<div class="exrow' + nk + '"><input class="inp" data-f="en" data-p="' + esc(p.id) + '" data-e="' + esc(e.id) + '" value="' + esc(e.name) + '" aria-label="Øvelse" maxlength="60">' +
          '<input class="inp" type="number" inputmode="numeric" min="1" data-f="es" data-p="' + esc(p.id) + '" data-e="' + esc(e.id) + '" value="' + esc(e.sets) + '" aria-label="Sett">' +
          '<input class="inp" type="number" inputmode="decimal" min="0" data-f="er" data-p="' + esc(p.id) + '" data-e="' + esc(e.id) + '" value="' + esc(e.reps) + '" aria-label="' + K.unit + '">' +
          (kg ? '<input class="inp" type="number" inputmode="decimal" min="0" step="0.5" data-f="ek" data-p="' + esc(p.id) + '" data-e="' + esc(e.id) + '" value="' + esc(e.kg) + '" aria-label="Kilo">' : '') +
          '<button class="icon-btn" data-act="del-ex" data-p="' + esc(p.id) + '" data-e="' + esc(e.id) + '" aria-label="Fjern øvelse">×</button></div>';
      });
      var key = 'p' + p.id;
      h += '<div class="row-actions"><button class="btn btn-sm" data-act="add-ex" data-p="' + esc(p.id) + '">+ Øvelse</button>' +
        '<button class="btn btn-sm btn-ghost btn-danger" data-act="del-prog" data-p="' + esc(p.id) + '">' + (armed === key ? 'Slett for godt?' : 'Slett program') + '</button></div></article>';
    });
    return h;
  }

  function chartSvg() {
    var mon0 = startOfWeek(new Date()), weeks = [], idx = {}, i;
    for (i = 7; i >= 0; i--) { var m = addDays(mon0, -7 * i); idx[iso(m)] = weeks.length; weeks.push({ m: m, n: 0 }); }
    state.log.forEach(function (l) { var k = iso(startOfWeek(parseIso(l.d))); if (k in idx) weeks[idx[k]].n++; });
    var max = Math.max(curPlan().goal, 1);
    weeks.forEach(function (w) { if (w.n > max) max = w.n; });
    var W = 640, H = 230, L = 30, R = 56, T = 22, B = 34;
    var cw = (W - L - R) / weeks.length, bw = cw * 0.56;
    var y = function (v) { return T + (H - T - B) * (1 - v / max); };
    var s = '<'+'svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Økter per uke, siste åtte uker">';
    var step = max <= 6 ? 1 : Math.ceil(max / 5);
    for (var v = 0; v <= max; v += step) {
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + '</text>';
    }
    weeks.forEach(function (w, k) {
      var x = L + k * cw + (cw - bw) / 2, hgt = (H - B) - y(w.n);
      if (w.n > 0) s += '<rect class="bar' + (k === weeks.length - 1 ? ' now' : '') + '" x="' + x + '" y="' + y(w.n) + '" width="' + bw + '" height="' + hgt + '" rx="3" fill="currentColor"/><text class="val" x="' + (x + bw / 2) + '" y="' + (y(w.n) - 6) + '" text-anchor="middle">' + w.n + '</text>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (H - 12) + '" text-anchor="middle">u' + isoWeek(w.m) + '</text>';
    });
    s += '<line class="goal" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(curPlan().goal) + '" y2="' + y(curPlan().goal) + '"/><text class="goaltxt" x="' + (W - R + 6) + '" y="' + (y(curPlan().goal) + 4) + '">Mål ' + curPlan().goal + '</text><'+'/svg>';
    return s;
  }

  function streakWeeks() {
    var counts = {};
    state.log.forEach(function (l) { var k = iso(startOfWeek(parseIso(l.d))); counts[k] = (counts[k] || 0) + 1; });
    var mon = startOfWeek(new Date()), st = 0;
    for (var i = 0; i < 200; i++) {
      var c = counts[iso(addDays(mon, -7 * i))] || 0;
      if (i === 0 && c < curPlan().goal) continue;
      if (c >= curPlan().goal) st++; else break;
    }
    return st;
  }

  function weekStats(mon) {
    var a = iso(mon), b = iso(addDays(mon, 6)), o = { n: 0, min: 0, vol: 0, prs: 0 };
    state.log.forEach(function (l) { if (l.d >= a && l.d <= b) { o.n++; o.min += l.min || 0; o.vol += l.vol || 0; o.prs += l.prs || 0; } });
    return o;
  }
  function hm(min) { var h = Math.floor(min / 60), m = Math.round(min % 60); return h ? h + ' t ' + m + ' min' : m + ' min'; }
  function diffTag(now, before, fmt) {
    if (!before && !now) return '';
    var d = now - before;
    if (!d) return '<span class="dt">som forrige uke</span>';
    return '<span class="dt ' + (d > 0 ? 'up' : 'down') + '">' + (d > 0 ? '+' : '−') + fmt(Math.abs(d)) + ' fra forrige uke</span>';
  }
  function volText(v) { return v >= 1000 ? (v / 1000).toLocaleString('nb-NO', { maximumFractionDigits: 1 }) + ' tonn' : nf(v) + ' kg'; }

  // Treningskalender: én rute per dag de siste 20 ukene, mørkere jo lenger du trente.
  function heatmap() {
    var weeks = 20, today = new Date(), tIso = iso(today), mon0 = addDays(startOfWeek(today), -7 * (weeks - 1));
    var mins = {}, count = 0;
    state.log.forEach(function (l) { mins[l.d] = (mins[l.d] || 0) + (l.min || 1); });
    var cells = '', months = '', lastM = -1, lastCol = -9;
    for (var w = 0; w < weeks; w++) {
      var wm = addDays(mon0, 7 * w);
      var mlabel = '';
      for (var k = 0; k < 7; k++) {
        var dd = addDays(wm, k);
        if ((dd.getDate() === 1 || (w === 0 && k === 0)) && dd.getMonth() !== lastM && w - lastCol >= 3) { mlabel = MONTHS[dd.getMonth()]; lastM = dd.getMonth(); lastCol = w; }
      }
      months += '<span>' + mlabel + '</span>';
      for (var d = 0; d < 7; d++) {
        var day = addDays(wm, d), di = iso(day), m = mins[di] || 0;
        if (di > tIso) { cells += '<i class="fut"></i>'; continue; }
        if (m) count++;
        var lv = !m ? 0 : m < 30 ? 1 : m < 60 ? 2 : 3;
        cells += '<i class="lv' + lv + (di === tIso ? ' now' : '') + '" title="' + DAYS[d] + ' ' + dateLabel(day) + (m ? ': ' + m + ' min' : ': ingen trening') + '"></i>';
      }
    }
    return '<div class="panel"><div class="ph"><h3>Treningsdager</h3><span class="sub">' + count + ' dager med trening de siste 20 ukene</span></div>' +
      '<div class="heatwrap"><div class="heatdays" aria-hidden="true"><span>Man</span><span></span><span>Ons</span><span></span><span>Fre</span><span></span><span>Søn</span></div>' +
      '<div class="heatmain"><div class="heatmonths" aria-hidden="true">' + months + '</div><div class="heat" role="img" aria-label="Treningskalender for de siste 20 ukene">' + cells + '</div></div></div>' +
      '<div class="heatlegend" aria-hidden="true"><span class="sub">Mindre</span><i class="lv0"></i><i class="lv1"></i><i class="lv2"></i><i class="lv3"></i><span class="sub">Mer</span></div></div>';
  }

  // Graf for én øvelse: beste sett hver gang (estimert maks for vektøvelser).
  function exercisePanel() {
    var names = {}, order = [];
    state.log.forEach(function (l) { (l.ex || []).forEach(function (e) { var k = exKey(e.n); if (!names[k]) { names[k] = e.n; order.push(k); } }); });
    var h = '<div class="panel"><div class="ph"><h3>Utvikling per øvelse</h3></div>';
    if (!order.length) return h + '<p class="empty">Fullfør en økt, så kan du følge utviklingen for hver øvelse her.</p></div>';
    if (!exSel || !names[exSel]) exSel = order[0];
    h += '<label class="sr" for="ex-sel">Velg øvelse</label><select id="ex-sel" class="inp exsel" data-f="exsel">' + order.slice().sort(function (a, b) { return names[a].localeCompare(names[b], 'nb'); }).map(function (k) {
      return '<option value="' + esc(k) + '"' + (k === exSel ? ' selected' : '') + '>' + esc(names[k]) + '</option>';
    }).join('') + '</select>';
    var hist = exHistory(names[exSel]).slice(0, 30).reverse();
    var weighted = hist.some(function (x) { return x.sets.some(function (y) { return y[0] > 0; }); });
    var pts = hist.map(function (x) {
      var v = 0;
      x.sets.forEach(function (y) { var c = weighted ? e1rm(y[0], y[1]) : y[1]; if (c > v) v = c; });
      return { d: x.d, v: Math.round(v * 10) / 10 };
    });
    var unit = weighted ? 'kg' : unitOf(hist.length ? hist[hist.length - 1].kind : 'styrke');
    h += '<p class="sub">' + (weighted ? 'Estimert maks (1RM) ut fra beste sett hver økt.' : 'Beste sett hver økt.') + '</p>';
    h += lineChart(pts, unit);
    var recent = exHistory(names[exSel]).slice(0, 5);
    h += '<div class="hist">' + recent.map(function (x) {
      var d = parseIso(x.d);
      return '<div class="hrow"><span class="d">' + DAYS[(d.getDay() + 6) % 7] + ' ' + dateLabel(d) + '</span><div><div class="meta">' + esc(setsText(x.sets, x.kind)) + '</div></div><span></span></div>';
    }).join('') + '</div>';
    return h + '</div>';
  }
  function lineChart(pts, unit) {
    if (pts.length < 2) return '<p class="empty">Gjør øvelsen minst to ganger, så tegnes en graf.</p>';
    var W = 640, H = 220, L = 46, R = 16, T = 16, B = 30;
    var vs = pts.map(function (p) { return p.v; }), lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs);
    if (hi === lo) { hi += 1; lo = Math.max(0, lo - 1); }
    var padv = (hi - lo) * 0.15; lo = Math.max(0, lo - padv); hi += padv;
    var x = function (i) { return L + (W - L - R) * (pts.length === 1 ? 0.5 : i / (pts.length - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); };
    var s = '<' + 'svg class="chart line" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Utvikling, fra ' + fmtNum(pts[0].v) + ' til ' + fmtNum(pts[pts.length - 1].v) + ' ' + unit + '">';
    [lo, (lo + hi) / 2, hi].forEach(function (v) { s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + fmtNum(Math.round(v)) + '</text>'; });
    var path = pts.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1); }).join('');
    s += '<path class="area" d="' + path + 'L' + x(pts.length - 1).toFixed(1) + ' ' + (H - B) + 'L' + x(0).toFixed(1) + ' ' + (H - B) + 'Z"/>';
    s += '<path class="ln" d="' + path + '"/>';
    pts.forEach(function (p, i) { s += '<circle class="pt' + (i === pts.length - 1 ? ' last' : '') + '" cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="' + (i === pts.length - 1 ? 5 : 3.5) + '"><title>' + dateLabel(parseIso(p.d)) + ': ' + fmtNum(p.v) + ' ' + unit + '</title></circle>'; });
    var lp = pts[pts.length - 1];
    s += '<text class="val" x="' + Math.min(x(pts.length - 1), W - R - 4) + '" y="' + (y(lp.v) - 10) + '" text-anchor="end">' + fmtNum(lp.v) + ' ' + unit + '</text>';
    s += '<text x="' + L + '" y="' + (H - 8) + '">' + dateLabel(parseIso(pts[0].d)) + '</text><text x="' + (W - R) + '" y="' + (H - 8) + '" text-anchor="end">' + dateLabel(parseIso(lp.d)) + '</text>';
    return '<div class="chart-wrap">' + s + '<' + '/svg></div>';
  }

  // Hvilke muskelgrupper som har fått sett de siste 30 dagene.
  var GROUP_RULES = [
    ['Mobilitet', /strekk|katt|mobil|rotasjon|yoga/],
    ['Kondisjon', /jumping|høye knær|burpee|løp|sykkel|intervall|hopp|oppvarming|nedkjøling|nedjogg|tau/],
    ['Skuldre', /skulder|pike|militær|sidehev|face ?pull/],
    ['Armer', /diamant|curl|biceps|triceps|dips/],
    ['Ben', /knebøy|utfall|bulgarsk|beinpress|benpress|tåhev|vegg-sitt|bekkenløft|hip ?thrust|rumensk|step|legg/],
    ['Bryst', /benk|armhev|brystpress|flyes|push/],
    ['Rygg', /roing|nedtrekk|pull|chin|markløft|superman|rygg/],
    ['Core', /planke|dødbille|bird|mage|sit-?up|crunch|hollow|russian/]
  ];
  function groupOf(name, kind) {
    var n = exKey(name);
    for (var i = 0; i < GROUP_RULES.length; i++) if (GROUP_RULES[i][1].test(n)) return GROUP_RULES[i][0];
    return kind === 'kondisjon' ? 'Kondisjon' : kind === 'mobilitet' ? 'Mobilitet' : kind === 'core' ? 'Core' : 'Annet';
  }
  function groupsPanel() {
    var since = iso(addDays(new Date(), -29)), cnt = {}, total = 0;
    state.log.forEach(function (l) {
      if (l.d < since) return;
      (l.ex || []).forEach(function (e) { var g = groupOf(e.n, l.kind); cnt[g] = (cnt[g] || 0) + e.s.length; total += e.s.length; });
    });
    var h = '<div class="panel"><div class="ph"><h3>Muskelgrupper</h3><span class="sub">Antall sett de siste 30 dagene</span></div>';
    if (!total) return h + '<p class="empty">Fullfør noen økter, så ser du hvilke muskelgrupper du trener mest.</p></div>';
    var list = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }), max = cnt[list[0]];
    h += '<div class="gbars">' + list.map(function (g) {
      return '<div class="gbar"><span class="gname">' + g + '</span><span class="gtrack"><i style="width:' + Math.max(4, cnt[g] / max * 100).toFixed(1) + '%"></i></span><span class="gval tnum">' + cnt[g] + '</span></div>';
    }).join('') + '</div>';
    var missing = ['Bryst', 'Rygg', 'Ben', 'Skuldre', 'Core'].filter(function (g) { return !cnt[g]; });
    if (missing.length && missing.length < 5) h += '<p class="sub" style="margin-top:10px">Ikke trent siste 30 dager: ' + missing.join(', ').toLowerCase() + '.</p>';
    return h + '</div>';
  }

  function histDetail(l) {
    var h = '<div class="hdetail">';
    if (l.ex && l.ex.length) h += l.ex.map(function (e) { return '<div class="hx"><span>' + esc(e.n) + '</span><span class="tnum">' + esc(setsText(e.s, l.kind)) + '</span></div>'; }).join('');
    else h += '<p class="sub">Ingen detaljer om settene for denne økta.</p>';
    if (l.rate) h += '<p class="sub">Følelse: <b>' + RATE[l.rate - 1] + '</b></p>';
    if (l.note) h += '<p class="hnote">' + esc(l.note) + '</p>';
    return h + '</div>';
  }

  function viewFrem() {
    var since = iso(addDays(new Date(), -29));
    var recent = state.log.filter(function (l) { return l.d >= since; });
    var vol = recent.reduce(function (a, l) { return a + (l.vol || 0); }, 0);
    var volTxt = vol >= 1000 ? '<span class="big tnum">' + (vol / 1000).toLocaleString('nb-NO', { maximumFractionDigits: 1 }) + '<small>tonn</small></span>' : '<span class="big tnum">' + nf(vol) + '<small>kg</small></span>';
    var h = '<div class="sec-head"><div><h2>Fremgang</h2><p class="sub">Uka, de siste 30 dagene og utviklingen over tid.</p></div></div>';
    if (celebrate) {
      h += '<div class="celebrate" role="status"><div><h3>' + (celebrate.length === 1 ? 'Ny personlig rekord!' : celebrate.length + ' nye personlige rekorder!') + '</h3><ul>' +
        celebrate.map(function (c) { return '<li><b>' + esc(c.name) + ':</b> ' + esc(c.text) + ' <span class="sub">(før ' + esc(c.old) + ')</span></li>'; }).join('') +
        '</ul></div><button class="btn btn-sm" data-act="celebrate-x">Lukk</button></div>';
    }
    // Denne uka mot forrige uke
    var wNow = weekStats(startOfWeek(new Date())), wPrev = weekStats(addDays(startOfWeek(new Date()), -7));
    h += '<div class="panel"><div class="ph"><h3>Denne uka</h3><span class="sub">Uke ' + isoWeek(new Date()) + '</span></div><div class="stats4">' +
      '<div><b class="tnum">' + wNow.n + '</b><span>' + (wNow.n === 1 ? 'økt' : 'økter') + '</span>' + diffTag(wNow.n, wPrev.n, function (v) { return v; }) + '</div>' +
      '<div><b class="tnum">' + hm(wNow.min) + '</b><span>trening</span>' + diffTag(wNow.min, wPrev.min, hm) + '</div>' +
      '<div><b class="tnum">' + volText(wNow.vol) + '</b><span>løftet</span>' + diffTag(wNow.vol, wPrev.vol, volText) + '</div>' +
      '<div><b class="tnum">' + wNow.prs + '</b><span>' + (wNow.prs === 1 ? 'ny rekord' : 'nye rekorder') + '</span></div></div></div>';
    h += '<div class="tiles"><div class="panel tile"><span class="big tnum">' + recent.length + '</span><div class="lab">Økter siste 30 dager</div></div>' +
      '<div class="panel tile">' + volTxt + '<div class="lab">Løftet volum (styrkeøkter)</div></div>' +
      '<div class="panel tile"><span class="big tnum">' + streakWeeks() + '<small>uker</small></span><div class="lab">På rad med ukemålet nådd</div></div></div>';
    h += heatmap();
    h += '<div class="panel"><div class="ph"><h3>Økter per uke</h3></div><div class="chart-wrap">' + chartSvg() + '</div></div>';
    h += exercisePanel();
    h += groupsPanel();
    h += '<div class="panel"><div class="ph"><h3>Historikk</h3><span class="sub">Trykk på en økt for å se settene</span></div>';
    if (!state.log.length) h += '<p class="empty">Ingen økter logget ennå. Fullfør en økt, så dukker den opp her.</p>';
    else {
      h += '<div class="hist">';
      state.log.slice(0, 30).forEach(function (l) {
        var d = parseIso(l.d), key = 'l' + l.id, open = openLog === l.id;
        var meta = l.min + ' min · ' + l.n + ' ' + (l.unit || 'sett') + (l.vol > 0 ? ' · ' + nf(l.vol) + ' kg' : '') +
          (l.prs ? ' · ' + l.prs + (l.prs === 1 ? ' rekord' : ' rekorder') : '') + (l.rate ? ' · ' + RATE[l.rate - 1].toLowerCase() : '');
        h += '<div class="hrow' + (open ? ' open' : '') + '"><span class="d">' + DAYS[(d.getDay() + 6) % 7] + ' ' + dateLabel(d) + '</span>' +
          '<button class="hopen" data-act="hist-open" data-id="' + esc(l.id) + '" aria-expanded="' + open + '"><span class="pn">' + esc(l.name) + '</span><span class="meta">' + meta + '</span></button>' +
          '<button class="btn btn-sm btn-ghost btn-danger" data-act="del-log" data-id="' + esc(l.id) + '" aria-label="Slett økt">' + (armed === key ? 'Slett?' : 'Slett') + '</button></div>';
        if (open) h += histDetail(l);
      });
      h += '</div>';
      if (state.log.length > 30) h += '<p class="sub" style="margin-top:8px">Viser de 30 siste av ' + state.log.length + ' økter.</p>';
    }
    h += '</div>';
    return h + prPanel();
  }

  function prPanel() {
    var list = Object.keys(state.pr).map(function (k) { return state.pr[k]; });
    list.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : a.name.localeCompare(b.name, 'nb'); });
    var h = '<div class="panel"><h3 style="font-size:17px;margin-bottom:4px">Personlige rekorder</h3>';
    if (!list.length) return h + '<p class="empty">Fullfør en styrke- eller core-økt, så lagres rekordene dine her.</p></div>';
    h += '<div class="hist">';
    list.slice(0, 15).forEach(function (r) {
      h += '<div class="hrow"><span class="d">' + dateLabel(parseIso(r.d)) + '</span><div><div class="pn">' + esc(r.name) + '</div><div class="meta">' + esc(PR_LABEL[r.type]) + (r.type === 'kg' && r.reps > 1 ? ' · estimert maks ' + fmtNum(Math.round(e1rm(r.kg, r.reps) * 2) / 2) + ' kg' : '') + '</div></div><span class="prval tnum">' + esc(prText(r)) + '</span></div>';
    });
    if (list.length > 15) h += '<p class="sub" style="margin-top:8px">Viser de 15 nyeste av ' + list.length + ' rekorder.</p>';
    return h + '</div></div>';
  }

  /* ---------- hjemmetrening ---------- */
  var HOME_PROGRAMS = [
    { name: 'Hel kropp hjemme', kind: 'styrke', min: 30, ex: [['Knebøy', 3, 15, 0], ['Armhevinger', 3, 10, 0], ['Utfall', 3, 12, 0], ['Bekkenløft', 3, 15, 0], ['Superman', 3, 12, 0]] },
    { name: 'Overkropp hjemme', kind: 'styrke', min: 25, ex: [['Armhevinger', 4, 10, 0], ['Diamant-armhevinger', 3, 8, 0], ['Dips på stol', 3, 12, 0], ['Pike-armhevinger', 3, 8, 0]] },
    { name: 'Ben og rumpe hjemme', kind: 'styrke', min: 30, ex: [['Knebøy', 4, 15, 0], ['Bulgarsk utfall', 3, 10, 0], ['Bekkenløft', 3, 15, 0], ['Tåhev', 3, 20, 0]] },
    { name: 'Core hjemme', kind: 'core', min: 15, ex: [['Planke', 3, 40, 0], ['Sideplanke', 3, 30, 0], ['Dødbille', 3, 30, 0], ['Bird dog', 3, 30, 0]] },
    { name: 'Intervaller hjemme', kind: 'kondisjon', min: 25, ex: [['Rolig oppvarming', 1, 5, 0], ['Jumping jacks', 3, 2, 0], ['Høye knær', 3, 2, 0], ['Burpees', 3, 1, 0], ['Rolig nedkjøling', 1, 5, 0]] },
    { name: 'Mobilitet hjemme', kind: 'mobilitet', min: 10, ex: [['Katt-ku', 2, 45, 0], ['Hoftebøyer-strekk', 2, 45, 0], ['Hamstring-strekk', 2, 45, 0]] }
  ];
  var LEVELS = { 1: 'Nybegynner', 2: 'Middels', 3: 'Krevende' };
  var HOME_GROUPS = ['Overkropp', 'Ben', 'Core', 'Kondisjon', 'Mobilitet'];
  var HOME_LIB = [
    ['Armhevinger', 'Overkropp', 1, 'Hendene litt bredere enn skuldrene, kroppen i rett linje. Senk brystet mot gulvet. Knærne i gulvet gjør den lettere.'],
    ['Diamant-armhevinger', 'Overkropp', 2, 'Hendene tett sammen under brystet og albuene inn mot kroppen. Tar hardere på baksiden av armene.'],
    ['Dips på stol', 'Overkropp', 2, 'Hendene på kanten av en stabil stol. Senk hoftene rett ned til albuene er bøyd omtrent 90 grader.'],
    ['Pike-armhevinger', 'Overkropp', 3, 'Hoftene høyt i en omvendt V. Senk hodet mot gulvet og press deg opp igjen. Trener skuldrene.'],
    ['Knebøy', 'Ben', 1, 'Føttene i skulderbredde. Skyv hoftene bakover og ned, og la knærne følge tærne.'],
    ['Utfall', 'Ben', 1, 'Ta et langt steg frem og senk det bakre kneet mot gulvet. Press opp med den fremre hælen.'],
    ['Bulgarsk utfall', 'Ben', 2, 'Den bakre foten hviler på en stol eller sofa. Senk deg rett ned på det fremre beinet.'],
    ['Bekkenløft', 'Ben', 1, 'Ligg på ryggen med bøyde knær. Løft hoftene til kroppen er rett fra skuldre til knær, og klem rumpa.'],
    ['Tåhev', 'Ben', 1, 'Stå på kanten av en trapp og hev hælene så høyt du kan. Senk rolig ned igjen.'],
    ['Vegg-sitt', 'Ben', 1, 'Ryggen mot veggen og lårene parallelt med gulvet. Hold posisjonen.'],
    ['Planke', 'Core', 1, 'Albuene under skuldrene og kroppen i en rett linje. Stram mage og rumpe.'],
    ['Sideplanke', 'Core', 2, 'Støtt deg på en albue og løft hoftene. Hold kroppen rett fra hode til føtter.'],
    ['Dødbille', 'Core', 1, 'Ligg på ryggen med armer og bein i været. Senk motsatt arm og bein mot gulvet uten at korsryggen løfter seg.'],
    ['Bird dog', 'Core', 1, 'På alle fire. Strekk motsatt arm og bein ut og hold hoftene i ro.'],
    ['Superman', 'Core', 1, 'Ligg på magen. Løft armer og bein samtidig og hold i ett sekund.'],
    ['Jumping jacks', 'Kondisjon', 1, 'Hopp bena ut til siden og armene over hodet, og tilbake igjen i jevn rytme.'],
    ['Høye knær', 'Kondisjon', 1, 'Løp på stedet og løft knærne opp til hoftehøyde.'],
    ['Burpees', 'Kondisjon', 3, 'Ned i armhevingsposisjon, hopp føttene inn og hopp opp med armene over hodet.'],
    ['Katt-ku', 'Mobilitet', 1, 'På alle fire. Rund og svai ryggen i rolig tempo sammen med pusten.'],
    ['Hoftebøyer-strekk', 'Mobilitet', 1, 'I utfallsposisjon med bakre kne i gulvet. Skyv hoftene forsiktig fremover.'],
    ['Hamstring-strekk', 'Mobilitet', 1, 'Sittende med ett bein strukket frem. Len deg frem fra hoftene med rett rygg.']
  ];
  var homeFilter = 'Alle';
  function homeProgram(i) {
    var h = HOME_PROGRAMS[i];
    var have = state.programs.filter(function (p) { return p.name === h.name; })[0];
    if (have) return have;
    var p = { id: uid(), name: h.name, kind: h.kind, exercises: h.ex.map(function (e) { return { id: uid(), name: e[0], sets: e[1], reps: e[2], kg: e[3] }; }) };
    state.programs.push(p);
    save();
    return p;
  }
  function viewHjemme() {
    var h = '<div class="sec-head"><div><h2>Hjemmetrening</h2><p class="sub">Ingen utstyr nødvendig, bare gulvplass og en stabil stol. Start en økt med en gang, eller legg den til i programmene dine.</p></div></div>';
    h += '<h3 class="subhead">Ferdige økter</h3><div class="homegrid">';
    HOME_PROGRAMS.forEach(function (hp, i) {
      var added = state.programs.some(function (p) { return p.name === hp.name; });
      h += '<article class="panel homecard"><div><div class="pn">' + esc(hp.name) + '</div>' + kindTag(hp.kind) + ' <span class="sub">· ca ' + hp.min + ' min</span></div>' +
        '<p class="sub">' + hp.ex.map(function (e) { return esc(e[0]); }).join(' · ') + '</p>' +
        '<div class="row-actions"><button class="btn btn-primary btn-sm" data-act="home-start" data-i="' + i + '">Start nå</button>' +
        '<button class="btn btn-sm" data-act="home-add" data-i="' + i + '"' + (added ? ' disabled' : '') + '>' + (added ? '✓ I programmene' : 'Legg til i programmer') + '</button></div></article>';
    });
    h += '</div><h3 class="subhead">Øvelsesbibliotek</h3><p class="sub">Fargede deler av figuren viser hva som jobber mest.</p><div class="chips" role="group" aria-label="Filtrer øvelser">';
    ['Alle'].concat(HOME_GROUPS).forEach(function (g) {
      h += '<button class="chip" data-act="hf" data-k="' + esc(g) + '" aria-pressed="' + (g === homeFilter) + '">' + g + '</button>';
    });
    h += '</div><div class="libgrid">';
    HOME_LIB.filter(function (x) { return homeFilter === 'Alle' || x[1] === homeFilter; }).forEach(function (x) {
      var pips = '';
      for (var i = 1; i <= 3; i++) pips += '<i' + (i <= x[2] ? ' class="on"' : '') + '></i>';
      var holdTxt = (window.TBAnim && TBAnim.isHold(x[0])) ? ' · Holdøvelse' : '';
      h += '<article class="panel libcard">' + (window.TBAnim ? TBAnim.html(x[0]) : '') + '<div class="lib-top"><h4>' + esc(x[0]) + '</h4><span class="lvl" title="Nivå: ' + LEVELS[x[2]] + '">' + pips + '</span></div>' +
        '<div class="sub">' + esc(x[1]) + ' · ' + LEVELS[x[2]] + holdTxt + '</div><p>' + esc(x[3]) + '</p></article>';
    });
    return h + '</div>';
  }

  /* ---------- render + routing ---------- */
  function render() {
    var fn = { uke: viewUke, okt: viewOkt, programmer: viewProg, hjemme: viewHjemme, fremgang: viewFrem }[view] || EXT.views[view];
    $('#app').innerHTML = fn();
    document.querySelectorAll('.nav a').forEach(function (a) {
      if (a.dataset.v === (EXT.nav[view] || view)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var showRest = view === 'okt' && !!sess;
    $('#restbar').hidden = !showRest;
    document.body.classList.toggle('has-rest', showRest);
    drawRest();
    // Diagrammer som er bredere enn skjermen viser den nyeste uka først
    document.querySelectorAll('.chart-wrap').forEach(function (el) { el.scrollLeft = el.scrollWidth; });
    if (window.TBAnim) TBAnim.refresh();
  }
  function route() {
    var h = location.hash.slice(1);
    view = VIEWS.indexOf(h) > -1 ? h : 'uke';
    if (view !== 'fremgang') celebrate = null;
    armed = '';
    render();
  }
  function go(v) { if (location.hash.slice(1) === v) route(); else location.hash = v; }
  window.addEventListener('hashchange', route);

  /* ---------- rest timer ---------- */
  var restEnd = 0, restTimer = null, audio = null;
  function beep(freq, dur) {
    try {
      if (!audio || !state.settings.sound) return;
      var o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = freq || 880; g.gain.value = 0.15;
      o.connect(g); g.connect(audio.destination);
      o.start(); o.stop(audio.currentTime + (dur || 0.35));
    } catch (e) { }
  }
  function ensureAudio() {
    try { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { }
  }
  function buzz(pattern) { try { if (navigator.vibrate && state.settings.vibrate) navigator.vibrate(pattern); } catch (e) { } }
  function drawRest() {
    var el = $('#rest-time'), bar = $('#restbar');
    if (!el) return;
    document.querySelectorAll('#restbar .chip[data-s]').forEach(function (c) { c.setAttribute('aria-pressed', String(Number(c.dataset.s) === state.rest)); });
    if (restEnd) {
      var left = Math.ceil((restEnd - Date.now()) / 1000);
      if (left <= 0) {
        restEnd = 0; clearInterval(restTimer); restTimer = null; beep();
        bar.classList.add('ready'); el.textContent = 'Klar';
      } else { bar.classList.remove('ready'); el.textContent = fmtTime(left); }
    } else if (!bar.classList.contains('ready')) {
      el.textContent = fmtTime(state.rest);
    }
  }
  function startRest(sec) {
    ensureAudio();
    if (state.rest !== sec) { state.rest = sec; save(); }
    $('#restbar').classList.remove('ready');
    restEnd = Date.now() + sec * 1000;
    clearInterval(restTimer);
    restTimer = setInterval(drawRest, 250);
    drawRest();
  }
  function stopRest() {
    restEnd = 0; clearInterval(restTimer); restTimer = null;
    $('#restbar').classList.remove('ready');
    drawRest();
  }
  setInterval(function () { var el = $('#elapsed'); if (el && sess) el.textContent = fmtTime((Date.now() - sess.start) / 1000); }, 1000);

  /* ---------- session logic ---------- */
  function startSession(pid) {
    var p = P(pid); if (!p) return;
    var kg = p.kind === 'styrke';
    var K = KINDS[p.kind] || KINDS.styrke;
    sess = {
      pid: p.id, name: p.name, kind: p.kind, start: Date.now(),
      rows: p.exercises.map(function (e) {
        var last = state.last[e.name] || {};
        var n = Math.max(1, Math.round(num(e.sets)) || 1), sets = [];
        for (var i = 0; i < n; i++) sets.push({ kg: kg ? (last.kg != null ? last.kg : e.kg) : 0, reps: last.reps != null ? last.reps : e.reps, done: false });
        return { name: e.name, plan: n + ' × ' + e.reps + (kg ? (num(e.kg) > 0 ? ' × ' + e.kg + ' kg' : '') : ' ' + K.unit.toLowerCase()), sets: sets, target: num(e.reps), nsets: n };
      })
    };
    saveDraft(); stopRest();
    go('okt');
  }
  function finishSession() {
    var done = 0, vol = 0, mins = 0, last = state.last;
    sess.rows.forEach(function (r) {
      var best = null;
      r.sets.forEach(function (s) {
        if (!s.done) return;
        done++;
        if (sess.kind === 'styrke') vol += num(s.kg) * num(s.reps);
        best = s;
      });
      if (best && sess.kind === 'styrke') last[r.name] = { kg: num(best.kg), reps: num(best.reps) };
    });
    if (!done) { var m = $('#sess-msg'); if (m) m.textContent = 'Merk av minst ett sett først.'; return; }
    mins = Math.max(1, Math.round((Date.now() - sess.start) / 60000));
    var newPRs = updateRecords(sess);
    celebrate = newPRs.length ? newPRs : null;
    var exd = sess.rows.map(function (r) {
      return { n: String(r.name).trim(), s: r.sets.filter(function (x) { return x.done; }).map(function (x) { return [num(x.kg), num(x.reps)]; }) };
    }).filter(function (x) { return x.s.length; });
    state.log.unshift({ id: uid(), d: iso(new Date()), pid: sess.pid, name: sess.name, kind: sess.kind, min: mins, vol: Math.round(vol), n: done, prs: newPRs.length,
      ex: exd, rate: sess.rate || 0, note: String(sess.note || '').trim().slice(0, 500) });
    state.log = state.log.slice(0, 600);
    stopHold(); sess = null; saveDraft(); stopRest(); save();
    go('fremgang');
  }

  /* ---------- øvelsesdata: historikk, forslag og estimert maks ---------- */
  var e1rm = function (kg, reps) { return reps <= 1 ? kg : kg * (1 + reps / 30); };      // Epleys formel
  function exKey(n) { return String(n || '').trim().toLowerCase(); }
  // Alle ganger en øvelse er logget, nyeste først: [{ d, kind, sets: [[kg, reps], …] }]
  function exHistory(name) {
    var k = exKey(name), out = [];
    state.log.forEach(function (l) {
      (l.ex || []).forEach(function (e) { if (exKey(e.n) === k && e.s && e.s.length) out.push({ d: l.d, kind: l.kind, sets: e.s }); });
    });
    return out;
  }
  function unitOf(kind) { return kind === 'core' || kind === 'mobilitet' ? 'sek' : kind === 'kondisjon' ? 'min' : 'reps'; }
  function setsText(sets, kind) {
    var w = sets[0][0] > 0, same = sets.every(function (x) { return x[0] === sets[0][0] && x[1] === sets[0][1]; });
    if (same) return sets.length + ' × ' + fmtNum(sets[0][1]) + (w ? ' × ' + fmtNum(sets[0][0]) + ' kg' : ' ' + unitOf(kind));
    return sets.map(function (x) { return fmtNum(x[1]) + (w ? ' × ' + fmtNum(x[0]) : ''); }).join(', ') + (w ? ' kg' : ' ' + unitOf(kind));
  }
  // Klarte du målet i alle sett sist, foreslår appen litt mer: vekt, én rep til eller fem sekunder til.
  function suggestion(r) {
    var h = exHistory(r.name)[0];
    if (!h) return null;
    var out = { last: h };
    if (!r.target) return out;
    var hit = h.sets.length >= (r.nsets || 1) && h.sets.every(function (x) { return x[1] >= r.target; });
    if (!hit) return out;
    var maxKg = Math.max.apply(null, h.sets.map(function (x) { return x[0]; }));
    var bestRep = Math.max.apply(null, h.sets.map(function (x) { return x[1]; }));
    if (sess.kind === 'styrke' && maxKg > 0) { out.kg = maxKg + state.settings.inc; out.text = 'Du klarte alle repetisjonene sist. Prøv ' + (Math.round(out.kg * 100) / 100).toLocaleString('nb-NO') + ' kg i dag.'; }
    else if (sess.kind === 'styrke') { out.reps = bestRep + 1; out.text = 'Du klarte alle repetisjonene sist. Prøv ' + out.reps + ' reps i dag.'; }
    else if (sess.kind === 'core') { out.reps = bestRep + 5; out.text = 'Du holdt hele tiden sist. Prøv ' + out.reps + ' sekunder i dag.'; }
    return out;
  }
  function stopHold() { clearInterval(holdT); holdT = null; hold = null; }
  function holdTick() {
    if (!hold) return;
    var left = hold.end - Date.now(), b = document.getElementById('hold-' + hold.r + '-' + hold.s);
    if (left <= 0) {
      var set = sess && sess.rows[hold.r] && sess.rows[hold.r].sets[hold.s];
      if (set) set.done = true;
      stopHold(); beep(1046, 0.4); buzz([200, 80, 200]); saveDraft(); render();
      return;
    }
    var sec = Math.ceil(left / 1000);
    if (sec <= 3 && sec !== hold.beeped) { hold.beeped = sec; beep(880, 0.1); }
    if (b) b.textContent = sec;
  }

  /* ---------- personlige rekorder ---------- */
  // kg = tyngste vekt (flest reps ved lik vekt), reps = flest reps i ett sett, sek = lengste hold.
  var PR_LABEL = { kg: 'Tyngste vekt', reps: 'Flest reps i ett sett', sek: 'Lengste hold' };
  function prType(kind, kg) { if (kind === 'styrke') return kg > 0 ? 'kg' : 'reps'; if (kind === 'core') return 'sek'; return null; }
  function prKey(name, type) { return String(name || '').trim().toLowerCase() + '|' + type; }
  function prBetter(type, a, b) {
    if (!b) return true;
    if (type === 'kg') return a.kg > b.kg || (a.kg === b.kg && a.reps > b.reps);
    return a.reps > b.reps;
  }
  function prText(r) {
    if (!r) return '';
    if (r.type === 'kg') return fmtNum(r.kg) + ' kg × ' + fmtNum(r.reps);
    if (r.type === 'sek') return fmtNum(r.reps) + ' sek';
    return fmtNum(r.reps) + ' reps';
  }
  function setRec(kind, s) {
    var kg = kind === 'styrke' ? num(s.kg) : 0, type = prType(kind, kg);
    return type ? { type: type, kg: kg, reps: num(s.reps) } : null;
  }
  function rowRecord(r) {
    var rec = r.sets[0] ? setRec(sess.kind, r.sets[0]) : null;
    return rec ? state.pr[prKey(r.name, rec.type)] || null : null;
  }
  // Et avkrysset sett slår rekorden bare når det finnes en rekord fra før.
  function beatsRecord(name, s) {
    var rec = setRec(sess.kind, s);
    if (!rec || rec.reps <= 0) return false;
    var old = state.pr[prKey(name, rec.type)];
    return !!old && prBetter(rec.type, rec, old);
  }
  // Oppdaterer rekordene etter en økt. Første gang en øvelse gjøres lagres den stille som utgangspunkt.
  function updateRecords(se) {
    var out = [], today = iso(new Date());
    se.rows.forEach(function (r) {
      var best = {};
      r.sets.forEach(function (s) {
        if (!s.done) return;
        var rec = setRec(se.kind, s);
        if (!rec || rec.reps <= 0) return;
        if (!best[rec.type] || prBetter(rec.type, rec, best[rec.type])) best[rec.type] = rec;
      });
      Object.keys(best).forEach(function (type) {
        var rec = best[type], key = prKey(r.name, type), old = state.pr[key];
        if (old && !prBetter(type, rec, old)) return;
        state.pr[key] = { name: String(r.name).trim(), type: type, kg: rec.kg, reps: rec.reps, d: today };
        if (old) out.push({ name: String(r.name).trim(), text: prText(state.pr[key]), old: prText(old) });
      });
    });
    return out;
  }

  /* ---------- intervalltimer ---------- */
  var IV_PREP = 5;
  var IV_PRESETS = [
    { w: 20, r: 10, n: 8, label: 'Tabata 20/10 × 8' },
    { w: 30, r: 30, n: 10, label: '30/30 × 10' },
    { w: 40, r: 20, n: 8, label: '40/20 × 8' },
    { w: 45, r: 15, n: 6, label: '45/15 × 6' }
  ];
  var IV_EX = ['Jumping jacks', 'Høye knær', 'Burpees', 'Knebøy', 'Utfall', 'Armhevinger', 'Planke', 'Bekkenløft', 'Superman', 'Dødbille'];
  var wake = null;
  function wakeOn() {
    try {
      if (!navigator.wakeLock || wake) return;
      navigator.wakeLock.request('screen').then(function (w) { wake = w; w.addEventListener('release', function () { wake = null; }); }, function () { });
    } catch (e) { }
  }
  function wakeOff() { try { if (wake) wake.release(); } catch (e) { } wake = null; }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && iv && iv.phase !== 'done' && !iv.paused) wakeOn(); });

  function clock(sec) { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + pad(sec % 60); }
  function ivTotal() { var c = state.iv; return IV_PREP + c.rounds * c.work + (c.rounds - 1) * c.rest; }
  function ivExFor(round) { var l = state.iv.ex; return l.length ? l[(round - 1) % l.length] : null; }
  function clampInt(v, lo, hi) { var n = Math.round(num(v)); return Math.min(hi, Math.max(lo, n)); }

  function ivSetup() {
    var c = state.iv;
    var h = '<section class="panel ivset" aria-labelledby="iv-h"><div class="sec-head"><div><h2 id="iv-h">Intervalltimer</h2><p class="sub">Jobb og pause på tid, med pip før hvert bytte.</p></div></div>';
    h += '<div class="chips" role="group" aria-label="Ferdige oppsett">' + IV_PRESETS.map(function (p) {
      var on = p.w === c.work && p.r === c.rest && p.n === c.rounds;
      return '<button class="chip" data-act="iv-pre" data-w="' + p.w + '" data-r="' + p.r + '" data-n="' + p.n + '" aria-pressed="' + on + '">' + p.label + '</button>';
    }).join('') + '</div>';
    h += '<div class="row3"><label for="iv-w">Jobb (sek)<input id="iv-w" class="inp" type="number" inputmode="numeric" min="5" max="600" data-f="ivw" value="' + c.work + '"></label>' +
      '<label for="iv-r">Pause (sek)<input id="iv-r" class="inp" type="number" inputmode="numeric" min="0" max="600" data-f="ivr" value="' + c.rest + '"></label>' +
      '<label for="iv-n">Runder<input id="iv-n" class="inp" type="number" inputmode="numeric" min="1" max="50" data-f="ivn" value="' + c.rounds + '"></label></div>';
    h += '<div><div class="sub" style="margin-bottom:6px">Øvelser, i rekkefølgen du velger dem. De går på omgang, én per runde.</div><div class="chips" role="group" aria-label="Øvelser">' +
      IV_EX.map(function (n) {
        var i = c.ex.indexOf(n);
        return '<button class="chip" data-act="iv-ex" data-k="' + esc(n) + '" aria-pressed="' + (i > -1) + '">' + (i > -1 ? '<b class="tnum">' + (i + 1) + '</b> ' : '') + esc(n) + '</button>';
      }).join('') + '</div></div>';
    h += '<div class="sess-foot"><button class="btn btn-primary" data-act="iv-start">Start intervaller</button><span class="sub tnum" id="iv-total">Totalt ' + clock(ivTotal()) + '</span></div></section>';
    return h;
  }

  function viewInterval() {
    var c = state.iv;
    if (iv.phase === 'done') {
      return '<section class="panel iv ph-done"><div class="iv-top"><span class="iv-phase">Ferdig</span></div>' +
        '<p class="iv-donetxt tnum">' + iv.doneRounds + ' runder · ' + clock((iv.stopped - iv.start) / 1000) + '</p><p class="sub">Økta er lagret i fremgangen din.</p>' +
        '<div class="sess-foot"><button class="btn btn-primary" data-act="iv-close" data-to="fremgang">Se fremgang</button><button class="btn" data-act="iv-close">Tilbake</button></div></section>';
    }
    var labels = { prep: 'Gjør deg klar', work: 'Jobb', rest: 'Pause' };
    var left = iv.paused ? iv.left : iv.end - Date.now();
    var exName = iv.phase === 'work' ? ivExFor(iv.round) : ivExFor(iv.phase === 'prep' ? iv.round : iv.round + 1);
    var dots = '';
    if (c.rounds <= 20) {
      for (var i = 1; i <= c.rounds; i++) dots += '<i class="' + (i <= iv.doneRounds ? 'on' : '') + (i === iv.round && iv.phase === 'work' ? ' cur' : '') + '"></i>';
    }
    var h = '<section class="panel iv ph-' + iv.phase + (iv.paused ? ' is-paused' : '') + '" aria-live="polite">';
    h += '<div class="iv-top"><span class="iv-phase">' + (iv.paused ? 'Stoppet' : labels[iv.phase]) + '</span><span class="sub tnum">Runde ' + Math.min(iv.round, c.rounds) + ' av ' + c.rounds + '</span></div>';
    h += '<div class="iv-time tnum" id="iv-time" role="timer">' + clock(left / 1000) + '</div>';
    h += '<div class="iv-bar" aria-hidden="true"><i id="iv-fill" style="width:' + Math.min(100, Math.max(0, (1 - left / iv.dur) * 100)).toFixed(1) + '%"></i></div>';
    if (dots) h += '<div class="iv-dots" aria-hidden="true">' + dots + '</div>';
    if (exName) {
      h += '<div class="iv-ex"><div class="iv-exname">' + (iv.phase === 'work' ? '' : '<span class="sub">Neste: </span>') + esc(exName) + '</div>' +
        (window.TBAnim && TBAnim.has(exName) ? TBAnim.html(exName) : '') + '</div>';
    }
    h += '<div class="sess-foot"><button class="btn btn-primary" data-act="iv-pause">' + (iv.paused ? 'Fortsett' : 'Pause') + '</button>' +
      '<button class="btn" data-act="iv-skip">Hopp over</button>' +
      '<button class="btn btn-ghost' + (armed === 'iv-stop' ? ' btn-danger' : '') + '" data-act="iv-stop">' + (armed === 'iv-stop' ? (iv.doneRounds ? 'Avslutt og lagre?' : 'Avslutt uten å lagre?') : 'Avslutt') + '</button></div>';
    return h + '</section>';
  }

  function ivStart() {
    ensureAudio();
    var now = Date.now();
    iv = { phase: 'prep', round: 1, doneRounds: 0, start: now, dur: IV_PREP * 1000, end: now + IV_PREP * 1000, paused: false, left: 0, beeped: 0 };
    clearInterval(ivTimer);
    ivTimer = setInterval(ivTick, 200);
    wakeOn();
    beep(660, 0.15);
    render();
  }
  function ivSetPhase(ph, sec, base) {
    iv.phase = ph; iv.dur = sec * 1000; iv.end = base + iv.dur; iv.beeped = 0;
    if (Date.now() - base < 1000) {                     // ikke pip når appen tar igjen tid etter å ha vært i bakgrunnen
      beep(ph === 'work' ? 1046 : 660, 0.4);
      buzz(ph === 'work' ? [200, 80, 200] : 300);
    }
    if (view === 'okt') render();
  }
  function ivAdvance(base) {
    var c = state.iv;
    if (iv.phase === 'prep') { ivSetPhase('work', c.work, base); return; }
    if (iv.phase === 'work') {
      iv.doneRounds = iv.round;
      if (iv.round >= c.rounds) { ivFinish(); return; }
      if (c.rest > 0) { ivSetPhase('rest', c.rest, base); return; }
      iv.round++; ivSetPhase('work', c.work, base); return;
    }
    if (iv.phase === 'rest') { iv.round++; ivSetPhase('work', c.work, base); }
  }
  function ivTick() {
    if (!iv || iv.paused || iv.phase === 'done') return;
    var now = Date.now(), left = iv.end - now;
    if (left <= 0) { ivAdvance(iv.end); return; }
    var sec = Math.ceil(left / 1000);
    if (sec <= 3 && sec !== iv.beeped) { iv.beeped = sec; beep(880, 0.12); }
    var t = $('#iv-time'), f = $('#iv-fill');
    if (t) t.textContent = clock(left / 1000);
    if (f) f.style.width = Math.min(100, Math.max(0, (1 - left / iv.dur) * 100)).toFixed(1) + '%';
  }
  function ivLog() {
    var c = state.iv;
    state.log.unshift({ id: uid(), d: iso(new Date()), pid: 'iv', name: 'Intervaller ' + c.work + '/' + c.rest, kind: 'kondisjon',
      min: Math.max(1, Math.round((iv.stopped - iv.start) / 60000)), vol: 0, n: iv.doneRounds, unit: iv.doneRounds === 1 ? 'runde' : 'runder' });
    state.log = state.log.slice(0, 400);
    save();
  }
  function ivFinish() {
    clearInterval(ivTimer); ivTimer = null; wakeOff();
    iv.phase = 'done'; iv.stopped = Date.now();
    ivLog();
    beep(1046, 0.2); setTimeout(function () { beep(1318, 0.5); }, 250);
    buzz([300, 100, 300, 100, 500]);
    render();
  }
  function ivStop() {
    clearInterval(ivTimer); ivTimer = null; wakeOff();
    iv.stopped = Date.now();
    if (iv.doneRounds > 0) ivLog();
    iv = null;
    render();
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var a = t.dataset.act, p, ex;
    var keep = (a === 'del-prog' || a === 'del-log' || a === 'cancel' || a === 'iv-stop' || a === 'plan-del' || !!EXT.keep[a]);
    if (!keep && armed) armed = '';
    switch (a) {
      case 'wk-prev': weekOffset--; render(); break;
      case 'wk-next': weekOffset++; render(); break;
      case 'wk-now': weekOffset = 0; render(); break;
      case 'goal-dec': if (curPlan().goal > 1) { curPlan().goal--; save(); render(); } break;
      case 'goal-inc': if (curPlan().goal < 14) { curPlan().goal++; save(); render(); } break;
      case 'hint-x': state.hint = false; save(); render(); break;
      case 'start':
        if (iv || (sess && sess.pid !== t.dataset.p)) { go('okt'); break; }
        startSession(t.dataset.p); break;
      case 'setdone': {
        var r = +t.dataset.r, s = +t.dataset.s, set = sess.rows[r].sets[s];
        set.done = !set.done; saveDraft();
        if (set.done && sess.kind === 'styrke') startRest(state.rest);
        render();                                                       // viser «Ny rekord» med en gang
        break;
      }
      case 'addset': {
        var row = sess.rows[+t.dataset.r], lastSet = row.sets[row.sets.length - 1] || { kg: 0, reps: 0 };
        row.sets.push({ kg: lastSet.kg, reps: lastSet.reps, done: false });
        saveDraft(); render(); break;
      }
      case 'finish': finishSession(); break;
      case 'cancel':
        if (armed !== 'cancel') { armed = 'cancel'; render(); break; }
        armed = ''; stopHold(); sess = null; saveDraft(); stopRest(); render(); break;
      case 'rest': startRest(Number(t.dataset.s)); break;
      case 'celebrate-x': celebrate = null; render(); break;
      case 'rate': if (sess) { var rv = +t.dataset.k; sess.rate = sess.rate === rv ? 0 : rv; saveDraft(); render(); } break;
      case 'bump': {
        var br = sess && sess.rows[+t.dataset.r], sgg = br && suggestion(br);
        if (!sgg) break;
        br.sets.forEach(function (x) { if (x.done) return; if (sgg.kg != null) x.kg = sgg.kg; if (sgg.reps != null) x.reps = sgg.reps; });
        br.bumped = true; saveDraft(); render(); break;
      }
      case 'hold': {
        var hr = +t.dataset.r, hs = +t.dataset.s;
        if (hold && hold.r === hr && hold.s === hs) { stopHold(); render(); break; }
        ensureAudio(); stopHold();
        var secs = num(sess.rows[hr].sets[hs].reps);
        if (secs <= 0) break;
        hold = { r: hr, s: hs, end: Date.now() + secs * 1000, beeped: 0 };
        holdT = setInterval(holdTick, 200); beep(660, 0.15); render(); break;
      }
      case 'hist-open': openLog = openLog === t.dataset.id ? null : t.dataset.id; render(); break;
      case 'ex-sel': exSel = t.dataset.k; render(); break;
      case 'iv-pre':
        state.iv.work = +t.dataset.w; state.iv.rest = +t.dataset.r; state.iv.rounds = +t.dataset.n;
        save(); render(); break;
      case 'iv-ex': {
        var nm = t.dataset.k, ix = state.iv.ex.indexOf(nm);
        if (ix > -1) state.iv.ex.splice(ix, 1); else state.iv.ex.push(nm);
        save(); render(); break;
      }
      case 'iv-start': if (!sess && !iv) ivStart(); break;
      case 'iv-pause':
        if (!iv) break;
        if (iv.paused) { iv.end = Date.now() + iv.left; iv.paused = false; wakeOn(); }
        else { iv.left = iv.end - Date.now(); iv.paused = true; }
        render(); break;
      case 'iv-skip':
        if (!iv) break;
        if (iv.paused) { iv.paused = false; }
        ivAdvance(Date.now()); if (iv && iv.phase !== 'done') render(); break;
      case 'iv-stop':
        if (!iv) break;
        if (armed !== 'iv-stop') { armed = 'iv-stop'; render(); break; }
        armed = ''; ivStop(); break;
      case 'iv-close':
        iv = null; if (t.dataset.to) go(t.dataset.to); else render(); break;
      case 'rest-stop': stopRest(); break;
      case 'plan-sw': state.activePlan = t.dataset.k; save(); render(); break;
      case 'plan-manage': managing = !managing; render(); break;
      case 'plan-new': case 'plan-copy': {
        var src = curPlan(), np = { id: uid(), name: a === 'plan-new' ? 'Ny plan' : (src.name + ' (kopi)').slice(0, 40), goal: src.goal,
          week: a === 'plan-new' ? [[], [], [], [], [], [], []] : src.week.map(function (l) { return l.slice(); }) };
        state.planList.push(np); state.activePlan = np.id; managing = true;
        save(); render();
        var ni = $('#plan-name'); if (ni) { ni.focus(); ni.select(); }
        break;
      }
      case 'plan-del': {
        if (state.planList.length < 2) break;
        if (armed !== 'plan-del') { armed = 'plan-del'; render(); break; }
        armed = '';
        var gone = curPlan().id;
        state.planList = state.planList.filter(function (pl) { return pl.id !== gone; });
        Object.keys(state.over).forEach(function (k) { if (k.indexOf(gone + '|') === 0) delete state.over[k]; });
        state.activePlan = state.planList[0].id;
        save(); render(); break;
      }
      case 'scope': editScope = t.dataset.k === 'week' ? 'week' : 'all'; render(); break;
      case 'day-rm': editList(+t.dataset.i).splice(+t.dataset.j, 1); save(); render(); break;
      case 'day-reset': {
        var ok = overKey(curPlan(), shownMon()), ovr = state.over[ok];
        if (ovr) { delete ovr[t.dataset.i]; if (!Object.keys(ovr).length) delete state.over[ok]; }
        save(); render(); break;
      }
      case 'iv-open': go('okt'); break;
      case 'go-okt': go('okt'); break;
      case 'home-fill': {
        var sug = [0, 4, null, 1, 2, 3, 5];
        curPlan().week = sug.map(function (i) { return i === null ? [] : [homeProgram(i).id]; });
        save(); render(); break;
      }
      case 'show-ex': {
        var exName = sess.rows[+t.dataset.r].name;
        shownEx[exName] = !shownEx[exName];
        render(); break;
      }
      case 'hf': homeFilter = t.dataset.k; render(); break;
      case 'home-add': homeProgram(+t.dataset.i); render(); break;
      case 'home-start':
        if (sess || iv) { go('okt'); break; }
        startSession(homeProgram(+t.dataset.i).id); break;
      case 'add-prog':
        state.programs.push({ id: uid(), name: 'Nytt program', kind: 'styrke', exercises: [{ id: uid(), name: 'Ny øvelse', sets: 3, reps: 10, kg: 0 }] });
        save(); render(); break;
      case 'add-ex':
        p = P(t.dataset.p); if (p) { p.exercises.push({ id: uid(), name: 'Ny øvelse', sets: 3, reps: 10, kg: 0 }); save(); render(); }
        break;
      case 'del-ex':
        p = P(t.dataset.p); if (p) { p.exercises = p.exercises.filter(function (x) { return x.id !== t.dataset.e; }); save(); render(); }
        break;
      case 'del-prog': {
        var key = 'p' + t.dataset.p;
        if (armed !== key) { armed = key; render(); break; }
        armed = '';
        state.programs = state.programs.filter(function (x) { return x.id !== t.dataset.p; });
        var drop = function (l) { return l.filter(function (x) { return x !== t.dataset.p; }); };
        state.planList.forEach(function (pl) { pl.week = pl.week.map(drop); });
        Object.keys(state.over).forEach(function (k) { var o = state.over[k]; Object.keys(o).forEach(function (d) { o[d] = drop(o[d]); }); });
        save(); render(); break;
      }
      case 'del-log': {
        var k2 = 'l' + t.dataset.id;
        if (armed !== k2) { armed = k2; render(); break; }
        armed = '';
        state.log = state.log.filter(function (x) { return x.id !== t.dataset.id; });
        save(); render(); break;
      }
      default:
        if (EXT.actions[a]) EXT.actions[a](t, e);
    }
  });

  function onField(e) {
    var t = e.target, f = t.dataset && t.dataset.f;
    if (!f) return;
    if (t.tagName === 'SELECT' && e.type === 'input') return;
    if (t.tagName !== 'SELECT' && e.type === 'change') return;
    var p = t.dataset.p ? P(t.dataset.p) : null, ex;
    if (p && t.dataset.e) ex = p.exercises.filter(function (x) { return x.id === t.dataset.e; })[0];
    switch (f) {
      case 'day-add': if (t.value) { editList(+t.dataset.i).push(t.value); save(); render(); } break;
      case 'plan-name': {
        curPlan().name = t.value.slice(0, 40); save();
        var chip = document.querySelector('[data-act="plan-sw"][aria-pressed="true"]');
        if (chip) chip.textContent = curPlan().name || 'Uten navn';
        break;
      }
      case 'pname': if (p) { p.name = t.value; save(); } break;
      case 'pkind': if (p) { p.kind = t.value; save(); render(); } break;
      case 'en': if (ex) { ex.name = t.value; save(); } break;
      case 'es': if (ex) { ex.sets = num(t.value); save(); } break;
      case 'er': if (ex) { ex.reps = num(t.value); save(); } break;
      case 'ek': if (ex) { ex.kg = num(t.value); save(); } break;
      case 'ivw': case 'ivr': case 'ivn': {
        if (t.value === '') break;
        if (f === 'ivw') state.iv.work = clampInt(t.value, 5, 600);
        if (f === 'ivr') state.iv.rest = clampInt(t.value, 0, 600);
        if (f === 'ivn') state.iv.rounds = clampInt(t.value, 1, 50);
        save();
        var tot = $('#iv-total'); if (tot) tot.textContent = 'Totalt ' + clock(ivTotal());
        document.querySelectorAll('[data-act="iv-pre"]').forEach(function (b) {
          b.setAttribute('aria-pressed', String(+b.dataset.w === state.iv.work && +b.dataset.r === state.iv.rest && +b.dataset.n === state.iv.rounds));
        });
        break;
      }
      case 'snote': if (sess) { sess.note = t.value.slice(0, 500); saveDraft(); } break;
      case 'exsel': exSel = t.value; render(); break;
      case 'sk': sess.rows[+t.dataset.r].sets[+t.dataset.s].kg = num(t.value); saveDraft(); break;
      case 'sr': sess.rows[+t.dataset.r].sets[+t.dataset.s].reps = num(t.value); saveDraft(); break;
      default:
        if (EXT.fields[f]) EXT.fields[f](t, e);
    }
  }
  document.addEventListener('input', onField);
  document.addEventListener('change', onField);

  /* ---------- innlogging (Firebase) ---------- */
  // Innloggingen slås på når firebase-config.js inneholder en konfigurasjon.
  var authMode = !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey);
  var FB_URL = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var auth = null, fsdb = null, signUp = false;
  var AUTH_ERR = {
    'auth/invalid-email': 'Ugyldig e-postadresse.',
    'auth/missing-password': 'Skriv inn passordet.',
    'auth/weak-password': 'Passordet må ha minst 6 tegn.',
    'auth/email-already-in-use': 'Det finnes allerede en konto med denne e-posten. Logg inn i stedet.',
    'auth/invalid-credential': 'Feil e-post eller passord.',
    'auth/wrong-password': 'Feil e-post eller passord.',
    'auth/user-not-found': 'Feil e-post eller passord.',
    'auth/too-many-requests': 'For mange forsøk. Vent litt og prøv igjen.',
    'auth/network-request-failed': 'Ingen nettverk. Sjekk tilkoblingen og prøv igjen.',
    'auth/operation-not-allowed': 'E-postinnlogging er ikke slått på i Firebase ennå.',
    other: 'Noe gikk galt. Prøv igjen.'
  };
  function byId(i) { return document.getElementById(i); }
  function authMsg(m, ok) { var el = byId('auth-msg'); el.textContent = m || ''; el.className = 'msg' + (ok ? ' ok' : ''); }
  function showAuth() { document.querySelector('.wrap').hidden = true; byId('auth').hidden = false; }
  function showApp() { byId('auth').hidden = true; document.querySelector('.wrap').hidden = false; }
  function loadScript(src, ok, fail) {
    var s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = fail;
    document.head.appendChild(s);
  }
  function startAuth() {
    showAuth();
    var files = ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js'];
    (function next(i) {
      if (i === files.length) { initAuth(); return; }
      loadScript(FB_URL + files[i], function () { next(i + 1); }, function () {
        byId('auth-load').textContent = 'Kunne ikke laste innloggingen. Sjekk nettverket og last siden på nytt.';
      });
    })(0);
  }
  function initAuth() {
    firebase.initializeApp(window.FIREBASE_CONFIG);
    auth = firebase.auth();
    fsdb = firebase.firestore();

    byId('auth-form').addEventListener('submit', function (e) {
      e.preventDefault();
      authMsg('');
      var em = byId('auth-email').value.trim(), pw = byId('auth-pass').value;
      if (!em || !pw) { authMsg('Fyll inn e-post og passord.'); return; }
      var btn = byId('auth-submit');
      btn.disabled = true;
      var p = signUp ? auth.createUserWithEmailAndPassword(em, pw) : auth.signInWithEmailAndPassword(em, pw);
      p.then(function () { byId('auth-pass').value = ''; }, function (err) {
        authMsg(AUTH_ERR[err && err.code] || AUTH_ERR.other);
      }).then(function () { btn.disabled = false; });
    });
    byId('auth-retry').addEventListener('click', function () { location.reload(); });
    byId('auth-toggle').addEventListener('click', function () {
      signUp = !signUp;
      byId('auth-title').textContent = signUp ? 'Opprett konto' : 'Logg inn';
      byId('auth-submit').textContent = signUp ? 'Opprett konto' : 'Logg inn';
      byId('auth-toggle').textContent = signUp ? 'Har du konto? Logg inn' : 'Ny her? Opprett konto';
      byId('auth-pass').setAttribute('autocomplete', signUp ? 'new-password' : 'current-password');
      authMsg('');
    });
    byId('auth-reset').addEventListener('click', function () {
      var em = byId('auth-email').value.trim();
      if (!em) { authMsg('Skriv inn e-postadressen din først.'); return; }
      auth.sendPasswordResetEmail(em).then(function () {
        authMsg('Hvis adressen har en konto, er det sendt en lenke for å lage nytt passord.', true);
      }, function (err) { authMsg(AUTH_ERR[err && err.code] || AUTH_ERR.other); });
    });
    byId('logout').addEventListener('click', function () {
      try { localStorage.removeItem('tb_state'); localStorage.removeItem('tb_sess'); localStorage.removeItem('tb_owner'); } catch (e) { }
      sess = null; ref = null; clearTimeout(saveT); stopRest();
      state = normalize(defaults());   // ingen data skal følge med til neste bruker
      auth.signOut();
    });
    auth.onAuthStateChanged(function (u) { if (u) signedIn(u); else signedOut(); });
  }
  function signedOut() {
    ref = null;
    byId('logout').hidden = true;
    byId('auth-load').hidden = true;
    byId('auth-card').hidden = false;
    showAuth();
  }
  function signedIn(u) {
    byId('auth-card').hidden = true;
    byId('auth-load').hidden = false;
    byId('auth-load').textContent = 'Laster dataene dine …';
    var docRef = fsdb.doc('users/' + u.uid);
    docRef.get().then(function (snap) {
      var owner = null;
      try { owner = localStorage.getItem('tb_owner'); } catch (e) { }
      var foreign = !!owner && owner !== u.uid;       // lokale data tilhører en annen konto
      if (foreign) { sess = null; saveDraft(); }
      if (snap.exists) state = normalize(JSON.parse(JSON.stringify(snap.data())));
      else if (foreign) state = normalize(defaults());
      // ellers: ny konto uten skydata, så dataene fra denne enheten tas med
      ref = docRef;
      try { localStorage.setItem('tb_owner', u.uid); localStorage.setItem('tb_state', JSON.stringify(state)); } catch (e) { }
      var out = byId('logout');
      out.hidden = false; out.title = u.email || '';
      showApp();
      route();
      if (snap.exists) setSync('saved'); else save();
    }, function (err) {
      var code = (err && err.code) || 'ukjent';
      var why = 'Kunne ikke hente dataene dine.';
      if (code === 'permission-denied') why = 'Ingen tilgang til databasen. Sjekk at Firestore-reglene er publisert.';
      else if (code === 'unavailable' || code === 'failed-precondition' || code === 'not-found') why = 'Fant ikke databasen, eller du er frakoblet. Sjekk at Firestore Database er opprettet i Firebase-prosjektet.';
      byId('auth-load').textContent = why + ' (' + code + ')';
      byId('auth-retry').hidden = false;
    });
  }

  /* ---------- utvidelser ---------- */
  // Andre filer legger til sider med window.TBX.push(function (TB) { … }). De kjøres her, før første visning.
  var TB = {
    state: function () { return state; }, sess: function () { return sess; },
    save: save, render: render, go: go, view: function () { return view; },
    armed: function () { return armed; }, setArmed: function (v) { armed = v; },
    esc: esc, iso: iso, parseIso: parseIso, addDays: addDays, startOfWeek: startOfWeek, isoWeek: isoWeek, dateLabel: dateLabel,
    fmtNum: fmtNum, nf: nf, num: num, uid: uid, pad: pad, clock: clock, fmtTime: fmtTime, hm: hm,
    beep: beep, buzz: buzz, ensureAudio: ensureAudio, DAYS: DAYS, DAYS_LONG: DAYS_LONG, MONTHS: MONTHS, RATE: RATE,
    e1rm: e1rm, exKey: exKey, exHistory: exHistory, streakWeeks: streakWeeks, weekStats: weekStats, groupOf: groupOf, lineChart: lineChart, volText: volText,
    defaults: defaults,
    replaceState: function (obj) { state = normalize(obj); save(); },
    page: function (name, fn, navTab) { EXT.views[name] = fn; if (VIEWS.indexOf(name) < 0) VIEWS.push(name); EXT.nav[name] = navTab || name; },
    action: function (name, fn, keepArmed) { EXT.actions[name] = fn; if (keepArmed) EXT.keep[name] = true; },
    field: function (name, fn) { EXT.fields[name] = fn; }
  };
  (window.TBX || []).forEach(function (f) { try { f(TB); } catch (e) { if (window.console) console.error(e); } });
  window.TBX = { push: function (f) { f(TB); } };

  /* ---------- boot ---------- */
  var themeSel = document.querySelector('#theme');
  themeSel.value = savedTheme;
  themeSel.addEventListener('change', function () { setTheme(themeSel.value); });

  route();
  setSync('loading');
  if (authMode) startAuth();
  else (function connect() {
    if (!window.claude || !window.claude.use) { setSync('local'); return; }
    Promise.all([window.claude.use('db'), window.claude.use('user')]).then(function (r) {
      var dbm = r[0], user = r[1];
      return (user ? user.id() : Promise.resolve(null)).then(function (id) {
        if (!dbm || !id) { setSync('local'); return; }
        var docRef = dbm.doc('data/users/' + id + '/profile');
        return docRef.get().then(function (snap) {
          ref = docRef;
          if (snap.exists && !touched) {
            state = normalize(JSON.parse(JSON.stringify(snap.data())));
            try { localStorage.setItem('tb_state', JSON.stringify(state)); } catch (e) { }
            render();
            setSync('saved');
          } else if (touched) {
            flush();
          } else {
            setSync('saved');
          }
        });
      });
    }).catch(function () { ref = null; setSync('local'); });
  })();
})();
