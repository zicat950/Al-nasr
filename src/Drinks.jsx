/**
 * AL-NASR — Drinks & Beverages
 * Scroll-driven 3D hero (React Three Fiber + GSAP ScrollTrigger)
 *
 * Dependencies:  three  @react-three/fiber  @react-three/drei  gsap
 *
 * Usage:   import Drinks from './Drinks';
 *          <Drinks />                      // intro + 31-product shop underneath
 *          <Drinks shopHref="/drinks-shop" />
 *
 * The /drinks-shop route must render the Drink.js landing page:
 *          import Drink from './Drink';
 *          <Route path="/drinks-shop" element={<Drink />} />
 *
 * CHANGES IN THIS VERSION
 *  - ONLY change: default shopHref is now '/drinks-shop' (the 31-product landing page).
 *  - Only ONE button per category flow is kept: "Shop the collection" (last scene)
 *    -> goes to shopHref. The 4 "View ..." buttons are removed.
 *  - Bottles redesigned as classic soda-style packaging:
 *      sparkling = contour glass bottle with crown cap (cola-style silhouette)
 *      premium   = PET soda bottle with ridged base and blue screw cap
 *    All branding on them is the AL-NASR wordmark (no third-party logos).
 */
import React, {
  memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Sparkles, PerformanceMonitor } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Drinks.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { SHOP_CATS, SHOP_PRODUCTS } from './Drink';

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────── tokens ───────────────────────────── */

const C = {
  teal: '#071F20',
  emerald: '#103D38',
  aqua: '#35D6C5',
  lime: '#C5D93A',
  white: '#FFFFFF',
};

// Route of the shop landing page (Drink.js). Change here if your route differs.
const SHOP_PATH = '/drinks-shop';

// Optional: path to a white/transparent PNG of the AL-NASR logo to print on labels.
const LOGO_SRC = null; // e.g. '/images/al-nasr-logo-white.png'

const SPIN = 1.6; // radians of product rotation per scene

// Only the intro ("Explore the range") and the last scene ("Shop the collection") have a button.
const STOPS = [
  {
    id: 'intro', label: 'Overview', word: 'AL-NASR', glow: C.aqua,
    title: 'Drinks & Beverages',
    text: 'Cold, bright and made to share. Scroll to meet the full AL-NASR range.',
    cta: 'Explore the range',
  },
  {
    id: 'juices', label: 'Fresh juices', word: 'FRESH', glow: C.lime,
    title: 'Fresh Juices',
    text: 'Fruit-forward juices bottled cold, from sweet mango to bright orange.',
    list: ['Orange', 'Mango', 'Apple', 'Mixed fruit'],
  },
  {
    id: 'energy', label: 'Energy drinks', word: 'ENERGY', glow: C.aqua,
    title: 'Energy Drinks',
    text: 'Ice-cold aluminium cans built for long days and late nights.',
  },
  {
    id: 'sparkling', label: 'Sparkling drinks', word: 'SPARKLE', glow: '#FF3B4E',
    title: 'Sparkling Drinks',
    text: 'Classic contour glass bottles, fine bubbles and a crisp, clean finish.',
  },
  {
    id: 'premium', label: 'Premium beverages', word: 'PREMIUM', glow: '#2F7BFF',
    title: 'Premium Beverages',
    text: 'Family-size sparkling bottles for the table, the gathering and the occasion.',
  },
  {
    id: 'collection', label: 'AL-NASR collection', word: 'AL-NASR', glow: C.aqua,
    title: 'The AL-NASR Collection',
    text: 'Every drink in the range, together in one place.',
    cta: 'Shop the collection',
  },
];

// Order matters: collection row uses this order, centre item (energy) is the middle.
const PRODUCTS = [
  { id: 'orange', kind: 'can', hero: 1, name: 'ORANGE', sub: 'Fresh juice', vol: '330 ML', a: '#E8801A', b: '#FFB347', ink: '#FFFFFF', ac: '#FFE9A8', drops: true },
  { id: 'mango', kind: 'can', name: 'MANGO', sub: 'Fresh juice', vol: '330 ML', a: '#F2B705', b: '#FF8A1F', ink: C.teal, ac: '#7A3200' },
  { id: 'apple', kind: 'can', name: 'APPLE', sub: 'Fresh juice', vol: '330 ML', a: '#4F8F1C', b: C.lime, ink: '#FFFFFF', ac: C.lime },
  { id: 'mixed', kind: 'can', name: 'MIXED FRUIT', sub: 'Fresh juice', vol: '330 ML', a: '#9B1D4F', b: '#FF7A59', ink: '#FFFFFF', ac: '#FFD1B8' },
  { id: 'energy', kind: 'can', hero: 2, name: 'ENERGY', sub: 'Energy drink', vol: '250 ML', a: '#0A5A55', b: C.aqua, ink: '#FFFFFF', ac: C.aqua, drops: true },
  { id: 'energyLime', kind: 'can', name: 'ENERGY LIME', sub: 'Energy drink', vol: '250 ML', a: '#34520C', b: C.lime, ink: '#FFFFFF', ac: C.lime },
  { id: 'energyZero', kind: 'can', name: 'ENERGY ZERO', sub: 'Energy drink', vol: '250 ML', a: '#0B2B2D', b: C.aqua, ink: '#FFFFFF', ac: C.aqua },
  // contour glass bottle (cola-style silhouette, red AL-NASR label)
  { id: 'sparkling', kind: 'bottle', variant: 'contour', hero: 3, name: 'AL-NASR COLA', sub: 'Classic sparkling', vol: '500 ML', a: '#C8102E', b: '#FF5A5F', ink: '#FFFFFF', ac: '#FFFFFF', liquid: '#2B0F06', cap: '#B8BFC1' },
  // PET soda bottle (blue AL-NASR label, blue cap)
  { id: 'premium', kind: 'bottle', variant: 'pet', hero: 4, name: 'AL-NASR BLUE', sub: 'Sparkling cola', vol: '1.25 L', a: '#0B3D91', b: '#35A7FF', ink: '#FFFFFF', ac: '#FFFFFF', liquid: '#2A1608', cap: '#0B3D91' },
];
const COMPACT_IDS = ['orange', 'mango', 'energy', 'sparkling', 'premium'];

