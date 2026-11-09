import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Clock, Gauge, Layers, Folder, Flame } from "lucide-react";
import { Nav, Footer, FloatingWA, Polaroid, Sticker, Reveal, Label, Tape, Pin, WhatsAppIcon } from "../components/ui.jsx";
import ProjectCard, { shortTitle, subTitle } from "../components/ProjectCard.jsx";
import { getJSON, inr, useSettings, waLink, tone, toneAt } from "../lib/api.jsx";

function Block({ label, title, children, color = "bg-sun" }) {
  return (
    <Reveal>
      <div className="bg-white border border-ink rounded-2xl p-5 md:p-7">
        <Label className={`${color} border border-ink rounded-md px-2 py-0.5`}>{label}</Label>
        {title && <h2 className="font-serif text-4xl md:text-5xl leading-none mt-3 mb-4">{title}</h2>}
        {children}
      </div>
    </Reveal>
  );
}

export default function Project() {
  const { slug } = useParams();
  const s = useSettings();
  const [p, setP] = useState(undefined);
  const [all, setAll] = useState([]);
  const [sel, setSel] = useState(new Set());

  useEffect(() => {
    setP(undefined);
    window.scrollTo(0, 0);
    Promise.all([getJSON("/api/projects/" + encodeURIComponent(slug)), getJSON("/api/projects")])
      .then(([one, list]) => {
        setP(one); setAll(list);
        setSel(new Set((one.pricing || []).map((r, i) => (r.included ? i : -1)).filter((i) => i >= 0)));
        document.title = `${shortTitle(one.title)} – ${s.siteName}`;
      })
      .catch(() => setP(null));
  }, [slug]);

  const items = useMemo(() => (p?.pricing || []).filter((_, i) => sel.has(i)), [p, sel]);
  const total = items.reduce((a, r) => a + r.price, 0);
  const index = all.findIndex((x) => x.id === p?.id);
  const related = useMemo(() => {
    if (!p) return [];
    const same = all.filter((x) => x.id !== p.id && x.category === p.category);
    const other = all.filter((x) => x.id !== p.id && x.category !== p.category);
    return [...same, ...other].slice(0, 3);
  }, [all, p]);

  if (p === undefined)
    return (<><Nav /><div className="mx-auto max-w-6xl px-5 py-16"><div className="h-64 rounded-2xl bg-paper-2 animate-pulse" /></div></>);
  if (p === null)
    return (
      <>
        <Nav />
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-pixel text-6xl">404</h1>
          <p className="font-hand text-3xl text-mute mt-2">this project ghosted us</p>
          <Link to="/#projects" className="inline-flex mt-8 bg-ink text-white font-bold rounded-xl px-6 py-3">See all projects</Link>
        </div>
      </>
    );

  const toggle = (i) => setSel((old) => { const n = new Set(old); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const msg =
    `Hi! I want to finalize this project:\n\n*${p.title}*\nCategory: ${p.category}\n\n` +
    (items.length ? `I need:\n${items.map((r) => `• ${r.name} – ${inr(r.price)}`).join("\n")}\n\n*Total: ${inr(total)}*\n\n` : "") +
    `Link: ${location.origin}/project/${p.slug}\n\nPlease share the next steps.`;
  const href = waLink(s.whatsapp, msg);
  const t = tone(p.category);

  const meta = [
    { icon: Folder, k: "Category", v: p.category, c: "bg-sun-2" },
    { icon: Gauge, k: "Difficulty", v: p.difficulty, c: "bg-bubble-2" },
    { icon: Clock, k: "Timeline", v: p.duration || "Discuss", c: "bg-sky-2" },
    { icon: Layers, k: "Stack", v: `${(p.techStack || []).length} tools`, c: "bg-mint-2" }
  ];

  return (
    <>
      <Nav />

      {/* ---------- HEADER ---------- */}
      <section className="mx-auto max-w-6xl px-5 pt-8 pb-12 md:pt-12">
        <Link to="/#projects" className="inline-flex items-center gap-1.5 text-sm font-bold text-mute hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> All projects
        </Link>
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-10 lg:gap-14 items-center mt-6">
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <span className="num text-xs bg-ink text-sun rounded-md px-2 py-1 whitespace-nowrap">No. {String(index + 1).padStart(2, "0")}</span>
              {p.quip && <span className="font-hand text-xl text-mute -rotate-1">{p.quip}</span>}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-pixel text-[54px] sm:text-7xl md:text-[92px] leading-[0.85] tracking-tight mt-4 break-words">
              {shortTitle(p.title).toUpperCase()}
            </motion.h1>
            {subTitle(p.title) && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-serif italic text-3xl md:text-4xl leading-tight mt-3">
                {subTitle(p.title)}
              </motion.p>
            )}
            <p className="mt-4 text-lg text-ink-2 max-w-xl">{p.tagline}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {meta.map((m, i) => (
                <motion.div key={m.k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
                  style={{ rotate: `${[-1.5, 1, -0.8, 1.4][i]}deg` }} className={`${m.c} p-3 shadow-paper`}>
                  <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider font-bold text-mute"><m.icon className="w-3.5 h-3.5" />{m.k}</span>
                  <span className="block font-bold text-[15px] mt-1 leading-tight">{m.v}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.94, rotate: 4 }} animate={{ opacity: 1, scale: 1, rotate: 2 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative max-w-md mx-auto w-full">
            <Polaroid src={p.image} alt={p.title} caption={shortTitle(p.title).toLowerCase() + ", in real life"} rotate={2} tape={t.tape} imgClass="aspect-[4/3]" />
            {p.featured && (
              <Sticker className="-left-3 -top-6" tone="bg-tang text-white" cursor float={5}>
                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Hot pick this year</span>
              </Sticker>
            )}
            <Sticker className="-right-2 -bottom-5" tone="bg-sun" float={4} tail="top">Reviewer approved vibe</Sticker>
          </motion.div>
        </div>
      </section>

      {/* ---------- BODY ---------- */}
      <section className="mx-auto max-w-6xl px-5 grid lg:grid-cols-[1fr_380px] gap-8 items-start pb-8">
        <div className="space-y-6 min-w-0">
          <Block label="The idea" title="What is it?">
            <p className="text-[16.5px] leading-relaxed text-ink-2">{p.description}</p>
          </Block>

          {p.problem && (
            <Block label="Why bother" title="Why it matters" color="bg-bubble">
              <p className="text-[16.5px] leading-relaxed text-ink-2">{p.problem}</p>
            </Block>
          )}

          {p.features?.length > 0 && (
            <Block label="Features" title="What it does" color="bg-mint">
              <ul className="divide-y divide-dashed divide-ink/20">
                {p.features.map((f, i) => (
                  <li key={i} className="flex gap-4 py-3 items-baseline">
                    <span className="num text-mute text-sm w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[16px] font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {p.useCases?.length > 0 && (
            <Block label="Real world" title="Where it's used" color="bg-sky-2">
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                {p.useCases.map((u, i) => (
                  <div key={i} style={{ rotate: `${[-1.5, 1.2, -0.6][i % 3]}deg` }} className={`relative ${toneAt(i).soft} p-4 pt-6 shadow-paper min-h-24`}>
                    <Pin color={toneAt(i).pin} className="-top-2 left-4" />
                    <p className="font-hand text-[22px] leading-tight">{u}</p>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {p.techStack?.length > 0 && (
            <Block label="Built with" title="Tech stack" color="bg-lilac">
              <div className="flex flex-wrap gap-2.5">
                {p.techStack.map((x, i) => (
                  <span key={x} className={`relative ${toneAt(i).soft} border border-ink rounded-md px-3 py-1.5 font-semibold text-sm`}>{x}</span>
                ))}
              </div>
            </Block>
          )}
        </div>

        {/* ---------- ORDER RECEIPT ---------- */}
        <aside className="lg:sticky lg:top-24 space-y-5" id="order">
          <div className="relative">
            <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-2 w-28" color={t.tape} />
            <div className="receipt-edge bg-white shadow-lift px-5 pt-7 pb-6">
              <div className="text-center border-b border-dashed border-ink/30 pb-3 mb-4">
                <p className="font-pixel text-2xl leading-none">YOUR ORDER</p>
                <p className="font-hand text-xl text-mute">tick only what you need</p>
              </div>
              <div className="space-y-2">
                {(p.pricing || []).map((r, i) => {
                  const on = sel.has(i);
                  return (
                    <button key={i} type="button" onClick={() => toggle(i)} aria-pressed={on}
                      className={`w-full flex items-center gap-3 text-left rounded-lg px-3 py-2.5 border transition ${on ? "border-ink bg-sun-2" : "border-ink/15 hover:border-ink/50"}`}>
                      <span className={`grid place-items-center w-5 h-5 rounded border shrink-0 ${on ? "bg-ink border-ink" : "border-ink/40 bg-white"}`}>
                        {on && <Check className="w-3.5 h-3.5 text-sun" strokeWidth={3.5} />}
                      </span>
                      <span className="flex-1 text-[14px] font-semibold leading-snug">{r.name}</span>
                      <span className="num text-[15px] whitespace-nowrap">{inr(r.price)}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-end justify-between border-t border-dashed border-ink/30 mt-4 pt-4">
                <span className="text-sm font-bold uppercase tracking-wider text-mute">Total</span>
                <motion.span key={total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="num text-4xl leading-none">{inr(total)}</motion.span>
              </div>
              <p className="text-right text-[13px] text-mute mt-1">{total ? `${inr(Math.ceil(total / 2))} advance to start` : "Pick at least one item"}</p>
              <a href={href} target="_blank" rel="noopener"
                className="mt-5 flex items-center justify-center gap-2 w-full bg-wa hover:bg-wa-2 text-white font-bold rounded-xl px-4 py-3.5 border border-ink shadow-[3px_3px_0_#111] transition">
                <WhatsAppIcon /> Contact to Finalize the Project
              </a>
              <ul className="mt-5 space-y-1.5 text-[13px] text-ink-2">
                {["Pay the balance after you see the demo", "Runs on your laptop, guaranteed", "Free minor changes after delivery"].map((x) => (
                  <li key={x} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-wa-2" strokeWidth={3} />{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <Reveal>
          <div className="bg-grid-dark text-white rounded-3xl border border-ink px-6 py-12 md:py-16 text-center">
            <p className="font-hand text-2xl text-white/60">code, paper, PPT, report, deployment</p>
            <h2 className="font-pixel text-5xl md:text-7xl leading-none mt-2">MAKE IT YOURS</h2>
            <p className="mt-4 text-white/75 max-w-lg mx-auto">One tap sends <b className="text-white">{shortTitle(p.title)}</b> and your selection to our WhatsApp. We reply with the plan and the timeline.</p>
            <a href={href} target="_blank" rel="noopener"
              className="mt-8 inline-flex items-center gap-2 bg-wa hover:bg-wa-2 text-white font-bold rounded-xl px-7 py-4 shadow-[4px_4px_0_#FFE14D] transition">
              <WhatsAppIcon /> Contact to Finalize the Project
            </a>
          </div>
        </Reveal>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-10">
          <p className="font-hand text-2xl text-mute">while you're here</p>
          <h2 className="font-pixel text-4xl md:text-5xl mb-8">YOU MIGHT ALSO LIKE</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {related.map((r) => <ProjectCard key={r.id} p={r} index={all.indexOf(r)} />)}
          </div>
        </section>
      )}

      <Footer />
      <FloatingWA className="hidden lg:grid" />

      {/* mobile sticky order bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-ink px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] flex items-center gap-3">
        <div className="leading-tight">
          <span className="block text-[10.5px] uppercase tracking-wider font-bold text-mute">Total</span>
          <span className="num text-2xl">{inr(total)}</span>
        </div>
        <a href={href} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-2 bg-wa text-white font-bold rounded-xl px-4 py-3 border border-ink">
          <WhatsAppIcon /> Finalize on WhatsApp
        </a>
      </div>
      <div className="lg:hidden h-20" />
    </>
  );
}
