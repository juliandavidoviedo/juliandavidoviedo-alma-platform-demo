import type { SVGProps } from 'react';

/** Line-art high-heel dance shoe — used in the splash screen and as a small accent mark. */
export function DanceShoe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 58c0-10 8-16 18-16 14 0 26 6 40 6 8 0 14-3 18-8" />
      <path d="M96 40c6 2 10 8 10 16 0 12-8 20-20 20H30c-8 0-14-5-16-13" />
      <path d="M38 42c-2-8-2-16 2-22 3-5 8-6 12-3 5 4 5 12 2 18" />
      <path d="M96 40c2-14 0-27-8-34" />
      <path d="M14 45v40" strokeWidth="3" />
      <path d="M14 85l4 6" strokeWidth="3" />
    </svg>
  );
}
