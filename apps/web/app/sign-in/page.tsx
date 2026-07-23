"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

function SignInContent() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try { const user = await api<{ role: string }>("/auth/sign-in", { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) }); router.push(params.get("returnTo") || (user.role === "admin" ? "/admin" : "/browse")); }
    catch (reason) { setError((reason as Error).message); setBusy(false); }
  }
  return <main className="auth-page"><Link className="brand auth-brand" href="/"><span>SF</span> StreamForge</Link><section className="auth-card"><p className="eyebrow">WELCOME BACK</p><h1>Sign in to your stories.</h1><p className="muted">Use a seeded demo account to enter StreamForge.</p><form onSubmit={submit}><label>Email<input name="email" type="email" defaultValue="river@streamforge.test" required /></label><label>Password<input name="password" type="password" defaultValue="stream123" required /></label>{error && <p className="error" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><div className="demo-note"><b>Subscriber</b> river@streamforge.test / stream123<br /><b>Admin</b> admin@streamforge.test / admin123</div></section></main>;
}

export default function SignIn() { return <Suspense fallback={<main className="center"><div className="loader" /></main>}><SignInContent /></Suspense>; }
