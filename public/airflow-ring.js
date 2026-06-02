// vision-ring-anim.js
// Mouse-driven airflow on a 24-card ring.
// Public surface (read by the tweaks panel):
//   window.AnimConfig          — live parameters; written by App
//   window.rebuildCards(opts)  — rebuilds the ring when count/size/radius change
//   window.PHOTO_IDS           — stable Picsum IDs

(function () {
  const ring = document.getElementById('ring');
  const glow = document.getElementById('cursorGlow');
  const dot  = document.getElementById('cursorDot');

  // Curated Picsum image IDs (Unsplash-backed CDN, stable).
  // Moody, textural; works on a paper-toned background.
  const PHOTO_IDS = [
    1015, 1025, 1035, 1041, 1043, 1050, 1059, 1062,
    1074, 1080, 110,  119,  129,  136,  145,  158,
    164,  175,  180,  201,  211,  225,  235,  250,
    260,  274,  287,  292,  306,  314,  325,  337
  ];
  window.PHOTO_IDS = PHOTO_IDS;

  // Live config — defaults; overwritten by App once mounted.
  window.AnimConfig = window.AnimConfig || {
    windMode:    'push',     // push | pull | vortex | calm
    flipAxis:    'y',        // y | x | tumble
    flipMax:     180,
    influence:   240,
    pushMax:     95,
    followSpeed: 0.13,
    cursorGlow:  true,
  };

  const SIZE_PRESETS = {
    s: [44, 60],
    m: [54, 72],
    l: [66, 88],
  };

  let cards = [];

  function rebuildCards({ count = 24, sizeKey = 'm', radius = 250 } = {}) {
    ring.innerHTML = '';
    cards = [];
    const [w, h] = SIZE_PRESETS[sizeKey] || SIZE_PRESETS.m;

    for (let i = 0; i < count; i++) {
      const angle    = (i / count) * Math.PI * 2 - Math.PI / 2;
      const angleDeg = angle * 180 / Math.PI;
      // Card "top" points radially outward
      const tangentDeg = angleDeg + 90;

      const bx = Math.cos(angle) * radius;
      const by = Math.sin(angle) * radius;

      const baseTilt = (Math.random() - 0.5) * 6; // ±3°
      const photoId  = PHOTO_IDS[i % PHOTO_IDS.length];

      const el = document.createElement('div');
      el.className = 'card';
      el.style.width  = w + 'px';
      el.style.height = h + 'px';
      el.style.marginLeft = (-w / 2) + 'px';
      el.style.marginTop  = (-h / 2) + 'px';

      const front = document.createElement('div');
      front.className = 'face front';
      const fImg = document.createElement('img');
      fImg.src = `https://picsum.photos/id/${photoId}/200/280`;
      fImg.alt = '';
      fImg.loading = 'eager';
      front.appendChild(fImg);

      const back = document.createElement('div');
      back.className = 'face back';
      const bImg = document.createElement('img');
      bImg.src = `https://picsum.photos/id/${photoId}/200/280`;
      bImg.alt = '';
      bImg.loading = 'eager';
      back.appendChild(bImg);

      el.appendChild(front);
      el.appendChild(back);
      ring.appendChild(el);

      cards.push({
        el,
        bx, by, tangentDeg, baseTilt,
        // current rendered
        px: 0, py: 0, ryY: 0, rxX: 0, rzZ: 0,
        // targets
        tpx: 0, tpy: 0, tryY: 0, trxX: 0, trzZ: 0,
      });
    }
  }
  window.rebuildCards = rebuildCards;

  // initial build
  rebuildCards({ count: 24, sizeKey: 'm', radius: 250 });

  // ---- Mouse tracking -------------------------------------------------------
  let mx = -99999, my = -99999;   // mouse coords relative to viewport center
  let inside = false;

  function setMouse(e) {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    mx = e.clientX - cx;
    my = e.clientY - cy;
    inside = true;
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
    dot.style.left  = e.clientX + 'px';
    dot.style.top   = e.clientY + 'px';
    glow.style.opacity = '1';
    dot.style.opacity  = '1';
  }
  window.addEventListener('pointermove', setMouse);
  window.addEventListener('pointerdown', setMouse);
  window.addEventListener('pointerleave', () => {
    inside = false;
    glow.style.opacity = '0';
    dot.style.opacity  = '0';
  });
  document.addEventListener('mouseleave', () => {
    inside = false;
    glow.style.opacity = '0';
    dot.style.opacity  = '0';
  });

  // ---- Physics --------------------------------------------------------------
  function smoothstep(x) {
    x = Math.max(0, Math.min(1, x));
    return x * x * (3 - 2 * x);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    const cfg = window.AnimConfig;
    const PUSH_MAX  = cfg.pushMax     ?? 95;
    const INFLUENCE = cfg.influence   ?? 240;
    const ROT_MAX   = cfg.flipMax     ?? 180;
    const FOLLOW    = cfg.followSpeed ?? 0.13;
    const MODE      = cfg.windMode    ?? 'push';
    const AXIS      = cfg.flipAxis    ?? 'y';

    for (const c of cards) {
      const dx = c.bx - mx;
      const dy = c.by - my;
      const dist = Math.hypot(dx, dy);

      let strength = 0;
      if (inside && dist < INFLUENCE) {
        strength = smoothstep(1 - dist / INFLUENCE);
      }

      // direction away from cursor
      const nx = dist > 0.001 ? dx / dist : 0;
      const ny = dist > 0.001 ? dy / dist : 0;

      // ---- Push direction by mode ------------------------------------------
      let dirX = nx, dirY = ny;
      if (MODE === 'pull')   { dirX = -nx; dirY = -ny; }            // suck in
      if (MODE === 'vortex') { dirX = -ny; dirY =  nx; }            // tangential CCW
      if (MODE === 'calm')   { dirX =  0;  dirY =  0; }             // no translation

      c.tpx = dirX * strength * PUSH_MAX;
      c.tpy = dirY * strength * PUSH_MAX;

      // ---- Rotation per axis mode ------------------------------------------
      // Reset targets, then set whichever axis is active.
      c.tryY = 0; c.trxX = 0; c.trzZ = 0;
      if (AXIS === 'y') {
        // signed by horizontal side of cursor → wind from left/right
        c.tryY = nx * strength * ROT_MAX;
      } else if (AXIS === 'x') {
        // signed by vertical side of cursor → wind from above/below
        c.trxX = -ny * strength * ROT_MAX;
      } else if (AXIS === 'tumble') {
        // perpendicular to push, in plane (spin around Z) — cards flutter in 2D
        c.trzZ = (nx + ny) * strength * ROT_MAX * 0.5;
      }

      // ---- Lerp -----------------------------------------------------------
      c.px  = lerp(c.px,  c.tpx,  FOLLOW);
      c.py  = lerp(c.py,  c.tpy,  FOLLOW);
      c.ryY = lerp(c.ryY, c.tryY, FOLLOW);
      c.rxX = lerp(c.rxX, c.trxX, FOLLOW);
      c.rzZ = lerp(c.rzZ, c.trzZ, FOLLOW);

      const mag = Math.hypot(c.px, c.py);
      const liftZ = (mag / Math.max(1, PUSH_MAX)) * 30;

      const tx = c.bx + c.px;
      const ty = c.by + c.py;

      c.el.style.transform =
        `translate3d(${tx}px, ${ty}px, ${liftZ}px)` +
        ` rotate(${(c.tangentDeg + c.baseTilt + c.rzZ).toFixed(2)}deg)` +
        ` rotateY(${c.ryY.toFixed(2)}deg)` +
        ` rotateX(${c.rxX.toFixed(2)}deg)`;
    }
    requestAnimationFrame(tick);
  }
  tick();
})();
