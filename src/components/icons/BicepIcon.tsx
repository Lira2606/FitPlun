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
      <path d="M12 5H9.261a2 2 0 0 0-1.926 1.517l-1.412 5.647a2 2 0 0 0 .11 1.34l1.732 2.598a2 2 0 0 0 1.62 1.9l4.379 1.46a2 2 0 0 0 2.22-.53l1.838-2.144a2 2 0 0 0 .22-1.772l-1.21-4.235a2 2 0 0 0-1.814-1.414H12Z"></path>
      <path d="M12 5V2"></path>
      <path d="m7 12-2-2"></path>
      <path d="m17 12 2-2"></path>
    </svg>
  );
}
