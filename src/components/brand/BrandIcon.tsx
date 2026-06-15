type BrandIconName =
  | "attention"
  | "billing"
  | "incident"
  | "portal"
  | "clarity"
  | "operations"
  | "trust"
  | "guide"
  | "phone"
  | "arrow";

const iconPaths: Record<BrandIconName, React.ReactNode> = {
  attention: (
    <>
      <path d="M6 17.5V6.5h7.5l4.5 4.5v6.5H6Z" />
      <path d="M13.5 6.5v4.5H18" />
      <path d="M9 13h6" />
      <path d="M9 16h4" />
    </>
  ),
  billing: (
    <>
      <rect x="6" y="5.5" width="12" height="13" rx="2.5" />
      <path d="M9 9.5h6" />
      <path d="M9 13h6" />
      <path d="M9 16.5h3.5" />
    </>
  ),
  incident: (
    <>
      <path d="M12 5.5 18 17H6l6-11.5Z" />
      <path d="M12 10v3.5" />
      <path d="M12 15.5h.01" />
    </>
  ),
  portal: (
    <>
      <rect x="5.5" y="6" width="13" height="12" rx="3" />
      <path d="M9 10h6" />
      <path d="M9 13.5h6" />
      <path d="M9 17h3" />
    </>
  ),
  clarity: (
    <>
      <path d="M12 6c4.5 0 7.5 6 7.5 6s-3 6-7.5 6-7.5-6-7.5-6 3-6 7.5-6Z" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  operations: (
    <>
      <circle cx="8.5" cy="8.5" r="2.5" />
      <circle cx="15.5" cy="15.5" r="2.5" />
      <path d="M10.3 10.3 13.7 13.7" />
      <path d="M14.5 8.5h3" />
      <path d="M6.5 15.5h3" />
    </>
  ),
  trust: (
    <>
      <path d="M12 5.5 18 8v4.5c0 3.5-2.2 5.7-6 7-3.8-1.3-6-3.5-6-7V8l6-2.5Z" />
      <path d="m9.5 12.3 1.7 1.7 3.3-3.5" />
    </>
  ),
  guide: (
    <>
      <path d="M7 6.5h7a3 3 0 0 1 3 3V18H10a3 3 0 0 0-3 0V6.5Z" />
      <path d="M10 9.5h4.5" />
      <path d="M10 12.5h4.5" />
      <path d="M10 15.5h3" />
    </>
  ),
  phone: (
    <>
      <path d="M8.8 6.8c.5-.5 1.2-.7 1.8-.4l1.7.8c.6.3 1 .9.9 1.6l-.2 1.7c0 .4.1.8.4 1.1l1.4 1.4c.3.3.7.4 1.1.4l1.7-.2c.7-.1 1.3.3 1.6.9l.8 1.7c.3.6.1 1.3-.4 1.8l-1.1 1.1c-.8.8-2 1.1-3.1.8-2-.6-4-1.8-5.7-3.5-1.7-1.7-2.9-3.7-3.5-5.7-.3-1.1 0-2.3.8-3.1l1.1-1.1Z" />
    </>
  ),
  arrow: (
    <>
      <path d="M7 12h10" />
      <path d="m13 8 4 4-4 4" />
    </>
  )
};

export default function BrandIcon({
  name,
  className = "",
  strokeWidth = 1.7
}: {
  name: BrandIconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {iconPaths[name]}
    </svg>
  );
}
