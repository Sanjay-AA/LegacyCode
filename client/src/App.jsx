import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />
      <Dashboard />
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <p>Legacy Rescue — BuildSprint 2026 • jQuery to React Autonomous Modernization Agent</p>
      </footer>
    </div>
  );
}
