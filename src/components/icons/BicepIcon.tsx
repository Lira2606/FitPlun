import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function BicepIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn(props.className)}
    >
       <g transform="translate(0, -5) scale(0.3)">
            <g transform="translate(0, 32)">
                <g>
                    <path d="M 35 94 Q 37 90 44 90 Q 50 90 52 94 Z" fill="currentColor" />
                    <path d="M 65 94 Q 63 90 56 90 Q 50 90 48 94 Z" fill="currentColor" />
                </g>
                <g>
                    <path d="M 42 65 C 40 75, 40 85, 40 90 H 47 C 47 85, 47 75, 45 65 Z" fill="currentColor" />
                    <path d="M 58 65 C 60 75, 60 85, 60 90 H 53 C 53 85, 53 75, 55 65 Z" fill="currentColor" />
                </g>
                <path d="M 42 40 C 40 50, 40 60, 45 68 H 55 C 60 60, 60 50, 58 40 Z" fill="currentColor" />
                <rect x="42" y="58" width="16" height="5" fill="currentColor" rx="2" />
                <circle cx="50" cy="28" r="10" fill="currentColor" />
                <path d="M 42 20 Q 50 15, 58 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                <g id="bicep-curl-arms">
                    <path d="M 40 35 C 35 45, 35 55, 40 60 C 45 55, 45 45, 42 35 Z" fill="currentColor" />
                    <path d="M 60 35 C 65 45, 65 55, 60 60 C 55 55, 55 45, 58 35 Z" fill="currentColor" />
                </g>
                <g id="bicep-curl-barbell">
                    <rect x="0" y="58" width="100" height="4" fill="currentColor" rx="2" />
                    <circle cx="15" cy="60" r="12" fill="currentColor" />
                    <circle cx="85" cy="60" r="12" fill="currentColor" />
                    <circle cx="15" cy="60" r="4" fill="#f9fafb" />
                    <circle cx="85" cy="60" r="4" fill="#f9fafb" />
                </g>
            </g>
        </g>
    </svg>
  );
}
