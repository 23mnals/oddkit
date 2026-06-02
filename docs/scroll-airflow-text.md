# ScrollAirflowText

Scroll-driven text push component. A fixed icon sits at the viewport centre; text rows approaching it get pushed sideways — labels left, values right — by an invisible "airflow". Rows return to rest once the icon passes. The icon cycles automatically as you scroll.

**Vanilla JS · Scroll-driven · Zero dependencies**

---

## Quick start

```html
<script src="scroll-airflow-text.js"></script>

<!-- Fixed icon container -->
<div id="icon-stage" style="position:fixed;top:50%;left:50%;
     transform:translate(-50%,-50%);width:72px;height:72px;
     pointer-events:none;z-index:10">
  <div id="icon-slot" style="position:absolute;inset:0"></div>
</div>

<!-- Any element with data-push will be moved -->
<div class="row">
  <span class="label" data-push>Location</span>
  <span class="value" data-push>San Francisco</span>
</div>

<script>
new ScrollAirflowText({
  iconEl:    document.querySelector('#icon-slot'),
  icons:     ['icon-a.svg', 'icon-b.svg'],
  cells:     '[data-push]',
  sideOf:    el => el.classList.contains('label') ? -1 : 1,
  maxPush:   280,
  falloffY:  320,
  iconRadius:90,
  ambient:   0,
  swapThresholdPx: 300,
});
</script>
```

---

## API

### Constructor options

| Option | Default | Notes |
|--------|---------|-------|
| `iconEl` | — | **Required.** Fixed container element. Two crossfade `<img>` layers are inserted inside it. |
| `icons` | `[]` | Array of image URLs. Cycles automatically as you scroll. |
| `cells` | `'[data-push]'` | CSS selector, Element, NodeList, or Element array. These are the elements that get pushed. |
| `sideOf` | — | `(el) => -1 \| +1` — push direction override. Default: auto by element centre vs viewport centre. |
| `iconRadius` | `110` | Clearance radius around icon (px). Text is pushed at least this far out. |
| `maxPush` | `380` | Maximum horizontal displacement (px). |
| `falloffY` | `360` | Vertical decay distance (px). No push beyond this distance from icon. |
| `ambient` | `0` | Minimum push baseline in the influence zone. `0` = only push when text would actually overlap the icon. Increase for a "breezy" feel where nearby rows always feel the wind. |
| `swapThresholdPx` | `300` | Cumulative scroll (px) that triggers an icon switch. |
| `swapCooldownMs` | `700` | Minimum ms between icon switches — prevents rapid flicker on fast scroll. |

### Instance methods

| Method | Notes |
|--------|-------|
| `.refresh()` | Re-measure all cells' rest positions. Call after font load or layout changes. |
| `.update()` | Force a single push recalculation. Normally not needed. |
| `.swap()` | Immediately advance to the next icon. |
| `.destroy()` | Remove all listeners and clear transforms from cells. |

---

## Parameter guide

**`maxPush`** — how far the text flies when the icon is right on top of it. High value = dramatic separation. Too high and text flies off-screen.

**`falloffY`** — the vertical "zone of influence". Rows outside this distance get zero push. Smaller = tighter effect (only rows very close to icon move). Larger = more rows affected simultaneously.

**`iconRadius`** — a clearance bubble around the icon. Text is pushed until its nearest edge is at least `iconRadius` px away from the icon centre. Larger = more breathing room around the icon.

**`ambient`** — baseline push applied to any row inside `falloffY`, even if it doesn't geometrically overlap the icon. `0` = pure physical push (default, cleanest). Values > 0 give rows a subtle "felt the wind" displacement even before they'd overlap.

**`swapThresholdPx`** — how much scroll before the icon swaps. Lower = faster cycling. Higher = slower, more deliberate.

---

## Source

[`public/scroll-airflow-text.js`](../public/scroll-airflow-text.js)
