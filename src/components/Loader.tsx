import React from 'react';

const Loader = ({ message = "Memuat data..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 p-4">
    <div className="relative w-64 md:w-80 h-16 flex flex-col justify-end">
      {/* Running Character */}
      <div className="absolute bottom-[-5px] left-0 animate-character-run w-30 h-30 pointer-events-none">
        <img src="/luffy_run.gif" alt="Loading..." className="w-full h-full object-contain" />
      </div>

      {/* Progress Bar Track */}
      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
        <div className="absolute h-full bg-[var(--primary)] rounded-full animate-progress-loading shadow-[0_0_10px_var(--primary)]"></div>
      </div>
    </div>
    
    <div className="space-y-2 text-center">
      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{message}</h2>
      <p className="text-white/20 text-xs uppercase tracking-[0.3em] font-medium animate-pulse">Sabar ya, Luffy lagi lari...</p>
    </div>
  </div>
);

export default Loader;
