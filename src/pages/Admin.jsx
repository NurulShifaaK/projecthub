import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, LogOut, Plus, Pencil, Trash2, ExternalLink, X, Upload, Search, Eye, EyeOff, Flame, Save } from "lucide-react";
import { SafeImg } from "../components/ui.jsx";
import { inr } from "../lib/api.jsx";

const DEFAULT_ROWS = [
  { name: "Full Source Code + Setup on your laptop", price: 3500, included: true },
  { name: "Project Report / Documentation (black book)", price: 1000, included: true },
  { name: "Project Presentation (PPT)", price: 500, included: true },
  { name: "Research Paper (IEEE format)", price: 1500, included: false },
  { name: "Live Deployment (hosted online link)", price: 1000, included: false },
  { name: "Code Explanation + Viva Preparation Call", price: 500, included: true }
];

const input = "w-full mt-1.5 bg-white border border-ink/25 rounded-lg px-3 py-2.5 text-[15px] outline-none focus:border-ink focus:shadow-[2px_2px_0_#111] transition";
const lbl = "block text-[13px] font-bold text-ink-2 mb-4";

function useToast() {
  const [msg, setMsg] = useState("");
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(""), 2200); return () => clearTimeout(t); } }, [msg]);
  const node = (
    <AnimatePresence>
      {msg && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[100] bg-ink text-white font-semibold text-sm rounded-xl px-4 py-3 shadow-lg">
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
  return [node, setMsg];
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("aph_token") || "");
  const [toast, say] = useToast();

  async function api(url, opts = {}) {
    const r = await fetch(url, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && !url.endsWith("/login")) { logout(); throw new Error("Session expired. Log in again."); }
    if (!r.ok) throw new Error(data.error || "Something went wrong");
    return data;
  }
  function logout() { sessionStorage.removeItem("aph_token"); setToken(""); }

  useEffect(() => { document.title = "Admin"; }, []);

  if (!token) return <Login onLogin={(t) => { sessionStorage.setItem("aph_token", t); setToken(t); }} toast={toast} />;
  return <Dashboard api={api} say={say} toast={toast} onLogout={async () => { try { await api("/api/admin/logout", { method: "POST" }); } catch {} logout(); }} />;
}

function Login({ onLogin, toast }) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const f = new FormData(e.target);
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), password: f.get("password") }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Login failed");
      onLogin(d.token);
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }
  return (
    <div className="min-h-screen grid place-items-center px-5">
      <motion.form initial={{ opacity: 0, y: 20, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} onSubmit={submit}
        className="relative w-full max-w-sm bg-white border border-ink rounded-2xl p-7 shadow-[6px_6px_0_#111]">
        <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-3" />
        <div className="grid place-items-center w-12 h-12 rounded-xl bg-ink text-sun mx-auto"><Lock className="w-5 h-5" /></div>
        <h1 className="font-pixel text-4xl text-center mt-4">ADMIN</h1>
        <p className="font-hand text-xl text-center text-mute mb-6">staff only. yes, that means you.</p>
        <label className={lbl}>Email<input name="email" type="email" required autoComplete="username" className={input} placeholder="admin@gmail.com" /></label>
        <label className={lbl}>Password<input name="password" type="password" required autoComplete="current-password" className={input} placeholder="••••••" /></label>
        {err && <p className="text-sm font-semibold text-red-600 -mt-1 mb-3">{err}</p>}
        <button disabled={busy} className="w-full bg-ink text-white font-bold rounded-xl py-3 shadow-[3px_3px_0_#FFE14D] disabled:opacity-60">{busy ? "Checking…" : "Log in"}</button>
        <a href="/" className="block text-center text-sm font-semibold text-mute mt-4">Back to website</a>
      </motion.form>
      {toast}
    </div>
  );
}

