import React from 'react';
import { Terminal, Box, Cloud, Server, ChevronRight, Cpu, Database, Activity, Code2 } from 'lucide-react';

const DeploymentGuide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">High Availability Blueprint</span>
        </div>
        <h2 className="text-5xl font-black tracking-tight">Enterprise Infrastructure</h2>
        <p className="text-gray-500 text-lg max-w-3xl leading-relaxed">
          The SHROTA STUDIO engine is optimized for high-performance neural compute environments. 
          The following specifications ensure real-time synthesis for multi-character dialogues with sub-100ms latency.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Standard VM Node</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Recommended for inference and training orchestration.</p>
          <ul className="space-y-3 text-xs font-bold text-gray-400 uppercase">
            <li className="flex justify-between border-b border-white/5 pb-2"><span>OS</span> <span className="text-white">Ubuntu 22.04 LTS</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span>vCPU</span> <span className="text-white">16 Cores Xeon</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span>RAM</span> <span className="text-white">128GB DDR4</span></li>
          </ul>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-6 border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <div className="px-2 py-0.5 bg-indigo-600 rounded text-[9px] font-black uppercase">Critical</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">GPU Acceleration</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Required for real-time WaveNet and Tacotron 2 processing.</p>
          <ul className="space-y-3 text-xs font-bold text-gray-400 uppercase">
            <li className="flex justify-between border-b border-white/5 pb-2"><span>GPU</span> <span className="text-white">Tesla V100 32GB</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span>Storage</span> <span className="text-white">2TB NVMe SSD</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span>Throughput</span> <span className="text-white">10 Gbps Symmetrical</span></li>
          </ul>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Model Assets</h3>
          <p className="text-sm text-gray-500 leading-relaxed">High-quality pre-trained public dataset integration.</p>
          <ul className="space-y-3 text-xs font-bold text-gray-400 uppercase">
            <li className="flex justify-between border-b border-white/5 pb-2"><span>LJ Speech</span> <span className="text-white">English Female</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span>CMU Arctic</span> <span className="text-white">Multi-Male</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span>Common Voice</span> <span className="text-white">Crowdsourced</span></li>
          </ul>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-black border border-white/10 rounded-3xl overflow-hidden group">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Box className="text-emerald-500 w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Docker Implementation</h3>
            </div>
            <Code2 className="w-4 h-4 text-gray-600" />
          </div>
          <div className="p-8 font-mono text-[11px] text-emerald-400/80 bg-black/80 leading-relaxed overflow-x-auto">
            <pre>{`FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04

# Core Dependencies for SHROTA
RUN apt-get update && apt-get install -y \\
    ffmpeg libsndfile1-dev python3-pip python3-dev \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /shrota_core
COPY requirements.txt .

# Optimized Neural Runtime
RUN pip3 install --no-cache-dir torch torchaudio --index-url \\
    https://download.pytorch.org/whl/cu118

RUN pip3 install --no-cache-dir shrota-sdk tacotron2-v3

# Deploying Public Reference Weights
COPY ./weights/ljspeech_v3.bin ./weights/
COPY ./weights/ghost_voice_v1.bin ./weights/

COPY . .
EXPOSE 8080

CMD ["python3", "-m", "shrota_studio.api"]`}</pre>
          </div>
        </section>

        <section className="bg-black border border-white/10 rounded-3xl overflow-hidden group">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Cloud className="text-indigo-500 w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-widest">K8s Orchestration</h3>
            </div>
            <Terminal className="w-4 h-4 text-gray-600" />
          </div>
          <div className="p-8 font-mono text-[11px] text-indigo-400/80 bg-black/80 leading-relaxed overflow-x-auto">
            <pre>{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: shrota-neural-cluster
spec:
  replicas: 12
  selector:
    matchLabels:
      component: tts-worker
  template:
    spec:
      containers:
      - name: synthesis-node
        image: shrota/neural-engine:2.5
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: "32Gi"
            cpu: "8"
---
apiVersion: v1
kind: Service
metadata:
  name: shrota-lb
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080`}</pre>
          </div>
        </section>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-[3rem] p-12 flex flex-col items-center text-center space-y-8">
        <h3 className="text-3xl font-black">Ready for Global Scale</h3>
        <p className="text-gray-400 max-w-2xl font-medium">
          Our architecture supports regional sharding, ensuring that Shrota's paranormal and newborn demographic models 
          load instantly via a distributed Redis context store.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-8 py-4 bg-white text-black font-black rounded-2xl flex items-center gap-3 hover:scale-105 transition-all">
            Clone Repo <Terminal className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 bg-white/5 border border-white/10 font-black rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all">
            Architecture Map <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentGuide;