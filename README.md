# Oddkit

**[English](#english)** · **[中文](#中文)**

---

<a name="english"></a>

## English

Frontend animation component library. Standalone — open `oddkit-demo.html` directly in a browser, no build step needed.

### Components

**Cube Word Stack** — 3D cube-flip text reveal. Words stack vertically, each word sits on a rotating cube face. Hover triggers push animation on floating ornaments.

`Web Component` · Zero dependencies · Shadow DOM

```html
<script src="public/cube-word-stack.js"></script>
<cube-word-stack text="Design|Build|Ship" bg="#EBEBE5" ink="#0A0A0A"></cube-word-stack>
```

---

**Staircase Reveal** — Full-screen solid cover made of N equal bands. On trigger, bands slide off with staggered delays — their leading edges form a diagonal staircase sweeping across the screen.

`Vanilla JS` · Zero dependencies · `matchTarget` syncs band color to destination page automatically

```js
const reveal = new StaircaseReveal({
  matchTarget: '#next-section',
  bandCount: 11,
  staggerMs: 68,
});
reveal.play();
reveal.replay();
```

---

**Constellation Sphere** — Dozens of hand-drawn SVG icons distributed across a 3D sphere surface. Slow auto-rotation, drag to reorient, hover names to pulse the mapped icon.

`Web Component` · Three.js CSS3DRenderer · No WebGL · 60fps mobile

```html
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

**Scroll Airflow Text** — A fixed icon sits at the centre. As you scroll, text rows approaching the icon get pushed sideways — labels left, values right. Rows spring back once the icon passes. Icon cycles automatically.

`Vanilla JS` · Scroll-driven · Zero dependencies

```js
new ScrollAirflowText({
  iconEl:    document.querySelector('#icon-slot'),
  icons:     ['icon-a.svg', 'icon-b.svg'],
  cells:     '[data-push]',
  sideOf:    el => el.classList.contains('label') ? -1 : 1,
  maxPush:   280,
  falloffY:  320,
  iconRadius:90,
  ambient:   0,
});
```

---

### Demo

Clone and open `oddkit-demo.html` in Chrome/Safari. No server needed.

```bash
git clone https://github.com/23mnals/oddkit.git
open oddkit-demo.html
```

### Browser support

Chrome 89+, Edge 89+, Safari 16.4+, Firefox 108+

### File structure

```
oddkit/
├── oddkit-demo.html              ← interactive documentation site (open this)
├── constellation-sphere.js       ← Constellation Sphere (Web Component)
├── docs/
│   ├── scroll-airflow-text.md   ← component API reference
│   └── ...
└── public/
    ├── cube-word-stack.js        ← Cube Word Stack (standalone JS)
    ├── staircase-reveal.js       ← Staircase Reveal (standalone JS)
    ├── scroll-airflow-text.js    ← Scroll Airflow Text (standalone JS)
    ├── fonts/
    │   ├── silkscreen-regular.ttf
    │   └── silkscreen-bold.ttf
    └── previews/                 ← iframe preview pages
        ├── cube-word-stack.html
        ├── staircase-reveal.html
        └── sat-preview.html
```

---

<a name="中文"></a>

## 中文

前端动画组件库。Standalone 独立运行 — 直接用浏览器打开 `oddkit-demo.html`，无需构建步骤。

### 组件列表

**Cube Word Stack（文字立方堆叠）** — 3D 立方体翻转文字展示。文字纵向堆叠，每个词挂在旋转立方体的某一面。悬停触发浮动装饰物的弹出动画。

`Web Component` · 零依赖 · Shadow DOM

```html
<script src="public/cube-word-stack.js"></script>
<cube-word-stack text="Design|Build|Ship" bg="#EBEBE5" ink="#0A0A0A"></cube-word-stack>
```

---

**Staircase Reveal（阶梯揭示转场）** — 全屏幕实色遮罩由 N 条等宽色带组成。触发后色带依次错开滑出，前沿形成对角阶梯扫过屏幕。

`Vanilla JS` · 零依赖 · `matchTarget` 自动读取目标页背景色，实现色带颜色同步

```js
const reveal = new StaircaseReveal({
  matchTarget: '#next-section', // 自动读取目标元素的 backgroundColor
  bandCount: 11,
  staggerMs: 68,
});
reveal.play();
reveal.replay(); // 每次重播都重新读色 — 永远和目标页保持一致
```

---

**Constellation Sphere（3D 星座球）** — 数十个手绘 SVG 图标分布在三维球面上。自动慢速旋转，可拖拽重定向，悬停名称时对应图标会脉冲高亮。

`Web Component` · Three.js CSS3DRenderer · 无 WebGL · 60fps 移动端流畅

```html
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

**Scroll Airflow Text（滚动气流文字）** — 中心固定一个图标。滚动时，接近图标的文字行会被横向推开 — 标签向左、数值向右，像被无形气流吹散。图标经过后文字弹回原位，图标随滚动自动切换。

`Vanilla JS` · 滚动驱动 · 零依赖

```js
new ScrollAirflowText({
  iconEl:    document.querySelector('#icon-slot'),
  icons:     ['icon-a.svg', 'icon-b.svg'],
  cells:     '[data-push]',
  sideOf:    el => el.classList.contains('label') ? -1 : 1,
  maxPush:   280,   // 最大推移距离（px）
  falloffY:  320,   // 纵向影响范围（px）
  iconRadius:90,    // 图标周围空白半径（px）
  ambient:   0,     // 0 = 只在真正遮挡时才推；大于 0 = 区域内文字始终有微弱气流感
});
```

---

### Demo 演示

克隆仓库后用 Chrome/Safari 直接打开 `oddkit-demo.html`，无需起服务器。

```bash
git clone https://github.com/23mnals/oddkit.git
open oddkit-demo.html
```

### 浏览器兼容

Chrome 89+, Edge 89+, Safari 16.4+, Firefox 108+

### 文件结构

```
oddkit/
├── oddkit-demo.html              ← 交互文档站（直接打开这个）
├── constellation-sphere.js       ← 星座球 Web Component
├── docs/
│   ├── scroll-airflow-text.md   ← 组件 API 文档
│   └── ...
└── public/
    ├── cube-word-stack.js        ← 文字立方堆叠（独立 JS）
    ├── staircase-reveal.js       ← 阶梯揭示转场（独立 JS）
    ├── scroll-airflow-text.js    ← 滚动气流文字（独立 JS）
    ├── fonts/
    │   ├── silkscreen-regular.ttf
    │   └── silkscreen-bold.ttf
    └── previews/                 ← iframe 预览页
        ├── cube-word-stack.html
        ├── staircase-reveal.html
        └── sat-preview.html
```
