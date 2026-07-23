"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { api, Plan } from "@/lib/api";

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]); const [current, setCurrent] = useState(""); const [notice, setNotice] = useState("");
  function load() { Promise.all([api<Plan[]>("/plans"), api<{ plan: Plan }>("/account")]).then(([all, account]) => { setPlans(all); setCurrent(account.plan.id); }); } useEffect(load, []);
  async function choose(plan: Plan) { if (plan.id === current || !confirm(`Change to ${plan.name} immediately? This is a simulated plan change.`)) return; await api("/account/plan", { method: "PUT", body: JSON.stringify({ plan_id: plan.id }) }); setCurrent(plan.id); setNotice(`Your plan is now ${plan.name}.`); }
  return <Protected><main className="app-main page"><p className="eyebrow">YOUR VIEW, YOUR WAY</p><h1>Choose your signal.</h1><p className="muted">Plan changes and prices are fictional. Changes take effect immediately.</p>{notice && <p className="success" role="status">{notice}</p>}<div className="plan-grid account-plans">{plans.map(plan => <article className={plan.id === current ? "plan featured" : "plan"} key={plan.id}>{plan.id === current && <span className="badge">CURRENT PLAN</span>}<h2>{plan.name}</h2><p className="price"><sup>$</sup>{plan.price}<small>/mo</small></p><dl><div><dt>Picture</dt><dd>{plan.quality}</dd></div><div><dt>Streams</dt><dd>{plan.stream_limit}</dd></div></dl><p>{plan.features}</p><button className={plan.id === current ? "ghost" : "button"} onClick={() => choose(plan)}>{plan.id === current ? "Current plan" : `Choose ${plan.name}`}</button></article>)}</div></main></Protected>;
}
