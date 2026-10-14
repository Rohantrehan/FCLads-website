/** The FC Lads shield (web/public/logo-shield.svg), used as the Studio's workspace icon. */
export function Logo() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-label="FC Lads" role="img">
      <defs>
        <linearGradient id="fcl-shield" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2BD98B" />
          <stop offset="50%" stopColor="#0E2A22" />
          <stop offset="100%" stopColor="#07090D" />
        </linearGradient>
        <linearGradient id="fcl-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8FF0C9" />
          <stop offset="100%" stopColor="#1E8BFF" />
        </linearGradient>
      </defs>
      <path
        d="M50 8 L85 22 L85 58 C85 76 50 94 50 94 C50 94 15 76 15 58 L15 22 Z"
        fill="url(#fcl-shield)"
        stroke="url(#fcl-glow)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <text x="50" y="62" fontFamily="Impact, sans-serif" fontWeight="900" fontSize="26" fill="#FFFFFF" textAnchor="middle">
        FCL
      </text>
    </svg>
  );
}
