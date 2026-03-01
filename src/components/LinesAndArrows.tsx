function LinesAndArrows() {
    return (
      <svg
        className="w-full h-full"
        viewBox="0 0 500 500"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Lines */}
        <line x1="250" y1="20" x2="250" y2="480" stroke="#404040" strokeWidth="2" />
        <line x1="-70" y1="250" x2="570" y2="250" stroke="#404040" strokeWidth="2" />

        {/* Arrows */}
        <path d="M250 15 L240 35 L260 35 Z" fill="#404040" />
        <path d="M250 485 L240 465 L260 465 Z" fill="#404040" />
        <path d="M-80 250 L-60 240 L-60 260 Z" fill="#404040" />
        <path d="M580 250 L560 240 L560 260 Z" fill="#404040" />
      </svg>
    )
  }
  
  export default LinesAndArrows
  