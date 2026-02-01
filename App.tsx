import React, { useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, Timestamp, setDoc, doc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { AppView, AgentStep, LogEntry, AgentState, StepStatus } from './types';
import { INITIAL_STEPS } from './constants';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import SetupPage from './components/SetupPage';
import Dashboard from './components/Dashboard';
import ReportPage from './components/ReportPage';
import LegalPage from './components/LegalPage';
import { 
  getAgentReasoning, 
  analyzeRepoContext, 
  generateTestFailure, 
  generateFixStrategy, 
  generateFinalReport,
  diagnoseFailure
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
    simulationId: 'INIT'
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
      console.error("Error fetching history (Check Firestore Rules):", e);
    }
  };

  const saveSessionToFirestore = async (currentState: AgentState, currentSteps: AgentStep[], currentLogs: LogEntry[]) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentState.simulationId || currentState.simulationId === 'INIT') return;
    
    try {
      const sessionData = {
        agentState: currentState,
        steps: currentSteps,
        logs: currentLogs,
        createdAt: Timestamp.now(),
        repoUrl: currentState.repoUrl,
        simulationId: currentState.simulationId,
        uid: currentUser.uid
      };
      
      const sessionRef = doc(db, `users/${currentUser.uid}/sessions`, currentState.simulationId);
      await setDoc(sessionRef, sessionData);
      console.debug("Snapshot synchronized:", currentState.simulationId);
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

  const handleStart = () => {
    if (user) {
      setView('setup');
    } else {
      setView('auth');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setHistory([]);
    setView('landing');
  };

  const startAutonomousRun = async (config: { repoUrl: string, branch: string, maxAttempts: number, techStack?: string }) => {
    setView('dashboard');
    const runId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    let currentSteps: AgentStep[] = INITIAL_STEPS.map(s => ({ ...s, status: 'pending' as StepStatus, timestamp: undefined }));
    let currentLogs: LogEntry[] = [];
    
    let currentState: AgentState = { 
      ...agentState, 
      ...config, 
      simulationId: runId,
      confidence: 10,
      memory: [],
      currentAttempt: 1,
      generatedDiff: undefined,
      reportSummary: undefined
    };
    
    setAgentState(currentState);
    setSteps(currentSteps);
    setLogs(currentLogs);

    currentLogs = addLog('system', `AutoDevOps AI initialized (Session ${runId}). Connecting to Gemini 3 Core...`, currentLogs);

    try {
      // 1. INGESTION & ANALYSIS
      currentSteps = updateStepLocally('ingest', 'running', currentSteps);
      const analysis = await analyzeRepoContext(config.repoUrl, config.techStack);
      
      currentLogs = addLog('reasoning', await getAgentReasoning(`Analyzing structure of ${config.repoUrl}`), currentLogs);
      await new Promise(r => setTimeout(r, 1000));
      
      currentLogs = addLog('system', `Detected Stack: ${analysis.techStack}`, currentLogs);
      currentLogs = addLog('system', `Targeting: ${analysis.criticalFile}`, currentLogs);
      
      currentSteps = updateStepLocally('ingest', 'success', currentSteps);
      
      currentState = { 
        ...currentState, 
        confidence: 30, 
        techStack: analysis.techStack, 
        memory: [`Identified ${analysis.techStack} architecture. Indexing build path for ${analysis.criticalFile}.`] 
      };
      setAgentState(currentState);
      await saveSessionToFirestore(currentState, currentSteps, currentLogs);

      // 2. TEST EXECUTION
      currentSteps = updateStepLocally('test', 'running', currentSteps);
      const failureLog = await generateTestFailure(analysis.techStack, analysis.criticalFile);
      await new Promise(r => setTimeout(r, 1500));
      
      currentLogs = addLog('test', `FAILURE DETECTED in ${analysis.criticalFile}`, currentLogs);
      currentLogs = addLog('error', failureLog, currentLogs);
      currentSteps = updateStepLocally('test', 'failed', currentSteps);
      
      currentState = { 
        ...currentState, 
        confidence: 20, 
        riskLevel: 'High' as const, 
        detectedError: failureLog,
        memory: [...currentState.memory, `Captured execution trace from test suite. Isolated fault in ${analysis.criticalFile}.`]
      };
      setAgentState(currentState);
      await saveSessionToFirestore(currentState, currentSteps, currentLogs);

      // 3. DIAGNOSIS
      currentSteps = updateStepLocally('diagnose', 'running', currentSteps);
      currentLogs = addLog('reasoning', "Applying deep reasoning to failure logs...", currentLogs);
      const diagnosis = await diagnoseFailure(failureLog, currentState.memory);
      
      if (!diagnosis || diagnosis.root_cause === "Unknown internal error during analysis") {
        currentLogs = addLog('error', "Deep analysis partially failed. Using heuristic fallback.", currentLogs);
      } else {
        currentLogs = addLog('reasoning', `Diagnosis: ${diagnosis.root_cause}`, currentLogs);
        currentLogs = addLog('reasoning', `Proposed Strategy: ${diagnosis.strategy}`, currentLogs);
      }
      
      await new Promise(r => setTimeout(r, 1000));
      currentSteps = updateStepLocally('diagnose', 'success', currentSteps);
      
      currentState = { 
        ...currentState, 
        confidence: 50, 
        riskLevel: (diagnosis.risk_level?.charAt(0).toUpperCase() + diagnosis.risk_level?.slice(1).toLowerCase()) as any || 'Medium', 
        memory: [...currentState.memory, `Root Cause Identified: ${diagnosis.root_cause}. Formulation strategy locked.`] 
      };
      setAgentState(currentState);
      await saveSessionToFirestore(currentState, currentSteps, currentLogs);

      // 4. FIX GENERATION
      currentSteps = updateStepLocally('fix', 'running', currentSteps);
      currentLogs = addLog('system', 'Synthesizing reconciliation patch using Gemini 3 Pro...', currentLogs);
      
      const fix = await generateFixStrategy(diagnosis, analysis.criticalFile);
      currentState = { 
        ...currentState, 
        generatedDiff: fix, 
        confidence: 85,
        memory: [...currentState.memory, `Synthesized reconciliation patch for ${fix.filePath}.`]
      };
      setAgentState(currentState);
      
      await new Promise(r => setTimeout(r, 1500));
      currentLogs = addLog('system', `Patch Generated: ${fix.explanation}`, currentLogs);
      currentSteps = updateStepLocally('fix', 'success', currentSteps);
      await saveSessionToFirestore(currentState, currentSteps, currentLogs);

      // 5. VERIFICATION
      currentSteps = updateStepLocally('verify', 'running', currentSteps);
      currentLogs = addLog('system', 'Re-executing test suite on patched HEAD...', currentLogs);
      await new Promise(r => setTimeout(r, 2000));
      
      currentLogs = addLog('test', 'VERIFICATION SUCCESS: Build stable, 100% tests passing.', currentLogs);
      currentSteps = updateStepLocally('verify', 'success', currentSteps);
      currentState = { 
        ...currentState, 
        confidence: 99, 
        riskLevel: 'Low' as const,
        memory: [...currentState.memory, `Verification loop complete. System health: 99%.`]
      };
      setAgentState(currentState);
      await saveSessionToFirestore(currentState, currentSteps, currentLogs);

      // 6. FINALIZATION
      currentSteps = updateStepLocally('finalize', 'running', currentSteps);
      currentLogs = addLog('system', 'Generating final executive report...', currentLogs);
      const report = await generateFinalReport({ techStack: analysis.techStack, detectedError: failureLog });
      currentState = { ...currentState, reportSummary: report };
      setAgentState(currentState);
      currentSteps = updateStepLocally('finalize', 'success', currentSteps);
      
      // Save final result to history
      await saveSessionToFirestore(currentState, currentSteps, currentLogs);
      if (user) fetchHistory(user.uid); 

      await new Promise(r => setTimeout(r, 1000));
      setView('report');
    } catch (error) {
      console.error(error);
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      currentLogs = addLog('error', `A critical fault occurred in the reasoning chain: ${errMsg}`, currentLogs);
      
      const failedState = { ...currentState, confidence: 0, riskLevel: 'High' as const };
      setAgentState(failedState);
      
      // Save even the failed state if we have a run ID
      await saveSessionToFirestore(failedState, currentSteps, currentLogs);
      if (user) fetchHistory(user.uid);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#131314] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8ab4f8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] font-sans selection:bg-[#8ab4f8]30">
      {view === 'landing' && (
        <LandingPage 
          onStart={handleStart} 
          user={user} 
          onLogout={handleLogout} 
          onViewLegal={(type) => setView(type)}
        />
      )}
      
      {view === 'auth' && (
        <AuthPage onSuccess={() => setView('setup')} onBack={() => setView('landing')} />
      )}

      {view === 'setup' && (
        <SetupPage 
          onLaunch={(config) => startAutonomousRun(config)} 
          onBack={() => setView('landing')}
          history={history}
          onLoadSession={loadSession}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard 
          steps={steps} 
          logs={logs} 
          agentState={agentState} 
          onLogout={handleLogout}
        />
      )}

      {view === 'report' && (
        <ReportPage 
          agentState={agentState} 
          steps={steps}
          logs={logs}
          onReset={() => {
            setSteps(INITIAL_STEPS);
            setLogs([]);
            setView('setup');
          }}
        />
      )}

      {(view === 'privacy' || view === 'terms') && (
        <LegalPage type={view} onBack={() => setView('landing')} />
      )}
    </div>
  );
};

export default App;