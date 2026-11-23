// Línea de tiempo del short de Nurea (29,6 s), sincronizada con public/voz/sofia_112.wav.
// Cuadros de cada palabra (30 fps, tiempos de Magnific / 1,12):
// Ahora 2 · millones 26 · bacterias 44 · dentro 68 · ti 84 · Y te están 92 · cuidando 105-123
// Se llaman 124 · lactobacilos 139-168 · Viven 169 · flora 183 · vaginal 190 · fabrican 210 · ácido 223 · láctico 234-254
// Ese 255 · mantiene 274 · pH 289 · tan ácido 302 · yogur 331-351
// Por suerte 352 · ahí 371 · casi nada 376 · crecer 412-429 · Por desgracia 430 · algunos 455 · antibióticos 465 ·
// también 484 · reducirlos 506-534 · Fíjate 535 · jardín 565-582 · Si las 582 · plantas 589 · ocupan 609 · todo 626 ·
// la maleza 634 · no tiene 647 · dónde 657-676 · Nurea 677 · trae 688 · cuatro 698 · lactobacilos 706 · gomita 735 ·
// piña 748 · para ayudar 764 · mantener 776 · equilibrio 793-815 · Dos 816 · día 827 · Tu jardín 842 · bien 865 · cuidado 872-884
export const FPS = 30;
export const TOTAL = 890;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const smoother = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type SetId = "garden" | "micro";
type Key = { f: number; pos: V3; look: V3; fov: number; glide?: boolean };
export type ShotDef = { id: number; set: SetId; a: number; b: number; keys: Key[] };

export const HERO: V3 = [0, 0, 3.2];
export const GUMMY: V3 = [0, 0, 2];
export const WEED: V3 = [5.8, 0, 7.5];
export const BOTTLE: V3 = [0, 0, 1.5];

