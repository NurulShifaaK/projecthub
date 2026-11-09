// AI ProjectHub – showcase website for AI college projects
// Run: npm install && npm start  → http://localhost:3000
// Admin panel: http://localhost:3000/admin-side-data

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";
const ADMIN_PATH = "/admin-side-data";

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const DIST_DIR = path.join(__dirname, "dist");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const DEFAULT_SETTINGS = {
  siteName: "AI ProjectHub",
  whatsapp: "918610789126",
  upiId: "",
  paymentTerms: [
    "Pay 50% advance to start the project, balance 50% after you see the working demo.",
    "Pay only for what you need — pick the deliverables on each project page.",
    "UPI, Google Pay, PhonePe, Paytm and bank transfer accepted.",
    "Small changes after delivery are free. Big new features are quoted separately."
  ],
  heroNote: "Code, research paper, PPT, report, deployment and viva prep. All of it.",
  testimonials: []
};

// ---------- tiny JSON "database" ----------
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}
function writeJSON(file, data) {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}
if (!fs.existsSync(PROJECTS_FILE)) writeJSON(PROJECTS_FILE, require("./data/seed-projects"));
if (!fs.existsSync(SETTINGS_FILE)) writeJSON(SETTINGS_FILE, DEFAULT_SETTINGS);

const getProjects = () => readJSON(PROJECTS_FILE, []).sort((a, b) => (a.order || 0) - (b.order || 0));
const getSettings = () => ({ ...DEFAULT_SETTINGS, ...readJSON(SETTINGS_FILE, {}) });

// ---------- helpers ----------
const slugify = (s) =>
  String(s || "").toLowerCase().replace(/–.*$/, "").trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project";
const str = (v, max = 2000) => String(v ?? "").trim().slice(0, max);
const list = (v, max = 30) =>
  (Array.isArray(v) ? v : String(v || "").split("\n")).map((x) => str(x, 300)).filter(Boolean).slice(0, max);

function cleanProject(body, existing = {}) {
  const pricing = (Array.isArray(body.pricing) ? body.pricing : [])
    .map((r) => ({ name: str(r.name, 150), price: Math.max(0, Math.round(Number(r.price) || 0)), included: !!r.included }))
    .filter((r) => r.name)
    .slice(0, 20);
  return {
    ...existing,
    title: str(body.title, 160),
    tagline: str(body.tagline, 240),
    image: str(body.image, 600),
    quip: str(body.quip, 160),
    category: str(body.category, 60) || "AI Project",
    description: str(body.description, 3000),
    problem: str(body.problem, 2000),
    features: list(body.features),
    useCases: list(body.useCases),
    techStack: list(Array.isArray(body.techStack) ? body.techStack : String(body.techStack || "").split(",")),
    difficulty: str(body.difficulty, 30) || "Intermediate",
    duration: str(body.duration, 40),
    featured: !!body.featured,
    published: body.published !== false,
    order: Number(body.order) || existing.order || 999,
    pricing
  };
}

// ---------- auth (simple bearer token, kept in memory) ----------
const sessions = new Map(); // token -> expiry
const SESSION_MS = 12 * 60 * 60 * 1000;
const loginAttempts = new Map(); // ip -> {count, until}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const exp = sessions.get(token);
  if (!token || !exp || exp < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: "Please log in again." });
  }
  next();
}
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// ---------- app ----------
app.use(express.json({ limit: "8mb" }));
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "30d" }));
app.use(express.static(DIST_DIR, { index: false, maxAge: "1h" }));

// Public API
app.get("/api/settings", (req, res) => {
  const { siteName, whatsapp, upiId, paymentTerms, heroNote, testimonials } = getSettings();
  res.json({ siteName, whatsapp, upiId, paymentTerms, heroNote, testimonials });
});
app.get("/api/projects", (req, res) => res.json(getProjects().filter((p) => p.published)));
app.get("/api/projects/:slug", (req, res) => {
  const p = getProjects().find((x) => x.published && (x.slug === req.params.slug || x.id === req.params.slug));
  p ? res.json(p) : res.status(404).json({ error: "Project not found" });
});

