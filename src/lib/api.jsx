import { createContext, useContext, useEffect, useState } from "react";

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Request failed");
  return r.json();
}

export const packagePrice = (p) => {
  const inc = (p.pricing || []).filter((r) => r.included).reduce((s, r) => s + r.price, 0);
  return inc || Math.min(...(p.pricing?.length ? p.pricing : [{ price: 0 }]).map((r) => r.price));
};

export function waLink(number, text) {
  let num = String(number || "").replace(/\D/g, "");
  if (num.length === 10) num = "91" + num;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

// colour pairs used for stickers / tags, picked by category name
const PALETTE = [
  { bg: "bg-sun", soft: "bg-sun-2", tape: "rgba(255,225,77,.8)", pin: "#F2B705" },
  { bg: "bg-bubble", soft: "bg-bubble-2", tape: "rgba(255,179,207,.85)", pin: "#FF4D8D" },
  { bg: "bg-sky-2", soft: "bg-sky-2", tape: "rgba(205,214,255,.9)", pin: "#3D5AFE" },
  { bg: "bg-mint", soft: "bg-mint-2", tape: "rgba(142,227,166,.85)", pin: "#18A957" },
  { bg: "bg-lilac", soft: "bg-lilac-2", tape: "rgba(205,184,255,.85)", pin: "#7C4DFF" }
];
export function tone(key = "") {
  let h = 0;
  for (const c of String(key)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
export const toneAt = (i) => PALETTE[i % PALETTE.length];

const DEFAULTS = { siteName: "AI ProjectHub", whatsapp: "918610789126", upiId: "", paymentTerms: [], heroNote: "", testimonials: [] };
const SettingsCtx = createContext(DEFAULTS);
export function SettingsProvider({ children }) {
  const [s, setS] = useState(DEFAULTS);
  useEffect(() => { getJSON("/api/settings").then((d) => setS({ ...DEFAULTS, ...d })).catch(() => {}); }, []);
  return <SettingsCtx.Provider value={s}>{children}</SettingsCtx.Provider>;
}
export const useSettings = () => useContext(SettingsCtx);
