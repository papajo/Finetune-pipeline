import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic2,
  Volume2,
  Sparkles,
  Bookmark,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Award,
  Zap,
  Globe,
  Share2,
  Users
} from 'lucide-react';

interface JargonTranslation {
  id: string;
  simple: string;
  elite: string;
  topic: string;
  explanation: string;
  terms: Array<{ term: string; definition: string }>;
}

interface DrillQuestion {
  id: number;
  audienceMember: string;
  avatar: string;
  role: string;
  question: string;
  options: Array<{
    text: string;
    level: 'Layperson' | 'Enthusiast' | 'Elite Researcher';
    score: number;
    feedback: string;
  }>;
}

export default function LingoBootcampView() {
  const translations: JargonTranslation[] = [
    {
      id: 'memory',
      topic: 'VRAM & Optimization Mechanics',
      simple: 'My models take too much memory, and I don\'t have enough GPUs so they keep crashing with out-of-memory errors.',
      elite: 'We are structurally constrained by GPU SRAM/VRAM allocation limits. To mitigate catastrophic CUDA Out-Of-Memory (OOM) triggers during backward passes, we decoupled the optimizer states by synthesizing low-rank adapter (LoRA) matrices, reducing trainable weight parameters down to 0.08%, while substituting standard FP32 weight updates with bfloat16 mixed-precision autocast blocks.',
      explanation: 'Notice how we replace "memory" with specific storage registers (SRAM/VRAM) and define the mechanical solution (decoupling optimizer states through low-rank parameter tuning and mixed-precision tensors) instead of just "fixing crashes".',
      terms: [
        { term: 'CUDA OOM', definition: 'Compute Unified Device Architecture Out of Memory error, occur when tensors exceed graphics memory limits.' },
        { term: 'Optimizer States', definition: 'Memory overhead holding rolling momentum and gradient variances (like in AdamW), often taking 2-3x more memory than model parameters.' },
        { term: 'Backward Pass', definition: 'The reverse propagation through the network graph to evaluate partial derivatives and gradients.' }
      ]
    },
    {
      id: 'scheduling',
      topic: 'Learning Rate Dynamics',
      simple: 'The model stopped learning after a while, or it got worse when I let it run too long.',
      elite: 'The loss surface is highly non-convex, leading to training instability. We implemented a Cosine Annealing learning rate schedule backed by an initial linear warm-up phase to navigate chaotic starting gradients. This was coupled with severe L2 gradient norm clipping to prevent gradient explosion during late-epoch high-frequency steps.',
      explanation: 'Instead of saying "it stopped learning," refer to the geometry of optimization ("loss surface complexity" and "non-convex gradients") and state how scheduling modifies step-size trajectory over training epochs.',
      terms: [
        { term: 'Non-Convex Surface', definition: 'A dimensional loss landscape riddled with local minima, valleys, and saddle points, making optimization non-linear.' },
        { term: 'Cosine Annealing', definition: 'Decaying the learning rate down to near-zero along a cosine curve to permit ultra-fine optimization steps as converges near the global minimum.' },
        { term: 'Gradient Explosion', definition: 'Gradients compounding exponentially over deep graph layers, causing weight values to become erratic (NaN).' }
      ]
    },
    {
      id: 'data',
      topic: 'Pre-processing & Representation',
      simple: 'I have some clinical text files, but there\'s too much noise and unbalanced labels for training.',
      elite: 'Our raw downstream corpus exhibits substantial semantic variance and extreme category distribution skew. To prepare the ingestion pipeline, we implemented a stratified token-balanced split. We then enforced prompt templating constraints to align raw subjective reports with the frozen base pre-trained LLM\'s latent semantic pathways.',
      explanation: 'Instead of "unbalanced files," use terms like "category distribution skew" and "token-balanced stratification" to sound deeply mathematical and systematic about data preprocessing.',
      terms: [
        { term: 'Semantic Variance', definition: 'The diversity of vocabulary, idioms, syntax, and formatting within text corpora.' },
        { term: 'Stratified Split', definition: 'Dividing data such that the proportional representation of specialized categories matches across training and validation sets.' },
        { term: 'Latent Pathways', definition: 'The internal high-dimensional vector representations embedded during the original base model pre-training.' }
      ]
    },
    {
      id: 'inference',
      topic: 'Generation Alignment',
      simple: 'The model just copy-pastes sentences from the dataset or keeps saying the exact same words in a loop.',
      elite: 'The adapter suffered from overfitting due to a disproportionate learning rate and rank configuration, causing the decoder to fall into a state of token-repetition limit collapse. The latent space lost its probabilistic entropy, resulting in deterministic loops across the autoregressive text generation pipeline.',
      explanation: 'Replace "repeats words in a loop" with "token-repetition limit collapse" and "loss of probabilistic entropy inside the autoregressive decoder pipeline."',
      terms: [
        { term: 'Autoregressive Decoding', definition: 'Generating text token-by-token, where each output is appended to the input prompt for the next step.' },
        { term: 'Probabilistic Entropy', definition: 'The measure of randomness or choice variety in output logits before performing top-k or temperature sampling.' },
        { term: 'Limit Collapse', definition: 'The condition where the model settles into a repeating pattern loop due to overtraining and highly peaked distributions.' }
      ]
    }
  ];

  const drillQuestions: DrillQuestion[] = [
    {
      id: 1,
      audienceMember: 'Dr. Evelyn Vance',
      avatar: '👩‍🔬',
      role: 'Principal Scientist at OpenAI Labs',
      question: 'Your adapter performance shows an impressive reduction in downstream perplexity on clinical data. However, how did you ensure you didn\'t induce catastrophic catastrophic forgetting of the base model\'s foundational alignment?',
      options: [
        {
          text: 'We didn\'t run into any problems because the base model weights are entirely frozen. Only the low-rank delta matrices are trained, so the base performance remains perfectly preserved and accessible via forward decoupling.',
          level: 'Elite Researcher',
          score: 10,
          feedback: 'Incredible response! Explaining weight freezing, low-rank adapters, and forward mechanics proves you understand mathematical decoupling of weights.'
        },
        {
          text: 'We just ran some tests on general knowledge benchmarks after training and it seemed mostly okay. We might keep an eye on it if it breaks.',
          level: 'Enthusiast',
          score: 5,
          feedback: 'Slightly passive. In a conference setting, you want to refer to parameter-freezing and the low-rank nature of LoRA to defend your weights.'
        },
        {
          text: 'The model didn\'t forget because we used really clean datasets and didn\'t let it train for too long or get too big.',
          level: 'Layperson',
          score: 1,
          feedback: 'Avoid abstract terms like "really clean datasets". Mentioning "frozen pre-trained weights" and "parameter-efficient tuning (PEFT)" is key.'
        }
      ]
    },
    {
      id: 2,
      audienceMember: 'Markus Chen',
      avatar: '👨‍💻',
      role: 'Senior Staff Infrastructure Architect, NVIDIA',
      question: 'With FP16 mixed precision, lower precision often leads to loss of gradient representations and dynamic underflow. How did you resolve that during backpropagation iterations?',
      options: [
        {
          text: 'We utilized a dynamic Loss Scaler. It multiplies the loss by a large factor before backpropagation to shift gradients into FP16 precision limits, performs unscaling before optimization steps, and dynamically cuts down the scaling of gradients if any NaN values slip in.',
          level: 'Elite Researcher',
          score: 10,
          feedback: 'Perfect precision math definition! Describing the dynamic scaling, backprop shifts, and NaN mitigation is optimal Speaker Dialect.'
        },
        {
          text: 'We just switched to bf16 which has the same range as float32, so we completely bypassed underflow without needing to scale the loss.',
          level: 'Enthusiast',
          score: 7,
          feedback: 'Excellent alternative! While correct for bfloat16-supported GPUs, explaining how FP16 specifically handles gradient shifts is the elite answer to Markus\' query.'
        },
        {
          text: 'We just let PyTorch handle the precision automatically with a line of code and didn\'t need to worry about the math ourselves.',
          level: 'Layperson',
          score: 2,
          feedback: 'Never say "we just let the library handle it" at a conference! Explicitly define "Dynamic Loss Scaling" and "exponent range representations" instead.'
        }
      ]
    }
  ];

  // Buzzword soundboard components
  const prefixBuzz = ['Sparsified', 'Autoregressive', 'Low-Rank', 'Stratified', 'Decoupled', 'Parameter-Efficient', 'Dynamic', 'Non-Convex'];
  const rootBuzz = ['Attention Projection', 'VRAM Decoupling', 'Gradient Accumulated', 'Cosine Annealed', 'Latent Target', 'Transformer Block', 'Logits Entropic'];
  const suffixBuzz = ['Quantization Pipeline', 'Autocast Ingestion', 'Norm Clipping Optimizer', 'Parameter Matrix Scaling', 'Loss Surface Convergence'];

  const [activeTranslation, setActiveTranslation] = useState<JargonTranslation>(translations[0]);
  const [drillIndex, setDrillIndex] = useState<number>(0);
  const [selectedDrillOption, setSelectedDrillOption] = useState<number | null>(null);
  const [completedDrills, setCompletedDrills] = useState<Record<string, number>>({});
  const [buzzPrefix, setBuzzPrefix] = useState<string>(prefixBuzz[0]);
  const [buzzRoot, setBuzzRoot] = useState<string>(rootBuzz[0]);
  const [buzzSuffix, setBuzzSuffix] = useState<string>(suffixBuzz[0]);

  const handleSelectDrill = (optIdx: number) => {
    setSelectedDrillOption(optIdx);
    setCompletedDrills(prev => ({ ...prev, [String(drillQuestions[drillIndex].id)]: optIdx }));
  };

  const getDrillScoreSum = () => {
    return Object.entries(completedDrills).reduce((acc, [qId, optIdx]) => {
      const q = drillQuestions.find(dq => dq.id === parseInt(qId));
      return acc + (q?.options[optIdx as number]?.score || 0);
    }, 0);
  };

  const generatedBuzzword = `${buzzPrefix} ${buzzRoot} ${buzzSuffix}`;

  const getBuzzwordDefinition = () => {
    return `An advanced design methodology that leverages ${buzzPrefix.toLowerCase()} parameters to coordinate a ${buzzRoot.toLowerCase()} mechanism, designed to optimize the ${buzzSuffix.toLowerCase()} during distributed training.`;
  };

  return (
    <div id="lingo-bootcamp-view" className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#3E6335] p-5 rounded-r-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-[#3E6335]" />
            AI Conference Speaker Bootcamp & Jargon Practice
          </h3>
          <p className="text-sm text-[#706F63] leading-relaxed">
            Master the precise mathematical dialects of Deep Learning. Learn to describe training phenomena, explain architectural bottlenecks, and answer tricky conference Q&A inquiries with professional elegance.
          </p>
        </div>
        <div className="bg-[#EAF2E8] border border-[#B2D8A6] px-4 py-2.5 rounded-xl shrink-0 flex items-center gap-2">
          <Award className="text-[#3E6335] w-5 h-5" />
          <div className="text-xs font-mono">
            <span className="block text-[9px] text-[#706F63] uppercase">Speaker Rank Score</span>
            <span className="font-bold text-[#3E6335] text-[13px]">{getDrillScoreSum()} / {drillQuestions.length * 10} Points</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section Left: Interactive Translation Deck */}
        <div className="lg:col-span-7 bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#3E6335] bg-[#EAF2E8] px-2 py-0.5 rounded border border-[#B2D8A6]">
              Interactive Translation Sandbox
            </span>
            <h4 className="font-serif text-[16px] font-bold text-[#33332D]">
              Translate Layman Talk to Elite AI Researcher Jargon
            </h4>
            <p className="text-xs text-[#706F63]">
              Select common engineering friction scenarios below to witness how professional AI researchers formalize them for conference slides:
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {translations.map((t) => (
              <button
                key={t.id}
                id={`translate-btn-${t.id}`}
                onClick={() => setActiveTranslation(t)}
                className={`py-2 px-3 rounded-lg border text-left text-[11px] transition-all cursor-pointer font-medium truncate ${
                  activeTranslation.id === t.id
                    ? 'bg-[#33332D] border-[#33332D] text-[#FAF9F6]'
                    : 'bg-[#FAF8F3] border-[#E5E3D8] hover:bg-[#F2F1EA] text-[#55534C]'
                }`}
              >
                {t.topic}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Simple / Layman */}
            <div className="bg-white border border-[#E5E3D8] rounded-xl p-4 flex flex-col justify-between min-h-[140px] shadow-inner">
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase block border-b border-gray-100 pb-1">
                ❌ Simple / Casual phrasing
              </span>
              <p className="text-xs italic text-[#706F63] py-2 leading-relaxed font-serif">
                "{activeTranslation.simple}"
              </p>
              <span className="text-[9px] font-mono text-[#D9A34A] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Sounds amateur on stage
              </span>
            </div>

            {/* Elite / Researcher */}
            <div className="bg-[#EAF2E8]/40 border border-[#B2D8A6] rounded-xl p-4 flex flex-col justify-between min-h-[140px] shadow-sm">
              <span className="text-[10px] font-mono text-[#3E6335] font-bold uppercase block border-b border-[#E1EFDD] pb-1">
                🚀 Elite Conference-speaker Jargon
              </span>
              <p className="text-[11px] text-[#33332D] py-2 leading-relaxed font-mono font-medium">
                "{activeTranslation.elite}"
              </p>
              <span className="text-[9px] font-mono text-[#3E6335] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> High authority score!
              </span>
            </div>
          </div>

          {/* Under-the-hood term deep dive */}
          <div className="bg-[#FAF8F3] border border-[#E5E3D8] p-3.5 rounded-lg space-y-2.5">
            <span className="text-[10px] font-mono text-[#55534C] font-semibold flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-[#3E6335]" /> Dialect Mechanics Breakdown:
            </span>
            <p className="text-xs text-[#706F63] leading-relaxed">
              {activeTranslation.explanation}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-[#EFEDE4]">
              {activeTranslation.terms.map((termObj, oIdx) => (
                <div key={oIdx} className="text-[10px] leading-relaxed bg-white p-2 rounded border border-[#E5E3D8]">
                  <strong className="text-[#3E6335] font-mono">{termObj.term}:</strong>{' '}
                  <span className="text-[#55534C]">{termObj.definition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Right: Interactive Audience Q&A Drill Simulator */}
        <div className="lg:col-span-5 bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#D9A34A] bg-[#FDF1D8] px-2 py-0.5 rounded border border-[#EAD0A8]">
              Virtual Q&A Stage Drill
            </span>
            <h4 className="font-serif text-[16px] font-bold text-[#33332D] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#8A9A5B]" />
              Handle Critical Panel Inquiries
            </h4>
            <p className="text-xs text-[#706F63]">
              An AI luminary is standing in front of you holding a microphone. Answer their question to secure your reputation.
            </p>
          </div>

          {/* The Active Question */}
          <div className="bg-white border border-[#E5E3D8] p-4 rounded-xl shadow-inner space-y-3">
            <div className="flex gap-2 items-center">
              <span className="text-3xl text-center shrink-0">{drillQuestions[drillIndex].avatar}</span>
              <div>
                <span className="block text-xs font-bold font-serif text-[#33332D]">
                  {drillQuestions[drillIndex].audienceMember}
                </span>
                <span className="block text-[9px] font-mono text-[#706F63] uppercase">
                  {drillQuestions[drillIndex].role}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#55534C] leading-relaxed italic bg-[#FAF8F3] p-3 rounded-lg font-serif border border-[#EFEDE4]">
              "{drillQuestions[drillIndex].question}"
            </p>
          </div>

          {/* Drill Options */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-gray-400 block">
              Formulate your response:
            </span>
            {drillQuestions[drillIndex].options.map((option, optIdx) => {
              const isSelected = selectedDrillOption === optIdx;
              const hasAnswered = selectedDrillOption !== null;
              
              let optStyle = 'border-[#E5E3D8] bg-white hover:bg-[#FAF8F3]';
              if (isSelected) {
                optStyle = option.score >= 10
                  ? 'border-[#3E6335] bg-[#EAF2E8] text-[#3E6335]'
                  : option.score >= 5
                  ? 'border-[#D9A34A] bg-[#FDF1D8] text-[#8B6424]'
                  : 'border-red-400 bg-[#FDF2F2] text-red-700';
              } else if (hasAnswered) {
                optStyle = 'border-gray-100 bg-white opacity-50 cursor-not-allowed';
              }

              return (
                <button
                  key={optIdx}
                  id={`drill-opt-${optIdx}`}
                  onClick={() => !hasAnswered && handleSelectDrill(optIdx)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition-all cursor-pointer flex gap-2 ${optStyle}`}
                >
                  <span className="font-mono text-gray-400 font-bold">{optIdx + 1}.</span>
                  <div className="space-y-1">
                    <p className="text-xs">{option.text}</p>
                    <span className="inline-block text-[8px] uppercase tracking-wide font-mono px-1 rounded bg-slate-100 text-slate-500">
                      {option.level}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instant feedback display */}
          <AnimatePresence mode="wait">
            {selectedDrillOption !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`p-3.5 rounded-lg border text-xs leading-relaxed font-sans ${
                  drillQuestions[drillIndex].options[selectedDrillOption].score >= 10
                    ? 'bg-[#EAF2E8] border-[#B2D8A6] text-[#3E6335]'
                    : drillQuestions[drillIndex].options[selectedDrillOption].score >= 5
                    ? 'bg-[#FDF1D8] border-[#EAD0A8] text-[#8B6424]'
                    : 'bg-[#FDF2F2] border-[#F8B4B4] text-red-700'
                }`}
              >
                <div className="font-mono uppercase font-bold text-[9px] flex justify-between mb-1">
                  <span>Score evaluation: {drillQuestions[drillIndex].options[selectedDrillOption].score}/10</span>
                  <span>{drillQuestions[drillIndex].options[selectedDrillOption].level} Level</span>
                </div>
                <p>{drillQuestions[drillIndex].options[selectedDrillOption].feedback}</p>
                
                {/* Next Question toggle */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setSelectedDrillOption(null);
                      setDrillIndex((prev) => (prev + 1) % drillQuestions.length);
                    }}
                    className="font-mono font-bold text-[10px] text-[#33332D] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Next Panel Investigator <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* The Soundboard Builder Matrix */}
      <div className="bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#8A9A5B] bg-[#EAF2E8]/60 px-2 py-0.5 rounded border border-[#B2D8A6] inline-block">
            AI Buzzword Phrase Generator
          </span>
          <h4 className="font-serif text-[16px] font-bold text-[#33332D] flex items-center gap-1.5 animate-pulse">
            <Zap className="w-4 h-4 text-[#8A9A5B]" />
            Construct Custom Conference Talk Slide Buzzwords
          </h4>
          <p className="text-xs text-[#706F63]">
            Keep your presentation listeners fully captivated. Stack three semantic components together to synthesize highly advanced architectural phrases:
          </p>
        </div>

        {/* Matrix Selection columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Prefix column */}
          <div className="space-y-1.5 font-mono">
            <label className="text-[10px] font-bold text-[#706F63] uppercase">Prefix Component:</label>
            <select
              value={buzzPrefix}
              onChange={(e) => setBuzzPrefix(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#E5E3D8] p-2 text-xs rounded-lg text-[#33332D] font-semibold focus:outline-none focus:ring-1 focus:ring-[#8A9A5B]"
            >
              {prefixBuzz.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Root column */}
          <div className="space-y-1.5 font-mono">
            <label className="text-[10px] font-bold text-[#706F63] uppercase">Structural Root:</label>
            <select
              value={buzzRoot}
              onChange={(e) => setBuzzRoot(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#E5E3D8] p-2 text-xs rounded-lg text-[#33332D] font-semibold focus:outline-none focus:ring-1 focus:ring-[#8A9A5B]"
            >
              {rootBuzz.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Suffix column */}
          <div className="space-y-1.5 font-mono">
            <label className="text-[10px] font-bold text-[#706F63] uppercase">Target Application:</label>
            <select
              value={buzzSuffix}
              onChange={(e) => setBuzzSuffix(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#E5E3D8] p-2 text-xs rounded-lg text-[#33332D] font-semibold focus:outline-none focus:ring-1 focus:ring-[#8A9A5B]"
            >
              {suffixBuzz.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Generated Output Showcase */}
        <div className="bg-white border border-[#E5E3D8] p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 flex-1">
            <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-gray-400">
              Your synthesized presentation phrase:
            </span>
            <p className="text-sm font-mono font-bold text-[#3E6335] leading-relaxed bg-[#EAF2E8]/30 px-3 py-1.5 rounded border border-[#E1EFDD] inline-block">
              {generatedBuzzword}
            </p>
            <p className="text-[11px] text-[#706F63] italic">
              {getBuzzwordDefinition()}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedBuzzword);
            }}
            className="text-xs bg-[#33332D] hover:bg-[#55534C] text-[#FAF9F6] font-bold rounded-lg py-2 px-4 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" /> Copy to Slide Draft
          </button>
        </div>
      </div>

      {/* Recommended Conference Slide Topics & Structure */}
      <div className="bg-[#FAF6EE] border border-[#E5E3D8] p-5 rounded-xl space-y-3">
        <h4 className="font-serif text-[15px] font-bold text-[#33332D] flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-[#8A9A5B]" />
          Key Conference Presentation Topics derived from your Laboratory
        </h4>
        <p className="text-xs text-[#706F63]">
          Use your results from the active simulator exercises to fill out three core slide templates on stage:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5E3D8] p-3.5 rounded-lg space-y-1.5">
            <strong className="text-xs text-[#33332D] font-serif block">1. Parameter Saving Slide</strong>
            <p className="text-[11px] text-[#706F63] leading-relaxed">
              Show how applying low-rank matrices <strong>(W₀ + α/r * BA)</strong> bypassed trading off fine-tuning accuracy while preserving 99% of raw GPU memory. Include charts of rank <code>r=8</code> vs <code>r=32</code>.
            </p>
          </div>
          <div className="bg-white border border-[#E5E3D8] p-3.5 rounded-lg space-y-1.5">
            <strong className="text-xs text-[#33332D] font-serif block">2. Numerical Precision Slide</strong>
            <p className="text-[11px] text-[#706F63] leading-relaxed">
              Demonstrate the trade-off between FP16 speedups and gradient underflow. Talk about <strong>Dynamic Loss Scaling</strong> and how <code>bfloat16</code> provides natural safety over standard half-precision ranges.
            </p>
          </div>
          <div className="bg-white border border-[#E5E3D8] p-3.5 rounded-lg space-y-1.5">
            <strong className="text-xs text-[#33332D] font-serif block">3. Step Optimization Slide</strong>
            <p className="text-[11px] text-[#706F63] leading-relaxed">
              Illustrate loss decay patterns. Compare a linear step down with our <strong>Cosine Annealing Warmup Schedule</strong>. Explain how gradient clipping stops loss instability under sparse training runs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
