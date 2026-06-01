"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { components, categories } from "@/lib/registry";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>⬡</span>
        <span className={styles.brandName}>oddkit</span>
      </div>

      <nav className={styles.nav}>
        {categories.map((cat) => (
          <div key={cat} className={styles.group}>
            <div className={styles.groupLabel}>{cat}</div>
            {components
              .filter((c) => c.category === cat)
              .map((c) => {
                const active = pathname === `/docs/${c.slug}`;
                return (
                  <Link
                    key={c.slug}
                    href={`/docs/${c.slug}`}
                    className={`${styles.item} ${active ? styles.active : ""}`}
                  >
                    {c.name}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <span className={styles.version}>v0.1.0</span>
      </div>
    </aside>
  );
}
