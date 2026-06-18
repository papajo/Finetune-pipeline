import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Gauge, Sparkles, AlertCircle, Info } from 'lucide-react';

export default function SchedulerView() {
  const [lrType, setLrType] = useState<'linear' | 'cosine'>('cosine');
  const [baseLr, setBaseLr] = useState<number>(3e-4);
  const [minLrRatio, setMinLrRatio] = useState<number>(0.1); // min is 10% of base lr
  const [warmupPercent, setWarmupPercent] = useState<number>(15); // 15% warmup
  const [totalSteps, setTotalSteps] = useState<number>(100);
  const [currentStep, setCurrentStep] = useState<number>(30);

  // Math calculated learning rate for any step
  const getLrAtStep = (step: number): number => {
    const warmupSteps = Math.floor((warmupPercent / 100) * totalSteps);
    
    // 1) Warmup Phase
    if (step < warmupSteps && warmupSteps > 0) {
      return (step / warmupSteps) * baseLr;
    }

    const postWarmupSteps = totalSteps - warmupSteps;
    const currentPostStep = step - warmupSteps;

    if (currentPostStep < 0) return baseLr;

    // 2) Decay Phase
    const minLr = baseLr * minLrRatio;

    if (lrType === 'linear') {
      const ratio = currentPostStep / Math.max(postWarmupSteps, 1);
      return baseLr - ratio * (baseLr - minLr);
    } else {
      // Cosine training decay math
      const progress = currentPostStep / Math.max(postWarmupSteps, 1);
      const cosProgress = (Math.cos(progress * Math.PI) + 1) / 2;
      return minLr + (baseLr - minLr) * cosProgress;
    }
  };

  const activeLr = getLrAtStep(currentStep);

  // Generate SVG coordinates for plotting the entire curve
  const svgWidth = 400;
  const svgHeight = 150;
  const padding = 20;

  const points: Array<{ x: number; y: number; step: number; lr: number }> = [];
  for (let s = 0; s <= totalSteps; s++) {
    const lr = getLrAtStep(s);
    const x = padding + (s / totalSteps) * (svgWidth - 2 * padding);
    
    // Invert Y coordinates so maximum values map to top of SVG workspace
    const yMax = svgHeight - padding;
    const yMin = padding;
    const ratio = lr / baseLr;
    const y = yMax - ratio * (yMax - yMin);
    
    points.push({ x, y, step: s, lr });
  }

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // Get SVG coordinate for interactive scrubbing slider
  const scrubberRatio = currentStep / totalSteps;
  const scrubberX = padding + scrubberRatio * (svgWidth - 2 * padding);
  const scrubberY = points.find(p => p.step === currentStep)?.y || padding;

  return (
    <div id="scheduler-view" className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#8A9A5B] p-4 rounded-r-lg">
        <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
          <Gauge className="w-5 h-5 text-[#8A9A5B]" />
          Exercise 4: Learning Rate Scheduling (Cosine vs. Linear)
        </h3>
        <p className="text-sm text-[#706F63] mt-1 leading-relaxed">
          The step scheduler matches optimizer updates to training dynamics. 
          <strong> Warmup</strong> allows weights to stabilize during initially large gradients. 
          <strong> Cosine Decay</strong> curves smoothly toward a minimal learning floor to complete fine detailed parameter mappings at the terminal epochs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LR parameters controls */}
        <div className="lg:col-span-5 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-5">
          <h4 className="font-serif font-bold text-[#33332D] flex items-center gap-2 border-b border-[#E5E3D8] pb-2">
            <span>Scheduler Settings</span>
          </h4>

          {/* Selector for LR schedule pattern */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#55534C] block">LR Decay Strategy</span>
            <div className="flex gap-2">
              <button
                id="btn-schedule-linear"
                onClick={() => setLrType('linear')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold border transition-all cursor-pointer ${
                  lrType === 'linear'
                    ? 'bg-[#EAF2E8] border-[#8A9A5B] text-[#3E6335] font-bold'
                    : 'bg-[#FAF8F3] border-[#E5E3D8] text-[#706F63]/80 hover:bg-[#EFEDE4] hover:text-[#33332D]'
                }`}
              >
                Linear Decay
              </button>
              <button
                id="btn-schedule-cosine"
                onClick={() => setLrType('cosine')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold border transition-all cursor-pointer ${
                  lrType === 'cosine'
                    ? 'bg-[#EAF2E8] border-[#8A9A5B] text-[#3E6335] font-bold'
                    : 'bg-[#FAF8F3] border-[#E5E3D8] text-[#706F63]/80 hover:bg-[#EFEDE4] hover:text-[#33332D]'
                }`}
              >
                Cosine Annealing
              </button>
            </div>
          </div>

          {/* Peak Learning Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#55534C]">Peak Learning Rate</span>
              <span className="font-mono bg-[#EFEDE4] px-2 py-0.5 rounded text-[#3E6335] font-semibold text-xs">
                {baseLr.toExponential(2)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                id="btn-base-lr-low"
                onClick={() => setBaseLr(5e-5)}
                className={`flex-1 py-1 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                  baseLr === 5e-5 ? 'bg-[#EAF2E8] border-[#8A9A5B] text-[#3E6335] font-bold' : 'bg-[#FAF8F3] border-[#E5E3D8] text-[#706F63] hover:bg-[#EFEDE4]'
                }`}
              >
                5e-5
              </button>
              <button
                id="btn-base-lr-mid"
                onClick={() => setBaseLr(1e-4)}
                className={`flex-1 py-1 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                  baseLr === 1e-4 ? 'bg-[#EAF2E8] border-[#8A9A5B] text-[#3E6335] font-bold' : 'bg-[#FAF8F3] border-[#E5E3D8] text-[#706F63] hover:bg-[#EFEDE4]'
                }`}
              >
                1e-4
              </button>
              <button
                id="btn-base-lr-high"
                onClick={() => setBaseLr(3e-4)}
                className={`flex-1 py-1 rounded text-[10px] font-mono border cursor-pointer transition-all ${
                  baseLr === 3e-4 ? 'bg-[#EAF2E8] border-[#8A9A5B] text-[#3E6335] font-bold' : 'bg-[#FAF8F3] border-[#E5E3D8] text-[#706F63] hover:bg-[#EFEDE4]'
                }`}
              >
                3e-4
              </button>
            </div>
          </div>

          {/* Minimum Learning Rate Floor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#55534C]">Min LR Ratio</span>
              <span className="font-mono bg-[#EFEDE4] px-2 font-bold text-[#33332D] rounded text-xs">
                {minLrRatio * 100}% of Peak
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.05"
              value={minLrRatio}
              onChange={(e) => setMinLrRatio(parseFloat(e.target.value))}
              className="w-full accent-[#8A9A5B]"
            />
            <p className="text-[11px] text-[#706F63]">
              Terminal learning rate won't decay past <code className="font-mono text-[#3E6335]">{(baseLr * minLrRatio).toExponential(2)}</code>.
            </p>
          </div>

          {/* Warmup slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#55534C]">Warmup Steps Percentage</span>
              <span className="font-mono bg-[#EFEDE4] px-2 font-bold text-[#33332D] rounded text-xs">
                {warmupPercent}% steps
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={warmupPercent}
              onChange={(e) => setWarmupPercent(parseInt(e.target.value))}
              className="w-full accent-[#8A9A5B]"
            />
            <p className="text-[11px] text-[#706F63]">
              Initial linear warmup epochs to stabilize deep transformers.
            </p>
          </div>
        </div>

        {/* Real-time plotting graph */}
        <div className="lg:col-span-7 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E3D8] pb-2">
            <h4 className="font-serif font-bold text-[#33332D] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#8A9A5B] animate-pulse-slow" />
              Dynamic Timeline Plot
            </h4>
            <span className="text-xs font-mono text-[#3E6335] font-bold bg-[#EAF2E8] px-2 py-0.5 rounded border border-[#E5E3D8]">
              LR at scrubber = {activeLr.toExponential(4)}
            </span>
          </div>

          {/* SVG Plot space container */}
          <div className="p-3 bg-[#FAF8F3] border border-[#E5E3D8] rounded-lg flex flex-col items-center justify-center">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full max-w-lg mb-2"
              style={{ overflow: 'visible' }}
            >
              {/* Plot Background Grid lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#E5E3D8" />
              <line x1={padding} y1={(svgHeight) / 2} x2={svgWidth - padding} y2={(svgHeight) / 2} stroke="#E5E3D8" />
              <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#D5D3C7" />

              {/* Dotted border indicators */}
              <line
                x1={padding + (warmupPercent / 100) * (svgWidth - 2 * padding)}
                y1={padding}
                x2={padding + (warmupPercent / 100) * (svgWidth - 2 * padding)}
                y2={svgHeight - padding}
                stroke="#8A9A5B"
                strokeWidth="1.2"
                strokeDasharray="2,2"
              />

              {/* Path of schedule curve */}
              <path
                d={pathD}
                fill="none"
                stroke={lrType === 'cosine' ? '#8A9A5B' : '#B58021'}
                strokeWidth="3"
                className="transition-all duration-300"
              />

              {/* Label strings for plot axes */}
              <text x={padding} y={svgHeight - 4} fontSize="8" fill="#706F63" fontFamily="monospace">
                Step 0
              </text>
              <text x={svgWidth - padding - 35} y={svgHeight - 4} fontSize="8" fill="#706F63" fontFamily="monospace">
                Step {totalSteps}
              </text>
              <text x={padding - 10} y={padding + 8} fontSize="7" fill="#706F63" fontFamily="monospace" transform={`rotate(-90, ${padding - 10}, ${padding + 8})`}>
                LR
              </text>

              {warmupPercent > 0 && (
                <text
                  x={padding + (warmupPercent / 100) * (svgWidth - 2 * padding) - 30}
                  y={padding + 12}
                  fontSize="7"
                  className="font-semibold text-[#3E6335]"
                  fill="#3E6335"
                  fontFamily="sans-serif"
                >
                  Warmup end
                </text>
              )}

              {/* Interactive scrubber cursor vertical line */}
              <line
                x1={scrubberX}
                y1={padding}
                x2={scrubberX}
                y2={svgHeight - padding}
                stroke="#D9A34A"
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
              <circle
                cx={scrubberX}
                cy={scrubberY}
                r="5"
                fill="#D9A34A"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </svg>

            {/* Steps Scrubber timeline control */}
            <div className="w-full max-w-lg mt-2 space-y-2">
              <div className="flex justify-between text-[11px] font-mono text-[#706F63]">
                <span>Timeline Scrubber cursor</span>
                <span className="font-bold underline text-[#3E6335]">Epoch step: {currentStep}</span>
              </div>
              <input
                type="range"
                min="0"
                max={totalSteps}
                step="1"
                value={currentStep}
                onChange={(e) => setCurrentStep(parseInt(e.target.value))}
                className="w-full accent-[#8A9A5B]"
              />
            </div>
          </div>

          {/* Explanation segments cards */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#55534C] block">Current Step Status Explainer</span>
            <div className="p-3 bg-[#FAF6EE] border border-[#E5E3D8] rounded-lg text-xs leading-relaxed space-y-1">
              {currentStep < Math.floor((warmupPercent / 100) * totalSteps) ? (
                <div>
                  <span className="font-bold text-[#3E6335] block mb-0.5">🚀 WARMUP PHASE (Step {currentStep})</span>
                  Learning rate is scaling up linearly. This provides a gradual "soft landing" for model training states right after loading weights, ensuring sudden large offsets do not cause embedding explosion inside the Multi-Head attention elements.
                </div>
              ) : currentStep === totalSteps ? (
                <div>
                  <span className="font-bold text-[#33332D] block mb-0.5">🏁 COLD CONVERGENCE (Step {currentStep})</span>
                  Learning rate has decayed to the configuration floor (<code className="font-mono bg-[#EFEDE4]">{(baseLr * minLrRatio).toExponential(1)}</code>). Small learning rates at the end of training keep model updates concentrated on micro details without disrupting larger, already coherent parameter features.
                </div>
              ) : (
                <div>
                  <span className="font-bold text-[#8B6424] block mb-0.5">📉 DECAY ZONE (Step {currentStep})</span>
                  Learning rate is decaying along a {lrType === 'cosine' ? 'smooth Cosine curve' : 'straight line trajectory'}. This helps gradient descents map forward gracefully to find stable valley minimums without bouncing out parameters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
