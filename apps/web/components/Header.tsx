"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const links = [["/browse", "Browse"], ["/watchlist", "My list"], ["/profiles", "Profiles"], ["/plans", "Plans"]];

export default function Header({ admin = false }: { admin?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  return <header className="header">
    <Link className="brand" href="/browse"><span>SF</span> StreamForge</Link>
    <nav aria-label="Primary">{links.map(([href, label]) => <Link key={href} className={path === href ? "active" : ""} href={href}>{label}</Link>)}{admin && <Link href="/admin">Admin</Link>}</nav>
    <button className="ghost small" onClick={async () => { await api("/auth/sign-out", { method: "POST" }); router.push("/"); }}>Sign out</button>
  </header>;
}
