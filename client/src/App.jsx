import React from 'react';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-[#070a0e] text-slate-100 flex flex-col font-sans selection:bg-[#10b981]/20 selection:text-[#10b981]">
      <Dashboard />
      <footer className="mt-auto border-t border-[#1c2e38] bg-[#0c1219] py-4 text-center text-xs text-slate-500 font-mono">
        <p>LEGACY RESCUE • Autonomous Modernization Platform • Verifiable Behavioral Pipeline</p>
      </footer>
    </div>
  );
}
