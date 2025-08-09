export function LiftingAnimation() {
  return (
    <div className="flex justify-center items-center my-auto">
      <svg
        width="150"
        height="150"
        viewBox="0 0 100 100"
        className="lifter-animation text-gray-400"
      >
        <g stroke="currentColor" strokeWidth="2" fill="none">
          {/* Stick Figure */}
          <circle cx="50" cy="35" r="5" fill="currentColor" />
          <line x1="50" y1="40" x2="50" y2="65" />
          <line x1="50" y1="65" x2="40" y2="85" />
          <line x1="50" y1="65" x2="60" y2="85" />

          {/* Barbell and arms */}
          <g className="barbell" style={{ transformOrigin: 'center center' }}>
            <line x1="20" y1="45" x2="80" y2="45" strokeWidth="3" />
            <circle cx="18" cy="45" r="6" fill="currentColor" />
            <circle cx="82" cy="45" r="6" fill="currentColor" />
            <line x1="50" y1="50" x2="35" y2="45" />
            <line x1="50" y1="50" x2="65" y2="45" />
          </g>
        </g>
      </svg>
    </div>
  );
}

    