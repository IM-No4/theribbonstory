import { Link } from "react-router-dom";

export function LogoMark({ to = "/", size = "compact", light = false, className = "" }) {
  if (size === "compact") {
    if (light) {
      return (
        <Link
          to={to}
          className={`inline-flex items-center select-none group rounded-2xl bg-white/95 p-2 border border-blush-100 shadow-xs hover:shadow-sm transition-all duration-300 ${className}`}
          title="The Ribbon Story - Every Gift Tells a Story"
        >
          <img
            src="/logo.png"
            alt="The Ribbon Story - Every Gift Tells a Story"
            className="h-14 sm:h-16 md:h-18 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
            draggable={false}
          />
        </Link>
      );
    }

    return (
      <Link
        to={to}
        className={`inline-flex items-center select-none group py-0.5 ${className}`}
        title="The Ribbon Story - Every Gift Tells a Story"
      >
        <img
          src="/logo.png"
          alt="The Ribbon Story - Every Gift Tells a Story"
          className="h-14 sm:h-16 md:h-20 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
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
