import React, { useState } from 'react';
import { Settings, Zap, Brain, Terminal, Layers, Sparkles, Activity, MessageSquare } from 'lucide-react';
import TTSForm from './components/TTSForm';
import AudioPlayer from './components/AudioPlayer';
import TextAnalysisPanel from './components/TextAnalysisPanel';
import { DirectorialResponse } from './types';

const App: React.FC = () => {
  const [performance, setPerformance] = useState<DirectorialResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-indigo-500/30">
      <header className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:rotate-12 transition-all duration-500">
              <Zap className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter text-white leading-none">AETHER <span className="text-indigo-500">DIRECTOR</span></h1>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Neural Synthesis Orchestrator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(99,102,241,1)]" />
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Core: Gemini 3 Pro (Thinking)</span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <button className="text-gray-500 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Directorial Input & Feedback */}
          <div className="lg:col-span-7 space-y-8">
            <section className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-2">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Next-Gen Performance Lab</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Vocal Synthesis with <span className="text-indigo-500">Emotional Intelligence.</span>
              </h2>
              <p className="text-gray-500 leading-relaxed text-sm md:text-base max-w-2xl">
                Aether doesn't just read text—it understands it. Using Gemini 3 Pro's deep reasoning, we map emotional subtext, cadence, and emphasis to local system voices.
              </p>
            </section>

            <TTSForm 
              onPerformanceReady={setPerformance}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </div>

          {/* Right Column: Neural Intelligence Output */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Brain className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300">Analysis Console</h3>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
                  <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
                  <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
                </div>
              </div>

              <div className="flex-1 flex flex-col space-y-6">
                {performance ? (
                  <>
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                         <Activity className="w-3 h-3" />
                         Overall Mood: {performance.overallMood}
                       </div>
                       <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl">
                         <p className="text-xs text-indigo-200/70 leading-relaxed italic">
                           "{performance.thinkingProcess}"
                         </p>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar space-y-3">
                      {performance.segments.map((seg, i) => (
                        <div key={seg.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all group">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Segment {i+1}</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase px-2 py-0.5 bg-indigo-500/10 rounded">{seg.direction.emotion}</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-snug mb-3 group-hover:text-white transition-colors">{seg.text}</p>
                          <div className="flex gap-4 opacity-50 text-[9px] font-mono group-hover:opacity-100 transition-opacity">
                             <span>Pitch: {seg.direction.pitch}x</span>
                             <span>Rate: {seg.direction.rate}x</span>
                             <span>Vol: {seg.direction.volume}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 p-12 space-y-4">
                    <Layers className="w-12 h-12 mb-2" />
                    <p className="text-sm font-medium">No performance map active.<br/>Initialize directorial analysis to begin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Global Floating Player */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
           <AudioPlayer performance={performance} />
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 mt-20 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2025 Aether Intelligence Group</p>
            <p className="text-gray-700 text-[9px] uppercase tracking-widest">Designed for Professional Script Direction & Synthesis</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { icon: <Brain className="w-4 h-4" />, label: '16K Reasoning' },
              { icon: <Terminal className="w-4 h-4" />, label: 'Local Engine' },
              { icon: <Layers className="w-4 h-4" />, label: 'Multi-Segment' },
              { icon: <Activity className="w-4 h-4" />, label: 'Live Feedback' }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                <div className="text-indigo-500">{f.icon}</div>
                <span className="text-[9px] font-bold uppercase text-gray-400">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;