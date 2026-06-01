import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "oddkit",
  description: "A personal collection of animation components — ready to drop into any project.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className={styles.shell}>
          <Sidebar />
          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}
