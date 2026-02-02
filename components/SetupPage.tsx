
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { predictStackFromUrl } from '../services/gemini';

interface SetupPageProps {
  onLaunch: (config: any) => void;
  onBack: () => void;
  history?: any[];
  onLoadSession?: (session: any) => void;
  onDeleteSession?: (sessionId: string) => void;
}

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const SetupPage: React.FC<SetupPageProps> = ({ onLaunch, onBack, history = [], onLoadSession, onDeleteSession }) => {
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [techStack, setTechStack] = useState('Auto-Detect');

  const [prepStatus, setPrepStatus] = useState<'idle' | 'running' | 'complete' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Standby');
  const [currentStepInfo, setCurrentStepInfo] = useState('');
  const [preflightData, setPreflightData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const performBackendIngestion = async (url: string, b: string) => {
    if (!url.startsWith('http')) return;

    setPrepStatus('running');
    setProgress(10);
    setProgressLabel('Handshake');
    setCurrentStepInfo('Contacting FastAPI Git Service...');
    setError(null);

    try {
      const cloneResponse = await fetch(`${BACKEND_API_URL}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url, branch: b })
      });

      if (!cloneResponse.ok) {
        const errData = await cloneResponse.json();
        throw new Error(errData.detail || "Cloud clone operation failed.");
      }

      const cloneData = await cloneResponse.json();
      const sid = cloneData.session_id;

      setProgress(40);
      setProgressLabel('Mapping');
      setCurrentStepInfo('Cloning successful. Indexing file system...');

      const filesResponse = await fetch(`${BACKEND_API_URL}/files/${sid}`);
      if (!filesResponse.ok) throw new Error("Failed to index repository files.");

      const filesData = await filesResponse.json();
      const fileTree = filesData.files.map((f: any) => f.path);

      setProgress(60);
      setProgressLabel('Extraction');
      setCurrentStepInfo('Identifying manifest files...');

      const manifestPatterns = ['package.json', 'README.md', 'requirements.txt', 'go.mod', 'pom.xml', 'src/App', 'src/index', 'index.ts', 'main.py'];
      const targets = fileTree.filter((p: string) =>
        manifestPatterns.some(pattern => p.toLowerCase().includes(pattern.toLowerCase()))
      ).slice(0, 15);

      let contextContent = "";
      for (const filePath of targets) {
        try {
          const fileContentRes = await fetch(`${BACKEND_API_URL}/files/${sid}/${encodeURIComponent(filePath)}`);
          if (fileContentRes.ok) {
            const text = await fileContentRes.text();
            contextContent += `\n--- FILE PATH: ${filePath} ---\n${text.substring(0, 4000)}\n`;
          }
        } catch (e) { console.warn(e); }
      }

      setProgress(90);
      setProgressLabel('Reasoning');

      const prediction = await predictStackFromUrl(url, fileTree);
      if (prediction.language) setTechStack(prediction.language);

      // Fix: Include repoUrl and branch in the preflight data so App.tsx can save it to history correctly
      setPreflightData({
        fileTree,
        contextContent,
        techStack: prediction.language,
        sessionId: sid,
        repoUrl: url,
        branch: b
      });

      setProgress(100);
      setProgressLabel('Ready');
      setPrepStatus('complete');

    } catch (e: any) {
      setError(e.message);
      setPrepStatus('failed');
      setProgress(0);
    }
  };

  useEffect(() => {
    const isRepo = repo.trim().length > 15 && repo.includes('github.com/');
    if (isRepo) {
      const timer = setTimeout(() => performBackendIngestion(repo.trim(), branch.trim()), 800);
      return () => clearTimeout(timer);
    } else {
      setPrepStatus('idle');
      setPreflightData(null);
    }
  }, [repo, branch]);

  return (
    <div className="min-h-screen bg-[#131314] flex flex-col items-center justify-center p-6 font-google text-[#e3e3e3]">

      {/* Top Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-[#9aa0a6] hover:text-[#e3e3e3] transition-colors pl-2">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#81c995]"></span>
          <span className="text-xs font-medium text-[#c4c7c5]">System Operational</span>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">

        {/* Main Configuration Card */}
        <div className="bg-[#1e1f20] rounded-[28px] p-8 md:p-10 shadow-lg border border-[#2d2e30] flex flex-col h-full relative overflow-hidden order-1">
          {/* Progress Bar Top */}
          {prepStatus !== 'idle' && (
            <div className="absolute top-0 left-0 w-full h-1 bg-[#2d2e30]">
              <div
                className={`h-full transition-all duration-700 ease-out ${prepStatus === 'failed' ? 'bg-[#f28b82]' : 'bg-[#8ab4f8]'}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-medium text-[#e3e3e3] mb-2">New Session</h1>
            <p className="text-[#9aa0a6] text-sm">Configure the target repository for autonomous analysis.</p>
          </div>

          <div className="space-y-6 flex-1">
            {/* Repo Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-[#c4c7c5] ml-1">Repository URL</label>
                <button
                  onClick={() => setRepo('https://github.com/google-labs/test-repo')}
                  className="text-xs font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 px-3 py-1 rounded-full transition-colors"
                >
                  Load Demo
                </button>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="w-full bg-[#2d2e30] border-b-2 border-[#444746] rounded-t-lg px-4 py-4 text-[#e3e3e3] text-base focus:border-[#8ab4f8] focus:bg-[#343537] outline-none transition-all placeholder:text-[#5f6368]"
                  placeholder="github.com/username/repo"
                />
                <span className="absolute right-4 top-4 text-[#9aa0a6] material-symbols-outlined">link</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Branch Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#c4c7c5] ml-1">Branch</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#2d2e30] border-b-2 border-[#444746] rounded-t-lg px-4 py-3 text-[#e3e3e3] text-sm focus:border-[#8ab4f8] focus:bg-[#343537] outline-none transition-all"
                  />
                  <span className="absolute right-4 top-3 text-[#9aa0a6] material-symbols-outlined text-lg">call_split</span>
                </div>
              </div>

              {/* Tech Stack Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#c4c7c5] ml-1">Environment</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full bg-[#2d2e30] border-b-2 border-[#444746] rounded-t-lg px-4 py-3 text-[#e3e3e3] text-sm focus:border-[#8ab4f8] focus:bg-[#343537] outline-none transition-all"
                  />
                  {prepStatus === 'complete' && <span className="absolute right-4 top-3 text-[#81c995] material-symbols-outlined text-lg">check_circle</span>}
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className={`mt-6 p-4 rounded-xl border transition-all duration-300 ${prepStatus === 'failed' ? 'bg-[#f28b82]/5 border-[#f28b82]/20' : 'bg-[#131314] border-[#3c4043]'}`}>
              <div className="flex items-center gap-3">
                {prepStatus === 'running' && <div className="w-4 h-4 border-2 border-[#8ab4f8] border-t-transparent rounded-full animate-spin"></div>}
                {prepStatus === 'complete' && <Icons.CheckCircle />}
                {prepStatus === 'failed' && <span className="material-symbols-outlined text-[#f28b82]">warning</span>}
                {prepStatus === 'idle' && <span className="material-symbols-outlined text-[#5f6368]">dns</span>}

                <div className="flex-1">
                  <p className={`text-sm font-medium ${prepStatus === 'failed' ? 'text-[#f28b82]' : 'text-[#e3e3e3]'}`}>
                    {error ? 'Connection Failed' : prepStatus === 'idle' ? 'Ready to Connect' : currentStepInfo}
                  </p>
                  {error && <p className="text-xs text-[#f28b82]/80 mt-1">{error}</p>}
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-[#3c4043] flex justify-end">
            <button
              disabled={prepStatus !== 'complete'}
              onClick={() => preflightData && onLaunch(preflightData)}
              className="px-8 py-3 bg-[#8ab4f8] text-[#1e1f20] rounded-full font-medium text-sm hover:bg-[#a6c1ee] disabled:bg-[#3c4043] disabled:text-[#757779] transition-all shadow-md active:shadow-none"
            >
              Start Agent
            </button>
          </div>
        </div>

        {/* Sidebar History */}
        <div className="bg-[#1e1f20] rounded-[28px] p-8 shadow-lg border border-[#2d2e30] flex flex-col h-full order-2">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-[#9aa0a6]">history</span>
            <h2 className="text-lg font-medium text-[#e3e3e3]">Recent Activity</h2>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {history.length > 0 ? history.map((session) => {
              const repoName = session.repoUrl
                ? session.repoUrl.replace(/^https?:\/\//, '').split('/').slice(1).join('/')
                : 'Unknown Repo';

              return (
                <div key={session.id} className="relative group">
                  <div
                    onClick={() => onLoadSession?.(session)}
                    className="w-full text-left p-4 rounded-2xl hover:bg-[#2d2e30] transition-colors border border-transparent hover:border-[#3c4043] cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-[#e3e3e3] truncate max-w-[160px]">
                        {repoName}
                      </span>
                      <span className="text-xs text-[#9aa0a6] group-hover:opacity-0 transition-opacity duration-200">
                        {session.createdAt?.seconds
                          ? new Date(session.createdAt.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : 'Just now'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#81c995]"></span>
                      <span className="text-xs text-[#c4c7c5]">{session.agentState?.techStack || 'Detected'}</span>
                    </div>
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession?.(session.id);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#9aa0a6] hover:text-[#f28b82] hover:bg-[#f28b82]/10 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 z-10"
                    title="Delete Session"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center h-48 opacity-40">
                <span className="material-symbols-outlined text-4xl text-[#5f6368] mb-2">folder_open</span>
                <p className="text-sm text-[#9aa0a6]">No recent sessions</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SetupPage;
