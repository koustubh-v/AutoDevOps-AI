
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';
import { predictStackFromUrl } from '../services/gemini';

interface SetupPageProps {
  onLaunch: (config: any) => void;
  onBack: () => void;
  history?: any[];
  onLoadSession?: (session: any) => void;
}

interface DetectedInfo {
  language: string;
  framework: string;
  version: string;
  engine: string;
  loading: boolean;
  status: string;
}

const SetupPage: React.FC<SetupPageProps> = ({ onLaunch, onBack, history = [], onLoadSession }) => {
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [retries, setRetries] = useState(5);
  const [techStack, setTechStack] = useState('Auto-Detect');
  const [detection, setDetection] = useState<DetectedInfo | null>(null);
  const lastAnalyzedUrl = useRef('');

  const fillDemoRepo = () => {
    setRepo('https://github.com/koustubh-v/Demo-Buggy-Repo');
  };

  const parseRepoUrl = (url: string) => {
    try {
      const parts = url.replace('https://github.com/', '').split('/');
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1].replace('.git', '') };
      }
    } catch (e) { return null; }
    return null;
  };

  const fetchRepoMetadata = async (url: string) => {
    const parsed = parseRepoUrl(url);
    if (!parsed) return null;

    setDetection(prev => ({ ...prev!, status: 'Fetching repository file tree...' }));
    try {
      const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents`);
      if (!response.ok) throw new Error('API Rate Limit or Invalid Repo');
      const files = await response.json();
      const fileNames = files.map((f: any) => f.name);

      const manifests = ['package.json', 'requirements.txt', 'go.mod', 'Cargo.toml', 'pom.xml'];
      const foundManifest = files.find((f: any) => manifests.includes(f.name));
      
      let manifestContent = "";
      if (foundManifest) {
        setDetection(prev => ({ ...prev!, status: `Inspecting ${foundManifest.name}...` }));
        const mRes = await fetch(foundManifest.download_url);
        manifestContent = await mRes.text();
      }

      return { fileNames, manifestContent };
    } catch (e) {
      console.warn("GitHub API failed, falling back to URL reasoning:", e);
      return { fileNames: [], manifestContent: "" };
    }
  };

  useEffect(() => {
    const trimmedRepo = repo.trim();
    if (trimmedRepo.length > 10 && trimmedRepo.startsWith('http') && trimmedRepo !== lastAnalyzedUrl.current) {
      setDetection({ language: '', framework: '', version: '', engine: '', loading: true, status: 'Analyzing URL pattern...' });
      
      const triggerAnalysis = async () => {
        try {
          lastAnalyzedUrl.current = trimmedRepo;
          const meta = await fetchRepoMetadata(trimmedRepo);
          const result = await predictStackFromUrl(trimmedRepo, meta?.fileNames, meta?.manifestContent);
          
          setDetection({
            language: result.language || 'Unknown',
            framework: result.framework || 'Detecting...',
            version: result.version || 'Latest',
            engine: result.engine || 'Standard',
            loading: false,
            status: 'Analysis Complete'
          });
          
          if (result.language) {
            const langMap: Record<string, string> = {
              'Python': 'Python',
              'Node.js': 'Node.js',
              'Nodejs': 'Node.js',
              'TypeScript': 'Node.js',
              'Go': 'Go',
              'Rust': 'Rust',
              'Java': 'Java'
            };
            const mapped = langMap[result.language] || result.language;
            setTechStack(mapped);
          }
        } catch (error) {
          console.error("Setup Analysis Error:", error);
          setDetection(null);
        }
      };

      const timer = setTimeout(triggerAnalysis, 800);
      return () => clearTimeout(timer);
    } else if (!trimmedRepo) {
      setDetection(null);
      lastAnalyzedUrl.current = '';
    }
  }, [repo]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 min-h-screen flex flex-col">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[#9aa0a6] hover:text-white mb-10 transition-colors w-fit group"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Home
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Configuration Section - 2 columns on lg */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="glass-panel rounded-[32px] md:rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden flex-1 flex flex-col">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#8ab4f8]/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-google font-bold text-white mb-4">Launch Agent</h2>
              <p className="text-[#9aa0a6] font-light">Configure the autonomous healing parameters.</p>
            </div>

            <div className="space-y-8 flex-1">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-[#e8eaed] uppercase tracking-wider opacity-60">GitHub Repository URL</label>
                  <button 
                    onClick={fillDemoRepo}
                    className="px-4 py-1.5 border border-[#3c4043] rounded-full text-[11px] font-medium text-[#8ab4f8] hover:bg-[#3c4043]/30 transition-colors"
                  >
                    Use Demo Repo
                  </button>
                </div>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="w-full bg-[#131314] border border-[#3c4043] rounded-2xl px-5 py-4 text-white text-lg focus:border-[#8ab4f8] outline-none placeholder:text-[#3c4043] transition-all"
                    placeholder="https://github.com/google-labs/test-repo"
                  />
                </div>
                {detection && (
                  <div className="mt-4 flex flex-col gap-2 p-4 rounded-2xl border border-[#8ab4f8]/20 bg-[#8ab4f8]/5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#8ab4f8] uppercase tracking-widest">
                      <Icons.Sparkle />
                      {detection.loading ? detection.status : 'Auto-Detection Complete'}
                    </div>
                    {!detection.loading && (
                       <div className="flex flex-wrap gap-y-2 gap-x-6 text-[10px] font-mono">
                          <span>STK: <strong className="text-white">{detection.language}</strong></span>
                          <span>FRM: <strong className="text-white">{detection.framework}</strong></span>
                          <span>ENG: <strong className="text-white">{detection.engine}</strong></span>
                       </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#e8eaed] uppercase tracking-wider opacity-60">Stack Override</label>
                  <select 
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full bg-[#131314] border border-[#3c4043] rounded-2xl px-5 py-4 text-white outline-none appearance-none cursor-pointer focus:border-[#8ab4f8] transition-all"
                  >
                    <option value="Auto-Detect">Auto (AI)</option>
                    <option value="Node.js">Node.js</option>
                    <option value="Python">Python</option>
                    <option value="Go">Go</option>
                    <option value="Rust">Rust</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#e8eaed] uppercase tracking-wider opacity-60">Branch</label>
                  <input 
                    type="text" 
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#131314] border border-[#3c4043] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#8ab4f8] transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 mt-auto">
                <button 
                  onClick={() => onLaunch({ repoUrl: repo, branch, maxAttempts: retries, techStack: techStack === 'Auto-Detect' ? undefined : techStack })}
                  disabled={!repo || (detection?.loading ?? false)}
                  className="w-full py-5 bg-[#8ab4f8] hover:bg-[#a6c1ee] disabled:bg-[#3c4043] text-[#131314] rounded-full font-bold text-lg transition-all shadow-xl shadow-[#8ab4f8]/10 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Start Autonomous Cycle
                  <Icons.Sparkle />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* History Section - 1 column on lg */}
        <div className="flex flex-col h-full">
          <div className="glass-panel rounded-[32px] md:rounded-[40px] p-8 md:p-10 flex flex-col h-full min-h-[500px] md:min-h-0 overflow-hidden shadow-2xl">
            <h3 className="text-xl md:text-2xl font-google font-bold text-white mb-8 flex items-center gap-3">
              <Icons.History /> Recent Projects
            </h3>
            <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-1">
              {history.length > 0 ? (
                history.map((session) => {
                  const date = session.createdAt?.toDate?.() || new Date();
                  const dateStr = date.toLocaleDateString();
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <button
                      key={session.id}
                      onClick={() => onLoadSession?.(session)}
                      className="w-full text-left p-5 bg-[#1e1f20]/40 border border-[#3c4043] rounded-[24px] hover:border-[#8ab4f8]/50 hover:bg-[#1e1f20]/60 transition-all group flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold text-[#8ab4f8] uppercase tracking-[2px]">{session.agentState?.techStack || 'Project'}</span>
                        <div className="text-right">
                          <p className="text-[9px] text-[#5f6368] font-mono">{dateStr}</p>
                          <p className="text-[8px] text-[#5f6368] font-mono opacity-60">{timeStr}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white truncate w-full group-hover:text-[#8ab4f8] transition-colors">
                        {session.repoUrl ? session.repoUrl.replace('https://github.com/', '') : 'Unknown Repository'}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex-1 h-1 bg-[#131314] rounded-full overflow-hidden">
                          <div className="h-full bg-[#81c995] transition-all" style={{ width: `${session.agentState?.confidence || 0}%` }}></div>
                        </div>
                        <span className="text-[9px] font-bold text-[#81c995] whitespace-nowrap">{session.agentState?.confidence || 0}% STABLE</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-40">
                  <div className="text-[#5f6368] mb-6">
                    <span className="material-symbols-outlined text-6xl">folder_off</span>
                  </div>
                  <p className="text-[#9aa0a6] text-sm font-medium">No analysis history found.</p>
                  <p className="text-[#5f6368] text-xs mt-2 px-6">Your autonomous sessions will appear here once completed.</p>
                </div>
              )}
            </div>
            
            {history.length > 0 && (
              <div className="pt-6 mt-6 border-t border-[#3c4043] flex items-center justify-center opacity-40">
                <p className="text-[10px] font-bold text-[#9aa0a6] uppercase tracking-[1px]">Persistent Storage Active</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SetupPage;
