import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Square, Activity, Brain, Volume2, Sparkles } from 'lucide-react';
import { DirectorialResponse } from '../types';

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

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;
      const time = Date.now() / 1000;

      if (isSpeaking) {
        ctx.beginPath();
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < 150; i++) {
          const x = (i / 150) * canvas.width;
          const noise = Math.sin(time * 15 + i * 0.1) * (Math.random() * 8 + 12);
          const y = centerY + Math.sin(time * 10 + i * 0.05) * noise;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Secondary glow wave
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.2)';
        ctx.lineWidth = 8;
        for (let i = 0; i < 150; i++) {
          const x = (i / 150) * canvas.width;
          const y = centerY + Math.sin(time * 5 + i * 0.03) * 15;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
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
    
    // Character Voice Recovery
    const char = performance.characters.find(c => c.id === seg.characterId);
    const selectedVoiceURI = char?.assignedVoiceURI || (window as any).AetherSelectedVoice;
    
    if (selectedVoiceURI) {
      const voice = synth.getVoices().find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    // Directorial Overrides from Shrota Engine
    utterance.pitch = seg.direction.pitch;
    utterance.rate = seg.direction.rate;
    utterance.volume = seg.direction.volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSegmentIdx(idx);
    };

    utterance.onend = () => {
      if (isPlaying) speakSegment(idx + 1);
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

  const activeSegment = currentSegmentIdx >= 0 ? performance.segments[currentSegmentIdx] : null;
  const activeChar = activeSegment ? performance.characters.find(c => c.id === activeSegment.characterId) : null;

  return (
    <div className="bg-black/80 border border-white/10 rounded-full px-10 py-5 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex items-center gap-10 group/player border-t-white/20">
      <button
        onClick={handleToggle}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 relative shrink-0 overflow-hidden ${
          isPlaying 
            ? 'bg-rose-500/10 border border-rose-500/50 text-rose-500' 
            : 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110'
        }`}
      >
        {isPlaying ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={28} className="ml-1" />}
        {isSpeaking && (
           <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-ping pointer-events-none" />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className={`w-4 h-4 ${isSpeaking ? 'text-indigo-400' : 'text-gray-700'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                {isSpeaking ? 'NEURAL SYNTHESIS ACTIVE' : 'SHROTA ENGINE IDLE'}
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[200px]">
                {activeChar ? `${activeChar.name} as ${activeChar.demographic}` : performance.overallMood}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {performance.segments.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i === currentSegmentIdx ? 'bg-white w-6 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 
                  i < currentSegmentIdx ? 'bg-indigo-900' : 'bg-white/5'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="h-12 bg-white/5 rounded-full border border-white/5 overflow-hidden px-6 flex items-center group-hover/player:border-white/10 transition-colors">
          <canvas ref={canvasRef} width={1200} height={48} className="w-full h-full opacity-70" />
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-end gap-2 shrink-0 pl-8 border-l border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Acting Note</span>
        </div>
        <div className="text-[10px] text-indigo-200/60 font-medium italic text-right max-w-[200px] leading-tight">
          {activeSegment ? `"${activeSegment.direction.subtext}"` : 'Analysis Complete'}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;