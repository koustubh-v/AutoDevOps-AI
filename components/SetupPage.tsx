import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { predictStackFromUrl } from '../services/gemini';
import git from 'isomorphic-git';
import LightningFS from 'lightning-fs';

interface SetupPageProps {
  onLaunch: (config: any) => void;
  onBack: () => void;
  history?: any[];
  onLoadSession?: (session: any) => void;
}

const fs = new LightningFS('autodevops-fs');

const http = {
  async request({ url, method, headers, body }: any) {
    // CORS proxy to handle browser-side cloning
    const proxyUrl = `https://cors.isomorphic-git.org/?url=${encodeURIComponent(url)}`;
    
    try {
      const res = await fetch(proxyUrl, { method, headers, body });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.arrayBuffer();
      const responseHeaders: { [key: string]: string } = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const bodyIterator = (async function* () {
        yield new Uint8Array(data);
      })();

      return {
        url: res.url,
        method,
        headers: responseHeaders,
        body: bodyIterator,
        statusCode: res.status,
        statusMessage: res.statusText,
      };
    } catch (e: any) {
      console.error("Git Request Error:", e);
      throw new Error(`Git Network Fault: ${e.message}. Ensure the repository is public and accessible via CORS.`);
    }
  }
};

const CircularProgress = ({ value, label }: { value: number; label: string }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-4">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-[#3c4043]"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease' }}
            className="text-[#8ab4f8]"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
          {Math.round(value)}%
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#9aa0a6] text-center max-w-[120px]">{label}</span>
    </div>
  );
};