export const SHOTS: ShotDef[] = [
  // 1. Ella, en el jardín. La cámara entra en su vestido.
  { id: 1, set: "garden", a: 0, b: 108, keys: [
    { f: 0, pos: [0.3, 1.5, 6.4], look: [0, 1.25, 0], fov: 40 },
    { f: 62, pos: [0.25, 1.45, 5.6], look: [0, 1.25, 0], fov: 40 },
    { f: 102, pos: [0, 1.0, 0.75], look: [0, 0.98, 0], fov: 30, glide: true },
    { f: 108, pos: [0, 1.0, 0.7], look: [0, 0.98, 0], fov: 30 },
  ] },
  // 2. El mundo de la flora: los lactobacilos, el ácido láctico, el pH.
  { id: 2, set: "micro", a: 98, b: 354, keys: [
    { f: 98, pos: [0, 9, 24], look: [0, 1.5, -6], fov: 46 },
    { f: 126, pos: [0, 7.6, 21.5], look: [0, 1.4, -6], fov: 46 },
    { f: 152, pos: [0.5, 1.15, 6.7], look: [0, 0.95, 3.2], fov: 36, glide: true },
    { f: 174, pos: [0.4, 1.15, 6.35], look: [0, 0.95, 3.2], fov: 36 },
    { f: 212, pos: [-2.4, 1.7, 5.4], look: [0.5, 1.0, -8], fov: 44, glide: true },
    { f: 256, pos: [0, 10, 15], look: [0, 1.5, -12], fov: 50, glide: true },
    { f: 300, pos: [0, 12, 18], look: [0, 3.5, -12], fov: 50 },
    { f: 327, pos: [1.2, 1.15, 8.0], look: [0.55, 0.85, 3.2], fov: 38, glide: true },
    { f: 354, pos: [1.1, 1.15, 7.6], look: [0.55, 0.85, 3.2], fov: 38 },
  ] },
  // 3. Los intrusos rebotan; luego pasa el antibiótico.
  { id: 3, set: "micro", a: 348, b: 536, keys: [
    { f: 348, pos: [-6, 2.2, 8], look: [1, 8.5, -9], fov: 50 },
    { f: 430, pos: [-5, 3.2, 9.5], look: [1.5, 6, -10], fov: 50 },
    { f: 458, pos: [0, 3.0, 13], look: [-4, 1.2, -4], fov: 48, glide: true },
    { f: 522, pos: [1.5, 3.4, 13.5], look: [5, 1.0, -4], fov: 48 },
    { f: 536, pos: [1.7, 3.5, 13.6], look: [5.4, 1.0, -4], fov: 48 },
  ] },
  // 4. El jardín: las flores lo ocupan todo y la maleza no cabe.
  { id: 4, set: "garden", a: 529, b: 678, keys: [
    { f: 529, pos: [5.6, 0.9, 5.4], look: [5, 0.75, 0], fov: 40 },
    { f: 584, pos: [5.3, 1.0, 4.5], look: [5, 0.8, 0], fov: 40 },
    { f: 612, pos: [3, 8, 10], look: [2, 0, -12], fov: 50, glide: true },
    { f: 630, pos: [3, 8.4, 10.5], look: [2, 0, -12], fov: 50 },
    { f: 648, pos: [6.15, 0.6, 9.9], look: [5.8, 0.42, 7.5], fov: 40, glide: true },
    { f: 678, pos: [6.05, 0.6, 9.5], look: [5.8, 0.42, 7.5], fov: 40 },
  ] },
  // 5. La gomita de piña trae cuatro lactobacilos.
  { id: 5, set: "micro", a: 671, b: 818, keys: [
    { f: 671, pos: [0, 3.5, 12], look: [0, 5.5, 2], fov: 46 },
    { f: 686, pos: [0, 3.4, 11.8], look: [0, 4.6, 2], fov: 46 },
    { f: 706, pos: [0.3, 1.6, 9.2], look: [0, 1.0, 2], fov: 42, glide: true },
    { f: 737, pos: [0.2, 1.5, 8.4], look: [0, 1.0, 2], fov: 42 },
    { f: 762, pos: [-0.8, 1.3, 7.4], look: [0.1, 0.9, 2], fov: 40, glide: true },
    { f: 802, pos: [0, 10, 17], look: [0, 1, -8], fov: 50, glide: true },
    { f: 818, pos: [0, 10.5, 17.6], look: [0, 1, -8], fov: 50 },
  ] },
  // 6. El frasco, en el jardín.
  { id: 6, set: "garden", a: 811, b: TOTAL, keys: [
    { f: 811, pos: [0.6, 1.35, 6.6], look: [0, 0.72, 1.5], fov: 40 },
    { f: TOTAL, pos: [0.2, 1.0, 5.7], look: [0, 0.7, 1.5], fov: 38, glide: true },
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

/** una o dos capas: cada toma nueva entra con un fundido de XFADE cuadros */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (let i = SHOTS.length - 1; i > 0; i--) {
    const a = SHOTS[i].a;
    if (f >= a + XFADE) return [{ id: i + 1, alpha: 1 }];
    if (f >= a) return [{ id: i, alpha: 1 }, { id: i + 1, alpha: (f - a + 1) / (XFADE + 1) }];
  }
  return [{ id: 1, alpha: 1 }];
};

/** desenfoque del fondo (px a 1080p) y punto de enfoque */
export const dofAt = (id: number, f: number): { cInf: number; focus?: V3 } => {
  if (id === 1) return { cInf: 10, focus: [0, 1.3, 0] };
  if (id === 2) {
    if (f < 126) return { cInf: 0 };
    if (f < 200) return { cInf: lerp(0, 13, smooth((f - 130) / 20)), focus: [0, 1, 3.2] };
    if (f < 310) return { cInf: lerp(13, 0, smooth((f - 200) / 20)) };
    return { cInf: lerp(0, 11, smooth((f - 310) / 16)), focus: [0.5, 0.9, 3.2] };
  }
  if (id === 3) return { cInf: 0 };
  if (id === 4) {
    if (f < 590) return { cInf: 10, focus: [5, 0.8, 0.5] };
    if (f < 636) return { cInf: lerp(10, 0, smooth((f - 590) / 14)) };
    return { cInf: lerp(0, 9, smooth((f - 636) / 12)), focus: WEED };
  }
  if (id === 5) {
    if (f < 690) return { cInf: 0 };
    if (f < 770) return { cInf: lerp(0, 10, smooth((f - 690) / 14)), focus: [0, 1, 2.4] };
    return { cInf: lerp(10, 0, smooth((f - 770) / 16)) };
  }
  return { cInf: 11, focus: BOTTLE };
};

// ---- momentos de la historia ----
export const T = {
  drops0: 208, dome0: 244, dome1: 300, ph0: 286, ph1: 350, yogur: 325,
  germs0: 352, germsHit: 400, worry: 430, pill0: 462, pill1: 524,
  weedUp: 640, weedDown: 660,
  gummy0: 677, gummyLand: 696, four: [700, 709, 718, 727], regrow0: 764, regrow1: 808,
  dos: [816, 827],
};
