/**
 * 2026-01-04 PHASE 5: DEPLOYMENT & HOSTING (Refactor)
 * - Optimized detection logic (Removed unnecessary useEffect/useState).
 * - Fixed Tailwind class warning (z-100).
 */

import React from 'react';

export default function EnvironmentBanner() {
  // Logic: Calculate directly during render. 
  // Window location does not change without a page reload.
  const host = window.location.hostname;
  
  let env = 'PROD';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    env = 'DEV';
  } else if (host.includes('uat') || host.includes('staging')) {
    env = 'UAT';
  } else if (host.includes('preview')) {
    env = 'PREVIEW';
  }

  // PROD stays invisible
  if (env === 'PROD') return null;

  // Configuration for different tiers
  const config = {
    DEV: { 
      color: 'bg-blue-600', 
      text: 'LOCAL DEVELOPMENT', 
      sub: 'Audio Engine: Unrestricted' 
    },
    UAT: { 
      color: 'bg-yellow-500', 
      text: 'UAT ENVIRONMENT', 
      sub: 'Release Candidate - Do Not Use for Production' 
    },
    PREVIEW: { 
      color: 'bg-purple-600', 
      text: 'PR PREVIEW', 
      sub: 'Feature Testing' 
    },
  };

  const activeConf = config[env] || config.DEV;

  return (
    <div className={`
      fixed top-0 left-0 w-full h-8 z-100 ${activeConf.color} 
      flex justify-center items-center gap-4 shadow-lg
    `}>
      <span className="text-white font-black text-[10px] tracking-[0.2em] uppercase">
        ⚠️ {activeConf.text}
      </span>
      <span className="text-white/80 font-mono text-[9px] hidden sm:block">
        {activeConf.sub}
      </span>
      <span className="text-white/60 font-mono text-[8px] absolute right-4">
        v{__APP_VERSION__} ({__GIT_HASH__})
      </span>
    </div>
  );
}