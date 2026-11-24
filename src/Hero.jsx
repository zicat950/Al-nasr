/* ──────────────────────────────────────────────────────────────────────────
   ALNASR — luxury dates & dry-fruit hero  (v6 · "Ivory & Beige")
   Same animation as v5, recolored to #B5A689 + #F1F2EC.

   npm i three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing gsap
   ────────────────────────────────────────────────────────────────────────── */

import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import {
  EffectComposer,
  DepthOfField,
  Vignette,
  ToneMapping,
  HueSaturation,
  BrightnessContrast,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ═══════════════════════════════════════════════════════════════════════════
   0 · SETTINGS  (edit freely)
   ═══════════════════════════════════════════════════════════════════════════ */
const BRAND = 'ALNASR';
const BRAND_AR = 'AL-NASR';
const COPY = {
  tagline: 'Dates, nuts & dried fruit, gathered for giving.',
  taglineAr: 'تمور ومكسرات فاخرة',
  mid: ['Grown slowly.', 'Picked at harvest.'],
  finalTitle: ['Every bite,', 'a small luxury.'],
  cta: 'Shop the collection',
};

const NUT_DIR = `${(import.meta.env && import.meta.env.BASE_URL) || '/'}nuts/`;

/* — brand palette — */
const C = {
  beige: '#B5A689',
  ivory: '#F1F2EC',
  olive: '#344638',
  ink: '#26372D',
  gold: '#A88B5B',
  bg: '#cbc0a6', // scene background + fog (ivory/beige mix)
};

/* — look & feel dials — */
const PILE_SCALE = 0.86;
const NUT_SCALE = 0.66;
const NUT_GAIN = 1.0;
const PILE_SHADE = 0.68;
const NUT_BUMP = 0.6;
const DELIGHT = 0.7;
const VARIATION = 0.07;
const GRADE = { sat: 0.88, warmR: 1.0, warmB: 1.0, contrast: 0.22 };

const NUT_TYPES = [
  { key: 'almond',    len: 0.78, count: 30, half: 0.14, rough: 0.55 },
  { key: 'apricot',   len: 0.92, count: 14, half: 0.1,  rough: 0.42 },
  { key: 'cashew',    len: 0.74, count: 30, half: 0.14, rough: 0.5 },
  { key: 'cranberry', len: 0.32, count: 28, half: 0.38, rough: 0.32 },
  { key: 'fig',       len: 0.84, count: 8,  half: 0.3,  rough: 0.55 },
  { key: 'hazelnut',  len: 0.6,  count: 20, half: 0.4,  rough: 0.5 },
  { key: 'kernel',    len: 0.84, count: 14, half: 0.22, rough: 0.6 },
  { key: 'pecan',     len: 0.8,  count: 20, half: 0.18, rough: 0.5 },
  { key: 'pistachio', len: 0.7,  count: 26, half: 0.2,  rough: 0.55 },
  { key: 'raisin',    len: 0.4,  count: 34, half: 0.18, rough: 0.34 },
  { key: 'walnut',    len: 1.0,  count: 8,  half: 0.4,  rough: 0.65 },
];
const ANGLES = 3;
const TEXTURE_URLS = NUT_TYPES.flatMap((t) =>
  Array.from({ length: ANGLES }, (_, a) => `${NUT_DIR}${t.key}-${a + 1}.png`)
);

/* ═══════════════════════════════════════════════════════════════════════════
   1 · MATH HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */
const TAU = Math.PI * 2;
const { clamp, lerp, damp, degToRad } = THREE.MathUtils;
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const quint = (t) => t * t * t * (t * (t * 6 - 15) + 10);

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(w * h);
  const inv = 1 / (2 * r + 1);
  const pass = (from, to) => {
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += from[row + (x < 0 ? 0 : x >= w ? w - 1 : x)];
      for (let x = 0; x < w; x++) {
        tmp[row + x] = acc * inv;
        const add = x + r + 1, sub = x - r;
        acc += from[row + (add >= w ? w - 1 : add)] - from[row + (sub < 0 ? 0 : sub)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[(y < 0 ? 0 : y >= h ? h - 1 : y) * w + x];
      for (let y = 0; y < h; y++) {
        to[y * w + x] = acc * inv;
        const add = y + r + 1, sub = y - r;
        acc += tmp[(add >= h ? h - 1 : add) * w + x] - tmp[(sub < 0 ? 0 : sub) * w + x];
      }
    }
  };
  const mid = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  pass(src, mid);
  pass(mid, out);
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   2 · PHOTO → 3D NUT
   ═══════════════════════════════════════════════════════════════════════════ */
function processNut(img, half, maxDim, grid) {
  const sw = img.naturalWidth || img.width;
  const sh = img.naturalHeight || img.height;
  const k = Math.min(1, maxDim / Math.max(sw, sh));
  const ow = Math.max(1, Math.round(sw * k));
  const oh = Math.max(1, Math.round(sh * k));
  const m = Math.max(ow, oh);
  const pad = Math.ceil(m * 0.1);
  const W = ow + pad * 2, H = oh + pad * 2, n = W * H;

  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, pad, pad, ow, oh);
  const id = g.getImageData(0, 0, W, H);
  const d = id.data;

  const a0 = new Float32Array(n);
  const luma = new Float32Array(n);
  const lumaA = new Float32Array(n);
  let sumL = 0, sumA = 0;
  for (let i = 0; i < n; i++) {
    const a = d[i * 4 + 3] / 255;
    const l = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
    a0[i] = a; luma[i] = l; lumaA[i] = l * a;
    if (a > 0.5) { sumL += l; sumA += 1; }
  }
  const meanL = sumA ? sumL / sumA : 0.5;

  const rL = Math.max(3, Math.round(m * 0.16));
  const num = boxBlur(lumaA, W, H, rL);
  const den = boxBlur(a0, W, H, rL);

  const bc = document.createElement('canvas');
  bc.width = W; bc.height = H;
  const bg = bc.getContext('2d');
  const bid = bg.createImageData(W, H);

  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const a = a0[i];
    if (a < 0.01) { d[j + 3] = 0; bid.data[j] = bid.data[j + 1] = bid.data[j + 2] = 128; bid.data[j + 3] = 255; continue; }
    const low = num[i] / Math.max(den[i], 1e-3);
    const f = clamp(Math.pow(meanL / Math.max(low, 0.05), DELIGHT), 0.6, 1.5);

    let r = d[j] / 255, gg = d[j + 1] / 255, b = d[j + 2] / 255;
    r *= f; gg *= f; b *= f;
    const l2 = 0.299 * r + 0.587 * gg + 0.114 * b;
    r = l2 + (r - l2) * GRADE.sat;
    gg = l2 + (gg - l2) * GRADE.sat;
    b = l2 + (b - l2) * GRADE.sat;
    r *= GRADE.warmR; b *= GRADE.warmB;
    const curve = (c) => {
      c = clamp(c, 0, 1);
      return c + GRADE.contrast * (c * c * (3 - 2 * c) - c);
    };
    d[j] = curve(r) * 255;
    d[j + 1] = curve(gg) * 255;
    d[j + 2] = curve(b) * 255;
    d[j + 3] = Math.round(255 * smooth(0.4, 0.75, a));

    const hp = clamp(0.5 + (luma[i] - low) * 1.7, 0, 1) * 255;
    bid.data[j] = bid.data[j + 1] = bid.data[j + 2] = hp;
    bid.data[j + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  bg.putImageData(bid, 0, 0);

  const bH = boxBlur(a0, W, H, Math.max(3, Math.round(m * 0.14)));
  const nx = grid;
  const ny = Math.max(8, Math.round((grid * H) / W));
  const row = nx + 1;
  const vc = row * (ny + 1);
  const pos = new Float32Array(vc * 2 * 3);
  const uv = new Float32Array(vc * 2 * 2);
  const hw = W / m / 2, hh = H / m / 2;
  for (let j = 0; j <= ny; j++) {
    for (let i = 0; i <= nx; i++) {
      const u = i / nx, v = j / ny;
      const px = Math.min(W - 1, Math.round(u * (W - 1)));
      const py = Math.min(H - 1, Math.round(v * (H - 1)));
      const t = clamp((bH[py * W + px] - 0.5) * 2.4, 0, 1);
      const z = half * Math.pow(t, 0.6);
      const x = (u - 0.5) * 2 * hw, y = (0.5 - v) * 2 * hh;
      const f = j * row + i, bk = vc + f;
      pos.set([x, y, z], f * 3);
      pos.set([x, y, -z], bk * 3);
      uv.set([u, 1 - v], f * 2);
      uv.set([u, 1 - v], bk * 2);
    }
  }
  const idx = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * row + i, b = a + 1, c = a + row, dd = c + 1;
      idx.push(a, c, b, b, c, dd);
      idx.push(vc + a, vc + b, vc + c, vc + b, vc + dd, vc + c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  const mk = (canvas, srgb) => {
    const t = new THREE.CanvasTexture(canvas);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  return { geo, map: mk(cv, true), bump: mk(bc, false) };
}

/* ═══════════════════════════════════════════════════════════════════════════
   3 · THE BOWL
   ═══════════════════════════════════════════════════════════════════════════ */
const BOWL_FLOOR = 0.53;
const INNER = [
  [0.55, 1.0], [0.62, 1.6], [0.86, 2.25], [1.25, 2.7], [1.7, 2.95], [1.86, 3.0],
];
function innerRadiusAt(y) {
  if (y <= INNER[0][0]) return INNER[0][1];
  for (let i = 1; i < INNER.length; i++) {
    if (y <= INNER[i][0]) {
      const [y0, r0] = INNER[i - 1], [y1, r1] = INNER[i];
      return lerp(r0, r1, (y - y0) / (y1 - y0));
    }
  }
  return INNER[INNER.length - 1][1];
}

function makeBowlGeometry() {
  const V = (r, y) => new THREE.Vector2(r, y);
  const outer = new THREE.SplineCurve([
    V(0.001, 0), V(1.15, 0), V(1.28, 0.06), V(1.42, 0.3), V(1.95, 0.6),
    V(2.55, 0.98), V(2.95, 1.38), V(3.14, 1.72), V(3.2, 1.84),
  ]).getPoints(40);
  const rim = [V(3.17, 1.9), V(3.1, 1.94), V(3.02, 1.92)];
  const inner = new THREE.SplineCurve([
    V(2.98, 1.86), V(2.9, 1.7), V(2.7, 1.3), V(2.35, 0.95), V(1.8, 0.68), V(1.1, 0.57), V(0.001, 0.53),
  ]).getPoints(36);
  return new THREE.LatheGeometry([...outer, ...rim, ...inner], 128);
}

/* ivory porcelain outside · deeper beige inside · bronze rim line */
function makeBowlTexture() {
  const W = 1024, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const Y = (v) => (1 - v) * H;
  const band = (v0, v1, col) => { g.fillStyle = col; g.fillRect(0, Y(v1), W, Y(v0) - Y(v1)); };

  band(0, 1, C.ivory);          // outside body
  band(0, 0.14, '#d9d5c4');     // foot
  band(0.5, 0.545, C.gold);     // rim
  band(0.545, 1, '#9a8b6d');    // inside (deeper beige so nuts pop)
  band(0.455, 0.461, C.gold);   // fine line
  band(0.43, 0.434, C.beige);   // second hairline
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(80,64,36,0.06)';
    g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function radialTexture(stops, size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Bowl({ groupRef, shadows }) {
  const geo = useMemo(makeBowlGeometry, []);
  const map = useMemo(makeBowlTexture, []);
  useEffect(() => () => { geo.dispose(); map.dispose(); }, [geo, map]);
  return (
    <group ref={groupRef}>
      <mesh geometry={geo} castShadow={shadows} receiveShadow={shadows}>
        <meshPhysicalMaterial
          map={map}
          roughness={0.5}
          metalness={0.04}
          clearcoat={0.35}
          clearcoatRoughness={0.35}
          envMapIntensity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4 · CAMERA
   ═══════════════════════════════════════════════════════════════════════════ */
const FOV = 36;
function baseDist(aspect) {
  const th = Math.tan(degToRad(FOV / 2));
  const frac = aspect < 1 ? 0.98 : aspect < 1.4 ? 0.92 : aspect < 1.9 ? 0.66 : 0.55;
  return Math.max(6.5 / (2 * th * aspect * frac), 7.2);
}
function camPose(p, aspect, outPos, outTarget) {
  const d0 = baseDist(aspect);
  const elev = degToRad(lerp(30, 6, p));
  const dist = d0 * lerp(1, 0.92, p);
  const vis = 2 * d0 * Math.tan(degToRad(FOV / 2));
  const y0 = 1.9 + ((aspect < 1 ? 0.14 : 0.3) * vis) / Math.cos(degToRad(30));
  outTarget.set(0, lerp(y0, 2.4, p), 0);
  outPos.set(0, outTarget.y + Math.sin(elev) * dist, Math.cos(elev) * dist);
}

/* ═══════════════════════════════════════════════════════════════════════════
   5 · NUT LAYOUT
   ═══════════════════════════════════════════════════════════════════════════ */
function buildPile(qs) {
  const rng = mulberry32(7);
  const list = [];
  NUT_TYPES.forEach((t, ti) => {
    const n = Math.max(2, Math.round(t.count * qs));
    for (let k = 0; k < n; k++) list.push(ti);
  });
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  const items = list.map((ti) => {
    const t = NUT_TYPES[ti];
    const angle = Math.floor(rng() * ANGLES);
    const s0 = 0.94 + rng() * 0.14;
    const rad = t.len * 0.34 * s0;
    const r = Math.sqrt(rng()) * 2.75;
    const a = rng() * TAU;
    const top = 2.05 + 1.05 * (1 - Math.pow(r / 2.9, 2));
    const depth = Math.pow(rng(), 2.1) * 1.35;
    const y = Math.max(top - depth, BOWL_FLOOR + rad);
    return {
      ti, rad, s0,
      tex: ti * ANGLES + angle,
      p0: new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)),
    };
  });

  const n = items.length;
  for (let iter = 0; iter < 36; iter++) {
    for (let i = 0; i < n; i++) {
      const A = items[i];
      for (let j = i + 1; j < n; j++) {
        const B = items[j];
        let dx = B.p0.x - A.p0.x, dy = B.p0.y - A.p0.y, dz = B.p0.z - A.p0.z;
        const min = A.rad + B.rad;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= min * min) continue;
        if (d2 < 1e-6) { dx = 0.01; dy = 0.02; dz = 0.01; }
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const push = (min - d) * 0.42;
        dx /= d; dy /= d; dz /= d;
        A.p0.x -= dx * push; A.p0.y -= dy * push * 0.7; A.p0.z -= dz * push;
        B.p0.x += dx * push; B.p0.y += dy * push * 0.7; B.p0.z += dz * push;
      }
    }
    for (const it of items) {
      it.p0.y -= 0.012;
      if (it.p0.y < BOWL_FLOOR + it.rad) it.p0.y = BOWL_FLOOR + it.rad;
      const rr = Math.hypot(it.p0.x, it.p0.z);
      const lim = innerRadiusAt(it.p0.y) - it.rad * 0.9;
      if (rr > lim) { it.p0.x *= lim / rr; it.p0.z *= lim / rr; }
    }
  }

  let yMin = Infinity, yMax = -Infinity;
  items.forEach((it) => { yMin = Math.min(yMin, it.p0.y); yMax = Math.max(yMax, it.p0.y); });
  items.forEach((it) => {
    const h01 = (it.p0.y - yMin) / Math.max(yMax - yMin, 1e-3);
    it.shade = lerp(PILE_SHADE, 1, Math.pow(h01, 0.75)) * (1 - VARIATION * 0.5 + rng() * VARIATION);
    it.tint = (rng() - 0.5) * VARIATION;
    it.delay = (1 - h01) * 0.26 + rng() * 0.07;
    it.dur = 0.52 + rng() * 0.14;
    it.lift = 0.5 + rng() * 1.4;
    it.zArc = (rng() - 0.5) * 2.4;
    it.roll0 = rng() * TAU;
    it.spin = (rng() < 0.5 ? -1 : 1) * (1.2 + rng() * 3.4);
    it.tx0 = (rng() - 0.5) * 0.9;
    it.ty0 = (rng() - 0.5) * 0.9;
    it.drift = new THREE.Vector3((rng() - 0.5) * 1.4, (rng() - 0.5) * 0.7, (rng() - 0.5) * 1.8);
    it.fx = 0.35 + rng() * 0.5; it.fy = 0.3 + rng() * 0.5; it.fz = 0.25 + rng() * 0.4;
    it.fa = 0.1 + rng() * 0.2;
    it.rw = 0.25 + rng() * 0.45; it.ra = 0.25 + rng() * 0.55;
    it.tw = 0.3 + rng() * 0.5;
    it.ph = rng() * TAU;
  });
  return items;
}

function buildTargets(items, aspect) {
  const rng = mulberry32(99);
  const D = baseDist(aspect) * 0.92;
  const cam = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 120);
  const look = new THREE.Vector3();
  camPose(1, aspect, cam.position, look);
  cam.lookAt(look);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  const fwd = new THREE.Vector3();
  cam.getWorldDirection(fwd);

  const n = items.length;
  const pts = [];
  for (let i = 0; i < n; i++) {
    let best = null, bd = -1;
    for (let c = 0; c < 12; c++) {
      const cand = [(rng() * 2 - 1) * 1.1, (rng() * 2 - 1) * 1.08];
      let md = Infinity;
      for (const p of pts) md = Math.min(md, Math.hypot((cand[0] - p[0]) * aspect, cand[1] - p[1]));
      if (md > bd) { bd = md; best = cand; }
    }
    pts.push(best);
  }
  const dists = pts.map(() => {
    const r = rng();
    return r < 0.16 ? D * (0.62 + rng() * 0.2) : r < 0.66 ? D * (0.82 + rng() * 0.55) : D * (1.4 + rng() * 0.8);
  });
  const order = dists.map((d, i) => i).sort((a, b) => dists[a] - dists[b]);
  const itemOrder = items
    .map((it, i) => ({ i, k: NUT_TYPES[it.ti].len * (0.55 + rng() * 0.9) }))
    .sort((a, b) => b.k - a.k)
    .map((o) => o.i);

  const out = new Array(n);
  const v = new THREE.Vector3(), dir = new THREE.Vector3();
  for (let rank = 0; rank < n; rank++) {
    const slot = order[rank], idx = itemOrder[rank];
    v.set(pts[slot][0], pts[slot][1], 0.5).unproject(cam);
    dir.copy(v).sub(cam.position).normalize();
    const k = dists[slot] / Math.max(dir.dot(fwd), 0.2);
    const p = new THREE.Vector3().copy(cam.position).addScaledVector(dir, k);
    if (Math.hypot(p.x, p.z) < 3.6 && p.y < 2.3) p.y = 2.4 + rng() * 0.8;
    if (p.y < 1.0) p.y = 1.0 + rng() * 0.9;
    const near = dists[slot] < D * 0.8;
    out[idx] = { p, s: near ? 1 + rng() * 0.25 : 0.92 + rng() * 0.3 };
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   6 · THE NUT FIELD
   ═══════════════════════════════════════════════════════════════════════════ */
const AZ = new THREE.Vector3(0, 0, 1);

function NutField({ smoothed, quality }) {
  const { size, camera } = useThree();
  const aspect = Math.round((size.width / Math.max(size.height, 1)) * 10) / 10;

  const boost = aspect < 1 ? 1.6 : aspect < 1.4 ? 1.25 : 1;
  const textures = useLoader(THREE.TextureLoader, TEXTURE_URLS);
  const pile = useMemo(() => buildPile(quality.qs), [quality.qs]);
  const targets = useMemo(() => buildTargets(pile, aspect), [pile, aspect]);

  const solids = useMemo(
    () =>
      textures.map((t, i) =>
        processNut(t.image, NUT_TYPES[Math.floor(i / ANGLES)].half, quality.texSize, quality.grid)
      ),
    [textures, quality.texSize, quality.grid]
  );
  const mats = useMemo(
    () =>
      solids.map(
        (s, i) =>
          new THREE.MeshStandardMaterial({
            map: s.map,
            bumpMap: NUT_BUMP > 0 ? s.bump : null,
            bumpScale: NUT_BUMP,
            roughness: NUT_TYPES[Math.floor(i / ANGLES)].rough,
            metalness: 0,
            alphaTest: 0.5,
            envMapIntensity: 0.9,
          })
      ),
    [solids]
  );
  const counts = useMemo(() => {
    const c = new Array(textures.length).fill(0);
    pile.forEach((it) => c[it.tex]++);
    return c;
  }, [pile, textures]);

  const meshes = useRef([]);
  const lastP = useRef(-1);
  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(), s: new THREE.Vector3(), m: new THREE.Matrix4(),
      q: new THREE.Quaternion(), qt: new THREE.Quaternion(), qr: new THREE.Quaternion(),
      eul: new THREE.Euler(), col: new THREE.Color(), idx: new Array(textures.length).fill(0),
    }),
    [textures.length]
  );

  const update = (P, time) => {
    const { p, s, m, q, qt, qr, eul, col, idx } = tmp;
    const camQ = camera.quaternion;
    idx.fill(0);
    for (let i = 0; i < pile.length; i++) {
      const it = pile[i], tg = targets[i];
      if (!tg) continue;
      let t = (P - it.delay) / it.dur;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const e = quint(t);
      const arc = Math.sin(Math.PI * t);

      p.set(
        it.p0.x + (tg.p.x - it.p0.x) * e + it.drift.x * P * e,
        it.p0.y + (tg.p.y - it.p0.y) * e + it.lift * arc + it.drift.y * P * e,
        it.p0.z + (tg.p.z - it.p0.z) * e + it.zArc * arc + it.drift.z * P * e
      );
      p.x += Math.sin(time * it.fx + it.ph) * it.fa * e;
      p.y += Math.sin(time * it.fy + it.ph * 1.7) * it.fa * e;
      p.z += Math.sin(time * it.fz + it.ph * 0.6) * it.fa * 0.8 * e;

      const roll = it.roll0 + it.spin * e + Math.sin(time * it.rw + it.ph) * it.ra * e;
      const tx = clamp(it.tx0 + Math.sin(time * it.tw + it.ph * 1.3) * 0.55 * e, -0.85, 0.85);
      const ty = clamp(it.ty0 + Math.sin(time * it.tw * 0.8 + it.ph * 0.7) * 0.55 * e, -0.85, 0.85);
      qt.setFromEuler(eul.set(tx, ty, 0));
      qr.setFromAxisAngle(AZ, roll);
      q.copy(camQ).multiply(qt).multiply(qr);

      s.setScalar(
        NUT_TYPES[it.ti].len * lerp(PILE_SCALE, NUT_SCALE * boost, e) * lerp(it.s0, tg.s * it.s0, e)
      );
      m.compose(p, q, s);

      const br = lerp(it.shade, 1, smooth(0, 0.5, e)) * NUT_GAIN;
      col.setRGB(br * (1 + it.tint), br, br * (1 - it.tint));

      const mesh = meshes.current[it.tex];
      if (mesh) {
        const k = idx[it.tex]++;
        mesh.setMatrixAt(k, m);
        mesh.setColorAt(k, col);
      }
    }
    meshes.current.forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  };

  useIsoLayoutEffect(() => {
    lastP.current = -1;
    update(smoothed.current, 0);
  }, [pile, targets, solids]); // eslint-disable-line

  useFrame((state) => {
    const P = smoothed.current;
    // while the nuts are still resting in the bowl nothing moves, so skip the work
    if (P < 0.0005 && lastP.current >= 0 && lastP.current < 0.0005) return;
    lastP.current = P;
    update(P, state.clock.elapsedTime);
  });

  useEffect(
    () => () => {
      mats.forEach((mt) => mt.dispose());
      solids.forEach((so) => { so.geo.dispose(); so.map.dispose(); so.bump.dispose(); });
    },
    [mats, solids]
  );

  return (
    <group>
      {textures.map((_, ti) =>
        counts[ti] > 0 ? (
          <instancedMesh
            key={ti}
            ref={(el) => {
              meshes.current[ti] = el;
              if (el) el.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            }}
            args={[solids[ti].geo, mats[ti], counts[ti]]}
            castShadow={quality.shadows}
            receiveShadow={quality.shadows}
            frustumCulled={false}
          />
        ) : null
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   7 · SET DRESSING  (ivory → beige)
   ═══════════════════════════════════════════════════════════════════════════ */
function Backdrop() {
  const glow = useMemo(
    () => radialTexture([[0, '#f7f7f2'], [0.32, C.ivory], [0.66, '#d9d1bc'], [1, C.beige]]),
    []
  );
  const blob = useMemo(
    () => radialTexture([[0, 'rgba(58,44,22,0.5)'], [0.55, 'rgba(58,44,22,0.24)'], [1, 'rgba(58,44,22,0)']], 256),
    []
  );
  const dots = useMemo(() => {
    const r = mulberry32(5);
    return Array.from({ length: 30 }, () => ({
      x: (r() - 0.5) * 70, y: -2 + r() * 20, z: -22 - r() * 16,
      s: 0.5 + r() * 1.5, o: 0.12 + r() * 0.2,
      c: [C.gold, C.beige, '#ffffff', '#8f7a52'][Math.floor(r() * 4)],
    }));
  }, []);
  useEffect(() => () => { glow.dispose(); blob.dispose(); }, [glow, blob]);

  return (
    <group>
      <mesh position={[0, 8, -48]}>
        <planeGeometry args={[220, 130]} />
        <meshBasicMaterial map={glow} fog={false} toneMapped={false} />
      </mesh>
      {dots.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]} scale={d.s}>
          <circleGeometry args={[1, 24]} />
          <meshBasicMaterial
            color={d.c} transparent opacity={d.o} depthWrite={false}
            fog={false} toneMapped={false}
          />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#cdc3aa" roughness={0.78} metalness={0.04} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <circleGeometry args={[5, 64]} />
        <meshBasicMaterial map={blob} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   8 · SCENE
   ═══════════════════════════════════════════════════════════════════════════ */
function Scene({ progress, quality }) {
  const { size, camera } = useThree();
  const aspect = size.width / Math.max(size.height, 1);
  const D = useMemo(() => baseDist(aspect) * 0.92, [aspect]);

  const smoothed = useRef(0);
  const bowl = useRef();
  const dof = useRef();
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const par = useRef({ x: 0, y: 0 });
  const focus = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.05);
    smoothed.current = damp(smoothed.current, progress.current.value, 7, step);
    const P = smoothed.current;
    const ce = smooth(0, 1, P);

    camPose(ce, aspect, pos, look);
    par.current.x = damp(par.current.x, state.pointer.x, 3, step);
    par.current.y = damp(par.current.y, state.pointer.y, 3, step);
    camera.position.set(pos.x + par.current.x * 0.35, pos.y + par.current.y * 0.18, pos.z);
    camera.lookAt(look);

    if (bowl.current) bowl.current.rotation.y = -P * 0.35;
    if (dof.current) dof.current.bokehScale = lerp(1.5, 3.6, ce);
  }, -1);

  return (
    <>
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, D * 1.5, D * 5.5]} />

      <ambientLight intensity={0.7} color="#fffaf0" />
      <directionalLight
        position={[-5, 10, 6]}
        intensity={2.4}
        color="#fff3e2"
        castShadow={quality.shadows}
        shadow-mapSize={[quality.shadowSize, quality.shadowSize]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
        shadow-radius={4}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={34}
      />
      <directionalLight position={[6, 5, -8]} intensity={1.1} color="#e9dfc8" />
      <pointLight position={[0, 4, 6]} intensity={14} distance={24} decay={2} color="#fff0da" />

      <Environment resolution={256} frames={1}>
        <mesh scale={100}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color="#e6e0cf" side={THREE.BackSide} />
        </mesh>
        <Lightformer form="rect" intensity={3.2} color="#fff6e8" position={[-4, 6, 4]} scale={[8, 5, 1]} onUpdate={(s) => s.lookAt(0, 0, 0)} />
        <Lightformer form="rect" intensity={1.6} color="#e9dfc8" position={[6, 3, -5]} scale={[6, 4, 1]} onUpdate={(s) => s.lookAt(0, 0, 0)} />
        <Lightformer form="ring" intensity={1.4} color="#fff2dc" position={[0, 7, 0]} scale={5} onUpdate={(s) => s.lookAt(0, 0, 0)} />
      </Environment>

      <Backdrop />
      <Suspense fallback={null}>
        <Bowl groupRef={bowl} shadows={quality.shadows} />
        <NutField smoothed={smoothed} quality={quality} />
      </Suspense>

      {quality.composer && (
        <EffectComposer multisampling={2}>
          <DepthOfField
            ref={dof}
            target={focus}
            worldFocusRange={D * 0.55}
            bokehScale={2}
          />
          <HueSaturation saturation={-0.02} />
          <BrightnessContrast brightness={0.0} contrast={0.04} />
          {/* soft, light vignette (the old dark one would grey the ivory) */}
          <Vignette eskil={false} offset={0.3} darkness={0.32} />
          {/* NEUTRAL keeps ivory/beige colours true; falls back if your postprocessing is older */}
          <ToneMapping mode={ToneMappingMode.NEUTRAL ?? ToneMappingMode.AGX ?? ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   9 · HERO
   ═══════════════════════════════════════════════════════════════════════════ */
function getQuality() {
  const w = window.innerWidth;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const mobile = w < 820 || (coarse && w < 1100);
  return mobile
    ? { mobile: true, qs: 0.8, composer: false, shadows: true, shadowSize: 768, dpr: [1, 1.25], texSize: 320, grid: 18 }
    : { mobile: false, qs: 1.35, composer: true, shadows: true, shadowSize: 1536, dpr: [1, 1.5], texSize: 512, grid: 26 };
}

class NutBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.error('[Hero] could not build the nuts from', NUT_DIR, err);
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="hero__error" role="alert">
          Nut images not found. Check that the files are at <b>public/nuts/almond-1.png</b> and so on, then reload.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Hero() {
  const rootRef = useRef(null);
  const progress = useRef({ value: 0 });
  const [quality, setQuality] = useState(null);
  const [inView, setInView] = useState(true);   // stop rendering when the hero is off-screen
  const [lowPerf, setLowPerf] = useState(false); // drop pixel ratio if the device struggles

  useEffect(() => { setQuality(getQuality()); }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '200px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => (window.innerWidth < 820 ? '+=300%' : '+=380%'),
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(progress.current, { value: 1, duration: 1 }, 0);

      tl.to('.hero__cue', { autoAlpha: 0, duration: 0.05 }, 0)
        .to('.hero__intro', { autoAlpha: 0, y: -60, duration: 0.14, ease: 'power1.in' }, 0.02)
        .to('.hero__veil', { opacity: 0, duration: 0.25 }, 0.02)
        .to('.hero__shade', { opacity: 1, duration: 0.45 }, 0.15)
        .fromTo('.hero__mid', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.32)
        .to('.hero__mid', { autoAlpha: 0, y: -40, duration: 0.1, ease: 'power1.in' }, 0.6)
        .fromTo('.hero__final', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.8);
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);

    return () => {
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, []);

  const dpr = quality ? (lowPerf ? 1 : quality.dpr) : 1;

  return (
    <section className="hero" ref={rootRef} aria-label={`${BRAND} — hero`}>
      <div className="hero__stage">
        <div className="hero__bg" />

        <div className={`hero__canvas ${quality ? 'is-ready' : ''}`}>
          {quality && (
            <NutBoundary>
              <Canvas
                dpr={dpr}
                frameloop={inView ? 'always' : 'never'}
                shadows={quality.shadows}
                camera={{ fov: FOV, near: 0.1, far: 120, position: [0, 5, 7] }}
                gl={{ antialias: !quality.composer, powerPreference: 'high-performance' }}
                onCreated={({ gl, scene }) => {
                  gl.toneMapping = quality.composer
                    ? THREE.NoToneMapping
                    : (THREE.NeutralToneMapping ?? THREE.LinearToneMapping);
                  gl.toneMappingExposure = 1.05;
                  scene.environmentIntensity = 0.9;
                }}
              >
                <PerformanceMonitor onDecline={() => setLowPerf(true)} />
                <Scene progress={progress} quality={quality} />
              </Canvas>
            </NutBoundary>
          )}
        </div>

        <div className="hero__veil" />
        <div className="hero__shade" />
        <div className="hero__grain" />

        {/* 1 · wordmark */}
        <div className="hero__intro">
          <h1 className="hero__mark" aria-label={BRAND}>
            <span className="hero__ar" lang="en" aria-hidden="true">{BRAND_AR}</span>
            <span className="hero__latin" aria-hidden="true">{BRAND}</span>
          </h1>
          <div className="hero__orn" aria-hidden="true"><i /><u /><i /></div>
          <p className="hero__tag">{COPY.tagline}</p>
          <p className="hero__tag-ar" lang="ar" dir="rtl">{COPY.taglineAr}</p>
        </div>

        {/* 2 · statement */}
        <div className="hero__mid" aria-hidden="true">
          <p className="hero__mid-text">
            <span>{COPY.mid[0]}</span>
            <em>{COPY.mid[1]}</em>
          </p>
        </div>

        {/* 3 · gift */}
        <div className="hero__final">
          <span className="hero__ar hero__ar--sm" lang="en" aria-hidden="true">{BRAND_AR}</span>
          <h2 className="hero__final-title">
            <span>{COPY.finalTitle[0]}</span>
            <em>{COPY.finalTitle[1]}</em>
          </h2>
          <a className="hero__btn" href="#shop">{COPY.cta}</a>
        </div>

        <div className="hero__cue">
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </section>
  );
}