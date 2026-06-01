/* =============================================================
 * <cube-word-stack> — drop-in Web Component
 *
 * Recreates the Seventeen Agency hero: white blocks + Bagoss-style
 * cube flip on hover + 4 floating ornaments that get nudged when
 * a nearby word flips.
 *
 * Mirrors the structure / styles / animations of `About Hero.html`
 * 1:1 — anything you can do there, the component does identically.
 *
 * USAGE
 * -----
 *   1. Load a font in your host page (the component doesn't ship a font):
 *
 *      <style>
 *        @font-face {
 *          font-family: "Bagoss Condensed";
 *          src: url("path/to/Bagoss.otf") format("opentype");
 *        }
 *      </style>
 *
 *   2. <script src="cube-word-stack.js"></script>
 *
 *   3. Drop the element in. Icons are plain <img> children with
 *      data-* attrs telling the component where to place them.
 *
 *      <cube-word-stack
 *        text="A|collective|of|Odd Minds|brings|new|angles|with|meaning"
 *        bg="#DCDDDD"
 *        block="#FFFFFF"
 *        ink="#0A0A0A"
 *        font='"Bagoss Condensed", serif'>
 *
 *        <img data-anchor="top-right"    data-offset="40"  data-size="86" data-vertical="6%"  src="ornament-1.svg" alt="">
 *        <img data-anchor="top-left"     data-offset="30"  data-size="96" data-vertical="22%" src="ornament-2.svg" alt="">
 *        <img data-anchor="bottom-left"  data-offset="150" data-size="76" data-vertical="26%" src="ornament-3.svg" alt="">
 *        <img data-anchor="bottom-right" data-offset="80"  data-size="80" data-vertical="14%" src="ornament-4.svg" alt="">
 *      </cube-word-stack>
 *
 * See cube-word-stack.md for the full attribute / icon reference.
 * ============================================================= */

