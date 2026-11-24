// Línea de tiempo del short "luna de miel" (28 s), sincronizada con public/voz/laura_112.wav.
// Cuadros (30 fps): En su 2 · luna 10 · miel 20 · Laura 34 · durmió 43 · sofá 56-75 · No hubo 77 · pelea 88-107 ·
// Le daba 108 · pena 120 · olor 131 · no se iba 145-165 · por más 167 · se lavaba 189-208 · Por suerte 210 ·
// no era 227 · falta de aseo 235-263 · Por desgracia 264 · lavarse 290 · por dentro 300 · empeorarlo 324-350 ·
// Fíjate 351 · tu flora 368 · bacterias 400 · buenas 416 · lactobacilos 431-467 · Ellas 469 · mantienen 478 · pH 492 ·
// ácido 504-518 · y cuando 519 · faltan 530-545 · el olor 546 · cambia 564-577 · Su ginecóloga 578 · la trató 596-618 ·
// Y para 619 · cuidar 627 · equilibrio 639 · cada día 658-675 · Laura 677 · sumó 686 · Nurea 694-711 · probióticos 714 ·
// gomitas 735 · piña 750-764 · La segunda 765 · luna 780 · miel 791 · fue 800 · sin 806 · sofá 812-829
export const FPS = 30;
export const TOTAL = 842;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type SetId = "hotel" | "bath" | "micro" | "clinic" | "beach";
type Key = { f: number; pos: V3; look: V3; fov: number; glide?: boolean };
export type ShotDef = { id: number; set: SetId; a: number; b: number; keys: Key[] };

export const HERO: V3 = [0, 0, 3.2];
export const JAR: V3 = [0.75, 0.96, -0.95];

export const SHOTS: ShotDef[] = [
  // 1. Hotel de noche: él duerme en la cama, ella en el sofá.
  { id: 1, set: "hotel", a: 0, b: 110, keys: [
    { f: 0, pos: [-1.3, 1.7, 4.8], look: [-1.6, 0.9, -1.8], fov: 40 },
    { f: 32, pos: [-1.2, 1.65, 4.4], look: [-1.6, 0.9, -1.8], fov: 40 },
    { f: 58, pos: [1.9, 1.3, 3.6], look: [1.6, 0.95, -0.5], fov: 38, glide: true },
    { f: 110, pos: [1.8, 1.25, 2.7], look: [1.6, 0.98, -0.5], fov: 38 },
  ] },
  // 2. El baño: jabones y más jabones. La cámara entra en su vestido.
  { id: 2, set: "bath", a: 104, b: 214, keys: [
    { f: 104, pos: [0.35, 1.45, 4.6], look: [0.1, 1.1, -0.5], fov: 40 },
    { f: 192, pos: [0.2, 1.4, 3.8], look: [0.1, 1.1, -0.5], fov: 40 },
    { f: 210, pos: [-0.5, 1.0, 0.45], look: [-0.5, 0.98, -0.3], fov: 30, glide: true },
    { f: 214, pos: [-0.5, 1.0, 0.42], look: [-0.5, 0.98, -0.3], fov: 30 },
  ] },
  // 3. Su flora: quedan pocos, y el jabón se lleva a más.
  { id: 3, set: "micro", a: 206, b: 352, keys: [
    { f: 206, pos: [0, 7, 20], look: [0, 1, -4], fov: 46 },
    { f: 262, pos: [0.6, 2.2, 10], look: [0, 1, 0], fov: 44, glide: true },
    { f: 286, pos: [0, 3.0, 13], look: [-4, 1.2, -2], fov: 48, glide: true },
    { f: 346, pos: [1.5, 3.4, 13.5], look: [5, 1.0, -2], fov: 48 },
    { f: 352, pos: [1.6, 3.4, 13.6], look: [5.3, 1.0, -2], fov: 48 },
  ] },
  // 4. Cómo debería ser: lactobacilos, pH ácido... y qué pasa cuando faltan.
  { id: 4, set: "micro", a: 346, b: 582, keys: [
    { f: 346, pos: [0, 9, 23], look: [0, 1.5, -6], fov: 46 },
    { f: 398, pos: [0, 7.8, 21], look: [0, 1.4, -6], fov: 46 },
    { f: 430, pos: [0.5, 1.15, 6.7], look: [0, 0.95, 3.2], fov: 36, glide: true },
    { f: 466, pos: [0.4, 1.15, 6.3], look: [0, 0.95, 3.2], fov: 36 },
    { f: 496, pos: [0, 10, 15], look: [0, 2.5, -12], fov: 50, glide: true },
    { f: 520, pos: [0, 10.4, 15.6], look: [0, 2.5, -12], fov: 50 },
    { f: 582, pos: [0, 6.5, 14], look: [0, 1.2, -6], fov: 48, glide: true },
  ] },
  // 5. La ginecóloga.
  { id: 5, set: "clinic", a: 574, b: 624, keys: [
    { f: 574, pos: [0.25, 1.4, 6.1], look: [0, 1.15, -0.3], fov: 40 },
    { f: 624, pos: [0.1, 1.35, 5.4], look: [0, 1.15, -0.3], fov: 40 },
  ] },
  // 6. El equilibrio vuelve.
  { id: 6, set: "micro", a: 616, b: 678, keys: [
    { f: 616, pos: [0, 6, 13], look: [0, 1, -6], fov: 48 },
    { f: 678, pos: [0, 10, 17.5], look: [0, 1, -8], fov: 50, glide: true },
  ] },
  // 7. El tarro de Nurea en su baño, de día.
  { id: 7, set: "bath", a: 671, b: 772, keys: [
    { f: 671, pos: [0.25, 1.4, 3.9], look: [0.15, 1.1, -0.5], fov: 40 },
    { f: 702, pos: [0.72, 1.3, 2.1], look: [0.75, 1.14, -0.95], fov: 34, glide: true },
    { f: 772, pos: [0.74, 1.28, 1.8], look: [0.75, 1.14, -0.95], fov: 34 },
  ] },
  // 8. La segunda luna de miel.
  { id: 8, set: "beach", a: 765, b: TOTAL, keys: [
    { f: 765, pos: [0.4, 1.5, 7.2], look: [0, 1.2, 0], fov: 40 },
    { f: TOTAL, pos: [0.1, 1.35, 5.5], look: [0, 1.2, 0], fov: 40, glide: true },
  ] },
];
export const XFADE = 6;

