"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";

export interface TourStep {
  /** [data-tour="VALUE"] selector. If absent, shows a centered modal. */
  target?: string;
  title: string;
  body: string;
}

interface Props {
  steps: TourStep[];
  onDone: () => void;
}

const PAD = 10;
const TIP_W = 308;

type Rect = { top: number; left: number; width: number; height: number };

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function useWindowSize() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const set = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
  return size;
}

export function Tour({ steps, onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const { w: vw, h: vh } = useWindowSize();

  const step = steps[idx];

  const measure = useCallback(() => {
    if (!step?.target) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step?.target]);

  useEffect(() => {
    if (!step?.target) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(measure, 380);
    return () => clearTimeout(t);
  }, [idx, step?.target, measure]);

  useEffect(() => {
    window.addEventListener("scroll", measure, { passive: true });
    return () => window.removeEventListener("scroll", measure);
  }, [measure]);

  // Block body scroll while tour is active
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function next() {
    if (idx < steps.length - 1) setIdx((i) => i + 1);
    else onDone();
  }

  const isLast = idx === steps.length - 1;

  // ── Tooltip positioning ──────────────────────────────────────────────────
  const tooltipStyle = (() => {
    if (!rect || !vw) {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 10000,
        width: TIP_W,
        maxWidth: "calc(100vw - 32px)",
      };
    }

    const spBottom = rect.top + rect.height + PAD;
    const spTop = rect.top - PAD;
    const left = clamp(rect.left - PAD, 16, vw - TIP_W - 16);

    // Tall element (fills most of viewport) — center the tooltip
    if (rect.height > vh * 0.5) {
      return {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 10000,
        width: TIP_W,
        maxWidth: "calc(100vw - 32px)",
      };
    }

    // Prefer below the element
    if (spBottom + 200 < vh) {
      return { position: "fixed" as const, top: spBottom + 14, left, zIndex: 10000, width: TIP_W };
    }

    // Try above the element (estimated tooltip height ~212px)
    if (spTop > 212) {
      return { position: "fixed" as const, top: spTop - 212, left, zIndex: 10000, width: TIP_W };
    }

    // Fallback: clamp into visible area below
    return {
      position: "fixed" as const,
      top: clamp(spBottom + 14, 16, vh - 216),
      left,
      zIndex: 10000,
      width: TIP_W,
    };
  })();

  // ── Spotlight box coords ─────────────────────────────────────────────────
  const spot = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  return (
    <>
      {/* Full-screen click-blocker */}
      <div
        className="fixed inset-0 z-[9996]"
        style={{ cursor: "default" }}
        onClick={onDone}
      />

      {/* Dark overlay around spotlight — box-shadow trick */}
      {spot ? (
        <div
          style={{
            position: "fixed",
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            borderRadius: 14,
            boxShadow: "0 0 0 9999px rgba(2,6,23,0.78)",
            border: "2px solid rgba(245,158,11,0.55)",
            zIndex: 9997,
            pointerEvents: "none",
            transition: "top 0.28s ease, left 0.28s ease, width 0.28s ease, height 0.28s ease",
          }}
        >
          {/* Pulsing ring */}
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: 18,
              border: "2px solid rgba(245,158,11,0.3)",
              animation: "tour-pulse 1.8s ease-in-out infinite",
            }}
          />
        </div>
      ) : (
        /* No target: plain dark overlay */
        <div className="fixed inset-0 z-[9997] bg-slate-950/75" />
      )}

      {/* Tooltip card */}
      <div
        style={{ ...tooltipStyle, pointerEvents: "all" }}
        className="rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/70 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 mb-1 block">
              {idx + 1} / {steps.length}
            </span>
            <h3 className="font-bold text-slate-50 text-[15px] leading-snug">{step.title}</h3>
          </div>
          <button
            type="button"
            onClick={onDone}
            className="shrink-0 mt-0.5 rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
            aria-label="Close tour"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-slate-400 leading-relaxed mb-5">{step.body}</p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          {/* Progress dots */}
          <div className="flex gap-1.5 items-center">
            {steps.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === idx ? 18 : 6,
                  height: 6,
                  background: i === idx ? "#f59e0b" : "#334155",
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isLast && (
              <button
                type="button"
                onClick={onDone}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              {isLast ? "Done!" : "Next"}
              {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tour-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.03); }
        }
      `}</style>
    </>
  );
}
