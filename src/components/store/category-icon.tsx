const ICONS: Record<string, React.ReactNode> = {
  canetas: (
    <>
      <path d="M4 20 14 10l3 3L7 23H4z" />
      <path d="M14 10l3-6 4 4-6 3" />
    </>
  ),
  cadernos: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3v18M13 8h3M13 12h3" />
    </>
  ),
  canecas: (
    <>
      <path d="M6 8h9v9a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" />
      <path d="M15 10h2a3 3 0 0 1 0 6h-2" />
    </>
  ),
  ecobags: (
    <>
      <path d="M6 8h12l-1 12H7z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
  "kits-corporativos": (
    <>
      <rect x="4" y="8" width="16" height="12" rx="1" />
      <path d="M4 12h16M12 8v12M9 5h6v3H9z" />
    </>
  ),
};

const FALLBACK = (
  <>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="M3.3 7 12 12l8.7-5M12 22V12" />
  </>
);

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} className={className} aria-hidden="true">
      {ICONS[slug] ?? FALLBACK}
    </svg>
  );
}
