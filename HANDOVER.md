# Oddkit 组件库 — 交接文档

**日期**: 2026-06-02 (第三次更新)
**项目路径**: `Claude Cowork/OUTPUTS-输出/oddkit/`
**主文件**: `oddkit-demo.html`（standalone，直接浏览器打开 或 GitHub Pages）
**GitHub**: https://github.com/23mnals/oddkit

---

## 项目结构

```
oddkit/
├── oddkit-demo.html              ← 主文件，所有组件文档站
├── constellation-sphere.js       ← 3D球体 Web Component
├── HANDOVER.md                   ← 本文件
├── README.md                     ← 双语 EN/CN
├── docs/
│   └── scroll-airflow-text.md   ← SAT 组件 API 文档
└── public/
    ├── cube-word-stack.js        ← CWS 独立版
    ├── staircase-reveal.js       ← SR 独立版
    ├── scroll-airflow-text.js    ← SAT 独立版
    ├── airflow-ring.js           ← Airflow Ring 独立版
    ├── three.min.js              ← Three.js r140 本地副本（无CDN依赖）
    ├── CSS3DRenderer.js          ← CSS3DRenderer 本地副本
    ├── fonts/
    │   ├── AlphaLyrae-Medium.otf   ← 本地字体
    │   ├── silkscreen-regular.ttf
    │   └── silkscreen-bold.ttf
    └── previews/
        ├── cube-word-stack.html
        ├── staircase-reveal.html
        ├── sat-preview.html
        └── airflow-ring.html
```

---

## 当前组件状态

### ✅ Cube Word Stack
- 3D cube 翻转、hover push ornaments、intro stagger 都 OK
- Copy Prompt 按钮内容已校准（无 snap-back，默认值正确）

### ✅ Staircase Reveal
- 基础 replay、matchTarget（bands 自动读取目标 backgroundColor）、TRANSITION ↗ demo 均正常

### ✅ Constellation Sphere
- 球体正常显示（Three.js + CSS3DRenderer 均本地化，无 CDN 依赖）
- **本次修复（第三次）**：hover 两个 bug 均已修
  1. `_tick` 每帧覆盖 `opacity` → pulsed icon 在球背面时 glow 不可见。修复：`is-pulse` 时强制 `opacity:1`
  2. hover-pause 用 `pointermove + getBoundingClientRect` 检测不可靠 → 换为 `pointerenter`/`pointerleave` 直接挂 host 元素
  3. name `mouseenter` 额外强制 `_isHovered = true`，球一定暂停

### ✅ Scroll Airflow Text
- iframe 预览：ambient:0、无分割线、Silkscreen 字体
- Copy Prompt 按钮：tab bar 右侧，始终可见

### 🆕 Airflow Ring（已加入导航，页面待完善）
- 已在 nav 显示入口，`public/airflow-ring.js` 已提交

---

## 本次会话改动（第三次）

### constellation-sphere.js
- **hover-pause 检测**：`document.pointermove + getBoundingClientRect` → `pointerenter`/`pointerleave` on host
- **pulse opacity bug**：`_tick` 里 `is-pulse` 元素改为 `opacity:1`，不再被深度值覆盖
- **name hover 兜底**：`mouseenter` 里额外 `this._isHovered = true`

### oddkit-demo.html（之前会话改动，本次补充提交）
- Three.js + CSS3DRenderer → 本地文件（去 CDN）
- Alpha Lyrae + Silkscreen 字体 → 本地 @font-face
- preview 高度统一 700px
- Airflow Ring 导航入口

---

## Git 部署（每次改完在 Mac 终端执行）

```bash
cd "/Users/ccbakala/Claude Cowork/OUTPUTS-输出/oddkit"
git add .
git commit -m "描述本次改动"
git push
```

GitHub Pages 通常 1-2 分钟内生效。

> **注意**：sandbox 里 `git commit` 可能因 HEAD.lock 卡住，遇到时在 Mac 终端执行即可。

---

## 重要上下文

- 用户是 Design Engineer，要求高设计感，反感 AI 模板味
- 主文件 `oddkit-demo.html` 是唯一交付物（self-contained），Next.js 版本忽略
- 所有字体本地托管（AlphaLyrae OTF + Silkscreen TTF）
- Plus Jakarta Sans + JetBrains Mono 仍用 Google Fonts（body/code，降级影响小）
- Three.js + CSS3DRenderer 本地化，Constellation Sphere 无 CDN 依赖
