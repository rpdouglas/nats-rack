/**
 * 2026-01-04 PHASE 1: COMPONENT UNIFICATION
 * - Fully migrated to Tailwind v4 (@theme variables).
 * - Connected to 'activePatternId' and 'patterns' store slice.
 * - Removed legacy style objects.
 */

import React from 'react';
import { useProject } from '../../store/useProject';

export default function Sequencer() {
  const { 
    tracks, 
    patterns, 
    activePatternId, 
    currentStep, 
    toggleStep 
  } = useProject();

  // Guard Clause: Ensure pattern data exists before rendering
  const grid = patterns[activePatternId];
  if (!grid) return <div className="text-zinc-500">Pattern Load Error</div>;

  return (
    <div className="bg-rack-panel p-8 rounded-lg border border-zinc-800 relative shadow-inner">
      {/* Module Header */}
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-2">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
          Step Sequencer <span className="text-neon/50">:: {activePatternId}</span>
        </span>
        <div className="flex gap-2">
          {/* Pattern Selector Stub (Visual only for Phase 1) */}
          <div className="text-[9px] text-neon bg-lcd-bg px-2 py-1 rounded font-mono">
            PTRN: {activePatternId}
          </div>
        </div>
      </div>
      
      {/* Grid Container */}
      <div className="flex flex-col gap-3">
        {tracks.map((track, trackIdx) => (
          <div key={track} className="flex items-center gap-4">
            
            {/* Track Label */}
            <div className="w-20 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">
              {track}
            </div>

            {/* Step Row */}
            <div className="flex gap-1">
              {grid[trackIdx].map((active, stepIdx) => {
                const isCurrent = currentStep === stepIdx;
                
                return (
                  <div
                    key={stepIdx}
                    onClick={() => toggleStep(trackIdx, stepIdx)}
                    className={`
                      w-8 h-10 sm:w-10 sm:h-12 rounded-sm cursor-pointer transition-all duration-75
                      border
                      ${active 
                        ? 'bg-neon shadow-[0_0_10px_var(--color-neon)] border-neon' 
                        : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'}
                      ${isCurrent 
                        ? 'border-white brightness-125' 
                        : 'opacity-100'}
                    `}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Step Indicators */}
      <div className="flex gap-1 ml-24 mt-4">
        {Array(16).fill(0).map((_, i) => (
          <div 
            key={i} 
            className={`
              w-8 sm:w-10 text-center text-[9px] font-mono transition-colors
              ${currentStep === i ? 'text-neon font-bold' : 'text-zinc-700'}
            `}
          >
            {String(i + 1).padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
}