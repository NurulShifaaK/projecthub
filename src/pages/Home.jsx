import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowRight, Check, Copy, Plus, Search, Code2, FileText, Presentation, BookOpen, Rocket, Mic } from "lucide-react";
import { Nav, Footer, FloatingWA, Polaroid, Sticker, Reveal, Label, Pin, Tape, WhatsAppIcon, SafeImg } from "../components/ui.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import { getJSON, useSettings, waLink, toneAt } from "../lib/api.jsx";

const U = (id, w = 700) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
const IMG = {
  students: U("1522202176988-66273c2fd55f"),
  laptop: U("1517694712202-14dd9538aa97"),
  robot: U("1485827404703-89b55fcc595e"),
  circuit: U("1518770660439-4636190af475"),
  study: U("1543269865-cbf427effbad")
};

const DELIVERABLES = [
  { icon: Code2, title: "Source code", text: "Commented, tested and installed on your laptop. It runs. We checked. Twice." },
  { icon: FileText, title: "Research paper", text: "IEEE format with real references. Not a chatbot essay with a cover page." },
  { icon: Presentation, title: "Presentation", text: "Slides for review 1, 2 and the final. No 40-bullet slides, we promise." },
  { icon: BookOpen, title: "Project report", text: "The black book: abstract, diagrams, testing, results. Thick enough to impress." },
  { icon: Rocket, title: "Deployment", text: "A live link you can open on your phone, right in the middle of the viva." },
  { icon: Mic, title: "Viva prep", text: "A call where we explain every line, so “my friend did it” never crosses your mind." }
];

const STEPS = [
  { t: "Pick one", d: "Scroll. Tap. Pretend you didn't spend two hours deciding.", c: "bg-sun-2", pin: "#F2B705" },
  { t: "Tick what you need", d: "Only the paper? Only the PPT? Fine. You pay for what you tick.", c: "bg-bubble-2", pin: "#FF4D8D" },
  { t: "Hit send on WhatsApp", d: "Your project and price are already typed. You just press send.", c: "bg-sky-2", pin: "#3D5AFE" },
  { t: "See it run, then pay", d: "Advance to start. The rest after the demo works. Fair is fair.", c: "bg-mint-2", pin: "#18A957" }
];

const FAQ = [
  ["Will it actually run on my laptop?", "Yes. We set it up on your system and show it running before you pay the balance. No “works on my machine” nonsense."],
  ["Can I take only the PPT or only the paper?", "Yes. Every project page has a checklist. Untick what you don't need and the price drops right there."],
  ["Will you help me explain it in the viva?", "That's the whole point. We walk you through the code, the architecture and the questions examiners love to ask."],
  ["My topic isn't in the list.", "Send us your idea or your college's guidelines on WhatsApp. If it's buildable, we'll quote it."],
  ["How long does it take?", "Most projects take one to two weeks. Each project page shows its timeline. Panic deadlines can be discussed."]
];

