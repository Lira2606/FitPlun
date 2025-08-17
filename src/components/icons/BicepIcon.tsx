import React from 'react';

export function BicepIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1" />
      <path d="M18 7h2a1 1 0 011 1v2" />
      <path d="M6 7H4a1 1 0 00-1 1v2" />
      <path d="M12 17a5 5 0 00-5-5H3l-1.5 1.5a2.4 2.4 0 000 3.4l1.5 1.5H7a5 5 0 005-5z" />
      <path d="M12 17a5 5 0 015-5h4l1.5 1.5a2.4 2.4 0 010 3.4l-1.5 1.5H17a5 5 0 01-5-5z" />
    </svg>
  );
}
