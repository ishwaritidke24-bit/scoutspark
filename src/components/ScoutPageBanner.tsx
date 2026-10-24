import React, { useState } from 'react';
import { ScoutMascot, ScoutExpression } from './ScoutMascot';
import { ViewTab } from '../types';
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface ScoutPageBannerProps {
  expression?: ScoutExpression;
  title: string;
  subtitle: string;
  whatItDoes: string;
  whenToUse: string;
  nextActionText: string;
  onNextAction: () => void;
  onOpenTour?: () => void;
  highlightText?: string;
  badge?: string;
}

export const ScoutPageBanner: React.FC<ScoutPageBannerProps> = ({
  expression = 'idle',
  title,
  subtitle,
  whatItDoes,
  whenToUse,
  nextActionText,
  onNextAction,
  onOpenTour,
  highlightText,
  badge,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="bg-white border-2 border-[#17271F] rounded-2xl shadow-[3px_3px_0px_#17271F] overflow-hidden transition-all">
      {/* Top Bar / Header */}
      <div className="px-4 py-3 bg-[#FAF7F0] border-b border-[#17271F]/15 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ScoutMascot expression={expression} size="xs" animate={true} />
          <div className="flex items-center gap-2">
            <span className="text-xs font-editorial font-bold text-[#17271F]">
              ScoutStar Guide
            </span>
            {badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#17271F] text-[#D8FF65] font-bold">
                {badge}
              </span>
            )}
            <span className="text-xs text-[#4A5E52] hidden sm:inline">
              • {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="text-[11px] font-semibold text-[#17271F] hover:text-[#FF7054] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-white"
              title="Open full interactive guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#FF7054]" />
              <span className="hidden md:inline">Full Guide & Tour</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-mono text-[#4A5E52] hover:text-[#17271F] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white transition-colors"
            aria-label={isExpanded ? 'Collapse guide tips' : 'Expand guide tips'}
          >
            <span>{isExpanded ? 'Hide tips' : 'Show tips'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Details */}
      {isExpanded && (
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white animate-in fade-in duration-150">
          <div className="space-y-2 max-w-3xl">
            <p className="text-xs sm:text-sm text-[#17271F] font-medium leading-relaxed">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-[#4A5E52]">
              <div>
                <span className="font-bold text-[#17271F]">Purpose: </span>
                <span>{whatItDoes}</span>
              </div>
              <div>
                <span className="font-bold text-[#17271F]">When to use: </span>
                <span>{whenToUse}</span>
              </div>
            </div>

            {highlightText && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFEAE5] border border-[#FF7054]/40 text-[11px] text-[#17271F] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7054]" />
                <span>{highlightText}</span>
              </div>
            )}
          </div>

          <div className="shrink-0 w-full md:w-auto flex md:flex-col items-end gap-2 justify-end">
            <button
              onClick={onNextAction}
              className="btn-tactile-coral px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 w-full md:w-auto"
            >
              <span>{nextActionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
