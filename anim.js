/* Øvelsesanimasjoner: strekfigurer som beveger seg mellom nøkkelstillinger.
 *
 * Hver øvelse har to eller flere stillinger. En stilling beskriver bare hofta (h),
 * overkroppens vinkel (t) og hvor hender (a, b) og ankler (f, g) står. Knær og albuer
 * regnes ut med todelt IK, så lemmene har samme lengde gjennom hele bevegelsen.
 *
 *   a, f  = nær arm og nær bein (mørke)      b, g = arm og bein på andre siden (lysere)
 *   d     = retning fra skulder til hode     bw   = krumming av ryggen (+ opp, - ned)
 *   fa/ga = vinkel på foten for f/g          hi   = deler som jobber mest (farget)
 *
 * Koordinater: y nedover, bakken ligger på y = 106.
 * Vinkler i grader: 0 = høyre, -90 = opp, 90 = ned, 180 = venstre.
 */
(function () {
  'use strict';

  var GY = 106;
  var L = { torso: 30, thigh: 26, shin: 26, up: 16, fore: 16 };
  var TOE = 11, HEAD = 8.5, HEAD_R = 6;
  var R = Math.PI / 180;
  var reduce = false;
  try { reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { }

  var CHAIR = '<path class="prop" d="M26 70 L66 70 M30 70 L30 106 M62 70 L62 106 M26 70 L26 42"/>';
  var LOWCHAIR = '<path class="prop" d="M20 82 L54 82 M24 82 L24 106 M50 82 L50 106 M20 82 L20 56"/>';
  var WALL = '<path class="prop wall" d="M60 -12 L60 106"/>';
  var STEP = '<path class="prop solid" d="M93 106 L93 94 L150 94 L150 106 Z"/>';
  var CHAIR_BOX = [26, 42, 66, 106], LOWCHAIR_BOX = [20, 56, 54, 106], WALL_BOX = [58, 30, 62, 106], STEP_BOX = [93, 94, 150, 106];

  var DEFS = [
    // ---------- Overkropp ----------
    { name: 'Armhevinger', hi: ['arms'], p: [
      { h: [89.9, 80.4], t: -16.3, a: [119, 104], f: [40, 95], fa: 80 },
      { h: [91.8, 90.6], t: -4.9, a: [119, 104], f: [40, 95], fa: 80 }] },

    { name: 'Diamant-armhevinger', hi: ['arms'], p: [
      { h: [89.9, 80.4], t: -16.3, a: [112, 104], f: [40, 95], fa: 80 },
      { h: [91.8, 90.6], t: -4.9, a: [112, 104], f: [40, 95], fa: 80 }] },

    { name: 'Dips på stol', hi: ['arms'], props: CHAIR, box: CHAIR_BOX, p: [
      { h: [70, 68], t: -106, a: [55, 70], f: [105, 104] },
      { h: [70, 88], t: -106, a: [55, 70], f: [105, 104] }] },

    { name: 'Pike-armhevinger', hi: ['arms'], flip: true, k: [1, 1], e: [-1, -1], p: [
      { h: [104, 52], t: 122, a: [70, 104], f: [134, 94], fa: 105 },
      { h: [98, 60], t: 112, a: [70, 104], f: [134, 94], fa: 105 }] },

    // ---------- Ben ----------
    { name: 'Knebøy', hi: ['legs'], p: [
      { h: [100, 53], t: -90, a: [134, 24], f: [100, 104] },
      { h: [78, 78.3], t: -65, a: [124, 50], f: [100, 104] }] },

    { name: 'Utfall', hi: ['legs'], p: [
      { h: [100, 53], t: -90, a: [96, 52], f: [100, 104], g: [100, 104], ga: 0 },
      { h: [92, 78], t: -90, a: [88, 70], f: [118, 104], g: [60, 98], ga: 30 }] },

    { name: 'Bulgarsk utfall', hi: ['legs'], props: LOWCHAIR, box: LOWCHAIR_BOX, p: [
      { h: [90, 58], t: -90, a: [86, 50], f: [112, 104], g: [46, 80], ga: 180 },
      { h: [91, 78.3], t: -88, a: [88, 70], f: [112, 104], g: [46, 80], ga: 180 }] },

    { name: 'Bekkenløft', hi: ['legs'], p: [
      { h: [70, 102], t: 180, d: 190, a: [80, 104], f: [96, 104] },
      { h: [66, 79], t: 140, d: 175, a: [80, 104], f: [96, 104] }] },

    { name: 'Tåhev', hi: ['legs'], props: STEP, box: STEP_BOX, p: [
      { h: [95, 47], t: -90, a: [96, 60], f: [89.8, 98.1], fa: -22 },
      { h: [97, 34], t: -90, a: [98, 50], f: [93.7, 85], fa: 55 }] },

    { name: 'Vegg-sitt', hi: ['legs'], hold: true, seg: 1.8, props: WALL, box: WALL_BOX, p: [
      { h: [66, 78], t: -90, a: [84, 72], f: [92, 104] },
      { h: [66, 79.5], t: -90, a: [84, 73], f: [92, 104] }] },

    // ---------- Core ----------
    { name: 'Planke', hi: ['core'], hold: true, seg: 1.8, p: [
      { h: [91.8, 90.6], t: -4.9, a: [138, 104], f: [40, 95], fa: 80 },
      { h: [91.8, 89.4], t: -6.2, a: [138, 104], f: [40, 95], fa: 80 }] },

    { name: 'Sideplanke', hi: ['core'], hold: true, seg: 1.8, toe: false, p: [
      { h: [91.3, 92.8], t: -9.1, a: [137, 104], b: [121, 40], f: [40, 101] },
      { h: [91.3, 91.3], t: -10.5, a: [137, 104], b: [121, 40], f: [40, 101] }] },

    { name: 'Dødbille', hi: ['core'], p: [
      { h: [70, 102], t: 180, d: 190, a: [40, 64], b: [44, 64], f: [96, 76], g: [93, 78], fa: -90, ga: -90 },
      { h: [70, 102], t: 180, d: 190, a: [8, 102], b: [44, 64], f: [96, 76], g: [128, 96], fa: -90, ga: -40 }] },

    { name: 'Bird dog', hi: ['core'], p: [
      { h: [70, 72], t: 0, d: 20, a: [102, 104], b: [106, 104], f: [45, 102], g: [49, 102], fa: 180 },
      { h: [70, 72], t: 0, d: 5, a: [140, 70], b: [106, 104], f: [45, 102], g: [10, 72], fa: 180 }] },

    { name: 'Superman', hi: ['core'], p: [
      { h: [70, 102], t: 0, d: -5, a: [145, 102], f: [10, 102], fa: 180 },
      { h: [70, 102], t: -14, d: -28, a: [140, 82], f: [10, 86], fa: 180 }] },

    // ---------- Kondisjon ----------
    { name: 'Jumping jacks', hi: ['legs', 'arms'], front: true, tl: 6, seg: 0.28, k: [1, -1], e: [1, -1], p: [
      { h: [100, 53], t: -90, a: [89, 60], b: [111, 60], f: [94, 104], g: [106, 104], fa: 180, ga: 0 },
      { h: [100, 55], t: -90, a: [58, 25], b: [142, 25], f: [86, 104], g: [114, 104], fa: 180, ga: 0 },
      { h: [100, 57], t: -90, a: [84, -6], b: [116, -6], f: [78, 104], g: [122, 104], fa: 180, ga: 0 }] },

    { name: 'Høye knær', hi: ['legs'], cycle: true, seg: 0.24, p: [
      { h: [100, 54], t: -88, a: [118, 38], b: [84, 38], f: [100, 104], g: [121, 79], fa: 0, ga: 30 },
      { h: [100, 53], t: -88, a: [108, 46], b: [92, 46], f: [100, 104], g: [100, 104], fa: 0, ga: 0 },
      { h: [100, 54], t: -88, a: [84, 38], b: [118, 38], f: [121, 79], g: [100, 104], fa: 30, ga: 0 },
      { h: [100, 53], t: -88, a: [92, 46], b: [108, 46], f: [100, 104], g: [100, 104], fa: 0, ga: 0 }] },

    { name: 'Burpees', hi: ['legs', 'arms'], cycle: true, seg: 0.75, p: [
      { h: [96, 53], t: -90, a: [98, 58], b: [92, 58], f: [96, 104], fa: 0 },
      { h: [80, 84], t: -10, a: [124, 104], b: [118, 104], f: [96, 104], fa: 0 },
      { h: [89.9, 80.4], t: -16.3, a: [119, 104], b: [115, 104], f: [40, 95], fa: 80 },
      { h: [80, 84], t: -10, a: [124, 104], b: [118, 104], f: [96, 104], fa: 0 },
      { h: [96, 50], t: -90, a: [112, -14], b: [80, -14], f: [96, 100], fa: 30 }] },

    // ---------- Mobilitet ----------
    { name: 'Katt-ku', hi: ['core'], seg: 1.6, p: [
      { h: [70, 72], t: 0, d: 75, bw: 26, a: [102, 104], f: [45, 102], fa: 180 },
      { h: [70, 72], t: 0, d: -25, bw: -20, a: [102, 104], f: [45, 102], fa: 180 }] },

    // Bakre bein (f) er det som strekkes, derfor er det tegnet nærmest.
    { name: 'Hoftebøyer-strekk', hi: ['f'], hold: true, seg: 1.8, p: [
      { h: [84, 80], t: -90, a: [88, 8], b: [80, 8], f: [44, 102], g: [116, 104], fa: 170, ga: 0 },
      { h: [92, 82], t: -92, a: [96, 12], b: [88, 12], f: [48, 102], g: [116, 104], fa: 170, ga: 0 }] },

    { name: 'Hamstring-strekk', hi: ['f'], hold: true, seg: 1.8, p: [
      { h: [60, 103], t: -90, a: [80, 96], f: [112, 103], g: [82, 103], fa: -90, ga: 0 },
      { h: [60, 103], t: -33, a: [112, 97], f: [112, 103], g: [82, 103], fa: -90, ga: 0 }] }
  ];

  var BY = {}, LC = {};
  var HI_WORDS = { legs: ['f', 'g'], arms: ['a', 'b'], core: ['torso'] };
  DEFS.forEach(function (ex) {
    ex.seg = ex.seg || 1.1;
    ex.k = ex.k || [-1, -1];
    ex.e = ex.e || [1, 1];
    ex.props = ex.props || '';
    ex.tl = ex.tl || TOE;
    ex.hiSet = {};
    (ex.hi || []).forEach(function (w) { (HI_WORDS[w] || [w]).forEach(function (k) { ex.hiSet[k] = true; }); });
    ex.p.forEach(function (p) {
      if (p.d == null) p.d = p.t;
      if (p.bw == null) p.bw = 0;
      if (p.fa == null) p.fa = 0;
      if (p.ga == null) p.ga = p.fa;
    });
    BY[ex.name] = ex;
    LC[ex.name.toLowerCase()] = ex;
  });

  function find(name) { return LC[String(name || '').trim().toLowerCase()] || null; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // To ledd fra p mot målet tgt. dir velger hvilken side leddet bøyer mot.
  function ik(p, tgt, l1, l2, dir) {
    var dx = tgt[0] - p[0], dy = tgt[1] - p[1];
    var d = Math.sqrt(dx * dx + dy * dy) || 0.001;
    var max = l1 + l2, soft = max * 0.93;
    var dd = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.01), max - 0.01);
    var ux = dx / d, uy = dy / d;
    var a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
    var h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    if (d > soft) h *= Math.max(0, (max - d) / (max - soft));   // nesten strukket lem tegnes rett
    var mx = p[0] + ux * a, my = p[1] + uy * a;
    return [[mx - uy * h * dir, my + ux * h * dir], [p[0] + ux * dd, p[1] + uy * dd]];
  }

  function lerpPt(p, q, g) {
    if (!p && !q) return null;
    if (!p) return q;
    if (!q) return p;
    return [p[0] + (q[0] - p[0]) * g, p[1] + (q[1] - p[1]) * g];
  }
  function mix(a, b, g) {
    var o = {};
    ['h', 'a', 'b', 'f', 'g'].forEach(function (k) { o[k] = lerpPt(a[k], b[k], g); });
    ['t', 'd', 'bw', 'fa', 'ga'].forEach(function (k) { o[k] = a[k] + (b[k] - a[k]) * g; });
    return o;
  }

  function poseAt(ex, t) {
    var n = ex.p.length, u = t / ex.seg, i, j, s;
    if (ex.cycle) {
      u = u % n; i = Math.floor(u); j = (i + 1) % n; s = u - i;
    } else {
      var m = 2 * (n - 1);
      u = u % m;
      var k = Math.floor(u);
      s = u - k;
      if (k < n - 1) { i = k; j = k + 1; } else { i = m - k; j = m - k - 1; }
    }
    var g = Math.min(1, Math.max(0, (s - 0.12) / 0.76));   // liten pause i endestillingene
    g = g * g * (3 - 2 * g);
    return mix(ex.p[i], ex.p[j], g);
  }

  function shapes(ex, p) {
    var th = p.t * R, dh = p.d * R, hip = p.h;
    var neck = [hip[0] + L.torso * Math.cos(th), hip[1] + L.torso * Math.sin(th)];
    var head = [neck[0] + HEAD * Math.cos(dh), neck[1] + HEAD * Math.sin(dh)];
    var ctl = [(hip[0] + neck[0]) / 2 + p.bw * Math.sin(th), (hip[1] + neck[1]) / 2 - p.bw * Math.cos(th)];
    var fx = ex.flip ? function (x) { return 200 - x; } : function (x) { return x; };
    var pts = [];
    var P = function (q) { pts.push([fx(q[0]), q[1]]); return r1(fx(q[0])) + ' ' + r1(q[1]); };
    var parts = { torso: '', a: '', b: '', f: '', g: '' };

    // Skuldre og hofter: i sidebilde ett punkt, forfra to punkter ved siden av hverandre.
    var sa = neck, sb = neck, hf = hip, hg = hip;
    if (ex.front) {
      sa = [neck[0] - 6, neck[1] + 2]; sb = [neck[0] + 6, neck[1] + 2];
      hf = [hip[0] - 4, hip[1]]; hg = [hip[0] + 4, hip[1]];
    }

    parts.torso = 'M' + P(hip) + 'Q' + P(ctl) + ' ' + P(neck);
    pts.splice(-2, 1);                                                  // kontrollpunktet ligger utenfor kurven
    pts.push([fx((hip[0] + neck[0]) / 2 + p.bw * Math.sin(th) / 2), (hip[1] + neck[1]) / 2 - p.bw * Math.cos(th) / 2]);
    if (ex.front) parts.torso += 'M' + P(sa) + 'L' + P(sb) + 'M' + P(hf) + 'L' + P(hg);

    function arm(key, s, hand, dir) {
      if (!hand) return;
      var r = ik(s, hand, L.up, L.fore, dir);
      parts[key] = 'M' + P(s) + 'L' + P(r[0]) + 'L' + P(r[1]);
    }
    function leg(key, s, foot, dir, ang) {
      if (!foot) return;
      var r = ik(s, foot, L.thigh, L.shin, dir);
      var str = 'M' + P(s) + 'L' + P(r[0]) + 'L' + P(r[1]);
      if (ex.toe !== false) str += 'L' + P([r[1][0] + ex.tl * Math.cos(ang * R), r[1][1] + ex.tl * Math.sin(ang * R)]);
      parts[key] = str;
    }
    arm('a', sa, p.a, ex.e[0]); arm('b', sb, p.b, ex.e[1]);
    leg('f', hf, p.f, ex.k[0], p.fa); leg('g', hg, p.g, ex.k[1], p.ga);

    var out = { far: '', farHi: '', near: '', nearHi: '' };
    var nearKeys = ex.front ? ['torso', 'a', 'b', 'f', 'g'] : ['torso', 'a', 'f'];
    var farKeys = ex.front ? [] : ['b', 'g'];
    nearKeys.forEach(function (k) { out[ex.hiSet[k] ? 'nearHi' : 'near'] += parts[k]; });
    farKeys.forEach(function (k) { out[ex.hiSet[k] ? 'farHi' : 'far'] += parts[k]; });
    out.hx = r1(fx(head[0])); out.hy = r1(head[1]);
    pts.push([fx(head[0]) - HEAD_R, head[1] - HEAD_R], [fx(head[0]) + HEAD_R, head[1] + HEAD_R]);
    out.pts = pts;
    return out;
  }

  // Beregner utsnittet (viewBox) som rommer hele bevegelsen, så figuren fyller bildet.
  function fit(ex) {
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    var total = ex.cycle ? ex.p.length * ex.seg : 2 * (ex.p.length - 1) * ex.seg;
    function add(x, y) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    for (var k = 0; k < 48; k++) {
      var s = shapes(ex, poseAt(ex, total * k / 48));
      for (var i = 0; i < s.pts.length; i++) add(s.pts[i][0], s.pts[i][1]);
    }
    if (ex.box) { add(ex.box[0], ex.box[1]); add(ex.box[2], ex.box[3]); }
    add(x0, GY + 3);
    var pad = 10, bw = x1 - x0 + 2 * pad, bh = y1 - y0 + 2 * pad;
    var H = Math.max(bh, bw * 134 / 150, 84), W = H * 150 / 134;
    return [r1((x0 + x1) / 2 - W / 2), r1(y1 + pad - H), r1(W), r1(H)];
  }
  DEFS.forEach(function (ex) { ex.vb = fit(ex); });

  var perf = window.performance && window.performance.now ? window.performance : null;
  var T0 = perf ? perf.now() : 0;

  function draw(el, tSec) {
    var ex = BY[el.getAttribute('data-ex')];
    if (!ex) return;
    var t = tSec;
    if (reduce) t = (+el.getAttribute('data-pose') || 0) * ex.seg;   // stillbilde, trykk bytter stilling
    var s = shapes(ex, poseAt(ex, t));
    var q = function (c) { return el.querySelector('.' + c); };
    var pf = q('lf'), pfh = q('lfh'), pn = q('ln'), pnh = q('lnh'), hd = q('hd');
    if (!pf || !pfh || !pn || !pnh || !hd) return;
    pf.setAttribute('d', s.far);
    pfh.setAttribute('d', s.farHi);
    pn.setAttribute('d', s.near);
    pnh.setAttribute('d', s.nearHi);
    hd.setAttribute('cx', s.hx);
    hd.setAttribute('cy', s.hy);
  }

  function refresh() {
    var list = document.querySelectorAll('.anim'), t = ((perf ? perf.now() : 0) - T0) / 1000;
    for (var i = 0; i < list.length; i++) draw(list[i], t);
  }

  function frame(now) {
    var list = document.querySelectorAll('.anim');
    if (!list.length) { setTimeout(function () { window.requestAnimationFrame(frame); }, 250); return; }
    var t = (now - T0) / 1000;
    for (var i = 0; i < list.length; i++) draw(list[i], t);
    window.requestAnimationFrame(frame);
  }

  function html(name) {
    var ex = find(name);
    if (!ex) return '';
    return '<div class="anim" data-ex="' + esc(ex.name) + '" data-pose="0" data-seg="' + ex.seg + '" data-n="' + ex.p.length + '" data-cycle="' + (ex.cycle ? 1 : 0) + '"' +
      (reduce ? ' tabindex="0" title="Trykk for å bytte stilling"' : '') +
      ' role="img" aria-label="Animasjon av ' + esc(ex.name.toLowerCase()) + '">' +
      '<svg viewBox="' + ex.vb.join(' ') + '" aria-hidden="true" focusable="false">' +
      '<line class="gnd" x1="' + (ex.vb[0] - 20) + '" y1="' + GY + '" x2="' + (ex.vb[0] + ex.vb[2] + 20) + '" y2="' + GY + '"/>' + ex.props +
      '<path class="lf" d=""/><path class="lfh" d=""/><path class="ln" d=""/><path class="lnh" d=""/>' +
      '<circle class="hd" r="' + HEAD_R + '" cx="-50" cy="-50"/></svg></div>';
  }

  if (reduce) {
    var toggle = function (e) {
      var el = e.target.closest ? e.target.closest('.anim') : null;
      if (!el) return;
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      el.setAttribute('data-pose', el.getAttribute('data-pose') === '1' ? '0' : '1');
      draw(el, 0);
    };
    document.addEventListener('click', toggle);
    document.addEventListener('keydown', toggle);
  } else if (window.requestAnimationFrame) {
    window.requestAnimationFrame(frame);
  }

  window.TBAnim = {
    has: function (name) { return !!find(name); },
    isHold: function (name) { var ex = find(name); return !!(ex && ex.hold); },
    html: html,
    refresh: refresh
  };
})();