function Dashboard({ api, say, toast, onLogout }) {
  const [tab, setTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null); // null | {} (new) | project

  const load = () => api("/api/admin/projects").then(setProjects).catch((e) => say(e.message));
  useEffect(() => { load(); }, []);

  const list = useMemo(() => projects.filter((p) => !q || (p.title + p.category).toLowerCase().includes(q.toLowerCase())), [projects, q]);
  const cats = useMemo(() => [...new Set(projects.map((p) => p.category))], [projects]);

  async function del(p) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try { await api("/api/admin/projects/" + p.id, { method: "DELETE" }); say("Project deleted"); load(); } catch (e) { say(e.message); }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 px-3 pt-3">
        <div className="mx-auto max-w-6xl flex items-center gap-2 bg-white border border-ink rounded-2xl p-2 shadow-[3px_3px_0_#111]">
          <a href="/" target="_blank" className="flex items-center gap-2 pl-1.5 pr-2">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-ink text-sun font-pixel text-sm">AI</span>
            <span className="font-pixel text-lg hidden sm:inline">Admin</span>
          </a>
          <div className="flex gap-1 bg-paper rounded-xl p-1 mx-auto">
            {[["projects", "Projects"], ["settings", "Payment & settings"]].map(([k, v]) => (
              <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${tab === k ? "bg-ink text-white" : "text-ink-2"}`}>{v}</button>
            ))}
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold hover:bg-paper"><LogOut className="w-4 h-4" /><span className="hidden sm:inline">Log out</span></button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === "projects" ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="font-pixel text-4xl md:text-5xl leading-none">PROJECTS <span className="text-mute text-2xl align-middle">{projects.length}</span></h1>
                <p className="text-mute text-sm mt-1">Add, edit, hide or delete projects. Change prices per project.</p>
              </div>
              <button onClick={() => setEditing({})} className="flex items-center gap-2 bg-ink text-white font-bold rounded-xl px-4 py-3 shadow-[3px_3px_0_#FFE14D]"><Plus className="w-4 h-4" />Add project</button>
            </div>
            <label className="relative block mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" className={`${input} mt-0 pl-9`} />
            </label>
            <div className="grid gap-3">
              {list.map((p) => {
                const total = (p.pricing || []).filter((r) => r.included).reduce((a, r) => a + r.price, 0);
                return (
                  <div key={p.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-ink/20 rounded-xl p-3 ${p.published ? "" : "opacity-60"}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <SafeImg src={p.image} alt="" className="w-20 h-14 rounded-lg shrink-0 border border-ink/10" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-[15px] leading-snug truncate">{p.title}</h3>
                        <p className="text-xs text-mute flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          <span>#{p.order}</span><span>{p.category}</span><span className="font-bold text-ink">{inr(total)}</span>
                          <span className={p.published ? "text-green-700 font-bold" : "text-red-600 font-bold"}>{p.published ? "Live" : "Hidden"}</span>
                          {p.featured && <span className="flex items-center gap-0.5 text-tang font-bold"><Flame className="w-3 h-3" />Hot</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/project/${p.slug}`} target="_blank" className="flex-1 sm:flex-none flex items-center justify-center gap-1 border border-ink/25 rounded-lg px-3 py-2 text-sm font-bold hover:border-ink"><ExternalLink className="w-4 h-4" />View</a>
                      <button onClick={() => setEditing(p)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 border border-ink/25 rounded-lg px-3 py-2 text-sm font-bold hover:border-ink"><Pencil className="w-4 h-4" />Edit</button>
                      <button onClick={() => del(p)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm font-bold hover:bg-red-100"><Trash2 className="w-4 h-4" />Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <Settings api={api} say={say} />
        )}
      </main>

      <AnimatePresence>
        {editing && <Editor api={api} say={say} project={editing} cats={cats} count={projects.length} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      </AnimatePresence>
      {toast}
    </div>
  );
}

function ImagePicker({ api, say, value, onChange, small }) {
  const [busy, setBusy] = useState(false);
  async function upload(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return say("Image must be under 5 MB");
    setBusy(true);
    try {
      const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      if (cloud && preset) {
        // upload straight to Cloudinary (permanent URL)
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", preset);
        fd.append("folder", "ai-projecthub");
        const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: fd });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error?.message || "Cloudinary upload failed");
        onChange(d.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_1200/"));
      } else {
        // fallback: save on this server (lost on free hosting restarts)
        const dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
        const { url } = await api("/api/admin/upload", { method: "POST", body: { dataUrl } });
        onChange(url);
      }
      say("Image uploaded. Now click Save project.");
    } catch (e) { say(e.message); }
    setBusy(false);
  }
  return (
    <div className={`flex gap-3 ${small ? "items-center" : "items-start"}`}>
      <SafeImg src={value} alt="" className={`${small ? "w-14 h-14 rounded-full" : "w-28 h-20 rounded-lg"} shrink-0 border border-ink/15`} />
      <div className="flex-1 min-w-0">
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL, or upload" className={`${input} mt-0`} />
        <label className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold cursor-pointer border border-ink/25 rounded-lg px-3 py-1.5 hover:border-ink">
          <Upload className="w-4 h-4" />{busy ? "Uploading…" : "Upload photo"}
          <input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      </div>
    </div>
  );
}

