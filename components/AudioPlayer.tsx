import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Square, Volume2, Activity, Sparkles, Brain, Wand2 } from 'lucide-react';
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

  // Visualizer loop for real-time synthesis feedback
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
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(99,102,241,0.5)';
        
        for (let i = 0; i < 100; i++) {
          const x = (i / 100) * canvas.width;
          const noise = Math.sin(time * 12 + i * 0.2) * (Math.random() * 5 + 10);
          const y = centerY + Math.sin(time * 8 + i * 0.1) * noise;
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
    
    // Voice Selection Recovery
    const selectedVoiceURI = (window as any).AetherSelectedVoice;
    if (selectedVoiceURI) {
      const voice = synth.getVoices().find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    // Directorial Mapping
    utterance.pitch = Math.max(0.5, Math.min(2.0, seg.direction.pitch));
    utterance.rate = Math.max(0.1, Math.min(10.0, seg.direction.rate));
    utterance.volume = Math.max(0, Math.min(1.0, seg.direction.volume));

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSegmentIdx(idx);
    };

    utterance.onend = () => {
      if (isPlaying) speakSegment(idx + 1);
    };

    utterance.onerror = (e) => {
      console.error('Synthesis Error:', e);
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
    <div className="bg-[#0a0a0a]/90 border border-indigo-500/30 rounded-full px-8 py-4 backdrop-blur-3xl shadow-[0_0_50px_rgba(99,102,241,0.2)] flex items-center gap-8 group/player">
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 relative shrink-0 ${
          isPlaying 
            ? 'bg-red-500/10 border border-red-500/40 text-red-400' 
            : 'bg-indigo-600 border border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-110 active:scale-95'
        }`}
      >
        {isPlaying ? <Square fill="currentColor" size={20} /> : <Play fill="currentColor" size={24} className="ml-1" />}
        {isSpeaking && (
           <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-ping pointer-events-none" />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Activity className={`w-3 h-3 ${isSpeaking ? 'text-indigo-400' : 'text-gray-600'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              {isSpeaking ? `Actuating: ${performance.segments[currentSegmentIdx]?.direction.emotion}` : 'Aether Engine Ready'}
            </span>
          </div>
          <div className="flex gap-1.5">
            {performance.segments.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSegmentIdx ? 'bg-indigo-400 w-4 shadow-[0_0_8px_rgba(99,102,241,1)]' : 
                  i < currentSegmentIdx ? 'bg-indigo-900' : 'bg-white/5'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="h-10 bg-black/40 rounded-full border border-white/5 overflow-hidden px-4 flex items-center group-hover/player:border-indigo-500/20 transition-colors">
          <canvas ref={canvasRef} width={800} height={40} className="w-full h-full opacity-60" />
        </div>
      </div>

      <div className="hidden md:flex flex-col items-end gap-1 shrink-0 pl-4 border-l border-white/10">
        <div className="flex items-center gap-2">
          <Brain className="w-3 h-3 text-indigo-400" />
          <span className="text-[9px] font-bold text-gray-400 uppercase">Neural Context</span>
        </div>
        <div className="text-[10px] text-gray-600 font-mono italic truncate max-w-[150px]">
          {currentSegmentIdx >= 0 ? performance.segments[currentSegmentIdx].direction.subtext : performance.overallMood}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;