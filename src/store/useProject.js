/**
 * 2026-01-04 PHASE 4: EXPORT & PERSISTENCE
 * - Implemented 'persist' middleware to save state to LocalStorage.
 * - Configured 'partialize' to only save Project Data (Patterns, Timeline, Mixer),
 * ignoring transient Playback State (isPlaying, currentStep).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to create a blank 4-track x 16-step grid
const createGrid = () => Array(4).fill(null).map(() => Array(16).fill(false));

export const useProject = create(
  persist(
    (set) => ({
      // --- TRANSIENT STATE (Not Saved) ---
      isPlaying: false,
      currentStep: 0,
      currentBar: 0,
      isExporting: false, // New: UI state for bounce process

      // --- PERSISTENT PROJECT DATA ---
      bpm: 120,
      tracks: ['Kick', 'Snare', 'HiHat', 'Clap'],
      
      // Mixer
      volumes: [-6, -6, -6, -6], 
      sends: [-60, -60, -60, -60],
      mutes: [false, false, false, false],
      masterVolume: -2,

      // Arrangement
      activePatternId: 'A',
      timeline: ['A'],
      patterns: {
        'A': createGrid(),
        'B': createGrid(),
      },

      // --- ACTIONS ---
      setBpm: (bpm) => set({ bpm }),
      setPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setCurrentBar: (currentBar) => set({ currentBar }),
      setExporting: (isExporting) => set({ isExporting }),
      
      setVolume: (trackIdx, value) => set((state) => {
        const newVolumes = [...state.volumes];
        newVolumes[trackIdx] = value;
        return { volumes: newVolumes };
      }),

      setSend: (trackIdx, value) => set((state) => {
        const newSends = [...state.sends];
        newSends[trackIdx] = value;
        return { sends: newSends };
      }),

      toggleMute: (trackIdx) => set((state) => {
        const newMutes = [...state.mutes];
        newMutes[trackIdx] = !newMutes[trackIdx];
        return { mutes: newMutes };
      }),

      setMasterVolume: (value) => set({ masterVolume: value }),

      toggleStep: (trackIdx, stepIdx) => set((state) => {
        const patternId = state.activePatternId;
        const currentGrid = state.patterns[patternId];
        
        const newGrid = currentGrid.map((row, i) => 
          i === trackIdx ? row.map((step, j) => j === stepIdx ? !step : step) : row
        );

        return {
          patterns: {
            ...state.patterns,
            [patternId]: newGrid
          }
        };
      }),

      setActivePattern: (patternId) => set({ activePatternId: patternId }),

      addToTimeline: (patternId) => set((state) => ({
        timeline: [...state.timeline, patternId]
      })),

      resetTimeline: () => set({ timeline: ['A'] }),
    }),
    {
      name: 'nats-rack-project-v1', // LocalStorage Key
      partialize: (state) => ({
        // Whitelist: Only save these fields
        bpm: state.bpm,
        tracks: state.tracks,
        volumes: state.volumes,
        sends: state.sends,
        mutes: state.mutes,
        masterVolume: state.masterVolume,
        activePatternId: state.activePatternId,
        timeline: state.timeline,
        patterns: state.patterns,
      }),
    }
  )
);