function Editor({ api, say, project, cats, count, onClose, onSaved }) {
  const isNew = !project.id;
  const [f, setF] = useState(() => ({
    title: "", tagline: "", quip: "", image: "", category: "", difficulty: "Intermediate", duration: "",
    description: "", problem: "", featured: false, published: true, order: count + 1,
    ...project,
    features: (project.features || []).join("\n"),
    useCases: (project.useCases || []).join("\n"),
    techStack: (project.techStack || []).join(", "),
    pricing: (project.pricing || DEFAULT_ROWS).map((r) => ({ ...r }))
  }));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((o) => ({ ...o, [k]: e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e }));
  const setRow = (i, k, v) => setF((o) => ({ ...o, pricing: o.pricing.map((r, j) => (j === i ? { ...r, [k]: v } : r)) }));
  const total = f.pricing.filter((r) => r.included).reduce((a, r) => a + (Number(r.price) || 0), 0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, []);

  async function save(e) {
    e.preventDefault(); setBusy(true);
    const body = { ...f, pricing: f.pricing.filter((r) => r.name.trim()).map((r) => ({ ...r, price: Number(r.price) || 0 })) };
    try {
      if (isNew) await api("/api/admin/projects", { method: "POST", body });
      else await api("/api/admin/projects/" + project.id, { method: "PUT", body });
      say(isNew ? "Project added" : "Project saved"); onSaved();
    } catch (err) { say(err.message); }
    setBusy(false);
  }

  return (
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <motion.form onSubmit={save} initial={{ x: 60 }} animate={{ x: 0 }} exit={{ x: 60 }} transition={{ type: "spring", damping: 26, stiffness: 260 }}
        className="absolute right-0 inset-y-0 w-full max-w-2xl bg-paper border-l border-ink flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink bg-white">
          <h2 className="font-pixel text-2xl">{isNew ? "NEW PROJECT" : "EDIT PROJECT"}</h2>
          <button type="button" onClick={onClose} className="grid place-items-center w-9 h-9 rounded-lg border border-ink/20"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <label className={lbl}>Project title * <span className="font-normal text-mute">(use “Name – description”, e.g. “MediScan AI – Predict Diseases”)</span>
            <input required value={f.title} onChange={set("title")} className={input} /></label>
          <div className={lbl}>Cover photo<div className="mt-1.5"><ImagePicker api={api} say={say} value={f.image} onChange={set("image")} /></div></div>
          <label className={lbl}>Tagline<input value={f.tagline} onChange={set("tagline")} className={input} placeholder="One clear line about what it does" /></label>
          <label className={lbl}>Witty one-liner <span className="font-normal text-mute">(handwritten note on the card)</span><input value={f.quip} onChange={set("quip")} className={input} placeholder="Like WebMD, but less dramatic." /></label>
          <div className="grid sm:grid-cols-3 gap-x-3">
            <label className={lbl}>Category<input list="cats" value={f.category} onChange={set("category")} className={input} /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></label>
            <label className={lbl}>Difficulty<select value={f.difficulty} onChange={set("difficulty")} className={input}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            <label className={lbl}>Timeline<input value={f.duration} onChange={set("duration")} className={input} placeholder="7–10 days" /></label>
          </div>
          <label className={lbl}>Description<textarea rows={4} value={f.description} onChange={set("description")} className={input} /></label>
          <label className={lbl}>Why it matters<textarea rows={3} value={f.problem} onChange={set("problem")} className={input} /></label>
          <label className={lbl}>Features <span className="font-normal text-mute">(one per line)</span><textarea rows={5} value={f.features} onChange={set("features")} className={input} /></label>
          <label className={lbl}>Real-world uses <span className="font-normal text-mute">(one per line)</span><textarea rows={3} value={f.useCases} onChange={set("useCases")} className={input} /></label>
          <label className={lbl}>Tech stack <span className="font-normal text-mute">(comma separated)</span><input value={f.techStack} onChange={set("techStack")} className={input} /></label>

          <div className="bg-white border border-dashed border-ink/40 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-pixel text-xl">WORK & PAYMENT</h3>
              <button type="button" onClick={() => setF((o) => ({ ...o, pricing: [...o.pricing, { name: "", price: 0, included: false }] }))}
                className="flex items-center gap-1 text-sm font-bold border border-ink/25 rounded-lg px-2.5 py-1.5 hover:border-ink"><Plus className="w-4 h-4" />Add item</button>
            </div>
            <p className="text-xs text-mute mb-3">Ticked items are pre-selected for students. They can still untick them.</p>
            <div className="space-y-2">
              {f.pricing.map((r, i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_96px_auto] gap-2 items-center">
                  <input type="checkbox" checked={!!r.included} onChange={(e) => setRow(i, "included", e.target.checked)} className="w-4 h-4 accent-ink" title="Pre-selected" />
                  <input value={r.name} onChange={(e) => setRow(i, "name", e.target.value)} placeholder="Work item" className={`${input} mt-0 py-2`} />
                  <input type="number" min="0" step="50" value={r.price} onChange={(e) => setRow(i, "price", e.target.value)} className={`${input} mt-0 py-2`} />
                  <button type="button" onClick={() => setF((o) => ({ ...o, pricing: o.pricing.filter((_, j) => j !== i) }))}
                    className="grid place-items-center w-9 h-9 rounded-lg bg-red-50 text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <p className="text-right text-sm text-mute mt-3">Pre-selected total: <b className="num text-lg text-ink">{inr(total)}</b></p>
          </div>

          <div className="grid sm:grid-cols-3 gap-x-3 items-center">
            <label className={lbl}>Display order<input type="number" min="1" value={f.order} onChange={set("order")} className={input} /></label>
            <label className="flex items-center gap-2 text-sm font-bold mb-4"><input type="checkbox" checked={f.featured} onChange={set("featured")} className="w-4 h-4 accent-ink" /><Flame className="w-4 h-4 text-tang" />Hot pick</label>
            <label className="flex items-center gap-2 text-sm font-bold mb-4"><input type="checkbox" checked={f.published} onChange={set("published")} className="w-4 h-4 accent-ink" />{f.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}Visible on site</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] border-t border-ink bg-white">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-ink/25 font-bold">Cancel</button>
          <button disabled={busy} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-white font-bold shadow-[3px_3px_0_#FFE14D] disabled:opacity-60"><Save className="w-4 h-4" />{busy ? "Saving…" : "Save project"}</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function Settings({ api, say }) {
  const [s, setS] = useState(null);
  useEffect(() => { api("/api/admin/settings").then((d) => setS({ ...d, paymentTerms: (d.paymentTerms || []).join("\n"), testimonials: d.testimonials || [] })).catch((e) => say(e.message)); }, []);
  if (!s) return <div className="h-40 rounded-2xl bg-paper-2 animate-pulse" />;
  const set = (k) => (e) => setS((o) => ({ ...o, [k]: e.target.value }));
  const setT = (i, k, v) => setS((o) => ({ ...o, testimonials: o.testimonials.map((t, j) => (j === i ? { ...t, [k]: v } : t)) }));

  async function save(e) {
    e.preventDefault();
    try { await api("/api/admin/settings", { method: "PUT", body: s }); say("Settings saved"); } catch (err) { say(err.message); }
  }
  return (
    <form onSubmit={save} className="max-w-3xl">
      <h1 className="font-pixel text-4xl md:text-5xl leading-none mb-1">PAYMENT & SETTINGS</h1>
      <p className="text-mute text-sm mb-6">Shown on the home page and used by every WhatsApp button.</p>
      <div className="bg-white border border-ink/20 rounded-2xl p-5 mb-6">
        <div className="grid sm:grid-cols-2 gap-x-4">
          <label className={lbl}>Website name<input required value={s.siteName} onChange={set("siteName")} className={input} /></label>
          <label className={lbl}>WhatsApp number (with 91)<input required inputMode="numeric" value={s.whatsapp} onChange={set("whatsapp")} className={input} /></label>
        </div>
        <label className={lbl}>UPI ID <span className="font-normal text-mute">(optional, shown with a copy button)</span><input value={s.upiId} onChange={set("upiId")} placeholder="yourname@okaxis" className={input} /></label>
        <label className={lbl}>Payment terms <span className="font-normal text-mute">(one per line, shown on the receipt card)</span><textarea rows={6} value={s.paymentTerms} onChange={set("paymentTerms")} className={input} /></label>
      </div>

      <div className="bg-white border border-ink/20 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-pixel text-2xl">TESTIMONIALS</h2>
          <button type="button" onClick={() => setS((o) => ({ ...o, testimonials: [...o.testimonials, { name: "", college: "", project: "", text: "", photo: "" }] }))}
            className="flex items-center gap-1 text-sm font-bold border border-ink/25 rounded-lg px-2.5 py-1.5 hover:border-ink"><Plus className="w-4 h-4" />Add</button>
        </div>
        <p className="text-xs text-mute mb-4">Add real reviews from students you've worked with. The section stays hidden until you add at least one.</p>
        <div className="space-y-4">
          {s.testimonials.map((t, i) => (
            <div key={i} className="border border-ink/15 rounded-xl p-4 relative">
              <button type="button" onClick={() => setS((o) => ({ ...o, testimonials: o.testimonials.filter((_, j) => j !== i) }))}
                className="absolute right-3 top-3 grid place-items-center w-8 h-8 rounded-lg bg-red-50 text-red-700"><Trash2 className="w-4 h-4" /></button>
              <div className="grid sm:grid-cols-3 gap-x-3 pr-10">
                <label className={lbl}>Name<input value={t.name} onChange={(e) => setT(i, "name", e.target.value)} className={input} /></label>
                <label className={lbl}>College<input value={t.college} onChange={(e) => setT(i, "college", e.target.value)} className={input} /></label>
                <label className={lbl}>Project<input value={t.project} onChange={(e) => setT(i, "project", e.target.value)} className={input} /></label>
              </div>
              <label className={lbl}>What they said<textarea rows={2} value={t.text} onChange={(e) => setT(i, "text", e.target.value)} className={input} /></label>
              <div className="text-[13px] font-bold text-ink-2">Photo (optional)<div className="mt-1.5"><ImagePicker small api={api} say={say} value={t.photo} onChange={(v) => setT(i, "photo", v)} /></div></div>
            </div>
          ))}
        </div>
      </div>
      <button className="flex items-center gap-2 bg-ink text-white font-bold rounded-xl px-5 py-3 shadow-[3px_3px_0_#FFE14D]"><Save className="w-4 h-4" />Save settings</button>
    </form>
  );
}