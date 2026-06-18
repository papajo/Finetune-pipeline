import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  ShieldAlert,
  Binary,
  Gauge,
  Columns,
  Monitor,
  HelpCircle,
  HelpCircleIcon,
  Check,
  Award,
  BookOpen,
  Info
} from 'lucide-react';

import LoraTraceView from './components/LoraTraceView';
import GradClipView from './components/GradClipView';
import MixedPrecisionView from './components/MixedPrecisionView';
import SchedulerView from './components/SchedulerView';
import DatasetSplitView from './components/DatasetSplitView';
import PipelineDebugger from './components/PipelineDebugger';
import ProductionArchitectureView from './components/ProductionArchitectureView';

type TabType = 'debugger' | 'lora' | 'clipping' | 'precision' | 'scheduler' | 'split' | 'diagnostic' | 'architecture';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  concept: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('debugger');

  // Flashcard Diagnostic Workbook
  const quizQuestions: Question[] = [
    {
      id: 1,
      concept: 'Exercise 1: LoRA Math',
      question: 'During LoRA forward forward projection (h = W₀x + (α/r) · BAx), which weights receive backpropagation gradient updates?',
      options: [
        'Both W₀ and the low-rank adapter matrices A & B',
        'Only the pre-trained weights W₀ (base matrices), while adapters stay locked',
        'Only the low-rank matrices A & B, while W₀ parameters remain frozen',
        'Neither; LoRA works purely on key/value database projections without backprop gradients'
      ],
      correctIdx: 2,
      explanation: 'LoRA freezes the heavy pre-trained weights (W₀) to dramatically save VRAM footprint. Only the small adapters A & B accumulate gradients during backward passes, dropping parameter training overhead down to <1%.'
    },
    {
      id: 2,
      concept: 'Exercise 2: Gradient Clipping Sequence',
      question: 'Where represents the mathematically correct point in the PyTorch training loop to execute torch.nn.utils.clip_grad_norm_()?',
      options: [
        'Before loss.backward(), to filter output dimensions beforehand',
        'After loss.backward() but prior to optimizer.step(), because gradients must be calculated first',
        'Directly after optimizer.step() completes to sanitize weights multipliers',
        'At the very start of dataset iteration loops prior to zeroing out buffer memories'
      ],
      correctIdx: 1,
      explanation: 'Gradient clipping requires clipping calculated gradients! Gradients do not exist before loss.backward() evaluates, and clipping them after optimizer.step() is too late because unstable parameters have already been updated.'
    },
    {
      id: 3,
      concept: 'Exercise 3: Mixed Precision Order',
      question: 'Why must scaler.unscale_(optimizer) execute strictly BEFORE clip_grad_norm_ is evaluated when training in FP16?',
      options: [
        'Because PyTorch will throw a memory leak error if executed in other schedules',
        'To shift weights representation back to 32-bit floating point precision limits',
        'Because clipping scaled gradients renders clipping bounds incorrect. Gradients must be mapped back to normal ranges to calculate proper Euclidean norms.',
        'To trigger the scheduling decay mechanism'
      ],
      correctIdx: 2,
      explanation: 'If gradients are still scaled in FP16 (e.g. multiplied by 65536), their calculated Euclidean norm is erroneously inflated. Clipping is calculated based strictly on unscaled gradient magnitudes.'
    },
    {
      id: 4,
      concept: 'Exercise 4: Schedulers',
      question: 'How do linear warmup steps at the start of a training loop help the stability of deep transformer weights?',
      options: [
        'They keep the learning rate extremely small while model architectures initialize, preventing initial massive gradient variances from disrupting weights stability',
        'They clear GPU caches to prevent segment errors',
        'They automatically scale FP16 parameters to evade underflow triggers',
        'Warmups allow dataset loading elements to randomize batches'
      ],
      correctIdx: 0,
      explanation: 'Deep transformers often experience spikes in gradient variances near initialization. Increasing learning rates gradually protects randomly initialized layers from catastrophic model disruption.'
    },
    {
      id: 5,
      concept: 'Exercise 5: Overfitting Indicators',
      question: 'How do you detect overfitting through training and validation metrics logs?',
      options: [
        'Training loss starts to level off and remains flat',
        'Validation loss continues trending downward while training loss remains flat',
        'Training loss goes down continuously, but validation loss begins climbing back up, causing a divergence gap',
        'Both curves fluctuate wildly under standard underflow parameters'
      ],
      correctIdx: 2,
      explanation: 'Generalization decreases when the model memorizes noise of training sets. Consequently, validation loss rises while training loss keeps dropping. This divergence signals the optimum checkpoint point.'
    }
  ];

  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [showExplanation, setShowExplanation] = useState<{ [key: number]: boolean }>({});

  const handleSelectOption = (qId: number, oIdx: number) => {
    setQuizAnswers({ ...quizAnswers, [qId]: oIdx });
    setShowExplanation({ ...showExplanation, [qId]: true });
  };

  const completedCount = Object.keys(quizAnswers).length;
  const correctCount = quizQuestions.filter((q) => quizAnswers[q.id] === q.correctIdx).length;

  return (
    <div className="min-h-screen bg-[#F9F8F3] text-[#33332D] font-sans flex flex-col justify-between selection:bg-[#EAF2E8]">
      {/* Premium Dashboard Header */}
      <header className="bg-[#FAF9F6] border-b border-[#E5E3D8] sticky top-0 z-35 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#8A9A5B] rounded-xl text-white shadow-sm shadow-[#8A9A5B]/10">
              <BookOpen className="w-6 h-6 stroke-[2px]" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-[#33332D] tracking-tight flex items-center gap-2">
                LLM Fine-Tuning Pipeline Laboratory
              </h1>
              <p className="text-xs text-[#706F63] font-medium tracking-wide">
                Interactive Concept Guide & Diagnostics for Deep Learning Engineers
              </p>
            </div>
          </div>

          {/* Quick Stats checklist summary */}
          <div className="flex gap-4 text-xs font-mono bg-[#EFEDE4] border border-[#D5D3C7] rounded-xl px-4 py-2 text-[#55534C] shadow-inner">
            <div className="text-center border-r border-[#D5D3C7] pr-4">
              <span className="block text-[#706F63] text-[10px] uppercase font-bold">VRAM Saving</span>
              <span className="text-[#3E6335] font-bold text-xs uppercase">LoRA Enabled (~99% saved)</span>
            </div>
            <div className="text-center border-r border-[#D5D3C7] pr-4">
              <span className="block text-[#706F63] text-[10px] uppercase font-bold">Diagnostics Work</span>
              <span className="text-[#4D5A2E] font-bold text-xs">
                {completedCount} / {quizQuestions.length} Done
              </span>
            </div>
            <div className="text-center">
              <span className="block text-[#706F63] text-[10px] uppercase font-bold">Lab Engine</span>
              <span className="text-[#33332D] font-bold text-xs font-mono">PyTorch 2++ Ready</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Bar Dashboard */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1.5 overflow-x-auto py-2 no-scrollbar border-t border-[#E5E3D8] select-none">
            {[
              { id: 'debugger', name: 'Training IDE Log Debugger', icon: Monitor, color: 'text-[#8A9A5B]' },
              { id: 'lora', name: 'Ex 1: LoRA Path Math', icon: Layers, color: 'text-[#8A9A5B]' },
              { id: 'clipping', name: 'Ex 2: Gradient Clipping', icon: ShieldAlert, color: 'text-[#D9A34A]' },
              { id: 'precision', name: 'Ex 3: Dual Precision', icon: Binary, color: 'text-[#8A9A5B]' },
              { id: 'scheduler', name: 'Ex 4: Cosine Scheduler', icon: Gauge, color: 'text-[#8A9A5B]' },
              { id: 'split', name: 'Ex 5: Train / Val Split', icon: Columns, color: 'text-[#D9A34A]' },
              { id: 'diagnostic', name: 'Interactive Quiz Diagnostic', icon: HelpCircle, color: 'text-[#8A9A5B]' },
              { id: 'architecture', name: 'BP: Production Blueprint', icon: Info, color: 'text-[#8A9A5B]' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-button-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#33332D] text-[#FAF9F6] shadow-sm'
                      : 'bg-[#FAF9F6] hover:bg-[#F2F1EA] border border-[#E5E3D8] text-[#55534C] hover:text-[#33332D]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {activeTab === 'debugger' && <PipelineDebugger />}
            {activeTab === 'lora' && <LoraTraceView />}
            {activeTab === 'clipping' && <GradClipView />}
            {activeTab === 'precision' && <MixedPrecisionView />}
            {activeTab === 'scheduler' && <SchedulerView />}
            {activeTab === 'split' && <DatasetSplitView />}
            {activeTab === 'architecture' && <ProductionArchitectureView />}

            {/* Diagnostic workbook Workspace view */}
            {activeTab === 'diagnostic' && (
              <div className="space-y-6">
                <div className="bg-[#FAF6EE] border-l-4 border-[#8A9A5B] p-4 rounded-r-lg flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#8A9A5B]" />
                      Pipeline Diagnostics Workbook
                    </h3>
                    <p className="text-sm text-[#706F63] mt-1">
                      Check your functional understanding of deep transformer training sequences, formats, and parameter mappings!
                    </p>
                  </div>
                  {completedCount === quizQuestions.length && (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="bg-[#EAF2E8] text-[#3E6335] px-4 py-2 border border-[#B2D8A6] rounded-xl flex items-center gap-2 text-xs font-bold"
                    >
                      <Award className="w-5 h-5 text-[#3E6335] font-bold" />
                      Score: {correctCount} / {quizQuestions.length} Perfect!
                    </motion.div>
                  )}
                </div>

                <div className="space-y-6">
                  {quizQuestions.map((q, qIdx) => {
                    const selIdx = quizAnswers[q.id];
                    const hasAnswered = selIdx !== undefined;

                    return (
                      <div
                        key={q.id}
                        id={`diagnostic-question-card-${q.id}`}
                        className="bg-[#FAF9F6] rounded-xl p-5 border border-[#E5E3D8] shadow-sm space-y-4"
                      >
                        <div className="flex justify-between items-center border-b border-[#E5E3D8] pb-2">
                          <span className="text-[10px] font-mono text-[#3E6335] bg-[#EAF2E8] border border-[#B2D8A6] px-2 py-0.5 rounded-md uppercase font-bold">
                            {q.concept}
                          </span>
                          <span className="text-xs text-[#706F63] font-mono">Question {qIdx + 1}</span>
                        </div>

                        <h4 className="font-serif font-bold text-[#33332D] leading-relaxed text-[15px]">
                          {q.question}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {q.options.map((option, oIdx) => {
                            const isSelected = selIdx === oIdx;
                            const isCorrectAnswer = q.correctIdx === oIdx;
                            let btnStyle = 'border-[#E5E3D8] bg-[#FAF9F6] hover:bg-[#F2F1EA] text-[#55534C]';

                            if (hasAnswered) {
                              if (isSelected) {
                                btnStyle = isCorrectAnswer
                                  ? 'border-[#8A9A5B] bg-[#EAF2E8] text-[#3E6335] font-bold'
                                  : 'border-[#D9A34A] bg-[#FDF1D8] text-[#8B6424]';
                              } else if (isCorrectAnswer) {
                                btnStyle = 'border-[#B2D8A6] bg-[#EAF2E8]/40 text-[#3E6335]';
                              } else {
                                btnStyle = 'border-[#E5E3D8] bg-[#FAF9F6]/50 text-[#706F63] opacity-60';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                id={`quiz-q-${q.id}-opt-${oIdx}`}
                                onClick={() => !hasAnswered && handleSelectOption(q.id, oIdx)}
                                disabled={hasAnswered}
                                className={`text-left p-3.5 rounded-lg border text-xs leading-relaxed transition-all cursor-pointer ${btnStyle}`}
                              >
                                <div className="flex gap-2">
                                  <span className="font-mono text-[#706F63]/60 shrink-0 font-bold">
                                    {String.fromCharCode(65 + oIdx)}.
                                  </span>
                                  <span>{option}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation block */}
                        {showExplanation[q.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                              selIdx === q.correctIdx
                                ? 'bg-[#EAF2E8]/60 border-[#B2D8A6] text-[#3E6335]'
                                : 'bg-[#FDF1D8]/40 border-[#D9A34A] text-[#8B6424]'
                            }`}
                          >
                            <span className="font-bold flex items-center gap-1 uppercase text-[10px] mb-1">
                              {selIdx === q.correctIdx ? (
                                <span className="text-[#3E6335]">✔ Correct!</span>
                              ) : (
                                <span className="text-[#8B6424]">✘ Incorrect</span>
                              )}
                              - Concept Clarification
                            </span>
                            <p>{q.explanation}</p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Humble Footer section */}
      <footer className="bg-[#FAF9F6] border-t border-[#E5E3D8] py-6 mt-12 w-full text-center">
        <p className="text-xs text-[#706F63] font-mono">
          Visual companion applet for understanding LoRA, FP16, Gradient updates, and Loss Schedulers. Crafted in React 19 & Tailwind v4.
        </p>
      </footer>
    </div>
  );
}
