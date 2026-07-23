import Link from "next/link";

const plans = [{ name: "Spark", price: "7.99", detail: "HD · 1 stream" }, { name: "Flare", price: "12.99", detail: "Full HD · 2 streams" }, { name: "Nova", price: "18.99", detail: "4K · 4 streams" }];

export default function Home() {
  return <main>
    <section className="hero">
      <nav className="landing-nav"><span className="brand"><b>SF</b> StreamForge</span><Link className="ghost" href="/sign-in">Sign in</Link></nav>
      <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
      <div className="hero-copy"><p className="eyebrow">A NEW FREQUENCY OF STORY</p><h1>Stories that stay<br /><em>in motion.</em></h1><p>Discover daring films, luminous series, and worlds made to pull you in. StreamForge is your next favorite place to get lost.</p><div className="hero-actions"><Link className="button" href="/sign-in?returnTo=/browse">Start watching</Link><a className="text-link" href="#plans">Explore plans ↓</a></div></div>
      <div className="feature-strip"><span><b>30+</b> original stories</span><span><b>6</b> worlds to explore</span><span><b>∞</b> moments to remember</span></div>
    </section>
    <section id="plans" className="section plans-section"><p className="eyebrow">SIMPLE CHOICES</p><h2>Pick your picture.</h2><p className="muted">Fictional plans and prices for this demonstration.</p><div className="plan-grid">{plans.map((plan, i) => <article className={i === 1 ? "plan featured" : "plan"} key={plan.name}>{i === 1 && <span className="badge">MOST LOVED</span>}<h3>{plan.name}</h3><p className="price"><sup>$</sup>{plan.price}<small>/mo</small></p><p>{plan.detail}</p><Link className={i === 1 ? "button" : "ghost"} href="/sign-in?returnTo=/plans">Choose {plan.name}</Link></article>)}</div></section>
    <footer><span className="brand"><b>SF</b> StreamForge</span><p>A fictional streaming service built for quality engineering.</p></footer>
  </main>;
}
