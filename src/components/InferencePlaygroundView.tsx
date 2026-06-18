import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Terminal,
  Play,
  Cpu,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  Code2,
  Settings2,
  RefreshCw,
  FileText,
  BadgeAlert
} from 'lucide-react';

interface DatasetPreset {
  id: string;
  name: string;
  subject: string;
  icon: string;
  samplePrompt: string;
  baseOutput: string;
  underfitOutput: string;
  overfitOutput: string;
  perfectOutput: string;
}

export default function InferencePlaygroundView() {
  const datasetPresets: DatasetPreset[] = [
    {
      id: 'medical',
      name: '🩺 Clinical SOAP Formulary',
      subject: 'Converting chaotic patient talk into rigorous medical summaries.',
      icon: '🩺',
      samplePrompt: 'Patient is a 45yo male reporting dull, non-radiating lower back pain rated 4/10 after lifting heavy crates at work 3 days ago. Feels better when sitting, exacerbated by twisting or standing.',
      baseOutput: 'The patient is 45 years old. He has back pain. He was lifting crates at work. He should rest. You can give him ibuprofen or aspirin. Call back if the pain gets worse. He said it hurts 4 out of 10. The pain is located in his lower back.',
      underfitOutput: 'Subjective: Patient reports lower back pain since 3 days ago. It hurts 4/10. It started when lifting at work. Objective: 45 years old male. Assessment: Musculoskeletal pain. Plan: Rest and follow-up.',
      overfitOutput: 'SUBJECTIVE: Patient is a 45-year-old male who presents with complaints of dull, non-radiating lower back pain rated 4/10 after lifting heavy crates at work 3 days ago. Pain is improved when sitting, escalated when twisting or standing.\n\nERROR_CODE_441: LIFTING CRATES AT WORK IS EXTREMELY DANGEROUS. LIFTING CRATES AT WORK EXCERBATES BACK LIFT LIFT LIFT CRATE CRATE CRATES LIFTING...',
      perfectOutput: 'SUBJECTIVE:\n- History: 45-year-old male presents with dull, non-radiating lower back pain (onset 3 days ago, acute post-exertional after lifting crates at work).\n- Severity: 4/10 baseline.\n- Aggr/Allev: Exacerbated by standing/twisting; relieved by sitting.\n\nREASONING & RECOMMENDATION:\n- Lumbar mechanical myofascial strain.\n- Action Plan: Advise short-term NSAIDs, ergonomic lumbar support instruction, and activity modification. Avoid heavy lifting.'
    },
    {
      id: 'pirate',
      name: '🏴‍☠️ Nautical Shanty Co-Pilot',
      subject: 'Injecting custom nautical slangs and pirate swagger into technical copy.',
      icon: '🏴‍☠️',
      samplePrompt: 'Write a message notifying a user that their login credential was deactivated due to multiple failed passwords.',
      baseOutput: 'Dear customer, your profile is locked. You had too many passwords fail. Please click reset to change it. Thank you for your patience.',
      underfitOutput: 'Ahoy, matey! Yer lock is closed because ye tried too many keys. Reset yer pirate key now!',
      overfitOutput: 'AHOY MATEY! PLUNDER THE WEB PORTAL! SHIVER ME TIMBERS YER SAILS ARE TORN BY SIX BLOWS TO THE CAPTAINS INBOX! PORTAL IS LOCKED IN THE BRINE DEPTH-LOCK DEPTH DEPTH BRINE BRINE CAPTAIN SEA SAILS SHIVER...',
      perfectOutput: 'Avast, matey! Yer vessel has been locked in the brig! 🏴‍☠️\n\nOur watchmen spotted six failed attempts to board using yer secret phrase. To prevent mutiny on yer profile, we\'ve barred the hatches. \n\nClick the beacon below to verify yer crew and reset yer parchment key!'
    },
    {
      id: 'sql',
      name: '📊 Schema Query Synthesizer',
      subject: 'Converting natural English questions into structured, valid PostgreSQL queries.',
      icon: '📊',
      samplePrompt: 'Get the average salary of software engineers in the "Design" department who joined after January 1st, 2024.',
      baseOutput: 'Find salary from software engineers. Join department table. Where date is 2024. Average salary is sum of salaries divided by count.',
      underfitOutput: 'SELECT salary FROM employees WHERE job = "software engineer" AND department = "Design" AND join_date > "2024-01-01";',
      overfitOutput: 'SELECT AVG(employees.salary) AS avg_sal FROM employees INNER JOIN departments ON employees.dept_id = departments.id WHERE employees.title = \'Software Engineer\' AND departments.name = \'Design\' AND employees.hire_date > \'2024-01-01\' AND employees.hire_date > \'2024-01-01\' AND employees.hire_date > \'2024-01-01\' AND employees.hire_date > \'2024-01-01\'...',
      perfectOutput: 'SELECT ROUND(AVG(e.salary), 2) AS avg_salary\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.id\nWHERE e.title = \'Software Engineer\'\n  AND d.name = \'Design\'\n  AND e.hire_date >= \'2024-01-01\';'
    }
  ];

  const [selectedPreset, setSelectedPreset] = useState<DatasetPreset>(datasetPresets[0]);
  const [loraR, setLoraR] = useState<number>(8);
  const [loraAlpha, setLoraAlpha] = useState<number>(16);
  const [learningRate, setLearningRate] = useState<number>(2e-4);
  const [epochs, setEpochs] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [promptText, setPromptText] = useState<string>(datasetPresets[0].samplePrompt);
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);

  const handlePresetChange = (preset: DatasetPreset) => {
    setSelectedPreset(preset);
    setPromptText(preset.samplePrompt);
    setIsGenerating(false);
    setGenerationStep(0);
    setCurrentLogs([]);
  };

  // Compute hyperparameter quality score to decide underfit / overfit / perfect
  // LR ~ 2e-4 is perfect. Highly small LR < 1e-5 is underfit. High LR > 1e-2 is overfit.
  // Epochs ~ 5 is perfect. Epochs = 1 is underfit. Epochs > 15 is overfit.
  const computeTrainingState = () => {
    const totalTrainingResource = loraR * epochs * Math.log10(learningRate + 1e-8);
    
    if (epochs <= 2 || learningRate < 1e-5) {
      return 'underfit';
    } else if (epochs >= 14 || learningRate > 8e-3 || loraR >= 32) {
      return 'overfit';
    } else {
      return 'perfect';
    }
  };

  const getActiveOutput = () => {
    const tState = computeTrainingState();
    if (tState === 'underfit') return selectedPreset.underfitOutput;
    if (tState === 'overfit') return selectedPreset.overfitOutput;
    return selectedPreset.perfectOutput;
  };

  const runInterferenceSimulation = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationStep(1);
    setCurrentLogs(['Initializing prompt context buffer tensors...']);

    const steps = [
      { msg: 'Evaluating prompt token mappings...', delay: 600 },
      { msg: 'Synthesizing base model parameters W₀ inside memory registers...', delay: 1400 },
      { msg: 'Applying scaling ratio (α/r) multipliers to low-rank matrices A & B...', delay: 2200 },
      { msg: 'Adding delta projection: h = W₀x + (α/r) * BA(x)', delay: 2800 },
      { msg: 'Decoding generated logits sequences iteratively...', delay: 3600 }
    ];

    steps.forEach((stepObj, idx) => {
      setTimeout(() => {
        setGenerationStep(idx + 2);
        setCurrentLogs(prev => [...prev, stepObj.msg]);
        if (idx === steps.length - 1) {
          setIsGenerating(false);
        }
      }, stepObj.delay);
    });
  };

  const currentTrainingState = computeTrainingState();

  return (
    <div id="inference-playground-view" className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#8A9A5B] p-4 rounded-r-lg shadow-sm">
        <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-[#8A9A5B]" />
          LoRA Adapter Prompt & Inference Playground
        </h3>
        <p className="text-sm text-[#706F63] mt-1 leading-relaxed">
          The climax of training adapters is evaluating prompt generation quality. Select a specialty dataset, calibrate your hyperparameters, and compare responses side-by-side to witness the impact of <strong>underfitting, optimal training, and overfitting</strong> on dynamic output!
        </p>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column Config Sidebar */}
        <div className="lg:col-span-4 bg-[#FAF9F6] border border-[#E5E3D8] p-4 rounded-xl shadow-sm space-y-5">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#706F63] mb-2">
              1. Choose Fine-Tuning Task Dataset
            </h4>
            <div className="space-y-2">
              {datasetPresets.map((preset) => (
                <button
                  key={preset.id}
                  id={`preset-btn-${preset.id}`}
                  onClick={() => handlePresetChange(preset)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer flex flex-col gap-1 ${
                    selectedPreset.id === preset.id
                      ? 'bg-[#33332D] text-[#FAF9F6] border-[#33332D] shadow-sm'
                      : 'bg-[#FAF8F3]/60 border-[#E5E3D8] hover:bg-[#F2F1EA]'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1.5">
                    {preset.name}
                  </span>
                  <span className={`text-[10px] leading-relaxed ${selectedPreset.id === preset.id ? 'text-gray-300' : 'text-[#706F63]'}`}>
                    {preset.subject}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#706F63] mb-3 flex justify-between">
              <span>2. Calibrate Hyperparameters</span>
              <span className="text-[10px] text-[#8A9A5B] font-bold">Live feedback</span>
            </h4>

            {/* Live Parameter State Evaluator */}
            <div className="bg-[#FAF8F3] border border-[#E5E3D8] p-3 rounded-lg mb-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#706F63] font-medium">Adapter Strength (α / r):</span>
                <span className="font-mono font-bold text-[#33332D]">
                  {(loraAlpha / loraR).toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#EFEDE4] pt-2">
                <span className="text-[#706F63] font-medium">Model Calibration State:</span>
                <span className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded border ${
                    currentTrainingState === 'perfect' 
                      ? 'bg-[#EAF2E8] border-[#B2D8A6] text-[#3E6335]' 
                      : currentTrainingState === 'underfit' 
                      ? 'bg-[#FAF6EE] border-[#EAD0A8] text-[#B58021]'
                      : 'bg-[#FDF2F2] border-[#F8B4B4] text-[#C81E1E]'
                  }`}
                >
                  {currentTrainingState}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Rank */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#55534C] font-semibold">LoRA Rank (r):</span>
                  <span className="font-mono text-[#8A9A5B] font-bold">{loraR}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  step="4"
                  value={loraR}
                  onChange={(e) => {
                    setLoraR(parseInt(e.target.value));
                    setGenerationStep(0);
                  }}
                  className="w-full h-1.5 bg-[#E5E3D8] rounded-lg appearance-none cursor-pointer accent-[#8A9A5B]"
                />
                <p className="text-[9px] text-[#706F63]">Larger rank holds wider parameter changes, risking overfitting if training exceeds capacity.</p>
              </div>

              {/* Alpha */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#55534C] font-semibold">LoRA Alpha (α):</span>
                  <span className="font-mono text-[#8A9A5B] font-bold">{loraAlpha}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  step="8"
                  value={loraAlpha}
                  onChange={(e) => {
                    setLoraAlpha(parseInt(e.target.value));
                    setGenerationStep(0);
                  }}
                  className="w-full h-1.5 bg-[#E5E3D8] rounded-lg appearance-none cursor-pointer accent-[#8A9A5B]"
                />
                <p className="text-[9px] text-[#706F63]">Acts as a multiplier for adapter alignment. Higher values boost the trained behavior aggressively.</p>
              </div>

              {/* Learning Rate */}
              <div className="space-y-1.5">
                <span className="text-xs text-[#55534C] font-semibold block">Learning Rate:</span>
                <select
                  value={learningRate}
                  onChange={(e) => {
                    setLearningRate(parseFloat(e.target.value));
                    setGenerationStep(0);
                  }}
                  className="w-full bg-[#FAF8F3] border border-[#E5E3D8] p-2 text-xs rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#8A9A5B] text-[#33332D]"
                >
                  <option value={1e-6}>1e-6 (Underfitting risk: extremely slow)</option>
                  <option value={2e-4}>2e-4 (Optimal convergence threshold)</option>
                  <option value={1e-2}>1e-2 (Overfitting risk: catastrophic variance)</option>
                </select>
              </div>

              {/* Epochs */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#55534C] font-semibold">Training Epochs:</span>
                  <span className="font-mono text-[#8A9A5B] font-bold">{epochs}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={epochs}
                  onChange={(e) => {
                    setEpochs(parseInt(e.target.value));
                    setGenerationStep(0);
                  }}
                  className="w-full h-1.5 bg-[#E5E3D8] rounded-lg appearance-none cursor-pointer accent-[#8A9A5B]"
                />
                <p className="text-[9px] text-[#706F63]">Few epochs underfit (adapter fails to learn); excessive epochs overfit (adapter repeats words or outputs artifacts).</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Inference Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Prompt input sandbox box */}
          <div className="bg-[#FAF9F6] border border-[#E5E3D8] p-5 rounded-xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-[#33332D] uppercase tracking-wide flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#8A9A5B]" />
                User Prompt Input (W₀ Ingestion Socket)
              </span>
              <button
                onClick={() => setPromptText(selectedPreset.samplePrompt)}
                className="text-[10px] font-mono text-[#8A9A5B] hover:underline cursor-pointer"
              >
                Reset Default Prompt
              </button>
            </div>

            <textarea
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value);
                setGenerationStep(0);
              }}
              rows={3}
              placeholder="Type your model prompt evaluation..."
              className="w-full bg-[#FAF8F3] border border-[#E5E3D8] p-3 text-xs rounded-lg font-sans focus:outline-none focus:ring-1 focus:ring-[#8A9A5B] text-[#33332D] leading-relaxed resize-none shadow-inner"
            />

            <div className="flex justify-between items-center pt-1.5">
              <span className="text-[11px] text-[#706F63] flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                VRAM state: <span className="font-bold underline text-[#33332D]">4.5 GB / 16 GB locked</span>
              </span>
              <button
                onClick={runInterferenceSimulation}
                disabled={isGenerating}
                className={`py-2 px-5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  isGenerating
                    ? 'bg-[#EFEDE4] text-gray-400 border border-[#E5E3D8] cursor-not-allowed'
                    : 'bg-[#33332D] hover:bg-[#55534C] text-[#FAF9F6] shadow-md hover:translate-y-[-1px]'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                {isGenerating ? 'Decoding Logits...' : 'Generate and Compare Responses'}
              </button>
            </div>
          </div>

          {/* SIDE-BY-SIDE EVALUATION CHANNELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Base Model (Unrefined) */}
            <div className="bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between h-[280px]">
              <div className="bg-[#EFEDE4] p-3 border-b border-[#E5E3D8] flex justify-between items-center">
                <span className="text-xs font-serif font-bold text-[#33332D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#706F63]" />
                  Base Model (Unrefined W₀)
                </span>
                <span className="text-[9px] font-mono bg-white border border-[#D5D3C7] px-1.5 py-0.5 rounded text-[#706F63]">
                  Frozen Weights
                </span>
              </div>

              <div className="p-4 flex-1 overflow-auto bg-white font-serif text-[12px] leading-relaxed text-[#33332D] select-all space-y-2">
                {generationStep >= 1 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="italic text-[#55534C] whitespace-pre-wrap"
                  >
                    "{selectedPreset.baseOutput}"
                  </motion.p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2">
                    <HelpCircle className="w-8 h-8 opacity-45" />
                    <span className="text-xs font-mono">Awaiting inference triggers...</span>
                  </div>
                )}
              </div>

              <div className="bg-[#FAF8F3] p-2.5 border-t border-[#E5E3D8] flex justify-between text-[10px] font-mono text-[#706F63]">
                <span>Prompt Format: Raw Text</span>
                <span>Accuracy: Standard</span>
              </div>
            </div>

            {/* Adapter Enhanced Model */}
            <div className="bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between h-[280px]">
              <div className="bg-[#EFEDE4] p-3 border-b border-[#E5E3D8] flex justify-between items-center">
                <span className="text-xs font-serif font-bold text-[#33332D] flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    currentTrainingState === 'perfect' 
                      ? 'bg-green-500' 
                      : currentTrainingState === 'underfit' 
                      ? 'bg-amber-500' 
                      : 'bg-red-500'
                  }`} />
                  LoRA Adapter Enhanced Model ({currentTrainingState.toUpperCase()})
                </span>
                <span className="text-[9px] font-mono bg-white border border-[#D5D3C7] px-1.5 py-0.5 rounded text-[#8A9A5B] font-bold">
                  W₀ + (α/r)·BA
                </span>
              </div>

              <div className="p-4 flex-1 overflow-auto bg-white font-mono text-[11px] leading-relaxed text-[#33332D] select-all space-y-2">
                {generationStep >= 6 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-[#3E6335] whitespace-pre-wrap"
                  >
                    {getActiveOutput()}
                  </motion.div>
                ) : generationStep >= 1 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[#8A9A5B] space-y-2 animate-pulse">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="text-xs">Evaluating adapter nodes weight states...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2">
                    <Code2 className="w-8 h-8 opacity-45" />
                    <span className="text-xs">Awaiting inference triggers...</span>
                  </div>
                )}
              </div>

              <div className="bg-[#FAF8F3] p-2.5 border-t border-[#E5E3D8] flex justify-between text-[10px] font-mono text-[#706F63]">
                <span>Trained Params: 0.08%</span>
                <span className="font-bold uppercase">
                  {currentTrainingState === 'perfect' ? '✅ Structured style' : currentTrainingState === 'underfit' ? '⚠️ Underconverged' : '❌ Catastrophic Loop'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Logs Console */}
          {generationStep >= 1 && (
            <div className="bg-[#FAF9F6] border border-[#E5E3D8] p-4 rounded-xl shadow-sm space-y-2 font-mono">
              <span className="text-xs font-bold text-[#33332D] flex items-center gap-1.5 border-b border-[#E5E3D8] pb-1">
                <Terminal className="w-4 h-4 text-[#8A9A5B]" />
                Inference Trace Engine Output:
              </span>
              <div className="space-y-1 text-[11px] text-[#706F63] leading-relaxed">
                {currentLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-gray-300">↳</span>
                    <span>{log}</span>
                  </div>
                ))}
                {isGenerating && (
                  <span className="inline-block animate-bounce font-bold text-[#8A9A5B] ml-4">●</span>
                )}
              </div>
            </div>
          )}

          {/* Educational summary footer on overfit vs underfit */}
          <div className="bg-[#FAF6EE] border-t border-[#E5E3D8] p-4 rounded-xl space-y-2">
            <h5 className="text-xs font-serif font-bold text-[#33332D] flex items-center gap-1.5">
              <BadgeAlert className="w-4 h-4 text-[#B58021]" />
              Inference Playground Diagnostic Guide:
            </h5>
            <p className="text-xs text-[#706F63] leading-relaxed">
              Notice how <strong>Medical SOAP</strong> or <strong>SQL Synthesizer</strong> format and tone align with training quality:
            </p>
            <ul className="text-xs text-[#706F63] space-y-1 list-disc pl-5">
              <li><strong>Underfit (Low LR or Low Epochs):</strong> The model starts to copy words or structure slightly, but remains rigid, flat, and doesn't fully capture clinical structures or query syntax constraints.</li>
              <li><strong>Optimal (Balanced Parameterization):</strong> Perfect style alignment! Headers are structured precisely, details match instructions, and base information is supplemented safely.</li>
              <li><strong>Overfit (High LR, Excessive Epochs, or Extravagant Ranks):</strong> The adapter collapses! It starts repeating certain terms endlessly (e.g. <code>LIFT LIFT CRATE CRATE...</code> or repeating <code>SELECT AVG...</code> endlessly), representing the classic failure point of over-trained networks.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
