import React from 'react';

export type ScoutExpression = 'idle' | 'curious' | 'thinking' | 'celebratory' | 'focused';

interface ScoutMascotProps {
  expression?: ScoutExpression;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  speechText?: string;
  animate?: boolean;
}

const sizeMap = {
  xs: { width: 28, height: 28, text: 'text-xs' },
  sm: { width: 36, height: 36, text: 'text-xs' },
  md: { width: 48, height: 48, text: 'text-sm' },
  lg: { width: 72, height: 72, text: 'text-sm' },
  xl: { width: 110, height: 110, text: 'text-base' },
};

export const ScoutMascot: React.FC<ScoutMascotProps> = ({
  expression = 'idle',
  size = 'md',
  className = '',
  speechText,
  animate = true,
}) => {
  const { width, height } = sizeMap[size];

  // Helper to render eyes & mouth based on expression
  const renderFace = () => {
    switch (expression) {
      case 'celebratory':
        return (
          <>
            {/* Joyful curved eyes */}
            <path
              d="M 23 29 Q 27 24 31 29"
              stroke="#17271F"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 37 29 Q 41 24 45 29"
              stroke="#17271F"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Rosy blush */}
            <circle cx="21" cy="33" r="2.5" fill="#FF7054" opacity="0.6" />
            <circle cx="47" cy="33" r="2.5" fill="#FF7054" opacity="0.6" />
            {/* Big cheerful open smile */}
            <path
              d="M 28 34 Q 34 40 40 34"
              stroke="#17271F"
              strokeWidth="2"
              fill="#17271F"
              strokeLinecap="round"
            />
          </>
        );

      case 'thinking':
        return (
          <>
            {/* Inquisitive raised eyebrow / tilted gaze */}
            <path d="M 23 25 L 30 27" stroke="#17271F" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="27" cy="30" r="2.8" fill="#17271F" />
            <circle cx="41" cy="29" r="2.8" fill="#17271F" />
            {/* Small glint in eyes */}
            <circle cx="28" cy="29" r="0.8" fill="#FFFFFF" />
            <circle cx="42" cy="28" r="0.8" fill="#FFFFFF" />
            {/* Quizzical pursed mouth */}
            <ellipse cx="34" cy="36" rx="2" ry="1.2" fill="#17271F" />
          </>
        );

      case 'curious':
        return (
          <>
            {/* Large curious wide eyes */}
            <circle cx="26" cy="30" r="3.2" fill="#17271F" className={animate ? 'animate-scout-blink' : ''} />
            <circle cx="42" cy="30" r="3.2" fill="#17271F" className={animate ? 'animate-scout-blink' : ''} />
            {/* Dual sparkle catchlights */}
            <circle cx="27.2" cy="28.8" r="1" fill="#FFFFFF" />
            <circle cx="43.2" cy="28.8" r="1" fill="#FFFFFF" />
            {/* Tiny intrigued open mouth */}
            <circle cx="34" cy="36" r="1.5" fill="#17271F" />
            {/* Soft coral cheek dots */}
            <circle cx="21" cy="33" r="2" fill="#FF7054" opacity="0.45" />
            <circle cx="47" cy="33" r="2" fill="#FF7054" opacity="0.45" />
          </>
        );

      case 'focused':
        return (
          <>
            {/* Focused monocle / scanner ring on right eye */}
            <circle cx="26" cy="30" r="2.8" fill="#17271F" />
            <circle cx="42" cy="30" r="2.8" fill="#17271F" />
            <circle cx="42" cy="30" r="5.5" stroke="#17271F" strokeWidth="1.2" fill="none" strokeDasharray="2 2" />
            <line x1="46" y1="34" x2="50" y2="38" stroke="#17271F" strokeWidth="1.5" strokeLinecap="round" />
            {/* Small determined smirk */}
            <path
              d="M 29 35 Q 34 37 38 34"
              stroke="#17271F"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 'idle':
      default:
        return (
          <>
            {/* Classic expressive blinking eyes */}
            <g className={animate ? 'animate-scout-blink' : ''}>
              <circle cx="26" cy="30" r="2.8" fill="#17271F" />
              <circle cx="27.2" cy="28.8" r="0.9" fill="#FFFFFF" />
              <circle cx="42" cy="30" r="2.8" fill="#17271F" />
              <circle cx="43.2" cy="28.8" r="0.9" fill="#FFFFFF" />
            </g>
            {/* Tiny blush */}
            <circle cx="20" cy="33" r="1.8" fill="#FF7054" opacity="0.5" />
            <circle cx="48" cy="33" r="1.8" fill="#FF7054" opacity="0.5" />
            {/* Friendly mini smile */}
            <path
              d="M 30 35 Q 34 38 38 35"
              stroke="#17271F"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 relative ${className}`}>
      <div className={`relative ${animate ? 'animate-scout-float' : ''}`} style={{ width, height }}>
        <svg
          viewBox="0 0 68 68"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible drop-shadow-sm select-none"
        >
          <defs>
            {/* Subtle warm gradient for body */}
            <radialGradient id="scoutGlow" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFE785" />
              <stop offset="45%" stopColor="#D8FF65" />
              <stop offset="100%" stopColor="#9DE3D0" />
            </radialGradient>
            
            {/* Small shadow filter */}
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#17271F" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Sparkle satellite dots (tactile, charming) */}
          {animate && expression === 'celebratory' && (
            <>
              <circle cx="12" cy="12" r="2" fill="#FF7054" className="animate-ping" style={{ animationDuration: '1.8s' }} />
              <circle cx="56" cy="14" r="2.5" fill="#D8FF65" />
              <circle cx="58" cy="52" r="1.8" fill="#FF7054" />
              <circle cx="10" cy="48" r="2" fill="#9DE3D0" />
            </>
          )}

          {/* Scout's Main 4-Point Star Body */}
          {/* Symmetrical, organic 4-point star curve: Top (34,4), Right (64,34), Bottom (34,64), Left (4,34) */}
          <path
            d="M 34 4
               C 34 18 46 30 64 34
               C 46 38 34 50 34 64
               C 34 50 22 38 4 34
               C 22 30 34 18 34 4 Z"
            fill="url(#scoutGlow)"
            stroke="#17271F"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#softShadow)"
          />

          {/* Cute inner ear / antenna peak highlight */}
          <circle cx="34" cy="11" r="1.5" fill="#17271F" opacity="0.3" />

          {/* Star chest badge / mini spark center */}
          <circle cx="34" cy="44" r="1.5" fill="#FF7054" />

          {/* Expressive Face Elements */}
          {renderFace()}
        </svg>
      </div>

      {/* Optional contextual speech / thought bubble */}
      {speechText && (
        <div className="relative bg-white border border-[#17271F] px-2.5 py-1 rounded-lg text-xs font-medium text-[#17271F] shadow-[2px_2px_0px_#17271F] max-w-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-[#17271F] rotate-45" />
          <span>{speechText}</span>
        </div>
      )}
    </div>
  );
};
