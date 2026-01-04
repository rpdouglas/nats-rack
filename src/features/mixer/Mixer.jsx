/**
 * 2026-01-04 PHASE 2: MIXING DESK (UI HOTFIX)
 * - Fixed Mute Button Color: Added inline style fallback to force Red state.
 * - Added type="button" to prevent default form behaviors.
 * - Confirmed state re-render logic.
 */

import React from 'react';
import { useProject } from '../../store/useProject';
import { engine } from '../../audio/Engine';

export default function Mixer() {
  const { 
    tracks, 
    volumes, 
    sends, 
    mutes, 
    masterVolume,
    setVolume, 
    setSend, 
    toggleMute,
    setMasterVolume
  } = useProject();

  // Guard Clause: Wait for store to fully hydrate
  if (!volumes || !sends || !mutes) {
    return <div className="text-zinc-600 text-[10px] animate-pulse">Initializing Console...</div>;
  }

  const handleVolChange = (idx, val) => {
    setVolume(idx, parseFloat(val));
    engine.updateVolume(idx, parseFloat(val));
  };

  const handleSendChange = (idx, val) => {
    setSend(idx, parseFloat(val));
    engine.updateSend(idx, parseFloat(val));
  };

  const handleMute = (idx) => {
    // 1. Update React Store (Triggers re-render)
    toggleMute(idx);
    // 2. Update Audio Engine immediately
    // Note: We use !mutes[idx] because we are flipping the current state
    engine.toggleMute(idx, !mutes[idx]);
  };

  const handleMasterChange = (val) => {
    setMasterVolume(parseFloat(val));
    engine.updateMasterVolume(parseFloat(val));
  };

  return (
    <div className="bg-rack-panel p-6 rounded-lg border border-zinc-800 flex gap-6 justify-center shadow-inner items-end">
      
      {tracks.map((track, idx) => {
        const isMuted = mutes[idx];

        return (
          <div key={track} className="flex flex-col items-center gap-4 bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
            
            {/* 1. SEND KNOB */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] text-neon/60 uppercase font-bold tracking-widest">Verb</span>
              <div className="relative w-8 h-20 bg-zinc-950 rounded border border-zinc-700">
                 <input 
                  type="range"
                  min="-60"
                  max="0"
                  step="1"
                  value={sends[idx]}
                  onChange={(e) => handleSendChange(idx, e.target.value)}
                  className="absolute w-20 h-8 -rotate-90 top-6 -left-6 cursor-pointer opacity-0 z-10" 
                />
                <div 
                  className="absolute bottom-0 w-full bg-neon/30 rounded-b transition-all duration-75"
                  style={{ height: `${((sends[idx] + 60) / 60) * 100}%` }}
                />
                 <div 
                  className="absolute w-full h-0.5 bg-neon transition-all duration-75 pointer-events-none"
                  style={{ bottom: `${((sends[idx] + 60) / 60) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. MUTE BUTTON (HOTFIXED) */}
            <button
              type="button"
              onClick={() => handleMute(idx)}
              // We use inline styles for background to guarantee the color change works
              // regardless of Tailwind precedence or compilation lag.
              style={{
                backgroundColor: isMuted ? '#dc2626' : '#27272a',
                color: isMuted ? '#ffffff' : '#71717a',
                borderColor: isMuted ? '#ef4444' : '#52525b'
              }}
              className={`
                w-8 h-6 text-[9px] font-bold border rounded transition-all duration-100 shadow-sm
                ${isMuted ? 'shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'hover:border-zinc-400'}
              `}
            >
              M
            </button>

            {/* 3. CHANNEL FADER */}
            <div className="h-32 w-8 bg-black rounded-sm relative flex justify-center border border-zinc-700 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
              <input 
                type="range"
                min="-60"
                max="6"
                step="1"
                value={volumes[idx]}
                onChange={(e) => handleVolChange(idx, e.target.value)}
                className="absolute w-28 h-2 cursor-pointer accent-neon -rotate-90 top-1/2"
                style={{ transform: 'rotate(-90deg)', appearance: 'none' }}
              />
            </div>
            
            {/* LABEL */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{track}</span>
              <span className="text-[9px] font-mono text-neon/60">{volumes[idx]}dB</span>
            </div>
          </div>
        );
      })}

      <div className="w-0.5 h-64 bg-zinc-800 mx-2" />

      {/* MASTER SECTION */}
      <div className="flex flex-col items-center gap-4 p-2 bg-zinc-950 rounded border border-zinc-800">
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-auto">MST</span>
        
        <div className="h-48 w-10 bg-black rounded-sm relative flex justify-center border-2 border-zinc-700 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
            <input 
              type="range"
              min="-60"
              max="0"
              step="1"
              value={masterVolume}
              onChange={(e) => handleMasterChange(e.target.value)}
              className="absolute w-44 h-2 cursor-pointer accent-red-500 -rotate-90 top-1/2"
              style={{ transform: 'rotate(-90deg)', appearance: 'none' }}
            />
        </div>
        
        <span className="text-[10px] font-mono text-red-500">{masterVolume}dB</span>
      </div>

    </div>
  );
}