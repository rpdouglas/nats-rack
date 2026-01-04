/**
 * 2026-01-04 PHASE 4: EXPORT & PERSISTENCE
 * - Implemented 'bounce' feature using Tone.Recorder.
 * - Routes Master Limiter to both Destination (Speakers) and Recorder.
 * - Automates playback for the exact length of the Timeline during export.
 */

import * as Tone from 'tone';
import { useProject } from '../store/useProject';

class AudioEngine {
  constructor() {
    this.players = [];      
    this.channels = [];     
    this.sendGains = [];    
    
    this.reverb = null;
    this.masterChannel = null;
    this.limiter = null;
    this.recorder = null; // New: Recorder instance
    
    this.isInitialized = false;
    this.isLoaded = false;
  }

  async init() {
    if (this.isInitialized) return;

    await Tone.start();

    // 1. MASTER CHAIN
    // Limiter goes to Speakers AND Recorder
    this.limiter = new Tone.Limiter(-1).toDestination();
    this.recorder = new Tone.Recorder();
    this.limiter.connect(this.recorder);

    this.masterChannel = new Tone.Channel({ volume: -2 }).connect(this.limiter);

    // 2. GLOBAL FX
    this.reverb = new Tone.Reverb({
      decay: 2.5,
      preDelay: 0.01,
      wet: 1 
    }).connect(this.masterChannel);
    
    this.reverbBusGain = new Tone.Gain(0.5).connect(this.masterChannel); 
    this.reverb.disconnect();
    this.reverb.connect(this.reverbBusGain);

    // 3. CHANNEL STRIP INITIALIZATION
    const sampleUrls = [
      "/samples/kick.wav",
      "/samples/snare.wav",
      "/samples/hihat.wav",
      "/samples/clap.wav"
    ];

    const loadPromises = sampleUrls.map((url, i) => {
      return new Promise((resolve) => {
        const player = new Tone.Player({
          url: url,
          onload: resolve,
          onerror: (e) => console.error(`Failed to load ${url}`, e)
        });

        // A. Dry Path
        const channel = new Tone.Channel({ volume: -6 }).connect(this.masterChannel);
        player.connect(channel);

        // B. Wet Path
        const sendGain = new Tone.Gain(0); 
        player.connect(sendGain);
        sendGain.connect(this.reverb);

        this.players[i] = player;
        this.channels[i] = channel;
        this.sendGains[i] = sendGain;
      });
    });

    await Promise.all(loadPromises);

    this.isLoaded = true;
    console.log("Nat's Rack: Engine Ready. Recorder Connected.");

    this.syncMixerState();
    this.isInitialized = true;
  }

  syncMixerState() {
    const { volumes, sends, mutes, masterVolume } = useProject.getState();
    this.updateMasterVolume(masterVolume);
    volumes.forEach((vol, i) => this.updateVolume(i, vol));
    sends.forEach((amt, i) => this.updateSend(i, amt));
    mutes.forEach((isMuted, i) => this.toggleMute(i, isMuted));
  }

  updateVolume(trackIdx, db) {
    if (!this.channels[trackIdx]) return;
    this.channels[trackIdx].volume.rampTo(db, 0.1);
  }

  updateSend(trackIdx, db) {
    if (!this.sendGains[trackIdx]) return;
    const gainVal = db <= -60 ? 0 : Tone.dbToGain(db);
    this.sendGains[trackIdx].gain.rampTo(gainVal, 0.1);
  }

  toggleMute(trackIdx, isMuted) {
    if (!this.players[trackIdx]) return;
    this.players[trackIdx].mute = isMuted;
  }

  updateMasterVolume(db) {
    if (!this.masterChannel) return;
    this.masterChannel.volume.rampTo(db, 0.1);
  }

  // --- PLAYBACK LOGIC ---
  start() {
    if (!this.isLoaded) return;
    this._setupTransport();
    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    useProject.getState().setCurrentStep(0);
    useProject.getState().setCurrentBar(0);
  }

  // --- BOUNCE (EXPORT) LOGIC ---
  async bounce() {
    if (!this.isLoaded) return;
    const state = useProject.getState();
    
    // 1. Lock UI
    state.setExporting(true);
    state.setPlaying(true);

    // 2. Setup Recording
    this.recorder.start();
    this._setupTransport(); // Ensure scheduling is fresh

    // 3. Schedule Stop
    const totalBars = state.timeline.length;
    // Format: "BARS:QUARTERS:SIXTEENTHS" -> e.g. "4:0:0"
    const endTime = `${totalBars}:0:0`;

    Tone.Transport.scheduleOnce(async () => {
      // STOP EVERYTHING
      Tone.Transport.stop();
      Tone.Transport.cancel();
      const recording = await this.recorder.stop();
      
      // DOWNLOAD
      const url = URL.createObjectURL(recording);
      const anchor = document.createElement("a");
      anchor.download = `nats-rack-bounce-${Date.now()}.webm`;
      anchor.href = url;
      anchor.click();

      // RESET STATE
      state.setPlaying(false);
      state.setExporting(false);
      state.setCurrentStep(0);
      state.setCurrentBar(0);
      
      console.log("Bounce Complete.");
    }, endTime);

    // 4. Start Playback (Bounce begins)
    Tone.Transport.start();
  }

  // Helper to centralize the pattern scheduling logic
  _setupTransport() {
    const { bpm } = useProject.getState();
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.cancel(); // Clear old events

    Tone.Transport.scheduleRepeat((time) => {
      const state = useProject.getState();
      
      const totalSteps = Math.floor(Tone.Transport.ticks / Tone.Transport.PPQ * 4); 
      const stepIndex = totalSteps % 16;
      const barIndex = Math.floor(totalSteps / 16);

      // Loop Logic for infinite playback (Engine.start), 
      // but for bounce, the Transport.stop() event will catch it before it loops.
      const patternId = state.timeline[barIndex % state.timeline.length];
      const patternGrid = state.patterns[patternId];

      if (patternGrid) {
        patternGrid.forEach((row, trackIdx) => {
          if (row[stepIndex]) {
            if (this.players[trackIdx].loaded) {
              this.players[trackIdx].start(time);
            }
          }
        });
      }

      Tone.Draw.schedule(() => {
        state.setCurrentStep(stepIndex);
        state.setCurrentBar(barIndex % state.timeline.length);
      }, time);

    }, "16n");
  }
}

export const engine = new AudioEngine();