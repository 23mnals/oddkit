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
    label: "Content",
    props: [
      { name: "text", default: '""', notes: 'Words separated by |. Each piece becomes one cube. A trailing period is stripped.' },
    ],
  },
  {
    label: "Colors",
    props: [
      { name: "bg",    default: "#EFEAE3", notes: "Background of the entire component." },
      { name: "block", default: "#FFFFFF", notes: "White highlight block behind each word." },
      { name: "ink",   default: "#0A0A0A", notes: "Text color." },
    ],
  },
  {
    label: "Typography",
    props: [
      { name: "font",     default: '"Times New Roman", serif', notes: "Font-family stack. The font must be loaded by the host page." },
      { name: "font-min", default: "34px",  notes: "clamp() lower bound." },
      { name: "font-vw",  default: "4.4vw", notes: "clamp() preferred value. Stay ≤ ~4.5vw for 9-word stacks." },
      { name: "font-max", default: "76px",  notes: "clamp() upper bound." },
    ],
  },
  {
    label: "Animation",
    props: [
      { name: "intro-stagger", default: "110",  notes: "ms between each cube's intro flip on page load." },
      { name: "push-max-x",   default: "70",   notes: "Max horizontal nudge an ornament receives when a nearby word flips." },
      { name: "push-max-y",   default: "14",   notes: "Max vertical nudge." },
      { name: "push-falloff", default: "280",  notes: "Distance (px) beyond which an ornament is not affected." },
      { name: "push-hold",    default: "3000", notes: "ms the ornament stays in pushed position before returning." },
    ],
  },
  {
    label: "Icon children (data-* attrs on <img>)",
    props: [
      { name: "data-anchor",   notes: "top-left | top-right | bottom-left | bottom-right. Which corner the icon anchors to." },
      { name: "data-offset",   notes: "px — horizontal distance from the page's center axis." },
      { name: "data-size",     notes: "px — icon edge length (square)." },
      { name: "data-vertical", notes: "px or % — distance from the top or bottom edge depending on anchor." },
    ],
  },
];

export default function CubeWordStackPage() {
  const meta = getComponent("cube-word-stack");
  if (!meta) notFound();

  // Read the raw JS source at build/request time so it's available for the Code tab
  const codePath = path.join(process.cwd(), "public", "cube-word-stack.js");
  let sourceCode = "";
  try {
    sourceCode = readFileSync(codePath, "utf-8");
  } catch {
    sourceCode = "// Source not found. Make sure cube-word-stack.js is in /public";
  }

  return (
    <article className={styles.page}>
      {/* Header */}
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

      {/* Preview + Code */}
      <section className={styles.section}>
        <PreviewTabs
          previewSrc="/previews/cube-word-stack.html"
          code={sourceCode}
        />
      </section>

      {/* Installation */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Installation</h2>
        <p className={styles.prose}>
          Zero dependencies — vanilla JS + Shadow DOM. Works in any project.
        </p>
        <div className={styles.installSteps}>
          <div className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <div>
              <div className={styles.stepLabel}>Load a font in your host page</div>
              <pre className={styles.snippet}>{`<style>
  @font-face {
    font-family: "Your Font";
    src: url("/fonts/YourFont.otf") format("opentype");
  }
</style>`}</pre>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <div>
              <div className={styles.stepLabel}>Include the component script</div>
              <pre className={styles.snippet}>{`<script src="cube-word-stack.js"></script>
// or
import "cube-word-stack.js"`}</pre>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <div>
              <div className={styles.stepLabel}>Drop the element in</div>
              <pre className={styles.snippet}>{`<cube-word-stack
  text="A|collective|of|Odd Minds|brings|new|angles|with|meaning"
  bg="#EFEAE3" block="#FFFFFF" ink="#0A0A0A"
  font='"Your Font", serif'>

  <img data-anchor="top-right"   data-offset="40"  data-size="86" data-vertical="6%"  src="/icon-1.svg" alt="">
  <img data-anchor="top-left"    data-offset="30"  data-size="96" data-vertical="22%" src="/icon-2.svg" alt="">
  <img data-anchor="bottom-left" data-offset="150" data-size="76" data-vertical="26%" src="/icon-3.svg" alt="">
  <img data-anchor="bottom-right"data-offset="80"  data-size="80" data-vertical="14%" src="/icon-4.svg" alt="">
</cube-word-stack>`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Props */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>API Reference</h2>
        <PropsTable groups={propGroups} />
      </section>

      {/* Browser support */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Browser Support</h2>
        <p className={styles.prose}>
          All modern Chromium (Chrome, Edge, Brave, Arc), Safari 13+, Firefox 63+.
          Uses standard Web Components APIs — no transpilation needed.
        </p>
      </section>
    </article>
  );
}
