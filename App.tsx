
import React, { useState } from 'react';
import { Settings, Shield, Cpu, Cloud, Terminal, MessageSquare, Waves, Mic2 } from 'lucide-react';
import TTSForm from './components/TTSForm';
import DeploymentGuide from './components/DeploymentGuide';
import AudioPlayer from './components/AudioPlayer';
import TextAnalysisPanel from './components/TextAnalysisPanel';
import { ScriptAnalysis } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'deploy'>('studio');
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const [audioBlobs, setAudioBlobs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Mic2 className="text-white w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">AETHER <span className="text-indigo-500">VOICE LAB</span></h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveTab('studio')} className={`text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'studio' ? 'text-white border-b-2 border-indigo-500 pb-1' : 'text-gray-500 hover:text-gray-300'}`}>
              Studio
            </button>
            <button onClick={() => setActiveTab('deploy')} className={`text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'deploy' ? 'text-white border-b-2 border-indigo-500 pb-1' : 'text-gray-500 hover:text-gray-300'}`}>
              Infrastructure
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Neural Cluster 01-A</span>
            </div>
            <Settings className="text-gray-500 hover:text-white cursor-pointer w-4 h-4 transition-colors" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              <TTSForm 
                onAnalysisComplete={(a) => setAnalysis(a as any)} 
                onAudioComplete={setAudioBlobs}
                setIsProcessing={setIsProcessing}
                isProcessing={isProcessing}
              />
              {audioBlobs.length > 0 && (
                <div className="sticky bottom-6 z-40">
                  <AudioPlayer blobs={audioBlobs} />
                </div>
              )}
            </div>
            <div className="lg:col-span-4">
              <div className="sticky top-28">
                <TextAnalysisPanel analysis={analysis as any} isProcessing={isProcessing} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deploy' && <DeploymentGuide />}
      </main>

      <footer className="border-t border-white/5 py-10 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">© 2025 Aether Labs • Zero-Shot Voice Intelligence</p>
          <div className="flex gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-400 transition-colors">API Keys</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Latency Stats</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
