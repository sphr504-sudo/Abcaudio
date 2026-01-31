import React, { useState } from 'react';
import { Settings, Zap, Brain, Terminal, Layers, Sparkles, Activity, MessageSquare, Server, Cpu, Cloud, Database } from 'lucide-react';
import TTSForm from './components/TTSForm';
import AudioPlayer from './components/AudioPlayer';
import DeploymentGuide from './components/DeploymentGuide';
import { DirectorialResponse } from './types';

const App: React.FC = () => {
  const [performance, setPerformance] = useState<DirectorialResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'studio' | 'blueprints'>('studio');

  return (
    <div className="min-h-screen flex flex-col bg-[#020202] text-[#e0e0e0] selection:bg-indigo-500/30">
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-3xl sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-5 group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-rose-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] group-hover:rotate-6 transition-all duration-700 overflow-hidden">
                <div className="absolute inset-0 bg-white/20 animate-sweep" />
                <Zap className="text-white w-6 h-6 relative z-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#020202] rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white leading-none">SHROTA <span className="text-indigo-500">STUDIO</span></h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-2">Professional Neural Synthesis</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('studio')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'studio' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Director Deck
            </button>
            <button 
              onClick={() => setActiveTab('blueprints')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'blueprints' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Deployment Blueprints
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 px-4 py-2 rounded-2xl">
              <Activity className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">v2.5 Deep Neural Engine</span>
            </div>
            <button className="w-10 h-10 rounded-2xl border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-white/5">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12">
        {activeTab === 'studio' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-12">
              <section className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Neural Intelligence Phase</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
                  Cinema-Quality <br/><span className="bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">Voice Directing.</span>
                </h2>
                <p className="text-gray-500 leading-relaxed text-lg max-w-2xl font-medium">
                  Shrota Studio leverages Gemini 3 Pro's deep reasoning to auto-detect demographics—from newborn babies to paranormal ghosts—and orchestrate nuanced emotional performances.
                </p>
              </section>

              <TTSForm 
                onPerformanceReady={setPerformance}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </div>

            <div className="lg:col-span-5 space-y-8">
              <div className="glass-panel rounded-[2rem] p-8 h-full flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                      <Brain className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Analysis Output</h3>
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Shrota Neural Console</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-indigo-500/30" />)}
                  </div>
                </div>

                <div className="flex-1 space-y-8">
                  {performance ? (
                    <>
                      <div className="space-y-6">
                         <div className="flex flex-wrap gap-2">
                            {performance.characters.map(char => (
                              <div key={char.id} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 group hover:border-indigo-500/30 transition-all">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full group-hover:animate-pulse" />
                                <span className="text-[10px] font-bold text-gray-300">{char.name} <span className="text-gray-600">• {char.demographic}</span></span>
                              </div>
                            ))}
                         </div>
                         
                         <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                             <Activity className="w-8 h-8 text-indigo-400" />
                           </div>
                           <p className="text-xs text-indigo-200/80 leading-relaxed italic font-medium">
                             "{performance.thinkingProcess}"
                           </p>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar space-y-4">
                        {performance.segments.map((seg, i) => {
                          const char = performance.characters.find(c => c.id === seg.characterId);
                          return (
                            <div key={seg.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-indigo-500/60 uppercase tracking-tighter">ACT {i+1}</span>
                                  <span className="text-[10px] font-bold text-white uppercase">{char?.name}</span>
                                </div>
                                <span className="text-[9px] font-bold text-indigo-400 uppercase px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20">{seg.direction.emotion}</span>
                              </div>
                              <p className="text-sm text-gray-300 leading-relaxed mb-4">{seg.text}</p>
                              <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-4 text-[9px] font-mono font-bold">
                                   <span>PITCH: {seg.direction.pitch}x</span>
                                   <span>RATE: {seg.direction.rate}x</span>
                                   <span>VOL: {seg.direction.volume}</span>
                                </div>
                                <span className="text-[9px] text-gray-600 font-bold uppercase">{seg.direction.subtext}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 p-12 space-y-6">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center animate-spin-slow">
                        <Layers className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.3em]">No Active Engine</p>
                        <p className="text-xs font-bold text-gray-500 mt-2 uppercase">Analysis pending script injection</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <DeploymentGuide />
        )}

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-50">
           <AudioPlayer performance={performance} />
        </div>
      </main>

      <footer className="border-t border-white/5 py-16 mt-24 bg-black/60 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="text-indigo-500 w-6 h-6" />
              <h3 className="text-lg font-black tracking-tighter uppercase">Shrota Studio</h3>
            </div>
            <p className="text-gray-500 text-sm max-w-sm font-medium leading-relaxed">
              Advancing the state of the art in neural voice synthesis through deep reasoning and emotional trajectory mapping.
            </p>
            <div className="flex gap-4">
              {[Server, Cpu, Cloud, Database].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 hover:text-indigo-400 transition-all">
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">System Architecture</h4>
            <ul className="space-y-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <li>Tacotron 2 + WaveNet v3</li>
              <li>TensorFlow 2.15 Core</li>
              <li>NVIDIA CUDA v12.4</li>
              <li>PyTorch Lightning Engine</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Infrastructure</h4>
            <ul className="space-y-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <li>Kubernetes v1.28</li>
              <li>Docker Registry</li>
              <li>Redis Performance Cache</li>
              <li>PostgreSQL Context Store</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;