"use client";

import { useState } from "react";
import styles from "./PreviewTabs.module.css";

type Tab = "preview" | "code";

type Props = {
  previewSrc: string; // URL to standalone preview HTML
  code: string;       // Raw source code string
};

export default function PreviewTabs({ previewSrc, code }: Props) {
  const [tab, setTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.root}>
      {/* Tab bar */}
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
            onClick={() => setTab("preview")}
          >
            Preview
          </button>
          <button
            className={`${styles.tab} ${tab === "code" ? styles.tabActive : ""}`}
            onClick={() => setTab("code")}
          >
            Code
          </button>
        </div>

        {tab === "code" && (
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={styles.panel}>
        {tab === "preview" ? (
          <iframe
            src={previewSrc}
            className={styles.iframe}
            title="Component preview"
          />
        ) : (
          <pre className={styles.codeBlock}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
