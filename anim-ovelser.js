/* Animasjoner til øvelsene i øvelsesbanken (ovelser-data.js).
 * Leses av anim.js, som forklarer stillingene øverst i fila. Koordinater: y nedover, gulvet er y = 106.
 *
 * Ekstra felter her:
 *   like  = bygg på en annen øvelse (kopierer alt, fx kan justere hver stilling)
 *   use   = ferdig rekvisitt fra anim.js: CHAIR, LOWCHAIR, WALL, STEP, BENCH, SEAT
 *   pr    = rekvisitter: ['box', x0, y0, x1, y1, z, dybde, rotasjon], ['cyl', x, y, r, z0, z1],
 *           ['rod', x0, y0, x1, y1, r, z], ['ball', x, y, r, z]. Siste element kan være en farge: 'pad', 'steel', 'iron', 'wood', 'water'.
 *   att   = ting som følger kroppen: kb (kettlebell), db (manual), mb (medisinball), cab (kabel/strikk), band2, bandback,
 *           grip (kort stang), pole (skistav), ski, wheel (maghjul), pad, plate, seat, torsopad, landmine, rope (hoppetau), ropes
 *   front = sett forfra, kneeOut = knærne går ut til siden (brede knebøy), rax = akse for ra/rb/rf/rg, rabs = rotasjon uten speiling
 */
