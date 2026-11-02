/* Øvelsesanimasjoner: strekfigurer som beveger seg mellom nøkkelstillinger.
 *
 * Hver øvelse har to eller flere stillinger. En stilling beskriver bare hofta (h),
 * overkroppens vinkel (t) og hvor hender (a, b) og føtter (f, g) står. Knær og albuer
 * regnes ut med todelt IK, så knokkellengdene er like i hele bevegelsen.
 *
 * Koordinater: viewBox 200 x 134 (y fra -14 til 120), bakken ligger på y = 106.
 * Vinkler i grader: 0 = høyre, -90 = opp, 90 = ned, 180 = venstre.
 */
(function () {
  'use strict';

  var GY = 106;
  var L = { torso: 30, thigh: 26, shin: 26, up: 16, fore: 16 };
  var TOE = 11, HEAD = 9;
  var R = Math.PI / 180;
  var reduce = false;
  try { reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { }

  var CHAIR = '<path class="prop" d="M26 70 L66 70 M30 70 L30 106 M62 70 L62 106 M26 70 L26 42"/>';
  var LOWCHAIR = '<path class="prop" d="M20 82 L54 82 M24 82 L24 106 M50 82 L50 106 M20 82 L20 56"/>';
  var WALL = '<path class="prop wall" d="M60 -12 L60 106"/>';
  var CHAIR_BOX = [26, 42, 66, 106], LOWCHAIR_BOX = [20, 56, 54, 106], WALL_BOX = [58, 30, 62, 106];

  // Standardverdier: k = knebøyning [f, g], e = albuebøyning [a, b]. +1 / -1 velger bøyeside.
  var DEFS = [
    { name: 'Armhevinger', p: [
      { h: [88, 83.2], t: -22, a: [117, 104], f: [40, 104] },
      { h: [91.5, 96.4], t: -8, a: [118, 104], f: [40, 104] }] },

    { name: 'Diamant-armhevinger', p: [
      { h: [88, 83.2], t: -22, a: [110, 104], f: [40, 104] },
      { h: [91, 97.5], t: -6, a: [110, 104], f: [40, 104] }] },

    { name: 'Dips på stol', props: CHAIR, box: CHAIR_BOX, p: [
      { h: [70, 68], t: -106, a: [55, 70], f: [105, 104] },
      { h: [70, 88], t: -106, a: [55, 70], f: [105, 104] }] },

    { name: 'Pike-armhevinger', flip: true, k: [1, 1], p: [
      { h: [104, 60], t: 145, a: [60, 106], f: [128, 104] },
      { h: [98, 64], t: 125, a: [64, 104], f: [128, 104] }] },

    { name: 'Knebøy', toe: true, p: [
      { h: [100, 53], t: -90, a: [122, 36], f: [100, 104] },
      { h: [78, 78.3], t: -65, a: [120, 52], f: [100, 104] }] },

    { name: 'Utfall', toe: true, p: [
      { h: [100, 53], t: -90, a: [96, 52], f: [100, 104], g: [100, 104] },
      { h: [92, 78], t: -90, a: [88, 70], f: [118, 104], g: [58, 102] }] },

    { name: 'Bulgarsk utfall', toe: true, props: LOWCHAIR, box: LOWCHAIR_BOX, p: [
      { h: [90, 58], t: -90, a: [86, 50], f: [112, 104], g: [46, 80] },
      { h: [91, 78.3], t: -88, a: [88, 70], f: [112, 104], g: [46, 80] }] },

    { name: 'Bekkenløft', p: [
      { h: [70, 103], t: 180, d: 180, a: [80, 104], f: [96, 104] },
      { h: [66, 79], t: 140, d: 172, a: [80, 104], f: [96, 104] }] },

    { name: 'Tåhev', toe: true, p: [
      { h: [99, 54], t: -90, a: [101, 60], f: [97, 104], fa: 0 },
      { h: [101, 44], t: -90, a: [103, 50], f: [102, 94], fa: 55 }] },

    { name: 'Vegg-sitt', hold: true, seg: 1.8, toe: true, props: WALL, box: WALL_BOX, p: [
      { h: [66, 78], t: -90, a: [84, 72], f: [92, 104] },
      { h: [66, 79.5], t: -90, a: [84, 73], f: [92, 104] }] },

    { name: 'Planke', hold: true, seg: 1.8, p: [
      { h: [91, 93.9], t: -11, a: [136, 104], f: [40, 104] },
      { h: [91, 92.6], t: -12.5, a: [136, 104], f: [40, 104] }] },

    { name: 'Sideplanke', hold: true, seg: 1.8, p: [
      { h: [91, 95], t: -13.6, a: [134, 104], b: [121, 52], f: [40, 104] },
      { h: [91, 93], t: -12.5, a: [134, 104], b: [121, 52], f: [40, 104] }] },

    { name: 'Dødbille', p: [
      { h: [70, 103], t: 180, a: [40, 64], b: [44, 64], f: [96, 77], g: [93, 79] },
      { h: [70, 103], t: 180, a: [10, 103], b: [44, 64], f: [96, 77], g: [128, 92] }] },

    { name: 'Bird dog', p: [
      { h: [70, 72], t: 0, d: 20, a: [102, 104], b: [106, 104], f: [45, 102], g: [49, 102] },
      { h: [70, 72], t: 0, d: 0, a: [140, 72], b: [106, 104], f: [45, 102], g: [10, 73] }] },

    { name: 'Superman', p: [
      { h: [70, 103], t: 0, d: 5, a: [145, 103.5], f: [10, 103.5] },
      { h: [70, 103], t: -12, d: -28, a: [140, 86], f: [10, 88] }] },

    { name: 'Jumping jacks', seg: 0.45, k: [1, -1], e: [1, -1], p: [
      { h: [100, 53], t: -90, a: [90, 52], b: [110, 52], f: [94, 104], g: [106, 104] },
      { h: [100, 57], t: -90, a: [84, -6], b: [116, -6], f: [78, 104], g: [122, 104] }] },

    { name: 'Høye knær', seg: 0.35, toe: true, p: [
      { h: [100, 55], t: -88, a: [118, 38], b: [84, 38], f: [100, 104], g: [121, 80] },
      { h: [100, 53], t: -88, a: [84, 38], b: [118, 38], f: [121, 80], g: [100, 104] }] },

    { name: 'Burpees', cycle: true, seg: 0.75, toe: true, p: [
      { h: [96, 53], t: -90, a: [98, 58], b: [92, 58], f: [96, 104] },
      { h: [80, 84], t: -10, a: [124, 104], b: [118, 104], f: [96, 104] },
      { h: [88, 84.4], t: -22, a: [117, 104], b: [113, 104], f: [40, 104] },
      { h: [80, 84], t: -10, a: [124, 104], b: [118, 104], f: [96, 104] },
      { h: [96, 50], t: -90, a: [112, -14], b: [80, -14], f: [96, 100] }] },

    { name: 'Katt-ku', seg: 1.6, p: [
      { h: [70, 73], t: 0, d: 70, bw: 26, a: [102, 104], f: [45, 102] },
      { h: [70, 73], t: 0, d: -25, bw: -20, a: [102, 104], f: [45, 102] }] },

    { name: 'Hoftebøyer-strekk', hold: true, seg: 1.8, p: [
      { h: [84, 80], t: -90, a: [80, 70], b: [86, 70], f: [116, 104], g: [44, 102] },
      { h: [92, 82], t: -92, a: [96, 12], b: [88, 12], f: [116, 104], g: [48, 102] }] },

    { name: 'Hamstring-strekk', hold: true, seg: 1.8, p: [
      { h: [60, 103], t: -90, a: [80, 96], f: [112, 103], g: [82, 103] },
      { h: [60, 103], t: -40, a: [108, 99], f: [112, 103], g: [82, 103] }] }
  ];

  var BY = {}, LC = {};
  DEFS.forEach(function (ex) {
    ex.seg = ex.seg || 1.1;
    ex.k = ex.k || [-1, -1];
    ex.e = ex.e || [1, 1];
    ex.props = ex.props || '';
    ex.p.forEach(function (p) {
      if (p.d == null) p.d = p.t;
      if (p.bw == null) p.bw = 0;
      if (p.fa == null) p.fa = 0;
    });
    BY[ex.name] = ex;
    LC[ex.name.toLowerCase()] = ex;
  });

  // Beregner utsnittet (viewBox) som rommer hele bevegelsen, så figuren fyller bildet.
  function fit(ex) {
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, total = ex.cycle ? ex.p.length * ex.seg : 2 * (ex.p.length - 1) * ex.seg;
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

  function find(name) { return LC[String(name || '').trim().toLowerCase()] || null; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // To ledd fra p mot mål tgt. dir velger hvilken side leddet bøyer mot.
  function ik(p, tgt, l1, l2, dir) {
    var dx = tgt[0] - p[0], dy = tgt[1] - p[1];
    var d = Math.sqrt(dx * dx + dy * dy) || 0.001;
    var max = l1 + l2, soft = max * 0.93;
    var dd = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.01), max - 0.01);
    var ux = dx / d, uy = dy / d;
    var a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
    var h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    if (d > soft) h *= Math.max(0, (max - d) / (max - soft));   // nesten strukket lem blir rett
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
    ['t', 'd', 'bw', 'fa'].forEach(function (k) { o[k] = a[k] + (b[k] - a[k]) * g; });
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
    var far = [], near = [];
    near.push('M' + P(hip) + 'Q' + P(ctl) + ' ' + P(neck));
    pts.pop(); pts.pop(); pts.pop();                                   // kontrollpunktet ligger utenfor kurven
    pts.push([fx(hip[0]), hip[1]], [fx(neck[0]), neck[1]],
      [fx((hip[0] + neck[0]) / 2 + p.bw * Math.sin(th) / 2), (hip[1] + neck[1]) / 2 - p.bw * Math.cos(th) / 2]);
    function arm(hand, dir, list) {
      if (!hand) return;
      var r = ik(neck, hand, L.up, L.fore, dir);
      list.push('M' + P(neck) + 'L' + P(r[0]) + 'L' + P(r[1]));
    }
    function leg(foot, dir, list) {
      if (!foot) return;
      var r = ik(hip, foot, L.thigh, L.shin, dir);
      var s = 'M' + P(hip) + 'L' + P(r[0]) + 'L' + P(r[1]);
      if (ex.toe) { var a = p.fa * R; s += 'L' + P([r[1][0] + TOE * Math.cos(a), r[1][1] + TOE * Math.sin(a)]); }
      list.push(s);
    }
    arm(p.b, ex.e[1], far); leg(p.g, ex.k[1], far);
    arm(p.a, ex.e[0], near); leg(p.f, ex.k[0], near);
    pts.push([fx(head[0]) - 7, head[1] - 7], [fx(head[0]) + 7, head[1] + 7]);
    return { far: far.join(''), near: near.join(''), hx: r1(fx(head[0])), hy: r1(head[1]), pts: pts };
  }

  DEFS.forEach(function (ex) { ex.vb = fit(ex); });

  var T0 = (window.performance && performance.now) ? performance.now() : 0;
  var nowSec = function () { return ((window.performance && performance.now) ? performance.now() : 0) - T0; };

  function draw(el, tSec) {
    var ex = BY[el.getAttribute('data-ex')];
    if (!ex) return;
    var t = tSec;
    if (reduce) t = (+el.getAttribute('data-pose') || 0) * ex.seg;   // stillbilde, trykk bytter stilling
    var s = shapes(ex, poseAt(ex, t));
    var far = el.querySelector('.far'), near = el.querySelector('.near'), hd = el.querySelector('.hd');
    if (!far || !near || !hd) return;
    far.setAttribute('d', s.far);
    near.setAttribute('d', s.near);
    hd.setAttribute('cx', s.hx);
    hd.setAttribute('cy', s.hy);
  }

  function refresh() {
    var list = document.querySelectorAll('.anim'), t = nowSec() / 1000;
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
      '<path class="far" d=""/><path class="near" d=""/><circle class="hd" r="7" cx="-20" cy="-20"/></svg></div>';
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
