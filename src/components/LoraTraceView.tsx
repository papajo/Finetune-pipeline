import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Settings, HelpCircle, Binary, RefreshCw, Sparkles, CheckCircle } from 'lucide-react';
import { LoraConfig } from '../types';

export default function LoraTraceView() {
  const [config, setConfig] = useState<LoraConfig>({
    r: 8,
    alpha: 16,
    targetModules: ['q_proj', 'v_proj'],
    dropout: 0.1,
    learningRate: 3e-4,
  });

  const [inputVector, setInputVector] = useState<number[]>([1.2, -0.5, 0.8, 1.5]);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [0.15, -0.22, 0.31, 0.05],
    [-0.10, 0.45, -0.05, 0.18],
  ]); // r x d_in (2 x 4)
  const [matrixB, setMatrixB] = useState<number[][]>([
    [0.25, -0.15],
    [-0.08, 0.32],
    [0.40, 0.12],
    [-0.18, 0.50],
  ]); // d_out x r (4 x 2)

  const [frozenBaseWeights, setFrozenBaseWeights] = useState<number[][]>([
    [0.8, -0.2, 0.5, 0.1],
    [-0.3, 0.6, -0.1, 0.4],
    [0.2, -0.4, 0.9, -0.2],
    [0.1, 0.3, -0.5, 0.7],
  ]); // d_out x d_in (4 x 4)

  const handleRandomizeWeights = () => {
    // Generate new random matrices matching current rank rank mapping
    const newA: number[][] = [];
    for (let i = 0; i < Math.min(config.r, 4); i++) {
      const row: number[] = [];
      for (let j = 0; j < 4; j++) {
        row.push(parseFloat((Math.random() * 0.8 - 0.4).toFixed(2)));
      }
      newA.push(row);
    }

    const newB: number[][] = [];
    for (let i = 0; i < 4; i++) {
      const row: number[] = [];
      for (let j = 0; j < Math.min(config.r, 4); j++) {
        row.push(parseFloat((Math.random() * 0.8 - 0.4).toFixed(2)));
      }
      newB.push(row);
    }

    setMatrixA(newA);
    setMatrixB(newB);
  };

  // Perform full math step of: h = W_0 @ x + (alpha/r) * (B @ (A @ x))
  // Step 1: Base output = W_0 @ x
  const baseOutput = frozenBaseWeights.map(row => 
    row.reduce((sum, val, idx) => sum + val * inputVector[idx], 0)
  );

  // Pad A & B matrix outputs if rank differs
  const rankUsed = Math.min(config.r, 4);
  const trimmedA = matrixA.slice(0, rankUsed).map(row => row.slice(0, 4));
  const trimmedB = matrixB.map(row => row.slice(0, rankUsed));

  // Step 2: intermediate bottleneck = A @ x
  const adapterBottleneck = trimmedA.map(row =>
    row.reduce((sum, val, idx) => sum + val * inputVector[idx], 0)
  );

  // Step 3: reconstructed offset = B @ bottleneck
  const adapterOutputRaw = trimmedB.map(row =>
    row.reduce((sum, val, idx) => sum + val * adapterBottleneck[idx], 0)
  );

  // Step 4: Scale factor = alpha / r
  const scalingFactor = config.alpha / config.r;
  const scaledAdapterOutput = adapterOutputRaw.map(v => v * scalingFactor);

  // Step 5: Final output h = base + scaledAdapter
  const finalOutput = baseOutput.map((val, idx) => val + scaledAdapterOutput[idx]);

  // Parameters Count Estimator for full LLM (e.g. GPT-2 124M params)
  const d_model = 768;
  const numLayers = 12;
  const baseAttentionParams = d_model * d_model * 4 * numLayers; // qkv + projection
  const loraActiveParams = d_model * config.r * 2 * config.targetModules.length * numLayers;
  const totalModelParams = 124439808; // GPT-2 Base
  const trainablePercentage = (loraActiveParams / totalModelParams) * 100;

  return (
    <div id="lora-trace-view" className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#8A9A5B] p-4 rounded-r-lg">
        <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#8A9A5B]" />
          Exercise 1: Tracing the LoRA Forward Path
        </h3>
        <p className="text-sm text-[#706F63] mt-1 leading-relaxed">
          Low-Rank Adaptation freezes the base model credentials (<code className="bg-[#EFEDE4] px-1 rounded font-mono text-xs">A @ B</code> is trainable). 
          Instead of adjusting the dense parameters <code className="bg-[#EFEDE4] px-1 rounded font-mono text-xs text-[#3E6335]">W₀</code>, we learn a minute delta deviation matrix, heavily reducing optimizer memory burdens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Controls & Parameter Calculations */}
        <div className="lg:col-span-5 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-6">
          <h4 className="font-serif font-bold text-[#33332D] flex items-center gap-2 border-b border-[#E5E3D8] pb-2">
            <Settings className="w-4 h-4 text-[#706F63]" />
            LoRA Parameters Editor
          </h4>

          {/* Rank Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#55534C]">LoRA Rank (r)</span>
              <span className="font-mono bg-[#EFEDE4] px-2 py-0.5 rounded text-[#3E6335] font-bold">r = {config.r}</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={config.r}
              onChange={(e) => {
                const newR = parseInt(e.target.value);
                setConfig({ ...config, r: newR });
                // Regenerate matrices matching rank constraints
                const newA: number[][] = [];
                for (let i = 0; i < Math.min(newR, 4); i++) {
                  newA.push(Array.from({ length: 4 }, () => parseFloat((Math.random() * 0.8 - 0.4).toFixed(2))));
                }
                const newB: number[][] = [];
                for (let i = 0; i < 4; i++) {
                  newB.push(Array.from({ length: Math.min(newR, 4) }, () => parseFloat((Math.random() * 0.8 - 0.4).toFixed(2))));
                }
                setMatrixA(newA);
                setMatrixB(newB);
              }}
              className="w-full accent-[#8A9A5B]"
            />
            <p className="text-[11px] text-[#706F63]">Controls target matrix slice height. Lower rank = fewer parameters.</p>
          </div>

          {/* Alpha Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#55534C]">Scaling Alpha (α)</span>
              <span className="font-mono bg-[#EFEDE4] px-2 py-0.5 rounded text-[#3E6335] font-bold">α = {config.alpha}</span>
            </div>
            <input
              type="range"
              min="1"
              max="64"
              step="1"
              value={config.alpha}
              onChange={(e) => setConfig({ ...config, alpha: parseInt(e.target.value) })}
              className="w-full accent-[#8A9A5B]"
            />
            <p className="text-[11px] text-[#706F63]">Scaling hyperparameter. Multiplier factor is calculated as <code className="font-mono bg-[#EFEDE4] px-1 py-0.2 rounded">α / r = {(config.alpha / config.r).toFixed(2)}</code>.</p>
          </div>

          {/* Target Modules Config */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#55534C] block">Target Modules (Where LoRA is applied)</span>
            <div className="flex gap-2">
              {['q_proj', 'k_proj', 'v_proj', 'o_proj'].map((moduleName) => {
                const isActive = config.targetModules.includes(moduleName);
                return (
                  <button
                    key={moduleName}
                    id={`btn-target-module-${moduleName}`}
                    onClick={() => {
                      const newTargets = isActive
                        ? config.targetModules.filter(m => m !== moduleName)
                        : [...config.targetModules, moduleName];
                      setConfig({ ...config, targetModules: newTargets });
                    }}
                    className={`flex-1 py-1.5 px-2 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#EAF2E8] border-[#B2D8A6] text-[#3E6335] font-bold'
                        : 'bg-[#FAF8F3] border-[#E5E3D8] text-[#706F63] hover:bg-[#F2F1EA]'
                    }`}
                  >
                    {moduleName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trainable Parameters comparison */}
          <div className="bg-[#FAF8F3] p-4 rounded-lg border border-[#E5E3D8] space-y-3">
            <div className="text-xs font-bold text-[#33332D] flex items-center gap-1">
              <Binary className="w-4 h-4 text-[#8A9A5B]" />
              Weight Parameter Math (GPT-2 Estimate)
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#706F63]">Total Pre-trained Weights:</span>
                <span className="font-mono text-[#33332D] font-semibold">{totalModelParams.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#706F63]">Trainable LoRA Adapter Weights:</span>
                <span className="font-mono text-[#3E6335] font-bold">{loraActiveParams.toLocaleString()}</span>
              </div>
              <div className="mt-2 text-xs">
                <div className="flex justify-between text-[#55534C] font-semibold mb-1">
                  <span>% of Parameters Active for training:</span>
                  <span className="text-[#3E6335] font-mono">{trainablePercentage.toFixed(4)} %</span>
                </div>
                <div className="w-full bg-[#EFEDE4] h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-[#8A9A5B] h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(trainablePercentage * 50, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[10px] text-[#706F63] italic mt-1.5">
                  The GPU stores optimizer states only for these custom trainable layers. Huge VRAM savings!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Flow and Matrix Interactive Math Visualization */}
        <div className="lg:col-span-7 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E3D8] pb-2">
            <h4 className="font-serif font-bold text-[#33332D] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#8A9A5B]" />
              Interactive Matrix Pipeline Visualization
            </h4>
            <button
              id="btn-randomize-lora-weights"
              onClick={handleRandomizeWeights}
              className="flex items-center gap-1.5 text-xs text-[#55534C] hover:text-[#33332D] font-medium bg-[#EFEDE4] py-1 px-2.5 rounded-lg border border-[#D5D3C7] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Randomize Adapters
            </button>
          </div>

          {/* Interactive mathematical expression */}
          <div className="bg-[#FDF1D8] border border-[#D9A34A] p-2 text-center rounded-lg font-mono text-[11px] text-[#8B6424]">
            <span>h = W₀x + (α / r) · (B × A)x</span>
            <span className="mx-2 text-[#D9A34A]">|</span>
            <span className="text-[#3E6335] font-bold">( {config.alpha} / {config.r} ) · (B × A)x</span>
          </div>

          <div className="space-y-4">
            {/* Input Vector Edit */}
            <div className="p-3 bg-[#FAF8F3] border border-[#E5E3D8] rounded-lg">
              <span className="text-xs font-semibold text-[#706F63] block mb-2">Input Vector x (d_model = 4)</span>
              <div className="flex gap-2">
                {inputVector.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col gap-1 text-center">
                    <input
                      type="number"
                      step="0.1"
                      value={val}
                      id={`input-vector-val-${idx}`}
                      onChange={(e) => {
                        const next = [...inputVector];
                        next[idx] = parseFloat(e.target.value) || 0;
                        setInputVector(next);
                      }}
                      className="w-full text-center py-1 bg-white border border-[#E5E3D8] rounded text-xs font-mono font-bold text-[#33332D]"
                    />
                    <span className="text-[10px] text-[#706F63] font-mono">x[{idx}]</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Path Split Block & Visual Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Frozen base block */}
              <div className="border border-[#E5E3D8] bg-[#EFEDE4]/20 rounded-lg p-3 space-y-2">
                <span className="text-xs font-bold text-[#706F63] uppercase flex items-center justify-between">
                  <span>W₀ (Frozen Base Weight)</span>
                  <span className="text-[10px] bg-[#EFEDE4] px-1.5 py-0.5 rounded text-[#55534C] font-semibold">Frozen</span>
                </span>
                <div className="text-[10px] bg-white p-2 rounded border border-[#E5E3D8] font-mono text-[#706F63] grid gap-1">
                  {frozenBaseWeights.map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-between">
                      {row.map((val, cIdx) => (
                        <span key={cIdx} className="w-8 text-center">{val.toFixed(1)}</span>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="text-xs bg-white p-2 rounded border border-[#E5E3D8]">
                  <div className="text-[#706F63] font-mono text-[10px]">W₀ @ x :</div>
                  <div className="font-mono text-[#33332D] font-bold mt-1 text-xs">
                    [{baseOutput.map(v => v.toFixed(2)).join(', ')}]
                  </div>
                </div>
              </div>

              {/* Right Column: Active Adapter Flow */}
              <div className="border border-[#B2D8A6] rounded-lg p-3 space-y-2 bg-[#EAF2E8]/20">
                <span className="text-xs font-bold text-[#3E6335] uppercase flex items-center justify-between">
                  <span>Adapter (Trainable B @ A)</span>
                  <span className="text-[10px] bg-[#EAF2E8] px-1.5 py-0.5 rounded text-[#3E6335] font-bold">Trainable</span>
                </span>

                {/* Matrix A representation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#3E6335] font-bold uppercase">
                    <span>Matrix A (Down project)</span>
                    <span className="font-mono">{rankUsed} × 4</span>
                  </div>
                  <div className="text-[10px] bg-white p-1.5 rounded border border-[#B2D8A6] font-mono text-[#3E6335] grid gap-0.5">
                    {trimmedA.map((row, rIdx) => (
                      <div key={rIdx} className="flex justify-around">
                        {row.map((val, cIdx) => (
                          <span key={cIdx} className="w-12 text-center">{val.toFixed(2)}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Matrix B representation */}
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-[10px] text-[#3E6335] font-bold uppercase">
                    <span>Matrix B (Up projection)</span>
                    <span className="font-mono">4 × {rankUsed}</span>
                  </div>
                  <div className="text-[10px] bg-white p-1.5 rounded border border-[#B2D8A6] font-mono text-[#3E6335] grid gap-0.5 animate-pulse-slow">
                    {trimmedB.map((row, rIdx) => (
                      <div key={rIdx} className="flex justify-around">
                        {row.map((val, cIdx) => (
                          <span key={cIdx} className="w-12 text-center">{val.toFixed(2)}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs bg-white p-2 rounded border border-[#B2D8A6] space-y-1">
                  <div className="text-[#3E6335] text-[10px] font-mono">Bottleneck Space (A @ x):</div>
                  <div className="font-mono font-bold text-[#3E6335]">[{adapterBottleneck.map(v => v.toFixed(2)).join(', ')}]</div>
                  <div className="text-[#706F63] text-[10px] font-mono mt-1">B @ bottleneck × Scaler ({scalingFactor.toFixed(1)}):</div>
                  <div className="font-mono font-bold text-[#33332D]">[{scaledAdapterOutput.map(v => v.toFixed(2)).join(', ')}]</div>
                </div>
              </div>
            </div>

            {/* Summation of outputs */}
            <div className="bg-[#33332D] text-[#FAF9F6] rounded-lg p-4 shadow-sm mt-4 relative overflow-hidden">
              <div className="absolute right-3 top-3 opacity-10">
                <CheckCircle className="w-16 h-16 text-[#8A9A5B]" />
              </div>
              <span className="text-xs text-[#8A9A5B] font-mono font-bold block mb-1">FINAL ATTENTION MODULE OUTPUT (h)</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono bg-[#1C1C1A] px-2 py-1 rounded text-xs text-[#FAF9F6]/80">W₀x</span>
                <span className="text-[#706F63] text-lg">+</span>
                <span className="font-mono bg-[#1C1C1A] px-2 py-1 rounded border border-[#33332D] text-xs text-[#8A9A5B]">ΔWx</span>
                <span className="text-[#706F63] text-lg">=</span>
                <span className="font-mono bg-[#FAF9F6] px-3 py-1.5 rounded text-sm text-[#3E6335] font-bold border border-[#B2D8A6]">
                  [{finalOutput.map(v => v.toFixed(2)).join(', ')}]
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