const GLOW = STOPS.map((s) => new THREE.Color(s.glow));

/* ───────────────────────────── helpers ───────────────────────────── */

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (x) => x * x * (3 - 2 * x);
const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10);
const rnd = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const shade = (hex, l) => {
  const c = new THREE.Color(hex);
  const h = {};
  c.getHSL(h);
  c.setHSL(h.h, h.s, clamp(h.l + l, 0, 1));
  return `#${c.getHexString()}`;
};

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

function useMedia(query, initial = false) {
  const [m, setM] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const f = () => setM(mq.matches);
    f();
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [query]);
  return m;
}

/** 'low' (phones) | 'mid' (tablets) | 'high' (desktop) — controls render quality only */
function useTier() {
  const low = useMedia('(max-width: 767px)');
  const mid = useMedia('(max-width: 1199px)');
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return low ? 'low' : mid ? 'mid' : 'high';
}

/* ─────────────────────── poses (per product, per stop) ─────────────────────── */

function buildPoses(items, compact) {
  const n = items.length;
  const others = items.filter((q) => q.id !== 'energy');
  const m = others.length;
  const OUT = compact ? 4.8 : 8;
  const ringStep = compact ? 1.0 : 2.0;
  const ringGap = compact ? 0.9 : 1.3;
  const colStep = compact ? 1.05 : 0.8;
  const colSc = compact ? 0.72 : 0.82;
  const colX = compact ? 0 : 1.7; // desktop: shift right so the text panel never covers cans

  return items.map((p, i) => {
    const r1 = rnd(i, 1); const r2 = rnd(i, 2); const r3 = rnd(i, 3);
    const side = i % 2 === 0 ? -1 : 1;
    const j = others.indexOf(p);
    const heroSc = p.kind === 'can' ? (compact ? 1.4 : 1.55) : (compact ? 1.15 : 1.25);
    const arr = [];
    for (let s = 0; s <= 5; s += 1) {
      const spin = -s * SPIN;
      let P;
      if (s === 0) {
        if (p.id === 'energy') {
          P = [0, 0, 1.4, 0.08, spin, -0.28, compact ? 1.2 : 1.4];
        } else {
          let x = (j - (m - 1) / 2) * ringStep;
          x += Math.sign(x) * ringGap;
          P = [
            x, Math.sin(j * 1.7 + 0.6) * 0.75 * (compact ? 0.8 : 1), -1.2 - r1 * 1.6,
            (r2 - 0.5) * 0.4, spin + (r3 - 0.5) * 1.6, (r1 - 0.5) * 0.7,
            (compact ? 0.62 : 0.8) * (0.9 + r2 * 0.2),
          ];
        }
      } else if (s <= 4) {
        if (p.hero === s) {
          P = [0, 0, 2.2, p.kind === 'can' ? 0.16 : 0.05, spin, s % 2 ? -0.32 : 0.28, heroSc];
        } else if (p.hero && p.hero < s) {
          P = [-(OUT + (s - p.hero - 1) * 2.5), 1.2, -3, 0.1, spin, 0.3, 0.9]; // already shown: drifts out left
        } else if (p.hero) {
          P = [OUT + (p.hero - s - 1) * 2.5, -1.2, -3, 0.1, spin, -0.3, 0.9]; // queued: waits right
        } else {
          P = [
            side * ((compact ? 2.6 : 5.2) + r1 * (compact ? 0.6 : 1.8)) + Math.sin(s * 1.1 + i) * 0.5,
            (r2 > 0.5 ? 1 : -1) * (1.2 + r3 * 1.3), -3.5 - r1 * 2,
            (r2 - 0.5) * 0.4, spin + r3, (r1 - 0.5) * 0.6, compact ? 0.55 : 0.75,
          ];
        }
      } else {
        const d = i - (n - 1) / 2;
        P = [
          colX + d * colStep, -Math.abs(d) * 0.08, 1.6 - Math.abs(d) * 0.45,
          0.08, spin - d * 0.14, d * 0.05, p.kind === 'can' ? colSc : colSc * 0.92,
        ];
      }
      arr.push(P);
    }
    return arr;
  });
}

/* ───────────────────────────── label textures ───────────────────────────── */

function fitPx(g, text, weight, fam, maxW, maxPx) {
  g.font = `${weight} 100px ${fam}`;
  const w = g.measureText(text).width || 1;
  return Math.min(maxPx, (100 * maxW) / w);
}

function hexA(hex, a) {
  const c = new THREE.Color(hex);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
}

