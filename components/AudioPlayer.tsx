
import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Square, Volume2, Activity, Music, Sparkles } from 'lucide-react';
import { DirectorialResponse, PerformanceSegment } from '../types';

interface AudioPlayerProps {
  performance: DirectorialResponse | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ performance }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const synth = window.speechSynthesis;

  // Visualizer loop
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = Date.now() / 1000;

      if (isSpeaking) {
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        for (let i = 0; i < 50; i++) {
          const x = (i / 50) * canvas.width;
          const amplitude = 15 + Math.sin(time * 10 + i) * 10;
          const y = centerY + Math.sin(time * 5 + i * 0.5) * amplitude;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();
      }
      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isSpeaking]);

  const speakSegment = (idx: number) => {
    if (!performance || idx >= performance.segments.length) {
      setIsPlaying(false);
      setIsSpeaking(false);
      setCurrentSegmentIdx(-1);
      return;
    }

    const seg = performance.segments[idx];
    const utterance = new SpeechSynthesisUtterance(seg.text);
    
    // Set voice from global state
    const selectedVoiceURI = (window as any).AetherSelectedVoice;
    if (selectedVoiceURI) {
      const voice = synth.getVoices().find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    // Apply Gemini's directorial directions
    utterance.pitch = seg.direction.pitch;
    utterance.rate = seg.direction.rate;
    utterance.volume = seg.direction.volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSegmentIdx(idx);
    };

    utterance.onend = () => {
      speakSegment(idx + 1);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsSpeaking(false);
    };

    synth.speak(utterance);
  };

  const handleToggle = () => {
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      setIsSpeaking(false);
      setCurrentSegmentIdx(-1);
    } else {
      if (!performance) return;
      setIsPlaying(true);
      speakSegment(0);
    }
  };

  if (!performance) return null;

  return (
    <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
      
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div className="relative group">
          <button
            onClick={handleToggle}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 ${
              isPlaying ? 'bg-red-500/20 border border-red-500/50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-indigo-600 border border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105'
            }`}
          >
            {isPlaying ? <Square fill="currentColor" size={28} /> : <Play fill="currentColor" size={32} className="ml-1" />}
          </button>
          {isSpeaking && (
            <div className="absolute inset-[-8px] border-2 border-indigo-500/30 rounded-full animate-ping pointer-events-none" />
          )}
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Vocal Bio-Monitor</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {currentSegmentIdx !== -1 ? `Actulating Segment ${currentSegmentIdx + 1}` : 'Synthesis Engine Idle'}
              </h3>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Directed by Gemini Pro</span>
            </div>
          </div>

          <div className="h-24 bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
            <canvas ref={canvasRef} width={600} height={100} className="w-full h-full opacity-80" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {performance.segments.map((seg, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  i === currentSegmentIdx ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 
                  i < currentSegmentIdx ? 'bg-indigo-900' : 'bg-white/5'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>

      {currentSegmentIdx !== -1 && performance.segments[currentSegmentIdx] && (
        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
           <div className="space-y-4">
             <div className="flex items-center gap-2">
               <Volume2 className="w-4 h-4 text-gray-500" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Vocal parameters</span>
             </div>
             <div className="flex flex-wrap gap-3">
               <div className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg">
                 <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Pitch</p>
                 <p className="text-xs font-mono text-indigo-400">{performance.segments[currentSegmentIdx].direction.pitch}x</p>
               </div>
               <div className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg">
                 <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Rate</p>
                 <p className="text-xs font-mono text-indigo-400">{performance.segments[currentSegmentIdx].direction.rate}x</p>
               </div>
               <div className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg">
                 <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Emotion</p>
                 <p className="text-xs font-bold text-indigo-300 uppercase">{performance.segments[currentSegmentIdx].direction.emotion}</p>
               </div>
             </div>
           </div>
           
           <div className="space-y-4">
             <div className="flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-amber-500" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Neural Subtext</span>
             </div>
             <p className="text-sm text-gray-400 italic leading-relaxed">
               "{performance.segments[currentSegmentIdx].direction.subtext}"
             </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
