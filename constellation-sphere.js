/* =============================================================
 * <constellation-sphere> — Web Component
 *
 * Requires Three.js r140 global scripts loaded BEFORE this file:
 *   <script src="https://unpkg.com/three@0.140.0/build/three.min.js"></script>
 *   <script src="https://unpkg.com/three@0.140.0/examples/js/renderers/CSS3DRenderer.js"></script>
 *   <script src="constellation-sphere.js"></script>
 * ============================================================= */

(function () {
  'use strict';

  // Guard — if Three.js didn't load, bail gracefully
  if (typeof THREE === 'undefined') {
    console.error('[constellation-sphere] THREE not found. Load three.min.js first.');
    return;
  }

  const CSS3DRenderer = THREE.CSS3DRenderer;
  const CSS3DObject   = THREE.CSS3DObject;

  const DEFAULT_NAMES = [
    'Aria','Bo','Cyrus','Dahlia','Ezra','Fenix',
    'Giles','Hana','Ivo','Junie','Kit','Luca',
    'Mira','Noor','Otis','Pell','Quinn'
  ];

  function buildMarks(INK) {
    const S = `stroke="${INK}" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`;
    const F = `fill="${INK}"`;
    return [
      `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" ${S}/><circle cx="12" cy="14" r="1.2" ${F}/><circle cx="20" cy="14" r="1.2" ${F}/><path d="M11 19 Q16 23 21 19" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M8 14 L6 7 L12 11 M24 14 L26 7 L20 11" ${S}/><circle cx="16" cy="18" r="8" ${S}/><circle cx="13" cy="17" r="1" ${F}/><circle cx="19" cy="17" r="1" ${F}/><path d="M14 21 Q16 22 18 21" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M6 18 Q12 8 22 14 Q26 16 28 14 L22 22 Q14 26 6 18 Z" ${S}/><circle cx="22" cy="14.5" r="0.9" ${F}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M4 16 Q14 8 22 16 Q14 24 4 16 Z M22 16 L29 11 L29 21 Z" ${S}/><circle cx="9" cy="15" r="0.9" ${F}/></svg>`,
      `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="3" ${S}/><circle cx="16" cy="8" r="3.5" ${S}/><circle cx="16" cy="24" r="3.5" ${S}/><circle cx="8" cy="16" r="3.5" ${S}/><circle cx="24" cy="16" r="3.5" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M5 16 Q5 6 16 6 Q27 6 27 16 Z" ${S}/><path d="M13 16 L13 25 Q13 27 16 27 Q19 27 19 25 L19 16" ${S}/><circle cx="12" cy="12" r="1.4" ${F}/><circle cx="20" cy="11" r="1" ${F}/></svg>`,
      `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="5" ${S}/><path d="M16 3 L16 7 M16 25 L16 29 M3 16 L7 16 M25 16 L29 16 M6 6 L9 9 M23 23 L26 26 M26 6 L23 9 M9 23 L6 26" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M22 6 Q12 8 12 16 Q12 24 22 26 Q14 24 14 16 Q14 8 22 6 Z" ${F}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M8 22 Q4 22 4 18 Q4 14 9 14 Q10 9 16 9 Q22 9 23 14 Q28 14 28 18 Q28 22 24 22 Z" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M18 3 L8 18 L15 18 L13 29 L24 13 L17 13 Z" ${F}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M3 16 Q16 6 29 16 Q16 26 3 16 Z" ${S}/><circle cx="16" cy="16" r="3.5" ${F}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M16 16 Q16 12 20 12 Q24 12 24 16 Q24 22 18 22 Q10 22 10 14 Q10 4 22 4 Q30 4 30 14" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M3 18 Q8 10 13 18 Q18 26 23 18 Q26 13 29 18" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M16 4 L7 18 L11 18 L5 27 L27 27 L21 18 L25 18 Z" ${S}/><path d="M14 27 L14 30 L18 30 L18 27" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M11 4 L11 14 M17 5 L17 14 M11 14 L9 18 L9 25 Q9 28 13 28 L19 28 Q23 28 23 25 L23 17 Q23 14 21 14 L13 14" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M6 26 Q6 6 26 6 Q26 26 6 26 Z M6 26 L26 6" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M16 3 L16 22 M16 6 L26 22 L16 22 Z M16 9 L8 22 L16 22 Z M3 24 Q8 28 16 28 Q24 28 29 24" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M3 26 L13 10 L19 19 L23 14 L29 26 Z" ${S}/><path d="M11 13 L13 10 L15 13" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M3 24 L8 24 Q8 17 16 17 Q24 17 24 22 Q24 25 21 25 Q18 25 18 21 Q18 16 23 16 Q29 16 29 22" ${S}/><path d="M3 24 L3 21 L5 21" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M8 12 L16 4 L24 12 L16 28 Z M8 12 L24 12 M16 4 L16 12" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M5 6 L27 6 Q29 6 29 8 L29 20 Q29 22 27 22 L14 22 L8 28 L8 22 L5 22 Q3 22 3 20 L3 8 Q3 6 5 6 Z" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M16 3 Q22 10 22 16 Q22 22 19 22 Q22 18 18 14 Q18 19 14 22 Q10 25 10 19 Q10 13 16 3 Z" ${F}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M16 4 L18 14 L28 16 L18 18 L16 28 L14 18 L4 16 L14 14 Z" ${F}/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M16 5 L16 27 M6 11 L26 21 M6 21 L26 11" ${S}/></svg>`,
      `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="2 3"/></svg>`,
      `<svg viewBox="0 0 32 32"><path d="M16 16 L16 5 Q22 5 22 11 Z M16 16 L27 16 Q27 22 21 22 Z M16 16 L16 27 Q10 27 10 21 Z M16 16 L5 16 Q5 10 11 10 Z" ${S}/></svg>`,
    ];
  }

  const SHADOW_CSS = `
:host{position:relative;display:block;width:100%;height:100%;background:var(--cs-bg,#0A0A0A);color:var(--cs-ink,#E8E4DD);font-family:inherit;overflow:hidden;}
.three{position:absolute;inset:0;z-index:1;cursor:grab;}
.three.is-dragging{cursor:grabbing;}
.dot{transition:transform 320ms cubic-bezier(.22,1,.36,1),filter 320ms cubic-bezier(.22,1,.36,1);transform:scale(1);will-change:transform,opacity;}
.dot svg,.dot img{width:100%;height:100%;display:block;}
.dot img{filter:invert(1);}
.dot.is-pulse{transform:scale(1.7);filter:drop-shadow(0 0 14px rgba(232,228,221,.75)) drop-shadow(0 0 3px rgba(232,228,221,.95));}
.names-overlay{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:56px 24px;pointer-events:none;}
.label{font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--cs-ink,#E8E4DD);opacity:.55;margin-bottom:28px;}
.names{list-style:none;display:flex;flex-direction:column;align-items:center;gap:4px;margin:0;padding:0;pointer-events:auto;}
.names li{font-weight:400;font-size:16px;line-height:1.4;color:var(--cs-ink,#E8E4DD);cursor:default;transition:opacity 280ms cubic-bezier(.22,1,.36,1),transform 280ms cubic-bezier(.22,1,.36,1);}
.names.is-hovered li{opacity:.28;}
.names.is-hovered li:hover,.names.is-hovered li.is-active{opacity:1;transform:translateX(6px);}
`;

  class ConstellationSphere extends HTMLElement {
    constructor() {
      super();
      this._root        = this.attachShadow({ mode: 'open' });
      this._dots        = [];
      this._yaw         = 0;  this._pitch     = 0;
      this._dragYaw     = 0;  this._dragPitch = 0;
      this._isDragging  = false;
      this._isHovered   = false;
      this._hoverPause  = true;   // feature toggle — can be set externally
      this._invQuat     = new THREE.Quaternion();
      this._rafId       = null;
      this._lastT       = 0;
    }

    get hoverPause() { return this._hoverPause; }
    set hoverPause(val) {
      this._hoverPause = !!val;
      if (!this._hoverPause) this._isHovered = false; // clear stale state
    }

    static get observedAttributes() { return ['names']; }
    get names() { return this._names ? [...this._names] : []; }

    pulse(index) {
      this._dots.forEach(d => d.el.classList.remove('is-pulse'));
      if (index == null) return;
      const idx = this._nameIconIdx?.[index];
      if (idx != null && this._dots[idx]) this._dots[idx].el.classList.add('is-pulse');
    }

    connectedCallback() {
      this._build();
      this._rafId = requestAnimationFrame(t => { this._lastT = t; this._tick(t); });
      window.addEventListener('resize', this._onResize = () => this._resize());
      // pointerenter/pointerleave on the host element is the most reliable hover detection.
      // Unlike pointermove+getBoundingClientRect, it fires immediately on entry/exit without
      // requiring cursor movement. Moving between shadow DOM children (.three ↔ .names) does
      // NOT trigger these events since the cursor stays within the host's bounds.
      this._onPointerEnter = () => { this._isHovered = true; };
      this._onPointerLeave = () => { this._isHovered = false; };
      this.addEventListener('pointerenter', this._onPointerEnter);
      this.addEventListener('pointerleave', this._onPointerLeave);
    }

    disconnectedCallback() {
      cancelAnimationFrame(this._rafId);
      window.removeEventListener('resize', this._onResize);
      this.removeEventListener('pointerenter', this._onPointerEnter);
      this.removeEventListener('pointerleave', this._onPointerLeave);
      this._isHovered = false;
    }

    _build() {
      const COUNT  = Number(this.getAttribute('count'))        || 56;
      const RADIUS = Number(this.getAttribute('radius'))       || 320;
      const SPEED  = Number(this.getAttribute('rotate-speed')) || 0.30;
      const INK    = this.getAttribute('ink')   || '#E8E4DD';
      const BG     = this.getAttribute('bg')    || '#0A0A0A';
      const LABEL  = this.getAttribute('label') || 'The Collective';
      const namesAttr = this.getAttribute('names');
      const ornAttr   = this.getAttribute('ornaments');

      this._names = namesAttr
        ? namesAttr.split(',').map(s => s.trim()).filter(Boolean)
        : [...DEFAULT_NAMES];
      const ORNAMENTS = ornAttr
        ? ornAttr.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const MARKS = buildMarks(INK);

      this._rotateSpeed = SPEED;
      this._radius      = RADIUS;
      this._dots        = [];

      this._root.innerHTML = `<style>${SHADOW_CSS}</style>
        <div class="three" part="three"></div>
        <div class="names-overlay">
          <span class="label" part="label">${LABEL}</span>
          <ul class="names"></ul>
        </div>`;

      this.style.setProperty('--cs-ink', INK);
      this.style.setProperty('--cs-bg',  BG);

      const container = this._container = this._root.querySelector('.three');
      const ul = this._root.querySelector('.names');

      this._names.forEach((n, i) => {
        const li = document.createElement('li');
        li.textContent = n;
        li.dataset.index = i;
        ul.appendChild(li);
      });

      const W = this.clientWidth  || window.innerWidth;
      const H = this.clientHeight || window.innerHeight;

      this._scene  = new THREE.Scene();
      this._camera = new THREE.PerspectiveCamera(55, W / H, 1, 3000);
      this._camera.position.z = 880;

      this._renderer = new CSS3DRenderer();
      this._renderer.setSize(W, H);
      Object.assign(this._renderer.domElement.style, { position:'absolute', top:'0', left:'0' });
      container.appendChild(this._renderer.domElement);

      this._nameIconIdx = this._names.map((_, i) =>
        Math.floor(i * (COUNT / this._names.length)) + 3
      );

      for (let i = 0; i < COUNT; i++) {
        const phi   = Math.acos(1 - 2 * (i + 0.5) / COUNT);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = RADIUS + (Math.random() - 0.5) * 40;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        const el = document.createElement('div');
        el.className = 'dot';

        const useOrn = ORNAMENTS.length > 0 && (i % 6 === 0);
        if (useOrn) {
          const img = document.createElement('img');
          img.src = ORNAMENTS[i % ORNAMENTS.length];
          img.draggable = false;
          el.appendChild(img);
        } else {
          el.innerHTML = MARKS[i % MARKS.length];
        }

        const sz = (useOrn ? 28 : 20) + Math.random() * 14;
        el.style.width = el.style.height = sz + 'px';

        const obj = new CSS3DObject(el);
        obj.position.set(x, y, z);
        this._scene.add(obj);
        this._dots.push({ obj, el });
      }

      // Drag
      container.addEventListener('pointerdown', e => {
        this._isDragging = true;
        this._dragStart  = { x: e.clientX, y: e.clientY };
        this._dragYawStart   = this._dragYaw;
        this._dragPitchStart = this._dragPitch;
        container.classList.add('is-dragging');
        container.setPointerCapture(e.pointerId);
      });
      container.addEventListener('pointermove', e => {
        if (!this._isDragging) return;
        this._dragYaw   = this._dragYawStart   + (e.clientX - this._dragStart.x) * 0.005;
        this._dragPitch = this._dragPitchStart + (e.clientY - this._dragStart.y) * 0.005;
      });
      const endDrag = () => {
        if (!this._isDragging) return;
        this._isDragging = false;
        this._yaw   += this._dragYaw;   this._dragYaw   = 0;
        this._pitch += this._dragPitch; this._dragPitch = 0;
        container.classList.remove('is-dragging');
      };
      container.addEventListener('pointerup',     endDrag);
      container.addEventListener('pointercancel', endDrag);

      // Name list hover: dim others, pulse mapped icon, pause sphere.
      // _isHovered is driven by pointerenter/leave on the host (connectedCallback).
      // We also force _isHovered = true here so the sphere always pauses while a name
      // is hovered — regardless of whether the host's pointerenter fired yet.
      const items = [...ul.querySelectorAll('li')];
      items.forEach((li, i) => {
        li.addEventListener('mouseenter', () => {
          this._isHovered = true;   // guarantee pause while hovering a name
          ul.classList.add('is-hovered');
          items.forEach(x => x.classList.remove('is-active'));
          li.classList.add('is-active');
          this.pulse(i);
        });
      });
      ul.addEventListener('mouseleave', () => {
        ul.classList.remove('is-hovered');
        items.forEach(x => x.classList.remove('is-active'));
        this.pulse(null);
        // Don't reset _isHovered here — cursor may still be over the sphere area.
        // pointerleave on the host handles that when cursor fully exits the component.
      });
    }

    _tick(t) {
      const dt = Math.min(64, t - this._lastT) / 1000;
      this._lastT = t;
      if (!this._isDragging && !(this._isHovered && this._hoverPause)) {
        this._yaw   += dt * this._rotateSpeed;
        this._pitch += Math.sin(t * 0.00018) * dt * 0.05;
      }
      this._scene.rotation.y = this._yaw   + this._dragYaw;
      this._scene.rotation.x = this._pitch + this._dragPitch;

      this._invQuat.copy(this._scene.quaternion).invert();
      const m = this._scene.matrixWorld;
      const R = this._radius;
      this._dots.forEach(({ obj, el }) => {
        obj.quaternion.copy(this._invQuat);
        const wp   = obj.position.clone().applyMatrix4(m);
        const norm = (wp.z + R) / (2 * R);
        // Pulsed icon always shows at full opacity so the glow is visible regardless
        // of where it sits on the sphere. Depth-based fade applies to all others.
        el.style.opacity = el.classList.contains('is-pulse') ? '1' : (0.40 + 0.60 * norm).toFixed(3);
      });

      this._renderer.render(this._scene, this._camera);
      this._rafId = requestAnimationFrame(t => this._tick(t));
    }

    _resize() {
      const W = this.clientWidth  || window.innerWidth;
      const H = this.clientHeight || window.innerHeight;
      this._camera.aspect = W / H;
      this._camera.updateProjectionMatrix();
      this._renderer.setSize(W, H);
    }
  }

  customElements.define('constellation-sphere', ConstellationSphere);
  window.ConstellationSphere = ConstellationSphere;

})();