function drawLabel(cv, p, fam, logo) {
  const W = cv.width; const H = cv.height;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, W, H);

  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, shade(p.a, -0.2));
  bg.addColorStop(0.45, p.a);
  bg.addColorStop(1, shade(p.a, -0.36));
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // soft bubbles / highlights
  for (let k = 0; k < 26; k += 1) {
    g.fillStyle = `rgba(255,255,255,${0.04 + rnd(k, 5) * 0.06})`;
    g.beginPath();
    g.arc(rnd(k, 6) * W, rnd(k, 7) * H, H * (0.015 + rnd(k, 8) * 0.05), 0, Math.PI * 2);
    g.fill();
  }

  // diagonal sweeps: strong on the front (canvas centre), light on the back (seam)
  const sweep = (cx, alpha) => {
    g.fillStyle = hexA(p.b, alpha);
    g.beginPath();
    g.moveTo(cx - W * 0.2, 0); g.lineTo(cx - W * 0.07, 0);
    g.lineTo(cx + W * 0.2, H); g.lineTo(cx + W * 0.07, H);
    g.closePath(); g.fill();
    g.fillStyle = hexA(C.white, alpha * 0.35);
    g.beginPath();
    g.moveTo(cx - W * 0.03, 0); g.lineTo(cx - W * 0.015, 0);
    g.lineTo(cx + W * 0.24, H); g.lineTo(cx + W * 0.225, H);
    g.closePath(); g.fill();
  };
  sweep(W * 0.5, 0.3); sweep(0, 0.14); sweep(W, 0.14);

  // bottom band
  g.fillStyle = hexA(p.b, 0.92);
  g.fillRect(0, H * 0.84, W, H * 0.018);

  const cx = W / 2;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = p.ink;

  g.font = `600 ${H * 0.042}px ${fam}`;
  if ('letterSpacing' in g) g.letterSpacing = `${H * 0.006}px`;
  g.fillText('DRINKS & BEVERAGES', cx, H * 0.12);
  if ('letterSpacing' in g) g.letterSpacing = '0px';

  // wordmark (slanted)
  g.save();
  g.translate(cx, H * 0.38);
  g.transform(1, 0, -0.14, 1, 0, 0);
  if (logo) {
    const w = W * 0.27; const h = (logo.height / logo.width) * w;
    g.drawImage(logo, -w / 2, -h / 2, w, h);
  } else {
    const px = fitPx(g, 'AL-NASR', 900, fam, W * 0.27, H * 0.2);
    g.font = `900 ${px}px ${fam}`;
    g.fillText('AL-NASR', 0, 0);
  }
  g.restore();

  // flavour name
  const npx = fitPx(g, p.name, 800, fam, W * 0.26, H * 0.12);
  g.font = `800 ${npx}px ${fam}`;
  g.fillStyle = p.ac;
  g.fillText(p.name, cx, H * 0.62);

  g.fillStyle = p.ink;
  g.font = `500 ${H * 0.05}px ${fam}`;
  g.fillText(p.sub, cx, H * 0.73);

  g.font = `600 ${H * 0.04}px ${fam}`;
  g.fillText(p.vol, cx, H * 0.92);

  // back panel (straddles the texture seam)
  g.globalAlpha = 0.75;
  g.font = `600 ${H * 0.03}px ${fam}`;
  [0, W].forEach((x) => {
    g.fillText('AL-NASR DRINKS & BEVERAGES', x, H * 0.38);
    g.fillText('Best served chilled', x, H * 0.45);
    g.fillText('Please recycle', x, H * 0.51);
  });
  g.globalAlpha = 1;
}

function useLabelTexture(p, kind, tier) {
  const gl = useThree((s) => s.gl);
  const tex = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = tier === 'low' ? 1024 : 2048;
    cv.height = Math.round(cv.width * (kind === 'can' ? 0.605 : 0.273));
    const fam = getComputedStyle(document.body).fontFamily || 'sans-serif';
    drawLabel(cv, p, fam, null);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.offset.x = 0.5; // canvas centre → front of the product
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    t.userData = { cv, fam };
    return t;
  }, [p, kind, tier, gl]);

  useEffect(() => {
    let dead = false;
    const redraw = (logo) => {
      if (dead) return;
      drawLabel(tex.userData.cv, p, tex.userData.fam, logo || null);
      tex.needsUpdate = true;
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redraw());
    if (LOGO_SRC) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => redraw(img);
      img.src = LOGO_SRC;
    }
    return () => { dead = true; tex.dispose(); };
  }, [tex, p]);

  return tex;
}

/* ───────────────────────────── shared geometry / materials ───────────────────────────── */

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2; const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function makeShared(tier) {
  const seg = tier === 'low' ? 40 : tier === 'mid' ? 56 : 80;
  const lathe = (pts) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

  const top = lathe([
    [0.5, 0.85], [0.498, 0.89], [0.485, 0.93], [0.462, 0.965], [0.44, 0.99], [0.428, 1.003],
    [0.434, 1.022], [0.446, 1.034], [0.446, 1.044], [0.436, 1.05], [0.422, 1.048], [0.414, 1.036],
    [0.41, 1.0], [0.0, 1.0],
  ]);
  const bottom = lathe([
    [0.0, -0.9], [0.2, -0.915], [0.34, -0.93], [0.4, -0.96], [0.43, -0.98], [0.445, -0.96],
    [0.462, -0.94], [0.485, -0.9], [0.498, -0.87], [0.5, -0.85],
  ]);

  // pull-tab with finger hole
  const tabShape = roundedRect(0.22, 0.5, 0.06);
  const hole = new THREE.Path();
  hole.absarc(0, -0.15, 0.06, 0, Math.PI * 2, true);
  tabShape.holes.push(hole);
  const tab = new THREE.ExtrudeGeometry(tabShape, {
    depth: 0.012, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1,
  });
  const opening = new THREE.ShapeGeometry(new THREE.Shape().absellipse(0, 0.17, 0.13, 0.075, 0, Math.PI * 2, false, 0), 24);

  const dropCount = tier === 'low' ? 70 : tier === 'mid' ? 160 : 260;

  return {
    seg, dropCount,
    body: new THREE.CylinderGeometry(0.5, 0.5, 1.7, seg, 1, true),
    top, bottom, tab, opening,
    rivet: new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16),
    dropGeo: new THREE.SphereGeometry(1, 10, 8),
    bubbleGeo: new THREE.SphereGeometry(1, 8, 6),
    metal: new THREE.MeshPhysicalMaterial({ color: '#dfe5e6', metalness: 1, roughness: 0.2, envMapIntensity: 1.3, side: THREE.DoubleSide }),
    tabMat: new THREE.MeshPhysicalMaterial({ color: '#c9d1d2', metalness: 1, roughness: 0.28, envMapIntensity: 1.2 }),
    dark: new THREE.MeshStandardMaterial({ color: '#050808', metalness: 0.8, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -1 }),
    dropMat: new THREE.MeshPhysicalMaterial({
      color: '#ffffff', transparent: true, opacity: 0.5, roughness: 0, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0, ior: 1.33, envMapIntensity: 2.6, depthWrite: false,
    }),
    bubbleMat: new THREE.MeshStandardMaterial({ color: '#eafffb', roughness: 0.1, emissive: '#9ff', emissiveIntensity: 0.2 }),
  };
}

