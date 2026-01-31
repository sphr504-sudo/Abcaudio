
import React, { useState } from 'react';
import { Sparkles, Loader2, Music, Users, Info, Brain, AudioLines, Fingerprint, PlayCircle, AlertCircle } from 'lucide-react';
import { analyzeScript, synthesizeSegment } from '../services/geminiService';
import { ScriptAnalysis, CharacterDef, Voice } from '../types';

interface TTSFormProps {
  onAnalysisComplete: (analysis: ScriptAnalysis) => void;
  onAudioComplete: (blobs: string[]) => void;
  setIsProcessing: (val: boolean) => void;
  isProcessing: boolean;
}

const VOICES: Voice[] = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

const TTSForm: React.FC<TTSFormProps> = ({ 
  onAnalysisComplete, 
  onAudioComplete, 
  setIsProcessing,
  isProcessing 
}) => {
  const [text, setText] = useState('');
  const [localAnalysis, setLocalAnalysis] = useState<ScriptAnalysis | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<{ current: number; total: number } | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setStatus('Scanning Script for Bio-Signatures...');
    setCurrentStep(null);

    try {
      setProgress(20);
      const analysis = await analyzeScript(text);
      setLocalAnalysis(analysis);
      onAnalysisComplete(analysis);
      setProgress(100);
      setStatus('Character Analysis Complete');
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
      setIsProcessing(false);
    }
  };

  const handleSynthesize = async () => {
    if (!localAnalysis) return;

    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setStatus('Initializing Neural Synthesis Engine...');

    try {
      const audioParts: string[] = [];
      const total = localAnalysis.segments.length;
      setCurrentStep({ current: 0, total });

      for (let i = 0; i < total; i++) {
        const seg = localAnalysis.segments[i];
        const char = localAnalysis.characters.find(c => c.id === seg.characterId) || localAnalysis.characters[0];
        
        setCurrentStep({ current: i + 1, total });
        setStatus(`Synthesizing Voice: ${char.name}`);
        
        // Ensure progress is visible
        const currentProgress = Math.floor((i / total) * 100);
        setProgress(currentProgress);

        const base64 = await synthesizeSegment(seg, char);
        audioParts.push(base64);
        
        const nextProgress = Math.floor(((i + 1) / total) * 100);
        setProgress(nextProgress);
      }

      onAudioComplete(audioParts);
      setStatus('Audio Generation Finalized');
      setTimeout(() => {
        setProgress(0);
        setCurrentStep(null);
        setIsProcessing(false);
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Synthesis failed');
      setIsProcessing(false);
    }
  };

  const updateCharacterVoice = (charId: string, voice: Voice) => {
    if (!localAnalysis) return;
    const updated = {
      ...localAnalysis,
      characters: localAnalysis.characters.map(c => c.id === charId ? { ...c, baseVoice: voice } : c)
    };
    setLocalAnalysis(updated);
    onAnalysisComplete(updated);
  };

  const setSample = () => {
    setText(`Narrator: The old manor stood silent, but the air felt heavy.
Arthur: (fearful) Is someone there? I can hear your breathing.
Ghost: (whispering) I have been waiting for you, Arthur. For eighty years.
Baby: (giggling) Da-da!`);
    setLocalAnalysis(null);
    setError(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-500 uppercase">Engine Error</h4>
            <p className="text-xs text-red-400/80 mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 text-xs font-bold uppercase hover:underline">Dismiss</button>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center p-8 border border-indigo-500/20 animate-in fade-in zoom-in duration-300">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-10 h-10 text-indigo-400 animate-pulse" />
            </div>
          </div>
          
          <div className="text-center space-y-4 w-full max-w-xs">
            <h3 className="text-xl font-bold text-white tracking-tight">Neural Processing</h3>
            <p className="text-indigo-400 text-[10px] font-mono uppercase tracking-[0.2em]">{status}</p>
            
            {currentStep && (
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <AudioLines className="w-4 h-4" />
                <span className="text-sm font-medium">Segment {currentStep.current} / {currentStep.total}</span>
              </div>
            )}

            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-[10px] font-bold text-gray-500">
                <span>SYSTEM PROGRESS</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Music className="w-4 h-4 text-indigo-500" /> Script Manuscript
          </label>
          <button 
            onClick={setSample} 
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            disabled={isProcessing}
          >
            Load Multi-Character Sample
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (localAnalysis) setLocalAnalysis(null);
            if (error) setError(null);
          }}
          placeholder="Format: Character Name: Dialogue line..."
          disabled={isProcessing}
          className="w-full h-48 bg-black/40 border border-white/5 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all placeholder:text-gray-600 disabled:opacity-50"
        />

        {!localAnalysis ? (
          <button
            onClick={handleAnalyze}
            disabled={isProcessing || !text.trim()}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg group active:scale-[0.98]"
          >
            <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Analyze Script & Detect Cast</span>
          </button>
        ) : (
          <button
            onClick={handleSynthesize}
            disabled={isProcessing}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg group active:scale-[0.98] animate-pulse-subtle"
          >
            <PlayCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Generate Full Audio Output</span>
          </button>
        )}
      </div>

      {localAnalysis && !isProcessing && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="text-indigo-500 w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Detected Cast & Persona Map</h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold border border-emerald-400/30 px-2 py-0.5 rounded">MODELS READY</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localAnalysis.characters.map(char => (
              <div key={char.id} className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col gap-3 group hover:border-indigo-500/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{char.name}</h4>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase">{char.ageGroup} • {char.gender}</span>
                  </div>
                  <div className="relative group/info">
                    <Info className="w-3 h-3 text-gray-600 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-[10px] text-gray-400 opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl">
                      {char.traits}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {VOICES.map(v => (
                    <button
                      key={v}
                      onClick={() => updateCharacterVoice(char.id, v)}
                      className={`text-[10px] px-2 py-1 rounded transition-all ${char.baseVoice === v ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TTSForm;
