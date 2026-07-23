import Link from "next/link";

export default function NotFound() {
  return <main className="center"><div className="empty"><p className="eyebrow">404 · LOST SIGNAL</p><h1>This page drifted out of range.</h1><p>Return to the StreamForge collection and find another story.</p><Link className="button" href="/">Go home</Link></div></main>;
}
