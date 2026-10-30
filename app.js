(function () {
  'use strict';
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
    return { programs: [p1, p2, p3, p4], week: [p1.id, null, p2.id, null, p3.id, p4.id, null], goal: 4, last: {}, rest: 90, log: [], hint: true };
  }
  function normalize(s) {
    s.programs = Array.isArray(s.programs) ? s.programs : [];
    s.week = (Array.isArray(s.week) && s.week.length === 7) ? s.week : [null, null, null, null, null, null, null];
    s.log = Array.isArray(s.log) ? s.log : [];
    s.goal = s.goal > 0 ? s.goal : 3;
    s.last = s.last || {};
    s.rest = s.rest || 90;
    return s;
  }

  var state = null;
  try { var raw = localStorage.getItem('tb_state'); if (raw) state = JSON.parse(raw); } catch (e) { }
  state = normalize(state || defaults());
  var sess = null;
  try { var rs = localStorage.getItem('tb_sess'); if (rs) sess = JSON.parse(rs); } catch (e) { }

  var view = 'uke', weekOffset = 0, armed = '';
  var touched = false, ref = null;
  var P = function (id) { return state.programs.filter(function (p) { return p.id === id; })[0]; };
  var todayIdx = function () { return (new Date().getDay() + 6) % 7; };

  /* ---------- persistence ---------- */
  var syncLabels = { loading: 'Henter …', saving: 'Lagrer …', saved: 'Lagret', local: 'Lagret på denne enheten', error: 'Kunne ikke lagre' };
  function setSync(k) { var el = $('#sync'); if (el) el.textContent = syncLabels[k]; }
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

  function viewUke() {
    var mon = addDays(startOfWeek(new Date()), weekOffset * 7);
    var days = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return addDays(mon, i); });
    var isos = days.map(iso);
    var doneN = state.log.filter(function (l) { return isos.indexOf(l.d) > -1; }).length;
    var todayIso = iso(new Date());
    var segs = '';
    var cap = Math.min(state.goal, 14);
    for (var i = 0; i < cap; i++) segs += '<span class="seg' + (i < doneN ? ' on' : '') + '"></span>';
    var h = '<div class="sec-head"><div><h2>Uke ' + isoWeek(mon) + '</h2><p class="sub">' + dateLabel(days[0]) + ' – ' + dateLabel(days[6]) + ' · planen gjentas hver uke</p></div>' +
      '<div class="weeknav"><button class="btn btn-sm" data-act="wk-prev" aria-label="Forrige uke">←</button>' +
      '<button class="btn btn-sm" data-act="wk-now"' + (weekOffset === 0 ? ' disabled' : '') + '>Denne uka</button>' +
      '<button class="btn btn-sm" data-act="wk-next" aria-label="Neste uke">→</button></div></div>';
    h += hintBox();
    h += '<div class="panel goalbar"><div class="txt tnum">' + doneN + ' av ' + state.goal + ' økter</div><div class="meter" aria-hidden="true">' + segs + '</div>' +
      '<div class="stepper">Ukemål <button class="btn btn-sm" data-act="goal-dec" aria-label="Senk ukemål">−</button><b class="tnum">' + state.goal + '</b><button class="btn btn-sm" data-act="goal-inc" aria-label="Øk ukemål">+</button></div></div>';
    h += '<div class="week">';
    days.forEach(function (d, i) {
      var pid = state.week[i], prog = pid ? P(pid) : null;
      var isToday = isos[i] === todayIso;
      var done = state.log.filter(function (l) { return l.d === isos[i]; });
      var body = '';
      if (prog) body += '<div class="pn">' + esc(prog.name) + '</div>' + kindTag(prog.kind) + '<div class="sub">' + prog.exercises.length + ' øvelser</div>';
      else body += '<div class="rest-day">Hviledag</div>';
      done.forEach(function (l) { body += '<span class="done-tag">✓ ' + esc(l.name) + ' · ' + l.min + ' min</span>'; });
      var opts = '<option value="">Hvile</option>' + state.programs.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === pid ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
      var foot = '<select class="inp" data-f="plan" data-i="' + i + '" aria-label="Program for ' + DAYS_LONG[i] + '">' + opts + '</select>';
      if (isToday && prog && !sess) foot += '<button class="btn btn-primary" data-act="start" data-p="' + esc(prog.id) + '">Start</button>';
      h += '<article class="day' + (isToday ? ' is-today' : '') + '"><div class="day-head"><span class="dow">' + DAYS[i] + '</span><span class="dnum tnum">' + d.getDate() + '</span>' + (isToday ? '<span class="today-tag">I dag</span>' : '') + '</div>' +
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

  function viewOkt() {
    if (!sess) {
      var plannedId = state.week[todayIdx()];
      var h = '<div class="sec-head"><div><h2>Start en økt</h2><p class="sub">Velg et program. Vekter og reps fylles inn fra forrige gang.</p></div></div>';
      if (!state.programs.length) return h + '<p class="empty">Du har ingen programmer ennå. Lag ett under Programmer.</p>';
      h += '<div class="sess-list">';
      state.programs.forEach(function (p) {
        h += '<article class="panel pick"><div><div class="pn">' + esc(p.name) + (p.id === plannedId ? '<span class="badge">Planlagt i dag</span>' : '') + '</div>' + kindTag(p.kind) + ' <span class="sub">· ' + p.exercises.length + ' øvelser</span></div>' +
          '<button class="btn btn-primary" data-act="start" data-p="' + esc(p.id) + '">Start økt</button></article>';
      });
      return h + '</div>';
    }
    var K = KINDS[sess.kind] || KINDS.styrke, kg = sess.kind === 'styrke', nk = kg ? '' : ' nokg';
    var out = '<div class="sess-head"><div><h2 style="font-family:var(--font-display);font-size:34px;text-transform:uppercase;line-height:1.05">' + esc(sess.name) + '</h2><p class="sub" id="sess-prog">' + sessProgress() + '</p></div><div class="timer tnum" id="elapsed" aria-label="Tid brukt">' + fmtTime((Date.now() - sess.start) / 1000) + '</div></div>';
    sess.rows.forEach(function (r, ri) {
      out += '<article class="panel ex"><div class="ex-top"><h3>' + esc(r.name) + '</h3><span class="plan">Plan: ' + esc(r.plan) + '</span></div>';
      out += '<div class="fieldlab' + nk + '"><span>Sett</span>' + (kg ? '<span>Kg</span>' : '') + '<span>' + K.unit + '</span><span></span></div>';
      r.sets.forEach(function (s, si) {
        out += '<div class="setrow' + nk + '"><span class="n">' + (si + 1) + '</span>' +
          (kg ? '<input class="inp" type="number" inputmode="decimal" step="0.5" min="0" data-f="sk" data-r="' + ri + '" data-s="' + si + '" value="' + esc(s.kg) + '" aria-label="Kilo, sett ' + (si + 1) + '">' : '') +
          '<input class="inp" type="number" inputmode="decimal" min="0" data-f="sr" data-r="' + ri + '" data-s="' + si + '" value="' + esc(s.reps) + '" aria-label="' + K.unit + ', sett ' + (si + 1) + '">' +
          '<button class="check' + (s.done ? ' done' : '') + '" data-act="setdone" data-r="' + ri + '" data-s="' + si + '" aria-pressed="' + (s.done ? 'true' : 'false') + '" aria-label="Sett ' + (si + 1) + ' fullført">' + CHECK + '</button></div>';
      });
      out += '<div><button class="btn btn-sm btn-ghost" data-act="addset" data-r="' + ri + '">+ Legg til sett</button></div></article>';
    });
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
    var max = Math.max(state.goal, 1);
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
    s += '<line class="goal" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(state.goal) + '" y2="' + y(state.goal) + '"/><text class="goaltxt" x="' + (W - R + 6) + '" y="' + (y(state.goal) + 4) + '">Mål ' + state.goal + '</text><'+'/svg>';
    return s;
  }

  function streakWeeks() {
    var counts = {};
    state.log.forEach(function (l) { var k = iso(startOfWeek(parseIso(l.d))); counts[k] = (counts[k] || 0) + 1; });
    var mon = startOfWeek(new Date()), st = 0;
    for (var i = 0; i < 200; i++) {
      var c = counts[iso(addDays(mon, -7 * i))] || 0;
      if (i === 0 && c < state.goal) continue;
      if (c >= state.goal) st++; else break;
    }
    return st;
  }

  function viewFrem() {
    var since = iso(addDays(new Date(), -29));
    var recent = state.log.filter(function (l) { return l.d >= since; });
    var vol = recent.reduce(function (a, l) { return a + (l.vol || 0); }, 0);
    var volTxt = vol >= 1000 ? '<span class="big tnum">' + (vol / 1000).toLocaleString('nb-NO', { maximumFractionDigits: 1 }) + '<small>tonn</small></span>' : '<span class="big tnum">' + nf(vol) + '<small>kg</small></span>';
    var h = '<div class="sec-head"><div><h2>Fremgang</h2><p class="sub">Siste 30 dager og siste åtte uker.</p></div></div>';
    h += '<div class="tiles"><div class="panel tile"><span class="big tnum">' + recent.length + '</span><div class="lab">Økter siste 30 dager</div></div>' +
      '<div class="panel tile">' + volTxt + '<div class="lab">Løftet volum (styrkeøkter)</div></div>' +
      '<div class="panel tile"><span class="big tnum">' + streakWeeks() + '<small>uker</small></span><div class="lab">På rad med ukemålet nådd</div></div></div>';
    h += '<div class="panel"><h3 style="font-size:17px;margin-bottom:8px">Økter per uke</h3><div class="chart-wrap">' + chartSvg() + '</div></div>';
    h += '<div class="panel"><h3 style="font-size:17px;margin-bottom:4px">Historikk</h3>';
    if (!state.log.length) h += '<p class="empty">Ingen økter logget ennå. Fullfør en økt, så dukker den opp her.</p>';
    else {
      h += '<div class="hist">';
      state.log.slice(0, 20).forEach(function (l) {
        var d = parseIso(l.d), key = 'l' + l.id;
        var meta = l.min + ' min · ' + l.n + ' sett' + (l.vol > 0 ? ' · ' + nf(l.vol) + ' kg' : '');
        h += '<div class="hrow"><span class="d">' + DAYS[(d.getDay() + 6) % 7] + ' ' + dateLabel(d) + '</span><div><div class="pn">' + esc(l.name) + '</div><div class="meta">' + meta + '</div></div>' +
          '<button class="btn btn-sm btn-ghost btn-danger" data-act="del-log" data-id="' + esc(l.id) + '" aria-label="Slett økt">' + (armed === key ? 'Slett?' : 'Slett') + '</button></div>';
      });
      h += '</div>';
      if (state.log.length > 20) h += '<p class="sub" style="margin-top:8px">Viser de 20 siste av ' + state.log.length + ' økter.</p>';
    }
    return h + '</div>';
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
    h += '</div><h3 class="subhead">Øvelsesbibliotek</h3><div class="chips" role="group" aria-label="Filtrer øvelser">';
    ['Alle'].concat(HOME_GROUPS).forEach(function (g) {
      h += '<button class="chip" data-act="hf" data-k="' + esc(g) + '" aria-pressed="' + (g === homeFilter) + '">' + g + '</button>';
    });
    h += '</div><div class="libgrid">';
    HOME_LIB.filter(function (x) { return homeFilter === 'Alle' || x[1] === homeFilter; }).forEach(function (x) {
      var pips = '';
      for (var i = 1; i <= 3; i++) pips += '<i' + (i <= x[2] ? ' class="on"' : '') + '></i>';
      h += '<article class="panel libcard"><div class="lib-top"><h4>' + esc(x[0]) + '</h4><span class="lvl" title="Nivå: ' + LEVELS[x[2]] + '">' + pips + '</span></div>' +
        '<div class="sub">' + esc(x[1]) + ' · ' + LEVELS[x[2]] + '</div><p>' + esc(x[3]) + '</p></article>';
    });
    return h + '</div>';
  }

  /* ---------- render + routing ---------- */
  function render() {
    var fn = { uke: viewUke, okt: viewOkt, programmer: viewProg, hjemme: viewHjemme, fremgang: viewFrem }[view];
    $('#app').innerHTML = fn();
    document.querySelectorAll('.nav a').forEach(function (a) {
      if (a.dataset.v === view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var showRest = view === 'okt' && !!sess;
    $('#restbar').hidden = !showRest;
    document.body.classList.toggle('has-rest', showRest);
    drawRest();
  }
  function route() {
    var h = location.hash.slice(1);
    view = VIEWS.indexOf(h) > -1 ? h : 'uke';
    armed = '';
    render();
  }
  function go(v) { if (location.hash.slice(1) === v) route(); else location.hash = v; }
  window.addEventListener('hashchange', route);

  /* ---------- rest timer ---------- */
  var restEnd = 0, restTimer = null, audio = null;
  function beep() {
    try {
      if (!audio) return;
      var o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.15;
      o.connect(g); g.connect(audio.destination);
      o.start(); o.stop(audio.currentTime + 0.35);
    } catch (e) { }
  }
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
    try { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { }
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
        return { name: e.name, plan: n + ' × ' + e.reps + (kg ? ' × ' + e.kg + ' kg' : ' ' + K.unit.toLowerCase()), sets: sets };
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
    state.log.unshift({ id: uid(), d: iso(new Date()), pid: sess.pid, name: sess.name, kind: sess.kind, min: mins, vol: Math.round(vol), n: done });
    state.log = state.log.slice(0, 400);
    sess = null; saveDraft(); stopRest(); save();
    go('fremgang');
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]');
    if (!t) return;
    var a = t.dataset.act, p, ex;
    var keep = (a === 'del-prog' || a === 'del-log' || a === 'cancel');
    if (!keep && armed) armed = '';
    switch (a) {
      case 'wk-prev': weekOffset--; render(); break;
      case 'wk-next': weekOffset++; render(); break;
      case 'wk-now': weekOffset = 0; render(); break;
      case 'goal-dec': if (state.goal > 1) { state.goal--; save(); render(); } break;
      case 'goal-inc': if (state.goal < 14) { state.goal++; save(); render(); } break;
      case 'hint-x': state.hint = false; save(); render(); break;
      case 'start':
        if (sess && sess.pid !== t.dataset.p) { go('okt'); break; }
        startSession(t.dataset.p); break;
      case 'setdone': {
        var r = +t.dataset.r, s = +t.dataset.s, set = sess.rows[r].sets[s];
        set.done = !set.done; saveDraft();
        t.classList.toggle('done', set.done); t.setAttribute('aria-pressed', String(set.done));
        $('#sess-prog').textContent = sessProgress();
        var msg = $('#sess-msg'); if (msg) msg.textContent = '';
        if (set.done && sess.kind === 'styrke') startRest(state.rest);
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
        armed = ''; sess = null; saveDraft(); stopRest(); render(); break;
      case 'rest': startRest(Number(t.dataset.s)); break;
      case 'rest-stop': stopRest(); break;
      case 'hf': homeFilter = t.dataset.k; render(); break;
      case 'home-add': homeProgram(+t.dataset.i); render(); break;
      case 'home-start':
        if (sess) { go('okt'); break; }
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
        state.week = state.week.map(function (x) { return x === t.dataset.p ? null : x; });
        save(); render(); break;
      }
      case 'del-log': {
        var k2 = 'l' + t.dataset.id;
        if (armed !== k2) { armed = k2; render(); break; }
        armed = '';
        state.log = state.log.filter(function (x) { return x.id !== t.dataset.id; });
        save(); render(); break;
      }
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
      case 'plan': state.week[+t.dataset.i] = t.value || null; save(); render(); break;
      case 'pname': if (p) { p.name = t.value; save(); } break;
      case 'pkind': if (p) { p.kind = t.value; save(); render(); } break;
      case 'en': if (ex) { ex.name = t.value; save(); } break;
      case 'es': if (ex) { ex.sets = num(t.value); save(); } break;
      case 'er': if (ex) { ex.reps = num(t.value); save(); } break;
      case 'ek': if (ex) { ex.kg = num(t.value); save(); } break;
      case 'sk': sess.rows[+t.dataset.r].sets[+t.dataset.s].kg = num(t.value); saveDraft(); break;
      case 'sr': sess.rows[+t.dataset.r].sets[+t.dataset.s].reps = num(t.value); saveDraft(); break;
    }
  }
  document.addEventListener('input', onField);
  document.addEventListener('change', onField);

  /* ---------- boot ---------- */
  route();
  setSync('loading');
  (function connect() {
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
