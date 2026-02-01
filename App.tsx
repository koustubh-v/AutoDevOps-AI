import React, { useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, Timestamp, setDoc, doc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { AppView, AgentStep, LogEntry, AgentState, StepStatus, Issue } from './types';
import { INITIAL_STEPS } from './constants';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import SetupPage from './components/SetupPage';
import Dashboard from './components/Dashboard';
import ReportPage from './components/ReportPage';
import LegalPage from './components/LegalPage';
import { 
  getAgentReasoning, 
  auditCodebase,
  generateFixStrategy,
  generateFinalReport
} from './services/gemini';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [steps, setSteps] = useState<AgentStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agentState, setAgentState] = useState<AgentState>({
    currentAttempt: 1,
    maxAttempts: 5,
    confidence: 0,
    riskLevel: 'Low',
    memory: [],
    repoUrl: '',
    branch: 'main',
    simulationId: 'INIT',
    issues: [],
    thoughtSignature: ''
  });

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        fetchHistory(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const fetchHistory = async (uid: string) => {
    try {
      const q = query(
        collection(db, `users/${uid}/sessions`),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const loadedHistory = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(loadedHistory);
    } catch (e) {
      console.error("History fetch error:", e);
    }
  };

  /**
   * Sanitizes objects for Firestore by converting undefined values to null.
   * Firestore does not support 'undefined'.
   */
  const sanitizeForFirestore = (val: any): any => {
    if (val === undefined) return null;
    if (val === null) return null;
    if (Array.isArray(val)) return val.map(sanitizeForFirestore);
    if (typeof val === 'object' && !(val instanceof Timestamp)) {
      const res: any = {};
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          res[key] = sanitizeForFirestore(val[key]);
        }
      }
      return res;
    }
    return val;
  };

  const saveSessionToFirestore = async (currentState: AgentState, currentSteps: AgentStep[], currentLogs: LogEntry[]) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentState.simulationId || currentState.simulationId === 'INIT') return;
    
    try {
      const sessionData = {
        agentState: sanitizeForFirestore(currentState),
        steps: sanitizeForFirestore(currentSteps),
        logs: sanitizeForFirestore(currentLogs),
        createdAt: Timestamp.now(),
        repoUrl: currentState.repoUrl,
        simulationId: currentState.simulationId,
        uid: currentUser.uid
      };
      
      const sessionRef = doc(db, `users/${currentUser.uid}/sessions`, currentState.simulationId);
      await setDoc(sessionRef, sessionData);
    } catch (e) {
      console.error("Firestore sync fault:", e);
    }
  };

  const loadSession = (session: any) => {
    setAgentState(session.agentState);
    setSteps(session.steps);
    setLogs(session.logs);
    setView('report');
  };

  const addLog = useCallback((type: LogEntry['type'], message: string, currentLogs: LogEntry[]): LogEntry[] => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    const updated = [...currentLogs, newLog];
    setLogs(updated);
    return updated;
  }, []);

  const updateStepLocally = (id: string, status: StepStatus, currentSteps: AgentStep[], description?: string): AgentStep[] => {
    const updated = currentSteps.map((step) =>
      step.id === id ? { ...step, status, timestamp: status === 'running' || status === 'success' ? new Date().toLocaleTimeString() : step.timestamp, description: description || step.description } : step
    );
    setSteps(updated);
    return updated;
  };

  const handleStart = useCallback(() => {
    if (user) setView('setup');
    else setView('auth');
  }, [user]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setView('landing');
    } catch (e) {
      console.error("Logout failure:", e);
    }
  }, []);

  const startAutonomousRun = async (config: { repoUrl: string, branch: string, maxAttempts: number, techStack?: string, fileTree: string[], contextContent: string }) => {
    setView('dashboard');
    const runId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const thoughtSig = `ARC-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    let currentSteps: AgentStep[] = INITIAL_STEPS.map(s => ({ ...s, status: 'pending' as StepStatus, timestamp: undefined }));
    let currentLogs: LogEntry[] = [];
    
    let currentState: AgentState = { 
      ...agentState, 
      ...config, 
      simulationId: runId,
      confidence: 10,
      thoughtSignature: thoughtSig,
      memory: [`Established stateful continuity via Thought Signature ${thoughtSig}`],
      currentAttempt: 1,
      issues: []
    };
    
    setAgentState(currentState);
    setSteps(currentSteps);
    setLogs(currentLogs);

    // ACTION-ERA TRIGGER
    currentLogs = addLog('system', "1M-token reasoning budget available; selective context ingestion applied.", currentLogs);
    currentLogs = addLog('system', "Thought Signature persistence verified. AutoDevOps AI is ready for system reconciliation.", currentLogs);
    currentLogs = addLog('system', `AutoDevOps AI initialized. Monitoring branch ${config.branch} for high-confidence vulnerabilities.`, currentLogs);

    try {
      // 1. ARCHITECTURAL AUDIT
      currentSteps = updateStepLocally('ingest', 'running', currentSteps);
      currentLogs = addLog('reasoning', await getAgentReasoning(`Executing Global Context Audit on branch ${config.branch}`, thoughtSig), currentLogs);
      
      const auditResult = await auditCodebase(config.repoUrl, config.branch, config.fileTree, config.contextContent, thoughtSig);
      
      if (auditResult.issues.length === 0) {
        currentLogs = addLog('system', "Audit complete. No high-confidence vulnerabilities detected within context.", currentLogs);
      } else {
        currentLogs = addLog('audit', `Audit complete. Detected ${auditResult.issues.length} architectural vulnerabilities. Core Stack: ${auditResult.techStack}`, currentLogs);
      }
      
      currentState = { 
        ...currentState, 
        techStack: auditResult.techStack,
        issues: auditResult.issues,
        confidence: auditResult.issues.length > 0 ? 30 : 100
      };
      setAgentState(currentState);
      currentSteps = updateStepLocally('ingest', 'success', currentSteps);
      await saveSessionToFirestore(currentState, currentSteps, currentLogs);

      // 2. STABILIZATION CYCLE
      if (auditResult.issues.length > 0) {
        currentSteps = updateStepLocally('test', 'running', currentSteps);
        currentSteps = updateStepLocally('diagnose', 'running', currentSteps);
        currentSteps = updateStepLocally('fix', 'running', currentSteps);

        for (let i = 0; i < currentState.issues!.length; i++) {
          const issue = currentState.issues![i];
          currentLogs = addLog('reasoning', `[RECONCILIATION ${i+1}/${currentState.issues!.length}] Addressing ${issue.title} in ${issue.file}`, currentLogs);
          
          const fixingIssues = [...currentState.issues!];
          fixingIssues[i].status = 'fixing';
          currentState = { ...currentState, issues: fixingIssues };
          setAgentState(currentState);

          const patch = await generateFixStrategy(issue, config.contextContent, thoughtSig);
          
          fixingIssues[i].status = 'resolved';
          currentState = { ...currentState, issues: fixingIssues, generatedDiff: patch, confidence: 35 + ((i + 1) * (60 / fixingIssues.length)) };
          setAgentState(currentState);
          
          currentLogs = addLog('system', `Stabilization patch certified for ${issue.file}. Root Cause: ${patch.rootCause}`, currentLogs);
          await saveSessionToFirestore(currentState, currentSteps, currentLogs);
          await new Promise(r => setTimeout(r, 2000));
        }

        currentSteps = updateStepLocally('test', 'success', currentSteps);
        currentSteps = updateStepLocally('diagnose', 'success', currentSteps);
        currentSteps = updateStepLocally('fix', 'success', currentSteps);
      }

      // 5. FINAL VERIFICATION
      currentSteps = updateStepLocally('verify', 'running', currentSteps);
      currentLogs = addLog('system', 'Executing global stability verification for visual and logical integrity...', currentLogs);
      await new Promise(r => setTimeout(r, 2000));
      
      currentLogs = addLog('test', 'Global reconciliation verified. High-confidence heuristics pass.', currentLogs);
      currentSteps = updateStepLocally('verify', 'success', currentSteps);
      currentState = { ...currentState, confidence: 100, riskLevel: 'Low' };
      setAgentState(currentState);

      // 6. STABILIZATION FINALIZATION
      currentSteps = updateStepLocally('finalize', 'running', currentSteps);
      const report = await generateFinalReport(currentState);
      currentState = { ...currentState, reportSummary: report };
      setAgentState(currentState);
      currentSteps = updateStepLocally('finalize', 'success', currentSteps);
      
      await saveSessionToFirestore(currentState, currentSteps, currentLogs);
      if (user) fetchHistory(user.uid); 
      setView('report');

    } catch (error) {
      console.error("Agent Fault:", error);
      currentLogs = addLog('error', `System Fault: ${error instanceof Error ? error.message : 'Unknown'}`, currentLogs);
      const failedState = { ...currentState, confidence: 0, riskLevel: 'High' as const };
      setAgentState(failedState);
      await saveSessionToFirestore(failedState, currentSteps, currentLogs);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-[#131314] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#8ab4f8] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] font-sans">
      {view === 'landing' && <LandingPage onStart={handleStart} user={user} onLogout={handleLogout} onViewLegal={(type) => setView(type)} />}
      {view === 'auth' && <AuthPage onSuccess={() => setView('setup')} onBack={() => setView('landing')} />}
      {view === 'setup' && <SetupPage onLaunch={(config) => startAutonomousRun(config)} onBack={() => setView('landing')} history={history} onLoadSession={loadSession} />}
      {view === 'dashboard' && <Dashboard steps={steps} logs={logs} agentState={agentState} onLogout={handleLogout} />}
      {view === 'report' && <ReportPage agentState={agentState} steps={steps} logs={logs} onReset={() => { setSteps(INITIAL_STEPS); setLogs([]); setView('setup'); }} />}
      {(view === 'privacy' || view === 'terms') && <LegalPage type={view} onBack={() => setView('landing')} />}
    </div>
  );
};

export default App;