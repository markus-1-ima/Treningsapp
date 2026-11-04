/* Øvelsesanimasjoner: 3D-figurer (WebGL) som beveger seg mellom nøkkelstillinger.
 * Strekfigurer i SVG brukes som reserve når nettleseren ikke kan tegne 3D.
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
    // Hvert bytte går via et hopp (midterste stilling), føttene lander samlet eller brede.
    { name: 'Jumping jacks', hi: ['legs', 'arms'], front: true, jump: true, tl: 6, seg: 0.26, k: [1, -1], e: [1, -1], p: [
      { h: [100, 54], t: -90, a: [89, 61], b: [111, 61], f: [94, 104], g: [106, 104], fa: 180, ga: 0 },
      { h: [100, 41], t: -90, a: [58, 13], b: [142, 13], f: [87, 90], g: [113, 90], fa: 120, ga: 60 },
      { h: [100, 58], t: -90, a: [84, -6], b: [116, -6], f: [78, 104], g: [122, 104], fa: 180, ga: 0 }] },

    { name: 'Høye knær', hi: ['legs'], cycle: true, seg: 0.24, p: [
      { h: [100, 54], t: -88, a: [118, 38], b: [84, 38], f: [100, 104], g: [121, 79], fa: 0, ga: 30 },
      { h: [100, 53], t: -88, a: [108, 46], b: [92, 46], f: [100, 104], g: [100, 104], fa: 0, ga: 0 },
      { h: [100, 54], t: -88, a: [84, 38], b: [118, 38], f: [121, 79], g: [100, 104], fa: 30, ga: 0 },
      { h: [100, 53], t: -88, a: [92, 46], b: [108, 46], f: [100, 104], g: [100, 104], fa: 0, ga: 0 }] },

    // Stå, hender i gulvet, planke, tilbake, sats, hopp med armene over hodet, land.
    // s = sekunder fra denne stillingen til neste. Beina skytes bakover og trekkes inn i ett raskt hopp,
    // så figuren ikke kryper på knærne mellom knebøy og planke.
    { name: 'Burpees', hi: ['legs', 'arms'], cycle: true, jump: true, arc: true, seg: 0.6, p: [
      { h: [96, 53], t: -90, a: [98, 58], b: [92, 58], f: [96, 104], fa: 0, s: 0.6 },
      { h: [80, 84], t: -10, a: [124, 104], b: [118, 104], f: [96, 104], fa: 0, s: 0.26 },
      { h: [88, 76], t: -15, a: [121, 104], b: [117, 104], f: [40, 78], fa: 40, s: 0.24 },
      { h: [89.9, 80.4], t: -16.3, a: [119, 104], b: [115, 104], f: [40, 95], fa: 80, s: 0.6 },
      { h: [88, 76], t: -15, a: [121, 104], b: [117, 104], f: [40, 78], fa: 40, s: 0.24 },
      { h: [80, 84], t: -10, a: [124, 104], b: [118, 104], f: [96, 104], fa: 0, s: 0.36 },
      { h: [90, 68], t: -75, a: [104, 68], b: [100, 68], f: [96, 104], fa: 0, s: 0.3 },
      { h: [96, 34], t: -90, a: [112, -30], b: [106, -30], f: [96, 84], fa: 70, s: 0.42 }] },

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

  // Rekvisitter i 3D: bokser [x, y, z, bredde, høyde, dybde], bakken er y = 0.
  var CHAIR3 = [[-54, 34.5, 0, 40, 3, 34], [-70, 16.5, 14, 3, 33, 3], [-70, 16.5, -14, 3, 33, 3], [-38, 16.5, 14, 3, 33, 3], [-38, 16.5, -14, 3, 33, 3], [-74, 50, 0, 3, 28, 34]];
  var LOWCHAIR3 = [[-63, 22.5, 0, 34, 3, 30], [-76, 10.5, 12, 3, 21, 3], [-76, 10.5, -12, 3, 21, 3], [-50, 10.5, 12, 3, 21, 3], [-50, 10.5, -12, 3, 21, 3], [-80, 37, 0, 3, 26, 30]];
  var WALL3 = [[-42, 60, 0, 4, 120, 90]];
  var STEP3 = [[21.5, 6, 0, 57, 12, 40]];

  var BY = {}, LC = {};
  var HI_WORDS = { legs: ['f', 'g'], arms: ['a', 'b'], core: ['torso'] };
  DEFS.forEach(function (ex) {
    ex.seg = ex.seg || 1.1;
    ex.k = ex.k || [-1, -1];
    ex.e = ex.e || [1, 1];
    ex.props = ex.props || '';
    ex.tl = ex.tl || TOE;
    ex.b3 = ex.props === CHAIR ? CHAIR3 : ex.props === LOWCHAIR ? LOWCHAIR3 : ex.props === WALL ? WALL3 : ex.props === STEP ? STEP3 : [];
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
  function mix(a, b, g, ex) {
    var o = {};
    ['h', 'a', 'b', 'f', 'g'].forEach(function (k) { o[k] = lerpPt(a[k], b[k], g); });
    ['t', 'd', 'bw', 'fa', 'ga'].forEach(function (k) { o[k] = a[k] + (b[k] - a[k]) * g; });
    // Forfra svinger armene i en bue rundt skulderen, i stedet for at hånden går i rett linje og knekker albuen.
    if (ex && (ex.front || ex.arc)) {
      var off = ex.front ? 6 : 0, dy = ex.front ? 2 : 0;
      var sh = function (p, side) { return [p.h[0] + L.torso * Math.cos(p.t * R) + side * off, p.h[1] + L.torso * Math.sin(p.t * R) + dy]; };
      [['a', -1], ['b', 1]].forEach(function (k) {
        var key = k[0], side = k[1];
        if (!a[key] || !b[key]) return;
        var sa = sh(a, side), sb = sh(b, side), so = sh(o, side);
        var va = [a[key][0] - sa[0], a[key][1] - sa[1]], vb = [b[key][0] - sb[0], b[key][1] - sb[1]];
        var aa = Math.atan2(va[1], va[0]), ab = Math.atan2(vb[1], vb[0]), dA = ab - aa;
        while (dA > Math.PI) dA -= 2 * Math.PI;
        while (dA < -Math.PI) dA += 2 * Math.PI;
        var ang = aa + dA * g, r = Math.hypot(va[0], va[1]) + (Math.hypot(vb[0], vb[1]) - Math.hypot(va[0], va[1])) * g;
        o[key] = [so[0] + r * Math.cos(ang), so[1] + r * Math.sin(ang)];
      });
    }
    return o;
  }

  function cycleLen(ex) { return ex.p.reduce(function (a, p) { return a + (p.s || ex.seg); }, 0); }
  function poseAt(ex, t) {
    var n = ex.p.length, u = t / ex.seg, i, j, s;
    if (ex.cycle) {
      var tot = cycleLen(ex), tt = t % tot, acc = 0;
      for (i = 0; i < n; i++) { var d = ex.p[i].s || ex.seg; if (tt < acc + d || i === n - 1) { s = Math.min(1, (tt - acc) / d); break; } acc += d; }
      j = (i + 1) % n;
    } else {
      var m = 2 * (n - 1);
      u = u % m;
      var k = Math.floor(u);
      s = u - k;
      if (k < n - 1) { i = k; j = k + 1; } else { i = m - k; j = m - k - 1; }
    }
    var g = Math.min(1, Math.max(0, (s - 0.12) / 0.76));   // liten pause i endestillingene
    g = g * g * (3 - 2 * g);
    return mix(ex.p[i], ex.p[j], g, ex);
  }

  // Skjelettet for én stilling: alle leddpunkter i 2D (etter eventuell speiling).
  function skeleton(ex, p) {
    var th = p.t * R, dh = p.d * R, hip = p.h;
    var neck = [hip[0] + L.torso * Math.cos(th), hip[1] + L.torso * Math.sin(th)];
    var head = [neck[0] + HEAD * Math.cos(dh), neck[1] + HEAD * Math.sin(dh)];
    var mid = [(hip[0] + neck[0]) / 2, (hip[1] + neck[1]) / 2];
    var ctl = [mid[0] + p.bw * Math.sin(th), mid[1] - p.bw * Math.cos(th)];
    var apex = [mid[0] + p.bw * Math.sin(th) / 2, mid[1] - p.bw * Math.cos(th) / 2];   // midt på den krumme ryggen
    var sa = neck, sb = neck, hf = hip, hg = hip;
    if (ex.front) {
      sa = [neck[0] - 6, neck[1] + 2]; sb = [neck[0] + 6, neck[1] + 2];
      hf = [hip[0] - 4, hip[1]]; hg = [hip[0] + 4, hip[1]];
    }
    function arm(s, hand, dir) {
      if (!hand) return null;
      var r = ik(s, hand, L.up, L.fore, dir);
      return [s, r[0], r[1]];
    }
    function leg(s, foot, dir, ang) {
      if (!foot) return null;
      var r = ik(s, foot, L.thigh, L.shin, dir);
      var toe = ex.toe !== false ? [r[1][0] + ex.tl * Math.cos(ang * R), r[1][1] + ex.tl * Math.sin(ang * R)] : null;
      return [s, r[0], r[1], toe];
    }
    var sk = {
      hip: hip, neck: neck, head: head, ctl: ctl, apex: apex, sa: sa, sb: sb, hf: hf, hg: hg,
      a: arm(sa, p.a, ex.e[0]), b: arm(sb, p.b, ex.e[1]),
      f: leg(hf, p.f, ex.k[0], p.fa), g: leg(hg, p.g, ex.k[1], p.ga),
      face: [-Math.sin(th), Math.cos(th)]                       // brystets retning, vinkelrett på overkroppen
    };
    if (ex.flip) {
      var m = function (q) { return q ? [200 - q[0], q[1]] : q; };
      ['hip', 'neck', 'head', 'ctl', 'apex', 'sa', 'sb', 'hf', 'hg'].forEach(function (k) { sk[k] = m(sk[k]); });
      ['a', 'b', 'f', 'g'].forEach(function (k) { if (sk[k]) sk[k] = sk[k].map(m); });
      sk.face = [-sk.face[0], sk.face[1]];
    }
    return sk;
  }

  // Strekfigur (SVG): brukes når 3D ikke er tilgjengelig, og til å beregne utsnittet.
  function shapes(ex, p) {
    var sk = skeleton(ex, p), pts = [], low = -1e9;
    var P = function (q) { pts.push([q[0], q[1]]); return r1(q[0]) + ' ' + r1(q[1]); };
    var parts = { torso: '', a: '', b: '', f: '', g: '' };
    parts.torso = 'M' + P(sk.hip) + 'Q' + r1(sk.ctl[0]) + ' ' + r1(sk.ctl[1]) + ' ' + P(sk.neck);
    pts.push(sk.apex);
    if (ex.front) parts.torso += 'M' + P(sk.sa) + 'L' + P(sk.sb) + 'M' + P(sk.hf) + 'L' + P(sk.hg);
    ['a', 'b'].forEach(function (k) { var A = sk[k]; if (A) parts[k] = 'M' + P(A[0]) + 'L' + P(A[1]) + 'L' + P(A[2]); });
    ['f', 'g'].forEach(function (k) {
      var F = sk[k];
      if (!F) return;
      var str = 'M' + P(F[0]) + 'L' + P(F[1]) + 'L' + P(F[2]);
      low = Math.max(low, F[2][1]);
      if (F[3]) { str += 'L' + P(F[3]); low = Math.max(low, F[3][1]); }
      parts[k] = str;
    });
    var out = { far: '', farHi: '', near: '', nearHi: '' };
    var nearKeys = ex.front ? ['torso', 'a', 'b', 'f', 'g'] : ['torso', 'a', 'f'];
    var farKeys = ex.front ? [] : ['b', 'g'];
    nearKeys.forEach(function (k) { out[ex.hiSet[k] ? 'nearHi' : 'near'] += parts[k]; });
    farKeys.forEach(function (k) { out[ex.hiSet[k] ? 'farHi' : 'far'] += parts[k]; });
    out.hx = r1(sk.head[0]); out.hy = r1(sk.head[1]);
    var lift = Math.max(0, (GY - 2) - low);
    out.sx = r1(sk.hip[0]); out.srx = r1(Math.max(5, 15 - lift * 0.45)); out.so = r1(Math.max(0.08, 0.32 - lift * 0.012) * 100) / 100;
    pts.push([sk.head[0] - HEAD_R, sk.head[1] - HEAD_R], [sk.head[0] + HEAD_R, sk.head[1] + HEAD_R]);
    out.pts = pts;
    return out;
  }

  // Beregner utsnittet som rommer hele bevegelsen, så figuren fyller bildet.
  function fit(ex) {
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    var total = ex.cycle ? cycleLen(ex) : 2 * (ex.p.length - 1) * ex.seg;
    function add(x, y) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    for (var k = 0; k < 48; k++) {
      var s = shapes(ex, poseAt(ex, total * k / 48));
      for (var i = 0; i < s.pts.length; i++) add(s.pts[i][0], s.pts[i][1]);
    }
    var fy0 = y0;                                              // toppen av figuren, uten rekvisitter
    if (ex.box) { add(ex.box[0], ex.box[1]); add(ex.box[2], ex.box[3]); }
    add(x0, GY + 3);
    var pad = 10, bw = x1 - x0 + 2 * pad, bh = y1 - y0 + 2 * pad;
    var H = Math.max(bh, bw * 134 / 150, 84), W = H * 150 / 134;
    ex.low = fy0 > 55;                                         // øvelse på gulvet: kameraet ser mer ovenfra
    return [r1((x0 + x1) / 2 - W / 2), r1(y1 + pad - H), r1(W), r1(H)];
  }
  DEFS.forEach(function (ex) { ex.vb = fit(ex); });

  /* ---------- 3D (WebGL) ---------- */
  // En liten egen motor: kuler, avsmalnende sylindre og bokser med lys, og skygger projisert på gulvet.
  // Én felles WebGL-flate tegner hver synlige animasjon og kopieres inn i kortets eget lerret.
  var G = null, G_TRIED = false;
  var VS = [
    'attribute vec3 aP; attribute vec3 aN;',
    'uniform mat4 uVP, uM; uniform vec2 uTaper; uniform float uCyl, uShad; uniform vec3 uLs;',
    'varying vec3 vN, vW;',
    'void main(){',
    '  vec3 p = aP;',
    '  if (uCyl > 0.5) p.xz *= mix(uTaper.x, uTaper.y, p.y);',
    '  vec4 w = uM * vec4(p, 1.0);',
    '  if (uShad > 0.5) { w.xyz += uLs * (-w.y / uLs.y); w.y = 0.06; }',
    '  vW = w.xyz; vN = mat3(uM[0].xyz, uM[1].xyz, uM[2].xyz) * aN;',
    '  gl_Position = uVP * w;',
    '}'].join('\n');
  var FS = [
    'precision mediump float;',
    'uniform vec3 uC, uCam, uL, uBg; uniform vec4 uShadC; uniform float uMode; uniform vec3 uFloor;',
    'varying vec3 vN, vW;',
    'void main(){',
    '  if (uMode > 1.5) { float d = length(vW.xz - uFloor.xy) / uFloor.z; gl_FragColor = vec4(mix(uC, uBg, smoothstep(0.35, 1.0, d)), 1.0); return; }',
    '  if (uMode > 0.5) { gl_FragColor = uShadC; return; }',
    '  vec3 N = normalize(vN), Ld = normalize(-uL), V = normalize(uCam - vW);',
    '  if (dot(N, V) < 0.0) N = -N;',
    '  float dif = max(dot(N, Ld), 0.0), hemi = 0.5 + 0.5 * N.y;',
    '  float spec = pow(max(dot(N, normalize(Ld + V)), 0.0), 28.0) * 0.22;',
    '  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.16;',
    '  gl_FragColor = vec4(uC * (0.34 + 0.24 * hemi + 0.55 * dif) + vec3(spec + rim), 1.0);',
    '}'].join('\n');

  function meshSphere(gl) {
    var P = [], I = [], la = 14, lo = 20;
    for (var i = 0; i <= la; i++) {
      var th = i * Math.PI / la;
      for (var j = 0; j <= lo; j++) {
        var ph = j * 2 * Math.PI / lo;
        P.push(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
      }
    }
    for (i = 0; i < la; i++) for (j = 0; j < lo; j++) {
      var a = i * (lo + 1) + j, b = a + lo + 1;
      I.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return mesh(gl, P, P, I);
  }
  function meshCyl(gl) {
    var P = [], N = [], I = [], seg = 18;
    for (var j = 0; j <= seg; j++) {
      var ph = j * 2 * Math.PI / seg, c = Math.cos(ph), s = Math.sin(ph);
      P.push(c, 0, s, c, 1, s); N.push(c, 0, s, c, 0, s);
    }
    for (j = 0; j < seg; j++) { var a = j * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    return mesh(gl, P, N, I);
  }
  function meshBox(gl) {
    var P = [], N = [], I = [];
    var F = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    F.forEach(function (n, f) {
      var u = n[1] !== 0 ? [1, 0, 0] : [0, 1, 0], v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) {
        P.push(n[0] + u[0] * q[0] + v[0] * q[1], n[1] + u[1] * q[0] + v[1] * q[1], n[2] + u[2] * q[0] + v[2] * q[1]);
        N.push(n[0], n[1], n[2]);
      });
      var b = f * 4; I.push(b, b + 1, b + 2, b, b + 2, b + 3);
    });
    return mesh(gl, P, N, I);
  }
  function meshQuad(gl) { return mesh(gl, [-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1], [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], [0, 1, 2, 0, 2, 3]); }
  function mesh(gl, P, N, I) {
    var pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(P), gl.STATIC_DRAW);
    var nb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, nb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(N), gl.STATIC_DRAW);
    var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(I), gl.STATIC_DRAW);
    return { p: pb, n: nb, i: ib, c: I.length };
  }

  function init3d() {
    if (G_TRIED) return !!G;
    G_TRIED = true;
    try {
      var cv = document.createElement('canvas');
      cv.width = 300; cv.height = 270;
      var gl = cv.getContext('webgl', { antialias: true, stencil: true, preserveDrawingBuffer: true, alpha: false });
      if (!gl) return false;
      // Mister nettleseren 3D-konteksten (f.eks. når appen ligger i bakgrunnen), bygges den opp igjen ved neste bilde.
      cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); G = null; G_TRIED = false; });
      function sh(type, src) {
        var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      }
      var pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
      gl.useProgram(pr);
      var u = {};
      ['uVP', 'uM', 'uTaper', 'uCyl', 'uShad', 'uLs', 'uL', 'uC', 'uCam', 'uBg', 'uShadC', 'uMode', 'uFloor'].forEach(function (n) { u[n] = gl.getUniformLocation(pr, n); });
      G = { cv: cv, gl: gl, u: u, aP: gl.getAttribLocation(pr, 'aP'), aN: gl.getAttribLocation(pr, 'aN'),
        m: { sph: meshSphere(gl), cyl: meshCyl(gl), box: meshBox(gl), quad: meshQuad(gl) }, bound: null, col: null, colAt: 0 };
      gl.enableVertexAttribArray(G.aP); gl.enableVertexAttribArray(G.aN);
      return true;
    } catch (e) {
      G = null;
      window.TB3D_ERROR = String(e && e.message || e);          // hjelper ved feilsøking i konsollen
      return false;
    }
  }

  // ---- små vektor- og matrisehjelpere (kolonnevis 4x4) ----
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add3(a, b, s) { return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function len(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }
  function norm(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cols(X, Y, Z, T) { return new Float32Array([X[0], X[1], X[2], 0, Y[0], Y[1], Y[2], 0, Z[0], Z[1], Z[2], 0, T[0], T[1], T[2], 1]); }
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function persp(fov, asp, n, f) {
    var t = 1 / Math.tan(fov / 2);
    return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]);
  }
  function lookAt(e, c) {
    var z = norm(sub(e, c)), x = norm(cross([0, 1, 0], z)), y = cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]);
  }
  // Ben mellom to punkter (sylinder fra A til B), kule, ellipsoide og boks.
  function mBone(A, B) {
    var Y = sub(B, A), yu = norm(Y);
    var ref = Math.abs(yu[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    var X = norm(cross(yu, ref)), Z = cross(X, yu);
    return cols(X, Y, Z, A);
  }
  function mSph(C, r) { return cols([r, 0, 0], [0, r, 0], [0, 0, r], C); }
  function mEll(C, up, side, sx, sy, sz) {
    var U = norm(up), F = norm(cross(U, side)), S = cross(F, U);
    return cols([F[0] * sx, F[1] * sx, F[2] * sx], [U[0] * sy, U[1] * sy, U[2] * sy], [S[0] * sz, S[1] * sz, S[2] * sz], C);
  }
  function mBox(b) { return cols([b[3] / 2, 0, 0], [0, b[4] / 2, 0], [0, 0, b[5] / 2], [b[0], b[1], b[2]]); }

  // Fargene hentes fra appens fargetema, så 3D-figuren følger lys og mørk modus.
  function hexRgb(s) {
    s = String(s || '').trim();
    var m = /^#([0-9a-f]{6})$/i.exec(s);
    if (m) { var n = parseInt(m[1], 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
    m = /rgba?\(([^)]+)\)/.exec(s);
    if (m) { var v = m[1].split(',').map(parseFloat); return [v[0] / 255, v[1] / 255, v[2] / 255]; }
    return [0.5, 0.5, 0.5];
  }
  function mixC(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function colors() {
    var now = Date.now();
    if (G.col && now - G.colAt < 1000) return G.col;
    var cs = getComputedStyle(document.documentElement);
    var bg = hexRgb(cs.getPropertyValue('--bg')), ink = hexRgb(cs.getPropertyValue('--ink')), line = hexRgb(cs.getPropertyValue('--line'));
    var dark = bg[0] + bg[1] + bg[2] < 1.2;
    G.col = {
      bg: bg,
      body: mixC(ink, bg, dark ? 0.38 : 0.5),
      hi: hexRgb(cs.getPropertyValue('--accent')),
      floor: mixC(bg, line, dark ? 0.7 : 0.9),
      prop: mixC(line, ink, dark ? 0.25 : 0.2),
      nose: mixC(ink, bg, dark ? 0.2 : 0.3),
      shadow: dark ? [0, 0, 0, 0.42] : [0.05, 0.1, 0.2, 0.2]
    };
    G.colAt = now;
    return G.col;
  }

  // Bygger alle kroppsdelene for én stilling som en liste med tegnekommandoer.
  function parts3d(ex, sk) {
    var V = function (q, z) { return [q[0] - 100, GY - q[1], z]; };
    var out = [];
    var push = function (k, M, grp, taper) { out.push({ k: k, M: M, g: grp, t: taper }); };
    var front = !!ex.front;
    var side = front ? [1, 0, 0] : [0, 0, 1];
    var zA = front ? 0 : 6.2, zL = front ? 0 : 3.6;
    var hip = V(sk.hip, 0), apex = V(sk.apex, 0), neck = V(sk.neck, 0), head = V(sk.head, 0);
    // Overkropp: bekken, rygg i to deler (følger krummingen) og bryst
    var up1 = sub(apex, hip), up2 = sub(neck, apex);
    if (len(up1) < 0.01) up1 = sub(neck, hip);
    if (len(up2) < 0.01) up2 = sub(neck, hip);
    push('ell', mEll(add3(hip, norm(up1), 1.2), up1, side, 4.6, 5.6, front ? 6.4 : 6.8), 'torso');
    push('cyl', mBone(hip, apex), 'torso', [4.5, 4.8]);
    push('cyl', mBone(apex, neck), 'torso', [4.8, 5.2]);
    push('ell', mEll(add3(apex, norm(up2), len(up2) * 0.55), up2, side, 5.6, 9.2, front ? 8.4 : 8.2), 'torso');
    // Hals, hode og nese (nesen viser hvilken vei figuren ser)
    push('cyl', mBone(neck, head), 'head', [2.4, 2.2]);
    push('sph', mSph(head, 6.1), 'head');
    var face = front ? [0, 0, 1] : [sk.face[0], -sk.face[1], 0];
    var hd = norm(sub(head, neck));
    push('sph', mSph(add3(add3(head, face, 5.4), hd, 0.6), 1.7), 'nose');
    // Armer og bein. Mangler armen eller beinet på andre siden, speiles den nære.
    function limbSet(key, src, s3, isArm) {
      var J = sk[key] || sk[src];
      if (!J) return;
      var z = s3;
      var S = front ? V(J[0], 0) : V(J[0], z), E = V(J[1], z), H = V(J[2], z);
      if (front && !isArm) {
        // Forfra bøyer knærne seg fremover mot kameraet, ikke ut til siden, og tærne peker fremover.
        var dv = sub(H, S), d = len(dv), u = norm(dv), mx = L.thigh + L.shin, dd = Math.min(d, mx - 0.01);
        var hh = Math.sqrt(Math.max(0, L.thigh * L.thigh - dd * dd / 4));
        if (d > mx * 0.93) hh *= Math.max(0, (mx - d) / (mx * 0.07));
        var fw = norm(sub([0, 0, 1], [u[0] * u[2], u[1] * u[2], u[2] * u[2]]));
        H = add3(S, u, dd);
        E = add3(add3(S, u, dd / 2), fw, hh);
        var lift = Math.max(0, Math.min(1, ((GY - 2) - J[2][1]) / 12)), pitch = lift * 50 * R;
        J = [J[0], J[1], J[2], null];
        var T0 = add3(H, [0, -Math.sin(pitch), Math.cos(pitch)], 8);
      }
      if (isArm) {
        push('sph', mSph(S, 3.2), key);
        push('cyl', mBone(S, E), key, [2.9, 2.4]);
        push('sph', mSph(E, 2.45), key);
        push('cyl', mBone(E, H), key, [2.35, 1.9]);
        push('sph', mSph(H, 2.4), key);
      } else {
        push('sph', mSph(S, 3.9), key);
        push('cyl', mBone(S, E), key, [4.0, 3.1]);
        push('sph', mSph(E, 3.15), key);
        push('cyl', mBone(E, H), key, [3.0, 2.2]);
        push('sph', mSph(H, 2.3), key);
        var T = J[3] ? V(J[3], z) : (front ? T0 : null);
        if (T) { push('cyl', mBone(H, T), key, [2.2, 1.6]); push('sph', mSph(T, 1.6), key); }
      }
    }
    limbSet('b', 'a', -zA, true); limbSet('g', 'f', -zL, false);
    limbSet('a', 'b', zA, true); limbSet('f', 'g', zL, false);
    ex.b3.forEach(function (b) { push('box', mBox(b), 'prop'); });
    return out;
  }

  var LDIR = norm([0.45, -1, -0.35]);
  function render3d(el, t) {
    var ex = BY[el.getAttribute('data-ex')];
    if (!ex || !G) return false;
    var cw = el.clientWidth, ch = el.clientHeight;
    if (!cw || !ch) return true;
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(cw * dpr), h = Math.round(ch * dpr);
    var cv = el.querySelector('canvas.c3');
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'c3'; cv.setAttribute('aria-hidden', 'true'); el.appendChild(cv); el.classList.add('is3d'); }
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    var gl = G.gl, u = G.u, C = colors();
    if (G.cv.width < w || G.cv.height < h) { G.cv.width = Math.max(G.cv.width, w); G.cv.height = Math.max(G.cv.height, h); }
    var gh = G.cv.height;

    var sk = skeleton(ex, reduce ? poseAt(ex, (+el.getAttribute('data-pose') || 0) * ex.seg) : poseAt(ex, t));
    var parts = parts3d(ex, sk);

    // Kamera: rettet mot midten av utsnittet, litt forfra og ovenfra, med en rolig sving
    var vb = ex.vb, cx = vb[0] + vb[2] / 2 - 100, cy = GY - (vb[1] + vb[3] / 2), centre = [cx, cy, 0];
    var fov = 30 * R, dist = (vb[3] / 2) / Math.tan(fov / 2) * 1.12;
    var az = ((ex.front ? 18 : 30) + (reduce ? 0 : 5 * Math.sin(t * 0.5))) * R, elv = (ex.low ? 22 : 12) * R;
    var eye = [cx + dist * Math.sin(az) * Math.cos(elv), cy + dist * Math.sin(elv), dist * Math.cos(az) * Math.cos(elv)];
    var VP = mul(persp(fov, w / h, 5, dist * 4), lookAt(eye, centre));

    gl.viewport(0, 0, w, h);
    gl.enable(gl.SCISSOR_TEST); gl.scissor(0, 0, w, h);
    gl.clearColor(C.bg[0], C.bg[1], C.bg[2], 1); gl.clearDepth(1); gl.clearStencil(0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true);
    gl.uniformMatrix4fv(u.uVP, false, VP);
    gl.uniform3fv(u.uL, LDIR); gl.uniform3fv(u.uLs, LDIR); gl.uniform3fv(u.uCam, eye); gl.uniform3fv(u.uBg, C.bg);
    gl.uniform4fv(u.uShadC, C.shadow);

    function bind(k) {
      if (G.bound === k) return;
      var m = G.m[k];
      gl.bindBuffer(gl.ARRAY_BUFFER, m.p); gl.vertexAttribPointer(G.aP, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.n); gl.vertexAttribPointer(G.aN, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.i);
      G.bound = k;
    }
    function draw(p, mode, col) {
      var k = p.k === 'ell' ? 'sph' : p.k;
      bind(k);
      gl.uniformMatrix4fv(u.uM, false, p.M);
      gl.uniform1f(u.uCyl, k === 'cyl' ? 1 : 0);
      if (p.t) gl.uniform2f(u.uTaper, p.t[0], p.t[1]); else gl.uniform2f(u.uTaper, 1, 1);
      gl.uniform1f(u.uShad, mode === 1 ? 1 : 0);
      gl.uniform1f(u.uMode, mode);
      if (col) gl.uniform3fv(u.uC, col);
      gl.drawElements(gl.TRIANGLES, G.m[k].c, gl.UNSIGNED_SHORT, 0);
    }
    // Gulv
    var fr = Math.max(vb[2], vb[3]) * 0.75;
    gl.uniform3f(u.uFloor, cx, 0, fr);
    draw({ k: 'quad', M: cols([fr, 0, 0], [0, 1, 0], [0, 0, fr], [cx, 0, 0]) }, 2, C.floor);
    // Skygger: hver piksel mørkes bare én gang (stencil)
    gl.depthMask(false);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.STENCIL_TEST); gl.stencilFunc(gl.EQUAL, 0, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
    parts.forEach(function (p) { draw(p, 1); });
    gl.disable(gl.STENCIL_TEST); gl.disable(gl.BLEND); gl.depthMask(true);
    // Figur og rekvisitter
    parts.forEach(function (p) {
      var col = p.g === 'prop' ? C.prop : p.g === 'nose' ? C.nose : (ex.hiSet[p.g] ? C.hi : C.body);
      draw(p, 0, col);
    });
    gl.disable(gl.SCISSOR_TEST);

    var ctx = cv.getContext('2d');
    ctx.drawImage(G.cv, 0, gh - h, w, h, 0, 0, w, h);
    return true;
  }

  /* ---------- tegning og tidsstyring ---------- */
  var perf = window.performance && window.performance.now ? window.performance : null;
  var T0 = perf ? perf.now() : 0;
  // Bare animasjoner som er på skjermen (eller like ved) tegnes.
  function near(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
    return r.width > 0 && r.bottom > -120 && r.top < vh + 120;
  }

  function drawSvg(el, tSec) {
    var ex = BY[el.getAttribute('data-ex')];
    if (!ex) return;
    var t = tSec;
    if (reduce) t = (+el.getAttribute('data-pose') || 0) * ex.seg;   // stillbilde, trykk bytter stilling
    var s = shapes(ex, poseAt(ex, t));
    var q = function (c) { return el.querySelector('.' + c); };
    var lf = q('lf'), lfh = q('lfh'), ln = q('ln'), lnh = q('lnh'), hd = q('hd');
    if (!lf || !lfh || !ln || !lnh || !hd) return;
    lf.setAttribute('d', s.far); lfh.setAttribute('d', s.farHi);
    ln.setAttribute('d', s.near); lnh.setAttribute('d', s.nearHi);
    hd.setAttribute('cx', s.hx); hd.setAttribute('cy', s.hy);
    var sh = q('sh');
    if (sh) { sh.setAttribute('cx', s.sx); sh.setAttribute('rx', s.srx); sh.setAttribute('opacity', s.so); }
  }
  function draw(el, tSec) {
    el.__done = true;
    if (init3d() && render3d(el, tSec)) return;
    drawSvg(el, tSec);
  }

  // Tegner det som er synlig. Med «redusert bevegelse» tegnes hvert bilde bare én gang.
  function refresh() {
    var list = document.querySelectorAll('.anim'), t = ((perf ? perf.now() : 0) - T0) / 1000;
    for (var i = 0; i < list.length; i++) if (near(list[i]) && !(reduce && list[i].__done)) draw(list[i], t);
  }

  var lastFrame = 0;
  function frame(now) {
    var list = document.querySelectorAll('.anim');
    if (!list.length) { setTimeout(function () { window.requestAnimationFrame(frame); }, 250); return; }
    if (now - lastFrame >= 32) {                              // rundt 30 bilder i sekundet er nok, og sparer batteri
      lastFrame = now;
      var t = (now - T0) / 1000;
      for (var i = 0; i < list.length; i++) if (near(list[i])) draw(list[i], t);
    }
    window.requestAnimationFrame(frame);
  }

  function html(name) {
    var ex = find(name);
    if (!ex) return '';
    return '<div class="anim" data-ex="' + esc(ex.name) + '" data-pose="0" data-seg="' + ex.seg + '" data-n="' + ex.p.length + '" data-cycle="' + (ex.cycle ? 1 : 0) + '" data-total="' + r1(ex.cycle ? cycleLen(ex) : 2 * (ex.p.length - 1) * ex.seg) + '"' +
      (reduce ? ' tabindex="0" title="Trykk for å bytte stilling"' : '') +
      ' role="img" aria-label="Animasjon av ' + esc(ex.name.toLowerCase()) + '">' +
      '<svg viewBox="' + ex.vb.join(' ') + '" aria-hidden="true" focusable="false">' +
      '<line class="gnd" x1="' + (ex.vb[0] - 20) + '" y1="' + GY + '" x2="' + (ex.vb[0] + ex.vb[2] + 20) + '" y2="' + GY + '"/>' + ex.props +
      (ex.jump ? '<ellipse class="sh" cx="-50" cy="' + (GY + 1) + '" rx="10" ry="2.2"/>' : '') +
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
    var st = null;
    var later = function () { clearTimeout(st); st = setTimeout(refresh, 120); };
    window.addEventListener('scroll', later, { passive: true });
    window.addEventListener('resize', function () { document.querySelectorAll('.anim').forEach(function (el) { el.__done = false; }); later(); });
  } else if (window.requestAnimationFrame) {
    window.requestAnimationFrame(frame);
  }

  window.TBAnim = {
    has: function (name) { return !!find(name); },
    isHold: function (name) { var ex = find(name); return !!(ex && ex.hold); },
    html: html,
    refresh: refresh,
    is3d: function () { return init3d(); }
  };
})();
