// Dibujos planos de caricatura (Canvas2D) para el short de Nurea: lactobacilos, intrusos, flores, maleza, gomita,
// frasco, cápsula, yogur y efectos. Contorno ciruela grueso, colores planos con un degradado suave.
import * as THREE from "three";

export const INK = "#241726";
type G = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

export const tex = (w: number, h: number, draw: (g: G) => void) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!; g.lineJoin = "round"; g.lineCap = "round";
  draw(g);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16), c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};
const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};
const line = (g: G, pts: number[][], w: number, col = INK) => {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.lineWidth = w; g.strokeStyle = col; g.stroke();
};
const dot = (g: G, x: number, y: number, r: number, col = INK) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = col; g.fill(); };

export type Face = "happy" | "smile" | "shock" | "nervous" | "angry" | "dazed" | "blink";
/** cara sencilla centrada en (cx, cy); u = tamaño */
const face = (g: G, cx: number, cy: number, u: number, f: Face) => {
  const ex = 34 * u, ey = 0;
  g.lineWidth = 7 * u; g.strokeStyle = INK;
  for (const s of [-1, 1]) {
    const x = cx + s * ex, y = cy + ey;
    if (f === "happy") { g.beginPath(); g.arc(x, y + 6 * u, 13 * u, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else if (f === "blink") { line(g, [[x - 12 * u, y], [x + 12 * u, y]], 7 * u); }
    else if (f === "shock") { dot(g, x, y, 17 * u, "#fff"); g.beginPath(); g.arc(x, y, 17 * u, 0, TAU); g.lineWidth = 5 * u; g.stroke(); dot(g, x, y, 6 * u); }
    else if (f === "dazed") { line(g, [[x - 10 * u, y - 10 * u], [x + 10 * u, y + 10 * u]], 6 * u); line(g, [[x + 10 * u, y - 10 * u], [x - 10 * u, y + 10 * u]], 6 * u); }
    else {
      dot(g, x, y, 10 * u);
      if (f === "smile") line(g, [[x - 13 * u, y - 13 * u], [x + 13 * u, y - 13 * u]], 6 * u);
      if (f === "nervous") line(g, [[x + s * 16 * u, y - 16 * u], [x - s * 12 * u, y - 28 * u]], 6 * u);
      if (f === "angry") line(g, [[x + s * 18 * u, y - 30 * u], [x - s * 14 * u, y - 13 * u]], 8 * u);
    }
  }
  const my = cy + 42 * u;
  g.lineWidth = 7 * u; g.strokeStyle = INK;
  if (f === "happy") {
    g.beginPath(); g.moveTo(cx - 24 * u, my - 6 * u); g.quadraticCurveTo(cx, my + 34 * u, cx + 24 * u, my - 6 * u); g.closePath();
    g.fillStyle = "#5a1e28"; g.fill(); g.stroke();
  } else if (f === "smile" || f === "blink") { g.beginPath(); g.arc(cx, my - 10 * u, 22 * u, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
  else if (f === "shock") { g.beginPath(); g.ellipse(cx, my + 4 * u, 12 * u, 17 * u, 0, 0, TAU); g.fillStyle = "#5a1e28"; g.fill(); g.stroke(); }
  else if (f === "nervous" || f === "dazed") {
    g.beginPath(); g.moveTo(cx - 24 * u, my);
    for (let i = 1; i <= 4; i++) g.lineTo(cx - 24 * u + i * 12 * u, my + (i % 2 ? -7 : 7) * u);
    g.stroke();
  } else { g.beginPath(); g.arc(cx, my + 18 * u, 20 * u, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
};

export const LACTO_COLS = ["#46d6a8", "#35c3d9", "#8fd94a", "#b58cf0"];
/** lactobacilo: bastón redondeado con cara, brazos y piernas de palito. Diseño 400 x 640, pies en y = 620 */
export const lacto = (g: G, k: number, col: string, f: Face, arms: "down" | "up") => {
  g.setTransform(k, 0, 0, k, 0, 0);
  // piernas
  for (const s of [-1, 1]) { line(g, [[200 + s * 45, 500], [200 + s * 50, 606]], 15); line(g, [[200 + s * 50, 606], [200 + s * 82, 608]], 15); }
  // brazos
  for (const s of [-1, 1]) {
    const a = arms === "up" ? [[200 + s * 100, 300], [200 + s * 158, 230], [200 + s * 172, 130]] : [[200 + s * 100, 320], [200 + s * 156, 372], [200 + s * 160, 440]];
    line(g, a, 15); dot(g, a[2][0], a[2][1], 14);
  }
  // cuerpo
  const gr = g.createLinearGradient(100, 60, 300, 520);
  gr.addColorStop(0, shade(col, 1.12)); gr.addColorStop(0.55, col); gr.addColorStop(1, shade(col, 0.72));
  rr(g, 96, 56, 208, 468, 104); g.fillStyle = gr; g.fill();
  g.save(); rr(g, 96, 56, 208, 468, 104); g.clip();
  g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(150, 130, 26, 60, 0.35, 0, TAU); g.fill();
  g.restore();
  rr(g, 96, 56, 208, 468, 104); g.lineWidth = 17; g.strokeStyle = INK; g.stroke();
  face(g, 200, 240, 1.25, f);
};

/** intruso: 0 = bacteria con púas, 1 = levadura. Diseño 400 x 400 */
export const germ = (g: G, k: number, kind: number, dazed: boolean) => {
  g.setTransform(k, 0, 0, k, 0, 0);
  const col = kind === 0 ? (dazed ? "#b3a9c4" : "#7d6a9c") : dazed ? "#e6dcc0" : "#cfae6a";
  g.beginPath();
  if (kind === 0) {
    const n = 11;
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * TAU, r = i % 2 ? 110 : 168;
      const x = 200 + Math.cos(a) * r, y = 200 + Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
  } else {
    g.ellipse(190, 215, 118, 150, 0.15, 0, TAU);
    g.moveTo(330, 110); g.ellipse(292, 96, 50, 58, 0.4, 0, TAU);
  }
  const gr = g.createLinearGradient(80, 60, 320, 360); gr.addColorStop(0, shade(col, 1.1)); gr.addColorStop(1, shade(col, 0.72));
  g.fillStyle = gr; g.fill(); g.lineWidth = 16; g.strokeStyle = INK; g.stroke();
  face(g, kind === 0 ? 200 : 190, kind === 0 ? 190 : 205, 1.15, dazed ? "dazed" : "angry");
};

export const FLOWER_COLS = [["#ff5fa2", "#ffd23f"], ["#ff9cc6", "#fff3b0"], ["#e63c8c", "#ffd23f"], ["#fff0f6", "#ffb84d"], ["#ffb3d1", "#ff8a3c"]];
/** flor con tallo. Diseño 300 x 600, base del tallo en y = 590 */
export const flower = (g: G, k: number, v: number) => {
  g.setTransform(k, 0, 0, k, 0, 0);
  const [pc, cc] = FLOWER_COLS[v % FLOWER_COLS.length], bend = (v % 2 ? 1 : -1) * 22;
  g.beginPath(); g.moveTo(150, 590); g.quadraticCurveTo(150 + bend, 400, 150, 190);
  g.lineWidth = 26; g.strokeStyle = INK; g.stroke(); g.lineWidth = 13; g.strokeStyle = "#3f9d4b"; g.stroke();
  for (const s of [-1, 1]) {
    const y = s > 0 ? 430 : 500, x0 = 150 + bend * 0.45;
    g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo(x0 + s * 60, y - 70, x0 + s * 118, y - 46); g.quadraticCurveTo(x0 + s * 62, y + 6, x0, y); g.closePath();
    g.fillStyle = s > 0 ? "#58b55a" : "#3f9d4b"; g.fill(); g.lineWidth = 11; g.strokeStyle = INK; g.stroke();
  }
  const cx = 150, cy = 150, np = 5 + (v % 2);
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < np; i++) {
    const a = (i / np) * TAU - Math.PI / 2;
    g.beginPath(); g.ellipse(cx + Math.cos(a) * 68, cy + Math.sin(a) * 68, 62, 44, a, 0, TAU);
    if (pass === 0) { g.lineWidth = 22; g.strokeStyle = INK; g.stroke(); }
    else { const gr = g.createRadialGradient(cx, cy, 20, cx, cy, 140); gr.addColorStop(0, shade(pc, 0.86)); gr.addColorStop(1, pc); g.fillStyle = gr; g.fill(); }
  }
  dot(g, cx, cy, 40, INK); dot(g, cx, cy, 31, cc);
};

/** maleza gruñona. Diseño 300 x 400, base en y = 390 */
export const weed = (g: G, k: number) => {
  g.setTransform(k, 0, 0, k, 0, 0);
  const leaf = (pts: number[][], col: string) => {
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) g.lineTo(q[0], q[1]); g.closePath();
    g.fillStyle = col; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  };
  leaf([[150, 390], [60, 300], [20, 170], [70, 215], [62, 120], [112, 200], [135, 260]], "#4a5d3a");
  leaf([[150, 390], [240, 300], [282, 180], [232, 218], [246, 118], [190, 205], [166, 262]], "#3d4f33");
  leaf([[112, 392], [108, 250], [128, 120], [150, 30], [174, 122], [194, 250], [190, 392]], "#5b7044");
  for (const [x, y, s] of [[104, 230, -1], [198, 232, 1], [110, 150, -1], [192, 152, 1]]) leaf([[x, y - 10], [x + s * 30, y], [x, y + 12]], "#5b7044");
  face(g, 150, 265, 0.78, "angry");
};

/** gomita de piña. Diseño 400 x 520, base en y = 505 */
export const gummy = (g: G, k: number) => {
  g.setTransform(k, 0, 0, k, 0, 0);
  for (let pass = 0; pass < 2; pass++) for (const [x, w, top] of [[200, 34, 20], [146, 30, 62], [254, 30, 62], [102, 26, 112], [298, 26, 112]]) {
    g.beginPath(); g.moveTo(x - w, 215); g.quadraticCurveTo(x + (x - 200) * 0.35, top + 60, x + (x - 200) * 0.5, top); g.quadraticCurveTo(x + (x - 200) * 0.2, top + 70, x + w, 215); g.closePath();
    if (pass === 0) { g.lineWidth = 20; g.strokeStyle = INK; g.stroke(); } else { g.fillStyle = x === 200 ? "#7cc65a" : "#58b55a"; g.fill(); }
  }
  g.beginPath(); g.ellipse(200, 345, 142, 160, 0, 0, TAU);
  const gr = g.createRadialGradient(160, 290, 20, 200, 345, 180); gr.addColorStop(0, "#ffe168"); gr.addColorStop(0.6, "#fbbd2a"); gr.addColorStop(1, "#ef9412");
  g.fillStyle = gr; g.fill();
  g.save(); g.clip(); g.lineWidth = 7; g.strokeStyle = "rgba(190,100,0,0.45)";
  for (let i = -6; i <= 6; i++) { line(g, [[200 + i * 52 - 200, 150], [200 + i * 52 + 200, 550]], 7, "rgba(190,100,0,0.42)"); line(g, [[200 + i * 52 + 200, 150], [200 + i * 52 - 200, 550]], 7, "rgba(190,100,0,0.42)"); }
  g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.ellipse(132, 262, 26, 54, 0.5, 0, TAU); g.fill();
  g.restore();
  g.beginPath(); g.ellipse(200, 345, 142, 160, 0, 0, TAU); g.lineWidth = 17; g.strokeStyle = INK; g.stroke();
};

/** frasco de Nurea. Diseño 500 x 800, base en y = 785 */
export const bottle = (g: G, k: number) => {
  g.setTransform(k, 0, 0, k, 0, 0);
  rr(g, 120, 40, 260, 130, 26); g.fillStyle = "#d6266f"; g.fill();
  g.save(); rr(g, 120, 40, 260, 130, 26); g.clip(); g.fillStyle = "rgba(0,0,0,0.14)"; for (let x = 140; x < 380; x += 26) g.fillRect(x, 40, 9, 130); g.restore();
  rr(g, 120, 40, 260, 130, 26); g.lineWidth = 16; g.strokeStyle = INK; g.stroke();
  rr(g, 60, 165, 380, 620, 70);
  const gr = g.createLinearGradient(60, 0, 440, 0); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.7, "#fdeef4"); gr.addColorStop(1, "#f0cfdc");
  g.fillStyle = gr; g.fill();
  g.save(); rr(g, 60, 165, 380, 620, 70); g.clip();
  const lg = g.createLinearGradient(0, 270, 0, 700); lg.addColorStop(0, "#ffd9e8"); lg.addColorStop(1, "#ff9fc4");
  g.fillStyle = lg; g.fillRect(60, 270, 380, 430);
  g.fillStyle = "#0f3b2e"; g.font = "800 98px Inter, sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic";
  g.fillText("nurea", 250, 385);
  g.fillStyle = "#d6266f"; g.fillRect(150, 410, 90, 9);
  g.font = "800 44px Inter, sans-serif"; g.fillText("Women's", 250, 475); g.fillText("Probiotic +", 250, 523);
  // orquídea
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU - Math.PI / 2; g.beginPath(); g.ellipse(250 + Math.cos(a) * 34, 610 + Math.sin(a) * 34, 34, 22, a, 0, TAU); g.fillStyle = i % 2 ? "#ff5fa2" : "#ff86b8"; g.fill(); g.lineWidth = 5; g.strokeStyle = "#b81c5c"; g.stroke(); }
  dot(g, 250, 610, 13, "#ffd23f");
  g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(84, 165, 30, 620);
  g.restore();
  rr(g, 60, 165, 380, 620, 70); g.lineWidth = 17; g.strokeStyle = INK; g.stroke();
};

/** cápsula de antibiótico con estela. Diseño 700 x 300 */
export const capsule = (g: G, k: number) => {
  g.setTransform(k, 0, 0, k, 0, 0);
  for (const [y, x0] of [[90, 40], [150, 10], [210, 60]]) line(g, [[x0, y], [x0 + 190, y]], 14, "rgba(255,255,255,0.9)");
  rr(g, 300, 70, 360, 160, 80); g.fillStyle = "#f4f7fb"; g.fill();
  g.save(); rr(g, 300, 70, 360, 160, 80); g.clip(); g.fillStyle = "#4aa3e8"; g.fillRect(480, 70, 200, 160);
  g.fillStyle = "rgba(255,255,255,0.6)"; rr(g, 330, 92, 290, 26, 13); g.fill(); g.restore();
  rr(g, 300, 70, 360, 160, 80); g.lineWidth = 16; g.strokeStyle = INK; g.stroke();
  line(g, [[480, 70], [480, 230]], 10);
};

/** vasito de yogur con cuchara. Diseño 300 x 380, base en y = 370 */
export const yogurt = (g: G, k: number) => {
  g.setTransform(k, 0, 0, k, 0, 0);
  line(g, [[205, 150], [250, 40]], 26); line(g, [[205, 150], [250, 40]], 12, "#dfe5ee");
  g.beginPath(); g.ellipse(254, 34, 22, 30, 0.35, 0, TAU); g.fillStyle = "#dfe5ee"; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.moveTo(50, 120); g.lineTo(250, 120); g.lineTo(220, 365); g.lineTo(80, 365); g.closePath();
  g.fillStyle = "#ffffff"; g.fill();
  g.save(); g.clip(); g.fillStyle = "#6fb7ff"; g.fillRect(40, 205, 220, 90); g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(190, 110, 70, 270); g.restore();
  g.lineWidth = 15; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.ellipse(150, 118, 106, 30, 0, 0, TAU); g.fillStyle = "#fffaf0"; g.fill(); g.lineWidth = 14; g.stroke();
  g.fillStyle = "#ffffff"; g.font = "800 46px Inter, sans-serif"; g.textAlign = "center"; g.fillText("yogur", 150, 268);
};

/** gota brillante de ácido láctico (textura suave) */
export const drop = (g: G, s: number) => {
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, "rgba(255,255,235,1)"); gr.addColorStop(0.35, "rgba(255,238,130,0.85)"); gr.addColorStop(1, "rgba(255,220,90,0)");
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
};
export const puff = (g: G, s: number) => {
  for (const [x, y, r] of [[0.5, 0.52, 0.26], [0.3, 0.56, 0.18], [0.7, 0.56, 0.18], [0.42, 0.36, 0.17], [0.6, 0.38, 0.16]]) {
    const gr = g.createRadialGradient(x * s, y * s, 0, x * s, y * s, r * s); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.beginPath(); g.arc(x * s, y * s, r * s, 0, TAU); g.fill();
  }
};
export const shadow = (g: G, s: number) => {
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, "rgba(40,10,50,0.42)"); gr.addColorStop(0.6, "rgba(40,10,50,0.2)"); gr.addColorStop(1, "rgba(40,10,50,0)");
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
};
export const cloud = (g: G, w: number, h: number, col: string) => {
  g.fillStyle = col;
  for (const [x, y, r] of [[0.2, 0.68, 0.16], [0.36, 0.5, 0.22], [0.56, 0.44, 0.26], [0.76, 0.6, 0.19], [0.5, 0.72, 0.2]]) { g.beginPath(); g.arc(x * w, y * h, r * w, 0, TAU); g.fill(); }
  g.fillRect(0.2 * w, 0.7 * h, 0.56 * w, 0.2 * h);
  g.clearRect(0, 0.86 * h, w, 0.14 * h);
};
