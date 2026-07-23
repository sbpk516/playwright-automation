"use client";

import { FormEvent, useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { api, Title } from "@/lib/api";

export default function Admin() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [selected, setSelected] = useState<Title | null>(null);
  const [error, setError] = useState("");
  const load = () => api<Title[]>("/admin/titles").then(setTitles);
  useEffect(() => { load(); }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget); const name = String(form.get("name"));
    const title = { id: selected?.id || String(form.get("id")), name, synopsis: String(form.get("synopsis")), type: form.get("type"), genres: String(form.get("genres")).split(",").map(x => x.trim()), maturity_rating: Number(form.get("rating")), release_year: Number(form.get("year")), media_meta: String(form.get("meta")), image: selected?.image || "/posters/custom.jpg", available: true, tier: Number(form.get("tier")), published: selected?.published || false, keywords: name.toLowerCase() };
    try { await api(selected ? `/admin/titles/${selected.id}` : "/admin/titles", { method: selected ? "PUT" : "POST", body: JSON.stringify(title) }); setSelected(null); event.currentTarget.reset(); load(); }
    catch (reason) { setError((reason as Error).message); }
  }

  return <Protected role="admin"><main className="app-main page admin-page"><div className="catalog-head"><div><p className="eyebrow">CONTROL ROOM</p><h1>Catalog administration.</h1></div><span>{titles.length} records</span></div><div className="admin-layout"><section className="admin-list">{titles.map(title => <article key={title.id}><div><span className={title.published ? "status published" : "status"}>{title.published ? "Published" : "Draft"}</span><h2>{title.name}</h2><p>{title.id} / {title.type} / Tier {title.tier}</p></div><div className="profile-actions"><button className="text-button" onClick={() => setSelected(title)}>Edit</button><button className="ghost small" onClick={async () => { await api(`/admin/titles/${title.id}/publish?published=${!title.published}`, { method: "PUT" }); load(); }}>{title.published ? "Unpublish" : "Publish"}</button></div></article>)}</section><form key={selected?.id || "new"} className="panel admin-form" onSubmit={save}><p className="eyebrow">{selected ? "EDIT TITLE" : "NEW TITLE"}</p><h2>{selected ? selected.name : "Add to the catalog."}</h2><label>Stable ID<input name="id" defaultValue={selected?.id} disabled={Boolean(selected)} placeholder="title-31" pattern="[a-z0-9-]+" required /></label><label>Name<input name="name" defaultValue={selected?.name} required /></label><label>Synopsis<textarea name="synopsis" defaultValue={selected?.synopsis} required /></label><div className="form-row"><label>Type<select name="type" defaultValue={selected?.type || "movie"}><option value="movie">Movie</option><option value="series">Series</option></select></label><label>Genres<input name="genres" defaultValue={selected?.genres.join(",")} placeholder="Drama,Sci-Fi" required /></label></div><div className="form-row"><label>Year<input name="year" type="number" min="1900" max="2100" defaultValue={selected?.release_year || 2026} required /></label><label>Rating<input name="rating" type="number" min="0" max="18" defaultValue={selected?.maturity_rating || 13} required /></label></div><div className="form-row"><label>Tier<select name="tier" defaultValue={selected?.tier || 1}><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label><label>Runtime<input name="meta" defaultValue={selected?.media_meta} placeholder="102 min" required /></label></div>{error && <p className="error" role="alert">{error}</p>}<button className="button">{selected ? "Save changes" : "Create draft"}</button>{selected && <button type="button" className="ghost" onClick={() => setSelected(null)}>Cancel</button>}</form></div></main></Protected>;
}
