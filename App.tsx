
import React, { useState } from 'react';
import { Settings, Zap, Brain, Terminal, Layers, Sparkles } from 'lucide-react';
import TTSForm from './components/TTSForm';
import AudioPlayer from './components/AudioPlayer';
import { DirectorialResponse } from './types';

const App: React.FC = () => {
  const [performance, setPerformance] = useState<DirectorialResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-indigo-500/30">
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-[100]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:rotate-12 transition-all duration-500">
              <Zap className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter text-white leading-none">AETHER <span className="text-indigo-500">DIRECTOR</span></h1>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Neural Performance Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(99,102,241,1)]" />
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Model: Gemini 3 Pro (Thinking)</span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <button className="text-gray-500 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 space-y-12">
        <section className="text-center space-y-4 max-w-2xl mx-auto pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-4">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Experimental Synthesis</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            Voice Synthesis with Emotional Intelligence.
          </h2>
          <p className="text-gray-500 leading-relaxed text-sm md:text-base">
            Driven by Gemini 3 Pro's reasoning engine. Aether analyzes subtext, tone, and character motivation to direct browser-native voices into human-like performances.
          </p>
        </section>

        <div className="space-y-12">
          <TTSForm 
            onPerformanceReady={setPerformance}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
          
          <div className="sticky bottom-8 z-50">
            <AudioPlayer performance={performance} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          {[
            { icon: <Brain className="w-4 h-4" />, title: 'Thinking Loop', desc: 'Uses 16k reasoning tokens to understand vocal nuance.' },
            { icon: <Terminal className="w-4 h-4" />, title: 'Local Synthesis', desc: 'No cloud TTS costs. Runs entirely on high-quality local OS voices.' },
            { icon: <Layers className="w-4 h-4" />, title: 'Story Retry', desc: 'Dynamic feedback allows for recursive performance refinement.' }
          ].map((feature, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:bg-white/[0.04] transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                {feature.icon}
              </div>
              <h4 className="font-bold text-sm mb-2">{feature.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 bg-black/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2025 Aether Research Lab</p>
            <p className="text-gray-700 text-[9px] uppercase tracking-widest">Powered by Google Gemini Reasoning Models</p>
          </div>
          <div className="flex gap-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-400 transition-colors">Neural Safety</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Performance API</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Lab Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
