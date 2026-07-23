import Link from "next/link";
import type { Title } from "@/lib/api";

const colors = ["plum", "blue", "gold", "green", "coral"];

export default function Poster({ title, action }: { title: Title; action?: React.ReactNode }) {
  return <article className="poster-card">
    <Link className={`poster ${colors[Number(title.id.slice(-2)) % colors.length]}`} href={`/title/${title.id}`} aria-label={`View ${title.name}`}>
      <span className="poster-kicker">STREAMFORGE ORIGINAL</span>
      <strong>{title.name}</strong>
      <span>{title.type === "series" ? "SERIES" : "FILM"}</span>
    </Link>
    <div className="poster-info"><div><h3><Link href={`/title/${title.id}`}>{title.name}</Link></h3><p>{title.release_year} · {title.media_meta} · {title.maturity_rating}+</p></div>{action}</div>
  </article>;
}
