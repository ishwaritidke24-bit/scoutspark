import React, { useState, useEffect } from 'react';

export type ScoutExpression = 
  | 'idle' 
  | 'curious' 
  | 'thinking' 
  | 'celebratory' 
  | 'focused' 
  | 'waving' 
  | 'pointing'
  | 'talking'
  | 'listening'
  | 'roaming';

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

  // Continuous, varied, natural eye blinking state
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  useEffect(() => {
    if (!animate) return;

    let timer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;
    let doubleTimer: ReturnType<typeof setTimeout>;
    let doubleResetTimer: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const scheduleNextBlink = () => {
      // Natural varied blinking interval: between 2.2s and 4.6s
      const delay = Math.floor(Math.random() * 2400) + 2200;

      timer = setTimeout(() => {
        if (!isMounted) return;
        setIsBlinking(true);

        // Smooth, subtle, quick blink duration: ~135ms
        resetTimer = setTimeout(() => {
          if (!isMounted) return;
          setIsBlinking(false);

          // 18% chance of a realistic quick double-blink (natural eye flutter)
          if (Math.random() < 0.18) {
            doubleTimer = setTimeout(() => {
              if (!isMounted) return;
              setIsBlinking(true);

              doubleResetTimer = setTimeout(() => {
                if (!isMounted) return;
                setIsBlinking(false);
                scheduleNextBlink();
              }, 115);
            }, 125);
          } else {
            scheduleNextBlink();
          }
        }, 135);
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearTimeout(resetTimer);
      clearTimeout(doubleTimer);
      clearTimeout(doubleResetTimer);
    };
  }, [animate]);

  // Helper to render eyes with smooth natural blinking
  const renderEyes = (leftCx = 26, rightCx = 42, cy = 30, r = 2.8, catchlight = true) => {
    if (isBlinking) {
      // Natural, gentle curved eyelid lines during blink
      return (
        <g className="transition-all duration-75">
          <path
            d={`M ${leftCx - 3.2} ${cy} Q ${leftCx} ${cy + 1.5} ${leftCx + 3.2} ${cy}`}
            stroke="#17271F"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${rightCx - 3.2} ${cy} Q ${rightCx} ${cy + 1.5} ${rightCx + 3.2} ${cy}`}
            stroke="#17271F"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );
    }

    return (
      <g className="transition-all duration-75">
        <circle cx={leftCx} cy={cy} r={r} fill="#17271F" />
        <circle cx={rightCx} cy={cy} r={r} fill="#17271F" />
        {catchlight && (
          <>
            <circle cx={leftCx + 1.2} cy={cy - 1.2} r={r * 0.32} fill="#FFFFFF" />
            <circle cx={rightCx + 1.2} cy={cy - 1.2} r={r * 0.32} fill="#FFFFFF" />
          </>
        )}
      </g>
    );
  };

  // Helper to render eyes & mouth based on expression
  const renderFace = () => {
    switch (expression) {
      case 'talking':
        return (
          <>
            {/* Friendly animated talk eyes with natural blinking */}
            {renderEyes(26, 42, 30, 3.0, true)}
            {/* Rosy blush */}
            <circle cx="21" cy="33" r="2.2" fill="#FF7054" opacity="0.65" />
            <circle cx="47" cy="33" r="2.2" fill="#FF7054" opacity="0.65" />
            {/* Subtle speaking mouth */}
            <ellipse cx="34" cy="36" rx="3.2" ry="1.8" fill="#17271F" />
            <path d="M 32 37 Q 34 38.5 36 37" stroke="#FF7054" strokeWidth="1" fill="none" />
          </>
        );

      case 'listening':
        return (
          <>
            {/* Attentive eyes with natural blinking */}
            {renderEyes(26, 42, 30, 3.2, true)}
            {/* Soft blush */}
            <circle cx="21" cy="33" r="2" fill="#FF7054" opacity="0.5" />
            <circle cx="47" cy="33" r="2" fill="#FF7054" opacity="0.5" />
            {/* Attentive small smile */}
            <path
              d="M 30 35 Q 34 38 38 35"
              stroke="#17271F"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 'roaming':
        return (
          <>
            {/* Joyful curved squint eyes */}
            <path
              d="M 23 30 Q 27 27 31 30"
              stroke="#17271F"
              strokeWidth="2.3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 37 30 Q 41 27 45 30"
              stroke="#17271F"
              strokeWidth="2.3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Rosy blush */}
            <circle cx="21" cy="33" r="2.2" fill="#FF7054" opacity="0.65" />
            <circle cx="47" cy="33" r="2.2" fill="#FF7054" opacity="0.65" />
            {/* Warm friendly smile */}
            <path
              d="M 29 35 Q 34 39 39 35"
              stroke="#17271F"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );

      case 'waving':
        return (
          <>
            {/* Friendly wide joyful eyes with natural blinking */}
            {renderEyes(26, 42, 30, 3.0, true)}
            {/* Rosy blush */}
            <circle cx="21" cy="33" r="2.2" fill="#FF7054" opacity="0.65" />
            <circle cx="47" cy="33" r="2.2" fill="#FF7054" opacity="0.65" />
            {/* Warm open smile */}
            <path
              d="M 29 35 Q 34 39 39 35"
              stroke="#17271F"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Subtle friendly wave badge on top right */}
            <circle cx="58" cy="22" r="3" fill="#D8FF65" stroke="#17271F" strokeWidth="1.3" />
            <circle cx="58" cy="22" r="1" fill="#FF7054" />
          </>
        );

      case 'pointing':
        return (
          <>
            {/* Playful wink: left eye wink curve, right eye blinks naturally */}
            <path
              d="M 22 30 Q 26 27 30 30"
              stroke="#17271F"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            {isBlinking ? (
              <path
                d="M 39 30 Q 42 31.5 45 30"
                stroke="#17271F"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <circle cx="42" cy="30" r="3.0" fill="#17271F" />
                <circle cx="43.2" cy="28.8" r="1" fill="#FFFFFF" />
              </>
            )}
            {/* Rosy blush */}
            <circle cx="21" cy="33" r="2" fill="#FF7054" opacity="0.6" />
            <circle cx="47" cy="33" r="2" fill="#FF7054" opacity="0.6" />
            {/* Encouraging smile */}
            <path
              d="M 29 35 Q 34 38 39 35"
              stroke="#17271F"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );

      case 'celebratory':
        return (
          <>
            {/* Joyful curved eyes */}
            <path
              d="M 23 29 Q 27 25 31 29"
              stroke="#17271F"
              strokeWidth="2.3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 37 29 Q 41 25 45 29"
              stroke="#17271F"
              strokeWidth="2.3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Rosy blush */}
            <circle cx="21" cy="33" r="2.2" fill="#FF7054" opacity="0.6" />
            <circle cx="47" cy="33" r="2.2" fill="#FF7054" opacity="0.6" />
            {/* Cheerful welcoming smile */}
            <path
              d="M 29 35 Q 34 39 39 35"
              stroke="#17271F"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );

      case 'thinking':
        return (
          <>
            {/* Inquisitive tilted gaze */}
            <path d="M 23 25 L 30 27" stroke="#17271F" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="27" cy="30" r="2.8" fill="#17271F" />
            <circle cx="41" cy="29" r="2.8" fill="#17271F" />
            <circle cx="28" cy="29" r="0.8" fill="#FFFFFF" />
            <circle cx="42" cy="28" r="0.8" fill="#FFFFFF" />
            {/* Quizzical pursed mouth */}
            <ellipse cx="34" cy="36" rx="2" ry="1.2" fill="#17271F" />
          </>
        );

      case 'curious':
        return (
          <>
            {/* Large curious wide eyes with natural blinking */}
            {renderEyes(26, 42, 30, 3.2, true)}
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
            {/* Focused monocle on right eye */}
            <circle cx="26" cy="30" r="2.8" fill="#17271F" />
            <circle cx="42" cy="30" r="2.8" fill="#17271F" />
            <circle cx="42" cy="30" r="5.5" stroke="#17271F" strokeWidth="1.2" fill="none" strokeDasharray="2 2" />
            <line x1="46" y1="34" x2="50" y2="38" stroke="#17271F" strokeWidth="1.5" strokeLinecap="round" />
            {/* Small determined smile */}
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
            {/* Natural, continuously blinking friendly eyes */}
            {renderEyes(26, 42, 30, 2.8, true)}
            {/* Tiny blush */}
            <circle cx="20" cy="33" r="1.8" fill="#FF7054" opacity="0.5" />
            <circle cx="48" cy="33" r="1.8" fill="#FF7054" opacity="0.5" />
            {/* Small warm welcoming smile */}
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
      {/* Calm, steady mascot body without full-body bouncing or bobbing */}
      <div className="relative" style={{ width, height }}>
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

          {/* Scout's Main 4-Point Star Body */}
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
