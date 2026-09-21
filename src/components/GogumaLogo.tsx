/** 고구마 한 알 — 껍질(자주) 위에 속살 하이라이트 */
export default function GogumaLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M25.8 6.6c3.1 3.1 2.3 9.4-2.2 14s-10.9 5.3-14 2.2c-1.6-1.6-1.6-4-.7-6.4.7-1.9.6-3.4-.5-4.6-1-1.1-1-2.6.1-3.5 1-.9 2.4-.7 3.5.3 1.2 1.1 2.6 1.2 4.5.5 2.5-.9 5.7-1.1 9.3-2.5Z"
        fill="var(--color-skin-500)"
      />
      <path
        d="M23.4 9.3c1.9 1.9 1.2 6-1.8 9s-7.1 3.7-9 1.8"
        stroke="var(--color-goguma-300)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="26.2" cy="6.2" r="2.2" fill="var(--color-goguma-400)" />
    </svg>
  );
}