export default function Home() {
  const s = useSettings();
  const [projects, setProjects] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => { getJSON("/api/projects").then(setProjects).catch(() => setProjects([])); }, []);
  useEffect(() => {
    if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 300);
  }, []);

  const cats = useMemo(() => ["All", ...new Set((projects || []).map((p) => p.category))], [projects]);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return (projects || []).filter((p) =>
      (cat === "All" || p.category === cat) &&
      (!k || [p.title, p.tagline, p.category, p.description, ...(p.techStack || [])].join(" ").toLowerCase().includes(k))
    );
  }, [projects, q, cat]);
  const general = waLink(s.whatsapp, `Hi! I found ${s.siteName}. I need help choosing an AI project.`);

  return (
    <>
      <Nav />

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-16 md:pt-16 md:pb-24 relative">
          {/* side polaroids (desktop) */}
          <div className="hidden lg:block absolute left-0 top-24 w-44">
            <Polaroid src={IMG.students} alt="Students working together" caption="review day, sorted" rotate={-7} />
          </div>
          <div className="hidden lg:block absolute right-0 top-16 w-40">
            <Polaroid src={IMG.robot} alt="Robot" caption="the AI part" rotate={6} tape="rgba(255,179,207,.85)" />
          </div>
          <div className="hidden lg:block absolute right-8 bottom-6 w-36">
            <Polaroid src={IMG.circuit} alt="Circuit board" caption="it's real code" rotate={-4} tape="rgba(205,214,255,.9)" imgClass="aspect-square" />
          </div>

          <div className="relative text-center max-w-3xl mx-auto">
            <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="font-hand text-2xl text-mute -rotate-2">
              for final-years who'd rather sleep
            </motion.p>

            <div className="relative mt-3">
              <Sticker className="-left-1 -top-8 sm:left-6 sm:-top-6" tone="bg-mint" float={5}>Source code that runs</Sticker>
              <Sticker className="hidden sm:block right-2 top-[30%]" tone="bg-white" cursor float={6} tail="top">IEEE paper included</Sticker>
              <Sticker className="hidden sm:block -left-6 bottom-[22%]" tone="bg-sky-2" cursor float={4}>Viva-proof</Sticker>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-[52px] leading-[0.92] sm:text-7xl md:text-[104px] tracking-tight"
              >
                your final year
                <br />
                <span className="relative inline-block px-2">
                  <motion.span
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-x-0 top-[12%] bottom-[2%] bg-bubble/70 origin-left -z-0"
                  />
                  <span className="absolute -left-1.5 top-[12%] w-2.5 h-2.5 bg-white border border-ink" />
                  <span className="absolute -right-1.5 bottom-[2%] w-2.5 h-2.5 bg-white border border-ink" />
                  <span className="relative">AI project,</span>
                </span>
                <br />
                <em className="italic">done properly.</em>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="mt-7 text-[17px] md:text-lg text-ink-2 max-w-xl mx-auto leading-relaxed"
            >
              Your guide said <span className="font-semibold">“do something in AI.”</span> Very specific. So here are 30 projects we
              build, document, deploy and teach you to explain, before the review date sneaks up on you.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#projects" className="inline-flex items-center justify-center gap-2 bg-ink text-white font-bold rounded-xl px-6 py-3.5 border border-ink shadow-[4px_4px_0_#FFE14D] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#FFE14D] transition">
                Browse 30 projects <ArrowDown className="w-4 h-4" />
              </a>
              <a href={general} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 bg-white font-bold rounded-xl px-6 py-3.5 border border-ink shadow-[4px_4px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#111] transition">
                <WhatsAppIcon className="w-5 h-5 text-wa-2" /> Ask a question
              </a>
            </motion.div>

            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="mt-8 flex flex-wrap justify-center gap-2 text-[13px] font-semibold">
              {["Pay the balance after the demo", "You choose the deliverables", "Free minor changes"].map((x, i) => (
                <li key={x} className={`flex items-center gap-1.5 ${toneAt(i + 2).soft} border border-ink/60 rounded-lg px-2.5 py-1`}>
                  <Check className="w-3.5 h-3.5" strokeWidth={3} /> {x}
                </li>
              ))}
            </motion.ul>

            {/* mobile photo strip */}
            <div className="lg:hidden mt-12 flex justify-center gap-3">
              <Polaroid src={IMG.students} alt="Students" caption="review day" rotate={-6} className="w-32" imgClass="aspect-square" />
              <Polaroid src={IMG.robot} alt="Robot" caption="the AI part" rotate={5} className="w-32 mt-4" imgClass="aspect-square" tape="rgba(255,179,207,.85)" />
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="border-y border-ink bg-ink text-sun overflow-hidden">
          <motion.div className="flex whitespace-nowrap py-3 font-pixel text-lg" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex shrink-0">
                {["Source code", "Research paper", "PPT", "Project report", "Deployment", "Viva prep", "Machine learning", "Deep learning", "Generative AI", "Computer vision"].map((w) => (
                  <span key={w} className="px-5 flex items-center gap-5">{w}<span className="text-white/40">/</span></span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------------- WHAT'S IN THE BOX ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <Label className="bg-sun border border-ink rounded-md px-2 py-1">What's in the box</Label>
          <h2 className="font-serif text-5xl md:text-7xl leading-[0.95] mt-4">Everything your college <em>asks for.</em></h2>
          <p className="font-hand text-2xl text-mute mt-3">and nothing you have to chase anyone for</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {DELIVERABLES.map((d, i) => {
            const t = toneAt(i);
            const Icon = d.icon;
            return (
              <Reveal key={d.title} delay={(i % 3) * 0.08} className={i % 2 ? "sm:mt-10" : ""}>
                <motion.div whileHover={{ rotate: 0, y: -4 }} style={{ rotate: [-2, 1.5, -1, 2, -1.5, 1][i] }}
                  className="relative bg-white rounded-2xl p-3 shadow-lift">
                  <Pin color={t.pin} className="-top-2.5 left-1/2 -translate-x-1/2" />
                  <div className={`${t.soft} rounded-xl p-5 border border-ink/10`}>
                    <div className="flex items-start justify-between">
                      <span className="font-hand text-4xl leading-none" style={{ color: t.pin }}>0{i + 1}</span>
                      <Icon className="w-6 h-6 text-ink/70" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-2xl font-extrabold tracking-tight mt-3">{d.title}</h3>
                    <p className="text-[15px] text-ink-2/90 mt-2 leading-relaxed">{d.text}</p>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- PROJECTS ---------------- */}
      <section id="projects" className="scroll-mt-24 border-y border-ink bg-white/60">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="font-hand text-2xl text-mute -rotate-1">pick your fighter</p>
              <h2 className="font-pixel text-6xl md:text-8xl leading-[0.85] tracking-tight">THE MENU</h2>
              <p className="mt-3 text-ink-2 max-w-md">30 projects. Zero “library management system.” Tap one to see what it does, what you get and what it costs.</p>
            </div>
            <label className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-mute" />
              <input
                type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="chatbot, face, YOLO, health…"
                className="w-full bg-white border border-ink rounded-xl pl-11 pr-4 py-3.5 text-base outline-none shadow-[3px_3px_0_#111] focus:shadow-[3px_3px_0_#3D5AFE] transition"
              />
            </label>
          </Reveal>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 -mx-5 px-5">
            {cats.map((c, i) => {
              const active = c === cat;
              return (
                <button key={c} onClick={() => setCat(c)}
                  className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-bold border border-ink transition ${active ? "bg-ink text-white shadow-[2px_2px_0_#FFE14D]" : `${toneAt(i).soft} hover:-translate-y-0.5`}`}>
                  {c}
                </button>
              );
            })}
          </div>

          {projects === null ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {[0, 1, 2].map((i) => <div key={i} className="h-96 rounded-2xl bg-paper-2 animate-pulse" />)}
            </div>
          ) : list.length ? (
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-9">
              <AnimatePresence>
                {list.map((p) => <ProjectCard key={p.id} p={p} index={projects.indexOf(p)} />)}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="font-pixel text-3xl">Nothing here.</p>
              <p className="text-mute mt-2 mb-6">Bold of you to want “{q}”. We might still build it.</p>
              <a href={waLink(s.whatsapp, `Hi! I'm looking for an AI project on: ${q}`)} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 bg-wa text-white font-bold rounded-xl px-5 py-3 border border-ink shadow-[3px_3px_0_#111]">
                <WhatsAppIcon /> Ask for a custom project
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section id="process" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-20 md:py-28">
        <Reveal className="mb-12">
          <Label className="bg-bubble border border-ink rounded-md px-2 py-1">The process</Label>
          <h2 className="font-serif text-5xl md:text-7xl leading-[0.95] mt-4">Four steps. <em className="squiggle">No drama.</em></h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((st, i) => (
            <Reveal key={st.t} delay={i * 0.08}>
              <motion.div whileHover={{ rotate: 0, scale: 1.02 }} style={{ rotate: [-2, 1.5, -1.5, 2][i] }}
                className={`relative ${st.c} aspect-square p-6 shadow-lift flex flex-col`}>
                <Pin color={st.pin} className="-top-2.5 left-6" />
                <span className="font-pixel text-5xl text-ink/80">0{i + 1}</span>
                <h3 className="text-xl font-extrabold mt-auto">{st.t}</h3>
                <p className="font-hand text-[22px] leading-tight text-ink-2 mt-1">{st.d}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- PAYMENT / TRUST ---------------- */}
      <section id="pricing" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-8 md:py-12">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <Reveal>
            <p className="font-hand text-2xl text-mute">about the money</p>
            <h2 className="font-pixel text-5xl md:text-7xl leading-[0.9]">TRUST ISSUES?<br /><span className="text-sky">FAIR.</span></h2>
            <p className="mt-5 text-ink-2 max-w-md leading-relaxed">
              Paying a stranger online for your final project is scary. So you don't pay it all upfront. You see it working first.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["UPI", "Google Pay", "PhonePe", "Paytm", "Bank transfer"].map((m) => (
                <span key={m} className="bg-white border border-ink rounded-md px-2.5 py-1 text-sm font-bold">{m}</span>
              ))}
            </div>
            <div className="hidden lg:flex gap-4 mt-10">
              <Polaroid src={IMG.laptop} alt="Laptop with code" caption="demo first" rotate={-5} className="w-40" imgClass="aspect-square" />
              <Polaroid src={IMG.study} alt="Students studying" caption="then submit" rotate={4} className="w-40 mt-6" imgClass="aspect-square" tape="rgba(142,227,166,.85)" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2 w-28" />
              <div className="receipt-edge bg-white shadow-lift px-6 pt-8 pb-8 rotate-[0.6deg]">
                <div className="text-center border-b border-dashed border-ink/30 pb-4">
                  <p className="font-pixel text-2xl">{s.siteName}</p>
                  <p className="text-xs uppercase tracking-[.2em] text-mute mt-1">Payment terms</p>
                </div>
                <ul className="py-5 space-y-4">
                  {(s.paymentTerms || []).map((t, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-snug">
                      <span className="num text-sm text-mute w-6 shrink-0 pt-px">{String(i + 1).padStart(2, "0")}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                {s.upiId && (
                  <div className="flex items-center justify-between gap-3 border border-dashed border-ink rounded-lg px-3 py-2.5 mb-4 bg-sun-2">
                    <div className="text-sm"><span className="text-mute">UPI</span> <b className="num text-base">{s.upiId}</b></div>
                    <button onClick={() => { navigator.clipboard?.writeText(s.upiId); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
                      className="flex items-center gap-1 bg-ink text-white rounded-md px-2.5 py-1.5 text-xs font-bold">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
                <a href={general} target="_blank" rel="noopener"
                  className="flex items-center justify-center gap-2 w-full bg-wa hover:bg-wa-2 text-white font-bold rounded-xl px-5 py-3.5 border border-ink shadow-[3px_3px_0_#111] transition">
                  <WhatsAppIcon /> Talk price on WhatsApp
                </a>
                <p className="font-hand text-xl text-center text-mute mt-4">thank you, come again</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS (only if added in admin) ---------------- */}
      {s.testimonials?.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal className="mb-12">
            <Label className="bg-mint border border-ink rounded-md px-2 py-1">Students said</Label>
            <h2 className="font-serif text-5xl md:text-7xl leading-[0.95] mt-4">Don't take <em>our</em> word for it.</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {s.testimonials.map((t, i) => (
              <Reveal key={i} delay={(i % 3) * 0.08}>
                <div style={{ rotate: `${[-1.5, 1, -0.5][i % 3]}deg` }} className={`relative ${toneAt(i).soft} p-6 shadow-lift`}>
                  <Pin color={toneAt(i).pin} className="-top-2.5 right-8" />
                  <p className="font-hand text-2xl leading-tight">“{t.text}”</p>
                  <div className="flex items-center gap-3 mt-5">
                    {t.photo && <SafeImg src={t.photo} alt={t.name} className="w-11 h-11 rounded-full border border-ink" />}
                    <div className="leading-tight">
                      <b className="text-sm">{t.name}</b>
                      <p className="text-xs text-mute">{[t.college, t.project].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="scroll-mt-24 mx-auto max-w-3xl px-5 py-20 md:py-28">
        <Reveal className="text-center mb-10">
          <Label className="bg-lilac border border-ink rounded-md px-2 py-1">FAQ</Label>
          <h2 className="font-serif text-5xl md:text-6xl leading-[0.95] mt-4">Questions you were <em>about to ask</em></h2>
        </Reveal>
        <div className="space-y-3">
          {FAQ.map(([qq, a], i) => (
            <Reveal key={qq} delay={i * 0.04}>
              <div className="bg-ruled border border-ink rounded-xl overflow-hidden">
                <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-bold">
                  {qq}
                  <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="shrink-0 grid place-items-center w-7 h-7 rounded-md bg-sun border border-ink">
                    <Plus className="w-4 h-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-ink-2 leading-relaxed">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- LET'S TALK ---------------- */}
      <section className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="relative bg-grid-dark text-white rounded-3xl border border-ink px-6 py-16 md:py-20 text-center overflow-hidden">
            <div className="hidden md:block absolute left-10 top-10 w-36"><Polaroid src={IMG.laptop} alt="" caption="your project" rotate={-8} imgClass="aspect-square" /></div>
            <div className="hidden md:block absolute right-10 bottom-10 w-36"><Polaroid src={IMG.students} alt="" caption="your viva" rotate={7} imgClass="aspect-square" tape="rgba(255,179,207,.85)" /></div>
            <p className="font-hand text-2xl text-white/60">still scrolling?</p>
            <h2 className="font-pixel text-6xl md:text-8xl leading-none mt-2">LET'S TALK</h2>
            <p className="mt-4 text-white/75 max-w-md mx-auto">Tell us your department and what you're into. We'll suggest a project that fits, for free.</p>
            <a href={general} target="_blank" rel="noopener"
              className="mt-8 inline-flex items-center gap-2 bg-wa hover:bg-wa-2 text-white font-bold rounded-xl px-7 py-4 border border-white/20 shadow-[4px_4px_0_#FFE14D] transition">
              <WhatsAppIcon /> Chat on WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </Reveal>
      </section>

      <Footer />
      <FloatingWA />
    </>
  );
}