const SetupPage: React.FC<SetupPageProps> = ({ onLaunch, onBack, history = [], onLoadSession }) => {
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [techStack, setTechStack] = useState('Auto (AI)');
  
  const [prepStatus, setPrepStatus] = useState<'idle' | 'running' | 'complete' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Standby');
  const [preflightData, setPreflightData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const abortController = useRef<AbortController | null>(null);

  const performPreflight = async (url: string, b: string) => {
    if (!url || !url.includes('github.com')) return;
    
    setPrepStatus('running');
    setProgress(5);
    setProgressLabel('Initializing FS');
    setError(null);
    
    const dir = '/repo';
    const pfs = fs.promises;

    try {
      // Clear previous repo
      try { await pfs.rmdir(dir, { recursive: true }); } catch (e) {}
      await pfs.mkdir(dir);
      
      setProgress(15);
      setProgressLabel('Cloning Repo');
      
      await git.clone({
        fs,
        http,
        dir,
        url,
        ref: b,
        singleBranch: true,
        depth: 1,
        onProgress: (p) => {
          const percent = 15 + (p.loaded / (p.total || 1000000)) * 40;
          setProgress(Math.min(55, percent));
          if (p.phase) setProgressLabel(p.phase);
        }
      });

      setProgress(60);
      setProgressLabel('Scanning Files');
      
      const fileTree: string[] = [];
      const walk = async (path: string) => {
        const files = await pfs.readdir(path);
        for (const file of files) {
          if (file === '.git') continue;
          const fullPath = `${path}/${file}`;
          const stat = await pfs.lstat(fullPath);
          if (stat.isDirectory()) {
            await walk(fullPath);
          } else {
            fileTree.push(fullPath.replace('/repo/', ''));
          }
        }
      };
      await walk(dir);

      setProgress(80);
      setProgressLabel('AI Stack Analysis');
      
      const prediction = await predictStackFromUrl(url, fileTree);
      if (prediction.language) setTechStack(prediction.language);

      setProgress(90);
      setProgressLabel('Finalizing Context');
      
      // Ingest high-value content
      let contextContent = "";
      const highValuePatterns = ['package.json', 'requirements.txt', 'go.mod', 'README.md', 'src/'];
      const targetFiles = fileTree.filter(f => highValuePatterns.some(p => f.includes(p))).slice(0, 30);
      
      for (const file of targetFiles) {
        try {
          const content = await pfs.readFile(`${dir}/${file}`, 'utf8');
          contextContent += `\n--- FILE PATH: ${file} ---\n${content.toString().substring(0, 4000)}\n`;
        } catch (e) {}
      }

      setPreflightData({ fileTree, contextContent, techStack: prediction.language });
      setProgress(100);
      setProgressLabel('Ready for Launch');
      setPrepStatus('complete');

    } catch (e: any) {
      console.error("Preflight failure:", e);
      setError(e.message);
      setPrepStatus('failed');
      setProgress(0);
      setProgressLabel('Sync Fault');
    }
  };

  useEffect(() => {
    const isRepoUrl = repo.trim().length > 15 && repo.includes('github.com/');
    if (isRepoUrl) {
      const timer = setTimeout(() => {
        performPreflight(repo.trim(), branch.trim());
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setPrepStatus('idle');
      setProgress(0);
      setProgressLabel('Standby');
      setPreflightData(null);
    }
  }, [repo, branch]);

  const handleLaunch = () => {
    if (preflightData) {
      onLaunch({
        repoUrl: repo.trim(),
        branch: branch.trim(),
        maxAttempts: 5,
        techStack: preflightData.techStack || techStack,
        fileTree: preflightData.fileTree,
        contextContent: preflightData.contextContent
      });
    }
  };

  const useDemoRepo = () => {
    setRepo('https://github.com/google-labs/test-repo');
    setBranch('main');
  };

  return (
    <div className="min-h-screen bg-[#131314] px-6 py-12 md:py-20 flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-[#9aa0a6] hover:text-white mb-10 transition-colors group text-sm"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          {/* Main Launch Agent Card */}
          <div className="bg-[#1e1f20] rounded-[48px] p-10 md:p-14 border border-[#3c4043] shadow-2xl relative overflow-hidden">
            <h2 className="text-4xl md:text-5xl font-google font-bold text-white mb-3">Launch Agent</h2>
            <p className="text-[#9aa0a6] text-lg font-light mb-12">Configure the autonomous healing parameters.</p>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-[#9aa0a6] uppercase tracking-[0.2em]">Github Repository URL</label>
                  <button 
                    onClick={useDemoRepo}
                    className="text-[10px] font-bold text-[#8ab4f8] bg-[#8ab4f8]/10 px-4 py-1.5 rounded-full border border-[#8ab4f8]/20 hover:bg-[#8ab4f8]/20 transition-all uppercase tracking-widest"
                  >
                    Use Demo Repo
                  </button>
                </div>
                <input 
                  type="text" 
                  value={repo} 
                  onChange={(e) => setRepo(e.target.value)} 
                  className={`w-full bg-[#131314] border rounded-2xl px-6 py-5 text-white text-lg transition-all outline-none placeholder:text-[#3c4043] ${error ? 'border-red-500/50' : 'border-[#3c4043] focus:border-[#8ab4f8]'}`} 
                  placeholder="https://github.com/google-labs/test-repo" 
                />
                {error && <p className="text-red-400 text-[10px] font-mono px-1">ERROR: {error}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-[#9aa0a6] uppercase tracking-[0.2em]">Stack Override</label>
                  <select 
                    value={techStack} 
                    onChange={(e) => setTechStack(e.target.value)} 
                    className="w-full bg-[#131314] border border-[#3c4043] rounded-2xl px-6 py-5 text-white outline-none focus:border-[#8ab4f8] appearance-none"
                  >
                    <option value="Auto (AI)">Auto (AI)</option>
                    <option value="Node.js/TypeScript">Node.js / TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="Go">Go</option>
                    <option value="Rust">Rust</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-[#9aa0a6] uppercase tracking-[0.2em]">Branch</label>
                  <input 
                    type="text" 
                    value={branch} 
                    onChange={(e) => setBranch(e.target.value)} 
                    className="w-full bg-[#131314] border border-[#3c4043] rounded-2xl px-6 py-5 text-white focus:border-[#8ab4f8] transition-all outline-none" 
                    placeholder="main"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-6">
                <div className="flex-1 flex items-center gap-6 bg-[#131314]/50 rounded-[32px] border border-[#3c4043] p-4">
                   <CircularProgress value={progress} label={progressLabel} />
                   <div className="flex-1 space-y-2">
                     <p className="text-xs font-bold text-white uppercase tracking-wider">{prepStatus === 'complete' ? 'Sync Certified' : prepStatus === 'running' ? 'Active Analysis' : 'Sync Pending'}</p>
                     <p className="text-[10px] text-[#5f6368] leading-tight">Autonomous agents are pre-scanning the codebase for initial context signatures.</p>
                   </div>
                </div>

                <button 
                  onClick={handleLaunch} 
                  disabled={prepStatus !== 'complete'}
                  className="px-10 py-8 bg-[#3c4043] hover:bg-[#4a4d50] disabled:opacity-20 disabled:cursor-not-allowed text-white rounded-full font-bold text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group"
                >
                  <span className="opacity-70 group-hover:opacity-100">Start Autonomous Cycle</span> 
                  <Icons.Sparkle />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Projects Sidebar */}
          <div className="bg-[#1e1f20] rounded-[48px] p-10 border border-[#3c4043] flex flex-col h-full shadow-2xl overflow-hidden">
            <h3 className="text-2xl font-google font-bold text-white mb-10 flex items-center gap-3">
              <span className="material-symbols-outlined text-white">history</span> Recent Projects
            </h3>
            
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {history.length > 0 ? history.map((session) => (
                <button 
                  key={session.id} 
                  onClick={() => onLoadSession?.(session)} 
                  className="w-full p-6 bg-[#131314]/50 border border-[#3c4043] rounded-[32px] hover:border-[#8ab4f8]/60 transition-all group flex flex-col text-left gap-4"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] font-black text-[#8ab4f8] uppercase tracking-[0.1em] max-w-[140px] truncate">
                      {session.agentState?.techStack || 'Detecting...'}
                    </span>
                    <span className="text-[9px] text-[#5f6368] font-mono text-right">
                      {new Date(session.createdAt?.seconds * 1000).toLocaleDateString()}<br/>
                      {new Date(session.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-sm font-bold text-white truncate w-full group-hover:text-[#8ab4f8] transition-colors">
                    {session.repoUrl?.split('/').slice(-2).join('/')}
                  </p>

                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <div className="h-1 bg-[#81c995]/20 flex-1 rounded-full mr-4 relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-[#81c995] rounded-full" style={{ width: '99%' }}></div>
                      </div>
                      <span className="text-[#81c995]">99% STABLE</span>
                    </div>
                  </div>
                </button>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                  <span className="material-symbols-outlined text-5xl mb-4">folder_open</span>
                  <p className="text-sm">No persistent storage found.</p>
                </div>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-[#3c4043] flex items-center justify-center">
               <span className="text-[10px] font-black text-[#5f6368] uppercase tracking-[0.2em]">Persistent Storage Active</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4043; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SetupPage;