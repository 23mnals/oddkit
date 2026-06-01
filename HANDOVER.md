# Oddkit 组件库 — 交接文档

**日期**: 2026-06-01  
**项目路径**: `Claude Cowork/OUTPUTS-输出/oddkit/`  
**主文件**: `oddkit-demo.html`（standalone，直接浏览器打开）

---

## 项目结构

```
oddkit/
├── oddkit-demo.html          ← 主 demo 文件，所有组件的文档站
├── constellation-sphere.js   ← 3D球体 Web Component
├── public/
│   ├── staircase-reveal.js   ← 阶梯转场组件（独立版）
│   ├── cube-word-stack.js    ← 3D文字堆叠组件（独立版）
│   └── previews/             ← Next.js 版本的 iframe 预览（非主要）
└── app/                      ← Next.js 版本（次要，未使用）
```

> **使用方式**: 直接在浏览器用 `file://` 打开 `oddkit-demo.html`，不需要起服务器。

---

## 当前组件状态

### ✅ Cube Word Stack
- 状态：**完全正常**
- 3D cube 翻转、hover push ornaments、intro stagger 都 OK
- Shadow DOM Web Component，零依赖

### ⚠️ Staircase Reveal（阶梯揭示转场）
- **demo 内的基础 replay 功能正常**
- **本次新增：`matchTarget` 选项**（两处同步：standalone JS + demo 内联版）

**matchTarget 用法：**
```js
const reveal = new StaircaseReveal({
  matchTarget: '#next-section',  // 传 CSS selector 或 DOM element
  bandCount: 11,
  staggerMs: 68,
  bandDur: 760,
});
reveal.play();   // 自动从 #next-section 的 backgroundColor 读颜色
reveal.replay(); // 每次 replay 重新读，颜色永远跟目标页一致
```

**实现细节**：
- `_syncColor()` 在 `play()` 开头调用（不在构造时），确保目标元素已在 DOM
- 读 `getComputedStyle(target).backgroundColor`，跳过 `transparent`
- 直接 `band.style.setProperty('background-color', color, 'important')` 写入，绕过 CSS var 继承问题

**⚠️ 本次会话未确认 matchTarget 是否最终生效**，需要下一个会话验证。

### ⚠️ Constellation Sphere（3D 星座球）
- 状态：**反复修了多次，最终方案尚未用户确认**
- 最新方案：加载 **Three.js r140 的全局 CDN 脚本**，不用 ES module / importmap

**当前 HTML 引入方式：**
```html
<script src="https://unpkg.com/three@0.140.0/build/three.min.js"></script>
<script src="https://unpkg.com/three@0.140.0/examples/js/renderers/CSS3DRenderer.js"></script>
<script src="constellation-sphere.js"></script>
```

**问题历史（重要，避免走回头路）：**
1. 最初用 `<script type="module">` + importmap → 从 `file://` 打开时异步时序问题，element 未注册就 initCS() 了
2. 改为 `Promise.all([import(THREE_URL)])` 动态加载 → Chrome 从 `file://` 拉 `https://` ES module 被拦截
3. 改为 ES5 prototype `HTMLElement.call(this)` → Custom Elements 不支持，必须用 `class extends`
4. **最终方案**：Two.js r140 全局脚本 + `class extends HTMLElement` + `customElements.whenDefined().then(initCS)` 在导航时懒加载

**⚠️ 球体仍显示黑屏，用户截图后未再确认**。如果还是黑，下一步排查：
- 检查 Chrome console 有没有 `THREE is not defined` 或 CDN 加载失败
- 检查 `initCS()` 被调用时 `#cs-preview-wrap` 的 `clientWidth/clientHeight` 是否 > 0
- 备选：改用 `<script>` 标签直接下载到本地 `three.min.js` 和 `CSS3DRenderer.js`，避免网络问题

---

## 本次会话所有改动汇总

### oddkit-demo.html
- **Logo**：侧边栏品牌区改为 SVG（阶梯 mark + Silkscreen 像素字体 wordmark）
- **Favicon**：`<title>` + 阶梯 mark SVG data URI favicon
- **导航新增**：侧边栏 `3D` 分组 → Constellation Sphere 页面
- **Staircase Reveal 页**：删掉了冗余的 Cover Color picker；Customize 只保留 Timing & Shape / Axis / Page Transition 三块
- **Page Transition demo**：点 `TRANSITION →` 会在 bands 遮盖的瞬间换 demo 背景色，退场后露出目标色（参考 Cofounder 灰条入场灰页的效果）
- **Constellation Sphere 页**：完整文档页（preview / customize / install / API）
- **StaircaseReveal 内联版**：新增 `matchTarget` 选项、`_syncColor()`、`play()` 里同步颜色

### public/staircase-reveal.js（独立版）
- 新增 `matchTarget` 选项（CSS selector 或 DOM element）
- 新增 `_syncColor()` prototype 方法
- `play()` 开头调用 `_syncColor()` + 更新已有 bands 颜色（不重建 DOM）
- `replay(dir, color)` 的行为：
  - 传了 color → 直接用
  - 未传 → 调 `_syncColor()` 自动读 matchTarget

### constellation-sphere.js
- 从 ES module 改为普通 IIFE，用全局 `window.THREE`
- 不再依赖 importmap 或动态 import()
- 使用 `class extends HTMLElement`（Custom Elements 规范要求）

---

## 下一个会话需要做的事

1. **确认球体是否能显示** — 如果还是黑，在 console 看报错，考虑把 three.min.js 下载到本地
2. **验证 matchTarget 是否生效** — 写一个最简测试页：两个 section + staircase reveal，确认颜色跟随
3. **组件库继续扩展** — 下一个组件待定
4. **考虑把 oddkit-demo.html 放到本地服务器** — `file://` 协议有 CDN 限制，用 `npx serve` 或 VS Code Live Server 会更稳

---

## 重要上下文

- 用户是 Design Engineer，要求高设计感，反感 AI 模板味
- 文件打开方式：`file://` 直接浏览器打开（不起服务器）→ 这是 CDN / module 问题的根源
- oddkit-demo.html 是唯一的交付物，self-contained，Next.js 版本可以忽略
- Silkscreen 字体从 Google Fonts 加载，需要网络
