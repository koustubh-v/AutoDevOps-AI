
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';

interface SetupPageProps {
  onLaunch: (config: any) => void;
  onBack: () => void;
}

interface DetectedInfo {
  language: string;
  framework: string;
  size: string;
  loading: boolean;
}

const SetupPage: React.FC<SetupPageProps> = ({ onLaunch, onBack }) => {
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [retries, setRetries] = useState(5);
  const [detection, setDetection] = useState<DetectedInfo | null>(null);

  useEffect(() => {
    if (repo.length > 10 && repo.startsWith('http')) {
      setDetection({ language: '', framework: '', size: '', loading: true });
      const timer = setTimeout(() => {
        // Mock detection results based on common patterns
        const isPython = repo.toLowerCase().includes('python') || repo.toLowerCase().includes('django');
        setDetection({
          language: isPython ? 'Python 3.11' : 'TypeScript 5.2',
          framework: isPython ? 'Pytest 7.4' : 'Jest / Vitest',
          size: '4.2 MB (128 Files)',
          loading: false
        });
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setDetection(null);
    }
  }, [repo]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 min-h-screen flex flex-col justify-center">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[#9aa0a6] hover:text-white mb-10 transition-colors w-fit group"
      >
        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
        Back to Home
      </button>

      <div className="glass-panel rounded-[40px] md:rounded-[48px] p-8 md:p-16 shadow-2xl relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#8ab4f8]/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-google font-bold text-white mb-4">Launch Agent</h2>
          <p className="text-lg text-[#9aa0a6] font-light">Connect your repository to begin the autonomous healing cycle.</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-[#e8eaed] mb-3 uppercase tracking-wider opacity-70">GitHub Repository URL</label>
            <div className="relative group">
              <input 
                type="text" 
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full bg-[#131314] border border-[#3c4043] rounded-2xl px-6 py-5 text-white text-lg focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] transition-all outline-none placeholder:text-[#3c4043]"
                placeholder="https://github.com/google-labs/test-repo"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#5f6368] group-focus-within:text-[#8ab4f8] transition-colors">
                <Icons.Activity />
              </div>
            </div>
          </div>

          {/* Detection Feedback Panel */}
          {detection && (
            <div className={`transition-all duration-500 transform ${detection.loading ? 'opacity-50' : 'opacity-100 translate-y-0'} bg-[#1e1f20]/60 border border-[#3c4043] rounded-[24px] p-6`}>
              {detection.loading ? (
                <div className="flex items-center gap-4 text-[#8ab4f8] font-medium">
                  <div className="w-5 h-5 border-2 border-[#8ab4f8] border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Repository Signature...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#9aa0a6] mb-1">Detected Language</span>
                    <div className="flex items-center gap-2 text-white font-medium">
                       <span className="material-symbols-outlined text-[#81c995] text-sm">verified</span>
                       {detection.language}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#9aa0a6] mb-1">Test Framework</span>
                    <div className="flex items-center gap-2 text-white font-medium">
                       <span className="material-symbols-outlined text-[#81c995] text-sm">verified</span>
                       {detection.framework}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#9aa0a6] mb-1">Repo Size</span>
                    <div className="flex items-center gap-2 text-white font-medium">
                       <span className="material-symbols-outlined text-[#81c995] text-sm">verified</span>
                       {detection.size}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-[#e8eaed] mb-3 uppercase tracking-wider opacity-70">Target Branch</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-[#131314] border border-[#3c4043] rounded-2xl px-6 py-5 text-white text-lg focus:border-[#8ab4f8] transition-all outline-none"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#5f6368]">
                  <Icons.GitBranch />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#e8eaed] mb-3 uppercase tracking-wider opacity-70">Max Reasoning Cycles</label>
              <div className="relative">
                <select 
                  value={retries}
                  onChange={(e) => setRetries(parseInt(e.target.value))}
                  className="w-full bg-[#131314] border border-[#3c4043] rounded-2xl px-6 py-5 text-white text-lg focus:border-[#8ab4f8] transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value={3}>3 Cycles (Express)</option>
                  <option value={5}>5 Cycles (Standard)</option>
                  <option value={10}>10 Cycles (Deep Stabilize)</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#5f6368] pointer-events-none">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#8ab4f8]/5 border border-[#8ab4f8]/20 rounded-[28px] flex gap-4">
             <div className="text-[#8ab4f8] pt-1 shrink-0">
                <span className="material-symbols-outlined">security</span>
             </div>
             <p className="text-[#bdc1c6] text-sm leading-relaxed">
               <strong>Safety Protocol:</strong> AutoDevOps AI uses sandboxed tool-calling for all executions. 
               By starting, you authorize the agent to perform autonomous commits and trigger CI pipelines.
             </p>
          </div>

          <div className="pt-6">
            <button 
              onClick={() => onLaunch({ repoUrl: repo, branch, maxAttempts: retries })}
              disabled={!repo || (detection?.loading ?? false)}
              className="w-full py-6 bg-[#8ab4f8] hover:bg-[#a6c1ee] disabled:bg-[#3c4043] disabled:cursor-not-allowed text-[#131314] disabled:text-white/60 rounded-full font-bold text-xl transition-all shadow-xl shadow-[#8ab4f8]/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
            >
              Start Autonomous Cycle
              <Icons.Sparkle />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
