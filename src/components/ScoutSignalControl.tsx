import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ScoutSignalControlProps {
  showLabel?: boolean;
  variant?: 'button' | 'banner' | 'pill' | 'switch';
  className?: string;
}

export const ScoutSignalControl: React.FC<ScoutSignalControlProps> = ({
  showLabel = false,
  variant = 'button',
  className = '',
}) => {
  const { theme, isNightOps, toggleTheme } = useTheme();

  // Top banner variant: compact, fits nicely into the dark top ticker bar
  if (variant === 'banner') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={isNightOps ? 'Switch to Daybreak Mode (Alt+T)' : 'Switch to Night Ops Mode (Alt+T)'}
        className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer ${
          isNightOps
            ? 'bg-[#D8FF65]/15 text-[#D8FF65] hover:bg-[#D8FF65]/25 border border-[#D8FF65]/40'
            : 'bg-[#FAF7F0]/10 text-[#FAF7F0] hover:text-[#D8FF65] hover:bg-[#FAF7F0]/20 border border-[#FAF7F0]/20'
        } ${className}`}
        aria-label="Toggle dark/light mode"
      >
        {isNightOps ? (
          <>
            <Moon className="w-3 h-3 text-[#D8FF65]" />
            <span className="hidden sm:inline">Night Ops</span>
          </>
        ) : (
          <>
            <Sun className="w-3 h-3 text-[#FF7054]" />
            <span className="hidden sm:inline">Daybreak</span>
          </>
        )}
        <kbd className="hidden md:inline text-[9px] opacity-70 bg-black/30 px-1 py-0.2 rounded border border-white/10">Alt+T</kbd>
      </button>
    );
  }

  // Full labeled control (used in SettingsView and mobile drawer)
  if (showLabel || variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={toggleTheme}
          title={isNightOps ? 'Switch to Daybreak Mode (Alt+T)' : 'Switch to Night Ops Mode (Alt+T)'}
          className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border-2 font-mono text-xs transition-all cursor-pointer select-none ${
            isNightOps
              ? 'bg-[#121A15] border-[#C6FF3D] text-[#C6FF3D] shadow-[2px_2px_0px_#000000] hover:shadow-[3px_3px_0px_#000000]'
              : 'bg-[#FAF7F0] border-[#17271F] text-[#17271F] shadow-[2px_2px_0px_#17271F] hover:shadow-[3px_3px_0px_#17271F]'
          }`}
          aria-label="Toggle Scout Signal theme"
        >
          <div className="flex items-center gap-1.5">
            {isNightOps ? (
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6FF3D] opacity-40" />
                <Moon className="w-3.5 h-3.5 text-[#C6FF3D] shrink-0" />
              </span>
            ) : (
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <Sun className="w-3.5 h-3.5 text-[#FF7054] shrink-0" />
              </span>
            )}
            <span className="font-bold tracking-tight">
              {isNightOps ? 'Night Ops' : 'Daybreak'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-current/25 pl-2">
            <span className="text-[10px] opacity-75 font-sans font-medium">Toggle</span>
            <kbd className="text-[9px] bg-black/10 dark:bg-white/10 px-1 py-0.2 rounded border border-current/20">Alt+T</kbd>
          </div>
        </button>
      </div>
    );
  }

  // Primary tactile button variant (for Navbar desktop action bar)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isNightOps ? 'Switch to Daybreak Mode (Alt+T)' : 'Switch to Night Ops Mode (Alt+T)'}
      className={`btn-tactile-secondary px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 font-semibold text-[#17271F] cursor-pointer whitespace-nowrap shrink-0 group ${className}`}
      aria-label={isNightOps ? 'Switch to Daybreak Mode' : 'Switch to Night Ops Mode'}
    >
      {isNightOps ? (
        <>
          <Moon className="w-4 h-4 text-[#D8FF65] group-hover:rotate-12 transition-transform duration-200" />
          <span className="hidden md:inline font-mono text-xs">Night Ops</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65] shadow-[0_0_6px_#D8FF65]" />
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-[#FF7054] group-hover:rotate-45 transition-transform duration-200" />
          <span className="hidden md:inline font-mono text-xs">Daybreak</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7054]" />
        </>
      )}
    </button>
  );
};

