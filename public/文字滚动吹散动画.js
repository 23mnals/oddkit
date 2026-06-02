/* ===========================================================
 * 文字滚动吹散动画 — ScrollAirflowText
 *
 * 一个滚动驱动的「文字被气流推开」交互组件。
 * 中心一个固定 icon（可循环切换），随着用户滚动，
 * 接近 icon 的文字单元会被横向推开，远离即可保留在原位。
 *
 * 用法（全局脚本方式）：
 *   <script src="文字滚动吹散动画.js"></script>
 *   <script>
 *     new ScrollAirflowText({
 *       iconEl: document.querySelector('#myIconSlot'),
 *       icons: ['a.svg', 'b.svg', 'c.svg'],
 *       cells: '[data-push]',         // 也可以传 NodeList / Element[]
 *       sideOf: (el) => el.classList.contains('label') ? -1 : +1,
 *
 *       // 物理参数（全部可选，下面是默认值）
 *       iconRadius:    110,    // px - icon 周围保留的空白半径
 *       maxPush:       380,    // px - 最大横向位移
 *       falloffY:      360,    // px - 纵向距离的衰减区
 *       ambient:       80,     // px - 在 icon 之外时的最小推力基线
 *
 *       // icon 切换节奏
 *       swapThresholdPx: 300,  // 滚动累计多少 px 后切换一次
 *       swapCooldownMs:  700,  // 两次切换的最小间隔
 *     });
 *   </script>
 *
 * DOM 约定：
 *   - iconEl 是一个尺寸固定的容器，组件会向其中插入两层 <img> 做交叉淡入
 *   - 每一个 cell 必须是页面上独立的行内/块状元素；推力会被写到其
 *     inline transform 上，所以不要给它再加 CSS transition / 其他 transform
 *
 * 返回的实例方法：
 *   .refresh()    重新测量所有 cell 的静态布局（字体加载后、布局变化后）
 *   .update()     立即重算一次推力（一般无需手动调，scroll 会自动触发）
 *   .swap()       立即切到下一个 icon
 *   .destroy()    解除所有监听
 * =========================================================== */
