import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreamForge — Stories in motion",
  description: "A fictional streaming experience built for quality engineering.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
