"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import Poster from "@/components/Poster";
import { api, Title } from "@/lib/api";

export default function Watchlist() {
  const [titles, setTitles] = useState<Title[] | null>(null); const load = () => api<Title[]>("/watchlist").then(setTitles); useEffect(() => { load(); }, []);
  return <Protected><main className="app-main page"><p className="eyebrow">SAVED FOR LATER</p><h1>My list.</h1><p className="muted">The stories you don&apos;t want to lose.</p>{titles?.length ? <div className="poster-grid">{titles.map(title => <Poster key={title.id} title={title} action={<button className="icon-button" aria-label={`Remove ${title.name}`} onClick={async () => { await api(`/watchlist/${title.id}`, { method: "DELETE" }); load(); }}>×</button>} />)}</div> : titles ? <div className="empty"><h2>Your list is wide open.</h2><p>Add something from the collection and it will wait here.</p></div> : <div className="loader" />}</main></Protected>;
}