function disposeShared(S) {
  Object.values(S).forEach((v) => {
    if (v && typeof v.dispose === 'function') v.dispose();
  });
}

/* ───────────────────────────── product parts ───────────────────────────── */

function Droplets({ S, count, radius, y0, y1, sMin, sMax, seed }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = new THREE.Object3D();
    const q = new THREE.Quaternion();
    const nrm = new THREE.Vector3();
    const Z = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i < count; i += 1) {
      const th = (rnd(i + seed, 1) - 0.5) * Math.PI * 1.5 + (rnd(i + seed, 9) > 0.8 ? Math.PI : 0);
      const y = y0 + rnd(i + seed, 2) * (y1 - y0);
      const s = sMin + Math.pow(rnd(i + seed, 3), 2.4) * (sMax - sMin);
      const sy = s * (1 + rnd(i + seed, 4) * 0.9); // some drops slump into streaks
      nrm.set(Math.sin(th), 0, Math.cos(th));
      q.setFromUnitVectors(Z, nrm);
      d.position.set(nrm.x * (radius + s * 0.2), y, nrm.z * (radius + s * 0.2));
      d.quaternion.copy(q);
      d.scale.set(s, sy, s * 0.5);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, radius, y0, y1, sMin, sMax, seed]);
  return <instancedMesh ref={ref} args={[S.dropGeo, S.dropMat, count]} frustumCulled={false} />;
}

function Bubbles({ S, count, r, y0, y1, reduced }) {
  const ref = useRef();
  const data = useMemo(() => {
    const a = [];
    for (let i = 0; i < count; i += 1) {
      const ang = rnd(i, 21) * Math.PI * 2; const rad = Math.sqrt(rnd(i, 22)) * r;
      a.push({
        x: Math.cos(ang) * rad, z: Math.sin(ang) * rad, y: y0 + rnd(i, 23) * (y1 - y0),
        v: 0.12 + rnd(i, 24) * 0.22, s: 0.01 + rnd(i, 25) * 0.022, ph: rnd(i, 26) * 6.28,
      });
    }
    return a;
  }, [count, r, y0, y1]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    for (let i = 0; i < count; i += 1) {
      const b = data[i];
      if (!reduced) {
        b.y += b.v * dt;
        if (b.y > y1) b.y = y0;
      }
      dummy.position.set(b.x + Math.sin(time * 1.4 + b.ph) * 0.006, b.y, b.z);
      dummy.scale.setScalar(b.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[S.bubbleGeo, S.bubbleMat, count]} frustumCulled={false} />;
}

function Can({ p, S, tier }) {
  const tex = useLabelTexture(p, 'can', tier);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: tex, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.15,
  }), [tex]);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <group>
      <mesh geometry={S.body} material={mat} />
      <mesh geometry={S.top} material={S.metal} />
      <mesh geometry={S.bottom} material={S.metal} />
      <mesh geometry={S.opening} material={S.dark} rotation-x={-Math.PI / 2} position={[0, 1.0015, 0]} />
      <mesh geometry={S.tab} material={S.tabMat} rotation-x={-Math.PI / 2} position={[0, 1.006, 0.02]} />
      <mesh geometry={S.rivet} material={S.tabMat} position={[0, 1.012, 0]} />
      {p.drops && (
        <Droplets S={S} count={S.dropCount} radius={0.5} y0={-0.8} y1={0.82} sMin={0.007} sMax={0.03} seed={p.id.length * 7} />
      )}
    </group>
  );
}

/* ── bottles: classic soda-style silhouettes ──
   contour = glass bottle with waist + crown cap
   pet     = plastic bottle with petaloid base + screw cap
   profile arrays are [radius, y] from the base upward                              */

const BOTTLES = {
  contour: {
    curve: [
      [0, 0.05], [0.24, 0.02], [0.35, 0.0], [0.4, 0.07], [0.415, 0.3], [0.39, 0.55], [0.325, 0.78],
      [0.3, 0.95], [0.325, 1.15], [0.395, 1.38], [0.425, 1.6], [0.4, 1.85], [0.3, 2.08], [0.2, 2.24], [0.15, 2.34],
    ],
    lip: [[0.15, 2.46], [0.15, 2.5], [0.182, 2.53], [0.19, 2.58], [0.17, 2.62], [0.14, 2.63]],
    height: 2.63,
    fill: 1.95,
    band: [0.5, 1.5], // y-range wrapped by the label
    capY: 2.56, capR: 0.215, capH: 0.1,
  },
  pet: {
    curve: [
      [0, 0.12], [0.16, 0.08], [0.27, 0.02], [0.33, 0.0], [0.38, 0.07], [0.4, 0.25], [0.4, 1.55],
      [0.375, 1.85], [0.31, 2.08], [0.21, 2.28], [0.145, 2.4],
    ],
    lip: [[0.14, 2.55], [0.14, 2.6], [0.165, 2.62], [0.165, 2.7], [0.14, 2.72]],
    height: 2.72,
    fill: 2.0,
    band: [0.55, 1.45],
    capY: 2.64, capR: 0.18, capH: 0.2,
  },
};

