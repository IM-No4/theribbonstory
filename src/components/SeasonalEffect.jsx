import { useMemo } from "react";

const EFFECTS = {
  snow: { glyph: "❄", color: "#e0f2fe", shadow: "0 0 4px rgba(71,85,105,0.55)", fall: true },
  hearts: { glyph: "♥", color: "#fb7185", shadow: "0 0 4px rgba(190,18,60,0.35)", fall: true },
  sparkles: { glyph: "✦", color: "#fbbf24", shadow: "0 0 6px rgba(217,119,6,0.6)", fall: false },
};

export const EFFECT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "snow", label: "Falling snow" },
  { value: "hearts", label: "Floating hearts" },
  { value: "sparkles", label: "Twinkling sparkles" },
];

// Light, decorative particles over the page. Pure CSS animation, no canvas.
export default function SeasonalEffect({ effect }) {
  const config = EFFECTS[effect];
  const particles = useMemo(() => {
    const count = typeof window !== "undefined" && window.innerWidth < 640 ? 14 : 26;
    // Deterministic spread so the layout is stable between renders
    return Array.from({ length: count }, (_, i) => {
      const r = (n) => {
        const x = Math.sin((i + 1) * 9301 + n * 49297) * 233280;
        return x - Math.floor(x);
      };
      return {
        id: i,
        left: r(1) * 100,
        size: 10 + r(2) * 14,
        duration: 9 + r(3) * 9,
        delay: -r(4) * 18,
        sway: 14 + r(5) * 26,
        opacity: 0.55 + r(6) * 0.4,
      };
    });
  }, []);

  if (!config) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden motion-reduce:hidden" aria-hidden="true">
      <style>{`
        @keyframes trs-fall { from { transform: translateY(-8vh); } to { transform: translateY(108vh); } }
        @keyframes trs-rise { from { transform: translateY(108vh); } to { transform: translateY(-8vh); } }
        @keyframes trs-sway { 0%,100% { transform: translateX(calc(var(--sway) * -1)); } 50% { transform: translateX(var(--sway)); } }
        @keyframes trs-twinkle { 0%,100% { opacity: 0; transform: scale(0.4); } 50% { opacity: 1; transform: scale(1); } }
      `}</style>
      {particles.map((p) =>
        config.fall ? (
          <span
            key={p.id}
            className="absolute top-0 block"
            style={{
              left: `${p.left}%`,
              animation: `${effect === "hearts" ? "trs-rise" : "trs-fall"} ${p.duration}s linear ${p.delay}s infinite`,
            }}
          >
            <span
              className="block"
              style={{
                "--sway": `${p.sway}px`,
                fontSize: p.size,
                color: config.color,
                textShadow: config.shadow,
                opacity: p.opacity,
                animation: `trs-sway ${p.duration / 2.2}s ease-in-out ${p.delay}s infinite`,
              }}
            >
              {config.glyph}
            </span>
          </span>
        ) : (
          <span
            key={p.id}
            className="absolute block"
            style={{
              left: `${p.left}%`,
              top: `${(p.delay / -18) * 100}%`,
              fontSize: p.size,
              color: config.color,
              textShadow: config.shadow,
              animation: `trs-twinkle ${2 + (p.duration % 3)}s ease-in-out ${p.delay}s infinite`,
            }}
          >
            {config.glyph}
          </span>
        )
      )}
    </div>
  );
}
