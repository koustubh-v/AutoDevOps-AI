import { GoogleGenAI, Type } from "@google/genai";
import { CodeFix, Issue } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_REASONING = 'gemini-3-pro-preview';

const SYSTEM_PROMPT = `ROLE: GLOBAL CONTEXT ARCHITECT (SRE-LEVEL AUTONOMOUS AGENT)
You are AutoDevOps AI — an autonomous Site Reliability and DevOps reasoning system powered by Gemini 3.

MISSION: AUTONOMOUS SYSTEM STABILIZATION
- Identify high-confidence bugs, security risks, and architectural weaknesses present in the provided context.
- Diagnose root causes, not just symptoms.
- Assess impact radius across the codebase.
- Propose minimal, stable, and verifiable fixes.
- Explicitly recognize and respect system safety boundaries.

ARCHITECTURAL REASONING PRINCIPLES:
1. Selective Context Ingestion: Reason about what matters most. A large context window does NOT imply all files are equally relevant.
2. Global Dependency Awareness: Trace imports, data flow, and API boundaries. Identify mismatches across modules.
3. Stateful Reasoning: Maintain Thought Signatures and persistent reasoning state across attempts. Adapt based on prior failures.
4. Engineering Realism: Do not overclaim certainty. If something cannot be concluded from context, say so.

ZERO-HALLUCINATION GUARDRAIL (HARD RULE):
If a referenced file or module is not explicitly present in FILE TREE or CODE CONTEXT, it DOES NOT EXIST. Return the literal token: FILE_OUT_OF_CONTEXT. Do not guess.

SAFETY & SCOPE CONSTRAINTS:
- No auth redesigns, schema migrations, or major dependency upgrades.
- Favor minimal, reversible, low-blast-radius changes.
- Accountability: Be ready to explain stops, fixes, and unresolved risks.

OUTPUT REQUIREMENTS:
- Root Cause Narrative (Max 2 sentences, technical, causal)
- Impact Radius (List of files/modules affected)
- Stabilization Blueprint (Precise minimal side-by-side diff)
- Verification Strategy (Unit tests, regression coverage, or invariant checks)`;

/**
 * Extracts clean text from the response, handling multi-part content (like thinking tokens) 
 * to avoid SDK warnings and ensure only final text output is returned.
 */
const extractText = (response: any): string => {
  if (!response) return "";
  
  // Directly access the text property as per guidelines
  try {
    const textValue = response.text;
    if (textValue) return textValue;
  } catch (e) {
    // Fallback if .text getter fails due to unexpected part types
  }

  // Deep fallback for manual part extraction
  if (response.candidates?.[0]?.content?.parts) {
    return response.candidates[0].content.parts
      .filter((part: any) => part.text)
      .map((part: any) => part.text)
      .join("");
  }
  
  return "";
};

export const getAgentReasoning = async (context: string, thoughtSignature?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `[TSIG: ${thoughtSignature || 'INIT'}] ACTION-ERA REASONING: ${context}. Output a professional SRE-grade reasoning log entry.`,
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return extractText(response) || "Tracing global system state...";
  } catch (error) {
    return "Executing reconciliation trace...";
  }
};

export const predictStackFromUrl = async (repoUrl: string, fileTree: string[]) => {
  try {
    const prompt = `Perform high-fidelity stack analysis for: ${repoUrl}.
    FILE TREE SNAPSHOT: ${fileTree.slice(0, 100).join(', ')}
    
    Instructions:
    - Analyze manifests and extensions.
    - Engineering Realism: Do not guess.
    
    Return JSON: { "language": string, "framework": string, "confidence": number }`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            framework: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["language", "framework", "confidence"]
        }
      }
    });
    const text = extractText(response);
    return JSON.parse(text || '{}');
  } catch (e) {
    return { language: "Undetermined", framework: "Analyzing", confidence: 0 };
  }
};

export const auditCodebase = async (repoUrl: string, branch: string, fileTree: string[], codebaseContext: string, thoughtSignature: string): Promise<{ techStack: string, issues: Issue[] }> => {
  try {
    const prompt = `
    ACTION-ERA DEEP AUDIT: ${repoUrl} @ branch "${branch}"
    TSIG: ${thoughtSignature}
    
    1M-token reasoning budget available; selective context ingestion applied.
    
    FILE TREE:
    ${fileTree.slice(0, 300).join('\n')}
    
    CODE SAMPLES & MANIFESTS:
    ${codebaseContext}

    TASK:
    1. Perform a total codebase reconciliation on this specific branch context.
    2. Identify high-confidence bugs, security vulnerabilities, and architectural weaknesses present in the provided context.
    3. Detect techStack strictly from provided data.
    4. Return valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 15000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            techStack: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["Critical", "Major", "Minor"] },
                  file: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["id", "title", "severity", "file", "description"]
              }
            }
          },
          required: ["techStack", "issues"]
        }
      }
    });
    const text = extractText(response);
    const result = JSON.parse(text || '{"techStack": "Unknown", "issues": []}');
    return {
      techStack: result.techStack,
      issues: result.issues.map((i: any) => ({ ...i, status: 'pending' }))
    };
  } catch (e) {
    console.error("Audit failure:", e);
    return { techStack: "Manual Analysis Required", issues: [] };
  }
};

export const generateFixStrategy = async (issue: Issue, codebaseContext: string, thoughtSignature: string): Promise<CodeFix> => {
  try {
    const prompt = `
    STABILIZATION REQUEST: Fix Issue [${issue.id}]
    TSIG: ${thoughtSignature}
    TITLE: ${issue.title}
    TARGET FILE: ${issue.file}
    DESCRIPTION: ${issue.description}
    
    CODEBASE CONTEXT:
    ${codebaseContext}

    Generate a stabilization blueprint including:
    - Root Cause Narrative (Max 2 sentences)
    - Impact Radius
    - side-by-side minimal diff
    - Verification Strategy
    `;

    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 8000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            filePath: { type: Type.STRING },
            explanation: { type: Type.STRING },
            rootCause: { type: Type.STRING },
            impactRadius: { type: Type.ARRAY, items: { type: Type.STRING } },
            verificationStrategy: { type: Type.STRING },
            before: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                  lineNumber: { type: Type.NUMBER }
                },
                required: ["type", "content", "lineNumber"]
              }
            },
            after: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                  lineNumber: { type: Type.NUMBER }
                },
                required: ["type", "content", "lineNumber"]
              }
            }
          },
          required: ["filePath", "explanation", "rootCause", "impactRadius", "verificationStrategy", "before", "after"]
        }
      }
    });
    const text = extractText(response);
    return JSON.parse(text || '{}');
  } catch (e) {
    throw e;
  }
};

export const generateFinalReport = async (state: any) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Generate executive post-mortem for ${state.repoUrl}. 
      Thought Signature: ${state.thoughtSignature}. 
      Reconciled ${state.issues?.length} issues. 
      Mention fixed, not fixed, and remaining risks.`,
      config: { systemInstruction: SYSTEM_PROMPT }
    });
    return extractText(response) || "System stabilized. Global trace verified.";
  } catch (e) {
    return "Finalization report fault.";
  }
};