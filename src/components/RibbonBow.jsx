export default function RibbonBow({ className = "", light = false }) {
  const dark = light ? "#f3d9dc" : "#722f3d";
  const mid = light ? "#e6b3ba" : "#a83f52";
  const knot = light ? "#fbf0f1" : "#5c2632";

  return (
    <svg viewBox="0 0 220 130" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* left tail */}
      <path
        d="M104 58 C86 78 58 84 46 118 C42 128 54 130 60 122 C72 104 90 84 108 66 Z"
        fill={dark}
      />
      {/* right tail */}
      <path
        d="M116 58 C134 78 162 84 174 118 C178 128 166 130 160 122 C148 104 130 84 112 66 Z"
        fill={mid}
      />
      {/* left loop */}
      <path
        d="M108 62 C88 34 44 24 20 40 C-2 55 10 78 40 78 C64 78 90 70 108 62 Z"
        fill={mid}
      />
      {/* right loop */}
      <path
        d="M112 62 C132 34 176 24 200 40 C222 55 210 78 180 78 C156 78 130 70 112 62 Z"
        fill={dark}
      />
      {/* left loop highlight */}
      <path
        d="M104 60 C88 40 54 32 32 44 C18 52 22 66 42 66 C62 66 86 64 104 60 Z"
        fill={mid}
        opacity="0.55"
      />
      {/* right loop highlight */}
      <path
        d="M116 60 C132 40 166 32 188 44 C202 52 198 66 178 66 C158 66 134 64 116 60 Z"
        fill={dark}
        opacity="0.4"
      />
      {/* knot */}
      <ellipse cx="110" cy="62" rx="13" ry="16" fill={knot} />
    </svg>
  );
}
