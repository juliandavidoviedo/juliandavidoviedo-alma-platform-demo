import type { SVGProps } from 'react';

/**
 * Decorative line-art silhouette of a tango couple mid-figure. Hand-drawn
 * as a single continuous-feeling stroke path, not a photo trace — meant to
 * read as an elegant mark at low opacity behind text, never as content.
 */
export function DancerCouple(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 400 500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* leader */}
      <path d="M150 90c10-14 32-14 40 0 8 13 2 28-10 33l4 18" />
      <path d="M184 141c-22 4-38 20-42 42l-10 66" />
      <path d="M184 141c18 10 26 30 22 52l32 70" />
      <path d="M132 249c-4 30-2 62 6 92" />
      <path d="M238 263c14 22 34 36 58 42" />
      <path d="M184 141c-14-6-30-4-42 6" />

      {/* follower */}
      <path d="M258 70c9-13 29-13 37 1 7 12 1 26-10 31l3 16" />
      <path d="M288 118c24 2 42 18 48 40l-6 70" />
      <path d="M288 118c-20 12-28 34-22 58l-46 100" />
      <path d="M330 228c10 34 8 70-2 104" />
      <path d="M220 318c-16 20-38 32-64 34" />

      {/* connecting embrace */}
      <path d="M226 174c14-4 30-2 42 8" />
      <path d="M206 190c10 8 24 10 36 4" />

      {/* floor line */}
      <path d="M60 430c90-18 190-18 280 0" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}