function buildBottle(variant) {
  const cfg = BOTTLES[variant];
  const v = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  const spline = new THREE.SplineCurve(v(cfg.curve)).getPoints(90);
  const outer = spline.concat(v(cfg.lip));
  const inner = [new THREE.Vector2(0.001, 0.1)];
  spline.forEach((q) => {
    if (q.y > 0.1 && q.y < cfg.fill) inner.push(new THREE.Vector2(Math.max(0.002, q.x - 0.035), q.y));
  });
  inner.push(new THREE.Vector2(0.002, cfg.fill));
  // label band follows the bottle profile (so the contour waist is wrapped correctly)
  const band = spline
    .filter((q) => q.y >= cfg.band[0] && q.y <= cfg.band[1])
    .map((q) => new THREE.Vector2(q.x + 0.006, q.y));
  return { cfg, outer, inner, band };
}

function Bottle({ p, S, tier, reduced }) {
  const pet = p.variant === 'pet';
  const built = useMemo(() => {
    const b = buildBottle(p.variant);
    return {
      cfg: b.cfg,
      glass: new THREE.LatheGeometry(b.outer, S.seg),
      liquid: new THREE.LatheGeometry(b.inner, S.seg),
      band: new THREE.LatheGeometry(b.band, S.seg),
      cap: new THREE.CylinderGeometry(b.cfg.capR, b.cfg.capR, b.cfg.capH, 48),
      ribs: new THREE.TorusGeometry(b.cfg.capR, 0.012, 6, 48),
    };
  }, [p.variant, S.seg]);
  useEffect(() => () => Object.values(built).forEach((g) => g && g.dispose && g.dispose()), [built]);

  const tex = useLabelTexture(p, 'bottle', tier);
  const mats = useMemo(() => {
    const high = tier === 'high';
    const tint = pet ? '#dbeaff' : '#d9f7ee';
    const glass = high
      ? new THREE.MeshPhysicalMaterial({
        color: '#ffffff', transmission: 1, thickness: 0.4, roughness: pet ? 0.08 : 0.03, ior: pet ? 1.45 : 1.5,
        attenuationColor: new THREE.Color(tint), attenuationDistance: 3,
        envMapIntensity: 1.8, clearcoat: 1, side: THREE.DoubleSide,
      })
      : new THREE.MeshPhysicalMaterial({
        color: tint, transparent: true, opacity: 0.26, roughness: 0.04,
        envMapIntensity: 1.8, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide,
      });
    return {
      glass,
      liquid: new THREE.MeshPhysicalMaterial({ color: p.liquid, roughness: 0.12, emissive: p.liquid, emissiveIntensity: 0.1, envMapIntensity: 1.1 }),
      label: new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.4, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.2, side: THREE.DoubleSide }),
      cap: new THREE.MeshPhysicalMaterial({ color: p.cap, metalness: pet ? 0.2 : 1, roughness: pet ? 0.35 : 0.28, envMapIntensity: 1.2 }),
    };
  }, [tier, pet, p.liquid, p.cap, tex]);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const { cfg } = built;
  return (
    <group position-y={-cfg.height / 2}>
      <mesh geometry={built.liquid} material={mats.liquid} />
      <mesh geometry={built.band} material={mats.label} />
      <mesh geometry={built.cap} material={mats.cap} position-y={cfg.capY} />
      {/* crown-cap rim (glass) / grip ring (pet) */}
      <mesh geometry={built.ribs} material={mats.cap} position-y={cfg.capY - cfg.capH / 2 + 0.02} rotation-x={Math.PI / 2} />
      <mesh geometry={built.glass} material={mats.glass} />
      <Bubbles S={S} count={tier === 'low' ? 22 : tier === 'mid' ? 40 : 64} r={0.3} y0={0.15} y1={cfg.fill - 0.03} reduced={reduced} />
      <Droplets
        S={S} count={Math.round(S.dropCount * 0.6)} radius={0.405}
        y0={0.15} y1={cfg.fill + 0.2} sMin={0.006} sMax={0.026} seed={pet ? 31 : 17}
      />
    </group>
  );
}

/* ───────────────────────────── scene ───────────────────────────── */

