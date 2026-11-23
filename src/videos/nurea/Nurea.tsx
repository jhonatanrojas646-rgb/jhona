// Short de Nurea: probióticos y flora vaginal. Misma cadena de post que la plantilla:
// tinta -> desenfoque -> bloom -> mapeo de tono NEUTRAL -> corrección de color, MSAA 4.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass } from "../alejandro/ink";
import { LensBlur } from "../alejandro/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../alejandro/grade";
import { World } from "./world";
import { layersAt, dofAt, smooth, T } from "./story";

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const Inner: React.FC<{ id: number }> = ({ id }) => {
  const f = useCurrentFrame();
  const { camera, scene, gl, size } = useThree();
  const world = useMemo(() => new World(), []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera));
    c.addPass(fx.ink);
    c.addPass(new EffectPass(camera, fx.lens.pre));
    c.addPass(new EffectPass(camera, fx.lens.main));
    c.addPass(new EffectPass(camera, fx.bloom, fx.tone, fx.grade));
    return c;
  }, [gl, scene, camera, fx]);
  useEffect(() => { composer.setSize(size.width, size.height); }, [composer, size.width, size.height]);
  useFrame(() => { composer.render(); }, 1);
  const cam = camera as THREE.PerspectiveCamera;
  const target = world.update(id, f, cam, scene);
  const d = dofAt(id, f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, "day");
  return <primitive object={world.root} dispose={null} />;
};

const dprOverride = () => (getInputProps() as { dpr?: number }).dpr;
const ShotView: React.FC<{ id: number; alpha: number }> = ({ id, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})}
      gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.2, far: 1500 }}>
      <Inner id={id} />
    </ThreeCanvas>
  </AbsoluteFill>
);

// Medidor de pH discreto, arriba del cuadro, sin tapar a nadie.
const PH: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.ph0 || f > T.ph1) return null;
  const pop = smooth((f - T.ph0) / 8), out = 1 - smooth((f - (T.ph1 - 8)) / 8), mark = smooth((f - T.ph0 - 6) / 14);
  const x0 = 290, w = 500, x = x0 + w * ((0.5 + 3.5 * mark) / 14);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} opacity={pop * out}>
        <defs>
          <linearGradient id="ph" x1="0" x2="1">
            <stop offset="0" stopColor="#e8433a" /><stop offset="0.28" stopColor="#f6a62b" /><stop offset="0.5" stopColor="#5fbf55" />
            <stop offset="0.75" stopColor="#3f86d8" /><stop offset="1" stopColor="#7a4fc2" />
          </linearGradient>
        </defs>
        <g transform={`translate(0,${-12 * (1 - pop)})`}>
          <rect x={x0} y={236} width={w} height={26} rx={13} fill="url(#ph)" stroke="#241726" strokeWidth={6} />
          <path d={`M${x - 16},222 L${x + 16},222 L${x},242 Z`} fill="#ffffff" stroke="#241726" strokeWidth={6} strokeLinejoin="round" />
          <text x={540} y={196} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={58} fill="#ffffff"
            stroke="#241726" strokeWidth={9} paintOrder="stroke">pH 3,5 – 4,5</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const NureaShort: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#ffc4d8" }}>
      {layersAt(f).map((l) => <ShotView key={`shot${l.id}`} id={l.id} alpha={l.alpha} />)}
      <PH f={f} />
      {!(getInputProps() as { mute?: boolean }).mute && <Audio src={staticFile("voz/sofia_112.wav")} />}
    </AbsoluteFill>
  );
};
