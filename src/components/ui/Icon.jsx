// Thin line icons (1.5px stroke, Lucide-style) — design.md §5
const PATHS = {
  bag: <><path d="M6 7h12l1 14H5L6 7z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 12l5 5 9-10" />,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  fish: <><path d="M2 12c3-5 8-7 13-5 2 .8 3.5 2.5 4.5 5-1 2.5-2.5 4.2-4.5 5-5 2-10 0-13-5z" /><path d="M19.5 12l2.5-3v6z" /><circle cx="15" cy="11" r=".8" fill="currentColor" /></>,
  knife: <><path d="M3 21l9-9" /><path d="M12 12l7.5-7.5a2.1 2.1 0 0 1 3 3L15 15l-3-3z" /><path d="M5 19l-2-2" /></>,
  thermo: <><rect x="3" y="7" width="18" height="13" /><path d="M3 11h18" /><path d="M8 7V4h8v3" /><circle cx="12" cy="15.5" r="1.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
};

export function Icon({ name, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {PATHS[name]}
    </svg>
  );
}

export function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M7 29L21 3" /><path d="M12 29L24 4" /><circle cx="16" cy="22" r="7.5" /><circle cx="16" cy="22" r="3.2" />
    </svg>
  );
}
