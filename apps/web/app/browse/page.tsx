"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Protected from "@/components/Protected";
import Poster from "@/components/Poster";
import { api, Title } from "@/lib/api";

export const dynamic = "force-dynamic";

function BrowseContent() {
  const params = useSearchParams(); const router = useRouter();
  const [data, setData] = useState<{ items: Title[]; count: number } | null>(null); const [error, setError] = useState("");
  const load = useCallback(() => { setError(""); api<{ items: Title[]; count: number }>(`/titles?${params.toString()}`).then(setData).catch(reason => setError(reason.message)); }, [params]);
  useEffect(load, [load]);
  function update(name: string, value: string) { const next = new URLSearchParams(params); value ? next.set(name, value) : next.delete(name); router.push(`/browse?${next}`); }
  async function toggle(title: Title) { await api(`/watchlist/${title.id}`, { method: title.in_watchlist ? "DELETE" : "PUT" }); load(); }
  return <Protected><main className="app-main"><section className="browse-hero"><p className="eyebrow">CURATED FOR THE CURIOUS</p><h1>Find your next<br /><em>obsession.</em></h1><p>Strange worlds. Human stories. Zero algorithms pretending to know you.</p></section><section className="catalog"><div className="catalog-head"><div><p className="eyebrow">THE COLLECTION</p><h2>All stories</h2></div><span>{data?.count ?? 0} titles</span></div><div className="filters"><label className="search"><span>Search</span><input value={params.get("search") || ""} onChange={event => update("search", event.target.value)} placeholder="Title or keyword" /></label><label>Genre<select value={params.get("genre") || ""} onChange={event => update("genre", event.target.value)}><option value="">All genres</option>{["Drama", "Sci-Fi", "Thriller", "Comedy", "Documentary", "Adventure"].map(x => <option key={x}>{x}</option>)}</select></label><label>Type<select value={params.get("type") || ""} onChange={event => update("type", event.target.value)}><option value="">All types</option><option value="movie">Movies</option><option value="series">Series</option></select></label><label>Availability<select value={params.get("availability") || ""} onChange={event => update("availability", event.target.value)}><option value="">Any</option><option value="available">Available</option><option value="unavailable">Unavailable</option></select></label><label>Tier<select value={params.get("tier") || ""} onChange={event => update("tier", event.target.value)}><option value="">Any tier</option><option value="1">Spark</option><option value="2">Flare</option><option value="3">Nova</option></select></label><label>Sort<select value={params.get("sort") || "recent"} onChange={event => update("sort", event.target.value)}><option value="recent">Recently added</option><option value="title">Title</option><option value="year">Release year</option></select></label></div>{error ? <div className="empty"><h3>We lost the signal.</h3><p>{error}</p><button className="button" onClick={load}>Retry</button></div> : !data ? <div className="loader" /> : data.items.length ? <div className="poster-grid">{data.items.map(title => <Poster key={title.id} title={title} action={<button className="icon-button" aria-label={title.in_watchlist ? `Remove ${title.name} from watchlist` : `Add ${title.name} to watchlist`} onClick={() => toggle(title)}>{title.in_watchlist ? "✓" : "+"}</button>} />)}</div> : <div className="empty"><h3>No stories found.</h3><p>Try a different search or clear your filters.</p><button className="ghost" onClick={() => router.push("/browse")}>Clear filters</button></div>}</section></main></Protected>;
}

export default function Browse() { return <Suspense fallback={<main className="center"><div className="loader" /></main>}><BrowseContent /></Suspense>; }