(function () {
  if (window.customElements && window.customElements.get('cube-word-stack')) return;

  /* -------- STYLES --------
     Mirrors About Hero.html one-to-one.
     Critical: every block uses `box-sizing: border-box` so that the
     back/left/right faces (which are width:100% height:100%) match
     the front face exactly — without this, the cube "breathes" in
     height during flip. */
  const STYLES = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      --bg:          #EFEAE3;
      --block:       #FFFFFF;
      --ink:         #0A0A0A;
      --font:        "Times New Roman", serif;
      --font-size:   clamp(34px, 4.4vw, 76px);
      --ease-flip:   cubic-bezier(0.45, 0, 0.55, 1);
      --ease-push:   cubic-bezier(0.22, 1, 0.36, 1);
      --dur-flip:    720ms;
      --dur-push:    700ms;
      --perspective: 900px;

      position: relative;
      display: block;
      width: 100%;
      min-height: 100vh;
      background: var(--bg);
      color: var(--ink);
      font-family: var(--font);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      overflow: hidden;
    }

    .hero {
      position: relative;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      z-index: 1;
    }

    .stack {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      z-index: 2;
    }

    /* === CUBE === */
    .cube-wrap {
      perspective: var(--perspective);
      display: inline-block;
      line-height: 0;
    }
    .cube {
      position: relative;
      transform-style: preserve-3d;
      transition: transform var(--dur-flip) var(--ease-flip);
      display: inline-block;
      cursor: pointer;
      will-change: transform;
    }
    .face {
      background: var(--block);
      color: var(--ink);
      font-size: var(--font-size);
      font-weight: 500;
      font-family: inherit;
      padding: 0.06em 0.22em 0.22em;
      white-space: nowrap;
      line-height: 1.0;
      letter-spacing: -0.005em;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .face.front {
      position: relative;
      transform: translateZ(var(--half, 0px));
    }
    .face.back,
    .face.right,
    .face.left {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
    }
    .face.right { transform: rotateY( 90deg) translateZ(var(--half, 0px)); }
    .face.back  { transform: rotateY(180deg) translateZ(var(--half, 0px)); }
    .face.left  { transform: rotateY(-90deg) translateZ(var(--half, 0px)); }

    /* === DECO ornaments === */
    .deco {
      position: absolute;
      pointer-events: none;
      z-index: 5;
      will-change: transform;
      transform: translate(var(--push-x, 0px), var(--push-y, 0px));
      transition: transform var(--dur-push) var(--ease-push);
    }
    .deco-inner {
      width: 100%;
      height: 100%;
      will-change: transform;
    }
    .deco img,
    .deco svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    @keyframes floatA {
      0%,100% { transform: translate(0,0)       rotate(0deg); }
      50%     { transform: translate(6px,-9px)  rotate(3deg); }
    }
    @keyframes floatB {
      0%,100% { transform: translate(0,0)       rotate(0deg); }
      50%     { transform: translate(-7px,5px)  rotate(-4deg); }
    }
    @keyframes floatC {
      0%,100% { transform: translate(0,0)       rotate(0deg); }
      50%     { transform: translate(4px,7px)   rotate(-2deg); }
    }
    @keyframes floatD {
      0%,100% { transform: translate(0,0)       rotate(0deg); }
      50%     { transform: translate(-5px,-6px) rotate(2.5deg); }
    }
    .anim-0 .deco-inner { animation: floatA 5.2s ease-in-out infinite; }
    .anim-1 .deco-inner { animation: floatB 6.4s ease-in-out infinite -1.1s; }
    .anim-2 .deco-inner { animation: floatC 4.8s ease-in-out infinite -2.0s; }
    .anim-3 .deco-inner { animation: floatD 5.8s ease-in-out infinite -0.6s; }
  `;

  class CubeWordStack extends HTMLElement {
    static get observedAttributes() {
      return [
        'text', 'bg', 'block', 'ink',
        'font', 'font-min', 'font-vw', 'font-max',
        'push-max-x', 'push-max-y', 'push-falloff', 'push-hold',
        'intro-stagger'
      ];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._rot = new WeakMap();
      this._pushTimer = null;
      this._resizeRAF = null;
    }

    connectedCallback() {
      this.shadowRoot.innerHTML = `
        <style>${STYLES}</style>
        <section class="hero" part="hero">
          <div class="stack" part="stack"></div>
        </section>
      `;
      this._applyTokens();
      this._buildCubes();
      this._wireHover();
      this._scheduleInit();
      this._waitForIcons();

      this._onResize = this._onResize.bind(this);
      window.addEventListener('resize', this._onResize);
    }

    /* Children (<img data-anchor="...">) are parsed AFTER the host element's
       opening tag, so connectedCallback runs before they exist. Watch for them
       and build the deco wrappers once they're present. Also handles the case
       where the user adds icons dynamically (e.g. via React render). */
    _waitForIcons() {
      if (this._iconObserver) {
        this._iconObserver.disconnect();
        this._iconObserver = null;
      }
      const tryBuild = () => {
        if (this.querySelector(':scope > img[data-anchor]')) {
          this._buildIcons();
          return true;
        }
        return false;
      };
      if (tryBuild()) return;
      this._iconObserver = new MutationObserver(() => {
        if (tryBuild()) {
          this._iconObserver.disconnect();
          this._iconObserver = null;
        }
      });
      this._iconObserver.observe(this, { childList: true });
    }

    disconnectedCallback() {
      window.removeEventListener('resize', this._onResize);
      clearTimeout(this._pushTimer);
      if (this._iconObserver) {
        this._iconObserver.disconnect();
        this._iconObserver = null;
      }
    }

    attributeChangedCallback() {
      if (!this.shadowRoot.querySelector('.stack')) return;
      this._applyTokens();
      this._buildCubes();
      this._wireHover();
      this._scheduleInit();
      this._waitForIcons();
    }

    /* ---------------- internal ---------------- */

    _applyTokens() {
      const bg    = this.getAttribute('bg')    || '#EFEAE3';
      const block = this.getAttribute('block') || '#FFFFFF';
      const ink   = this.getAttribute('ink')   || '#0A0A0A';
      const font  = this.getAttribute('font')  || '"Times New Roman", serif';
      const fMin  = this.getAttribute('font-min') || '34px';
      const fVw   = this.getAttribute('font-vw')  || '4.4vw';
      const fMax  = this.getAttribute('font-max') || '76px';

      this.style.setProperty('--bg',    bg);
      this.style.setProperty('--block', block);
      this.style.setProperty('--ink',   ink);
      this.style.setProperty('--font',  font);
      this.style.setProperty('--font-size', `clamp(${fMin}, ${fVw}, ${fMax})`);
    }

    _buildCubes() {
      const stack = this.shadowRoot.querySelector('.stack');
      stack.innerHTML = '';
      const raw = (this.getAttribute('text') || '').replace(/\.+\s*$/, '');
      const words = raw.split('|').map(w => w.trim()).filter(Boolean);
      stack.setAttribute('aria-label', words.join(' ') + '.');

      words.forEach((w) => {
        const wrap = document.createElement('div');
        wrap.className = 'cube-wrap';
        wrap.innerHTML =
          '<div class="cube">' +
            '<div class="face front">' + escapeHtml(w) + '</div>' +
            '<div class="face right">' + escapeHtml(w) + '</div>' +
            '<div class="face back">'  + escapeHtml(w) + '</div>' +
            '<div class="face left">'  + escapeHtml(w) + '</div>' +
          '</div>';
        stack.appendChild(wrap);
      });
    }

    _buildIcons() {
      const hero = this.shadowRoot.querySelector('.hero');
      // Wipe old deco wrappers
      hero.querySelectorAll('.deco').forEach((d) => d.remove());

      // Find user-supplied <img> children with data-anchor — these are the icons.
      // No slot mechanism: we clone the image straight into the shadow DOM so
      // the user's HTML stays simple ("here is an <img src='...'> with where it goes").
      const sourceIcons = Array.from(this.querySelectorAll(':scope > img[data-anchor]'));

      sourceIcons.forEach((src, idx) => {
        const anchor   = (src.dataset.anchor || 'top-right').toLowerCase();
        const offset   = parseFloat(src.dataset.offset   || '60');
        const size     = parseFloat(src.dataset.size     || '80');
        const vertical = src.dataset.vertical || '6%';

        const deco = document.createElement('div');
        deco.className = 'deco anim-' + (idx % 4);
        deco.dataset.anchor = anchor;
        deco.style.width  = size + 'px';
        deco.style.height = size + 'px';

        switch (anchor) {
          case 'top-left':
            deco.style.top   = vertical;
            deco.style.right = `calc(50% + ${offset}px)`;
            break;
          case 'top-right':
            deco.style.top  = vertical;
            deco.style.left = `calc(50% + ${offset}px)`;
            break;
          case 'bottom-left':
            deco.style.bottom = vertical;
            deco.style.right  = `calc(50% + ${offset}px)`;
            break;
          case 'bottom-right':
          default:
            deco.style.bottom = vertical;
            deco.style.left   = `calc(50% + ${offset}px)`;
        }

        const inner = document.createElement('div');
        inner.className = 'deco-inner';

        // Clone the image (preserve src/alt/etc). The original stays in light DOM
        // but is visually hidden by `:host` overflow + `display:none` on light children.
        const clone = src.cloneNode(true);
        clone.removeAttribute('data-anchor');
        clone.removeAttribute('data-offset');
        clone.removeAttribute('data-size');
        clone.removeAttribute('data-vertical');
        clone.style.display = ''; // clear inherited inline display:none from light DOM original
        inner.appendChild(clone);

        deco.appendChild(inner);
        hero.appendChild(deco);
      });

      // Hide the original light-DOM <img> sources — they're only declarations
      // pointing at where the icon should go. The visible copies live in shadow.
      sourceIcons.forEach((s) => { s.style.display = 'none'; });
    }

    _wireHover() {
      const cubeWraps = Array.from(this.shadowRoot.querySelectorAll('.cube-wrap'));
      cubeWraps.forEach((wrap) => {
        const cube = wrap.querySelector('.cube');
        let busy = false;
        wrap.addEventListener('mouseenter', () => {
          this._applyPush(wrap);
          if (busy) return;
          busy = true;
          const cur = this._rot.get(cube) ?? 0;
          const next = cur - 90;
          this._rot.set(cube, next);
          cube.style.transform = `rotateY(${next}deg)`;
          setTimeout(() => { busy = false; }, 480);
        });
      });
    }

    _applyPush(cubeWrap) {
      const MAX_X   = parseFloat(this.getAttribute('push-max-x'))   || 70;
      const MAX_Y   = parseFloat(this.getAttribute('push-max-y'))   || 14;
      const FALLOFF = parseFloat(this.getAttribute('push-falloff')) || 280;
      const HOLD_MS = parseFloat(this.getAttribute('push-hold'))    || 3000;

      const cr = cubeWrap.getBoundingClientRect();
      const cy = cr.top  + cr.height / 2;
      const cx = cr.left + cr.width  / 2;

      const decos = this.shadowRoot.querySelectorAll('.deco');
      decos.forEach((d) => {
        const dr = d.getBoundingClientRect();
        const dy = dr.top  + dr.height / 2;
        const dx = dr.left + dr.width  / 2;
        const proximity = Math.max(0, 1 - Math.abs(cy - dy) / FALLOFF);
        const sideX = dx < cx ? -1 : 1;
        const sideY = dy < cy ? -1 : 1;
        d.style.setProperty('--push-x', (sideX * proximity * MAX_X) + 'px');
        d.style.setProperty('--push-y', (sideY * proximity * MAX_Y) + 'px');
      });

      clearTimeout(this._pushTimer);
      this._pushTimer = setTimeout(() => {
        decos.forEach((d) => {
          d.style.setProperty('--push-x', '0px');
          d.style.setProperty('--push-y', '0px');
        });
      }, HOLD_MS);
    }

    _measure() {
      const cubes = this.shadowRoot.querySelectorAll('.cube');
      cubes.forEach((cube) => {
        const front = cube.querySelector('.front');
        const w = front.offsetWidth;
        cube.style.setProperty('--half', (w / 2) + 'px');
      });
    }

    _preState() {
      const cubes = this.shadowRoot.querySelectorAll('.cube');
      cubes.forEach((cube) => {
        cube.style.transition = 'none';
        cube.style.transform  = 'rotateY(-90deg)';
        this._rot.set(cube, -90);
      });
      // force reflow
      void this.offsetWidth;
      cubes.forEach((cube) => { cube.style.transition = ''; });
    }

    _intro() {
      const stagger = parseFloat(this.getAttribute('intro-stagger')) || 110;
      const cubes = Array.from(this.shadowRoot.querySelectorAll('.cube'));
      cubes.forEach((cube, i) => {
        setTimeout(() => {
          const cur  = this._rot.get(cube) ?? -90;
          const next = cur + 90;
          this._rot.set(cube, next);
          cube.style.transform = `rotateY(${next}deg)`;
        }, 220 + i * stagger);
      });
    }

    _scheduleInit() {
      const run = () => {
        this._measure();
        this._preState();
        requestAnimationFrame(() => {
          this._measure();
          this._preState();
          this._intro();
        });
      };
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(run);
      } else {
        run();
      }
    }

    _onResize() {
      cancelAnimationFrame(this._resizeRAF);
      this._resizeRAF = requestAnimationFrame(() => this._measure());
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  customElements.define('cube-word-stack', CubeWordStack);
})();
