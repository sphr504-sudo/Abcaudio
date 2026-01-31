
import React, { useState } from 'react';
import { Settings2, Music, Users, Info, Brain, AudioLines, Fingerprint, PlayCircle, AlertCircle, Sliders, LayoutGrid } from 'lucide-react';
import { analyzeScript, synthesizeSegment, VOICE_MODELS } from '../services/geminiService';
import { ScriptAnalysis, CharacterDef, VoiceModel, VoiceSettings } from '../types';

interface TTSFormProps {
  onAnalysisComplete: (analysis: ScriptAnalysis) => void;
  onAudioComplete: (blobs: string[]) => void;
  setIsProcessing: (val: boolean) => void;
  isProcessing: boolean;
}

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
    setStatus('Detecting Vocal Signatures...');
    try {
      const analysis = await analyzeScript(text);
      setLocalAnalysis(analysis);
      onAnalysisComplete(analysis);
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const handleSynthesize = async () => {
    if (!localAnalysis) return;
    setError(null);
    setIsProcessing(true);
    try {
      const audioParts: string[] = [];
      const total = localAnalysis.segments.length;
      for (let i = 0; i < total; i++) {
        const seg = localAnalysis.segments[i];
        const char = localAnalysis.characters.find(c => c.id === seg.characterId) || localAnalysis.characters[0];
        setCurrentStep({ current: i + 1, total });
        setStatus(`Synthesizing: ${char.name}`);
        setProgress(Math.floor((i / total) * 100));
        const base64 = await synthesizeSegment(seg, char);
        audioParts.push(base64);
      }
      onAudioComplete(audioParts);
      setIsProcessing(false);
      setProgress(0);
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const updateCharacterModel = (charId: string, modelId: string) => {
    if (!localAnalysis) return;
    const updated = {
      ...localAnalysis,
      characters: localAnalysis.characters.map(c => c.id === charId ? { ...c, modelId } : c)
    };
    setLocalAnalysis(updated);
    onAnalysisComplete(updated);
  };

  const updateSettings = (charId: string, key: keyof VoiceSettings, val: number) => {
    if (!localAnalysis) return;
    const updated = {
      ...localAnalysis,
      characters: localAnalysis.characters.map(c => c.id === charId ? { 
        ...c, 
        settings: { ...c.settings, [key]: val } 
      } : c)
    };
    setLocalAnalysis(updated);
  };

  return (
    <div className="space-y-6 relative">
      {isProcessing && (
        <div className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center p-8 border border-indigo-500/30">
          <div className="relative mb-10">
            <div className="w-32 h-32 rounded-full border-[1px] border-white/5 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <AudioLines className="w-12 h-12 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Voice Lab Processing</h3>
          <p className="text-indigo-400 text-xs font-mono uppercase tracking-widest mb-8">{status}</p>
          <div className="w-full max-w-sm space-y-3">
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.6)]" style={{width: `${progress}%`}} />
             </div>
             <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
               <span>Neural Alignment</span>
               <span>{progress}%</span>
             </div>
          </div>
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">Performance Studio</h2>
          </div>
          <button 
            onClick={() => setText(`LJSpeech-v1: Welcome to the Aether Voice Lab.
Arctic-RMS: I can handle deep resonant tones.
Arctic-SLT: And I provide delicate articulation.
Aether-Ghost: We are the voices of the future.`)}
            className="text-[10px] text-indigo-400 hover:text-white uppercase font-bold tracking-tighter"
          >
            Load Prototype Script
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Character Name: Their dialogue line here..."
          className="w-full h-40 bg-black/50 border border-white/5 rounded-xl p-5 text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all placeholder:text-gray-700"
        />

        {!localAnalysis ? (
          <button
            onClick={handleAnalyze}
            disabled={!text.trim()}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
          >
            <Fingerprint className="w-5 h-5" />
            <span>Map Vocal Identities</span>
          </button>
        ) : (
          <button
            onClick={handleSynthesize}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.99] animate-pulse-subtle"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Initiate Full Performance Synthesis</span>
          </button>
        )}
      </div>

      {localAnalysis && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="flex items-center gap-2 px-2">
            <Settings2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Neural Model Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localAnalysis.characters.map(char => (
              <div key={char.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4 group hover:border-indigo-500/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white leading-none mb-1">{char.name}</h4>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-tighter">{char.ageGroup} • {char.gender}</span>
                  </div>
                  <div className="bg-indigo-500/10 px-2 py-0.5 rounded text-[9px] text-indigo-400 font-bold">READY</div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Active Neural Model</label>
                  <div className="grid grid-cols-5 gap-1">
                    {VOICE_MODELS.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => updateCharacterModel(char.id, m.id)}
                        className={`aspect-square rounded-lg border transition-all text-[8px] flex flex-col items-center justify-center gap-1 ${char.modelId === m.id ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-white/5 bg-black/40 text-gray-600 hover:border-white/20'}`}
                        title={m.description}
                      >
                        <span className="font-bold">{m.name.split('-')[0]}</span>
                        <span>{m.name.split('-')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-white/5">
                   <div className="space-y-1">
                     <div className="flex justify-between text-[9px] font-bold text-gray-500">
                       <span>STABILITY</span>
                       <span className="text-indigo-400">{char.settings.stability}%</span>
                     </div>
                     <input 
                       type="range" min="0" max="100" value={char.settings.stability} 
                       onChange={(e) => updateSettings(char.id, 'stability', parseInt(e.target.value))}
                       className="w-full h-1 bg-white/5 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                     />
                   </div>
                   <div className="space-y-1">
                     <div className="flex justify-between text-[9px] font-bold text-gray-500">
                       <span>CLARITY + ENHANCEMENT</span>
                       <span className="text-indigo-400">{char.settings.clarity}%</span>
                     </div>
                     <input 
                       type="range" min="0" max="100" value={char.settings.clarity} 
                       onChange={(e) => updateSettings(char.id, 'clarity', parseInt(e.target.value))}
                       className="w-full h-1 bg-white/5 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                     />
                   </div>
                   <div className="space-y-1">
                     <div className="flex justify-between text-[9px] font-bold text-gray-500">
                       <span>STYLE EXAGGERATION</span>
                       <span className="text-indigo-400">{char.settings.styleExaggeration}%</span>
                     </div>
                     <input 
                       type="range" min="0" max="100" value={char.settings.styleExaggeration} 
                       onChange={(e) => updateSettings(char.id, 'styleExaggeration', parseInt(e.target.value))}
                       className="w-full h-1 bg-white/5 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                     />
                   </div>
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
