/**
 * 2026-01-04 PHASE 3: SONG MODE & ARRANGEMENT
 * - New Component: Visual Timeline Editor.
 * - Visualizes the song structure as blocks (Bars).
 * - Highlights the currently playing bar in real-time.
 * - Allows appending patterns to build arrangements.
 */

import React from 'react';
import { useProject } from '../../store/useProject';

export default function Arranger() {
  const { 
    timeline, 
    activePatternId, 
    setActivePattern, 
    addToTimeline, 
    resetTimeline,
    currentBar
  } = useProject();

  const handleAppend = () => {
    addToTimeline(activePatternId);
  };

  return (
    <div className="bg-rack-panel p-6 rounded-lg border border-zinc-800 relative shadow-inner flex flex-col gap-4">
      
      {/* HEADER: Control Dashboard */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
          Linear Arranger <span className="text-neon/50">:: {timeline.length} BARS</span>
        </span>

        <div className="flex gap-4 items-center">
          {/* Pattern Selector Toggle */}
          <div className="flex bg-zinc-900 rounded p-1 gap-1 border border-zinc-800">
            {['A', 'B'].map((pid) => (
              <button
                key={pid}
                onClick={() => setActivePattern(pid)}
                className={`
                  w-8 h-6 text-[10px] font-bold rounded transition-colors
                  ${activePatternId === pid 
                    ? 'bg-neon text-black' 
                    : 'bg-transparent text-zinc-500 hover:text-zinc-300'}
                `}
              >
                {pid}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <button 
            onClick={handleAppend}
            className="text-[10px] bg-zinc-800 px-3 py-1 rounded border border-zinc-600 hover:border-neon hover:text-neon transition-colors text-zinc-400 font-bold"
          >
            + APP
          </button>
          
          <button 
            onClick={resetTimeline}
            className="text-[10px] bg-zinc-800 px-3 py-1 rounded border border-zinc-600 hover:border-red-500 hover:text-red-500 transition-colors text-zinc-400 font-bold"
          >
            RESET
          </button>
        </div>
      </div>

      {/* TIMELINE VISUALIZATION */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {timeline.map((patternId, index) => {
          // Highlight logic: Is this the bar currently playing?
          const isPlaying = currentBar === index;
          
          return (
            <div 
              key={index}
              className={`
                shrink-0 w-12 h-12 rounded border flex flex-col items-center justify-center relative
                transition-all duration-100
                ${isPlaying 
                  ? 'bg-zinc-800 border-neon shadow-[0_0_10px_var(--color-neon)] z-10 scale-105' 
                  : 'bg-zinc-900 border-zinc-700 opacity-80'}
              `}
            >
              {/* Playhead Indicator */}
              {isPlaying && (
                <div className="absolute -top-1 w-2 h-2 bg-neon rounded-full shadow-[0_0_5px_#00ff88]" />
              )}
              
              <span className={`text-xl font-black font-mono ${isPlaying ? 'text-neon' : 'text-zinc-600'}`}>
                {patternId}
              </span>
              
              <span className="text-[8px] text-zinc-600 absolute bottom-1">
                {index + 1}
              </span>
            </div>
          );
        })}
        
        {/* Ghost Block (Visual hint for next append) */}
        <div className="w-12 h-12 rounded border border-zinc-800 border-dashed flex items-center justify-center opacity-30">
          <span className="text-zinc-600 text-[10px]">+</span>
        </div>
      </div>

    </div>
  );
}