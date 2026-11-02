export function SpineLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* The Book Cover */}
      <path 
        d="M6 3H18V21H6V3Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* The Spine */}
      <path 
        d="M10 3V21" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Pages detail on the spine */}
      <path 
        d="M12 7H14" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M12 10H14" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
}