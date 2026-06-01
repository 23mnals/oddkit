/* ============================================================================
 * Staircase Reveal — staircase-reveal.js
 * ----------------------------------------------------------------------------
 * 帘幕就是下一屏本身，颜色永远来自目标页背景，不写死。
 *
 * 最简用法：
 *   const reveal = new StaircaseReveal({ matchTarget: '#section-2' });
 *   reveal.play();       // 自动读 #section-2 的背景色
 *   reveal.replay();     // 换页时重播，颜色再读一次
 *   reveal.replay(null, '#FF9EAA'); // 临时强制颜色，忽略 matchTarget
 * ============================================================================ */

(function (global) {
  'use strict';

  var STYLE_ID = 'staircase-reveal-style';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = [
      '.sr-curtain{position:fixed;inset:0;z-index:9999;display:flex;',
      'flex-direction:column;pointer-events:none;overflow:hidden;}',
      '.sr-curtain.is-blocking{pointer-events:auto;}',
      '.sr-curtain.is-done{display:none;}',
      /* bands — no background in CSS; always set inline so it's bulletproof */
      '.sr-band{flex:1 1 0;width:100%;transform:translate3d(0,0,0);',
      'transition:transform var(--sr-band-dur,760ms) var(--sr-ease,cubic-bezier(0.76,0,0.18,1));',
      'will-change:transform;}',
      '.sr-band.go-left {transform:translate3d(-105%,0,0);}',
      '.sr-band.go-right{transform:translate3d( 105%,0,0);}',
      '.sr-band.go-up   {transform:translate3d(0,-105%,0);}',
      '.sr-band.go-down {transform:translate3d(0, 105%,0);}',
      '.sr-curtain.axis-x{flex-direction:row;}',
      '.sr-curtain.axis-x .sr-band{width:auto;height:100%;flex:1 1 0;}',
    ].join('');
    document.head.appendChild(el);
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ── Constructor ─────────────────────────────────────────────────────────────
  function StaircaseReveal(opts) {
    opts = opts || {};
    this.bandCount   = opts.bandCount   || 11;
    this.coverColor  = opts.coverColor  || '#F4F2EC';
    this.matchTarget = opts.matchTarget || null;
    this.staggerMs   = opts.staggerMs  != null ? opts.staggerMs : 68;
    this.bandDur     = opts.bandDur    != null ? opts.bandDur   : 760;
    this.ease        = opts.ease       || 'cubic-bezier(0.76,0,0.18,1)';
    this.axis        = opts.axis       || 'y';
    this.zIndex      = opts.zIndex     != null ? opts.zIndex    : 9999;
    this.onRevealed  = opts.onRevealed || null;

    this.sides  = this.axis === 'x' ? ['go-up','go-down'] : ['go-left','go-right'];
    this.orders = ['top','bottom'];

    ensureStyles();

    this.el = opts.mount || document.createElement('div');
    this.el.className = 'sr-curtain is-blocking';
    if (this.axis === 'x') this.el.classList.add('axis-x');
    this.el.setAttribute('aria-hidden', 'true');
    this.el.style.zIndex = this.zIndex;
    this.el.style.setProperty('--sr-band-dur', this.bandDur + 'ms');
    this.el.style.setProperty('--sr-ease', this.ease);
    if (!opts.mount) document.body.appendChild(this.el);

    this._rebuildBands();   // bands are colorless at first
    this._pendingColor = null; // set by replay() when caller passes explicit color
  }

  // ── _rebuildBands ────────────────────────────────────────────────────────────
  // Create (or recreate) N blank band elements inside the curtain.
  // Color is always applied separately, in play(), so it's always fresh.
  StaircaseReveal.prototype._rebuildBands = function () {
    this.el.innerHTML = '';
    this.el.classList.remove('is-done');
    this.el.classList.add('is-blocking');
    for (var i = 0; i < this.bandCount; i++) {
      var b = document.createElement('div');
      b.className = 'sr-band';
      this.el.appendChild(b);
    }
  };

  // ── _resolveColor ────────────────────────────────────────────────────────────
  // Single source of truth for "what color should the bands be right now".
  //   1. If _pendingColor is set (caller passed explicit override to replay()), use it.
  //   2. Else if matchTarget is set, read getComputedStyle().backgroundColor.
  //   3. Else fall back to coverColor.
  StaircaseReveal.prototype._resolveColor = function () {
    // 1. Explicit override from replay(dir, color)
    if (this._pendingColor != null) {
      var c = this._pendingColor;
      this._pendingColor = null; // consume — only used once
      return c;
    }

    // 2. matchTarget
    if (this.matchTarget) {
      var target = typeof this.matchTarget === 'string'
        ? document.querySelector(this.matchTarget)
        : this.matchTarget;

      if (target) {
        var bg = window.getComputedStyle(target).backgroundColor;
        // Chrome returns 'rgba(0, 0, 0, 0)' for transparent; Firefox same.
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          return bg;
        }
      }
    }

    // 3. Fallback
    return this.coverColor;
  };

  // ── play ─────────────────────────────────────────────────────────────────────
  // Slide all bands off screen. Color is resolved HERE — at the moment the
  // animation actually starts — so matchTarget is always in the DOM by this point.
  StaircaseReveal.prototype.play = function (dir) {
    // ① Resolve and paint color right now.
    var color = this._resolveColor();
    var allBands = this.el.querySelectorAll('.sr-band');
    for (var j = 0; j < allBands.length; j++) {
      allBands[j].style.setProperty('background-color', color, 'important');
    }

    // ② Set per-band stagger delays.
    dir = dir || {};
    var side  = dir.side  || pick(this.sides);
    var order = dir.order || pick(this.orders);
    var self  = this;
    var bands = Array.prototype.slice.call(allBands);
    bands.forEach(function (band, i) {
      var step = (order === 'top') ? i : (bands.length - 1 - i);
      band.style.transitionDelay = (step * self.staggerMs) + 'ms';
    });

    // ③ Double-rAF: let browser paint the colored bands BEFORE sliding them.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bands.forEach(function (band) { band.classList.add(side); });
      });
    });

    // ④ After the last band exits, mark done and fire callback.
    var total = (bands.length - 1) * this.staggerMs + this.bandDur + 120;
    setTimeout(function () {
      self.el.classList.remove('is-blocking');
      self.el.classList.add('is-done');
      if (typeof self.onRevealed === 'function') self.onRevealed();
    }, total);

    return this;
  };

  // ── replay ───────────────────────────────────────────────────────────────────
  // Re-cover the screen and play again.
  //   color  (optional) — explicit one-off override; if omitted, matchTarget is used.
  StaircaseReveal.prototype.replay = function (dir, color) {
    // Store explicit override so _resolveColor() picks it up inside play().
    if (color !== undefined) {
      this._pendingColor = color;
    }

    this._rebuildBands(); // fresh DOM, no color yet — play() will paint

    var self = this;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { self.play(dir); });
    });
    return this;
  };

  global.StaircaseReveal = StaircaseReveal;

})(window);