function Lights({ tier }) {
  const res = tier === 'high' ? 256 : tier === 'mid' ? 192 : 128;
  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[2, 5, 6]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-5, 3, -4]} intensity={2.2} color={C.aqua} />
      <directionalLight position={[5, 2, -4]} intensity={1.6} color={C.lime} />
      <Environment resolution={res} frames={1}>
        <color attach="background" args={['#030c0d']} />
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={4} color="#eafffb" position={[-6, 0.5, 3]} rotation-y={Math.PI / 2.4} scale={[1.6, 9, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#f6ffd0" position={[6, 0.5, 3]} rotation-y={-Math.PI / 2.4} scale={[1.6, 9, 1]} />
        <Lightformer form="rect" intensity={2} color={C.aqua} position={[0, 0, -7]} scale={[14, 5, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#ffffff" position={[0, -3, 4]} rotation-x={-Math.PI / 2.4} scale={5} />
      </Environment>
    </>
  );
}

function Scene({ progressRef, rootRef, tier, compact, reduced }) {
  const items = useMemo(
    () => (compact ? PRODUCTS.filter((p) => COMPACT_IDS.includes(p.id)) : PRODUCTS),
    [compact],
  );
  const poses = useMemo(() => buildPoses(items, compact), [items, compact]);
  const S = useMemo(() => makeShared(tier), [tier]);
  useEffect(() => () => disposeShared(S), [S]);

  const groups = useRef([]);
  const discs = useRef();
  const tRef = useRef(progressRef.current * 5);
  const ptr = useRef({ x: 0, y: 0 });
  const lastGlow = useRef(-1);
  const tmpCol = useMemo(() => new THREE.Color(), []);
  const camPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (tier !== 'high' || reduced) return undefined;
    const onMove = (e) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [tier, reduced]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = progressRef.current * 5;
    tRef.current = reduced ? target : THREE.MathUtils.damp(tRef.current, target, 3.4, dt);
    const t = tRef.current;
    const a = Math.min(4, Math.floor(t));
    const f = smoother(clamp(t - a, 0, 1));
    const time = reduced ? 0 : state.clock.elapsedTime;
    const xLimit = compact ? 7 : 12;

    for (let i = 0; i < items.length; i += 1) {
      const g = groups.current[i];
      if (!g) continue;
      const A = poses[i][a]; const B = poses[i][a + 1];
      const x = A[0] + (B[0] - A[0]) * f;
      const z = A[2] + (B[2] - A[2]) * f;
      const vis = Math.abs(x) < xLimit && z > -9;
      if (g.visible !== vis) g.visible = vis;
      if (!vis) continue;
      const y = A[1] + (B[1] - A[1]) * f + Math.sin(time * 0.9 + i * 1.7) * 0.07;
      g.position.set(x, y, z);
      g.rotation.set(
        A[3] + (B[3] - A[3]) * f + Math.sin(time * 0.5 + i) * 0.03,
        A[4] + (B[4] - A[4]) * f + t * SPIN + Math.sin(time * 0.45 + i * 2.1) * 0.22,
        A[5] + (B[5] - A[5]) * f + Math.sin(time * 0.6 + i) * 0.02,
      );
      g.scale.setScalar(A[6] + (B[6] - A[6]) * f);
    }

    if (discs.current) {
      const k = 1 - smooth(clamp(t / 0.9, 0, 1));
      discs.current.visible = k > 0.01;
      discs.current.scale.setScalar(0.001 + k);
    }

    const baseZ = compact ? 13.8 : 13.2;
    const cz = baseZ - 1.6 * smooth(clamp(t, 0, 1)) + 1.4 * smooth(clamp(t - 4, 0, 1));
    camPos.current.x = THREE.MathUtils.damp(camPos.current.x, ptr.current.x * 0.5, 2, dt);
    camPos.current.y = THREE.MathUtils.damp(camPos.current.y, -ptr.current.y * 0.25, 2, dt);
    state.camera.position.set(camPos.current.x, camPos.current.y, cz);
    state.camera.lookAt(0, 0, 0);

    tmpCol.copy(GLOW[a]).lerp(GLOW[Math.min(5, a + 1)], f);
    const hex = tmpCol.getHex();
    if (hex !== lastGlow.current && rootRef.current) {
      lastGlow.current = hex;
      rootRef.current.style.setProperty('--glow-rgb', `${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255}`);
    }
  });

  return (
    <>
      <Lights tier={tier} />
      {items.map((p, i) => (
        <group
          key={p.id}
          ref={(el) => {
            groups.current[i] = el;
            if (el) el.rotation.order = 'ZXY';
          }}
        >
          {p.kind === 'can' ? <Can p={p} S={S} tier={tier} /> : <Bottle p={p} S={S} tier={tier} reduced={reduced} />}
        </group>
      ))}

      {tier !== 'low' && (
        <group ref={discs}>
          {[3.5, -3.5].map((y) => (
            <group key={y} position-y={y}>
              <mesh>
                <cylinderGeometry args={[1.25, 1.25, 0.07, 64]} />
                <meshPhysicalMaterial color="#1a2a2b" metalness={1} roughness={0.25} envMapIntensity={1.2} />
              </mesh>
              <mesh rotation-x={Math.PI / 2} position-y={y > 0 ? -0.04 : 0.04}>
                <torusGeometry args={[1.0, 0.018, 8, 64]} />
                <meshBasicMaterial color={C.aqua} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      <Sparkles
        count={tier === 'high' ? 60 : tier === 'mid' ? 36 : 14}
        scale={[14, 8, 6]} size={2} speed={reduced ? 0 : 0.25} opacity={0.5} color={C.aqua}
      />
    </>
  );
}

const Stage = memo(function Stage({ progressRef, rootRef, tier, compact, reduced, running, onLost }) {
  const [maxDpr, setMaxDpr] = useState(tier === 'low' ? 1.5 : tier === 'mid' ? 1.75 : 2);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  return (
    <Canvas
      frameloop={running ? 'always' : 'never'}
      dpr={[1, maxDpr]}
      camera={{ fov: compact ? 34 : 28, position: [0, 0, compact ? 13.8 : 13.2], near: 0.1, far: 60 }}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); if (alive.current) onLost(); }, { once: true });
      }}
    >
      <PerformanceMonitor onDecline={() => setMaxDpr((d) => Math.max(1, d - 0.5))} />
      <Scene progressRef={progressRef} rootRef={rootRef} tier={tier} compact={compact} reduced={reduced} />
    </Canvas>
  );
});

/* ───────────────────────────── UI ───────────────────────────── */

const ICONS = {
  juices: <path d="M12 3c3 4.2 5.5 7 5.5 10.2A5.5 5.5 0 0 1 12 18.7a5.5 5.5 0 0 1-5.5-5.5C6.5 10 9 7.2 12 3Z" />,
  energy: <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z" />,
  sparkling: (
    <>
      <circle cx="9" cy="15" r="3.2" /><circle cx="16" cy="9" r="2.4" /><circle cx="15.5" cy="17.5" r="1.4" />
    </>
  ),
  premium: <path d="M10 2h4v4c0 1.6 2.2 2.4 2.2 5.2V21a1 1 0 0 1-1 1H8.8a1 1 0 0 1-1-1v-9.8C7.8 8.4 10 7.6 10 6V2Z" />,
  collection: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
    </>
  ),
};

function Icon({ id }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      {ICONS[id]}
    </svg>
  );
}

