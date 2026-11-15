export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="YobbuGo"
    >
      {/* Étoile bicolore */}
      <path
        d="M50 5 L61 38 L95 38 L68 58 L79 92 L50 72 L21 92 L32 58 L5 38 L39 38 Z"
        fill="#14b8a6"
      />
      <path
        d="M50 5 L61 38 L95 38 L68 58 L79 92 L50 72 L50 5 Z"
        fill="#f5c65d"
      />
      {/* Colis */}
      <rect x="38" y="42" width="24" height="18" rx="2" fill="white" />
      <path d="M38 48 L50 54 L62 48" stroke="#14b8a6" strokeWidth="2" fill="none" />
      <line x1="50" y1="42" x2="50" y2="54" stroke="#14b8a6" strokeWidth="2" />
    </svg>
  );
}