(function (root) {
  'use strict';

  const DEFAULTS = {
    iconEl: null,
    icons: [],
    cells: '[data-push]',
    sideOf: null,                  // (el) => -1 | +1，决定推力方向；缺省按 cell 中心 vs viewport 中心判定

    iconRadius:      110,
    maxPush:         380,
    falloffY:        360,
    ambient:          80,

    swapThresholdPx: 300,
    swapCooldownMs:  700,

    // icon 交叉淡入参数
    swapInDuration:  380,
    swapOutDuration: 520,
    swapEasing:      'cubic-bezier(0.22,1,0.36,1)',
  };

  function resolveCells(input) {
    if (!input) return [];
    if (typeof input === 'string') return Array.from(document.querySelectorAll(input));
    if (input instanceof Element) return [input];
    if (input instanceof NodeList || Array.isArray(input)) return Array.from(input);
    return [];
  }

  class ScrollAirflowText {
    constructor(opts) {
      this.opt = Object.assign({}, DEFAULTS, opts || {});
      const iconEl = this.opt.iconEl;
      const cellEls = resolveCells(this.opt.cells);
      if (!iconEl || !cellEls.length) {
        console.warn('[ScrollAirflowText] iconEl 或 cells 缺失，组件未启动。', this.opt);
        return;
      }
      this.iconEl = iconEl;
      this.cells = cellEls.map((el) => ({
        el,
        docLeft: 0, docTop: 0, w: 0, h: 0,
        sideSign: 0,
        appliedX: 0,
      }));

      this._buildIconLayers();
      this._bind();
      this._bootstrap();
    }

    /* ---- icon 两层交叉淡入 -------------------------------------- */
    _buildIconLayers() {
      const { swapInDuration, swapOutDuration, swapEasing } = this.opt;
      const make = () => {
        const img = document.createElement('img');
        Object.assign(img.style, {
          position: 'absolute',
          inset: '0',
          width: '100%', height: '100%',
          objectFit: 'contain',
          opacity: '0',
          transform: 'scale(0.86) rotate(-6deg)',
          transition: `opacity ${swapInDuration}ms ${swapEasing}, transform ${swapOutDuration}ms ${swapEasing}`,
          willChange: 'opacity, transform',
          pointerEvents: 'none',
        });
        img.draggable = false;
        return img;
      };
      this._layerA = make();
      this._layerB = make();
      // 确保 iconEl 有定位上下文
      const cs = getComputedStyle(this.iconEl);
      if (cs.position === 'static') this.iconEl.style.position = 'relative';
      this.iconEl.appendChild(this._layerA);
      this.iconEl.appendChild(this._layerB);

      this._glyphIdx = 0;
      this._active = this._layerA;
      const first = this.opt.icons[0];
      if (first) {
        this._active.src = first;
        this._active.style.transition = 'none';
        this._active.style.opacity = '1';
        this._active.style.transform = 'scale(1) rotate(0)';
        setTimeout(() => {
          this._active.style.transition =
            `opacity ${swapInDuration}ms ${swapEasing}, transform ${swapOutDuration}ms ${swapEasing}`;
        }, 50);
      }
    }

    swap() {
      if (!this.opt.icons.length) return;
      this._glyphIdx = (this._glyphIdx + 1) % this.opt.icons.length;
      const incoming = this._active === this._layerA ? this._layerB : this._layerA;
      const outgoing = this._active;
      incoming.src = this.opt.icons[this._glyphIdx];
      incoming.style.transition = 'none';
      incoming.style.opacity = '0';
      incoming.style.transform = 'scale(0.84) rotate(-8deg)';
      void incoming.offsetWidth;
      const { swapInDuration, swapOutDuration, swapEasing } = this.opt;
      incoming.style.transition =
        `opacity ${swapInDuration}ms ${swapEasing}, transform ${swapOutDuration}ms ${swapEasing}`;
      setTimeout(() => {
        incoming.style.opacity = '1';
        incoming.style.transform = 'scale(1) rotate(0)';
        outgoing.style.opacity = '0';
        outgoing.style.transform = 'scale(1.1) rotate(8deg)';
      }, 10);
      this._active = incoming;
    }

    /* ---- 测量所有 cell 的静态布局 -------------------------------- */
    refresh() {
      const sy = window.scrollY;
      const vw = window.innerWidth;
      const cx = vw / 2;
      const customSide = typeof this.opt.sideOf === 'function' ? this.opt.sideOf : null;
      for (const c of this.cells) {
        // 暂时把 transform 清掉来读取静止位置
        const prevT = c.el.style.transform;
        c.el.style.transform = '';
        const r = c.el.getBoundingClientRect();
        c.docLeft = r.left;
        c.docTop  = r.top + sy;
        c.w = r.width;
        c.h = r.height;
        const cellCx = r.left + r.width / 2;
        if (customSide) {
          c.sideSign = customSide(c.el) < 0 ? -1 : 1;
        } else if (cellCx < cx - 4) {
          c.sideSign = -1;
        } else if (cellCx > cx + 4) {
          c.sideSign = 1;
        } else {
          c.sideSign = 1;
        }
        c.el.style.transform = prevT;
      }
      this.update();
    }

    /* ---- 计算并写入推力 ---------------------------------------- */
    update() {
      const ar = this.iconEl.getBoundingClientRect();
      const icx = ar.left + ar.width / 2;
      const icy = ar.top + ar.height / 2;
      const sy = window.scrollY;
      const { iconRadius, maxPush, falloffY, ambient } = this.opt;
      for (const c of this.cells) {
        const cellCy = c.docTop - sy + c.h / 2;
        const dy = cellCy - icy;
        const absDy = Math.abs(dy);

        let strength;
        if (absDy >= falloffY) {
          strength = 0;
        } else {
          const t = 1 - absDy / falloffY;
          strength = t * t * (3 - 2 * t);   // smoothstep
        }

        let tx = 0;
        if (strength > 0) {
          // 推力方向上的「近边」距离 icon 中心的有向距离
          const nearEdge = c.sideSign < 0
            ? c.docLeft + c.w
            : c.docLeft;
          const restGap = c.sideSign * (nearEdge - icx);
          const needed = Math.max(0, iconRadius - restGap);
          const push = strength * Math.max(needed, ambient);
          tx = c.sideSign * Math.min(push, maxPush);
        }

        if (Math.abs(tx - c.appliedX) > 0.5) {
          c.appliedX = tx;
          c.el.style.transform = `translate3d(${tx.toFixed(2)}px, 0, 0)`;
        }
      }
    }

    /* ---- 滚动监听 & icon 切换节流 ------------------------------- */
    _bind() {
      this._scrollSinceSwap = 0;
      this._lastY = window.scrollY;
      this._swapCooldownUntil = 0;
      this._onScroll = () => {
        const y = window.scrollY;
        this._scrollSinceSwap += Math.abs(y - this._lastY);
        this._lastY = y;
        if (this._scrollSinceSwap > this.opt.swapThresholdPx) {
          const now = performance.now();
          if (now > this._swapCooldownUntil) {
            this.swap();
            this._swapCooldownUntil = now + this.opt.swapCooldownMs;
            this._scrollSinceSwap = 0;
          }
        }
        this.update();
      };
      this._onResize = () => { this.refresh(); };
      window.addEventListener('scroll', this._onScroll, { passive: true });
      window.addEventListener('resize', this._onResize);
    }

    _bootstrap() {
      this.refresh();
      const refresh = () => this.refresh();
      window.addEventListener('load', refresh, { once: true });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(refresh);
      }
    }

    destroy() {
      window.removeEventListener('scroll', this._onScroll);
      window.removeEventListener('resize', this._onResize);
      if (this._layerA) this._layerA.remove();
      if (this._layerB) this._layerB.remove();
      for (const c of this.cells) c.el.style.transform = '';
    }
  }

  root.ScrollAirflowText = ScrollAirflowText;
})(typeof window !== 'undefined' ? window : globalThis);
