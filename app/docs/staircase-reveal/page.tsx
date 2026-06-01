import { getComponent } from "@/lib/registry";
import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import path from "path";
import PreviewTabs from "@/components/PreviewTabs";
import PropsTable from "@/components/PropsTable";
import type { PropGroup } from "@/components/PropsTable";
import styles from "./page.module.css";

const propGroups: PropGroup[] = [
  {
    label: "Constructor options",
    props: [
      { name: "bandCount",  default: "11",    notes: "Number of bands. More = finer staircase diagonal." },
      { name: "coverColor", default: "#F4F2EC", notes: "Cover background color." },
      { name: "staggerMs",  default: "68",    notes: "ms added per band — controls the staircase angle." },
      { name: "bandDur",    default: "760",   notes: "Individual band slide duration (ms)." },
      { name: "ease",       default: "cubic-bezier(0.76,0,0.18,1)", notes: "CSS easing for the band transition." },
      { name: "axis",       default: "'y'",   notes: "'y' = vertical bands / left-right slide. 'x' = horizontal bands / up-down slide." },
      { name: "zIndex",     default: "9999",  notes: "Cover layer z-index." },
      { name: "mount",      notes: "Existing DOM element to reuse as the cover (otherwise auto-appended to body)." },
      { name: "onRevealed", notes: "Callback fired when all bands have exited." },
    ],
  },
  {
    label: "Methods",
    props: [
      { name: "play(dir?)",   notes: "Play the reveal. Direction is random unless dir is passed: { side: 'go-left'|'go-right'|'go-up'|'go-down', order: 'top'|'bottom' }." },
      { name: "replay(dir?)", notes: "Re-cover and play again. Safe to call repeatedly." },
    ],
  },
];

export default function StaircaseRevealPage() {
  const meta = getComponent("staircase-reveal");
  if (!meta) notFound();

  const codePath = path.join(process.cwd(), "public", "staircase-reveal.js");
  let sourceCode = "";
  try {
    sourceCode = readFileSync(codePath, "utf-8");
  } catch {
    sourceCode = "// Source not found. Make sure staircase-reveal.js is in /public";
  }

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.category}>{meta.category}</span>
          <div className={styles.tags}>
            {meta.tags.map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        </div>
        <h1 className={styles.title}>{meta.name}</h1>
        <p className={styles.desc}>{meta.description}</p>
      </header>

      <section className={styles.section}>
        <PreviewTabs
          previewSrc="/previews/staircase-reveal.html"
          code={sourceCode}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Installation</h2>
        <div className={styles.installSteps}>
          <div className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <div>
              <div className={styles.stepLabel}>Include the script</div>
              <pre className={styles.snippet}>{`<script src="staircase-reveal.js"></script>
// or
import "staircase-reveal.js"`}</pre>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <div>
              <div className={styles.stepLabel}>Instantiate and play</div>
              <pre className={styles.snippet}>{`const reveal = new StaircaseReveal({
  bandCount:  11,
  coverColor: '#F9FF7D',
  onRevealed() { /* trigger hero intro */ }
});

reveal.play(); // random direction each time`}</pre>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <div>
              <div className={styles.stepLabel}>Replay on page transitions</div>
              <pre className={styles.snippet}>{`// On any navigation / route change:
reveal.replay();

// Driven by scroll direction (axis: 'x'):
const reveal = new StaircaseReveal({ axis: 'x' });
window.addEventListener('wheel', (e) => {
  reveal.replay({
    side:  e.deltaY > 0 ? 'go-down' : 'go-up',
    order: e.deltaY > 0 ? 'top'     : 'bottom'
  });
}, { once: true });`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>API Reference</h2>
        <PropsTable groups={propGroups} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Browser Support</h2>
        <p className={styles.prose}>
          Pure DOM + CSS transitions. Works everywhere CSS transitions work — Chrome 49+, Edge 17+, Safari 10+, Firefox 44+, all modern mobile browsers.
        </p>
      </section>
    </article>
  );
}
