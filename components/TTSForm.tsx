
import React, { useState } from 'react';
import { Settings2, Music, Users, Brain, AudioLines, Fingerprint, PlayCircle, Sliders, LayoutGrid, Plus, Save, Trash2, Zap } from 'lucide-react';
import { analyzeScript, synthesizeSegment, NEURAL_MODELS } from '../services/geminiService';
import { ScriptAnalysis, CharacterDef, VoiceModel, VoiceSettings, VoicePreset } from '../types';

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
  
  // Voice Factory State
  const [presets, setPresets] = useState<VoicePreset[]>([]);
  const [showFactory, setShowFactory] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setError(null);
    setIsProcessing(true);
    setStatus('Initializing Neural Script Scan...');
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
        setStatus(`Performing: ${char.name}`);
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

  const saveToFactory = (char: CharacterDef) => {
    const newPreset: VoicePreset = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Clone of ${char.name}`,
      modelId: char.modelId,
      settings: { ...char.settings }
    };
    setPresets([...presets, newPreset]);
  };

  return (
    <div className="space-y-6 relative">
      {isProcessing && (
        <div className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center p-8 border border-indigo-500/30">
          <div className="relative mb-10">
            <div className="w-32 h-32 rounded-full border-[1px] border-white/5 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-12 h-12 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Neural Performance Active</h3>
          <p className="text-indigo-400 text-xs font-mono uppercase tracking-[0.2em] mb-8">{status}</p>
          <div className="w-full max-w-sm space-y-3">
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.6)]" style={{width: `${progress}%`}} />
             </div>
             <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
               <span>Vocal Consistency</span>
               <span>{progress}%</span>
             </div>
          </div>
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">Script Studio</h2>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => setShowFactory(!showFactory)}
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${showFactory ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 text-gray-500 hover:text-gray-300'}`}
             >
               Voice Factory ({presets.length})
             </button>
             <button 
              onClick={() => setText(`LJ-Narrator: The voice of LJSpeech is stable and consistent.
Arctic-Male: While the Arctic series adds masculine depth.
Aether-Shadow: (whispering) I am the unseen whisper in the dark.
Common-UK: And I provide the elegance of London.`)}
              className="text-[10px] text-indigo-400 hover:text-white uppercase font-bold tracking-tighter"
            >
              Demo Script
            </button>
          </div>
        </div>

        {showFactory && (
          <div className="mb-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-3 animate-in fade-in zoom-in duration-300">
            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Save className="w-3 h-3" /> Cloned Neural Presets
            </h4>
            {presets.length === 0 ? (
              <p className="text-xs text-gray-600 italic">No custom voices saved in the factory yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-black/40 rounded-lg border border-white/5 group">
                    <span className="text-xs text-gray-300 font-medium">{p.name}</span>
                    <button onClick={() => setPresets(presets.filter(x => x.id !== p.id))} className="text-gray-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Script Format: Character Name: Dialogue line..."
          className="w-full h-40 bg-black/50 border border-white/5 rounded-xl p-5 text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all placeholder:text-gray-700 font-medium"
        />

        {!localAnalysis ? (
          <button
            onClick={handleAnalyze}
            disabled={!text.trim()}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            <Fingerprint className="w-5 h-5" />
            <span>Engage Neural Script Parsing</span>
          </button>
        ) : (
          <button
            onClick={handleSynthesize}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.99] animate-pulse-subtle shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Start Neural Synthesis Loop</span>
          </button>
        )}
      </div>

      {localAnalysis && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="flex items-center gap-2 px-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Neural Parameter Modulation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localAnalysis.characters.map(char => (
              <div key={char.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4 group hover:border-indigo-500/30 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white leading-none mb-1 text-base">{char.name}</h4>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">{char.ageGroup} • {char.gender}</span>
                  </div>
                  <button 
                    onClick={() => saveToFactory(char)}
                    className="p-1.5 bg-white/5 hover:bg-indigo-500 hover:text-white rounded-lg text-gray-600 transition-all"
                    title="Clone to Voice Factory"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block tracking-tighter">Selected Neural Dataset</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {NEURAL_MODELS.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => updateCharacterModel(char.id, m.id)}
                        className={`aspect-square rounded-lg border transition-all text-[8px] flex flex-col items-center justify-center gap-1 ${char.modelId === m.id ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'border-white/5 bg-black/40 text-gray-600 hover:border-white/20'}`}
                        title={m.description}
                      >
                        <span className="font-bold">{m.name.split('-')[0]}</span>
                        <span className="opacity-60">{m.name.split('-')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5 pt-4 border-t border-white/5">
                   <div className="space-y-1.5">
                     <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                       <span>Stability</span>
                       <span className="text-indigo-400 font-mono">{char.settings.stability}%</span>
                     </div>
                     <input 
                       type="range" min="0" max="100" value={char.settings.stability} 
                       onChange={(e) => updateSettings(char.id, 'stability', parseInt(e.target.value))}
                       className="w-full h-1 bg-white/5 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                     />
                     <p className="text-[8px] text-gray-600">Higher = robotic consistency, Lower = emotional variation.</p>
                   </div>
                   
                   <div className="space-y-1.5">
                     <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                       <span>Clarity + Artifacting</span>
                       <span className="text-indigo-400 font-mono">{char.settings.clarity}%</span>
                     </div>
                     <input 
                       type="range" min="0" max="100" value={char.settings.clarity} 
                       onChange={(e) => updateSettings(char.id, 'clarity', parseInt(e.target.value))}
                       className="w-full h-1 bg-white/5 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                     />
                     <p className="text-[8px] text-gray-600">Higher = studio fidelity, Lower = natural noise/breathing.</p>
                   </div>

                   <div className="space-y-1.5">
                     <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                       <span>Style Exaggeration</span>
                       <span className="text-indigo-400 font-mono">{char.settings.styleExaggeration}%</span>
                     </div>
                     <input 
                       type="range" min="0" max="100" value={char.settings.styleExaggeration} 
                       onChange={(e) => updateSettings(char.id, 'styleExaggeration', parseInt(e.target.value))}
                       className="w-full h-1 bg-white/5 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
                     />
                     <p className="text-[8px] text-gray-600">Higher = dramatic weight, Lower = neutral delivery.</p>
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
