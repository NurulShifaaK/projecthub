import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Flame } from "lucide-react";
import { SafeImg, Tape } from "./ui.jsx";
import { inr, packagePrice, tone } from "../lib/api.jsx";

const shortTitle = (t) => String(t).split("–")[0].trim();
const subTitle = (t) => (String(t).includes("–") ? String(t).split("–").slice(1).join("–").trim() : "");

export { shortTitle, subTitle };

export default function ProjectCard({ p, index }) {
  const t = tone(p.category);
  const tilt = [-1.2, 0.8, -0.6, 1.1][index % 4];
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, rotate: tilt }}
      className="group relative bg-white border border-ink rounded-2xl shadow-paper hover:shadow-[6px_6px_0_#111] transition-shadow"
    >
      <Tape className="-top-3 left-6 -rotate-6" color={t.tape} />
      <div className="relative m-3 mb-0 overflow-hidden rounded-xl border border-ink/10">
        <SafeImg src={p.image} alt={p.title} label={shortTitle(p.title)} className="w-full aspect-[16/10] group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute left-2.5 top-2.5 bg-white/95 border border-ink rounded-md px-2 py-0.5 num text-[11px]">
          No. {String(index + 1).padStart(2, "0")}
        </span>
        {p.featured && (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 bg-tang text-white border border-ink rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            <Flame className="w-3 h-3" /> Hot pick
          </span>
        )}
      </div>

      <div className="p-4 pb-3">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`${t.soft} border border-ink/70 rounded-md px-2 py-0.5 text-[11.5px] font-bold`}>{p.category}</span>
          <span className="bg-paper border border-ink/30 rounded-md px-2 py-0.5 text-[11.5px] font-semibold text-ink-2">{p.difficulty}</span>
        </div>
        <h3 className="font-pixel text-[22px] leading-none">{shortTitle(p.title)}</h3>
        <p className="mt-1.5 text-[14.5px] font-semibold leading-snug text-ink-2">{subTitle(p.title) || p.tagline}</p>
        {p.quip && <p className="font-hand text-[19px] leading-tight text-sky mt-2">“{p.quip}”</p>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-dashed border-ink/25 px-4 py-3">
        <div className="leading-tight">
          <span className="block text-[10.5px] uppercase tracking-wider font-bold text-mute">Full package</span>
          <span className="num text-xl">{inr(packagePrice(p))}</span>
        </div>
        <Link
          to={`/project/${encodeURIComponent(p.slug)}`}
          className="flex items-center gap-1 bg-ink text-white rounded-lg pl-3 pr-2 py-2 text-sm font-bold group-hover:bg-sky transition-colors after:absolute after:inset-0 after:content-['']"
        >
          Details <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  );
}
