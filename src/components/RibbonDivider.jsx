export default function RibbonDivider({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400" />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 15 C2 10 2 3 7 3 C9 3 9 6 9 6 C9 6 9 3 11 3 C16 3 16 10 9 15 Z"
          fill="#c25f6f"
        />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400" />
    </div>
  );
}
