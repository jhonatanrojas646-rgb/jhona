// Los dos escenarios del short de Nurea, posados por cuadro (función pura de toma + cuadro):
//  - "garden": el jardín con ella, las flores, la maleza y el frasco.
//  - "micro": el mundo rosado de la flora, con los lactobacilos, los intrusos, la cápsula y la gomita.
// Mundo 3D con sombreado de dos tonos y tinta; personajes planos en tarjetas que miran a la cámara (capa NOINK).
import * as THREE from "three";
import { NOINK } from "../alejandro/ink";
import { Pen, bodyFront, Outfit } from "../alejandro/toon";
import { grassHD, rep } from "../alejandro/paint";
import * as D from "./draw";
import { SHOTS, camAt, T, HERO, GUMMY, WEED, BOTTLE, smooth, clamp01, lerp } from "./story";

export const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const backOut = (x: number) => { const u = clamp01(x), c = 1.70158; return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2; };

const GRAD = (() => {
  const t = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
export const toon = (color: string, map?: THREE.Texture) => new THREE.MeshToonMaterial({ color, gradientMap: GRAD, map: map ?? null });
export const cardMat = (t: THREE.Texture) => new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide });
export const softMat = (t: THREE.Texture) => new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, side: THREE.DoubleSide });

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _q = new THREE.Quaternion(), _qr = new THREE.Quaternion();
const Z = new THREE.Vector3(0, 0, 1), ID = new THREE.Quaternion();

