import React from 'react';
import UserRestController from './components/UserRestController';
import Index from './components/Index';
import ViteConfig from './components/ViteConfig';
import App from './components/App';
import Main from './components/Main';
import GeminiInsights from './components/GeminiInsights';
import Forecast from './components/Forecast';
import LoadModel from './components/LoadModel';
import VertexPredict from './components/VertexPredict';
import Firebase from './components/Firebase';
import Redistribution from './components/Redistribution';
import Firestore from './components/Firestore';
import MockPhcs from './components/MockPhcs';
import TrainModel from './components/TrainModel';
import GenerateFederatedData from './components/GenerateFederatedData';
import GenerateTrainingData from './components/GenerateTrainingData';
import TrainFederated from './components/TrainFederated';
import MockMedicines from './components/MockMedicines';
import LanguageContext from './components/LanguageContext';
import PhcDetail from './components/PhcDetail';
import BricsNetwork from './components/BricsNetwork';
import Dashboard from './components/Dashboard';
import FederatedIntelligence from './components/FederatedIntelligence';
import DistrictsSummary from './components/DistrictsSummary';
import AlertsList from './components/AlertsList';

/**
 * Modernized React Application Entry Point
 * Migrated across 2 project layer(s) by Legacy Rescue Engine
 
 */
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Modernized Application</h1>
        <p className="text-xs text-slate-400">
          Detected Layers: Java → Spring Boot | jQuery → React
        </p>
      </header>

      <main className="space-y-6">
        <section><UserRestController /></section>
        <section><Index /></section>
        <section><ViteConfig /></section>
        <section><App /></section>
        <section><Main /></section>
        <section><GeminiInsights /></section>
        <section><Forecast /></section>
        <section><LoadModel /></section>
        <section><VertexPredict /></section>
        <section><Firebase /></section>
        <section><Redistribution /></section>
        <section><Firestore /></section>
        <section><MockPhcs /></section>
        <section><TrainModel /></section>
        <section><GenerateFederatedData /></section>
        <section><GenerateTrainingData /></section>
        <section><TrainFederated /></section>
        <section><MockMedicines /></section>
        <section><LanguageContext /></section>
        <section><PhcDetail /></section>
        <section><BricsNetwork /></section>
        <section><Dashboard /></section>
        <section><FederatedIntelligence /></section>
        <section><DistrictsSummary /></section>
        <section><AlertsList /></section>
      </main>
    </div>
  );
}