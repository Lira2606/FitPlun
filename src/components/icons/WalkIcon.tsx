import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function WalkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
      className={cn(props.className)}
    >
        <path
            d="M14.5,4.5A2,2,0,1,1,12.5,2.5,2,2,0,0,1,14.5,4.5ZM8.5,22.5h2V16.207L8.9,14.558,7.5,15.914,6.793,22.5Zm11.854-12.379-3,2a1,1,0,0,1-1.214-1.585L17.5,9.621,16,14.5H18v8h2V15.5H18.9L16.82,9.362a3,3,0,0,0-4.32,1.379L10.32,15.5H14v7H4V15.5h3.68l1.7-4.25a3,3,0,0,0-1.37-3.72l-3-2a1,1,0,1,1,1-1.732l3,2a1,1,0,0,1,.453,1.342L11.5,12.379V6.5a1,1,0,0,1,2,0V9.5h.5a3,3,0,0,0,2.932-2.146L18.4,4.5h2.152Z">
        </path>
    </svg>
  );
}
