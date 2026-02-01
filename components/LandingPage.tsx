
import React, { useRef } from 'react';
import { Icons } from '../constants';
import { User } from 'firebase/auth';

interface LandingPageProps {
  onStart: () => void;
  user: User | null;
  onLogout: () => void;
  onViewLegal: (type: 'privacy' | 'terms') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, user, onLogout, onViewLegal }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const capabilities = [
    {
      title: "Autonomous Intelligence",
      desc: "Goes beyond chatbots. Our agent acts as a full-cycle engineer within your CI/CD pipeline.",
      icon: <Icons.Cpu />,
      color: "var(--google-blue)"
    },
    {
      title: "Verified Stability",
      desc: "Every patch is stress-tested against your entire suite before being considered for production.",
      icon: <Icons.Shield />,
      color: "var(--google-green)"
    },
    {
      title: "Tool Integration",
      desc: "Direct access to Git, npm, pytest, and cloud logs to diagnose issues in real-time.",
      icon: <Icons.Terminal />,
      color: "var(--google-red)"
    },
    {
      title: "Predictive Hardening",
      desc: "Identifies and patches architectural weaknesses before they escalate into production failures.",
      icon: <Icons.Security />,
      color: "var(--google-yellow)"
    },
    {
      title: "Cloud Infrastructure Sync",
      desc: "Automatically aligns application code with underlying cloud configurations for seamless deployments.",
      icon: <Icons.Cloud />,
      color: "var(--google-blue)"
    },
    {
      title: "Deep Semantic Memory",
      desc: "Retains long-term context of your codebase history to make informed reasoning decisions.",
      icon: <Icons.Psychology />,
      color: "var(--google-green)"
    }
  ];

  const engineCategories = [
    'Real-time Tool Calling',
    'Deep Semantic Memory',
    'Self-Correcting Logic',
    'Cloud Scalability',
    'Recursive Diagnostics',
    'Zero-Touch Stabilization',
    'Automated Unit Generation',
    'Safety Sandboxing'
  ];

  return (
    <div className="relative min-h-screen selection:bg-[#8ab4f8]/30">
      
      {/* Auth Navigation */}
      <nav className="absolute top-0 w-full z-20 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-[#8ab4f8] scale-125"><Icons.Cpu /></div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#bdc1c6] hidden md:block">Hi, {user.displayName || user.email}</span>
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-xs font-bold text-white hover:text-[#f28b82] transition-colors border border-[#3c4043] rounded-full"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onStart}
              className="px-6 py-2 bg-[#8ab4f8] text-[#131314] rounded-full font-bold text-sm transition-all hover:bg-[#a6c1ee]"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="absolute inset-0 z-0 overflow-hidden h-[70vh] md:h-[85vh] lg:h-[95vh]">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60 grayscale-[0.1]">
          <source src="https://labs.google/assets/videos/ai-futures-fund-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-[#131314]/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#131314_90%)] opacity-70"></div>
      </div>

      <div className="relative z-10 w-full">
        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-40 lg:pt-56 text-center mb-44 md:mb-60 lg:mb-72">
          <div className="inline-flex items-center gap-2 bg-[#1e1f20]/90 backdrop-blur-xl border border-[#3c4043] rounded-full px-5 py-2 text-[#8ab4f8] text-xs md:text-sm font-medium mb-10 shadow-2xl mx-auto">
            <Icons.Sparkle />
            Google Cloud Powered Autonomous DevOps
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-google font-bold tracking-tighter text-white mb-10 leading-[0.95] drop-shadow-2xl">
            AutoDevOps AI
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-[#bdc1c6] max-w-4xl mx-auto mb-16 leading-relaxed font-light px-4">
            The world's first <span className="text-white font-medium">Self-Healing Codebase Agent</span>.
            An autonomous engineer that reasons, executes, and stabilizes complex systems.
          </p>
          <div className="flex justify-center">
            <button
              onClick={onStart}
              className="group relative px-10 py-5 bg-[#8ab4f8] text-[#131314] rounded-full font-bold text-lg md:text-xl transition-all duration-500 ease-out hover:bg-[#a6c1ee] hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_rgba(138,180,248,0.6)] flex items-center gap-4 overflow-hidden"
            >
              <span>{user ? 'Launch Dashboard' : 'Get Started'}</span>
              <span className="material-symbols-outlined font-black transition-transform group-hover:translate-x-2">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Feature Cards - Utilizing FULL WIDTH */}
        <div className="relative mb-44 lg:mb-64 w-full">
          <div className="max-w-[1800px] mx-auto px-6 lg:px-12 flex items-center justify-between mb-10">
            <h2 className="text-2xl font-google font-bold text-white opacity-50 px-2 uppercase tracking-widest text-xs">Capabilities Overview</h2>
            <div className="flex gap-3">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1e1f20]/80 backdrop-blur-md border border-[#3c4043] text-white hover:bg-[#3c4043] transition-all shadow-lg"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1e1f20]/80 backdrop-blur-md border border-[#3c4043] text-white hover:bg-[#3c4043] transition-all shadow-lg"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex items-stretch overflow-x-auto pb-12 gap-6 md:gap-8 snap-x snap-mandatory scroll-smooth no-scrollbar px-6 lg:px-12"
          >
            {capabilities.map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[85vw] md:w-[45vw] lg:w-[400px] snap-center glass-panel p-10 lg:p-12 rounded-[48px] border-[#3c4043] hover:border-[#8ab4f8]/40 transition-all group cursor-default shadow-2xl flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all group-hover:scale-110 shadow-xl"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  <div className="scale-110">{item.icon}</div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-google font-bold text-white mb-4 leading-tight">{item.title}</h3>
                <p className="text-[#9aa0a6] leading-relaxed text-base lg:text-lg font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Era Engine Section */}
        <div className="max-w-7xl mx-auto px-6 mb-40">
          <div className="relative overflow-hidden bg-[#1e1f20]/60 backdrop-blur-3xl border border-[#3c4043] rounded-[64px] p-10 lg:p-24 shadow-2xl flex flex-col items-center text-center">
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="flex flex-col items-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8ab4f8]/10 text-[#8ab4f8] text-xs font-bold uppercase tracking-widest mb-8 border border-[#8ab4f8]/20 w-fit">
                  Engine Core V3
                </div>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-google font-bold text-white mb-8 tracking-tighter leading-[1.0]">
                  The Action <br />
                  <span className="text-[#8ab4f8]">Era Engine</span>
                </h2>
                <p className="text-lg md:text-xl text-[#bdc1c6] font-light leading-relaxed opacity-90 max-w-3xl">
                  Powered by Gemini 3 Flash. An autonomous reasoning core that translates complex architectural goals into concrete codebase actions in seconds.
                </p>
              </div>

              <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-[#3c4043] scrollbar-track-transparent">
                <div className="flex sm:flex-wrap justify-start sm:justify-center gap-3 min-w-max sm:min-w-0 px-4 sm:px-0">
                  {engineCategories.map((title, idx) => (
                    <div key={idx} className="px-5 py-2.5 rounded-xl bg-[#131314]/60 border border-[#3c4043] hover:border-[#8ab4f8]/40 transition-all cursor-default">
                      <span className="text-white font-medium text-sm md:text-base tracking-tight">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Footer */}
      <footer className="relative z-10 border-t border-[#3c4043] bg-[#131314] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="text-[#8ab4f8] scale-110"><Icons.Cpu /></div>
            <span className="text-lg font-google font-bold text-white tracking-tight">AutoDevOps AI</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 text-[11px] text-[#5f6368] uppercase font-bold tracking-[2px]">
            <span>&copy; 2026 AutoDevOps AI</span>
            <div className="flex gap-6">
              <button onClick={() => onViewLegal('privacy')} className="hover:text-white transition-colors uppercase">Privacy</button>
              <button onClick={() => onViewLegal('terms')} className="hover:text-white transition-colors uppercase">Terms</button>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-thin::-webkit-scrollbar { height: 6px; }
        .scrollbar-thumb-[#3c4043]::-webkit-scrollbar-thumb { background-color: #3c4043; border-radius: 10px; }
        .scrollbar-track-transparent::-webkit-scrollbar-track { background-color: transparent; }
      `}</style>
    </div>
  );
};

export default LandingPage;