/** muchas tarjetas iguales en una sola malla */
export class Cards {
  mesh: THREE.InstancedMesh; n = 0; flat: boolean;
  constructor(parent: THREE.Object3D, t: THREE.Texture, w: number, h: number, cap: number, o: { soft?: boolean; foot?: number; flat?: boolean; order?: number } = {}) {
    const geo = new THREE.PlaneGeometry(w, h);
    this.flat = !!o.flat;
    if (o.flat) geo.rotateX(-Math.PI / 2); else geo.translate(0, h * (0.5 - (o.foot ?? 0)), 0);
    this.mesh = new THREE.InstancedMesh(geo, o.soft || o.flat ? softMat(t) : cardMat(t), Math.max(1, cap));
    this.mesh.frustumCulled = false; this.mesh.layers.set(NOINK); this.mesh.renderOrder = o.order ?? 1; this.mesh.count = 0;
    parent.add(this.mesh);
  }
  begin() { this.n = 0; }
  add(x: number, y: number, z: number, sx: number, sy: number, q: THREE.Quaternion, roll = 0) {
    _q.copy(this.flat ? ID : q); if (roll) _q.multiply(_qr.setFromAxisAngle(Z, roll));
    if (this.flat) _s.set(sx, 1, sy); else _s.set(sx, sy, 1);
    _m.compose(_p.set(x, y, z), _q, _s); this.mesh.setMatrixAt(this.n++, _m);
  }
  end() { this.mesh.count = this.n; this.mesh.instanceMatrix.needsUpdate = true; }
}
/** una tarjeta suelta en alta resolución */
export const card = (parent: THREE.Object3D, t: THREE.Texture, w: number, h: number, foot = 0) => {
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h * (0.5 - foot), 0);
  const m = new THREE.Mesh(geo, cardMat(t)); m.layers.set(NOINK); m.renderOrder = 2; m.frustumCulled = false; parent.add(m); return m;
};
export const sky = (parent: THREE.Object3D, stops: [number, string][]) => {
  const t = D.tex(8, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); for (const [a, c] of stops) gr.addColorStop(a, c); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); });
  const m = new THREE.Mesh(new THREE.SphereGeometry(800, 24, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.layers.set(NOINK); m.renderOrder = -10; m.frustumCulled = false; parent.add(m); return m;
};

type Member = { x: number; z: number; col: number; ph: number; rm: boolean; fr: number; fb: number; sc: number };
type Flower = { x: number; z: number; v: number; sc: number; ph: number; near: number };
type Germ = { x: number; z: number; land: number; t0: number; kind: number; dx: number; dz: number };

const LOOKS: [D.Face, "down" | "up"][] = [["happy", "down"], ["happy", "up"], ["shock", "down"], ["nervous", "down"]];
const DOME = { c: [0, 0, -8] as [number, number, number], r: 22, h: 11 };
const domeY = (x: number, z: number) => DOME.h * Math.sqrt(Math.max(0, 1 - ((x - DOME.c[0]) ** 2 + (z - DOME.c[2]) ** 2) / DOME.r ** 2));
const FOUR: [number, number][] = [[-1.55, 2.7], [-0.78, 3.2], [0.78, 3.2], [1.55, 2.7]];

export class World {
  root = new THREE.Group();
  private garden = new THREE.Group(); private micro = new THREE.Group();
  private skyG: THREE.Mesh; private skyM: THREE.Mesh;
  private fogG = new THREE.Fog("#d6ecf7", 40, 260); private fogM = new THREE.Fog("#ffc9db", 45, 260);
  // jardín
  private flowers: Flower[] = []; private flowerCards: Cards[] = []; private clouds: Cards; private shG: Cards;
  private woman: THREE.Mesh; private womanTex: THREE.Texture[] = []; private weed: THREE.Mesh; private bottle: THREE.Mesh; private gums: THREE.Mesh[] = [];
  // flora
  private crowd: Member[] = []; private crowdCards: Cards[] = []; private shM: Cards; private drops: Cards; private puffs: Cards;
  private germs: Germ[] = []; private germCards: Cards[] = []; private dome: THREE.Mesh; private dust: THREE.Points; private dustBase: Float32Array;
  private hero: THREE.Mesh; private heroTex: THREE.Texture[] = []; private four: THREE.Mesh[] = []; private fourTex: THREE.Texture[][] = [];
  private gummy: THREE.Mesh; private pill: THREE.Mesh; private yogurt: THREE.Mesh;

  constructor() {
    this.root.add(new THREE.HemisphereLight(0xffffff, 0xb08a9a, 1.25));
    const sun = new THREE.DirectionalLight(0xfff4e6, 2.2); sun.position.set(6, 10, 8); this.root.add(sun);
    this.root.add(this.garden, this.micro);
    const R = rng(7);

    // ---------------- jardín ----------------
    this.skyG = sky(this.garden, [[0, "#3f86d8"], [0.3, "#6aa6e6"], [0.47, "#cfe6f5"], [0.5, "#e6f3fa"], [1, "#e6f3fa"]]);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), toon("#ffffff", rep(grassHD(), 70, 70)));
    this.garden.add(ground);
    for (const [x, z, r, c] of [[-45, -95, 42, "#69b84a"], [35, -115, 58, "#5cab45"], [95, -85, 36, "#72c050"], [-105, -75, 46, "#5cab45"], [0, -170, 75, "#7cc65a"]] as [number, number, number, string][]) {
      const h = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 20), toon(c)); h.scale.y = 0.3; h.position.set(x, -1, z); this.garden.add(h);
    }
    const leafCols = ["#3f9d4b", "#58b55a", "#ff9cc6", "#4aa84f", "#ff86b8"];
    for (let i = 0; i < 16; i++) {
      const side = i % 2 ? 1 : -1, x = side * (15.5 + R() * 16), z = -4 - R() * 46, s = 0.9 + R() * 0.7;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.34 * s, 2.4 * s, 12), toon("#8a5a3a")); trunk.position.set(x, 1.2 * s, z);
      const top = new THREE.Mesh(new THREE.SphereGeometry(1.7 * s, 20, 14), toon(leafCols[i % leafCols.length])); top.position.set(x, 3.3 * s, z); top.scale.y = 0.9;
      this.garden.add(trunk, top);
    }
    this.clouds = new Cards(this.garden, D.tex(512, 256, (g) => D.cloud(g, 512, 256, "#ffffff")), 46, 23, 8);
    this.shG = new Cards(this.garden, D.tex(128, 128, (g) => D.shadow(g, 128)), 1, 1, 16, { flat: true, order: 0 });
    for (let v = 0; v < 5; v++) this.flowerCards.push(new Cards(this.garden, D.tex(300, 600, (g) => D.flower(g, 1, v)), 0.5, 1.0, 1500, { foot: 10 / 600 }));
    const addFlower = (x: number, z: number, near = 0) => this.flowers.push({ x, z, v: Math.floor(R() * 5), sc: 0.75 + R() * 0.55, ph: R() * 6.28, near });
    for (let z = 3.3; z > -30; z -= 0.6) for (let x = -13; x < 15.5; x += 0.6) {
      const fx = x + (R() - 0.5) * 0.42, fz = z + (R() - 0.5) * 0.42;
      if (Math.abs(fx) < 1.25 && fz > -0.6) continue;
      if (Math.hypot(fx, fz) < 0.95) continue;
      if (z < -14 && R() < 0.35) continue;
      addFlower(fx, fz);
    }
    for (let z = 5.4; z < 8.7; z += 0.5) for (let x = 3.4; x < 8.2; x += 0.5) {
      const fx = x + (R() - 0.5) * 0.3, fz = z + (R() - 0.5) * 0.3, d = Math.hypot(fx - WEED[0], fz - WEED[2]);
      if (d < 0.5) continue;
      if (Math.abs(fx - 6.0) < 1.0 && fz > 7.7) continue;
      addFlower(fx, fz, d < 1.2 ? 1 : 0);
    }
    // ella
    const outfit: Outfit = { jacket: "#ff6fa5", pants: "#ff6fa5", boots: "#ffffff", hat: "hair", hair: "#4a2a1a", dress: "#ff6fa5", skin: "#f5c9a0" };
    for (const blink of [false, true]) this.womanTex.push(D.tex(1200, 2000, (g) => { g.setTransform(2, 0, 0, 2, 0, 0); bodyFront(new Pen(g), outfit, { mode: "stand", expr: "smile", seed: 3, blink }); }));
    this.woman = card(this.garden, this.womanTex[0], 1.296, 2.16, 25 / 1000);
    this.weed = card(this.garden, D.tex(600, 800, (g) => D.weed(g, 2)), 0.75, 1.0, 10 / 400);
    this.bottle = card(this.garden, D.tex(1000, 1600, (g) => D.bottle(g, 2)), 0.84, 1.344, 15 / 800);
    const gumTex = D.tex(800, 1040, (g) => D.gummy(g, 2));
    for (let i = 0; i < 2; i++) this.gums.push(card(this.garden, gumTex, 0.4, 0.52, 15 / 520));

    // ---------------- flora ----------------
    this.skyM = sky(this.micro, [[0, "#ff4f8e"], [0.28, "#ff86b0"], [0.46, "#ffc4d8"], [0.5, "#ffe3ec"], [1, "#ffe3ec"]]);
    const pinkTex = D.tex(512, 512, (g) => {
      const r = rng(3); g.fillStyle = "#ff9dbd"; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 46; i++) {
        const x = r() * 512, y = r() * 512, rad = 18 + r() * 46, c = r() < 0.5 ? "rgba(240,96,150,0.5)" : "rgba(255,200,220,0.55)";
        for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) { g.beginPath(); g.ellipse(x + ox, y + oy, rad, rad * 0.7, r() * 3, 0, 6.3); g.fillStyle = c; g.fill(); }
      }
    });
    pinkTex.wrapS = pinkTex.wrapT = THREE.RepeatWrapping; pinkTex.repeat.set(40, 40);
    this.micro.add(new THREE.Mesh(new THREE.PlaneGeometry(500, 500).rotateX(-Math.PI / 2), toon("#ffffff", pinkTex)));
    for (const [x, z, r, c] of [[-50, -85, 40, "#ff7fab"], [40, -100, 52, "#f56c9f"], [100, -70, 34, "#ff8fb6"], [-110, -60, 44, "#f56c9f"], [0, -150, 70, "#ff7fab"]] as [number, number, number, string][]) {
      const h = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 20), toon(c)); h.scale.y = 0.34; h.position.set(x, -1, z); this.micro.add(h);
    }
    const towerCols = ["#e9548f", "#ff86b0", "#d6266f", "#ff9cc6"];
    for (let i = 0; i < 22; i++) {
      const side = i % 2 ? 1 : -1, x = side * (18 + R() * 26), z = 4 - R() * 62, rad = 1.2 + R() * 1.6, len = 3 + R() * 9;
      const t = new THREE.Mesh(new THREE.CapsuleGeometry(rad, len, 8, 20), toon(towerCols[i % 4])); t.position.set(x, len / 2 - 0.5, z); t.rotation.z = (R() - 0.5) * 0.25;
      this.micro.add(t);
    }
    // multitud
    for (let z = 2; z > -34; z -= 1.6) for (let x = -13; x <= 13.2; x += 1.45) {
      const mx = x + (R() - 0.5) * 0.8, mz = z + (R() - 0.5) * 0.8;
      if (Math.hypot(mx - 0, mz - 1.8) < 2.9) continue;
      const rm = R() < 0.74, cx = Math.max(-8, Math.min(8.5, mx));
      this.crowd.push({ x: mx, z: mz, col: Math.floor(R() * 4), ph: R() * 6.28, rm, sc: 0.85 + R() * 0.3,
        fr: T.pill0 + ((cx + 8) / 16.5) * (T.pill1 - T.pill0) + 1, fb: Math.min(T.regrow1 - 6, T.regrow0 + Math.hypot(mx - GUMMY[0], mz - GUMMY[2]) * 1.3) });
    }
    for (let c = 0; c < 4; c++) for (const [f, a] of LOOKS) this.crowdCards.push(new Cards(this.micro, D.tex(480, 768, (g) => D.lacto(g, 1.2, D.LACTO_COLS[c], f, a)), 1.0, 1.6, this.crowd.length, { foot: 20 / 640 }));
    this.shM = new Cards(this.micro, D.tex(128, 128, (g) => D.shadow(g, 128)), 1, 1, this.crowd.length + 12, { flat: true, order: 0 });
    this.drops = new Cards(this.micro, D.tex(128, 128, (g) => D.drop(g, 128)), 1, 1, 100, { soft: true, order: 5 });
    this.puffs = new Cards(this.micro, D.tex(256, 256, (g) => D.puff(g, 256)), 1, 1, this.crowd.length, { soft: true, order: 6 });
    for (let kind = 0; kind < 2; kind++) for (const dz of [false, true]) this.germCards.push(new Cards(this.micro, D.tex(600, 600, (g) => D.germ(g, 1.5, kind, dz)), 3.4, 3.4, 14, { foot: 0.5 }));
    for (let i = 0; i < 12; i++) {
      const x = -8 + R() * 13, z = -10 + R() * 11;
      this.germs.push({ x, z, land: domeY(x, z) - 1.2, t0: T.germs0 + i * 3.4 + R() * 3, kind: i % 2, dx: (R() - 0.3) * 9, dz: (R() - 0.5) * 6 });
    }
    // cúpula de ácido
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
    this.dome.scale.y = DOME.h / DOME.r; this.dome.position.set(...DOME.c); this.dome.layers.set(NOINK); this.dome.renderOrder = 4; this.micro.add(this.dome);
    // polvo flotante
    const N = 260; this.dustBase = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { this.dustBase[i * 3] = (R() - 0.5) * 50; this.dustBase[i * 3 + 1] = R() * 16; this.dustBase[i * 3 + 2] = 16 - R() * 60; }
    const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(this.dustBase.slice(), 3));
    this.dust = new THREE.Points(dg, new THREE.PointsMaterial({ map: D.tex(64, 64, (g) => D.drop(g, 64)), size: 0.34, transparent: true, depthWrite: false, color: "#fff7d6", opacity: 0.8 }));
    this.dust.layers.set(NOINK); this.dust.frustumCulled = false; this.dust.renderOrder = 3; this.micro.add(this.dust);
    // protagonistas
    const hi = (c: number, f: D.Face, a: "down" | "up") => D.tex(1200, 1920, (g) => D.lacto(g, 3, D.LACTO_COLS[c], f, a));
    this.heroTex = [hi(0, "happy", "down"), hi(0, "happy", "up"), hi(0, "blink", "down"), hi(0, "shock", "down"), hi(0, "nervous", "down")];
    this.hero = card(this.micro, this.heroTex[0], 1.0, 1.6, 20 / 640);
    for (let k = 0; k < 4; k++) { this.fourTex.push([hi(k, "happy", "down"), hi(k, "happy", "up")]); this.four.push(card(this.micro, this.fourTex[k][0], 1.0, 1.6, 20 / 640)); }
    this.gummy = card(this.micro, D.tex(1200, 1560, (g) => D.gummy(g, 3)), 1.35, 1.755, 15 / 520);
    this.pill = card(this.micro, D.tex(1400, 600, (g) => D.capsule(g, 2)), 3.0, 1.286, 0.5);
    this.yogurt = card(this.micro, D.tex(600, 760, (g) => D.yogurt(g, 2)), 0.62, 0.785, 10 / 380);
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): THREE.Vector3 {
    const shot = SHOTS[id - 1], c = camAt(id, f), isG = shot.set === "garden";
    cam.position.set(...c.pos); cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix();
    const target = new THREE.Vector3(...c.look); cam.lookAt(target); cam.updateMatrixWorld(); cam.layers.enable(NOINK);
    this.garden.visible = isG; this.micro.visible = !isG;
    scene.fog = isG ? this.fogG : this.fogM; scene.background = null;
    (isG ? this.skyG : this.skyM).position.copy(cam.position);
    const q = cam.quaternion;
    if (isG) this.poseGarden(id, f, q); else this.poseMicro(id, f, q, c.pos);
    return target;
  }

  private poseGarden(id: number, f: number, q: THREE.Quaternion) {
    for (const c of this.flowerCards) c.begin();
    const close = smooth((f - T.weedDown) / 16);
    for (const fl of this.flowers) {
      let x = fl.x, z = fl.z;
      if (fl.near) { x = lerp(x, WEED[0] + (x - WEED[0]) * 0.42, close); z = lerp(z, WEED[2] + (z - WEED[2]) * 0.42, close); }
      this.flowerCards[fl.v].add(x, 0, z, fl.sc, fl.sc, q, 0.07 * Math.sin(f * 0.07 + fl.ph));
    }
    for (const c of this.flowerCards) c.end();
    this.clouds.begin();
    for (let i = 0; i < 7; i++) this.clouds.add(-150 + i * 52 + f * 0.012 * (1 + (i % 3)), 34 + (i % 3) * 9, -190 - (i % 2) * 40, 1 + (i % 3) * 0.3, 1 + (i % 2) * 0.2, q);
    this.clouds.end();
    this.shG.begin();
    // ella
    this.woman.visible = id === 1;
    if (id === 1) {
      const blink = (f >= 34 && f < 38) || (f >= 78 && f < 81);
      (this.woman.material as THREE.MeshBasicMaterial).map = this.womanTex[blink ? 1 : 0];
      this.woman.quaternion.copy(q); this.woman.position.set(0, 0, 0); this.woman.scale.set(1, 1 + 0.008 * Math.sin(f * 0.12), 1);
      this.shG.add(0, 0.03, 0, 1.25, 0.6, q);
    }
    // maleza
    const up = backOut((f - T.weedUp) / 9), down = smooth((f - T.weedDown) / 14);
    this.weed.visible = id === 4 && f >= T.weedUp - 1;
    const shake = f >= T.weedUp + 9 && f < T.weedDown + 6 ? Math.sin(f * 2.1) * 0.06 : 0;
    this.weed.quaternion.copy(q).multiply(_qr.setFromAxisAngle(Z, shake)); this.weed.position.set(WEED[0], -1.05 * (1 - up) - 1.08 * down, WEED[2]);
    // frasco y dos gomitas
    this.bottle.visible = id === 6;
    this.bottle.quaternion.copy(q); this.bottle.position.set(...BOTTLE); const br = 1 + 0.012 * Math.sin(f * 0.15); this.bottle.scale.set(br, 2 - br, 1);
    if (id === 6) this.shG.add(BOTTLE[0], 0.03, BOTTLE[2], 1.15, 0.5, q);
    this.gums.forEach((gm, i) => {
      const t0 = T.dos[i], u = (f - t0) / 9, x = BOTTLE[0] + (i ? 0.62 : -0.62), z = BOTTLE[2] + 0.35;
      gm.visible = id === 6 && u >= 0;
      const y = u < 1 ? 2.2 * (1 - u * u) : 0.14 * Math.abs(Math.sin((u - 1) * 2.4)) * Math.max(0, 1 - (u - 1) / 3);
      const sq = u >= 1 && u < 1.8 ? 0.2 * Math.sin(((u - 1) / 0.8) * Math.PI) : 0;
      gm.quaternion.copy(q); gm.position.set(x, y, z); gm.scale.set(1 + sq, 1 - sq, 1);
      if (gm.visible) this.shG.add(x, 0.03, z, 0.5, 0.24, q);
    });
    this.shG.end();
  }

  private poseMicro(id: number, f: number, q: THREE.Quaternion, camPos: [number, number, number]) {
    for (const c of this.crowdCards) c.begin();
    this.shM.begin(); this.puffs.begin(); this.drops.begin();
    for (let i = 0; i < this.crowd.length; i++) {
      const m = this.crowd[i];
      let s = 1, back = false;
      if (m.rm) {
        if (f >= m.fb) { s = backOut((f - m.fb) / 9); back = true; }
        else if (f >= m.fr) {
          s = f < m.fr + 4 ? 1 - (f - m.fr) / 4 : 0;
          const u = (f - m.fr) / 11; if (u < 1) { const ps = 0.6 + 1.5 * Math.sin(u * Math.PI); this.puffs.add(m.x, 0.8, m.z, ps * (1 - u * 0.4), ps * (1 - u * 0.4), q); }
        }
      }
      if (s <= 0.01) continue;
      let look = 0, dx = 0, y = 0;
      const pump = Math.floor(f / 7 + m.ph) % 2;
      if (f < T.worry) { look = (f >= 100 && f < 132) || (f >= T.drops0 && f < T.germs0) ? pump : 0; y = 0.09 * Math.abs(Math.sin(f * 0.26 + m.ph)); }
      else if (f < (m.rm ? m.fr : T.pill1)) look = 2;
      else if (!back && f < T.four[0] + 8 + (i % 9)) { look = 3; dx = 0.014 * Math.sin(f * 2.3 + m.ph); }
      else { look = f >= T.regrow0 ? pump : 0; y = 0.1 * Math.abs(Math.sin(f * 0.3 + m.ph)); }
      const sc = m.sc * s;
      this.crowdCards[m.col * 4 + look].add(m.x + dx, y, m.z, sc, sc * (1 + 0.03 * Math.sin(f * 0.26 + m.ph)), q);
      this.shM.add(m.x, 0.03, m.z, 0.95 * sc, 0.5 * sc, q);
    }
    // gotas de ácido láctico
    const dropOn = smooth((f - T.drops0) / 18) * (1 - smooth((f - T.pill0) / 20)) + smooth((f - (T.regrow0 + 12)) / 20);
    if (dropOn > 0.01) for (let j = 0; j < 96; j++) {
      const m = this.crowd[(j * 37) % this.crowd.length];
      if (m.rm && f >= m.fr && f < m.fb + 6) continue;
      const heroDrop = j % 12 === 0 && id === 2;
      const u = (((f + j * 5.3) % 44) + 44) % 44 / 44, s = 0.5 * Math.sin(u * Math.PI) * dropOn;
      const x = heroDrop ? HERO[0] + Math.sin(j) * 0.5 : m.x, z = heroDrop ? HERO[2] : m.z;
      this.drops.add(x + 0.25 * Math.sin(u * 5 + j), 1.5 + u * 7.5, z, s, s, q);
    }
    // intrusos
    for (const c of this.germCards) c.begin();
    if (id === 3) for (const g of this.germs) {
      const fall = 26, th = g.t0 + fall;
      if (f < g.t0 || f > th + 30) continue;
      if (f < th) { const u = (f - g.t0) / fall; this.germCards[g.kind * 2].add(g.x, g.land + 24 * (1 - u * u), g.z, 1, 1, q, 0.15 * Math.sin(f * 0.5 + g.x)); }
      else { const u = (f - th) / 30, s = 1 - smooth(u); this.germCards[g.kind * 2 + 1].add(g.x + g.dx * u, g.land + 9 * u - 5 * u * u + 2 * Math.sin(Math.min(1, u * 3) * Math.PI) * 0.3, g.z + g.dz * u, s, s, q, u * 5); }
    }
    for (const c of this.germCards) c.end();
    // cúpula
    const a = smooth((f - T.dome0) / (T.dome1 - T.dome0)) * (1 - 0.8 * smooth((f - (T.pill0 + 8)) / 46)) + 0.8 * smooth((f - (T.regrow0 + 8)) / 34);
    let flash = 0; if (id === 3) for (const g of this.germs) { const u = (f - (g.t0 + 26)) / 8; if (u >= 0 && u < 1) flash = Math.max(flash, 1 - u); }
    const dm = this.dome.material as THREE.MeshBasicMaterial; dm.opacity = Math.min(0.5, 0.2 * a + 0.16 * flash); this.dome.visible = dm.opacity > 0.004;
    dm.map!.offset.x = f * 0.0006;
    // polvo
    const pos = this.dust.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setXYZ(i, this.dustBase[i * 3] + 0.4 * Math.sin(f * 0.02 + i), (this.dustBase[i * 3 + 1] + f * 0.012 * (1 + (i % 3))) % 16, this.dustBase[i * 3 + 2]);
    pos.needsUpdate = true;
    // protagonista
    this.hero.visible = id !== 5;
    if (this.hero.visible) {
      let t = 0, y = 0.05 * Math.abs(Math.sin(f * 0.22)), sq = 0;
      if (f >= 139 && f < 170) { t = 1; y = 0.12 * Math.abs(Math.sin((f - 139) * 0.4)); }
      else if (f >= 176 && f < 180) t = 2;
      else if (f >= T.drops0 && f < 256) { t = Math.floor(f / 7) % 2; sq = 0.06 * Math.sin(f * 0.9); }
      else if (f >= 300 && f < 304) t = 2;
      else if (f >= T.worry && f < T.pill1) { t = 3; y = 0; }
      else if (f >= T.pill1) { t = 4; y = 0; }
      (this.hero.material as THREE.MeshBasicMaterial).map = this.heroTex[t];
      this.hero.quaternion.copy(q); this.hero.position.set(HERO[0] + (t === 4 ? 0.012 * Math.sin(f * 2.3) : 0), y, HERO[2]); this.hero.scale.set(1 + sq, 1 - sq, 1);
      this.shM.add(HERO[0], 0.03, HERO[2], 1.0, 0.5, q);
    }
    // yogur
    const yu = (f - T.yogur) / 9; this.yogurt.visible = id === 2 && yu > 0;
    const ys = backOut(yu); this.yogurt.quaternion.copy(q); this.yogurt.position.set(1.12, 0, 3.4); this.yogurt.scale.set(ys, ys, 1);
    if (this.yogurt.visible) this.shM.add(1.12, 0.03, 3.4, 0.7 * ys, 0.34 * ys, q);
    // cápsula
    const pu = (f - T.pill0) / (T.pill1 - T.pill0); this.pill.visible = id === 3 && pu > -0.05 && pu < 1.12;
    this.pill.quaternion.copy(q).multiply(_qr.setFromAxisAngle(Z, 0.1 * Math.sin(f * 0.5))); this.pill.position.set(lerp(-8, 8.5, pu), 1.5 + 0.18 * Math.sin(f * 0.4), 4.7);
    // gomita y los cuatro
    this.gummy.visible = id === 5 && f >= T.gummy0;
    if (this.gummy.visible) {
      const u = clamp01((f - T.gummy0) / (T.gummyLand - T.gummy0)), v = (f - T.gummyLand) / 9, sq = v >= 0 && v < 1 ? 0.24 * Math.sin(v * Math.PI) : 0;
      let pop = 0; for (const t0 of T.four) { const w = (f - t0) / 6; if (w >= 0 && w < 1) pop = Math.max(pop, 0.08 * Math.sin(w * Math.PI)); }
      this.gummy.quaternion.copy(q); this.gummy.position.set(GUMMY[0], 11 * (1 - u * u), GUMMY[2]); this.gummy.scale.set(1 + sq - pop, 1 - sq + pop, 1);
      this.shM.add(GUMMY[0], 0.03, GUMMY[2], 1.5 * (0.3 + 0.7 * u), 0.7 * (0.3 + 0.7 * u), q);
    }
    this.four.forEach((m, k) => {
      const u = (f - T.four[k]) / 15; m.visible = id === 5 && u >= 0;
      if (!m.visible) return;
      const e = clamp01(u), tx = FOUR[k][0], tz = FOUR[k][1];
      const hop = u < 1 ? 1.5 * Math.sin(e * Math.PI) + 1.3 * (1 - e) : 0.11 * Math.abs(Math.sin(f * 0.3 + k));
      (m.material as THREE.MeshBasicMaterial).map = this.fourTex[k][u < 1.6 || (f >= T.regrow0 && Math.floor(f / 7 + k) % 2) ? 1 : 0];
      const s = 0.45 + 0.55 * smooth(u * 1.6);
      m.quaternion.copy(q); m.position.set(lerp(GUMMY[0], tx, e), hop, lerp(GUMMY[2] + 0.1, tz, e)); m.scale.set(s, s, 1);
      if (u >= 1) this.shM.add(tx, 0.03, tz, 0.95, 0.5, q);
    });
    for (const c of this.crowdCards) c.end();
    this.shM.end(); this.puffs.end(); this.drops.end();
    void camPos;
  }
}
