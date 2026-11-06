/* Øvelser-fanen: hele øvelsesbanken fra ovelser-data.js med søk, filtre og detaljer.
 * Registreres som egen side via window.TBX, som Mer-fanen. window.TBEX brukes av app.js
 * (muskelgrupper i Fremgang og forslag når du skriver inn øvelser i programmene). */
(function () {
  var DB = window.TB_EXDB || [];
  var GROUPS = ['Bryst', 'Rygg', 'Skuldre', 'Armer', 'Ben', 'Core', 'Helkropp', 'Kondisjon', 'Mobilitet'];
  var EQUIP = { kv: 'Uten utstyr', stang: 'Vektstang', man: 'Manualer', kb: 'Kettlebell', kabel: 'Kabel', mask: 'Maskin', strikk: 'Strikk',
    stativ: 'Pullup- eller dipsstang', benk: 'Benk', app: 'Kondisjonsapparat', annet: 'Annet utstyr' };
  var LEVEL = ['', 'Nybegynner', 'Middels', 'Erfaren'];
  var UNIT = { reps: 'Repetisjoner', sek: 'Sekunder', min: 'Minutter' };
  var OWN = 'Fra programmene';

  // Søk uten å bry seg om store bokstaver, bindestrek eller æ/ø/å («kneboy» finner «Knebøy»)
  function fold(s) {
    return String(s || '').toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[éè]/g, 'e')
      .replace(/[-–\/,.()«»]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function key(s) { return String(s || '').trim().toLowerCase(); }

  var LIST = DB.map(function (x) {
    return { name: x[0], group: x[1], eq: x[2].split(','), unit: x[3], lvl: x[4], mus: x[5], how: x[6], tip: x[7], alias: x[8] || '',
      k: key(x[0]), fname: fold(x[0]), hay: fold([x[0], x[1], x[5], x[8]].join(' ')) };
  });
  var BY = {};
  LIST.forEach(function (e) { BY[e.k] = e; });

  window.TBEX = {
    count: LIST.length,
    find: function (name) { return BY[key(name)] || null; },
    group: function (name) { var e = BY[key(name)]; return e ? e.group : null; },
    names: function () { return LIST.map(function (e) { return e.name; }); }
  };

  (window.TBX = window.TBX || []).push(function (TB) {
    var esc = TB.esc;
    var f = { q: '', g: 'Alle', eq: '', lvl: 0 }, openName = '', addMsg = '';
    try {
      var sv = JSON.parse(localStorage.getItem('tb_exf') || 'null');
      if (sv) { f.g = sv.g || 'Alle'; f.eq = sv.eq || ''; f.lvl = +sv.lvl || 0; }
    } catch (e) { }
    function remember() { try { localStorage.setItem('tb_exf', JSON.stringify({ g: f.g, eq: f.eq, lvl: f.lvl })); } catch (e) { } }

    // Øvelser du bruker i programmene eller har logget, men som ikke finnes i banken
    function ownList() {
      var st = TB.state(), seen = {}, out = [];
      var add = function (n, kind) {
        var k = key(n);
        if (!k || k === 'ny øvelse' || BY[k] || seen[k]) return;
        seen[k] = true;
        out.push({ name: String(n).trim(), group: OWN, own: true, kind: kind, eq: [], lvl: 0, k: k, fname: fold(n), hay: fold(n) });
      };
      st.programs.forEach(function (p) { p.exercises.forEach(function (e) { add(e.name, p.kind); }); });
      st.log.forEach(function (l) { (l.ex || []).forEach(function (e) { add(e.n, l.kind); }); });
      return out.sort(function (a, b) { return a.name.localeCompare(b.name, 'nb'); });
    }
    function timesDone() {
      var c = {};
      TB.state().log.forEach(function (l) { (l.ex || []).forEach(function (e) { var k = key(e.n); c[k] = (c[k] || 0) + 1; }); });
      return c;
    }
    function filtered() {
      var own = ownList(), all = LIST.concat(own), words = fold(f.q).split(' ').filter(Boolean);
      var out = all.filter(function (e) {
        if (f.g !== 'Alle' && e.group !== f.g) return false;
        if (f.eq && !e.own && (f.eq === 'kv' ? e.eq.indexOf('kv') < 0 : e.eq.indexOf(f.eq) < 0)) return false;
        if (f.eq && e.own) return false;
        if (f.lvl && (e.own || e.lvl !== f.lvl)) return false;
        return words.every(function (w) { return e.hay.indexOf(w) > -1; });
      });
      if (words.length) {
        var q = fold(f.q), score = function (e) { return e.fname === q ? 0 : e.fname.indexOf(q) === 0 ? 1 : e.fname.indexOf(q) > -1 ? 2 : 3; };
        out.sort(function (a, b) { return score(a) - score(b) || a.name.localeCompare(b.name, 'nb'); });
      }
      return { list: out, own: own.length };
    }

    var CHEV = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10l4 4 4-4"/></svg>';
    var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
    function pips(n) { var s = ''; for (var i = 1; i <= 3; i++) s += '<i' + (i <= n ? ' class="on"' : '') + '></i>'; return '<span class="lvl" title="Nivå: ' + LEVEL[n] + '">' + s + '</span>'; }
    function eqText(e) { return e.eq.map(function (k) { return EQUIP[k]; }).join(', '); }

    function unitOfKind(kind) { return kind === 'core' || kind === 'mobilitet' ? 'sek' : kind === 'kondisjon' ? 'min' : 'reps'; }
    function setsLine(sets, kind) {
      var w = sets[0][0] > 0, u = unitOfKind(kind);
      var same = sets.every(function (x) { return x[0] === sets[0][0] && x[1] === sets[0][1]; });
      if (same) return sets.length + ' × ' + TB.fmtNum(sets[0][1]) + (w ? ' × ' + TB.fmtNum(sets[0][0]) + ' kg' : ' ' + u);
      return sets.map(function (x) { return TB.fmtNum(x[1]) + (w ? ' × ' + TB.fmtNum(x[0]) : ''); }).join(', ') + (w ? ' kg' : ' ' + u);
    }
    function mine(e) {
      var hist = TB.exHistory(e.name), st = TB.state(), recs = [];
      Object.keys(st.pr).forEach(function (k) { if (k.split('|')[0] === e.k) recs.push(st.pr[k]); });
      if (!hist.length && !recs.length) return '<p class="sub">Du har ikke logget denne ennå.</p>';
      var h = '<dl class="exmine">';
      if (hist.length) {
        h += '<div><dt>Gjort</dt><dd>' + hist.length + (hist.length === 1 ? ' gang' : ' ganger') + '</dd></div>';
        h += '<div><dt>Sist (' + TB.dateLabel(TB.parseIso(hist[0].d)) + ')</dt><dd>' + esc(setsLine(hist[0].sets, hist[0].kind)) + '</dd></div>';
      }
      recs.forEach(function (r) {
        var t = r.type === 'kg' ? TB.fmtNum(r.kg) + ' kg × ' + TB.fmtNum(r.reps) : r.type === 'sek' ? TB.fmtNum(r.reps) + ' sek' : TB.fmtNum(r.reps) + ' reps';
        h += '<div><dt>' + (r.type === 'kg' ? 'Rekord' : r.type === 'sek' ? 'Lengste hold' : 'Flest reps') + '</dt><dd>' + t + '</dd></div>';
        if (r.type === 'kg' && r.reps > 1) h += '<div><dt>Estimert maks</dt><dd>' + TB.fmtNum(Math.round(TB.e1rm(r.kg, r.reps) * 2) / 2) + ' kg</dd></div>';
      });
      return h + '</dl>';
    }
    function addBox(e) {
      var progs = TB.state().programs;
      var inP = progs.filter(function (p) { return p.exercises.some(function (x) { return key(x.name) === e.k; }); });
      var h = '<div class="exadd">';
      if (inP.length) h += '<p class="sub">✓ Finnes i ' + inP.map(function (p) { return '«' + esc(p.name) + '»'; }).join(', ') + '</p>';
      if (progs.length) {
        var free = progs.filter(function (p) { return inP.indexOf(p) < 0; });
        if (free.length) {
          h += '<div class="exadd-row"><select class="inp" id="ex-prog" aria-label="Velg program">' +
            free.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>'; }).join('') + '</select>' +
            '<button class="btn btn-primary" data-act="ex-add" data-n="' + esc(e.name) + '">Legg til i program</button></div>';
        }
      }
      h += '<div class="row-actions"><button class="btn btn-sm" data-act="ex-new" data-n="' + esc(e.name) + '">Nytt program med denne</button></div>';
      if (addMsg) h += '<p class="msg ok" role="status">' + esc(addMsg) + '</p>';
      return h + '</div>';
    }
    function body(e) {
      var h = '<div class="exbody">';
      if (window.TBAnim && TBAnim.has(e.name)) h += '<div class="ex-anim">' + TBAnim.html(e.name) + '</div>';
      if (e.own) {
        h += '<p class="sub">Denne finnes i programmene eller historikken din, men ikke i øvelsesbanken, så den har ingen forklaring her.</p>';
      } else {
        h += '<p class="exhow">' + esc(e.how) + '</p>';
        h += '<p class="extip"><b>Tips:</b> ' + esc(e.tip) + '</p>';
        h += '<dl class="exfacts"><div><dt>Muskler</dt><dd>' + esc(e.mus) + '</dd></div><div><dt>Utstyr</dt><dd>' + esc(eqText(e)) + '</dd></div>' +
          '<div><dt>Nivå</dt><dd>' + LEVEL[e.lvl] + '</dd></div><div><dt>Måles i</dt><dd>' + UNIT[e.unit] + '</dd></div>' +
          (e.alias ? '<div><dt>Også kalt</dt><dd>' + esc(e.alias) + '</dd></div>' : '') + '</dl>';
      }
      h += '<h4 class="exsub">Din fremgang</h4>' + mine(e);
      h += '<h4 class="exsub">Bruk øvelsen</h4>' + addBox(e);
      return h + '</div>';
    }
    function item(e, done) {
      var open = openName === e.k, anim = !!(window.TBAnim && TBAnim.has(e.name)), n = done[e.k] || 0;
      var meta = e.own ? 'Fra programmene eller historikken din' : (f.g === 'Alle' || f.q ? e.group + ' · ' : '') + eqText(e);
      return '<div class="exitem' + (open ? ' open' : '') + '"><button class="exhead" data-act="exo" data-k="' + esc(e.k) + '" aria-expanded="' + open + '">' +
        '<span class="exname">' + esc(e.name) + '</span>' +
        '<span class="exmeta">' + esc(meta) + '</span>' +
        '<span class="extags">' + (n ? '<span class="extag">' + n + '×</span>' : '') + (anim ? '<span class="extag exanim" title="Har animasjon">' + PLAY + '</span>' : '') +
        (e.own ? '' : pips(e.lvl)) + CHEV + '</span></button>' + (open ? body(e) : '') + '</div>';
    }
    function listHtml() {
      var r = filtered(), list = r.list, done = timesDone(), h = '';
      var active = f.q || f.g !== 'Alle' || f.eq || f.lvl;
      var countTxt = active ? 'Viser ' + list.length + (list.length === 1 ? ' øvelse' : ' øvelser')
        : 'Alle ' + LIST.length + ' øvelsene' + (r.own ? ', pluss ' + r.own + ' fra programmene dine' : '');
      h += '<div class="excount"><span class="sub">' + countTxt + '</span>' +
        (active ? '<button class="btn btn-sm btn-ghost" data-act="ex-clear">Nullstill</button>' : '') + '</div>';
      if (!list.length) return h + '<p class="empty">Fant ingen øvelser. Prøv et annet ord, eller nullstill filtrene.</p>';
      if (f.g === 'Alle' && !f.q) {
        GROUPS.concat([OWN]).forEach(function (g) {
          var part = list.filter(function (e) { return e.group === g; });
          if (!part.length) return;
          h += '<h3 class="subhead exgroup">' + g + ' <span class="sub">' + part.length + '</span></h3><div class="exlist">' + part.map(function (e) { return item(e, done); }).join('') + '</div>';
        });
        return h;
      }
      return h + '<div class="exlist">' + list.map(function (e) { return item(e, done); }).join('') + '</div>';
    }
    // Oppdaterer bare listen, så søkefeltet beholder fokus mens du skriver
    function refreshList(scrollTo) {
      var el = document.getElementById('exlist');
      if (!el) { TB.render(); return; }
      el.innerHTML = listHtml();
      if (window.TBAnim) TBAnim.refresh();
      if (scrollTo) {
        var o = el.querySelector('.exitem.open');
        if (o) { var top = o.getBoundingClientRect().top; if (top < 70) window.scrollBy(0, top - 80); }
      }
    }

    TB.page('ovelser', function () {
      var r = filtered();
      var h = '<div class="sec-head"><div><h2>Øvelser</h2><p class="sub">' + LIST.length + ' øvelser med forklaring og tips. Søk, filtrer og legg dem rett inn i programmene dine.</p></div></div>';
      h += '<div class="exsearch"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>' +
        '<input type="search" class="inp" id="ex-q" data-f="exq" value="' + esc(f.q) + '" placeholder="Søk etter øvelse eller muskel" aria-label="Søk etter øvelse" autocomplete="off" enterkeyhint="search"></div>';
      h += '<div class="chips exchips" role="group" aria-label="Muskelgruppe">';
      ['Alle'].concat(GROUPS, r.own ? [OWN] : []).forEach(function (g) {
        h += '<button class="chip" data-act="exg" data-g="' + esc(g) + '" aria-pressed="' + (g === f.g) + '">' + g + '</button>';
      });
      h += '</div><div class="exfilters"><select class="inp" data-f="exeq" aria-label="Utstyr"><option value="">Alt utstyr</option>' +
        Object.keys(EQUIP).map(function (k) { return '<option value="' + k + '"' + (f.eq === k ? ' selected' : '') + '>' + EQUIP[k] + '</option>'; }).join('') + '</select>' +
        '<select class="inp" data-f="exlvl" aria-label="Nivå"><option value="0">Alle nivåer</option>' +
        [1, 2, 3].map(function (n) { return '<option value="' + n + '"' + (f.lvl === n ? ' selected' : '') + '>' + LEVEL[n] + '</option>'; }).join('') + '</select></div>';
      return h + '<div id="exlist">' + listHtml() + '</div>';
    }, 'ovelser');

    TB.field('exq', function (t) { f.q = t.value; openName = ''; refreshList(); });
    TB.field('exeq', function (t) { f.eq = t.value; remember(); refreshList(); });
    TB.field('exlvl', function (t) { f.lvl = +t.value || 0; remember(); refreshList(); });
    TB.action('exg', function (t) { f.g = t.dataset.g; openName = ''; remember(); TB.render(); });
    TB.action('ex-clear', function () { f = { q: '', g: 'Alle', eq: '', lvl: 0 }; openName = ''; remember(); TB.render(); });
    TB.action('exo', function (t) { openName = openName === t.dataset.k ? '' : t.dataset.k; addMsg = ''; refreshList(true); });

    function entryFor(e) {
      var reps = e && e.unit === 'sek' ? 30 : e && e.unit === 'min' ? 10 : 10;
      return { id: TB.uid(), name: e.name, sets: e && e.unit === 'min' ? 1 : 3, reps: reps, kg: 0 };
    }
    function lookup(name) { return BY[key(name)] || ownList().filter(function (x) { return x.k === key(name); })[0] || null; }
    TB.action('ex-add', function (t) {
      var e = lookup(t.dataset.n), sel = document.getElementById('ex-prog'), st = TB.state();
      var p = sel && st.programs.filter(function (x) { return x.id === sel.value; })[0];
      if (!e || !p) return;
      p.exercises.push(entryFor(e));
      addMsg = 'Lagt til i «' + p.name + '». Endre sett og repetisjoner under Programmer.';
      TB.save(); refreshList();
    });
    TB.action('ex-new', function (t) {
      var e = lookup(t.dataset.n), st = TB.state();
      if (!e) return;
      var kind = e.own ? (e.kind || 'styrke') : e.group === 'Kondisjon' ? 'kondisjon' : e.group === 'Mobilitet' ? 'mobilitet' : (e.unit === 'sek' ? 'core' : 'styrke');
      st.programs.push({ id: TB.uid(), name: e.name, kind: kind, exercises: [entryFor(e)] });
      addMsg = 'Laget programmet «' + e.name + '». Finn det under Programmer.';
      TB.save(); refreshList();
    });

    // I programmene: marker «Ny øvelse» når du trykker i feltet, så forslagene dukker opp med en gang du skriver
    document.addEventListener('focusin', function (ev) {
      var t = ev.target;
      if (t && t.dataset && t.dataset.f === 'en' && t.value === 'Ny øvelse') { try { t.select(); } catch (e) { } }
    });
  });
})();
