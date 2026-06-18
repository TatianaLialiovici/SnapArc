/**
 * Bespoke Snap Arc mark — an "aura aperture": a soft captured-light orb
 * inside an open lens ring with light flares. Pure inline SVG, no tile,
 * no copied brand art. Inherits sizing via width/height props.
 */
export function Logo({ size = 30, className = "" }: { size?: number; className?: string }) {
  const id = "logo"; // stable ids; single instance in the nav
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-aura`} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#FCE9EF" />
          <stop offset="38%" stopColor="#F4B2C4" />
          <stop offset="72%" stopColor="#C4B2F0" />
          <stop offset="100%" stopColor="#A8C4F4" />
        </radialGradient>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E88EB2" />
          <stop offset="100%" stopColor="#A8C4F4" />
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="120" fill={`url(#${id}-aura)`} />
      <circle cx="218" cy="214" r="34" fill="#FFFFFF" opacity="0.55" />
      <path
        d="M256 84 a172 172 0 1 1 -121.6 50.4"
        stroke={`url(#${id}-ring)`}
        strokeWidth="26"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M256 40 V8" stroke="#E88EB2" strokeWidth="20" strokeLinecap="round" />
      <path d="M468 256 H500" stroke="#A8C4F4" strokeWidth="20" strokeLinecap="round" />
      <path d="M402 110 l22 -22" stroke="#C4B2F0" strokeWidth="18" strokeLinecap="round" />
    </svg>
  );
}
