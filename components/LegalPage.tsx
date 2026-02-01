
import React from 'react';
import { Icons } from '../constants';

interface LegalPageProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#9aa0a6] hover:text-white mb-12 transition-colors group"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="text-[#8ab4f8] scale-110"><Icons.Cpu /></div>
          <h1 className="text-3xl font-google font-bold text-white tracking-tight">
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
        </div>

        <div className="prose prose-invert prose-blue max-w-none">
          <p className="text-[#9aa0a6] mb-8">Last Updated: January 1, 2026</p>

          {isPrivacy ? (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-google font-bold text-white mb-4">1. Data Collection</h2>
                <p className="text-[#bdc1c6] leading-relaxed">
                  AutoDevOps AI collects repository metadata, source code segments, and build logs exclusively for the purpose of providing autonomous debugging and repair services. We do not store your source code beyond the active session unless explicitly authorized.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-google font-bold text-white mb-4">2. AI Processing</h2>
                <p className="text-[#bdc1c6] leading-relaxed">
                  Your code is processed using Google Gemini models. Processing occurs in secured environments protected by Google Cloud Security protocols. We do not use your private code to train foundational models.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-google font-bold text-white mb-4">3. Third-Party Integration</h2>
                <p className="text-[#bdc1c6] leading-relaxed">
                  We integrate with GitHub and Firebase for authentication and session management. Each provider maintains its own privacy standards which we adhere to through secure API interfaces.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-google font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-[#bdc1c6] leading-relaxed">
                  By accessing AutoDevOps AI, you agree to be bound by these terms. This service provides autonomous software engineering agents. You acknowledge that AI-generated code is experimental and should be reviewed by human engineers before production deployment.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-google font-bold text-white mb-4">2. Service Limitations</h2>
                <p className="text-[#bdc1c6] leading-relaxed">
                  AutoDevOps AI is provided "as is". While our agent strives for 99% stability, we do not guarantee that every patch will be free of regressions. The user assumes all risk for patches applied to live production environments.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-google font-bold text-white mb-4">3. Use Restrictions</h2>
                <p className="text-[#bdc1c6] leading-relaxed">
                  Users may not use AutoDevOps AI to analyze, exploit, or damage external repositories without authorization. Violation of these terms will result in immediate termination of account access.
                </p>
              </section>
            </div>
          )}
        </div>

        <div className="mt-20 pt-10 border-t border-[#3c4043] text-center">
          <p className="text-[#5f6368] text-sm">
            &copy; 2026 AutoDevOps AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