// Admin API
app.post("/api/admin/login", (req, res) => {
  const ip = req.ip;
  const att = loginAttempts.get(ip) || { count: 0, until: 0 };
  if (att.until > Date.now()) return res.status(429).json({ error: "Too many attempts. Try again in a few minutes." });
  const { email, password } = req.body || {};
  if (safeEqual(String(email || "").toLowerCase().trim(), ADMIN_EMAIL.toLowerCase()) && safeEqual(password || "", ADMIN_PASSWORD)) {
    loginAttempts.delete(ip);
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + SESSION_MS);
    return res.json({ token });
  }
  att.count++;
  if (att.count >= 8) { att.until = Date.now() + 10 * 60 * 1000; att.count = 0; }
  loginAttempts.set(ip, att);
  res.status(401).json({ error: "Wrong email or password." });
});
app.post("/api/admin/logout", requireAdmin, (req, res) => {
  sessions.delete((req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
  res.json({ ok: true });
});
app.get("/api/admin/projects", requireAdmin, (req, res) => res.json(getProjects()));
app.post("/api/admin/projects", requireAdmin, (req, res) => {
  const projects = getProjects();
  const p = cleanProject(req.body);
  if (!p.title) return res.status(400).json({ error: "Title is required." });
  p.id = crypto.randomBytes(6).toString("hex");
  let slug = slugify(p.title), n = 2;
  while (projects.some((x) => x.slug === slug)) slug = `${slugify(p.title)}-${n++}`;
  p.slug = slug;
  if (!req.body.order) p.order = Math.max(0, ...projects.map((x) => x.order || 0)) + 1;
  projects.push(p);
  writeJSON(PROJECTS_FILE, projects);
  res.json(p);
});
app.put("/api/admin/projects/:id", requireAdmin, (req, res) => {
  const projects = getProjects();
  const i = projects.findIndex((x) => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "Not found" });
  const p = cleanProject(req.body, projects[i]);
  if (!p.title) return res.status(400).json({ error: "Title is required." });
  projects[i] = p;
  writeJSON(PROJECTS_FILE, projects);
  res.json(p);
});
app.delete("/api/admin/projects/:id", requireAdmin, (req, res) => {
  const projects = getProjects();
  const next = projects.filter((x) => x.id !== req.params.id);
  if (next.length === projects.length) return res.status(404).json({ error: "Not found" });
  writeJSON(PROJECTS_FILE, next);
  res.json({ ok: true });
});
app.get("/api/admin/settings", requireAdmin, (req, res) => res.json(getSettings()));
app.put("/api/admin/settings", requireAdmin, (req, res) => {
  const b = req.body || {};
  const s = {
    siteName: str(b.siteName, 60) || DEFAULT_SETTINGS.siteName,
    whatsapp: str(b.whatsapp, 20).replace(/\D/g, "") || DEFAULT_SETTINGS.whatsapp,
    upiId: str(b.upiId, 80),
    paymentTerms: list(b.paymentTerms, 15),
    heroNote: str(b.heroNote, 160),
    testimonials: (Array.isArray(b.testimonials) ? b.testimonials : [])
      .map((t) => ({ name: str(t.name, 60), college: str(t.college, 100), project: str(t.project, 120), text: str(t.text, 600), photo: str(t.photo, 600) }))
      .filter((t) => t.name && t.text)
      .slice(0, 30)
  };
  writeJSON(SETTINGS_FILE, s);
  res.json(s);
});

// Image upload (admin) – accepts a base64 data URL, saves to data/uploads
app.post("/api/admin/upload", requireAdmin, (req, res) => {
  const m = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/i.exec(String(req.body?.dataUrl || ""));
  if (!m) return res.status(400).json({ error: "Please upload a PNG, JPG, WEBP or GIF image." });
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 5 * 1024 * 1024) return res.status(400).json({ error: "Image must be under 5 MB." });
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${m[1].toLowerCase().replace("jpeg", "jpg")}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  res.json({ url: `/uploads/${name}` });
});

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// React app (home, /project/:slug and the hidden admin page at /admin-side-data)
app.get("*", (req, res) => {
  const index = path.join(DIST_DIR, "index.html");
  if (fs.existsSync(index)) return res.sendFile(index);
  res.status(500).send("Frontend not built yet. Run: npm run build");
});

app.listen(PORT, () => {
  console.log(`\n  AI ProjectHub running →  http://localhost:${PORT}`);
  console.log(`  Admin panel          →  http://localhost:${PORT}${ADMIN_PATH}\n`);
});
