/* Mer-fanen: kropp, verktøy, merker, innstillinger og data.
 * Sidene registreres i app.js gjennom window.TBX (se «utvidelser» i app.js). */
(window.TBX = window.TBX || []).push(function (TB) {
  'use strict';
  var esc = TB.esc, fmtNum = TB.fmtNum;
  var kg2 = function (v) { return (Math.round(v * 100) / 100).toLocaleString('nb-NO'); };   // 1,25 kg skal ikke rundes til 1,3
  var I = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; };
  var ICON = {
    kropp: I('<path d="M5 20h14l-1.5-11h-11z"/><path d="M9 9a3 3 0 0 1 6 0"/><path d="M12 13v3"/>'),
    verktoy: I('<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>'),
    merker: I('<circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-3 5 3-1.5-8"/>'),
    innst: I('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 6l2.6 1.5M17.2 16.5l2.6 1.5M4.2 18l2.6-1.5M17.2 7.5 19.8 6"/>'),
    data: I('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>'),
    info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
    chev: I('<path d="m9 6 6 6-6 6"/>')
  };
  function back() { return '<a class="backlink" href="#mer">' + I('<path d="m15 6-6 6 6 6"/>') + '<span>Mer</span></a>'; }
  function head(title, sub) { return back() + '<div class="sec-head"><div><h2>' + title + '</h2>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div></div>'; }

  /* ---------- Mer: oversikt ---------- */
  TB.page('mer', function () {
    var st = TB.state();
    var rows = [
      ['kropp', 'Kropp', st.body.length ? 'Siste måling: ' + fmtNum(st.body[0].kg) + ' kg' : 'Følg vekt og midjemål over tid'],
      ['verktoy', 'Verktøy', 'Skivekalkulator, maks-kalkulator og stoppeklokke'],
      ['merker', 'Merker', badgeCount(st) + ' av ' + BADGES.length + ' merker tatt'],
      ['innstillinger', 'Innstillinger', 'Lyd, vibrasjon, hviletid, stang og skiver'],
      ['data', 'Data og sikkerhetskopi', 'Last ned, gjenopprett eller slett dataene dine']
    ];
    var h = '<div class="sec-head"><div><h2>Mer</h2><p class="sub">Verktøy, merker og innstillinger.</p></div></div>';
    h += installCard();
    h += '<nav class="panel mlist" aria-label="Mer">' + rows.map(function (r) {
      return '<a class="mrow" href="#' + r[0] + '"><span class="mic">' + ICON[r[0] === 'innstillinger' ? 'innst' : r[0]] + '</span><span class="mtx"><b>' + r[1] + '</b><span class="sub">' + esc(r[2]) + '</span></span>' + ICON.chev + '</a>';
    }).join('') + '</nav>';
    h += '<p class="sub about">Treningsbok · dataene lagres ' + (document.getElementById('logout') && !document.getElementById('logout').hidden ? 'på kontoen din' : 'i denne nettleseren') + '. Se hva som er nytt i <a href="https://github.com/markus-1-ima/Treningsapp/blob/main/CHANGELOG.md" target="_blank" rel="noopener">utviklingsloggen</a>.</p>';
    return h;
  });

  /* ---------- Installer appen ---------- */
  // Samsung Internet lager hjemskjerm-appen som en gammeldags Android-pakke, og Google Play Protect
  // stopper den da av og til som «usikker app». Chrome lager pakken riktig, så vi viser vei dit.
  var UA = navigator.userAgent || '';
  var android = /android/i.test(UA);
  var ios = /iphone|ipad|ipod/i.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var samsung = /SamsungBrowser/i.test(UA);
  var inApp = /FBAN|FBAV|FB_IAB|Instagram|Snapchat|musical_ly|TikTok|LinkedInApp|Line\/|; wv\)/i.test(UA);
  var iosSafari = ios && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(UA) && !inApp;
  var installEvt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; if (TB.view() === 'mer') TB.render(); });
  window.addEventListener('appinstalled', function () { installEvt = null; if (TB.view() === 'mer') TB.render(); });
  function standalone() { try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch (e) { return false; } }
  function chromeUrl() {
    var page = location.origin + location.pathname;
    return 'intent://' + location.host + location.pathname + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(page) + ';end';
  }
  var chromeBtn = function (primary) { return '<a class="btn' + (primary ? ' btn-primary' : '') + '" href="' + esc(chromeUrl()) + '">Åpne i Chrome</a>'; };
  function unsafeHelp() {
    return '<details class="ihelp"><summary>Står det at appen er utrygg?</summary>' +
      '<p>Noen Android-telefoner, særlig Samsung, kan vise «Usikker app blokkert» fra Google Play Protect når en nettapp legges på hjemskjermen. ' +
      'Det er en kjent feilalarm: Treningsbok er bare denne nettsiden lagret på hjemskjermen, og den ber ikke om tilgang til noe på telefonen.</p>' +
      ((samsung || inApp) ? '<p>Installer fra Chrome i stedet, eller bruk Treningsbok rett i nettleseren. Den virker likt.</p>'
                          : '<p>Ser du meldingen, kan du trykke «Flere detaljer» og så «Installer likevel». Eller bruk Treningsbok rett i nettleseren, den virker likt.</p>') +
      '</details>';
  }
  function installCard() {
    if (standalone()) return '';
    if (android && (samsung || inApp)) {
      return '<div class="panel install"><div><b>Installer fra Chrome</b><p class="sub">' +
        (samsung ? 'Fra Samsung Internet kan telefonen feilaktig si at appen er utrygg. Åpne Treningsbok i Chrome og installer den derfra.'
                 : 'Du har åpnet Treningsbok inne i en annen app. Åpne siden i Chrome for å installere den.') +
        '</p></div>' + chromeBtn(true) + unsafeHelp() + '</div>';
    }
    if (installEvt) return '<div class="panel install"><div><b>Installer appen</b><p class="sub">Legg Treningsbok på hjemskjermen. Den åpner som en egen app og virker uten nett.</p></div><button class="btn btn-primary" data-act="install">Installer</button>' + (android ? unsafeHelp() : '') + '</div>';
    if (ios && inApp) return '<div class="panel install"><div><b>Åpne i Safari først</b><p class="sub">Du har åpnet Treningsbok inne i en annen app. Trykk på menyen (··· eller kompasset) og velg «Åpne i Safari». Trykk så på Del-knappen og «Legg til på Hjem-skjerm».</p></div></div>';
    if (ios) return '<div class="panel install"><div><b>Legg til på hjemskjermen</b><p class="sub">Trykk på Del-knappen' + (iosSafari ? ' i Safari' : '') + ' og velg «Legg til på Hjem-skjerm». Da åpner Treningsbok som en egen app.</p></div></div>';
    if (android) return '<div class="panel install"><div><b>Installer appen</b><p class="sub">Åpne Treningsbok i Chrome og velg «Installer app» i menyen.</p></div>' + chromeBtn(false) + unsafeHelp() + '</div>';
    return '';
  }
  TB.action('install', function () {
    if (!installEvt) return;
    installEvt.prompt();
    installEvt.userChoice.then(function () { installEvt = null; TB.render(); }, function () { });
  });

  // Samsung Internet har sin egen installer-knapp i adressefeltet. Vis et lite tips øverst,
  // så folk installerer fra Chrome i stedet og slipper meldingen om utrygg app.
  var TIP_KEY = 'tb_tip_chrome';
  function tipSeen() { try { return localStorage.getItem(TIP_KEY) === '1'; } catch (e) { return false; } }
  if (android && (samsung || inApp) && !standalone() && !tipSeen()) {
    var app = document.getElementById('app');
    if (app) {
      var tip = document.createElement('div');
      tip.className = 'panel tipbar';
      tip.setAttribute('role', 'note');
      tip.innerHTML = '<p><b>Vil du installere appen?</b> Gjør det fra Chrome. ' +
        (samsung ? 'Fra Samsung Internet kan telefonen feilaktig si at appen er utrygg.' : 'Fra denne appen går det ikke å installere.') + '</p>' +
        '<div class="tipbtns">' + chromeBtn(true) + '<button class="btn btn-ghost" data-act="tip-x">Lukk</button></div>';
      app.parentNode.insertBefore(tip, app);
      // Mer-fanen har det samme rådet i installer-kortet, så tipset skjules der
      var tipShow = function () { tip.hidden = TB.view() === 'mer'; };
      window.addEventListener('hashchange', function () { setTimeout(tipShow, 0); });
      setTimeout(tipShow, 0);
    }
  }
  TB.action('tip-x', function () {
    try { localStorage.setItem(TIP_KEY, '1'); } catch (e) { }
    var t = document.querySelector('.tipbar');
    if (t) t.remove();
  });

  /* ---------- Kropp ---------- */
  TB.page('kropp', function () {
    var st = TB.state(), list = st.body;
    var h = head('Kropp', 'Kroppsvekt og midjemål over tid.');
    h += '<section class="panel bform" aria-labelledby="b-h"><h3 id="b-h">Ny måling</h3><div class="row3">' +
      '<label for="b-date">Dato<input id="b-date" class="inp" type="date" value="' + TB.iso(new Date()) + '" max="' + TB.iso(new Date()) + '"></label>' +
      '<label for="b-kg">Vekt (kg)<input id="b-kg" class="inp" type="number" inputmode="decimal" step="0.1" min="20" max="400" placeholder="' + (list[0] ? fmtNum(list[0].kg) : '75') + '"></label>' +
      '<label for="b-waist">Midje (cm)<input id="b-waist" class="inp" type="number" inputmode="decimal" step="0.5" min="30" max="250" placeholder="Valgfritt"></label></div>' +
      '<div class="sess-foot"><button class="btn btn-primary" data-act="body-add">Lagre måling</button><span class="msg" id="b-msg" role="alert"></span></div></section>';
    if (!list.length) return h + '<p class="empty">Ingen målinger ennå. Legg inn vekten din over, så tegnes en graf når du har to målinger.</p>';
    var pts = list.slice(0, 60).slice().reverse().map(function (b) { return { d: b.d, v: b.kg }; });
    var since = TB.iso(TB.addDays(new Date(), -30)), old = null;
    list.forEach(function (b) { if (b.d <= since && !old) old = b; });
    var change = old ? list[0].kg - old.kg : null;
    h += '<div class="panel"><div class="ph"><h3>Vekt</h3><span class="sub">' + fmtNum(list[0].kg) + ' kg nå' +
      (change !== null ? ' · ' + (change > 0 ? '+' : change < 0 ? '−' : '±') + fmtNum(Math.abs(change)) + ' kg siste 30 dager' : '') + '</span></div>' + TB.lineChart(pts, 'kg') + '</div>';
    var wp = list.filter(function (b) { return b.waist; }).slice(0, 60).reverse().map(function (b) { return { d: b.d, v: b.waist }; });
    if (wp.length > 1) h += '<div class="panel"><div class="ph"><h3>Midje</h3><span class="sub">' + fmtNum(wp[wp.length - 1].v) + ' cm nå</span></div>' + TB.lineChart(wp, 'cm') + '</div>';
    h += '<div class="panel"><div class="ph"><h3>Målinger</h3></div><div class="hist">' + list.slice(0, 20).map(function (b) {
      var key = 'b' + b.id;
      return '<div class="hrow"><span class="d">' + TB.dateLabel(TB.parseIso(b.d)) + '</span><div><div class="pn tnum">' + fmtNum(b.kg) + ' kg</div>' + (b.waist ? '<div class="meta">Midje ' + fmtNum(b.waist) + ' cm</div>' : '') + '</div>' +
        '<button class="btn btn-sm btn-ghost btn-danger" data-act="body-del" data-id="' + esc(b.id) + '">' + (TB.armed() === key ? 'Slett?' : 'Slett') + '</button></div>';
    }).join('') + '</div></div>';
    return h;
  }, 'mer');
  TB.action('body-add', function () {
    var d = document.getElementById('b-date').value, kg = TB.num(document.getElementById('b-kg').value), w = TB.num(document.getElementById('b-waist').value);
    var msg = document.getElementById('b-msg');
    if (!d) { msg.textContent = 'Velg en dato.'; return; }
    if (!(kg >= 20 && kg <= 400)) { msg.textContent = 'Skriv inn vekten i kilo, for eksempel 74,5.'; return; }
    var st = TB.state();
    st.body = st.body.filter(function (b) { return b.d !== d; });                 // én måling per dag: ny erstatter gammel
    st.body.push({ id: TB.uid(), d: d, kg: Math.round(kg * 10) / 10, waist: w > 0 ? Math.round(w * 2) / 2 : 0 });
    st.body.sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; });
    st.body = st.body.slice(0, 1000);
    TB.save(); TB.render();
  });
  TB.action('body-del', function (t) {
    var key = 'b' + t.dataset.id;
    if (TB.armed() !== key) { TB.setArmed(key); TB.render(); return; }
    TB.setArmed('');
    var st = TB.state();
    st.body = st.body.filter(function (b) { return b.id !== t.dataset.id; });
    TB.save(); TB.render();
  }, true);

  /* ---------- Verktøy ---------- */
  var plTarget = 100, rmKg = 80, rmReps = 5;
  var sw = { acc: 0, start: 0, run: false, laps: [] }, swT = null;
  var PLATE_CLS = { 25: 'p25', 20: 'p20', 15: 'p15', 10: 'p10', 5: 'p5', 2.5: 'p2', 1.25: 'p1' };
  function plates() {
    var st = TB.state().settings, per = (plTarget - st.bar) / 2, left = per, out = [];
    if (per < 0) return '<p class="sub">Målvekten er lettere enn stanga (' + fmtNum(st.bar) + ' kg).</p>';
    st.plates.slice().sort(function (a, b) { return b - a; }).forEach(function (p) { while (left + 1e-9 >= p) { out.push(p); left -= p; } });
    var made = st.bar + 2 * (per - left);
    var h = '<div class="barviz" aria-hidden="true"><span class="sleeve"></span>' + out.slice().reverse().map(function (p) { return '<i class="pl ' + (PLATE_CLS[p] || 'p1') + '"></i>'; }).join('') + '<span class="shaft"></span></div>';
    var groups = {}; out.forEach(function (p) { groups[p] = (groups[p] || 0) + 1; });
    var txt = Object.keys(groups).sort(function (a, b) { return b - a; }).map(function (p) { return groups[p] + ' × ' + kg2(+p) + ' kg'; }).join(' + ');
    h += '<p><b>På hver side:</b> ' + (txt || 'ingen skiver') + '</p>';
    if (left > 1e-6) h += '<p class="sub">Med skivene du har blir det ' + kg2(made) + ' kg. Det mangler ' + kg2(plTarget - made) + ' kg.</p>';
    else h += '<p class="sub">Stang ' + kg2(st.bar) + ' kg + ' + kg2(2 * per) + ' kg skiver = ' + kg2(plTarget) + ' kg.</p>';
    return h;
  }
  function rmTable() {
    if (!(rmKg > 0 && rmReps > 0)) return '<p class="sub">Skriv inn vekt og antall repetisjoner.</p>';
    if (rmReps > 15) return '<p class="sub">Beregningen er usikker over 15 repetisjoner. Prøv et tyngre sett.</p>';
    var max = TB.e1rm(rmKg, rmReps), r25 = function (v) { return Math.round(v / 2.5) * 2.5; };
    var reps = { 100: 1, 95: 2, 90: 4, 85: 6, 80: 8, 75: 10, 70: 12, 65: 15 };
    return '<p class="rmbig"><b class="tnum">' + fmtNum(Math.round(max * 2) / 2) + ' kg</b> <span class="sub">estimert maks for én repetisjon</span></p>' +
      '<div class="rmtab">' + [95, 90, 85, 80, 75, 70, 65].map(function (pc) {
        return '<div><span>' + pc + ' %</span><b class="tnum">' + fmtNum(r25(max * pc / 100)) + ' kg</b><span class="sub">ca. ' + reps[pc] + ' reps</span></div>';
      }).join('') + '</div>';
  }
  function swTime() { return sw.acc + (sw.run ? Date.now() - sw.start : 0); }
  function swFmt(ms) { var t = Math.floor(ms / 100), ds = t % 10, s = Math.floor(t / 10); return Math.floor(s / 60) + ':' + TB.pad(s % 60) + ',' + ds; }
  function swTick() { var el = document.getElementById('sw-time'); if (el) el.textContent = swFmt(swTime()); }
  TB.page('verktoy', function () {
    var st = TB.state().settings;
    var h = head('Verktøy', 'Små hjelpere til treningen.');
    h += '<section class="panel tool" aria-labelledby="pl-h"><h3 id="pl-h">Skivekalkulator</h3><p class="sub">Hvilke skiver du trenger på hver side av stanga.</p>' +
      '<div class="row2"><label for="pl-target">Vekt totalt (kg)<input id="pl-target" class="inp" type="number" inputmode="decimal" step="1.25" min="0" data-f="pl-target" value="' + plTarget + '"></label>' +
      '<div class="lbl">Stang<div class="chips" role="group" aria-label="Stangvekt">' + [20, 15, 10].map(function (b) { return '<button class="chip" data-act="set-bar" data-v="' + b + '" aria-pressed="' + (st.bar === b) + '">' + b + ' kg</button>'; }).join('') + '</div></div></div>' +
      '<div id="pl-out">' + plates() + '</div></section>';
    h += '<section class="panel tool" aria-labelledby="rm-h"><h3 id="rm-h">Maks-kalkulator</h3><p class="sub">Regner ut hva du sannsynligvis klarer én gang, og hvor tungt du bør løfte for et gitt antall repetisjoner.</p>' +
      '<div class="row2"><label for="rm-kg">Vekt (kg)<input id="rm-kg" class="inp" type="number" inputmode="decimal" step="0.5" min="0" data-f="rm-kg" value="' + rmKg + '"></label>' +
      '<label for="rm-reps">Repetisjoner<input id="rm-reps" class="inp" type="number" inputmode="numeric" min="1" max="30" data-f="rm-reps" value="' + rmReps + '"></label></div>' +
      '<div id="rm-out">' + rmTable() + '</div></section>';
    h += '<section class="panel tool" aria-labelledby="sw-h"><h3 id="sw-h">Stoppeklokke</h3>' +
      '<div class="swtime tnum" id="sw-time" role="timer">' + swFmt(swTime()) + '</div>' +
      '<div class="sess-foot"><button class="btn btn-primary" data-act="sw-go">' + (sw.run ? 'Pause' : (swTime() ? 'Fortsett' : 'Start')) + '</button>' +
      '<button class="btn" data-act="sw-lap"' + (sw.run ? '' : ' disabled') + '>Runde</button><button class="btn btn-ghost" data-act="sw-reset"' + (swTime() ? '' : ' disabled') + '>Nullstill</button></div>' +
      (sw.laps.length ? '<ol class="laps">' + sw.laps.map(function (l, i) { return '<li><span>Runde ' + (i + 1) + '</span><span class="tnum">' + swFmt(l.split) + '</span><span class="tnum sub">' + swFmt(l.total) + '</span></li>'; }).reverse().join('') + '</ol>' : '') + '</section>';
    return h;
  }, 'mer');
  TB.field('pl-target', function (t) { plTarget = TB.num(t.value); var o = document.getElementById('pl-out'); if (o) o.innerHTML = plates(); });
  TB.field('rm-kg', function (t) { rmKg = TB.num(t.value); var o = document.getElementById('rm-out'); if (o) o.innerHTML = rmTable(); });
  TB.field('rm-reps', function (t) { rmReps = Math.round(TB.num(t.value)); var o = document.getElementById('rm-out'); if (o) o.innerHTML = rmTable(); });
  TB.action('sw-go', function () {
    if (sw.run) { sw.acc += Date.now() - sw.start; sw.run = false; clearInterval(swT); swT = null; }
    else { sw.start = Date.now(); sw.run = true; clearInterval(swT); swT = setInterval(swTick, 100); }
    TB.render();
  });
  TB.action('sw-lap', function () {
    if (!sw.run) return;
    var total = swTime(), prev = sw.laps.length ? sw.laps[sw.laps.length - 1].total : 0;
    sw.laps.push({ total: total, split: total - prev });
    TB.render();
  });
  TB.action('sw-reset', function () { clearInterval(swT); swT = null; sw = { acc: 0, start: 0, run: false, laps: [] }; TB.render(); });

  /* ---------- Merker ---------- */
  function totals(st) {
    var t = { n: st.log.length, vol: 0, min: 0, prs: 0, maxVol: 0, iv: 0, home: 0, groups: {} }, since = TB.iso(TB.addDays(new Date(), -29));
    st.log.forEach(function (l) {
      t.vol += l.vol || 0; t.min += l.min || 0; t.prs += l.prs || 0;
      if ((l.vol || 0) > t.maxVol) t.maxVol = l.vol;
      if (l.pid === 'iv') t.iv++;
      if (/hjemme$/i.test(l.name || '')) t.home++;
      if (l.d >= since) (l.ex || []).forEach(function (e) { t.groups[TB.groupOf(e.n, l.kind)] = 1; });
    });
    t.prs = Math.max(t.prs, Object.keys(st.pr).length ? 1 : 0);
    t.streak = TB.streakWeeks();
    t.groupN = ['Bryst', 'Rygg', 'Ben', 'Skuldre', 'Armer', 'Core'].filter(function (g) { return t.groups[g]; }).length;
    t.body = st.body.length;
    return t;
  }
  // [navn, beskrivelse, verdi, mål]
  var BADGES = [
    ['Første økt', 'Fullfør din første økt.', function (t) { return t.n; }, 1],
    ['I gang', 'Fullfør 10 økter.', function (t) { return t.n; }, 10],
    ['Vane', 'Fullfør 25 økter.', function (t) { return t.n; }, 25],
    ['Halvt hundre', 'Fullfør 50 økter.', function (t) { return t.n; }, 50],
    ['Hundre', 'Fullfør 100 økter.', function (t) { return t.n; }, 100],
    ['Stødig', 'Nå ukemålet tre uker på rad.', function (t) { return t.streak; }, 3],
    ['Jernvilje', 'Nå ukemålet åtte uker på rad.', function (t) { return t.streak; }, 8],
    ['Ny rekord', 'Sett din første personlige rekord.', function (t) { return t.prs; }, 1],
    ['Rekordjeger', 'Sett 10 personlige rekorder.', function (t) { return t.prs; }, 10],
    ['Ett tonn', 'Løft til sammen ett tonn i én økt.', function (t) { return t.maxVol; }, 1000],
    ['Ti tonn', 'Løft ti tonn til sammen.', function (t) { return t.vol; }, 10000],
    ['Hundre tonn', 'Løft hundre tonn til sammen.', function (t) { return t.vol; }, 100000],
    ['Ti timer', 'Tren ti timer til sammen.', function (t) { return t.min; }, 600],
    ['Femti timer', 'Tren femti timer til sammen.', function (t) { return t.min; }, 3000],
    ['Pulsjeger', 'Fullfør 10 intervalløkter.', function (t) { return t.iv; }, 10],
    ['Hjemmehelt', 'Fullfør 5 hjemmeøkter.', function (t) { return t.home; }, 5],
    ['Allsidig', 'Tren fem ulike muskelgrupper på 30 dager.', function (t) { return t.groupN; }, 5],
    ['Måler', 'Logg kroppsvekten fem ganger.', function (t) { return t.body; }, 5]
  ];
  function badgeCount(st) { var t = totals(st); return BADGES.filter(function (b) { return b[2](t) >= b[3]; }).length; }
  function progText(v, goal, name) {
    if (goal >= 1000 && /tonn/i.test(name)) return fmtNum(Math.round(v / 100) / 10) + ' av ' + fmtNum(goal / 1000) + ' tonn';
    if (/timer/i.test(name)) return fmtNum(Math.floor(v / 60)) + ' av ' + fmtNum(goal / 60) + ' timer';
    return Math.min(v, goal) + ' av ' + goal;
  }
  TB.page('merker', function () {
    var st = TB.state(), t = totals(st), got = 0;
    var cards = BADGES.map(function (b) {
      var v = b[2](t), ok = v >= b[3];
      if (ok) got++;
      return '<article class="badge-card' + (ok ? ' got' : '') + '"><span class="medal">' + ICON.merker + '</span><div><b>' + b[0] + '</b><p class="sub">' + b[1] + '</p>' +
        (ok ? '<span class="st st-ok">✓ Tatt</span>' : '<div class="bprog"><span class="gtrack"><i style="width:' + Math.min(100, v / b[3] * 100).toFixed(0) + '%"></i></span><span class="sub tnum">' + progText(v, b[3], b[0]) + '</span></div>') + '</div></article>';
    }).join('');
    return head('Merker', got + ' av ' + BADGES.length + ' merker tatt.') + '<div class="badges">' + cards + '</div>';
  }, 'mer');

  /* ---------- Innstillinger ---------- */
  function sw2(key, label, desc) {
    var on = TB.state().settings[key];
    return '<div class="setrow2"><div><b>' + label + '</b><p class="sub">' + desc + '</p></div><button class="switch" role="switch" aria-checked="' + on + '" data-act="set-toggle" data-k="' + key + '" aria-label="' + label + '"><i></i></button></div>';
  }
  TB.page('innstillinger', function () {
    var st = TB.state(), s = st.settings;
    var h = head('Innstillinger', 'Lagres sammen med resten av dataene dine.');
    h += '<section class="panel setlist"><label class="setrow2" for="set-name"><div><b>Navnet ditt</b><p class="sub">Brukes i hilsenen på I dag-kortet.</p></div><input id="set-name" class="inp" maxlength="30" data-f="set-name" value="' + esc(s.name) + '" placeholder="Valgfritt"></label>' +
      sw2('sound', 'Lyd', 'Pip fra hviletimer, intervalltimer og tidtaker.') +
      sw2('vibrate', 'Vibrasjon', 'Vibrerer ved bytte i intervalltimeren (på mobil).') + '</section>';
    h += '<section class="panel setlist">' +
      '<div class="setrow2 col"><div><b>Standard hviletid</b><p class="sub">Starter automatisk når du krysser av et sett i styrkeøkter.</p></div><div class="chips">' +
      [60, 90, 120, 180].map(function (v) { return '<button class="chip" data-act="set-rest" data-v="' + v + '" aria-pressed="' + (st.rest === v) + '">' + TB.clock(v) + '</button>'; }).join('') + '</div></div>' +
      '<div class="setrow2 col"><div><b>Økning i forslag</b><p class="sub">Hvor mye vekt appen foreslår å legge på når du klarte alt forrige gang.</p></div><div class="chips">' +
      [1.25, 2.5, 5].map(function (v) { return '<button class="chip" data-act="set-inc" data-v="' + v + '" aria-pressed="' + (s.inc === v) + '">+' + kg2(v) + ' kg</button>'; }).join('') + '</div></div>' +
      '<div class="setrow2 col"><div><b>Stang</b><p class="sub">Brukes i skivekalkulatoren.</p></div><div class="chips">' +
      [20, 15, 10].map(function (v) { return '<button class="chip" data-act="set-bar" data-v="' + v + '" aria-pressed="' + (s.bar === v) + '">' + v + ' kg</button>'; }).join('') + '</div></div>' +
      '<div class="setrow2 col"><div><b>Skiver du har tilgang til</b><p class="sub">Skivekalkulatoren bruker bare disse.</p></div><div class="chips">' +
      [25, 20, 15, 10, 5, 2.5, 1.25].map(function (v) { return '<button class="chip" data-act="set-plate" data-v="' + v + '" aria-pressed="' + (s.plates.indexOf(v) > -1) + '">' + kg2(v) + ' kg</button>'; }).join('') + '</div></div></section>';
    h += '<p class="sub">Lys og mørk modus velger du øverst til høyre.</p>';
    return h;
  }, 'mer');
  TB.field('set-name', function (t) { TB.state().settings.name = t.value.slice(0, 30); TB.save(); });
  TB.action('set-toggle', function (t) { var s = TB.state().settings; s[t.dataset.k] = !s[t.dataset.k]; TB.save(); TB.render(); });
  TB.action('set-rest', function (t) { TB.state().rest = +t.dataset.v; TB.save(); TB.render(); });
  TB.action('set-inc', function (t) { TB.state().settings.inc = +t.dataset.v; TB.save(); TB.render(); });
  TB.action('set-bar', function (t) { TB.state().settings.bar = +t.dataset.v; TB.save(); TB.render(); });
  TB.action('set-plate', function (t) {
    var s = TB.state().settings, v = +t.dataset.v, i = s.plates.indexOf(v);
    if (i > -1) { if (s.plates.length > 1) s.plates.splice(i, 1); } else s.plates.push(v);
    TB.save(); TB.render();
  });

  /* ---------- Data og sikkerhetskopi ---------- */
  var pending = null, impMsg = '';
  function download(name, text, type) {
    var blob = new Blob([text], { type: type }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function csvCell(v) { v = String(v == null ? '' : v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  TB.page('data', function () {
    var st = TB.state();
    var h = head('Data og sikkerhetskopi', 'Dataene dine: ' + st.log.length + ' økter, ' + st.programs.length + ' programmer og ' + st.body.length + ' kroppsmålinger.');
    h += '<section class="panel setlist">' +
      '<div class="setrow2"><div><b>Last ned sikkerhetskopi</b><p class="sub">Alt i én fil (JSON) som du kan gjenopprette senere.</p></div><button class="btn" data-act="data-json">Last ned</button></div>' +
      '<div class="setrow2"><div><b>Last ned historikken</b><p class="sub">Alle økter som regneark (CSV) for Excel eller Google Regneark.</p></div><button class="btn" data-act="data-csv">Last ned</button></div>' +
      '<div class="setrow2"><div><b>Gjenopprett fra sikkerhetskopi</b><p class="sub">Erstatter dataene dine med innholdet i en fil du har lastet ned før.</p></div><label class="btn" for="imp-file">Velg fil</label><input id="imp-file" type="file" accept="application/json,.json" class="sr"></div>';
    if (pending) h += '<div class="confirm" role="alert"><p>Filen inneholder <b>' + pending.log.length + ' økter</b> og <b>' + pending.programs.length + ' programmer</b>. Vil du erstatte dataene dine med den?</p><div class="row-actions"><button class="btn btn-primary" data-act="data-import">Erstatt dataene</button><button class="btn btn-ghost" data-act="data-import-x">Avbryt</button></div></div>';
    if (impMsg) h += '<p class="msg' + (/^(Gjenopprettet|Alle data)/.test(impMsg) ? ' ok' : '') + '" role="status">' + esc(impMsg) + '</p>';
    h += '</section>';
    h += '<section class="panel setlist danger"><div class="setrow2"><div><b>Slett alle data</b><p class="sub">Fjerner økter, programmer, planer, rekorder og målinger. Kan ikke angres. Last ned en sikkerhetskopi først.</p></div>' +
      '<button class="btn btn-ghost btn-danger" data-act="data-reset">' + (TB.armed() === 'data-reset' ? 'Slett alt for godt?' : 'Slett alt') + '</button></div></section>';
    return h;
  }, 'mer');
  TB.action('data-json', function () {
    var data = JSON.stringify({ app: 'Treningsbok', saved: new Date().toISOString(), state: TB.state() }, null, 2);
    download('treningsbok-' + TB.iso(new Date()) + '.json', data, 'application/json');
  });
  TB.action('data-csv', function () {
    var st = TB.state(), rows = [['Dato', 'Økt', 'Type', 'Minutter', 'Sett', 'Volum (kg)', 'Følelse', 'Øvelser', 'Notat']];
    st.log.forEach(function (l) {
      var ex = (l.ex || []).map(function (e) { return e.n + ': ' + e.s.map(function (x) { return (x[0] > 0 ? x[0] + ' kg × ' : '') + x[1]; }).join(', '); }).join(' | ');
      rows.push([l.d, l.name, l.kind, l.min, l.n, l.vol || 0, l.rate ? TB.RATE[l.rate - 1] : '', ex, l.note || '']);
    });
    download('treningsbok-historikk-' + TB.iso(new Date()) + '.csv', '﻿' + rows.map(function (r) { return r.map(csvCell).join(';'); }).join('\r\n'), 'text/csv;charset=utf-8');
  });
  document.addEventListener('change', function (e) {
    if (!e.target || e.target.id !== 'imp-file' || !e.target.files || !e.target.files[0]) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var obj = JSON.parse(fr.result), st = obj && obj.state ? obj.state : obj;
        if (!st || !Array.isArray(st.programs) || !Array.isArray(st.log)) throw new Error('format');
        pending = st; impMsg = '';
      } catch (err) { pending = null; impMsg = 'Filen kunne ikke leses. Velg en sikkerhetskopi som er lastet ned fra Treningsbok.'; }
      TB.render();
    };
    fr.readAsText(e.target.files[0]);
  });
  TB.action('data-import', function () {
    if (!pending) return;
    TB.replaceState(pending); pending = null; impMsg = 'Gjenopprettet. Dataene fra filen er tatt i bruk.';
    TB.render();
  });
  TB.action('data-import-x', function () { pending = null; impMsg = ''; TB.render(); });
  TB.action('data-reset', function () {
    if (TB.armed() !== 'data-reset') { TB.setArmed('data-reset'); TB.render(); return; }
    TB.setArmed('');
    var fresh = TB.defaults(); fresh.hint = false;
    TB.replaceState(fresh); impMsg = 'Alle data er slettet.';
    TB.render();
  }, true);
});
