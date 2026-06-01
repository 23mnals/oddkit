# Oddkit

Frontend animation component library. Standalone — open `oddkit-demo.html` directly in a browser, no build step needed.

---

## Components

### Cube Word Stack
3D cube-flip text reveal. Words stack vertically, each word sits on a rotating cube face. Hover triggers push animation on floating ornaments.

**Web Component** · Zero dependencies · Shadow DOM

```html
<script src="public/cube-word-stack.js"></script>
<cube-word-stack text="Design|Build|Ship" bg="#EBEBE5" ink="#0A0A0A"></cube-word-stack>
```

---

### Staircase Reveal
Full-screen solid cover made of N equal bands. On trigger, bands slide off with staggered delays — their leading edges form a diagonal staircase sweeping across the screen.

**Vanilla JS** · Zero dependencies · `matchTarget` syncs band color to destination page automatically

```js
const reveal = new StaircaseReveal({
  matchTarget: '#next-section', // auto-reads destination backgroundColor
  bandCount: 11,
  staggerMs: 68,
});
reveal.play();
reveal.replay(); // re-reads color on every call — always in sync
```

---

### Constellation Sphere
Dozens of hand-drawn SVG icons distributed across a 3D sphere surface. Slow auto-rotation, drag to reorient, hover names to pulse the mapped icon.

**Web Component** · Three.js CSS3DRenderer · No WebGL · 60fps mobile

```html
<!-- Load Three.js r140 globals first -->
<script src="https://unpkg.com/three@0.140.0/build/three.min.js"></script>
<script src="https://unpkg.com/three@0.140.0/examples/js/renderers/CSS3DRenderer.js"></script>
<script src="constellation-sphere.js"></script>

<constellation-sphere
  names="Aria,Bo,Cyrus,Dahlia,Ezra"
  count="56"
  rotate-speed="0.30"
  ink="#E8E4DD"
  bg="#0A0A0A"
  style="width:100vw;height:100vh;display:block">
</constellation-sphere>
```

---

## Demo

Clone the repo and open `oddkit-demo.html` in Chrome/Safari. No server needed.

```bash
git clone https://github.com/23mnals/oddkit.git
open oddkit-demo.html
```

---

## Browser support

Chrome 89+, Edge 89+, Safari 16.4+, Firefox 108+

---

## File structure

```
oddkit/
├── oddkit-demo.html          ← full interactive documentation site
├── constellation-sphere.js   ← 3D sphere Web Component
└── public/
    ├── staircase-reveal.js   ← Staircase Reveal (standalone)
    └── cube-word-stack.js    ← Cube Word Stack (standalone)
```
