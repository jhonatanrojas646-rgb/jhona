// Dibujos nuevos del short "luna de miel": el tarro real de Nurea, jabones, burbujas, líneas de olor, luna, etc.
import { INK } from "../nurea/draw";

type G = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};

/** tarro de Nurea como el real: tapa magenta ancha, cuerpo rosado. Diseño 600 x 620, base en y = 605 */
export const jar = (g: G, k: number) => {
  g.setTransform(k, 0, 0, k, 0, 0); g.lineJoin = "round";
  // cuerpo
  rr(g, 44, 200, 512, 405, 46);
  const bg = g.createLinearGradient(44, 0, 556, 0); bg.addColorStop(0, "#e23aa6"); bg.addColorStop(0.5, "#d9249c"); bg.addColorStop(1, "#b81784");
  g.fillStyle = bg; g.fill();
  g.save(); rr(g, 44, 200, 512, 405, 46); g.clip();
  const lg = g.createLinearGradient(0, 240, 0, 560); lg.addColorStop(0, "#ffd3e6"); lg.addColorStop(1, "#ff8fc0");
  g.fillStyle = lg; g.fillRect(44, 240, 512, 318);
  g.fillStyle = "#0f3b2e"; g.font = "800 64px Inter, sans-serif"; g.textAlign = "left"; g.textBaseline = "alphabetic";
  g.fillText("nurea", 104, 312);
  g.fillStyle = "#d6266f"; g.fillRect(106, 328, 62, 6);
  g.font = "800 46px Inter, sans-serif"; g.fillText("Women's", 104, 384); g.fillText("Probiotic +", 104, 430);
  g.font = "800 38px Inter, sans-serif"; g.fillText("Slippery Elm", 104, 470);
  // orquídea
  const ox = 440, oy = 430;
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU - Math.PI / 2; g.beginPath(); g.ellipse(ox + Math.cos(a) * 40, oy + Math.sin(a) * 40, 42, 26, a, 0, TAU); g.fillStyle = i % 2 ? "#ff7fb4" : "#ffa6cb"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#c92f79"; g.stroke(); }
  g.beginPath(); g.arc(ox, oy, 15, 0, TAU); g.fillStyle = "#ffd23f"; g.fill();
  // gomitas del empaque
  for (const [x, y] of [[452, 520], [492, 530]]) { g.beginPath(); g.ellipse(x, y, 17, 20, 0, 0, TAU); g.fillStyle = "#f7b52c"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#c97f10"; g.stroke(); }
  rr(g, 96, 500, 310, 44, 22); g.fillStyle = "#ffe9f2"; g.fill();
  g.fillStyle = "#d6266f"; g.font = "800 27px Inter, sans-serif"; g.fillText("Dietary Supplement", 116, 531);
  g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(64, 200, 26, 405);
  g.restore();
  rr(g, 44, 200, 512, 405, 46); g.lineWidth = 16; g.strokeStyle = INK; g.stroke();
  // tapa
  rr(g, 26, 30, 548, 196, 70);
  const tg = g.createLinearGradient(0, 30, 0, 226); tg.addColorStop(0, "#ee4db4"); tg.addColorStop(1, "#cf1f96");
  g.fillStyle = tg; g.fill();
  g.save(); rr(g, 26, 30, 548, 196, 70); g.clip(); g.fillStyle = "rgba(255,255,255,0.3)"; g.beginPath(); g.ellipse(170, 78, 110, 26, -0.08, 0, TAU); g.fill(); g.restore();
  rr(g, 26, 30, 548, 196, 70); g.lineWidth = 16; g.strokeStyle = INK; g.stroke();
};

/** frasco de jabón. Diseño 200 x 420, base en y = 410 */
export const soap = (g: G, k: number, col: string, v: number) => {
  g.setTransform(k, 0, 0, k, 0, 0); g.lineJoin = "round"; g.lineCap = "round";
  if (v % 2) { // con dispensador
    g.beginPath(); g.moveTo(100, 150); g.lineTo(100, 70); g.lineTo(160, 70); g.lineWidth = 30; g.strokeStyle = INK; g.stroke(); g.lineWidth = 15; g.strokeStyle = "#f2f2f2"; g.stroke();
    rr(g, 40, 140, 120, 270, 28);
  } else { rr(g, 76, 60, 48, 70, 10); g.fillStyle = "#f2f2f2"; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke(); rr(g, 34, 120, 132, 290, 46); }
  g.fillStyle = col; g.fill(); g.lineWidth = 14; g.strokeStyle = INK; g.stroke();
  g.fillStyle = "rgba(255,255,255,0.85)"; rr(g, 62, 220, 76, 96, 12); g.fill();
  g.fillStyle = col; g.beginPath(); g.arc(100, 268, 20, 0, TAU); g.fill();
};

/** burbuja de jabón (textura suave) */
export const bubble = (g: G, s: number) => {
  const c = s / 2, gr = g.createRadialGradient(c, c, s * 0.2, c, c, s * 0.48);
  gr.addColorStop(0, "rgba(220,245,255,0.18)"); gr.addColorStop(0.82, "rgba(200,238,255,0.5)"); gr.addColorStop(0.94, "rgba(255,255,255,0.95)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  g.fillStyle = "rgba(255,255,255,0.95)"; g.beginPath(); g.ellipse(s * 0.34, s * 0.32, s * 0.09, s * 0.05, -0.7, 0, TAU); g.fill();
};

/** línea ondulada de olor (textura suave). Lienzo w x h */
export const stink = (g: G, w: number, h: number) => {
  g.lineCap = "round"; g.lineWidth = w * 0.13; g.strokeStyle = "rgba(150,190,70,0.9)";
  g.beginPath(); g.moveTo(w / 2, h * 0.95);
  for (let i = 1; i <= 24; i++) { const t = i / 24; g.lineTo(w / 2 + Math.sin(t * Math.PI * 3) * w * 0.3, h * (0.95 - 0.9 * t)); }
  g.stroke();
};

export const moon = (g: G, s: number) => {
  g.fillStyle = "#fff6cf"; g.beginPath(); g.arc(s / 2, s / 2, s * 0.42, 0, TAU); g.fill();
  g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(s * 0.66, s * 0.4, s * 0.36, 0, TAU); g.fill(); g.globalCompositeOperation = "source-over";
};
export const zzz = (g: G, s: number) => {
  g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineJoin = "round"; g.textAlign = "center";
  for (const [x, y, px] of [[0.3, 0.9, 0.3], [0.52, 0.6, 0.38], [0.74, 0.32, 0.26]]) { g.font = `800 ${s * px}px Inter, sans-serif`; g.lineWidth = s * 0.05; g.strokeText("z", x * s, y * s); g.fillText("z", x * s, y * s); }
};
export const heart = (g: G, s: number) => {
  g.beginPath(); g.moveTo(s * 0.5, s * 0.9);
  g.bezierCurveTo(s * 0.02, s * 0.56, s * 0.1, s * 0.1, s * 0.5, s * 0.32);
  g.bezierCurveTo(s * 0.9, s * 0.1, s * 0.98, s * 0.56, s * 0.5, s * 0.9); g.closePath();
  g.fillStyle = "#ff3f7f"; g.fill(); g.lineWidth = s * 0.07; g.lineJoin = "round"; g.strokeStyle = INK; g.stroke();
  g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(s * 0.33, s * 0.34, s * 0.07, s * 0.045, -0.6, 0, TAU); g.fill();
};
export const sun = (g: G, s: number) => {
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(0.45, "rgba(255,214,120,1)"); gr.addColorStop(0.5, "rgba(255,190,110,0.5)"); gr.addColorStop(1, "rgba(255,170,110,0)");
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
};
export const tiles = (g: G, s: number, base: string, line: string) => {
  g.fillStyle = base; g.fillRect(0, 0, s, s); g.strokeStyle = line; g.lineWidth = s * 0.03;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo((i * s) / 4, 0); g.lineTo((i * s) / 4, s); g.moveTo(0, (i * s) / 4); g.lineTo(s, (i * s) / 4); g.stroke(); }
};
/** cruz médica en un cartel */
export const poster = (g: G, s: number) => {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, s, s); g.strokeStyle = INK; g.lineWidth = s * 0.06; g.strokeRect(s * 0.03, s * 0.03, s * 0.94, s * 0.94);
  g.fillStyle = "#ff5f8f"; g.fillRect(s * 0.4, s * 0.2, s * 0.2, s * 0.6); g.fillRect(s * 0.2, s * 0.4, s * 0.6, s * 0.2);
};
