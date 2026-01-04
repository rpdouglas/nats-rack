/**
 * 2026-01-04 PHASE 5: DEPLOYMENT & HOSTING
 * - Integrated EnvironmentBanner for environment awareness.
 * - Added Footer to visualize Version, Git Hash, and Build Date.
 * - Ensures "Self-Aware" application state.
 */

import React from 'react';
import { useProject } from './store/useProject';
import { engine } from './audio/Engine';
import Mixer from './features/mixer/Mixer';
import Sequencer from './features/sequencer/Sequencer';
import Arranger from './features/arranger/Arranger';
import EnvironmentBanner from './features/common/EnvironmentBanner';

export default function App() {
  const { isPlaying, setPlaying, bpm, setBpm, isExporting } = useProject();

  const handlePowerOn = async () => {
    await engine.init();
    console.log(`Nat's Rack v${__APP_VERSION__} [${__GIT_HASH__}]: System Initialized`);
  };

  const handleTransport = () => {
    if (isExporting) return;
    if (isPlaying) {
      engine.stop();
      setPlaying(false);
    } else {
      engine.start();
      setPlaying(true);
    }
  };

  const handleExport = async () => {
    if (isExporting) return;
    await engine.bounce();
  };

  return (
    <div className="min-h-screen bg-rack-bg p-8 flex flex-col items-center pt-12 relative">
      
      {/* 1. ENVIRONMENT VISUALIZATION */}
      <EnvironmentBanner />

      {/* HEADER UNIT */}
      <header className="w-full max-w-4xl bg-rack-panel border-b-2 border-neon p-6 mb-8 flex justify-between items-center shadow-[0_0_20px_rgba(0,255,136,0.1)]">
        <div className="flex flex-col">
          <h1 className="text-neon text-3xl font-black tracking-tighter select-none">
            NAT'S RACK
          </h1>
          <span className="text-[9px] text-zinc-500 font-mono -mt-1 tracking-widest">
            PRO DAC :: v{__APP_VERSION__}
          </span>
        </div>
        
        <div className="flex gap-6 items-center">
          <button 
            onClick={handlePowerOn} 
            className="text-[10px] bg-zinc-800 px-3 py-1 rounded border border-zinc-600 hover:border-neon transition-colors text-zinc-400 font-bold tracking-wider"
          >
            PWR INIT
          </button>

          <div className="bg-lcd-bg px-4 py-1 border border-zinc-700 rounded flex flex-col items-center shadow-inner">
            <span className="text-[8px] text-neon/60 uppercase font-bold self-start">Tempo</span>
            <input 
              type="number" 
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              disabled={isExporting}
              className="bg-transparent text-neon font-mono text-xl w-16 outline-none text-center disabled:opacity-50"
            />
          </div>

          <button 
            onClick={handleExport}
            disabled={isExporting || isPlaying}
            className={`
              px-4 py-2 rounded font-bold uppercase tracking-widest text-[10px] border transition-all
              ${isExporting 
                ? 'bg-red-500/20 text-red-500 border-red-500 animate-pulse' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-600 hover:border-white hover:text-white'}
            `}
          >
            {isExporting ? 'BOUNCING...' : 'EXPORT WAV'}
          </button>

          <button 
            onClick={handleTransport} 
            disabled={isExporting}
            className={`
              px-8 py-2 rounded font-bold uppercase tracking-widest transition-all
              ${isPlaying 
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'bg-neon text-black shadow-[0_0_15px_rgba(0,255,136,0.5)]'}
              ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
        </div>
      </header>

      {/* RACK STACK */}
      <main className="w-full max-w-4xl space-y-6">
        <section>
          <Arranger />
        </section>

        <section>
          <Sequencer />
        </section>

        <section className="relative">
          <span className="absolute top-2 left-4 text-[9px] text-zinc-600 uppercase tracking-widest z-10">
            4-Channel Mixer
          </span>
          <Mixer />
        </section>
      </main>

      {/* 2. VERSION FOOTER (Debug Visualization) */}
      <footer className="mt-12 text-zinc-700 font-mono text-[9px] flex gap-4 uppercase tracking-widest">
        <span title="App Version">VER: {__APP_VERSION__}</span>
        <span title="Git Commit Hash">BLD: {__GIT_HASH__}</span>
        <span title="Build Timestamp" className="hidden sm:inline">DATE: {__BUILD_DATE__.split('T')[0]}</span>
      </footer>
    </div>
  );
}