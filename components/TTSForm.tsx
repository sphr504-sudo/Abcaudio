import React, { useState, useEffect } from 'react';
import { Brain, MessageSquare, RotateCcw, Send, Sparkles, RefreshCcw, Mic2, Wand2 } from 'lucide-react';
import { directPerformance } from '../services/geminiService';
import { DirectorialResponse, VoiceProfile } from '../types';

interface TTSFormProps {
  onPerformanceReady: (perf: DirectorialResponse) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

const TTSForm: React.FC<TTSFormProps> = ({ onPerformanceReady, isProcessing, setIsProcessing }) => {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [performance, setPerformance] = useState<DirectorialResponse | null>(null);
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length === 0) return;
      
      const mapped = v.map(item => ({
        name: item.name,
        lang: item.lang,
        isLocal: item.localService,
        voiceURI: item.voiceURI
      }));
      setVoices(mapped);
      
      if (!selectedVoiceURI) {
        const preferred = mapped.find(v => v.lang.includes('en')) || mapped[0];
        setSelectedVoiceURI(preferred.voiceURI);
        (window as any).AetherSelectedVoice = preferred.voiceURI;
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoiceURI]);

  const handleProcess = async (isRetry: boolean = false) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await directPerformance(
        text, 
        isRetry ? feedback : undefined,
        performance?.thinkingProcess
      );
      setPerformance(result);
      onPerformanceReady(result);
      if (isRetry) setFeedback('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'The Directorial Brain is currently unavailable. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Script Editor */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 focus-within:border-indigo-500/30 group">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Script Workspace</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Voice:</span>
            <select 
              value={selectedVoiceURI} 
              onChange={(e) => {
                setSelectedVoiceURI(e.target.value);
                (window as any).AetherSelectedVoice = e.target.value;
              }}
              className="bg-black/60 border border-white/10 rounded-full text-[10px] text-gray-400 px-4 py-1.5 outline-none focus:border-indigo-500 transition-all hover:bg-black/80"
            >
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your story, dialogue, or script segment here for directorial analysis..."
          className="w-full h-64 bg-transparent p-8 text-gray-200 focus:outline-none resize-none placeholder:text-gray-700 font-medium leading-relaxed text-lg"
        />

        <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            {text.length} characters • {text.split(/\s+/).filter(x => x).length} words
          </p>
          <button
            onClick={() => handleProcess(false)}
            disabled={isProcessing || !text.trim()}
            className="group relative px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white font-bold rounded-xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
          >
            {isProcessing ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            )}
            <span className="text-sm">Initiate Analysis</span>
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Loop */}
      {performance && (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Wand2 className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Refinement Terminal</h3>
              <p className="text-[10px] text-gray-600 uppercase mt-0.5">Adjust the performance with natural language</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input 
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ex: 'Sound more desperate', 'Whisper the second half', 'Faster pace'..."
                className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-sm text-gray-300 outline-none focus:border-indigo-500 transition-all placeholder:text-gray-700"
                onKeyDown={(e) => e.key === 'Enter' && feedback && handleProcess(true)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  onClick={() => handleProcess(true)}
                  disabled={isProcessing || !feedback.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-white transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => { setText(''); setPerformance(null); onPerformanceReady(null as any); }}
              className="text-[10px] font-bold text-gray-600 uppercase hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" /> Clear Project
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 animate-bounce">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          {error}
        </div>
      )}
    </div>
  );
};

export default TTSForm;