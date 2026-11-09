import { useState } from "react";
import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import { MousePointer2, ImageOff } from "lucide-react";
import { useSettings, waLink } from "../lib/api.jsx";

export function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.98 1-3.63-.24-.37A9.82 9.82 0 0 1 2.2 12C2.2 6.57 6.62 2.15 12.06 2.15c2.63 0 5.1 1.03 6.96 2.89a9.78 9.78 0 0 1 2.88 6.96c0 5.43-4.42 9.8-9.85 9.8zm8.38-18.18A11.76 11.76 0 0 0 12.05.15C5.52.15.2 5.47.2 12c0 2.09.55 4.13 1.59 5.93L.1 24l6.22-1.63A11.86 11.86 0 0 0 12.04 23.85h.01c6.53 0 11.85-5.32 11.85-11.85 0-3.17-1.23-6.14-3.47-8.38z" />
    </svg>
  );
}

/** Image with a graceful paper-style fallback if the URL fails. */
export function SafeImg({ src, alt = "", className = "", label }) {
  const [bad, setBad] = useState(!src);
  if (bad)
    return (
      <div className={`grid place-items-center bg-paper-2 text-mute ${className}`} role="img" aria-label={alt}>
        <div className="flex flex-col items-center gap-1 px-3 text-center">
          <ImageOff className="w-6 h-6 opacity-50" />
          {label && <span className="font-pixel text-sm text-ink-2">{label}</span>}
        </div>
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)} className={`object-cover ${className}`} />;
}

export const Tape = ({ className = "", color, style }) => (
  <span aria-hidden className={`tape ${className}`} style={{ ...(color ? { background: color } : {}), ...style }} />
);
export const Pin = ({ color = "#FF6A3D", className = "" }) => (
  <span aria-hidden className={`pin ${className}`} style={{ "--pin": color }} />
);

export function Polaroid({ src, alt, caption, rotate = -3, tape, className = "", imgClass = "aspect-[4/5]" }) {
  return (
    <motion.figure
      whileHover={{ rotate: 0, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      style={{ rotate }}
      className={`relative bg-white p-2.5 pb-3 shadow-paper ${className}`}
    >
      <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" color={tape} />
      <SafeImg src={src} alt={alt} className={`w-full ${imgClass}`} />
      {caption && <figcaption className="font-hand text-lg leading-tight text-ink-2 mt-2 text-center">{caption}</figcaption>}
    </motion.figure>
  );
}

/** Speech-bubble sticker with optional cursor, like a Figma comment. */
export function Sticker({ children, className = "", tone = "bg-white", cursor = false, tail = "bottom", float = 0 }) {
  return (
    <motion.div
      animate={float ? { y: [0, -float, 0] } : undefined}
      transition={float ? { duration: 4 + float / 3, repeat: Infinity, ease: "easeInOut" } : undefined}
      className={`absolute z-10 ${className}`}
    >
      <div className={`relative ${tone} border border-ink/80 rounded-xl px-3 py-1.5 text-[13px] font-semibold leading-tight shadow-[2px_2px_0_#111]`}>
        {children}
        {tail === "bottom" && <span className={`absolute -bottom-[7px] left-5 w-3 h-3 rotate-45 border-r border-b border-ink/80 ${tone}`} />}
        {tail === "top" && <span className={`absolute -top-[7px] left-5 w-3 h-3 rotate-45 border-l border-t border-ink/80 ${tone}`} />}
      </div>
      {cursor && <MousePointer2 className="absolute -right-3 -bottom-4 w-6 h-6 fill-white text-ink" strokeWidth={1.5} />}
    </motion.div>
  );
}

export function Reveal({ children, delay = 0, className = "", y = 18 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Label({ children, className = "" }) {
  return <span className={`inline-flex items-center gap-2 font-pixel text-[13px] uppercase tracking-wider ${className}`}>{children}</span>;
}

export function Nav() {
  const s = useSettings();
  const links = [
    { to: "/#projects", label: "Projects", dot: "bg-sun" },
    { to: "/#process", label: "Process", dot: "bg-bubble" },
    { to: "/#pricing", label: "Payment", dot: "bg-mint" },
    { to: "/#faq", label: "FAQ", dot: "bg-lilac" }
  ];
  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      <nav className="mx-auto max-w-6xl flex items-center justify-between gap-2 bg-white/90 backdrop-blur border border-ink rounded-2xl px-2 py-2 shadow-[3px_3px_0_#111]">
        <Link to="/" className="flex items-center gap-2 pl-1.5 pr-2">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-ink text-sun font-pixel text-sm">AI</span>
          <span className="font-pixel text-lg leading-none">{s.siteName}</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l.label} href={l.to} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-paper transition">
              <span className={`w-2 h-2 rounded-full ${l.dot} ring-1 ring-ink`} />
              {l.label}
            </a>
          ))}
        </div>
        <a
          href={waLink(s.whatsapp, `Hi! I found ${s.siteName}. I have a question about an AI project.`)}
          target="_blank" rel="noopener"
          className="flex items-center gap-2 bg-ink text-white rounded-xl px-3.5 py-2 text-sm font-bold hover:bg-wa-2 transition"
        >
          <WhatsAppIcon className="w-4 h-4" /> <span className="hidden sm:inline">Contact</span><span className="sm:hidden">Chat</span>
        </a>
      </nav>
    </header>
  );
}

export function Footer() {
  const s = useSettings();
  return (
    <footer className="mt-24 border-t border-ink bg-ink text-white/70">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col md:flex-row gap-6 md:items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-sun text-ink font-pixel text-sm">AI</span>
          <span className="font-pixel text-lg text-white">{s.siteName}</span>
        </div>
        <p className="font-hand text-xl text-white/80">Built by a freelancer who actually replies on WhatsApp.</p>
        <p>© {new Date().getFullYear()} {s.siteName}</p>
      </div>
    </footer>
  );
}

export function FloatingWA({ className = "" }) {
  const s = useSettings();
  return (
    <motion.a
      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: "spring" }}
      whileHover={{ scale: 1.08, rotate: -6 }}
      href={waLink(s.whatsapp, `Hi! I found ${s.siteName}. I have a question about an AI project.`)}
      target="_blank" rel="noopener" aria-label="Chat on WhatsApp"
      className={`fixed right-4 bottom-4 z-40 grid place-items-center w-14 h-14 rounded-full bg-wa text-white border-2 border-ink shadow-[3px_3px_0_#111] ${className}`}
    >
      <WhatsAppIcon className="w-7 h-7" />
    </motion.a>
  );
}
