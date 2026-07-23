"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { api, Title } from "@/lib/api";

export default function Details() {
  const { id } = useParams<{ id: string }>(); const [title, setTitle] = useState<Title | null>(null); const [error, setError] = useState("");
  useEffect(() => { api<Title>(`/titles/${id}`).then(setTitle).catch(reason => setError(reason.message)); }, [id]);
  async function toggle() { if (!title) return; await api(`/watchlist/${id}`, { method: title.in_watchlist ? "DELETE" : "PUT" }); setTitle({ ...title, in_watchlist: !title.in_watchlist }); }
  return <Protected><main className="detail-page">{error ? <div className="empty"><p className="eyebrow">404 · LOST SIGNAL</p><h1>That story isn&apos;t here.</h1><p>{error}</p><Link className="button" href="/browse">Back to browse</Link></div> : !title ? <div className="loader" /> : <><div className={`detail-art tier-${title.tier}`}><span>STREAMFORGE ORIGINAL</span><strong>{title.name}</strong></div><section className="detail-copy"><p className="eyebrow">{title.type} · {["", "SPARK", "FLARE", "NOVA"][title.tier]} PLAN</p><h1>{title.name}</h1><p className="metadata">{title.release_year} · {title.media_meta} · {title.maturity_rating}+ · {title.genres.join(" / ")}</p><p className="synopsis">{title.synopsis}</p><div className="hero-actions">{title.available && <Link className="button" href={`/player/${title.id}`}>▶ Play now</Link>}<button className="ghost" onClick={toggle}>{title.in_watchlist ? "✓ In my list" : "+ Add to my list"}</button></div>{!title.available && <p className="notice">Currently unavailable</p>}</section></>}</main></Protected>;
}
