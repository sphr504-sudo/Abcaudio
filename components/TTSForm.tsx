
import React, { useState, useEffect, useRef } from 'react';
import { Brain, MessageSquare, Play, RotateCcw, Send, Settings, Sparkles, Volume2, Waveform, RefreshCcw } from 'lucide-react';
import { directPerformance } from '../services/geminiService';
import { DirectorialResponse, PerformanceSegment, VoiceProfile } from '../types';

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
      setVoices(v.map(item => ({
        name: item.name,
        lang: item.lang,
        isLocal: item.localService,
        voiceURI: item.voiceURI
      })));
      if (v.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(v[0].voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

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
      setError(err.message || 'Directorial engine failure.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Scene Input</h2>
          </div>
          <select 
            value={selectedVoiceURI} 
            onChange={(e) => {
              setSelectedVoiceURI(e.target.value);
              (window as any).AetherSelectedVoice = e.target.value;
            }}
            className="bg-black/40 border border-white/10 rounded-lg text-[10px] text-gray-400 px-2 py-1 outline-none focus:border-indigo-500 max-w-[200px]"
          >
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a story or dialogue script here..."
          className="w-full h-48 bg-transparent p-6 text-gray-200 focus:outline-none resize-none placeholder:text-gray-700 font-medium leading-relaxed"
        />

        <div className="p-4 bg-black/20 flex gap-4">
          <button
            onClick={() => handleProcess(false)}
            disabled={isProcessing || !text.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            {isProcessing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            <span>Direct Performance</span>
          </button>
        </div>
      </div>

      {performance && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <Sparkles className="w-12 h-12 text-indigo-400" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Director's Note (Thinking Output)</h3>
                <p className="text-[10px] text-gray-500 uppercase">Analysis Complete • {performance.overallMood}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-indigo-500/40 pl-4 py-1">
              {performance.thinkingProcess}
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Story Retry / Refinement</h3>
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ex: 'Make it more dramatic', 'Slow down the pace', 'Whisper more'..."
                className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none focus:border-indigo-500 transition-all"
              />
              <button
                onClick={() => handleProcess(true)}
                disabled={isProcessing || !feedback.trim()}
                className="px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-2 text-xs font-bold uppercase transition-all disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default TTSForm;