function StaticFallback({ shopHref }) {
  const last = STOPS[STOPS.length - 1];
  return (
    <section className="dr dr--static" aria-label="AL-NASR Drinks & Beverages">
      <div className="dr__static-inner">
        <h2 className="dr__title">{STOPS[0].title}</h2>
        <p className="dr__text">{STOPS[0].text}</p>
        <div className="dr__static-grid">
          {STOPS.slice(1, 5).map((s) => (
            <article key={s.id} className="dr__static-card">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
        <p style={{ marginTop: '2rem' }}>
          <a className="dr__cta" href={shopHref}>{last.cta}</a>
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────────── SHOP (31 products, below the 3D intro) ─────────────────────────────
   Product data lives in ./Drink.js — edit names, prices and images there.
   Or pass your own list:  <Drinks products={myProducts} onAddToCart={(item) => addToCart(item)} />
   Product shape: { id, cat, name, sub, a, b, sizes:[{label, price}], img? }
   onAddToCart receives: { product, size, price, qty }                                   */

const rupee = (n) => `₹${n.toLocaleString('en-IN')}`;

function Pack({ p }) {
  if (p.img) return <img className="shop__img" src={p.img} alt={p.name} loading="lazy" />;
  const bottle = p.cat === 'sparkling' || p.cat === 'premium';
  return (
    <div className={`pack pack--${bottle ? 'bottle' : 'can'}`} style={{ '--a': p.a, '--b': p.b }} aria-hidden="true">
      <span className="pack__top" />
      <span className="pack__body"><b>AL-NASR</b><i>{p.name}</i></span>
    </div>
  );
}

const ProductCard = memo(function ProductCard({ p, onAdd, wished, onWish }) {
  const [si, setSi] = useState(0);
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const size = p.sizes[si];
  const add = () => {
    onAdd({ product: p, size: size.label, price: size.price, qty });
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  };
  return (
    <article className="shop__card">
      <div className="shop__media">
        <Pack p={p} />
        <button
          type="button"
          className={`shop__wish${wished ? ' is-on' : ''}`}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
          onClick={() => onWish(p)}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M12 20.5s-8-4.9-8-10.6C4 6.9 6 5 8.3 5c1.5 0 2.8.8 3.7 2.1C12.9 5.8 14.2 5 15.700 5 18 5 20 6.9 20 9.9c0 5.700-8 10.6-8 10.6Z" />
          </svg>
        </button>
      </div>
      <h3 className="shop__name">{p.name}</h3>
      <p className="shop__sub">{p.sub}</p>
      <div className="shop__row">
        <select className="shop__select" value={si} onChange={(e) => setSi(+e.target.value)} aria-label={`${p.name} size`}>
          {p.sizes.map((s, i) => <option key={s.label} value={i}>{s.label}</option>)}
        </select>
        <div className="shop__qty">
          <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span>{qty}</span>
          <button type="button" aria-label="Increase" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
        </div>
      </div>
      <div className="shop__price">{rupee(size.price * qty)}</div>
      <button type="button" className={`shop__add${done ? ' is-done' : ''}`} onClick={add}>
        {done ? '✓ Added' : 'Add to cart'}
      </button>
    </article>
  );
});

const WISH_KEY = 'alnasr-wishlist';
function readWish() {
  try { return JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); } catch (e) { return []; }
}

function Shop({ products, onAddToCart, onViewCart }) {
  const [cat, setCat] = useState('all');
  const [wish, setWish] = useState(readWish);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = useCallback((text, withCart) => {
    setToast({ text, withCart });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const toggleWish = useCallback((p) => {
    setWish((w) => {
      const on = w.includes(p.id);
      const next = on ? w.filter((x) => x !== p.id) : [...w, p.id];
      try { localStorage.setItem(WISH_KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
      window.dispatchEvent(new CustomEvent('alnasr:wishlist', { detail: { id: p.id, on: !on, ids: next } }));
      return next;
    });
    showToast('Wishlist updated', false);
  }, [showToast]);
  const list = useMemo(() => (cat === 'all' ? products : products.filter((p) => p.cat === cat)), [cat, products]);
  const onAdd = useCallback((item) => {
    if (onAddToCart) onAddToCart(item);
    // also broadcast, so a global cart can listen:  window.addEventListener('alnasr:add-to-cart', e => ...)
    window.dispatchEvent(new CustomEvent('alnasr:add-to-cart', { detail: item }));
    showToast(`${item.product.name} (${item.size}) added to your bag`, true);
  }, [onAddToCart, showToast]);
  return (
    <section className="shop" id="drinks-shop" aria-label="Shop AL-NASR drinks">
      <header className="shop__head">
        <p className="shop__eyebrow">Drinks &amp; Beverages</p>
        <h2 className="shop__title">Shop the collection</h2>
        <p className="shop__lead">{products.length} drinks, chilled and ready to order.</p>
      </header>
      <div className="shop__tabs" role="tablist" aria-label="Drink categories">
        {SHOP_CATS.map((c) => {
          const n = c.id === 'all' ? products.length : products.filter((p) => p.cat === c.id).length;
          return (
            <button key={c.id} type="button" role="tab" aria-selected={cat === c.id}
              className={`shop__tab${cat === c.id ? ' is-active' : ''}`} onClick={() => setCat(c.id)}>
              {c.label} <span>{n}</span>
            </button>
          );
        })}
      </div>
      <div className="shop__grid">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} onAdd={onAdd} wished={wish.includes(p.id)} onWish={toggleWish} />
        ))}
      </div>
      <div className={`shop__toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        <span>{toast ? toast.text : ''}</span>
        {toast && toast.withCart && (
          <button type="button" onClick={onViewCart}>View bag</button>
        )}
      </div>
    </section>
  );
}

/* ───────────────────────────── 3D scroll hero ───────────────────────────── */

function Hero({ shopHref, onShop }) {
  const tier = useTier();
  const compact = useMedia('(max-width: 767px), (max-width: 1199px) and (orientation: portrait)');
  const reduced = useMedia('(prefers-reduced-motion: reduce)');

  const rootRef = useRef(null);
  const progress = useRef(0);
  const stRef = useRef(null);

  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [webgl, setWebgl] = useState(null);

  useEffect(() => { setWebgl(hasWebGL()); }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sync = (self) => {
        progress.current = self.progress;
        rootRef.current && rootRef.current.style.setProperty('--p', self.progress.toFixed(4));
        const i = Math.round(self.progress * 5);
        setActive((prev) => (prev === i ? prev : i));
      };
      stRef.current = ScrollTrigger.create({
        trigger: rootRef.current, start: 'top top', end: 'bottom bottom',
        onUpdate: sync, onRefresh: sync,
      });
    }, rootRef);
    return () => { ctx.revert(); stRef.current = null; };
  }, [webgl]);

  useEffect(() => { ScrollTrigger.refresh(); }, [tier, compact]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !('IntersectionObserver' in window)) { setNear(true); setInView(true); return undefined; }
    const far = new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true); }, { rootMargin: '800px 0px' });
    const vis = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '100px 0px' });
    far.observe(el); vis.observe(el);
    return () => { far.disconnect(); vis.disconnect(); };
  }, [webgl]);

  const goTo = useCallback((i) => {
    const st = stRef.current;
    if (!st) return;
    window.scrollTo({ top: st.start + (st.end - st.start) * (i / 5), behavior: reduced ? 'auto' : 'smooth' });
  }, [reduced]);

  const onLost = useCallback(() => setWebgl(false), []);

  if (webgl === false) return <StaticFallback shopHref={shopHref} />;

  const s = STOPS[active];
  const isLast = active === STOPS.length - 1;
  return (
    <section ref={rootRef} className={`dr dr--${tier || 'high'}`} aria-label="AL-NASR Drinks & Beverages">
      <div className="dr__stage">
        <div className="dr__words" aria-hidden="true">
          {STOPS.map((w, i) => (
            <span key={w.id} className={`dr__word${i === active ? ' is-active' : ''}`}>{w.word}</span>
          ))}
        </div>

        <div className="dr__canvas">
          {webgl && near && tier && (
            <Stage
              key={`${tier}-${compact}`}
              progressRef={progress}
              rootRef={rootRef}
              tier={tier}
              compact={compact}
              reduced={reduced}
              running={inView}
              onLost={onLost}
            />
          )}
        </div>

        <div className="dr__live" aria-live="polite">
          <div className="dr__info" key={s.id}>
            <h2 className="dr__title">{s.title}</h2>
            <p className="dr__text">{s.text}</p>
            {s.list && (
              <ul className="dr__list">
                {s.list.map((l) => <li key={l}>{l}</li>)}
              </ul>
            )}
            {active === 0 && (
              <button type="button" className="dr__cta" onClick={() => goTo(1)}>{s.cta}</button>
            )}
            {/* the ONLY shop button: last scene -> /drinks-shop (Drink.js landing page) */}
            {isLast && (
              <a
                className="dr__cta"
                href={shopHref}
                onClick={(e) => { if (onShop) { e.preventDefault(); onShop(); } }}
              >{s.cta}</a>
            )}
          </div>
        </div>

        <nav className="dr__nav" aria-label="Drinks categories">
          {STOPS.slice(1).map((n, k) => (
            <button
              key={n.id}
              type="button"
              className={`dr__dot${active === k + 1 ? ' is-active' : ''}`}
              aria-label={n.label}
              aria-current={active === k + 1 ? 'true' : undefined}
              onClick={() => goTo(k + 1)}
            >
              <Icon id={n.id} />
              <span className="dr__tip">{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="dr__bar" aria-hidden="true" />
        <div className={`dr__hint${active > 0 ? ' is-hidden' : ''}`} aria-hidden="true">Scroll</div>
      </div>
    </section>
  );
}
/** Drinks page = 3D intro (unchanged) + the 31-product shop right below it.
 *  <Drinks />   adds to CartContext, "View bag" opens /cart (cartPath prop to change)  */
export default function Drinks({ shopHref = '#drinks-shop', products = SHOP_PRODUCTS, onAddToCart, cartPath = '/cart' }) {
  const navigate = useNavigate();
  let cart = null;
  try { cart = useCart(); } catch (e) { cart = null; } // eslint-disable-line react-hooks/rules-of-hooks

  // Adds to YOUR cart (CartContext). Item shape matches what Cart.jsx reads:
  // { id, name, price, qty, category, weight, image }
  const addToCart = useCallback(({ product, size, price, qty }) => {
    if (onAddToCart) { onAddToCart({ product, size, price, qty }); return; }
    const fn = cart && (cart.addItem || cart.addToCart || cart.add);
    if (!fn) { console.warn('[Drinks] CartContext has no add function (addItem / addToCart / add).'); return; }
    const item = {
      id: `${product.id}-${size.replace(/\s+/g, '').toLowerCase()}`, // one cart line per product + size
      name: product.name,
      price,
      qty,
      category: 'Drinks & Beverages',
      weight: size,
      image: product.img || null,
    };
    fn(item, qty);
  }, [cart, onAddToCart]);

  const goShop = useCallback(() => {
    const el = document.getElementById('drinks-shop');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const viewCart = useCallback(() => navigate(cartPath), [navigate, cartPath]);

  return (
    <>
      <Hero shopHref={shopHref} onShop={shopHref === '#drinks-shop' ? goShop : null} />
      <Shop products={products} onAddToCart={addToCart} onViewCart={viewCart} />
    </>
  );
}