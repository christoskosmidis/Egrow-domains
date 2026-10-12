type Name =
  | "layout"
  | "cart"
  | "globe"
  | "wrench"
  | "check"
  | "menu"
  | "close"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "linkedin";

const paths: Record<Name, React.ReactNode> = {
  layout: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.2 11h10.6L20 7H6" />
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
    </>
  ),
  wrench: <path d="M14.5 6.5a4 4 0 0 0 4.8 4.8L21 13l-8 8-8-8 8-8 1.5 1.5Zm-9 6.5 5.5 5.5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  whatsapp: (
    <path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4A8 8 0 1 1 20 11.5Zm-9.4-3c-.2 0-.5.1-.7.4-.4.5-.6 1.2-.2 2 .6 1.4 2.2 3.2 4 3.9.9.4 1.6.2 2-.3.2-.3.3-.6.2-.8l-1.4-.7c-.2-.1-.4 0-.5.1l-.4.5c-.1.1-.3.1-.5 0-.8-.4-1.6-1.2-2-2-.1-.2-.1-.3 0-.4l.3-.4c.1-.2.1-.4 0-.5l-.6-1.4c0-.2-.2-.3-.4-.4Z" />
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.7" cy="7.3" r=".6" />
    </>
  ),
  facebook: <path d="M14 8h2.5V4.5H14C11.8 4.5 10.5 6 10.5 8.2V10H8v3.5h2.5V21H14v-7.5h2.4l.6-3.5H14V8.6c0-.4.2-.6.6-.6Z" />,
  linkedin: (
    <>
      <path d="M5 9.5V19M5 5.5v.1M9.5 19V9.5M9.5 13c0-2 1.2-3.5 3.2-3.5S16 11 16 13v6" />
    </>
  ),
};

export default function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: Name;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
