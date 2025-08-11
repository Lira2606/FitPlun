import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function WalkIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12.5 2c.3 1.2.5 2.5.5 3.8c0 .8-.2 1.6-.4 2.3c-.3 1.1-.8 2.1-1.4 3.1L9 14.8V22h2.2l1.8-6.1l2.3 2.3c.4.4.9.7 1.4.9c.6.2 1.2.3 1.8.3s1.2-.1 1.8-.3c.6-.2 1.1-.5 1.5-.9c.4-.4.7-.9.9-1.5c.2-.6.3-1.2.3-1.8s-.1-1.2-.3-1.8c-.2-.6-.5-1.1-.9-1.5c-.4-.4-.9-.7-1.5-.9c-1.2-.4-2.5-.3-3.6.1L12.5 9" />
      <path d="M11 4a2 2 0 1 0 0-4a2 2 0 0 0 0 4Z" />
      <path d="M8.2 22l-1-6.1l-2.4 2.4c-.4.4-.9.7-1.4.9c-1.2.4-2.5.3-3.6-.1S.1 18 0 16.8c-.1-1.2.3-2.4.9-3.3c.6-1 1.5-1.7 2.6-2.1c1.1-.4 2.3-.5 3.4-.2l.6.2" />
    </svg>
  );
}