(function () {
  var X = [];
  function add(d) { X.push(d); }
  function o(base, m) { var r = {}, k; for (k in base) r[k] = base[k]; for (k in m) r[k] = m[k]; return r; }

  // Rekvisitter som brukes flere steder
  var FLATBENCH = [['box', 60, 82, 118, 87, 0, 13], ['rod', 66, 87, 66, 106, 2, 0], ['rod', 112, 87, 112, 106, 2, 0]];
  var BENCHP = [-0.25, -0.75, 1];                // albuene ut til siden og ned i press på benk
  function inclineBench(deg) {                 // sete + skrå ryggstø som stiger mot høyre
    var r = deg * Math.PI / 180, cx = 72 + 19 * Math.cos(r), cy = 86 - 19 * Math.sin(r);
    return [['box', 52, 86, 80, 91, 0, 13], ['box', cx - 19, cy - 2.5, cx + 19, cy + 2.5, 0, 13, -deg],
      ['rod', 66, 91, 66, 106, 2, 0], ['rod', cx + 8, cy + 6, cx + 8, 106, 2, 0]];
  }
  function cableTower(x, top) { return [['box', x - 4, top, x + 4, 106, 0, 8], ['ball', x, top + 2, 2.6, 0, 'steel']]; }
  var PULLBAR = [['cyl', 100, -22, 1.2, -30, 30, 'steel'], ['rod', 100, -22, 100, 106, 1.6, -30], ['rod', 100, -22, 100, 106, 1.6, 30]];

  // ================= Bryst =================
  add({ name: 'Skrå benkpress', hi: ['arms'], bar: 'barbell', az: 13, faceUp: true, k: [1, 1], e: [-1, -1], pole: [-0.5, -0.6, 1], legZ: 9, cam: [34, 18], pr: inclineBench(35), p: [
    { h: [72, 82], t: -35, d: -40, a: [97, 36], f: [48, 104], fa: 180 },
    { h: [72, 82], t: -35, d: -40, a: [89, 61], f: [48, 104], fa: 180 }] });
  add({ name: 'Skrå manualpress', like: 'Skrå benkpress', bar: 'dumbbell', az: 11 });
  add({ name: 'Nedoverskrå benkpress', hi: ['arms'], bar: 'barbell', az: 13, faceUp: true, k: [1, 1], e: [-1, -1], pole: [-0.1, -0.8, 1], cam: [34, 18],
    pr: [['box', 54, 76.5, 104, 81.5, 0, 13, 15], ['rod', 66, 80, 66, 106, 2, 0], ['rod', 96, 86, 96, 106, 2, 0], ['cyl', 42, 88, 2.8, -9, 9, 'pad'], ['rod', 42, 88, 52, 106, 1.6, 0]],
    p: [
      { h: [66, 72], t: 15, d: 10, a: [95, 48], f: [40, 86], fa: 170 },
      { h: [66, 72], t: 15, d: 10, a: [89, 75], f: [40, 86], fa: 170 }] });
  add({ name: 'Benkpress med manualer', like: 'Benkpress', bar: 'dumbbell', az: 13, fx: function (q, i) { q.a = i ? [97, 73] : [100, 48]; } });
  add({ name: 'Gulvpress', hi: ['arms'], bar: 'barbell', az: 13, faceUp: true, k: [1, 1], e: [-1, -1], pole: [-0.2, -1, 0.9], legZ: 6, cam: [34, 22], p: [
    { h: [70, 100], t: 0, d: -8, a: [100, 70], f: [42, 104], fa: 180 },
    { h: [70, 100], t: 0, d: -8, a: [96, 88], f: [42, 104], fa: 180 }] });
  add({ name: 'Flyes med manualer', hi: ['arms'], bar: 'dumbbell', az: 5, faceUp: true, k: [1, 1], e: [-1, -1], legZ: 11, cam: [34, 20], pr: FLATBENCH, p: [
    { h: [70, 80], t: 0, d: -8, a: [101, 50], ra: 0, f: [50, 104], fa: 180 },
    { h: [70, 80], t: 0, d: -8, a: [101, 52], ra: 74, f: [50, 104], fa: 180 }] });
  add({ name: 'Kabelkryss', hi: ['arms'], rax: [0, 1], az: 6, cam: [40, 14],
    pr: [['box', 84, -2, 92, 106, -40, 8], ['box', 84, -2, 92, 106, 40, 8]],
    att: [{ t: 'cab', from: 'ab', to: [88, 4], mz: 40 }, { t: 'db', at: 'ab', dir: 'y', r: 1.4 }],
    p: [
      { h: [98, 54], t: -78, a: [128, 34], ra: 78, f: [110, 104], g: [86, 104] },
      { h: [98, 54], t: -78, a: [128, 40], ra: 4, f: [110, 104], g: [86, 104] }] });
  var MSEAT = [['box', 74, 80, 106, 86, 0, 22, 0, 'pad'], ['box', 70, 38, 76, 80, 0, 18, 0, 'pad'], ['rod', 90, 86, 90, 106, 2.2, 0], ['box', 78, 103, 102, 106, 0, 24]];
  add({ name: 'Butterfly i maskin', hi: ['arms'], rax: [0, 1], pr: MSEAT, att: [{ t: 'db', at: 'ab', dir: 'y', r: 1.3 }], p: [
    { h: [86, 76], t: -90, a: [114, 52], ra: 80, f: [114, 104] },
    { h: [86, 76], t: -90, a: [114, 52], ra: 6, f: [114, 104] }] });
  add({ name: 'Brystpress i maskin', hi: ['arms'], pr: MSEAT, az: 9, e: [1, 1], pole: [-0.3, -0.5, 1],
    att: [{ t: 'db', at: 'ab', dir: 'y', r: 1.3 }, { t: 'cab', from: 'ab', to: [80, 14], r: 1.1 }], p: [
    { h: [86, 76], t: -90, a: [100, 48], f: [114, 104] },
    { h: [86, 76], t: -90, a: [117, 47], f: [114, 104] }] });
  add({ name: 'Armhevinger på knærne', hi: ['arms'], az: 9, pole: [-1, 0.5, 0.8], p: [
    { h: [80, 88], t: -26, a: [108, 104], f: [34, 96], fa: 150 },
    { h: [82, 95], t: -8, a: [108, 104], f: [36, 94], fa: 150 }] });
  add({ name: 'Skrå armhevinger', hi: ['arms'], az: 9, pole: [-1, 0.5, 0.8], pr: [['box', 112, 84, 150, 106, 0, 30]], p: [
    { h: [84, 71], t: -28, a: [122, 84], f: [40, 100], fa: 80 },
    { h: [86, 78], t: -17, a: [122, 84], f: [40, 100], fa: 80 }] });
  add({ name: 'Armhevinger med beina høyt', hi: ['arms'], az: 9, pole: [-1, 0.5, 0.8], pr: [['box', 18, 84, 56, 106, 0, 30]], p: [
    { h: [94, 74.5], t: -3, a: [124, 104], f: [42, 77], fa: 40 },
    { h: [93, 86.4], t: 10, a: [124, 104], f: [42, 77], fa: 40 }] });
  add({ name: 'Brede armhevinger', like: 'Armhevinger', az: 13, pole: [-0.6, 0.5, 1] });
  add({ name: 'Armhevinger med strikk', like: 'Armhevinger', att: [{ t: 'bandback' }] });
  add({ name: 'Dips', hi: ['arms'], az: 11, air: false, e: [-1, -1], pole: [-1, 0, 0.3],
    pr: [['rod', 80, 42, 126, 42, 1.3, 11, 'steel'], ['rod', 80, 42, 126, 42, 1.3, -11, 'steel'],
      ['rod', 84, 42, 84, 106, 1.5, 11], ['rod', 84, 42, 84, 106, 1.5, -11], ['rod', 122, 42, 122, 106, 1.5, 11], ['rod', 122, 42, 122, 106, 1.5, -11]],
    p: [
      { h: [94.8, 40.5], t: -80, a: [100, 42], f: [78, 84], fa: 60 },
      { h: [93.7, 58.2], t: -70, a: [100, 42], f: [77, 101], fa: 60 }] });
  add({ name: 'Pullover med manual', hi: ['arms', 'core'], att: [{ t: 'db', at: 'a', dir: 'z' }], az: 2.5, faceUp: true, k: [1, 1], e: [-1, -1], legZ: 11, cam: [34, 20], pr: FLATBENCH, p: [
    { h: [70, 80], t: 0, d: -8, a: [101, 50], f: [50, 104], fa: 180 },
    { h: [70, 80], t: 0, d: -8, a: [128, 70], f: [50, 104], fa: 180 }] });
  add({ name: 'Brystpress med strikk', hi: ['arms'], az: 7, e: [-1, -1], pole: [-0.4, -0.4, 1], att: [{ t: 'cab', from: 'ab', to: [62, 30], band: true }],
    pr: [['box', 56, -10, 62, 106, 0, 10]], p: [
      { h: [100, 53], t: -88, a: [106, 34], f: [110, 104], g: [88, 104] },
      { h: [101, 53], t: -86, a: [131, 30], f: [110, 104], g: [88, 104] }] });

  // ================= Rygg =================
  add({ name: 'Rack pulls', hi: ['legs', 'core'], bar: 'barbell', az: 8,
    pr: [['box', 92, 83, 116, 106, 19.5, 6, 0, 'wood'], ['box', 92, 83, 116, 106, -19.5, 6, 0, 'wood']], p: [
      { h: [84, 64], t: -45, a: [104, 74], f: [100, 104] },
      { h: [96, 53], t: -88, a: [99, 90], f: [100, 104] }] });
  add({ name: 'Pullups', hi: ['arms'], az: 13, e: [-1, -1], pr: PULLBAR, p: [
    { h: [102.6, 38.9], t: -95, d: -95, a: [100, -22], f: [94, 86], fa: 70 },
    { h: [100.6, 16], t: -95, d: -92, a: [100, -22], f: [92, 63], fa: 70 }] });
  add({ name: 'Chinups', like: 'Pullups', az: 6.5 });
  add({ name: 'Pullups med strikk', like: 'Pullups', att: [{ t: 'cab', from: 'f', to: [100, -22, 0], band: true }] });
  add({ name: 'Negative pullups', like: 'Pullups', cycle: true, fx: function (q, i) { q.s = i === 0 ? 0.6 : 2.6; }, p: [
    { h: [102.6, 38.9], t: -95, d: -95, a: [100, -22], f: [94, 86], fa: 70 },
    { h: [100.6, 16], t: -95, d: -92, a: [100, -22], f: [92, 63], fa: 70 }] });
  add({ name: 'Muscle-up', hi: ['arms', 'core'], az: 11, e: [-1, -1], pr: PULLBAR, seg: 0.8, p: [
    { h: [102.6, 38.9], t: -95, d: -95, a: [100, -22], f: [94, 86], fa: 70 },
    { h: [97, 12], t: -84, d: -80, a: [100, -22], f: [88, 60], fa: 70 },
    { h: [96, -4], t: -62, d: -40, a: [100, -22], f: [80, 42], fa: 60 },
    { h: [98, -24], t: -88, d: -88, a: [100, -22], f: [96, 22], fa: 70 }] });
  add({ name: 'Smalt nedtrekk', like: 'Nedtrekk', bar: '', cable: false, az: 3, att: [{ t: 'grip', half: 5, to: [100, -30] }] });
  add({ name: 'Rett-arm-nedtrekk', hi: ['arms', 'core'], az: 9, pr: cableTower(146, -26), att: [{ t: 'grip', half: 9, to: [146, -22] }], p: [
    { h: [96, 54], t: -70, a: [131, 8], f: [104, 104], g: [92, 104] },
    { h: [96, 54], t: -72, a: [112, 56], f: [104, 104], g: [92, 104] }] });
  add({ name: 'Pendlay-roing', hi: ['arms', 'core'], bar: 'barbell', az: 9, cycle: true, p: [
    { h: [76, 66], t: -5, a: [106, 95], f: [98, 104], s: 0.5 },
    { h: [76, 66], t: -5, a: [99, 72], f: [98, 104], s: 0.9 }] });
  add({ name: 'Enarms roing med manual', hi: ['arms', 'core'], att: [{ t: 'db', at: 'a' }],
    pr: [['box', 36, 78, 112, 84, -7, 14, 0, 'pad'], ['rod', 44, 84, 44, 106, 2, -7], ['rod', 104, 84, 104, 106, 2, -7]],
    p: [
      { h: [70, 49], t: -5, a: [100, 79], b: [104, 77], f: [82, 102], g: [44, 76], ga: 180 },
      { h: [70, 49], t: -5, a: [84, 58], b: [104, 77], f: [82, 102], g: [44, 76], ga: 180 }] });
  add({ name: 'Sittende kabelroing', hi: ['arms', 'core'], az: 3, k: [1, 1],
    pr: [['box', 60, 98, 154, 104, 0, 18], ['box', 62, 91, 86, 98, 0, 16, 0, 'pad'], ['box', 120, 82, 124, 102, 0, 20, -10], ['box', 146, 70, 160, 104, 0, 22]],
    att: [{ t: 'grip', half: 4, to: [148, 90] }], p: [
      { h: [74, 87], t: -55, a: [128, 72], f: [120, 92], fa: -80 },
      { h: [74, 87], t: -96, a: [96, 70], f: [120, 92], fa: -80 }] });
  add({ name: 'T-bar-roing', hi: ['arms', 'core'], az: 3, att: [{ t: 'landmine', at: 'mid', to: [30, 104] }], p: [
    { h: [82, 58], t: -30, a: [106, 76], f: [100, 104], g: [100, 104] },
    { h: [82, 58], t: -30, a: [100, 60], f: [100, 104], g: [100, 104] }] });
  add({ name: 'Roing i maskin', hi: ['arms'], az: 8, e: [1, 1], att: [{ t: 'torsopad', chest: true }, { t: 'db', at: 'ab', dir: 'y', r: 1.3 }, { t: 'cab', from: 'ab', to: [134, 70], r: 1.1 }],
    pr: [['box', 66, 80, 96, 86, 0, 22, 0, 'pad'], ['rod', 80, 86, 80, 106, 2.2, 0], ['box', 130, 30, 138, 106, 0, 28], ['rod', 105, 50, 132, 50, 1.4, 0]],
    p: [
      { h: [80, 76], t: -82, a: [116, 46], f: [108, 104] },
      { h: [80, 76], t: -82, a: [90, 50], f: [108, 104] }] });
  add({ name: 'Omvendt roing', hi: ['arms', 'core'], az: 9,
    pr: [['cyl', 104, 60, 1.2, -30, 30, 'steel'], ['rod', 104, 60, 104, 106, 1.8, -30], ['rod', 104, 60, 104, 106, 1.8, 30]], p: [
      { h: [75.4, 95.7], t: -9.3, a: [104, 60], f: [24, 101], fa: -70 },
      { h: [70.2, 80.2], t: -27, a: [104, 60], f: [24, 101], fa: -70 }] });
  add({ name: 'Renegade row', hi: ['arms', 'core'], az: 8, att: [{ t: 'db', at: 'ab' }], cycle: true, seg: 0.7, p: [
    { h: [89.9, 79.4], t: -16.3, a: [119, 101], b: [119, 101], f: [40, 95], fa: 80 },
    { h: [89.9, 79.4], t: -16.3, a: [106, 84], b: [119, 101], f: [40, 95], fa: 80 },
    { h: [89.9, 79.4], t: -16.3, a: [119, 101], b: [119, 101], f: [40, 95], fa: 80 },
    { h: [89.9, 79.4], t: -16.3, a: [119, 101], b: [106, 84], f: [40, 95], fa: 80 }] });
  add({ name: 'Roing med strikk', hi: ['arms'], az: 7, att: [{ t: 'cab', from: 'ab', to: [150, 40], band: true }], pr: [['box', 150, -6, 156, 106, 0, 10]], p: [
    { h: [98, 53], t: -86, a: [127, 40], f: [108, 104], g: [88, 104] },
    { h: [97, 53], t: -90, a: [101, 46], f: [108, 104], g: [88, 104] }] });
  add({ name: 'Skuldertrekk', hi: ['arms'], bar: 'dumbbell', az: 10, p: [
    { h: [100, 53], t: -90, a: [101, 54], f: [100, 104], sy: 0 },
    { h: [100, 53], t: -90, a: [101, 47], f: [100, 104], sy: 6.5 }] });
  add({ name: 'Ryggekstensjon', hi: ['core', 'legs'], k: [1, 1],
    pr: [['box', 72, 64, 92, 70, 0, 18, -45, 'pad'], ['cyl', 46, 95, 2.6, -9, 9, 'pad'], ['box', 30, 99, 54, 103, 0, 22, -45],
      ['rod', 82, 70, 60, 106, 2, 0], ['rod', 46, 95, 40, 106, 1.6, 0], ['box', 30, 103, 96, 106, 0, 24]],
    p: [
      { h: [77, 63], t: 70, d: 80, a: [80, 85], f: [40, 100], fa: -45 },
      { h: [77, 63], t: -45, d: -45, a: [96, 51], f: [40, 100], fa: -45 }] });

  // ================= Skuldre =================
  add({ name: 'Skulderpress med manualer', like: 'Skulderpress', bar: 'dumbbell', az: 11, fx: function (q, i) { q.a = i ? [101, -10] : [103, 22]; } });
  add({ name: 'Arnoldpress', hi: ['arms'], bar: 'dumbbell', e: [1, 1], p: [
    { h: [100, 53], t: -90, a: [108, 20], az: 3.5, f: [100, 104] },
    { h: [100, 53], t: -90, a: [101, -10], az: 12, f: [100, 104] }] });
  add({ name: 'Skulderpress i maskin', hi: ['arms'], az: 11, att: [{ t: 'db', at: 'ab', dir: 'x', r: 1.3 }],
    pr: [['box', 74, 80, 106, 86, 0, 22, 0, 'pad'], ['box', 70, 34, 76, 80, 0, 18, 0, 'pad'], ['rod', 90, 86, 90, 106, 2.2, 0], ['box', 78, 103, 102, 106, 0, 24], ['rod', 70, -6, 70, 34, 1.6, 0]],
    p: [
      { h: [86, 76], t: -90, a: [90, 46], f: [114, 104] },
      { h: [86, 76], t: -90, a: [87, 15], f: [114, 104] }] });
  add({ name: 'Push press', hi: ['arms', 'legs'], bar: 'barbell', az: 9.5, cycle: true, p: [
    { h: [100, 53], t: -90, a: [107, 20], f: [100, 104], s: 0.45 },
    { h: [97, 60], t: -88, a: [106, 27], f: [100, 104], s: 0.25 },
    { h: [100, 51], t: -90, a: [104, 2], f: [100, 102], fa: 25, s: 0.35 },
    { h: [100, 53], t: -90, a: [102, -12], f: [100, 104], s: 0.9 }] });
  add({ name: 'Landmine-press', hi: ['arms'], att: [{ t: 'landmine', at: 'a', to: [182, 104] }], p: [
    { h: [96, 54], t: -82, a: [106, 26], b: [96, 52], f: [106, 104], g: [80, 104] },
    { h: [96, 54], t: -80, a: [126, 2], b: [96, 52], f: [106, 104], g: [80, 104] }] });
  add({ name: 'Z-press', hi: ['arms', 'core'], bar: 'barbell', az: 9.5, p: [
    { h: [70, 101], t: -90, a: [77, 70], f: [122, 102], fa: -90 },
    { h: [70, 101], t: -90, a: [72, 38], f: [122, 102], fa: -90 }] });
  add({ name: 'Håndstående armhevinger', hi: ['arms'], az: 9, k: [1, 1], e: [1, 1], pr: [['box', 78, -30, 82, 106, 0, 50]], p: [
    { h: [101, 43], t: 90, d: 90, a: [100, 104], f: [86, -8], fa: -90 },
    { h: [103, 61], t: 90, d: 90, a: [100, 104], f: [86, 10], fa: -90 }] });
  add({ name: 'Sidehev', hi: ['arms'], front: true, arc: true, bar: 'dumbbell', p: [
    { h: [100, 54], t: -90, a: [92, 54], b: [108, 54], f: [96, 104], g: [104, 104] },
    { h: [100, 54], t: -90, a: [63, 29], b: [137, 29], f: [96, 104], g: [104, 104] }] });
  add({ name: 'Sidehev i kabel', hi: ['arms'], front: true, arc: true, pr: cableTower(138, 70).concat([]),
    att: [{ t: 'cab', from: 'a', to: [138, 100, 0] }, { t: 'db', at: 'a', dir: 'z', r: 1.2 }], p: [
      { h: [100, 54], t: -90, a: [102, 58], b: [114, 52], f: [96, 104], g: [104, 104] },
      { h: [100, 54], t: -90, a: [63, 29], b: [114, 52], f: [96, 104], g: [104, 104] }] });
  add({ name: 'Fronthev', hi: ['arms'], bar: 'dumbbell', arc: true, p: [
    { h: [100, 53], t: -90, a: [103, 54], f: [100, 104] },
    { h: [100, 53], t: -90, a: [131, 23], f: [100, 104] }] });
  add({ name: 'Omvendt flyes', hi: ['arms'], bar: 'dumbbell', az: 6.5, p: [
    { h: [80, 58], t: -15, a: [109, 81], ra: 0, f: [98, 104] },
    { h: [80, 58], t: -15, a: [109, 80], ra: 82, f: [98, 104] }] });
  add({ name: 'Omvendt butterfly', hi: ['arms'], rax: [0, 1], att: [{ t: 'torsopad', chest: true }, { t: 'db', at: 'ab', dir: 'y', r: 1.3 }],
    pr: [['box', 74, 80, 106, 86, 0, 22, 0, 'pad'], ['rod', 90, 86, 90, 106, 2.2, 0], ['box', 78, 103, 102, 106, 0, 24]], p: [
      { h: [86, 76], t: -86, a: [117, 46], ra: 4, f: [112, 104] },
      { h: [86, 76], t: -86, a: [117, 46], ra: 84, f: [112, 104] }] });
  add({ name: 'Face pulls', hi: ['arms'], rax: [0, 1], az: 3, pr: cableTower(152, -10), att: [{ t: 'grip', half: 3, r: 0.8, to: [152, 14] }], p: [
    { h: [98, 54], t: -84, a: [130, 18], ra: 0, f: [106, 104], g: [90, 104] },
    { h: [98, 54], t: -88, a: [106, 16], ra: 55, az: 9, f: [106, 104], g: [90, 104] }] });
  add({ name: 'Oppreist roing', hi: ['arms'], bar: 'barbell', az: 6, p: [
    { h: [100, 53], t: -90, a: [104, 56], ra: 0, f: [100, 104] },
    { h: [100, 53], t: -90, a: [106, 30], ra: 55, f: [100, 104] }] });
  add({ name: 'Strikk pull-apart', hi: ['arms'], rax: [0, 1], att: [{ t: 'band2' }], p: [
    { h: [100, 53], t: -90, a: [131, 24], ra: 2, f: [100, 104] },
    { h: [100, 53], t: -90, a: [131, 24], ra: 86, f: [100, 104] }] });
  add({ name: 'Utadrotasjon med strikk', hi: ['arms'], raxA: [0, 1], rpiv: 'elbow', e: [1, 1],
    att: [{ t: 'cab', from: 'a', to: [120, 39, -44], band: true }], pr: [['box', 116, -10, 124, 106, -48, 8]], p: [
      { h: [100, 53], t: -90, a: [116, 39], b: [101, 54], ra: -10, f: [100, 104] },
      { h: [100, 53], t: -90, a: [116, 39], b: [101, 54], ra: 70, f: [100, 104] }] });
  add({ name: 'Y-T-W', hi: ['arms'], raxA: [0, 1], cycle: true, seg: 0.9, p: [
    { h: [70, 102], t: 0, d: -5, a: [131, 96], ra: 30, f: [10, 102], fa: 180 },
    { h: [70, 102], t: 0, d: -5, a: [131, 97], ra: 88, f: [10, 102], fa: 180 },
    { h: [70, 102], t: 0, d: -5, a: [108, 97], ra: 80, f: [10, 102], fa: 180 }] });

  // ================= Armer =================
  add({ name: 'Bicepscurl med stang', like: 'Bicepscurl', bar: 'barbell', az: 8 });
  add({ name: 'Hammercurl', like: 'Bicepscurl', bar: '', att: [{ t: 'db', at: 'ab', dir: 'x' }] });
  add({ name: 'Omvendt curl', like: 'Bicepscurl', bar: 'latbar', barHalf: 14, az: 8 });
  add({ name: 'Konsentrasjonscurl', hi: ['arms'], att: [{ t: 'db', at: 'a' }], k: [-1, -1],
    pr: [['box', 56, 82, 100, 88, 0, 16, 0, 'pad'], ['rod', 64, 88, 64, 106, 2, 0], ['rod', 92, 88, 92, 106, 2, 0]], p: [
      { h: [80, 78], t: -58, a: [104, 86], b: [106, 74], f: [112, 104], g: [108, 104] },
      { h: [80, 78], t: -58, a: [97, 58], b: [106, 74], f: [112, 104], g: [108, 104] }] });
  add({ name: 'Preachercurl', hi: ['arms'], az: 7, e: [1, 1], att: [{ t: 'grip', half: 11 }],
    pr: [['box', 79, 52.5, 101, 57.5, 0, 22, 45, 'pad'], ['rod', 96, 62, 96, 106, 2, 0], ['box', 70, 80, 98, 86, 0, 18, 0, 'pad'], ['rod', 84, 86, 84, 106, 2, 0]], p: [
      { h: [84, 76], t: -82, a: [111, 69], f: [104, 104] },
      { h: [84, 76], t: -82, a: [100, 42], f: [104, 104] }] });
  add({ name: 'Skrå bicepscurl', hi: ['arms'], bar: 'dumbbell', az: 8,
    pr: [['box', 80, 82, 108, 87, 0, 14, 0, 'pad'], ['box', 65.3, 64.4, 99.3, 69.4, 0, 14, 65, 'pad'], ['rod', 94, 87, 94, 106, 2, 0], ['rod', 76, 76, 76, 106, 2, 0]], p: [
      { h: [94, 78], t: -115, d: -110, a: [82, 82], f: [124, 104] },
      { h: [94, 78], t: -115, d: -110, a: [93, 56], f: [124, 104] }] });
  add({ name: 'Kabelcurl', like: 'Bicepscurl', bar: '', az: 6, pr: cableTower(140, 60), att: [{ t: 'grip', half: 8, to: [140, 100] }] });
  add({ name: 'Curl med strikk', like: 'Bicepscurl', bar: '', att: [{ t: 'cab', from: 'ab', to: [104, 104], band: true }] });
  add({ name: 'Triceps pushdown', hi: ['arms'], az: 5, e: [1, 1], pr: cableTower(128, -26), att: [{ t: 'grip', half: 6, to: [128, -22] }], p: [
    { h: [99, 53], t: -84, a: [116, 31], f: [104, 104], g: [94, 104] },
    { h: [99, 53], t: -84, a: [106, 55], f: [104, 104], g: [94, 104] }] });
  add({ name: 'Triceps med strikk', like: 'Triceps pushdown', pr: [['box', 118, -30, 124, 106, 0, 10]], att: [{ t: 'cab', from: 'ab', to: [120, -24], band: true }] });
  add({ name: 'Fransk press', hi: ['arms'], az: 6, faceUp: true, k: [1, 1], e: [1, 1], pr: FLATBENCH, att: [{ t: 'grip', half: 11 }], p: [
    { h: [70, 80], t: 0, d: -8, a: [102, 49], f: [48, 104], fa: 180 },
    { h: [70, 80], t: 0, d: -8, a: [113, 70], f: [48, 104], fa: 180 }] });
  add({ name: 'Triceps over hodet', hi: ['arms'], az: 2, e: [-1, -1], att: [{ t: 'db', at: 'a', dir: 'y', r: 4.6 }], p: [
    { h: [100, 53], t: -90, a: [102, -8], f: [100, 104] },
    { h: [100, 53], t: -90, a: [88, 12], f: [100, 104] }] });
  add({ name: 'Triceps kickback', hi: ['arms'], att: [{ t: 'db', at: 'a' }], e: [-1, -1], p: [
    { h: [80, 58], t: -20, a: [94, 69], b: [114, 74], f: [104, 104], g: [86, 104] },
    { h: [80, 58], t: -20, a: [77, 58], b: [114, 74], f: [104, 104], g: [86, 104] }] });
  add({ name: 'Smal benkpress', like: 'Benkpress', az: 6.5 });
  add({ name: 'Håndleddscurl', hi: ['arms'], bar: 'dumbbell', az: 6, e: [1, 1],
    pr: [['box', 56, 84, 100, 90, 0, 16, 0, 'pad'], ['rod', 64, 90, 64, 106, 2, 0], ['rod', 92, 90, 92, 106, 2, 0]], p: [
      { h: [80, 79], t: -48, a: [114, 80], f: [108, 104] },
      { h: [80, 79], t: -48, a: [115, 74], f: [108, 104] }] });
  add({ name: 'Omvendt håndleddscurl', like: 'Håndleddscurl' });
  add({ name: 'Dødheng', hi: ['arms'], az: 12, hold: true, seg: 1.8, pr: PULLBAR, p: [
    { h: [102, 39], t: -93, d: -92, a: [100, -22], f: [99, 90], fa: 70 },
    { h: [101, 39], t: -91, d: -88, a: [100, -22], f: [97, 90], fa: 70 }] });

  // ================= Ben =================
  add({ name: 'Frontknebøy', hi: ['legs'], bar: 'barbell', barAt: 'front', az: 9, e: [1, 1], p: [
    { h: [100, 53], t: -88, a: [103, 15], f: [100, 104] },
    { h: [80, 80], t: -70, a: [95, 44], f: [100, 104] }] });
  add({ name: 'Goblet squat', hi: ['legs'], az: 2.5, att: [{ t: 'kb', at: 'mid' }], p: [
    { h: [100, 53], t: -90, a: [109, 30], f: [100, 104] },
    { h: [80, 80], t: -70, a: [98, 58], f: [100, 104] }] });
  add({ name: 'Sumo-knebøy', hi: ['legs'], front: true, kneeOut: true, k: [1, -1], az: 2, att: [{ t: 'kb', at: 'mid' }], p: [
    { h: [100, 56], t: -90, a: [96, 40], b: [104, 40], f: [82, 104], g: [118, 104] },
    { h: [100, 79], t: -90, a: [96, 62], b: [104, 62], f: [82, 104], g: [118, 104] }] });
  add({ name: 'Hoppknebøy', hi: ['legs'], jump: true, arc: true, cycle: true, p: [
    { h: [100, 53], t: -90, a: [104, 54], f: [100, 104], s: 0.35 },
    { h: [80, 78], t: -62, a: [84, 74], f: [100, 104], s: 0.28 },
    { h: [100, 36], t: -90, a: [110, -6], f: [100, 88], fa: 60, s: 0.3 },
    { h: [84, 72], t: -68, a: [118, 52], f: [100, 104], s: 0.45 }] });
  add({ name: 'Pistol squat', hi: ['legs'], p: [
    { h: [100, 53], t: -90, a: [126, 30], f: [100, 104], g: [116, 98], ga: 0 },
    { h: [86, 86], t: -55, a: [130, 50], f: [100, 104], g: [138, 82], ga: -60 }] });
  add({ name: 'Kosakk-knebøy', hi: ['legs'], front: true, kneeOut: true, k: [1, -1], az: 2, cycle: true, seg: 0.9, p: [
    { h: [100, 66], t: -90, a: [96, 52], b: [104, 52], f: [72, 104], g: [128, 104] },
    { h: [80, 86], t: -84, a: [94, 70], b: [102, 70], f: [72, 104], g: [128, 104] },
    { h: [100, 66], t: -90, a: [96, 52], b: [104, 52], f: [72, 104], g: [128, 104] },
    { h: [120, 86], t: -96, a: [98, 70], b: [106, 70], f: [72, 104], g: [128, 104] }] });
  add({ name: 'Beinpress', hi: ['legs'], k: [1, 1], att: [{ t: 'plate' }, { t: 'torsopad' }],
    pr: [['rod', 92, 74, 136, 37, 1.6, 15, 'steel'], ['rod', 92, 74, 136, 37, 1.6, -15, 'steel'], ['box', 48, 98, 112, 106, 0, 30], ['box', 58, 90, 86, 98, 0, 26, 0, 'pad'], ['rod', 104, 98, 104, 66, 2, 15], ['rod', 104, 98, 104, 66, 2, -15]],
    p: [
      { h: [70, 86], t: -150, d: -160, a: [76, 92], f: [93, 64], fa: -130 },
      { h: [70, 86], t: -150, d: -160, a: [76, 92], f: [107, 55], fa: -130 }] });
  add({ name: 'Tåhev i beinpress', like: 'Beinpress', hi: ['legs'], p: [
    { h: [70, 86], t: -150, d: -160, a: [76, 92], f: [106, 55], fa: -130 },
    { h: [70, 86], t: -150, d: -160, a: [76, 92], f: [108, 53], fa: -95 }] });
  add({ name: 'Hack squat', hi: ['legs'], k: [-1, -1], att: [{ t: 'torsopad' }],
    pr: [['box', 54, 52, 118, 55, -10, 3, 80, 'steel'], ['box', 54, 52, 118, 55, 10, 3, 80, 'steel'], ['box', 104, 100, 132, 104, 0, 30, -15], ['box', 60, 102, 140, 106, 0, 40]], p: [
      { h: [96, 52], t: -100, d: -96, a: [92, 24], f: [114, 98], fa: -15 },
      { h: [101, 81], t: -100, d: -96, a: [97, 53], f: [114, 98], fa: -15 }] });
  add({ name: 'Gående utfall', hi: ['legs'], cycle: true, seg: 0.8, p: [
    { h: [100, 53], t: -90, a: [96, 52], f: [100, 104], g: [100, 104], ga: 0 },
    { h: [92, 78], t: -90, a: [88, 70], f: [118, 104], g: [60, 98], ga: 30 },
    { h: [100, 53], t: -90, a: [96, 52], f: [100, 104], g: [100, 104], ga: 0 },
    { h: [92, 78], t: -90, a: [88, 70], g: [118, 104], f: [60, 98], fa: 30, ga: 0 }] });
  add({ name: 'Bakoverutfall', hi: ['legs'], p: [
    { h: [100, 53], t: -90, a: [96, 52], f: [102, 104], g: [100, 104], ga: 0 },
    { h: [94, 78], t: -88, a: [90, 70], f: [112, 104], g: [56, 98], ga: 30 }] });
  add({ name: 'Sideutfall', hi: ['legs'], front: true, kneeOut: true, k: [1, -1], az: 2, p: [
    { h: [100, 56], t: -90, a: [96, 40], b: [104, 40], f: [94, 104], g: [106, 104] },
    { h: [78, 82], t: -84, a: [90, 60], b: [98, 60], f: [68, 104], g: [126, 104] }] });
  add({ name: 'Splittknebøy', hi: ['legs'], p: [
    { h: [93, 58], t: -90, a: [89, 56], f: [116, 104], g: [64, 102], ga: 30 },
    { h: [92, 78], t: -89, a: [88, 72], f: [116, 104], g: [62, 98], ga: 30 }] });
  add({ name: 'Step-ups', hi: ['legs'], pr: [['box', 108, 80, 152, 106, 0, 34, 0, 'wood']], p: [
    { h: [100, 58], t: -84, a: [100, 60], f: [122, 80], g: [96, 104] },
    { h: [118, 28], t: -90, a: [119, 30], f: [122, 80], g: [118, 79] }] });
  add({ name: 'Beinspark', hi: ['legs'], k: [1, 1], att: [{ t: 'pad', at: 'f', up: 0.1, d: [3, 0] }, { t: 'cab', from: 'f', to: [106, 78], r: 1.2 }],
    pr: [['box', 66, 82, 108, 88, 0, 22, 0, 'pad'], ['box', 60, 40, 66, 82, 0, 18, -6, 'pad'], ['box', 50, 30, 58, 106, 0, 22], ['box', 64, 88, 92, 106, 0, 18]], p: [
      { h: [80, 78], t: -95, a: [80, 86], f: [106, 104], fa: 0 },
      { h: [80, 78], t: -95, a: [80, 86], f: [131, 78], fa: -30 }] });
  add({ name: 'Lårcurl sittende', like: 'Beinspark', att: [{ t: 'pad', at: 'f', up: 0.1, d: [-1, 3] }, { t: 'cab', from: 'f', to: [106, 78], r: 1.2 }, { t: 'pad', at: 'f', up: 0.95, d: [0, -4] }], p: [
    { h: [80, 78], t: -95, a: [80, 86], f: [131, 78], fa: -30 },
    { h: [80, 78], t: -95, a: [80, 86], f: [98, 102], fa: 20 }] });
  add({ name: 'Lårcurl liggende', hi: ['legs'], k: [1, 1], att: [{ t: 'pad', at: 'f', up: 0.1, d: [0, -3] }],
    pr: [['box', 36, 89, 132, 95, 0, 16, 0, 'pad'], ['rod', 44, 95, 44, 106, 2, 0], ['rod', 124, 95, 124, 106, 2, 0], ['rod', 130, 92, 136, 106, 1.6, 0]], p: [
      { h: [80, 84], t: 0, d: -5, a: [124, 92], f: [30, 85], fa: 180 },
      { h: [80, 84], t: 0, d: -5, a: [124, 92], f: [62, 56], fa: 240 }] });
  add({ name: 'Nordic hamstring curl', hi: ['legs'], k: [1, 1], seg: 1.6, pr: [['cyl', 52, 99, 2.8, -10, 10, 'pad']], p: [
    { h: [80, 78], t: -90, d: -90, a: [84, 70], f: [54, 102], fa: 180 },
    { h: [103, 91], t: -30, d: -30, a: [140, 102], f: [54, 102], fa: 180 }] });
  add({ name: 'Enbeins rumensk markløft', hi: ['legs'], att: [{ t: 'kb', at: 'a' }], p: [
    { h: [100, 53], t: -90, a: [101, 55], b: [96, 50], f: [100, 104], g: [100, 104] },
    { h: [96, 56], t: -8, a: [126, 86], b: [124, 82], f: [100, 104], g: [45, 60], ga: 100 }] });
  add({ name: 'Sumo-markløft', hi: ['legs', 'core'], front: true, kneeOut: true, k: [1, -1], bar: 'barbell', p: [
    { h: [100, 76], t: -90, a: [93, 104], b: [107, 104], f: [78, 104], g: [122, 104] },
    { h: [100, 55], t: -90, a: [93, 90], b: [107, 90], f: [78, 104], g: [122, 104] }] });
  add({ name: 'Trap bar-markløft', hi: ['legs', 'core'], bar: 'barbell', az: 12, p: [
    { h: [82, 74], t: -42, a: [100, 97], f: [100, 104] },
    { h: [98, 53], t: -89, a: [99, 90], f: [100, 104] }] });
  add({ name: 'Good morning', hi: ['legs', 'core'], bar: 'barbell', barAt: 'back', az: 13, e: [-1, -1], p: [
    { h: [100, 53], t: -88, a: [94, 21], f: [100, 104] },
    { h: [86, 56], t: -12, a: [112, 52], f: [100, 104] }] });
  add({ name: 'Hip thrust', hi: ['legs'], bar: 'barbell', az: 13, k: [-1, -1],
    pr: [['box', 46, 76, 76, 106, 0, 30, 0, 'pad']], p: [
      { h: [97, 97], t: -140, d: -150, a: [98, 91], f: [128, 104] },
      { h: [104, 76], t: -184, d: -170, a: [104, 70], f: [128, 104] }] });
  add({ name: 'Enbeins bekkenløft', like: 'Bekkenløft', fx: function (q, i) { q.g = i ? [105, 47] : [112, 72]; q.ga = i ? -40 : -20; } });
  add({ name: 'Kettlebell swing', hi: ['legs', 'core'], arc: true, az: 2.5, att: [{ t: 'kb', at: 'mid' }], p: [
    { h: [84, 60], t: -32, a: [96, 76], f: [100, 104] },
    { h: [100, 53], t: -90, a: [131, 26], f: [100, 104] }] });
  add({ name: 'Kabel-kickback', hi: ['legs'], pr: cableTower(140, 30), att: [{ t: 'cab', from: 'f', to: [140, 100] }], p: [
    { h: [98, 54], t: -78, a: [134, 34], f: [100, 102], g: [102, 104] },
    { h: [98, 54], t: -74, a: [134, 34], f: [66, 82], fa: 120, g: [102, 104] }] });
  var ABDSEAT = [['box', 84, 80, 116, 85, 0, 26, 0, 'pad'], ['box', 86, 40, 114, 80, -10, 6, 0, 'pad'], ['box', 92, 85, 108, 106, -4, 18]];
  add({ name: 'Hofteabduksjon i maskin', hi: ['legs'], front: true, pr: ABDSEAT, p: [
    { h: [100, 77], t: -90, a: [86, 82], b: [114, 82], f: [94, 104], g: [106, 104] },
    { h: [100, 77], t: -90, a: [86, 82], b: [114, 82], f: [78, 104], g: [122, 104] }] });
  add({ name: 'Hofteadduksjon i maskin', like: 'Hofteabduksjon i maskin', p: [
    { h: [100, 77], t: -90, a: [86, 82], b: [114, 82], f: [76, 104], g: [124, 104] },
    { h: [100, 77], t: -90, a: [86, 82], b: [114, 82], f: [94, 104], g: [106, 104] }] });
  // Liggende på siden, sett forfra: ryggen mot bakgrunnen, knærne bøyd mot kameraet
  add({ name: 'Musling', hi: ['legs'], front: true, raxL: [1, 0], rabs: true, cam: [12, 30], att: [{ t: 'band2', j: 'knee' }], p: [
    { h: [100, 98], t: 180, d: 180, a: [72, 104], b: [94, 94], f: [118, 100], g: [118, 96], rg: 0 },
    { h: [100, 98], t: 180, d: 180, a: [72, 104], b: [94, 94], f: [118, 100], g: [118, 96], rg: -55 }] });
  add({ name: 'Brannhydrant', hi: ['legs'], raxL: [1, 0], p: [
    { h: [70, 72], t: 0, d: 20, a: [102, 104], f: [45, 102], fa: 180, rf: 0 },
    { h: [70, 72], t: 0, d: 20, a: [102, 104], f: [45, 102], fa: 180, rf: 62 }] });
  add({ name: 'Eselspark', hi: ['legs'], k: [1, 1], p: [
    { h: [70, 72], t: 0, d: 20, a: [102, 104], f: [45, 102], g: [45, 102], fa: 180 },
    { h: [70, 72], t: 0, d: 15, a: [102, 104], f: [40, 40], g: [45, 102], fa: -100, ga: 180 }] });
  add({ name: 'Monstergange med strikk', hi: ['legs'], front: true, kneeOut: true, k: [1, -1], az: 2, cycle: true, seg: 0.5, att: [{ t: 'band2', j: 'knee' }], p: [
    { h: [100, 62], t: -90, a: [94, 70], b: [106, 70], f: [86, 104], g: [114, 104] },
    { h: [94, 60], t: -90, a: [88, 68], b: [100, 68], f: [74, 100], g: [114, 104] },
    { h: [94, 62], t: -90, a: [88, 70], b: [100, 70], f: [80, 104], g: [108, 104] },
    { h: [100, 60], t: -90, a: [94, 68], b: [106, 68], f: [86, 104], g: [116, 100] }] });
  add({ name: 'Enbeins tåhev', like: 'Tåhev', fx: function (q) { q.g = [86, 84]; q.ga = 120; } });
  add({ name: 'Sittende tåhev', hi: ['legs'], att: [{ t: 'pad', at: 'f', up: 0.95, d: [0, -4] }],
    pr: [['box', 60, 80, 92, 86, 0, 22, 0, 'pad'], ['rod', 76, 86, 76, 106, 2, 0], ['box', 100, 98, 122, 106, 0, 22]], p: [
      { h: [80, 76], t: -92, a: [104, 72], f: [106, 96], fa: 15 },
      { h: [80, 74], t: -92, a: [104, 70], f: [106, 89], fa: 60 }] });
  add({ name: 'Bokshopp', hi: ['legs'], jump: true, arc: true, cycle: true, pr: [['box', 112, 74, 152, 106, 0, 36, 0, 'wood']], p: [
    { h: [96, 53], t: -90, a: [98, 55], f: [96, 104], s: 0.35 },
    { h: [84, 74], t: -62, a: [78, 72], f: [96, 104], s: 0.3 },
    { h: [112, 22], t: -84, a: [130, -16], f: [114, 58], fa: 50, s: 0.3 },
    { h: [120, 46], t: -66, a: [140, 34], f: [128, 74], s: 0.45 },
    { h: [127, 22], t: -90, a: [128, 24], f: [128, 74], s: 0.55 },
    { h: [112, 36], t: -88, a: [110, 38], f: [126, 74], g: [96, 100], s: 0.4 }] });
  add({ name: 'Sledeskyv', hi: ['legs'], cycle: true, seg: 0.32,
    pr: [['box', 134, 90, 176, 104, 0, 30, 0, 'iron'], ['rod', 136, 90, 132, 44, 1.5, 12, 'steel'], ['rod', 136, 90, 132, 44, 1.5, -12, 'steel'], ['box', 128, 104, 182, 106, 0, 34, 0, 'steel']], p: [
      { h: [96, 62], t: -38, a: [132, 46], f: [116, 96], g: [70, 104], fa: 20, ga: 30 },
      { h: [98, 60], t: -38, a: [132, 46], f: [96, 104], g: [96, 92], fa: 0, ga: 40 },
      { h: [96, 62], t: -38, a: [132, 46], g: [116, 96], f: [70, 104], ga: 20, fa: 30 },
      { h: [98, 60], t: -38, a: [132, 46], g: [96, 104], f: [96, 92], ga: 0, fa: 40 }] });

  // ================= Core =================
  var SUP = { h: [70, 102], t: 180, d: 190 };      // på ryggen, hodet til venstre
  add({ name: 'Planke med skuldertapp', hi: ['core', 'arms'], az: 8, cycle: true, seg: 0.6, p: [
    { h: [89.9, 80.4], t: -16.3, a: [119, 104], b: [119, 104], f: [40, 95], fa: 80 },
    { h: [89.9, 80.4], t: -16.3, a: [112, 84], b: [119, 104], f: [40, 95], fa: 80 },
    { h: [89.9, 80.4], t: -16.3, a: [119, 104], b: [119, 104], f: [40, 95], fa: 80 },
    { h: [89.9, 80.4], t: -16.3, a: [119, 104], b: [112, 84], f: [40, 95], fa: 80 }] });
  add({ name: 'Copenhagen-planke', hi: ['core', 'legs'], hold: true, seg: 1.8, toe: false, pr: [['box', 18, 82, 46, 106, 0, 30, 0, 'pad']], p: [
    { h: [86, 82], t: -9, a: [128, 104], b: [100, 78], f: [56, 100], g: [34, 82] },
    { h: [86, 81], t: -10, a: [128, 104], b: [100, 77], f: [56, 99], g: [34, 82] }] });
  add({ name: 'Sykkelcrunch', hi: ['core'], seg: 0.8, e: [-1, -1], p: [
    o(SUP, { t: 200, d: 194, a: [40, 84], ra: 70, tw: 28, f: [86, 70], g: [122, 96], fa: -40, ga: -10 }),
    o(SUP, { t: 200, d: 194, a: [40, 84], ra: 70, tw: -28, f: [122, 96], g: [86, 70], fa: -10, ga: -40 })] });
  add({ name: 'Situps', hi: ['core'], seg: 0.9, e: [1, 1], p: [
    o(SUP, { a: [52, 94], f: [94, 104], fa: -20 }),
    o(SUP, { t: 238, d: 245, a: [86, 72], f: [94, 104], fa: -20 })] });
  add({ name: 'Crunches', hi: ['core'], seg: 0.8, e: [-1, -1], p: [
    o(SUP, { a: [34, 96], ra: 70, f: [94, 104], fa: -20 }),
    o(SUP, { t: 204, d: 196, a: [40, 82], ra: 70, f: [94, 104], fa: -20 })] });
  add({ name: 'Omvendt crunch', hi: ['core'], k: [1, 1], p: [
    o(SUP, { a: [96, 104], f: [96, 76], fa: -20 }),
    o(SUP, { h: [72, 96], t: 172, a: [96, 104], f: [80, 64], fa: -40 })] });
  add({ name: 'Liggende beinhev', hi: ['core'], p: [
    o(SUP, { a: [90, 104], f: [122, 99], fa: -80 }),
    o(SUP, { a: [90, 104], f: [76, 50], fa: -170 })] });
  add({ name: 'Hengende kneløft', hi: ['core'], az: 11, pr: PULLBAR, p: [
    { h: [101, 39], t: -92, d: -92, a: [100, -22], f: [100, 90], fa: 70 },
    { h: [102, 38], t: -96, d: -94, a: [100, -22], f: [112, 54], fa: 60 }] });
  add({ name: 'Hengende beinhev', hi: ['core'], az: 11, pr: PULLBAR, p: [
    { h: [101, 39], t: -92, d: -92, a: [100, -22], f: [100, 90], fa: 70 },
    { h: [100, 38], t: -100, d: -96, a: [100, -22], f: [151, 32], fa: -20 }] });
  add({ name: 'Toes to bar', hi: ['core'], az: 11, pr: PULLBAR, p: [
    { h: [101, 39], t: -92, d: -92, a: [100, -22], f: [100, 90], fa: 70 },
    { h: [108, 22], t: -116, d: -110, a: [100, -22], f: [110, -16], fa: -60 }] });
  add({ name: 'Russian twist', hi: ['core'], az: 2.5, att: [{ t: 'mb' }], k: [-1, -1], seg: 0.7, p: [
    { h: [80, 100], t: -125, d: -110, a: [94, 70], tw: 42, f: [120, 86], fa: 10 },
    { h: [80, 100], t: -125, d: -110, a: [94, 70], tw: -42, f: [120, 86], fa: 10 }] });
  add({ name: 'Hollow hold', hi: ['core'], hold: true, seg: 1.8, p: [
    o(SUP, { h: [70, 100], t: 194, d: 190, a: [10, 80], f: [122, 92], fa: -60 }),
    o(SUP, { h: [70, 100], t: 192, d: 188, a: [10, 82], f: [122, 93], fa: -60 })] });
  add({ name: 'V-ups', hi: ['core'], p: [
    o(SUP, { h: [70, 100], a: [8, 100], f: [122, 101], fa: -80 }),
    o(SUP, { h: [70, 100], t: 235, d: 240, a: [92, 54], f: [100, 58], fa: -40 })] });
  add({ name: 'Saksespark', hi: ['core'], cycle: true, seg: 0.24, p: [
    o(SUP, { h: [70, 101], a: [74, 104], f: [121, 90], g: [121, 98], fa: -70, ga: -70 }),
    o(SUP, { h: [70, 101], a: [74, 104], f: [121, 98], g: [121, 90], fa: -70, ga: -70 })] });
  add({ name: 'Mountain climbers', hi: ['core', 'legs'], cycle: true, seg: 0.24, az: 8, p: [
    { h: [89.9, 80.4], t: -16.3, a: [119, 104], f: [40, 95], g: [86, 98], fa: 80, ga: 60 },
    { h: [89.9, 80.4], t: -16.3, a: [119, 104], g: [40, 95], f: [86, 98], ga: 80, fa: 60 }] });
  add({ name: 'Magehjul', hi: ['core'], att: [{ t: 'wheel' }], k: [1, 1], seg: 1.3, p: [
    { h: [72, 82], t: -32, a: [102, 99], f: [42, 102], fa: 180 },
    { h: [88, 96], t: -8, a: [146, 99], f: [42, 102], fa: 180 }] });
  add({ name: 'Kabelcrunch', hi: ['core'], az: 3, k: [1, 1], pr: cableTower(140, -30), att: [{ t: 'grip', half: 3, r: 0.8, to: [140, -26] }], p: [
    { h: [88, 78], t: -98, d: -90, bw: 0, a: [94, 44], f: [62, 102], fa: 180 },
    { h: [90, 76], t: -28, d: 20, bw: 9, a: [114, 70], f: [62, 102], fa: 180 }] });
  add({ name: 'Pallof press', hi: ['core'], az: 2.5, att: [{ t: 'cab', from: 'mid', to: [116, 38, -60] }], pr: [['box', 112, -6, 120, 106, -64, 8]], p: [
    { h: [98, 56], t: -90, a: [108, 40], f: [104, 104], g: [94, 104] },
    { h: [98, 56], t: -90, a: [130, 38], f: [104, 104], g: [94, 104] }] });
  add({ name: 'Vedhugger', hi: ['core'], az: 2.5, att: [{ t: 'cab', from: 'mid', to: [100, -26, -54] }, { t: 'db', at: 'a', dir: 'y', r: 1.2 }], pr: [['box', 96, -32, 104, 106, -58, 8]], p: [
    { h: [98, 54], t: -86, a: [114, -2], tw: -38, f: [106, 104], g: [90, 104] },
    { h: [96, 58], t: -76, a: [116, 66], tw: 40, f: [106, 104], g: [90, 104] }] });
  add({ name: 'L-sit', hi: ['core', 'arms'], hold: true, seg: 1.8, az: 10,
    pr: [['rod', 90, 94, 112, 94, 1.3, 10, 'steel'], ['rod', 90, 94, 112, 94, 1.3, -10, 'steel'], ['rod', 92, 94, 92, 106, 1.2, 10], ['rod', 110, 94, 110, 106, 1.2, 10], ['rod', 92, 94, 92, 106, 1.2, -10], ['rod', 110, 94, 110, 106, 1.2, -10]], p: [
      { h: [100, 92], t: -90, a: [101, 94], f: [152, 92], fa: -10 },
      { h: [100, 91], t: -91, a: [101, 94], f: [152, 90], fa: -10 }] });
  add({ name: 'Koffertbæring', hi: ['core'], att: [{ t: 'kb', at: 'a' }], cycle: true, seg: 0.42, p: [
    { h: [100, 53], t: -90, a: [101, 55], b: [96, 50], f: [112, 104], g: [88, 103], fa: -10, ga: 30 },
    { h: [100, 52], t: -90, a: [101, 54], b: [102, 50], f: [100, 104], g: [104, 96], fa: 0, ga: 20 },
    { h: [100, 53], t: -90, a: [101, 55], b: [96, 50], g: [112, 104], f: [88, 103], ga: -10, fa: 30 },
    { h: [100, 52], t: -90, a: [101, 54], b: [102, 50], g: [100, 104], f: [104, 96], ga: 0, fa: 20 }] });
  add({ name: 'Dragon flag', hi: ['core'], use: 'BENCH', seg: 1.4, p: [
    { h: [96, 52], t: 82, d: -8, a: [114, 86], f: [94, 0], fa: -90 },
    { h: [70, 77], t: 8, d: -8, a: [114, 86], f: [19, 70], fa: 190 }] });
  add({ name: 'Turkish get-up', hi: ['core', 'arms'], att: [{ t: 'kb', at: 'a' }], k: [1, 1], seg: 1, p: [
    o(SUP, { h: [70, 101], a: [44, 70], b: [26, 104], f: [94, 104], g: [120, 101], ga: -80 }),
    { h: [72, 100], t: -150, d: -150, a: [52, 54], b: [40, 104], f: [94, 104], g: [120, 101], ga: -80 },
    { h: [74, 92], t: -125, d: -120, a: [62, 30], b: [52, 104], f: [94, 104], g: [120, 101], ga: -80 },
    { h: [80, 76], t: -105, d: -100, a: [73, 14], b: [64, 104], f: [96, 104], g: [62, 102], ga: 180 },
    { h: [88, 76], t: -90, d: -90, a: [88, 12], b: [90, 70], f: [112, 104], g: [64, 102], ga: 180 },
    { h: [94, 53], t: -90, d: -90, a: [94, -10], b: [92, 50], f: [104, 104], g: [90, 104], ga: 0 }] });

  // ================= Helkropp =================
  add({ name: 'Thrusters', hi: ['legs', 'arms'], bar: 'barbell', az: 9.5, e: [1, 1], cycle: true, p: [
    { h: [100, 53], t: -90, a: [102, -12], f: [100, 104], s: 0.5 },
    { h: [100, 53], t: -88, a: [104, 15], f: [100, 104], s: 0.45 },
    { h: [80, 80], t: -70, a: [95, 44], f: [100, 104], s: 0.35 },
    { h: [94, 60], t: -82, a: [104, 22], f: [100, 104], s: 0.25 }] });
  var FLOOR = { h: [72, 76], t: -22, a: [104, 97], f: [100, 104] };
  add({ name: 'Frivending', hi: ['legs', 'core'], bar: 'barbell', az: 9, e: [1, 1], cycle: true, p: [
    o(FLOOR, { s: 0.55 }),
    { h: [100, 49], t: -96, a: [100, 62], f: [100, 101], fa: 35, s: 0.18 },
    { h: [94, 62], t: -80, a: [103, 24], f: [100, 104], s: 0.4 },
    { h: [100, 53], t: -88, a: [104, 15], f: [100, 104], s: 0.7 },
    { h: [98, 53], t: -86, a: [101, 58], f: [100, 104], s: 0.6 }] });
  add({ name: 'Rykk', hi: ['legs', 'arms', 'core'], bar: 'barbell', az: 17, cycle: true, p: [
    o(FLOOR, { s: 0.55 }),
    { h: [100, 49], t: -96, a: [100, 62], f: [100, 101], fa: 35, s: 0.2 },
    { h: [84, 78], t: -76, a: [94, 18], f: [100, 104], s: 0.5 },
    { h: [100, 53], t: -90, a: [101, -10], f: [100, 104], s: 0.7 },
    { h: [98, 53], t: -86, a: [101, 58], f: [100, 104], s: 0.6 }] });
  add({ name: 'Støt', hi: ['legs', 'arms', 'core'], bar: 'barbell', az: 9, e: [1, 1], cycle: true, p: [
    o(FLOOR, { s: 0.5 }),
    { h: [100, 49], t: -96, a: [100, 62], f: [100, 101], fa: 35, s: 0.2 },
    { h: [94, 62], t: -80, a: [103, 24], f: [100, 104], s: 0.45 },
    { h: [100, 53], t: -88, a: [104, 15], f: [100, 104], s: 0.4 },
    { h: [98, 60], t: -88, a: [103, 22], f: [100, 104], s: 0.22 },
    { h: [96, 64], t: -90, a: [99, -2], f: [120, 104], g: [72, 100], ga: 30, s: 0.55 },
    { h: [100, 53], t: -90, a: [101, -10], f: [100, 104], s: 0.6 },
    { h: [98, 53], t: -86, a: [101, 58], f: [100, 104], s: 0.6 }] });
  add({ name: 'Kettlebell clean and press', hi: ['arms', 'legs'], att: [{ t: 'kb', at: 'a' }], e: [1, 1], p: [
    { h: [96, 56], t: -82, a: [104, 70], b: [96, 50], f: [100, 104] },
    { h: [100, 53], t: -90, a: [107, 21], b: [96, 50], f: [100, 104] },
    { h: [100, 53], t: -90, a: [102, -10], b: [96, 50], f: [100, 104] }] });
  add({ name: 'Wall balls', hi: ['legs', 'arms'], az: 2.5, att: [{ t: 'mb' }], jump: true, p: [
    { h: [80, 80], t: -70, a: [100, 56], f: [100, 104] },
    { h: [100, 50], t: -90, a: [106, -12], f: [100, 102], fa: 25 }] });
  add({ name: 'Bondegange', like: 'Koffertbæring', att: [{ t: 'kb', at: 'ab' }], fx: function (q) { q.b = [101, 55]; } });
  var PL = { h: [89.9, 79.4], t: -16.3, a: [119, 101], b: [119, 101], f: [40, 95], fa: 80 };
  add({ name: 'Man makers', hi: ['arms', 'legs', 'core'], az: 8, att: [{ t: 'db', at: 'ab' }], cycle: true, seg: 0.5, p: [
    { h: [100, 53], t: -90, a: [101, 54], b: [101, 54], f: [100, 104], s: 0.4 },
    { h: [80, 84], t: -10, a: [122, 101], b: [122, 101], f: [100, 104], s: 0.3 },
    o(PL, { s: 0.35 }),
    o(PL, { a: [106, 84], s: 0.35 }),
    o(PL, { s: 0.35 }),
    o(PL, { b: [106, 84], s: 0.35 }),
    o(PL, { s: 0.3 }),
    { h: [80, 84], t: -10, a: [122, 101], b: [122, 101], f: [100, 104], s: 0.35 },
    { h: [100, 53], t: -90, a: [107, 21], b: [107, 21], f: [100, 104], s: 0.35 },
    { h: [100, 53], t: -90, a: [102, -10], b: [102, -10], f: [100, 104], s: 0.5 }] });
  add({ name: 'Bjørnegange', hi: ['core', 'arms', 'legs'], cycle: true, seg: 0.45, k: [1, 1], p: [
    { h: [70, 74], t: 0, d: 15, a: [110, 104], b: [94, 104], f: [40, 104], g: [52, 104], fa: 180, ga: 180 },
    { h: [70, 74], t: 0, d: 15, a: [102, 98], b: [102, 98], f: [46, 98], g: [46, 98], fa: 180, ga: 180 },
    { h: [70, 74], t: 0, d: 15, a: [94, 104], b: [110, 104], f: [52, 104], g: [40, 104], fa: 180, ga: 180 },
    { h: [70, 74], t: 0, d: 15, a: [102, 98], b: [102, 98], f: [46, 98], g: [46, 98], fa: 180, ga: 180 }] });

  // ================= Kondisjon =================
  var W0 = { h: [100, 53], t: -88, a: [93, 54], b: [109, 52], f: [114, 104], g: [86, 103], fa: -15, ga: 25 };
  var W1 = { h: [100, 51], t: -88, a: [100, 55], b: [101, 55], f: [100, 104], g: [102, 94], fa: 0, ga: 20 };
  function swapLegs(q) { return o(q, { f: q.g, g: q.f, fa: q.ga, ga: q.fa, a: q.b, b: q.a }); }
  var WALK = [W0, W1, swapLegs(W0), swapLegs(W1)];
  var R0 = { h: [100, 52], t: -80, a: [92, 44], b: [114, 34], f: [114, 104], g: [80, 90], fa: -5, ga: 60 };
  var R1 = { h: [100, 46], t: -80, a: [104, 42], b: [104, 42], f: [96, 98], g: [112, 78], fa: 25, ga: 0 };
  var RUN = [R0, R1, swapLegs(R0), swapLegs(R1)];
  add({ name: 'Rask gange', hi: ['legs'], cycle: true, seg: 0.38, p: WALK });
  add({ name: 'Fottur', hi: ['legs'], cycle: true, seg: 0.48, att: [{ t: 'torsopad' }], p: WALK.map(function (q) { return o(q, { t: -84 }); }) });
  add({ name: 'Løping', hi: ['legs'], cycle: true, seg: 0.2, p: RUN });
  add({ name: 'Intervalløping', hi: ['legs'], cycle: true, seg: 0.17, p: RUN.map(function (q) { return o(q, { t: -76 }); }) });
  add({ name: 'Sprint', hi: ['legs'], cycle: true, seg: 0.15, p: [
    o(R0, { t: -72, f: [120, 104], g: [74, 84], b: [122, 26], a: [86, 48] }), o(R1, { t: -74 }),
    swapLegs(o(R0, { t: -72, f: [120, 104], g: [74, 84], b: [122, 26], a: [86, 48] })), swapLegs(o(R1, { t: -74 }))] });
  add({ name: 'Bakkeløp', hi: ['legs'], cycle: true, seg: 0.22, pr: [['box', 30, 99, 170, 109, 0, 40, -12]], p: [
    o(R0, { h: [100, 46], t: -72, f: [114, 97], g: [80, 92], fa: -15, ga: 50 }), o(R1, { h: [100, 41], t: -72, f: [96, 98], g: [112, 74] }),
    swapLegs(o(R0, { h: [100, 46], t: -72, f: [114, 97], g: [80, 92], fa: -15, ga: 50 })), swapLegs(o(R1, { h: [100, 41], t: -72, f: [96, 98], g: [112, 74] }))] });
  add({ name: 'Spensthopp', hi: ['legs'], jump: true, arc: true, cycle: true, p: [
    { h: [100, 53], t: -90, a: [104, 54], f: [100, 104], s: 0.3 },
    { h: [86, 74], t: -64, a: [82, 72], f: [100, 104], s: 0.25 },
    { h: [100, 30], t: -86, a: [122, 38], f: [112, 58], fa: 40, k: 1, s: 0.35 },
    { h: [88, 72], t: -66, a: [116, 56], f: [100, 104], s: 0.35 }] });
  add({ name: 'Skøytehopp', hi: ['legs'], front: true, jump: true, cycle: true, seg: 0.4, p: [
    { h: [80, 70], t: -80, a: [100, 64], b: [104, 52], f: [78, 104], g: [96, 92] },
    { h: [100, 50], t: -90, a: [90, 56], b: [110, 56], f: [94, 92], g: [106, 92] },
    { h: [120, 70], t: -100, a: [96, 52], b: [100, 64], f: [104, 92], g: [122, 104] },
    { h: [100, 50], t: -90, a: [90, 56], b: [110, 56], f: [94, 92], g: [106, 92] }] });
  add({ name: 'Hoppetau', hi: ['legs'], cycle: true, seg: 0.16, az: 10, att: [{ t: 'rope' }], p: [
    { h: [100, 53], t: -90, a: [106, 56], f: [100, 104], fa: 10, rp: 270 },
    { h: [100, 52], t: -90, a: [106, 55], f: [100, 103], fa: 20, rp: 0 },
    { h: [100, 47], t: -90, a: [106, 50], f: [100, 98], fa: 40, rp: 90 },
    { h: [100, 51], t: -90, a: [106, 54], f: [100, 103], fa: 20, rp: 180 }] });
  var GUARD = { h: [98, 54], t: -86, d: -84, a: [114, 21], b: [111, 24], f: [112, 104], g: [86, 104], fa: 0, ga: 20 };
  var BOX = [o(GUARD, { s: 0.35 }), o(GUARD, { a: [134, 20], s: 0.3 }), o(GUARD, { s: 0.35 }), o(GUARD, { h: [102, 54], b: [134, 18], tw: -28, s: 0.35 })];
  add({ name: 'Skyggeboksing', hi: ['arms', 'core'], cycle: true, e: [1, 1], p: BOX });
  add({ name: 'Sekkeboksing', like: 'Skyggeboksing', pr: [['rod', 141, 2, 141, 62, 9, 0, 'pad'], ['rod', 141, -30, 141, 2, 0.6, 0, 'steel']] });
  add({ name: 'Battle ropes', hi: ['arms', 'core'], cycle: true, seg: 0.16, az: 8, att: [{ t: 'ropes', to: [196, 104] }], p: [
    { h: [96, 64], t: -80, a: [118, 54], b: [118, 72], f: [108, 104], g: [86, 104], rp: 0 },
    { h: [96, 64], t: -80, a: [118, 63], b: [118, 63], f: [108, 104], g: [86, 104], rp: 90 },
    { h: [96, 64], t: -80, a: [118, 72], b: [118, 54], f: [108, 104], g: [86, 104], rp: 180 },
    { h: [96, 64], t: -80, a: [118, 63], b: [118, 63], f: [108, 104], g: [86, 104], rp: 270 }] });
  add({ name: 'Skyttelløp', hi: ['legs'], cycle: true, p: [
    o(R0, { s: 0.2 }), o(R1, { s: 0.2 }), o(swapLegs(R0), { s: 0.25 }),
    { h: [92, 76], t: -40, a: [122, 102], b: [100, 60], f: [116, 104], g: [70, 100], ga: 30, s: 0.45 },
    o(swapLegs(R1), { s: 0.2 })] });
  add({ name: 'Trappeløp', hi: ['legs'], cycle: true, seg: 0.32,
    pr: [['box', 96, 94, 170, 106, 0, 40], ['box', 120, 82, 170, 94, 0, 40], ['box', 144, 70, 170, 82, 0, 40]], p: [
      { h: [116, 46], t: -80, a: [108, 46], b: [124, 40], f: [130, 81], g: [106, 93], fa: 0, ga: 20 },
      { h: [120, 40], t: -80, a: [116, 44], b: [118, 44], f: [130, 81], g: [124, 70], fa: 0, ga: 10 },
      { h: [116, 46], t: -80, a: [124, 40], b: [108, 46], g: [130, 81], f: [106, 93], ga: 0, fa: 20 },
      { h: [120, 40], t: -80, a: [118, 44], b: [116, 44], g: [130, 81], f: [124, 70], ga: 0, fa: 10 }] });
  var BIKE = [['cyl', 62, 90, 16, -1.5, 1.5, 'iron'], ['cyl', 140, 90, 16, -1.5, 1.5, 'iron'], ['rod', 62, 90, 100, 84, 1.3, 0, 'steel'],
    ['rod', 100, 84, 90, 46, 1.4, 0, 'steel'], ['rod', 90, 46, 132, 44, 1.4, 0, 'steel'], ['rod', 132, 44, 140, 90, 1.4, 0, 'steel'],
    ['rod', 100, 84, 132, 44, 1.4, 0, 'steel'], ['box', 82, 43, 98, 46, 0, 6, 0, 'pad'], ['rod', 126, 36, 132, 44, 1.2, 0, 'steel'], ['cyl', 126, 36, 1, -8, 8, 'steel'], ['cyl', 100, 84, 3, -4, 4, 'steel']];
  function pedal(ang) { var r = ang * Math.PI / 180; return [100 + 9 * Math.cos(r), 84 + 9 * Math.sin(r)]; }
  add({ name: 'Sykling', hi: ['legs'], cycle: true, seg: 0.22, az: 8, pr: BIKE, p: [0, 90, 180, 270].map(function (d) {
    return { h: [90, 41], t: -38, d: -30, a: [126, 37], f: pedal(d), g: pedal(d + 180), fa: 10, ga: 10 };
  }) });
  add({ name: 'Air bike', hi: ['legs', 'arms'], cycle: true, seg: 0.24,
    pr: [['box', 66, 102, 156, 106, 0, 30], ['rod', 90, 102, 92, 50, 2, 0, 'steel'], ['box', 82, 46, 100, 50, 0, 10, 0, 'pad'], ['rod', 100, 84, 140, 70, 2, 0, 'steel'],
      ['cyl', 142, 66, 17, -5, 5, 'iron'], ['rod', 140, 70, 150, 102, 2, 0, 'steel'], ['cyl', 100, 84, 3, -4, 4, 'steel']],
    att: [{ t: 'cab', from: 'ab', to: [120, 74], r: 1.3 }], p: [0, 90, 180, 270].map(function (d, i) {
      return { h: [92, 45], t: -80, a: i === 0 ? [120, 34] : i === 2 ? [112, 40] : [116, 37], b: i === 0 ? [112, 40] : i === 2 ? [120, 34] : [116, 37], f: pedal(d), g: pedal(d + 180), fa: 10, ga: 10 };
    }) });
  add({ name: 'Romaskin', hi: ['legs', 'arms', 'core'], cycle: true, k: [-1, -1], az: 8,
    pr: [['box', 40, 96, 176, 101, 0, 12], ['box', 148, 66, 174, 101, 0, 26], ['box', 124, 84, 128, 104, 0, 22, -20], ['rod', 50, 101, 50, 106, 2, 0], ['rod', 168, 101, 168, 106, 2, 0]],
    att: [{ t: 'seat' }, { t: 'grip', half: 8, to: [150, 80] }], p: [
      { h: [100, 88], t: -58, a: [140, 76], f: [126, 92], fa: -60, s: 0.45 },
      { h: [86, 88], t: -84, a: [118, 76], f: [126, 92], fa: -60, s: 0.3 },
      { h: [76, 88], t: -108, a: [84, 72], f: [126, 92], fa: -60, s: 0.55 },
      { h: [80, 88], t: -84, a: [108, 76], f: [126, 92], fa: -60, s: 0.5 }] });
  add({ name: 'Skiergometer', hi: ['arms', 'core'], az: 7, cam: [46, 12], pr: [['box', 134, -24, 142, 106, -4, 14], ['box', 124, 102, 150, 106, 0, 40]],
    att: [{ t: 'cab', from: 'ab', to: [134, -18] }, { t: 'db', at: 'ab', dir: 'y', r: 1.2 }], p: [
      { h: [100, 53], t: -88, a: [118, -4], f: [104, 104] },
      { h: [88, 62], t: -38, a: [104, 72], f: [104, 104] }] });
  function ell(ang) { var r = ang * Math.PI / 180; return [104 + 14 * Math.cos(r), 94 + 5 * Math.sin(r)]; }
  add({ name: 'Ellipsemaskin', hi: ['legs'], cycle: true, seg: 0.3,
    pr: [['box', 60, 101, 160, 106, 0, 30], ['box', 140, 30, 150, 101, 0, 12], ['rod', 118, 64, 140, 50, 1.6, 0, 'steel']],
    att: [{ t: 'cab', from: 'ab', to: [118, 64], r: 1.2 }], p: [0, 90, 180, 270].map(function (d, i) {
      return { h: [100, 44], t: -88, a: i === 0 ? [124, 36] : i === 2 ? [116, 42] : [120, 39], b: i === 0 ? [116, 42] : i === 2 ? [124, 36] : [120, 39], f: ell(d), g: ell(d + 180), fa: 0, ga: 0 };
    }) });
  add({ name: 'Gange i motbakke', hi: ['legs'], cycle: true, seg: 0.42,
    pr: [['box', 40, 98, 166, 104, 0, 34, -10], ['rod', 150, 104, 150, 40, 1.6, 15], ['rod', 150, 104, 150, 40, 1.6, -15], ['rod', 150, 40, 126, 44, 1.4, 15, 'steel'], ['rod', 150, 40, 126, 44, 1.4, -15, 'steel'], ['box', 146, 30, 158, 44, 0, 34]],
    p: WALK.map(function (q) { var lift = function (pt) { return [pt[0], pt[1] - (pt[0] - 100) * 0.176 - 4]; }; return o(q, { t: -84, h: [q.h[0], q.h[1] - 4], f: lift(q.f), g: lift(q.g) }); }) });
  add({ name: 'Svømming', hi: ['arms', 'legs'], cycle: true, arc: true, seg: 0.38, cam: [30, 22], pr: [['box', 8, 83, 156, 106, 0, 44, 0, 'water']], p: [
    { h: [70, 79], t: 0, d: 10, a: [140, 80], b: [80, 82], f: [18, 80], g: [18, 86], fa: 180, ga: 180 },
    { h: [70, 80], t: 0, d: 20, a: [112, 104], b: [100, 50], f: [18, 86], g: [18, 80], fa: 180, ga: 180 },
    { h: [70, 79], t: 0, d: 10, a: [80, 82], b: [140, 80], f: [18, 80], g: [18, 86], fa: 180, ga: 180 },
    { h: [70, 80], t: 0, d: 20, a: [100, 50], b: [112, 104], f: [18, 86], g: [18, 80], fa: 180, ga: 180 }] });
  add({ name: 'Langrenn', hi: ['legs', 'arms'], cycle: true, seg: 0.42, att: [{ t: 'ski', len: 70 }, { t: 'pole', at: 'ab', len: 48 }], p: [
    { h: [100, 56], t: -76, a: [122, 50], b: [86, 60], f: [116, 103], g: [80, 101], fa: 0, ga: 20 },
    { h: [100, 54], t: -78, a: [108, 56], b: [104, 56], f: [100, 103], g: [102, 98], fa: 0, ga: 0 },
    { h: [100, 56], t: -76, a: [86, 60], b: [122, 50], g: [116, 103], f: [80, 101], ga: 0, fa: 20 },
    { h: [100, 54], t: -78, a: [104, 56], b: [108, 56], g: [100, 103], f: [102, 98], ga: 0, fa: 0 }] });
  add({ name: 'Rulleski', hi: ['arms', 'core'], att: [{ t: 'ski', len: 54 }, { t: 'pole', at: 'ab', len: 48 }], az: 9, seg: 0.7, p: [
    { h: [100, 54], t: -86, a: [122, 34], f: [100, 103], fa: 0 },
    { h: [94, 58], t: -40, a: [96, 70], f: [100, 103], fa: 0 }] });

  // ================= Mobilitet =================
  add({ name: 'Brystrygg-rotasjon', hi: ['core', 'arms'], front: true, raxA: [1, 0], rabs: true, cam: [12, 30], seg: 1.5, p: [
    { h: [100, 98], t: 180, d: 180, a: [72, 135], b: [72, 61], ra: 88, rb: 88, f: [118, 100], g: [118, 96] },
    { h: [100, 98], t: 180, d: 180, a: [72, 135], b: [72, 61], ra: 88, rb: -80, f: [118, 100], g: [118, 96] }] });
  add({ name: 'Verdens beste tøyning', hi: ['legs', 'core'], seg: 1.3, p: [
    { h: [88, 82], t: -40, d: -20, a: [118, 104], b: [114, 104], f: [122, 104], g: [52, 100], ga: 30 },
    { h: [88, 82], t: -44, d: -60, a: [118, 104], b: [111, 31], tw: 55, f: [122, 104], g: [52, 100], ga: 30 }] });
  add({ name: 'Barnets stilling', hi: ['core'], hold: true, seg: 2, k: [-1, -1], p: [
    { h: [66, 92], t: 15, d: 20, a: [138, 102], f: [64, 103], fa: 180 },
    { h: [64, 91], t: 11, d: 16, a: [138, 102], f: [64, 103], fa: 180 }] });
  add({ name: 'Nedovervendt hund', hi: ['legs', 'arms'], cycle: true, seg: 0.9, k: [-1, -1], p: [
    { h: [92, 59], t: 45, d: 62, a: [135, 103], f: [66, 104], g: [66, 102], fa: 0, ga: 35 },
    { h: [92, 59], t: 45, d: 62, a: [135, 103], f: [66, 102], g: [66, 104], fa: 35, ga: 0 }] });
  add({ name: 'Kobra', hi: ['core'], e: [1, 1], seg: 1.4, p: [
    { h: [70, 102], t: -2, d: -5, a: [100, 104], f: [18, 102], fa: 180 },
    { h: [70, 102], t: -42, d: -60, a: [106, 104], f: [18, 102], fa: 180 }] });
  add({ name: 'Solhilsen', hi: ['core', 'legs'], cycle: true, seg: 1, p: [
    { h: [100, 53], t: -94, d: -100, a: [97, -8], f: [100, 104] },
    { h: [96, 53], t: 80, d: 90, a: [106, 104], f: [100, 104] },
    { h: [89.9, 80.4], t: -16.3, a: [119, 104], f: [40, 95], fa: 80 },
    { h: [66, 100], t: -35, d: -50, a: [98, 104], f: [16, 102], fa: 180 },
    { h: [92, 59], t: 45, d: 62, a: [135, 103], f: [66, 104], fa: 0 },
    { h: [96, 53], t: 80, d: 90, a: [106, 104], f: [100, 104] }] });
  add({ name: 'Duestrekk', hi: ['legs'], seg: 1.6, k: [-1, -1], p: [
    { h: [84, 94], t: -88, d: -88, a: [96, 102], f: [100, 102], fa: -20, g: [34, 102], ga: 180 },
    { h: [86, 96], t: -18, d: -10, a: [142, 102], f: [100, 102], fa: -20, g: [34, 102], ga: 180 }] });
  add({ name: 'Figur 4-strekk', hi: ['legs'], raxL: [1, 0], seg: 1.5, p: [
    o(SUP, { a: [80, 80], g: [98, 76], f: [80, 74], rf: 55, fa: -30, ga: -10 }),
    o(SUP, { a: [78, 76], g: [94, 70], f: [78, 70], rf: 55, fa: -30, ga: -10 })] });
  add({ name: '90/90 hofte', hi: ['legs'], rax: [0, 1], rabs: true, k: [-1, -1], seg: 1.2, p: [
    { h: [90, 100], t: -88, a: [72, 104], f: [106, 104], g: [106, 104], rf: 55, rg: 55 },
    { h: [90, 100], t: -88, a: [72, 104], f: [106, 104], g: [106, 104], rf: -55, rg: -55 }] });
  add({ name: 'Froskestrekk', hi: ['legs'], raxL: [1, 0], seg: 1.5, p: [
    { h: [72, 80], t: 6, d: 15, a: [106, 104], f: [46, 102], fa: 180, rf: 68 },
    { h: [62, 86], t: 12, d: 20, a: [106, 104], f: [38, 102], fa: 180, rf: 70 }] });
  add({ name: 'Sommerfuglen', hi: ['legs'], raxL: [1, 0], seg: 0.9, p: [
    { h: [70, 100], t: -82, a: [96, 98], f: [96, 102], fa: -20, rf: 52 },
    { h: [70, 100], t: -78, a: [96, 98], f: [96, 102], fa: -20, rf: 72 }] });
  add({ name: 'Lårstrekk', hi: ['legs'], hold: true, seg: 1.8, k: [1, 1], p: [
    { h: [100, 53], t: -90, a: [91, 60], b: [128, 30], f: [91, 58], fa: -80, g: [100, 104] },
    { h: [100, 53], t: -91, a: [90, 58], b: [128, 31], f: [90, 56], fa: -80, g: [100, 104] }] });
  add({ name: 'Leggstrekk', hi: ['legs'], seg: 1.6, pr: [['box', 140, -10, 146, 106, -14, 24]], p: [
    { h: [104, 58], t: -66, a: [140, 34], f: [118, 104], g: [66, 104], ga: 0 },
    { h: [108, 60], t: -60, a: [140, 36], f: [118, 104], g: [66, 104], ga: 0 }] });
  add({ name: 'Ankelmobilitet mot vegg', hi: ['legs'], seg: 1, pr: [['box', 140, -10, 146, 106, -14, 24]], p: [
    { h: [88, 78], t: -86, a: [140, 50], f: [120, 104], g: [62, 102], ga: 180 },
    { h: [97, 78], t: -82, a: [140, 50], f: [120, 104], g: [70, 102], ga: 180 }] });
  add({ name: 'Dyp knebøy-hold', hi: ['legs'], hold: true, seg: 1.8, az: 2, p: [
    { h: [86, 90], t: -68, a: [114, 70], f: [100, 104] },
    { h: [86, 91], t: -66, a: [114, 71], f: [100, 104] }] });
  add({ name: 'Brystrekk i døråpning', hi: ['arms'], raxA: [0, 1], e: [-1, -1], seg: 1.5, pr: [['box', 92, -20, 98, 106, 30, 6]], p: [
    { h: [100, 53], t: -90, a: [116, 7], b: [101, 54], ra: 90, f: [104, 104], g: [94, 104] },
    { h: [104, 53], t: -86, a: [118, 7], b: [104, 54], ra: 112, f: [110, 104], g: [96, 104] }] });
  add({ name: 'Skulderdislokasjon med strikk', hi: ['arms'], arc: true, az: 22, att: [{ t: 'band2' }], seg: 1.2, p: [
    { h: [100, 53], t: -90, a: [112, 52], f: [100, 104] },
    { h: [100, 53], t: -90, a: [101, -8], f: [100, 104] },
    { h: [100, 53], t: -90, a: [87, 50], f: [100, 104] }] });
  add({ name: 'Strekk for bakre skulder', hi: ['arms'], raxA: [0, 1], hold: true, seg: 1.8, p: [
    { h: [100, 53], t: -90, a: [130, 26], ra: -62, b: [112, 30], f: [100, 104] },
    { h: [100, 53], t: -90, a: [130, 27], ra: -70, b: [112, 31], f: [100, 104] }] });
  add({ name: 'Tricepsstrekk', hi: ['arms'], hold: true, seg: 1.8, e: [-1, 1], p: [
    { h: [100, 53], t: -90, a: [92, 10], b: [100, 2], f: [100, 104] },
    { h: [100, 53], t: -90, a: [91, 12], b: [99, 3], f: [100, 104] }] });
  add({ name: 'Nakkestrekk', hi: ['core'], front: true, seg: 1.8, p: [
    { h: [100, 54], t: -90, d: -90, a: [92, 56], b: [108, 56], f: [96, 104], g: [104, 104] },
    { h: [100, 54], t: -90, d: -128, a: [86, 4], b: [108, 58], f: [96, 104], g: [104, 104] }] });
  add({ name: 'Sidestrekk', hi: ['core'], front: true, arc: true, seg: 1.5, p: [
    { h: [100, 54], t: -90, d: -90, a: [96, -8], b: [104, -8], f: [94, 104], g: [106, 104] },
    { h: [98, 54], t: -66, d: -58, bw: -8, a: [116, -2], b: [126, 2], f: [94, 104], g: [106, 104] }] });
  add({ name: 'Kne til bryst', hi: ['core', 'legs'], seg: 1.2, p: [
    o(SUP, { a: [82, 80], f: [92, 80], fa: -40 }),
    o(SUP, { h: [70, 100], t: 184, a: [80, 76], f: [88, 76], fa: -50 })] });
  add({ name: 'Liggende ryggvri', hi: ['core'], raxL: [1, 0], raxA: [0, 1], rabs: true, seg: 1.6, p: [
    o(SUP, { a: [96, 104], ra: 82, rb: -82, f: [94, 104], rf: 0, rg: 0 }),
    o(SUP, { a: [96, 104], ra: 82, rb: -82, f: [94, 104], rf: 70, rg: 70 })] });
  add({ name: 'Hoftesirkler', hi: ['legs'], rax: [0, 1], cycle: true, seg: 0.6, p: [
    { h: [100, 53], t: -90, a: [96, 50], b: [96, 50], f: [118, 74], fa: 20, g: [100, 104], rf: 0 },
    { h: [100, 53], t: -90, a: [96, 50], b: [96, 50], f: [118, 74], fa: 20, g: [100, 104], rf: 75 },
    { h: [100, 53], t: -90, a: [96, 50], b: [96, 50], f: [96, 96], fa: 30, g: [100, 104], rf: 20 }] });
  add({ name: 'Armsirkler', hi: ['arms'], cycle: true, seg: 0.3, p: [
    { h: [100, 53], t: -90, a: [109, 54], ra: 88, f: [100, 104] },
    { h: [100, 53], t: -90, a: [100, 55], ra: 102, f: [100, 104] },
    { h: [100, 53], t: -90, a: [91, 54], ra: 88, f: [100, 104] },
    { h: [100, 53], t: -90, a: [100, 55], ra: 74, f: [100, 104] }] });
  add({ name: 'Skumrulle', hi: ['legs'], seg: 1.1, pr: [['cyl', 88, 99.5, 5.5, -10, 10, 'band']], p: [
    { h: [60, 91], t: -122, d: -110, a: [38, 104], f: [110, 97], fa: -80 },
    { h: [74, 92], t: -120, d: -110, a: [52, 104], f: [124, 98], fa: -80 }] });

  window.TB_ANIM_EXTRA = X;
})();
