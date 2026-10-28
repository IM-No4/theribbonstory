import { Link } from "react-router-dom";

export function LogoMark({ to = "/", size = "compact", light = false, showTagline = true, className = "" }) {
  if (size === "compact") {
    return (
      <Link
        to={to}
        className={`inline-flex items-center gap-2 sm:gap-3 select-none group py-0.5 min-w-0 ${className}`}
        title="The Ribbon Story - Bespoke 3D Keepsakes"
      >
        <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/90 p-1 border border-stone-200/80 shadow-xs flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 shrink-0">
          <img
            src="/logo.png"
            alt="The Ribbon Story"
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>
        <div className="flex flex-col text-left leading-none min-w-0">
          <span
            className={`font-serif text-[13px] sm:text-[16px] font-bold tracking-[0.06em] sm:tracking-[0.12em] uppercase transition-colors truncate ${
              light
                ? "text-white group-hover:text-rose-300"
                : "text-stone-900 group-hover:text-rose-600"
            }`}
          >
            The Ribbon Story
          </span>
          {showTagline && (
            <span
              className={`text-[7.5px] sm:text-[9.5px] font-semibold tracking-[0.12em] sm:tracking-[0.2em] uppercase mt-0.5 sm:mt-1 truncate ${
                light ? "text-rose-200/70" : "text-stone-400"
              }`}
            >
              3D Keepsake Atelier
            </span>
          )}
        </div>
      </Link>
    );
  }

  // Full / Prominent Size
  return (
    <Link
      to={to}
      className={`inline-flex flex-col items-center select-none group ${className}`}
      title="The Ribbon Story - Every Gift Tells a Story"
    >
      {light ? (
        <div className="rounded-3xl bg-white/95 shadow-soft border border-blush-200 p-4 sm:p-6 transition-transform duration-300 group-hover:scale-105">
          <img
            src="/logo.png"
            alt="The Ribbon Story - Every Gift Tells a Story"
            className="w-48 sm:w-60 md:w-72 h-auto object-contain"
            draggable={false}
          />
        </div>
      ) : (
        <img
          src="/logo.png"
          alt="The Ribbon Story - Every Gift Tells a Story"
          className="w-48 sm:w-60 md:w-72 h-auto object-contain transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
      )}
    </Link>
  );
}

export default LogoMark;
