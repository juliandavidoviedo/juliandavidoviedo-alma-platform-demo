import type { SVGProps } from 'react';

/** Line-art solo dancer in a spin, skirt flaring — used on the splash screen. */
export function DancerSpin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="100" cy="34" r="14" />
      <path d="M100 48v40" />
      <path d="M100 60c-16-6-30-4-40 8" />
      <path d="M100 60c16-6 30-2 38 12" />
      <path d="M100 88c-30 6-52 24-58 52a90 90 0 0 0 116 0c-6-28-28-46-58-52Z" />
      <path d="M100 88c-14 22-14 46 0 68" strokeWidth="1.5" opacity="0.6" />
      <path d="M60 148c26 10 54 10 80 0" strokeWidth="1.5" opacity="0.6" />
      <path d="M92 140v40" />
      <path d="M108 140v40" />
    </svg>
  );
}