const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const camAt = (id: number, f: number) => {
  const k = SHOTS[id - 1].keys;
  if (f <= k[0].f) return { pos: k[0].pos, look: k[0].look, fov: k[0].fov };
  for (let i = 1; i < k.length; i++) if (f <= k[i].f) {
    const u = (f - k[i - 1].f) / (k[i].f - k[i - 1].f), t = k[i].glide ? smoother(u) : u;
    return { pos: lerp3(k[i - 1].pos, k[i].pos, t), look: lerp3(k[i - 1].look, k[i].look, t), fov: lerp(k[i - 1].fov, k[i].fov, t) };
  }
  const l = k[k.length - 1];
  return { pos: l.pos, look: l.look, fov: l.fov };
};
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (let i = SHOTS.length - 1; i > 0; i--) {
    const a = SHOTS[i].a;
    if (f >= a + XFADE) return [{ id: i + 1, alpha: 1 }];
    if (f >= a) return [{ id: i, alpha: 1 }, { id: i + 1, alpha: (f - a + 1) / (XFADE + 1) }];
  }
  return [{ id: 1, alpha: 1 }];
};

export const dofAt = (id: number, f: number): { cInf: number; focus?: V3 } => {
  if (id === 1) return f < 40 ? { cInf: 6, focus: [-1.6, 0.9, -1.8] } : { cInf: 9, focus: [1.6, 1, -0.5] };
  if (id === 2) return { cInf: 8, focus: [-0.5, 1.2, -0.3] };
  if (id === 3) return f < 240 ? { cInf: 0 } : f < 280 ? { cInf: 8, focus: [0, 1, 3.2] } : { cInf: 0 };
  if (id === 4) {
    if (f < 404) return { cInf: 0 };
    if (f < 474) return { cInf: lerp(0, 13, smooth((f - 404) / 20)), focus: [0, 1, 3.2] };
    return { cInf: lerp(13, 0, smooth((f - 474) / 16)) };
  }
  if (id === 5) return { cInf: 7, focus: [0, 1.2, -0.3] };
  if (id === 6) return { cInf: 0 };
  if (id === 7) return f < 684 ? { cInf: 8, focus: [-0.5, 1.2, -0.3] } : { cInf: 10, focus: JAR };
  return { cInf: 6, focus: [0, 1.2, 0] };
};

export const T = {
  wave0: 290, wave1: 345, wave: 430, dome: 469, loss: 519, germs: 526, stink: 546,
  ph0: 484, ph1: 578, phUp: 524,
  regrow: 625, jar: 694, gum: [735, 750], heart: 806,
};
