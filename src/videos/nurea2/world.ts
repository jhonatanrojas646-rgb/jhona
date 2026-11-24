// Escenarios del short "luna de miel": hotel de noche, baño, consultorio, playa y el mundo rosado de la flora.
// Cada escenario es un grupo; update() enciende el de la toma y posa todo en función del cuadro.
import * as THREE from "three";
import { NOINK } from "../alejandro/ink";
import { Pen, bodyFront, Outfit, FrontOpts } from "../alejandro/toon";
import * as D from "../nurea/draw";
import * as D2 from "./draw";
import { rng, backOut, toon, softMat, Cards, card, sky } from "../nurea/world";
import { SHOTS, camAt, T, HERO, JAR, smooth, clamp01, lerp } from "./story";

const Z = new THREE.Vector3(0, 0, 1), _qr = new THREE.Quaternion();
const box = (p: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, col: string) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(col)); m.position.set(x, y, z); p.add(m); return m;
};
const wall = (p: THREE.Object3D, w: number, h: number, z: number, col: string, map?: THREE.Texture) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon(col, map)); m.position.set(0, h / 2, z); p.add(m); return m;
};
const floor = (p: THREE.Object3D, s: number, col: string, map?: THREE.Texture, y = 0) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s).rotateX(-Math.PI / 2), toon(col, map)); m.position.y = y; p.add(m); return m;
};
const flat = (p: THREE.Object3D, w: number, h: number, x: number, y: number, z: number, col: string, map?: THREE.Texture) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, map: map ?? null, transparent: !!map }));
  m.position.set(x, y, z); m.layers.set(NOINK); p.add(m); return m;
};
const person = (o: Outfit, opts: FrontOpts, crop = 1) => D.tex(1200, Math.round(2000 * crop), (g) => { g.setTransform(2, 0, 0, 2, 0, 0); bodyFront(new Pen(g), o, opts); });
const tint = (m: THREE.Mesh, r: number, g: number, b: number) => (m.material as THREE.MeshBasicMaterial).color.setRGB(r, g, b);
const setMap = (m: THREE.Mesh, t: THREE.Texture) => { (m.material as THREE.MeshBasicMaterial).map = t; };
const tileTex = (base: string, line: string, rx: number, ry: number) => {
  const t = D.tex(256, 256, (g) => D2.tiles(g, 256, base, line)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t;
};

const LAURA: Outfit = { jacket: "#ff6fa5", pants: "#ff6fa5", boots: "#ffffff", hat: "hair", hair: "#4a2a1a", dress: "#ff6fa5", skin: "#f5c9a0" };
const HIM: Outfit = { jacket: "#3f86d8", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#2a1a12", skin: "#ecd0b6" };
const DOC: Outfit = { jacket: "#ffffff", pants: "#7fb7c9", boots: "#ffffff", hat: "hair", hair: "#7a4a2a", dress: "#ffffff", skin: "#c99067" };
const PW = 1.296, PH = 2.16, PF = 25 / 1000;

type Member = { x: number; z: number; col: number; ph: number; tier: number; fr: number; fo: number; fb: number; sc: number };
type Germ = { x: number; z: number; t0: number; kind: number };
const LOOKS: [D.Face, "down" | "up"][] = [["happy", "down"], ["happy", "up"], ["shock", "down"], ["nervous", "down"]];
const DOME = { c: [0, 0, -8] as [number, number, number], r: 22, h: 11 };

export class World {
  root = new THREE.Group();
  private sets: Record<string, THREE.Group> = { hotel: new THREE.Group(), bath: new THREE.Group(), micro: new THREE.Group(), clinic: new THREE.Group(), beach: new THREE.Group() };
  private fogs: Record<string, THREE.Fog> = {
    hotel: new THREE.Fog("#3a3766", 30, 120), bath: new THREE.Fog("#ffffff", 80, 300), clinic: new THREE.Fog("#ffffff", 80, 300),
    micro: new THREE.Fog("#ffc9db", 45, 260), beach: new THREE.Fog("#ffd9b0", 70, 420),
  };
  private hemi = new THREE.HemisphereLight(0xffffff, 0xb08a9a, 1.25); private sun = new THREE.DirectionalLight(0xfff4e6, 2.2);
  private skyM: THREE.Mesh; private skyB: THREE.Mesh;
  // hotel
  private lauraSit: THREE.Mesh; private sitTex: THREE.Texture[] = []; private himHead: THREE.Mesh; private zzz: THREE.Mesh; private moon: THREE.Mesh;
  // baño
  private lauraBath: THREE.Mesh; private bathTex: THREE.Texture[] = []; private soaps: THREE.Mesh[] = []; private stinkB: Cards; private bubB: Cards;
  private jar: THREE.Mesh; private gums: THREE.Mesh[] = []; private shB: Cards;
  // consultorio y playa
  private shC: Cards; private couple: THREE.Mesh[] = []; private heart: THREE.Mesh; private shS: Cards; private cloudsS: Cards;
  // flora
  private crowd: Member[] = []; private crowdCards: Cards[] = []; private shM: Cards; private drops: Cards; private puffs: Cards; private bubbles: Cards;
  private germs: Germ[] = []; private germCards: Cards[] = []; private stinkM: Cards; private dome: THREE.Mesh; private dust: THREE.Points; private dustBase: Float32Array;
  private hero: THREE.Mesh; private heroTex: THREE.Texture[] = [];

  constructor() {
    this.sun.position.set(6, 10, 8);
    this.root.add(this.hemi, this.sun);
    for (const k of Object.keys(this.sets)) this.root.add(this.sets[k]);
    const R = rng(11);
    const shadowTex = D.tex(128, 128, (g) => D.shadow(g, 128));
    const bubTex = D.tex(128, 128, (g) => D2.bubble(g, 128));
    const stinkTex = D.tex(96, 256, (g) => D2.stink(g, 96, 256));

    // ---------------- hotel, de noche ----------------
    const H = this.sets.hotel;
    floor(H, 16, "#8a6f7c"); wall(H, 16, 7, -3, "#6460a8");
    flat(H, 1.5, 1.8, 0.2, 2.05, -2.97, "#1f2a5c");
    for (const [w, h, x, y] of [[1.7, 0.1, 0.2, 2.98], [1.7, 0.1, 0.2, 1.12], [0.1, 1.9, -0.58, 2.05], [0.1, 1.9, 0.98, 2.05], [0.06, 1.8, 0.2, 2.05]] as number[][]) box(H, w, h, 0.08, x, y, -2.95, "#e9e4f2");
    this.moon = flat(H, 0.55, 0.55, 0.52, 2.45, -2.96, "#ffffff", D.tex(128, 128, (g) => D2.moon(g, 128)));
    box(H, 2.1, 0.42, 2.3, -1.6, 0.21, -1.75, "#7a5440");            // base
    box(H, 2.0, 0.26, 2.2, -1.6, 0.55, -1.75, "#f1edf6");            // colchón
    box(H, 2.04, 0.3, 1.55, -1.6, 0.74, -1.36, "#d6266f");           // cobija
    box(H, 0.95, 0.2, 0.5, -1.6, 0.78, -2.5, "#ffffff");             // almohada
    box(H, 2.2, 1.35, 0.14, -1.6, 0.68, -2.92, "#7a5440");           // cabecera
    box(H, 2.0, 0.45, 0.85, 1.6, 0.225, -0.6, "#5a7fb8");            // sofá
    box(H, 2.0, 0.95, 0.24, 1.6, 0.6, -1.0, "#4f72a8");
    for (const s of [-1, 1]) box(H, 0.24, 0.68, 0.85, 1.6 + s * 1.1, 0.34, -0.6, "#4f72a8");
    for (const blink of [false, true]) this.sitTex.push(person({ ...LAURA, dress: undefined }, { mode: "sit", expr: "nervous", seed: 3, blink }));
    this.lauraSit = card(H, this.sitTex[0], PW, PH, PF);
    this.himHead = card(H, person(HIM, { mode: "stand", expr: "neutral", seed: 5, blink: true }, 0.4), PW, PH * 0.4, 0);
    this.zzz = flat(H, 0.5, 0.5, -1.05, 1.9, -2.3, "#ffffff", D.tex(128, 128, (g) => D2.zzz(g, 128)));

    // ---------------- baño ----------------
    const B = this.sets.bath;
    floor(B, 16, "#ffffff", tileTex("#eef2f5", "#d5dde4", 20, 20)); wall(B, 16, 7, -1.5, "#ffffff", tileTex("#c9ecec", "#a6d8d8", 26, 11));
    box(B, 2.4, 0.9, 0.7, 0.9, 0.45, -1.15, "#ffffff"); box(B, 2.5, 0.06, 0.78, 0.9, 0.93, -1.14, "#f3c9d9");
    box(B, 1.5, 1.2, 0.05, 0.9, 1.98, -1.47, "#d6266f"); flat(B, 1.36, 1.06, 0.9, 1.98, -1.43, "#e4f6ff");
    for (const e of ["nervous", "smile"] as const) for (const blink of [false, true]) this.bathTex.push(person(LAURA, { mode: "stand", expr: e, seed: 3, blink }));
    this.lauraBath = card(B, this.bathTex[0], PW, PH, PF);
    const soapCols = ["#6fb7ff", "#8fd94a", "#ffb84d", "#b58cf0", "#ff7f7f", "#46d6a8", "#ffd23f", "#35c3d9", "#ff9cc6", "#9fb4ff", "#f6a62b"];
    soapCols.forEach((c, i) => {
      const m = card(B, D.tex(200, 420, (g) => D2.soap(g, 1, c, i)), 0.2, 0.42, 10 / 420);
      if (i < 8) m.position.set(0.02 + i * 0.25, 0.96, -1.0 + (i % 2) * 0.16); else m.position.set(-1.25 + (i - 8) * 0.24, 0, 0.1 + (i - 8) * 0.14);
      this.soaps.push(m);
    });
    this.stinkB = new Cards(B, stinkTex, 0.26, 0.7, 6, { soft: true, order: 5 });
    this.bubB = new Cards(B, bubTex, 1, 1, 14, { soft: true, order: 5 });
    this.jar = card(B, D.tex(1200, 1240, (g) => D2.jar(g, 2)), 0.5, 0.517, 15 / 620);
    const gumTex = D.tex(800, 1040, (g) => D.gummy(g, 2));
    for (let i = 0; i < 2; i++) this.gums.push(card(B, gumTex, 0.16, 0.208, 15 / 520));
    this.shB = new Cards(B, shadowTex, 1, 1, 8, { flat: true, order: 0 });

    // ---------------- consultorio ----------------
    const C = this.sets.clinic;
    floor(C, 16, "#c9d6de"); wall(C, 16, 7, -1.5, "#dff3ee");
    box(C, 1.9, 0.78, 0.7, 0, 0.39, -1.1, "#b98a5e"); box(C, 2.0, 0.06, 0.78, 0, 0.81, -1.1, "#d3a878");
    flat(C, 0.7, 0.7, 0, 2.15, -1.46, "#ffffff", D.tex(128, 128, (g) => D2.poster(g, 128)));
    const cl = card(C, person(LAURA, { mode: "stand", expr: "smile", seed: 3 }), PW, PH, PF); cl.position.set(-0.52, 0, -0.2);
    const cd = card(C, person(DOC, { mode: "stand", expr: "smile", seed: 8 }), PW, PH, PF); cd.position.set(0.52, 0, -0.2);
    this.couple.push(cl, cd);
    this.shC = new Cards(C, shadowTex, 1, 1, 4, { flat: true, order: 0 });

    // ---------------- playa ----------------
    const S = this.sets.beach;
    this.skyB = sky(S, [[0, "#5a78d0"], [0.3, "#ff9d7a"], [0.46, "#ffd28a"], [0.5, "#ffe6b0"], [1, "#ffe6b0"]]);
    floor(S, 900, "#f1d6a0");
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 500).rotateX(-Math.PI / 2), toon("#3fa7dc")); sea.position.set(0, 0.03, -262); S.add(sea);
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(900, 1.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#ffffff" })); foam.position.set(0, 0.04, -12); foam.layers.set(NOINK); S.add(foam);
    const sunC = flat(S, 90, 90, 0, 20, -480, "#ffffff", D.tex(256, 256, (g) => D2.sun(g, 256))); (sunC.material as THREE.MeshBasicMaterial).fog = false;
    this.cloudsS = new Cards(S, D.tex(512, 256, (g) => D.cloud(g, 512, 256, "#ffd0c0")), 46, 23, 6);
    const b1 = card(S, person(HIM, { mode: "stand", expr: "smile", seed: 5 }), PW, PH, PF); b1.position.set(-0.45, 0, 0);
    const b2 = card(S, person(LAURA, { mode: "stand", expr: "smile", seed: 3 }), PW, PH, PF); b2.position.set(0.45, 0, 0);
    this.couple.push(b1, b2);
    this.heart = card(S, D.tex(256, 256, (g) => D2.heart(g, 256)), 0.5, 0.5, 0.5);
    this.shS = new Cards(S, shadowTex, 1, 1, 4, { flat: true, order: 0 });

    // ---------------- flora ----------------
    const M = this.sets.micro;
    this.skyM = sky(M, [[0, "#ff4f8e"], [0.28, "#ff86b0"], [0.46, "#ffc4d8"], [0.5, "#ffe3ec"], [1, "#ffe3ec"]]);
    const pinkTex = D.tex(512, 512, (g) => {
      const r = rng(3); g.fillStyle = "#ff9dbd"; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 46; i++) {
        const x = r() * 512, y = r() * 512, rad = 18 + r() * 46, c = r() < 0.5 ? "rgba(240,96,150,0.5)" : "rgba(255,200,220,0.55)";
        for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) { g.beginPath(); g.ellipse(x + ox, y + oy, rad, rad * 0.7, r() * 3, 0, 6.3); g.fillStyle = c; g.fill(); }
      }
    });
    pinkTex.wrapS = pinkTex.wrapT = THREE.RepeatWrapping; pinkTex.repeat.set(40, 40);
    floor(M, 500, "#ffffff", pinkTex);
    for (const [x, z, r, c] of [[-50, -85, 40, "#ff7fab"], [40, -100, 52, "#f56c9f"], [100, -70, 34, "#ff8fb6"], [-110, -60, 44, "#f56c9f"], [0, -150, 70, "#ff7fab"]] as [number, number, number, string][]) {
      const h = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 20), toon(c)); h.scale.y = 0.34; h.position.set(x, -1, z); M.add(h);
    }
    const towerCols = ["#e9548f", "#ff86b0", "#d6266f", "#ff9cc6"];
    for (let i = 0; i < 22; i++) {
      const side = i % 2 ? 1 : -1, x = side * (18 + R() * 26), z = 4 - R() * 62, rad = 1.2 + R() * 1.6, len = 3 + R() * 9;
      const t = new THREE.Mesh(new THREE.CapsuleGeometry(rad, len, 8, 20), toon(towerCols[i % 4])); t.position.set(x, len / 2 - 0.5, z); t.rotation.z = (R() - 0.5) * 0.25; M.add(t);
    }
    for (let z = 2; z > -34; z -= 1.6) for (let x = -13; x <= 13.2; x += 1.45) {
      const mx = x + (R() - 0.5) * 0.8, mz = z + (R() - 0.5) * 0.8;
      if (Math.hypot(mx - HERO[0], mz - HERO[2]) < 2.0) continue;
      const r = R(), tier = r < 0.13 ? 0 : r < 0.32 ? 1 : 2, cx = Math.max(-9, Math.min(9.5, mx));
      this.crowd.push({ x: mx, z: mz, col: Math.floor(R() * 4), ph: R() * 6.28, tier, sc: 0.85 + R() * 0.3,
        fr: T.wave0 + ((cx + 9) / 18.5) * (T.wave1 - T.wave0), fo: T.loss + R() * 22, fb: Math.min(664, T.regrow + Math.hypot(mx, mz - 3) * 1.1) });
    }
    for (let c = 0; c < 4; c++) for (const [f, a] of LOOKS) this.crowdCards.push(new Cards(M, D.tex(480, 768, (g) => D.lacto(g, 1.2, D.LACTO_COLS[c], f, a)), 1.0, 1.6, this.crowd.length, { foot: 20 / 640 }));
    this.shM = new Cards(M, shadowTex, 1, 1, this.crowd.length + 16, { flat: true, order: 0 });
    this.drops = new Cards(M, D.tex(128, 128, (g) => D.drop(g, 128)), 1, 1, 100, { soft: true, order: 5 });
    this.puffs = new Cards(M, D.tex(256, 256, (g) => D.puff(g, 256)), 1, 1, this.crowd.length, { soft: true, order: 6 });
    this.bubbles = new Cards(M, bubTex, 1, 1, 70, { soft: true, order: 7 });
    this.stinkM = new Cards(M, stinkTex, 0.7, 1.9, 30, { soft: true, order: 6 });
    for (let kind = 0; kind < 2; kind++) for (const dz of [false, true]) this.germCards.push(new Cards(M, D.tex(600, 600, (g) => D.germ(g, 1.5, kind, dz)), 2.2, 2.2, 14, { foot: 0.5 }));
    for (let i = 0; i < 11; i++) {
      let x = 0, z = 0; do { x = -7.5 + R() * 15; z = -12 + R() * 14; } while (Math.hypot(x - HERO[0], z - HERO[2]) < 2.2);
      this.germs.push({ x, z, t0: T.germs + i * 2.4, kind: i % 2 });
    }
    const honey = D.tex(512, 512, (g) => {
      g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 5;
      const s = 64, hh = s * 0.866;
      for (let row = -1; row < 12; row++) for (let colm = -1; colm < 10; colm++) {
        const cx = colm * s * 1.5, cy = row * hh * 2 + (colm % 2 ? hh : 0);
        g.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283; g.lineTo(cx + Math.cos(a) * s * 0.92, cy + Math.sin(a) * s * 0.92); } g.closePath(); g.stroke();
      }
      g.fillStyle = "rgba(255,255,255,0.28)"; g.fillRect(0, 0, 512, 512);
    });
    honey.wrapS = honey.wrapT = THREE.RepeatWrapping; honey.repeat.set(14, 5);
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(DOME.r, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: honey, color: "#fff2a0", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    this.dome.scale.y = DOME.h / DOME.r; this.dome.position.set(...DOME.c); this.dome.layers.set(NOINK); this.dome.renderOrder = 4; M.add(this.dome);
    const N = 260; this.dustBase = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { this.dustBase[i * 3] = (R() - 0.5) * 50; this.dustBase[i * 3 + 1] = R() * 16; this.dustBase[i * 3 + 2] = 16 - R() * 60; }
    const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(this.dustBase.slice(), 3));
    this.dust = new THREE.Points(dg, new THREE.PointsMaterial({ map: D.tex(64, 64, (g) => D.drop(g, 64)), size: 0.34, transparent: true, depthWrite: false, color: "#fff7d6", opacity: 0.8 }));
    this.dust.layers.set(NOINK); this.dust.frustumCulled = false; this.dust.renderOrder = 3; M.add(this.dust);
    const hi = (f: D.Face, a: "down" | "up") => D.tex(1200, 1920, (g) => D.lacto(g, 3, D.LACTO_COLS[0], f, a));
    this.heroTex = [hi("happy", "down"), hi("happy", "up"), hi("blink", "down"), hi("shock", "down"), hi("nervous", "down")];
    this.hero = card(M, this.heroTex[0], 1.0, 1.6, 20 / 640);
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): THREE.Vector3 {
    const shot = SHOTS[id - 1], c = camAt(id, f), set = shot.set;
    cam.position.set(...c.pos); cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix();
    const target = new THREE.Vector3(...c.look); cam.lookAt(target); cam.updateMatrixWorld(); cam.layers.enable(NOINK);
    for (const k of Object.keys(this.sets)) this.sets[k].visible = k === set;
    scene.fog = this.fogs[set]; scene.background = null;
    const night = set === "hotel";
    this.hemi.intensity = night ? 1.0 : 1.25; this.hemi.color.set(night ? "#aab4ff" : "#ffffff");
    this.sun.intensity = night ? 1.3 : 2.2; this.sun.color.set(night ? "#9fb0ff" : set === "beach" ? "#ffd9b0" : "#fff4e6");
    const q = cam.quaternion;
    if (set === "hotel") this.poseHotel(f, q);
    else if (set === "bath") this.poseBath(id, f, q);
    else if (set === "clinic") this.poseClinic(f, q);
    else if (set === "beach") { this.skyB.position.copy(cam.position); this.poseBeach(f, q); }
    else { this.skyM.position.copy(cam.position); this.poseMicro(id, f, q); }
    return target;
  }

  private poseHotel(f: number, q: THREE.Quaternion) {
    const blink = (f >= 70 && f < 74) || (f >= 96 && f < 99);
    setMap(this.lauraSit, this.sitTex[blink ? 1 : 0]); tint(this.lauraSit, 0.8, 0.82, 1.0);
    this.lauraSit.quaternion.copy(q); this.lauraSit.position.set(1.6, 0.4, -0.16);
    tint(this.himHead, 0.8, 0.82, 1.0);
    this.himHead.quaternion.copy(q).multiply(_qr.setFromAxisAngle(Z, 0.12)); this.himHead.position.set(-1.6, 0.74 + 0.012 * Math.sin(f * 0.1), -2.2);
    const u = ((f % 46) + 46) % 46 / 46;
    this.zzz.quaternion.copy(q); this.zzz.position.set(-1.0 + 0.25 * u, 1.75 + 0.5 * u, -2.2); this.zzz.scale.setScalar(0.5 + 0.8 * Math.sin(u * Math.PI));
    this.moon.scale.setScalar(1 + 0.02 * Math.sin(f * 0.08));
  }

  private poseBath(id: number, f: number, q: THREE.Quaternion) {
    const day = id === 7, blink = (f >= 140 && f < 144) || (f >= 690 && f < 694);
    setMap(this.lauraBath, this.bathTex[(day ? 2 : 0) + (blink ? 1 : 0)]);
    this.lauraBath.quaternion.copy(q); this.lauraBath.position.set(-0.5, 0, -0.3);
    this.lauraBath.scale.set(1, 1 + 0.008 * Math.sin(f * 0.12), 1);
    this.shB.begin(); this.shB.add(-0.5, 0.03, -0.3, 1.2, 0.55, q);
    this.soaps.forEach((s, i) => { s.visible = !day; s.quaternion.copy(q); if (i >= 8 && !day) this.shB.add(s.position.x, 0.03, s.position.z, 0.28, 0.14, q); });
    this.stinkB.begin(); this.bubB.begin();
    if (!day) {
      const on = smooth((f - 124) / 14);
      for (let i = 0; i < 5; i++) {
        const u = (((f + i * 9.7) % 40) + 40) % 40 / 40, s = Math.sin(u * Math.PI) * on, x = -0.5 + (i % 2 ? 1 : -1) * (0.5 + 0.12 * (i % 3));
        this.stinkB.add(x + 0.05 * Math.sin(u * 6 + i), 0.85 + u * 0.9, -0.28, s, s, q);
      }
      for (let i = 0; i < 12; i++) {
        const u = (((f * 0.6 + i * 13) % 90) + 90) % 90 / 90, s = (0.08 + 0.06 * (i % 3)) * Math.sin(u * Math.PI);
        this.bubB.add(-1.6 + (i * 0.37) % 3.6 + 0.1 * Math.sin(f * 0.05 + i), 0.5 + u * 2.2, -0.9 + (i % 4) * 0.25, s, s, q);
      }
    }
    this.stinkB.end(); this.bubB.end();
    // tarro y gomitas (solo de día)
    const ju = (f - T.jar) / 10, js = backOut(ju);
    this.jar.visible = day; this.jar.quaternion.copy(q); this.jar.position.set(...JAR);
    const br = 1 + 0.012 * Math.sin(f * 0.15); this.jar.scale.set(js * br, js * (2 - br), 1);
    if (day) this.shB.add(JAR[0], JAR[1] + 0.005, JAR[2], 0.62 * js, 0.26 * js, q);
    this.gums.forEach((g, i) => {
      const u = (f - T.gum[i]) / 9, x = JAR[0] + (i ? 0.38 : -0.38), z = JAR[2] + 0.1, base = JAR[1];
      g.visible = day && u >= 0;
      const y = u < 1 ? 0.7 * (1 - u * u) : 0.05 * Math.abs(Math.sin((u - 1) * 2.4)) * Math.max(0, 1 - (u - 1) / 3);
      const sq = u >= 1 && u < 1.8 ? 0.2 * Math.sin(((u - 1) / 0.8) * Math.PI) : 0;
      g.quaternion.copy(q); g.position.set(x, base + y, z); g.scale.set(1 + sq, 1 - sq, 1);
    });
    this.shB.end();
  }

  private poseClinic(f: number, q: THREE.Quaternion) {
    this.shC.begin();
    for (let i = 0; i < 2; i++) {
      const m = this.couple[i]; m.quaternion.copy(q); m.position.y = 0.05 * Math.abs(Math.sin(f * 0.2 + i * 1.5)) * (i ? 0.4 : 1);
      this.shC.add(m.position.x, 0.03, m.position.z, 1.2, 0.55, q);
    }
    this.shC.end();
  }

  private poseBeach(f: number, q: THREE.Quaternion) {
    this.shS.begin();
    for (let i = 2; i < 4; i++) {
      const m = this.couple[i]; m.quaternion.copy(q); m.position.y = 0.06 * Math.abs(Math.sin(f * 0.22 + i));
      this.shS.add(m.position.x, 0.03, m.position.z, 1.2, 0.55, q);
    }
    this.shS.end();
    this.cloudsS.begin();
    for (let i = 0; i < 5; i++) this.cloudsS.add(-130 + i * 62 + f * 0.01 * (1 + (i % 3)), 42 + (i % 3) * 10, -330 - (i % 2) * 40, 1.3, 1.1, q);
    this.cloudsS.end();
    const hu = (f - T.heart) / 9, hs = backOut(hu);
    this.heart.visible = hu > 0; this.heart.quaternion.copy(q); this.heart.position.set(0, 2.5 + 0.05 * Math.sin(f * 0.25), 0); this.heart.scale.set(hs, hs, 1);
  }

  private poseMicro(id: number, f: number, q: THREE.Quaternion) {
    for (const c of this.crowdCards) c.begin();
    this.shM.begin(); this.puffs.begin(); this.drops.begin(); this.bubbles.begin(); this.stinkM.begin();
    const puffAt = (m: Member, t0: number) => { const u = (f - t0) / 11; if (u >= 0 && u < 1) { const ps = (0.6 + 1.5 * Math.sin(u * Math.PI)) * (1 - u * 0.4); this.puffs.add(m.x, 0.8, m.z, ps, ps, q); } };
    const present: boolean[] = [];
    for (let i = 0; i < this.crowd.length; i++) {
      const m = this.crowd[i];
      let s = 1, look = 0, dx = 0, y = 0;
      const pump = Math.floor(f / 7 + m.ph) % 2;
      if (id === 3) {
        if (m.tier === 2) s = 0;
        else if (m.tier === 1 && f >= m.fr) { s = f < m.fr + 4 ? 1 - (f - m.fr) / 4 : 0; puffAt(m, m.fr); }
        look = f > T.wave0 - 14 ? 2 : 3; dx = 0.014 * Math.sin(f * 2.3 + m.ph);
      } else if (id === 4) {
        if (f < T.loss) { look = f >= T.dome - 10 || f < 380 ? pump : 0; y = 0.09 * Math.abs(Math.sin(f * 0.26 + m.ph)); }
        else if (m.tier > 0 && f >= m.fo) { s = f < m.fo + 4 ? 1 - (f - m.fo) / 4 : 0; puffAt(m, m.fo); }
        else { look = f < T.stink ? 2 : 3; dx = 0.014 * Math.sin(f * 2.3 + m.ph); }
      } else {
        if (m.tier > 0) s = f >= m.fb ? backOut((f - m.fb) / 9) : 0;
        if (f >= 636) { look = f >= 650 ? pump : 0; y = 0.1 * Math.abs(Math.sin(f * 0.3 + m.ph)); } else { look = 3; dx = 0.014 * Math.sin(f * 2.3 + m.ph); }
      }
      present.push(s > 0.5);
      if (s <= 0.01) continue;
      const sc = m.sc * s;
      this.crowdCards[m.col * 4 + look].add(m.x + dx, y, m.z, sc, sc * (1 + 0.03 * Math.sin(f * 0.26 + m.ph)), q);
      this.shM.add(m.x, 0.03, m.z, 0.95 * sc, 0.5 * sc, q);
    }
    // gotas de ácido láctico
    const dropOn = id === 4 ? smooth((f - 440) / 20) * (1 - smooth((f - T.loss) / 12)) : id === 6 ? smooth((f - 648) / 16) : 0;
    if (dropOn > 0.01) for (let j = 0; j < 96; j++) {
      const k = (j * 37) % this.crowd.length, m = this.crowd[k];
      if (!present[k]) continue;
      const u = (((f + j * 5.3) % 44) + 44) % 44 / 44, s = 0.5 * Math.sin(u * Math.PI) * dropOn;
      this.drops.add(m.x + 0.25 * Math.sin(u * 5 + j), 1.5 + u * 7.5, m.z, s, s, q);
    }
    // ola de jabón
    if (id === 3 && f >= T.wave0 - 8 && f <= T.wave1 + 14) {
      const wx = lerp(-9, 9.5, (f - T.wave0) / (T.wave1 - T.wave0));
      for (let j = 0; j < 64; j++) {
        const a = Math.sin(j * 12.9898) * 43758.5453, r1 = a - Math.floor(a), b = Math.sin(j * 78.233) * 12345.678, r2 = b - Math.floor(b);
        const s = 0.5 + 0.9 * ((j * 7) % 10) / 10;
        this.bubbles.add(wx - 2.6 * r1 * r1 + 0.2 * Math.sin(f * 0.3 + j), 0.3 + 3.6 * r2 * r2 + 0.15 * Math.sin(f * 0.2 + j * 2), 4.2 - 16 * ((j * 0.618) % 1), s, s, q);
      }
    }
    // intrusos en el suelo
    for (const c of this.germCards) c.begin();
    for (const g of this.germs) {
      if (id === 4) {
        if (f < g.t0) continue;
        const u = clamp01((f - g.t0) / 20), yy = 1.1 + 16 * (1 - u) * (1 - u), sq = u >= 1 ? 0.06 * Math.sin(f * 0.3 + g.x) : 0;
        this.germCards[g.kind * 2].add(g.x, yy, g.z, 1 + sq, 1 - sq, q, 0.08 * Math.sin(f * 0.2 + g.z));
        if (u >= 1) this.shM.add(g.x, 0.03, g.z, 1.7, 0.8, q);
        if (f >= T.stink) for (let k = 0; k < 2; k++) { const w = (((f + k * 17 + g.x * 9) % 34) + 34) % 34 / 34, s = Math.sin(w * Math.PI) * smooth((f - T.stink) / 10); this.stinkM.add(g.x + (k ? 0.7 : -0.7), 1.6 + w * 2.2, g.z, s, s, q); }
      } else if (id === 6) {
        const u = clamp01((f - 626 - (g.kind ? 4 : 0)) / 18), s = 1 - smooth(u);
        if (s > 0.01) this.germCards[g.kind * 2 + (u > 0 ? 1 : 0)].add(g.x, 1.1 + 5 * u, g.z, s, s, q, u * 5);
      }
    }
    for (const c of this.germCards) c.end();
    // cúpula de ácido
    const a = id === 3 ? 0.12 : id === 4 ? (0.55 + 0.45 * smooth((f - T.dome) / 16)) * (1 - smooth((f - T.loss) / 24)) : smooth((f - 634) / 34);
    const dm = this.dome.material as THREE.MeshBasicMaterial; dm.opacity = 0.2 * a; this.dome.visible = dm.opacity > 0.004; dm.map!.offset.x = f * 0.0006;
    const pos = this.dust.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setXYZ(i, this.dustBase[i * 3] + 0.4 * Math.sin(f * 0.02 + i), (this.dustBase[i * 3 + 1] + f * 0.012 * (1 + (i % 3))) % 16, this.dustBase[i * 3 + 2]);
    pos.needsUpdate = true;
    // protagonista
    let t = 0, y = 0.05 * Math.abs(Math.sin(f * 0.22)), sq = 0;
    if (id === 3) { t = f > T.wave0 - 6 ? 3 : 4; y = 0; }
    else if (id === 4) {
      if (f >= T.wave && f < 468) { t = 1; y = 0.12 * Math.abs(Math.sin((f - T.wave) * 0.4)); }
      else if (f >= T.dome && f < T.loss) { t = Math.floor(f / 7) % 2; sq = 0.05 * Math.sin(f * 0.9); }
      else if (f >= T.loss) { t = f < T.stink ? 3 : 4; y = 0; }
      else if (f >= 410 && f < 414) t = 2;
    } else { t = f >= 636 ? (f >= 650 ? Math.floor(f / 7) % 2 : 0) : 4; }
    setMap(this.hero, this.heroTex[t]);
    this.hero.quaternion.copy(q); this.hero.position.set(HERO[0] + (t === 4 ? 0.012 * Math.sin(f * 2.3) : 0), y, HERO[2]); this.hero.scale.set(1 + sq, 1 - sq, 1);
    this.shM.add(HERO[0], 0.03, HERO[2], 1.0, 0.5, q);
    for (const c of this.crowdCards) c.end();
    this.shM.end(); this.puffs.end(); this.drops.end(); this.bubbles.end(); this.stinkM.end();
  }
}
