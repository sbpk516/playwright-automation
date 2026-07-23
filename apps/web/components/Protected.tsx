"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import { api } from "@/lib/api";

export default function Protected({ children, role }: { children: React.ReactNode; role?: "admin" }) {
  const [user, setUser] = useState<{ role: string } | null>(null);
  const router = useRouter();
  const path = usePathname();
  useEffect(() => { api<{ role: string }>("/auth/session").then(value => role && value.role !== role ? router.replace("/browse") : setUser(value)).catch(() => router.replace(`/sign-in?returnTo=${encodeURIComponent(path)}`)); }, [path, role, router]);
  if (!user) return <main className="center"><div className="loader" aria-label="Loading" /></main>;
  return <><Header admin={user.role === "admin"} />{children}</>;
}
