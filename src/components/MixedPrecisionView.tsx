import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Binary, HelpCircle, Check, AlertTriangle, Play, Shuffle, HelpCircleIcon } from 'lucide-react';

export default function MixedPrecisionView() {
  const [testValue, setTestValue] = useState<number>(0.00004); // near FP16 threshold (2^-14 ~ 0.00006)
  const [scaleFactor, setScaleFactor] = useState<number>(1024);

  // Sorting game state for FP16 order of operations
  const correctOrder = [
    'Wrap forward pass in autocast context manager',
    'Scale loss to prevent underflow: scaler.scale(loss).backward()',
    'Unscale gradients before clipping: scaler.unscale_(optimizer)',
    'Clip unscaled gradient norm checks: torch.nn.utils.clip_grad_norm_()',
    'Step weights through scaled optimizer: scaler.step(optimizer)',
    'Trigger scaler update check: scaler.update()',
  ];

  const [choices, setChoices] = useState<string[]>([
    'Clip unscaled gradient norm checks: torch.nn.utils.clip_grad_norm_()',
    'Wrap forward pass in autocast context manager',
    'Scale loss to prevent underflow: scaler.scale(loss).backward()',
    'Trigger scaler update check: scaler.update()',
    'Step weights through scaled optimizer: scaler.step(optimizer)',
    'Unscale gradients before clipping: scaler.unscale_(optimizer)',
  ]);

  const [gameResult, setGameResult] = useState<'idle' | 'success' | 'fail'>('idle');

  const checkGameOrder = () => {
    let matches = true;
    for (let i = 0; i < correctOrder.length; i++) {
      if (choices[i] !== correctOrder[i]) {
        matches = false;
        break;
      }
    }
    setGameResult(matches ? 'success' : 'fail');
  };

  const handleResetGame = () => {
    setChoices([
      'Clip unscaled gradient norm checks: torch.nn.utils.clip_grad_norm_()',
      'Wrap forward pass in autocast context manager',
      'Scale loss to prevent underflow: scaler.scale(loss).backward()',
      'Trigger scaler update check: scaler.update()',
      'Step weights through scaled optimizer: scaler.step(optimizer)',
      'Unscale gradients before clipping: scaler.unscale_(optimizer)',
    ]);
    setGameResult('idle');
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= choices.length) return;
    const updated = [...choices];
    const temp = updated[index];
    updated[index] = updated[nextIdx];
    updated[nextIdx] = temp;
    setChoices(updated);
    if (gameResult !== 'idle') {
      setGameResult('idle');
    }
  };

  // Convert number to representability indicators
  // FP16 minimum normal is 6.1 * 10^-5 (0.00006)
  // Subnormals can go down to 2^-24 but trigger catastrophic precision loss (6 * 10^-8)
  const isFP16Representable = testValue >= 0.000061;
  const isAfterScalingRepresentable = (testValue * scaleFactor) >= 0.000061;

  return (
    <div id="mixed-precision-view" className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#8A9A5B] p-4 rounded-r-lg">
        <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
          <Binary className="w-5 h-5 text-[#8A9A5B]" />
          Exercise 3: Mixed Precision (FP16 vs. BF16) & Loss Scaling
        </h3>
        <p className="text-sm text-[#706F63] mt-1 leading-relaxed">
          Mixed precision training speeds up GPU processes. BFloat16 shares the dynamic range of Float32, making underflow rare. 
          Standard FP16 underflows quickly, requiring a <code className="bg-[#EFEDE4] px-1 rounded font-mono text-xs text-[#3E6335]">GradScaler</code> 
          to scale the loss, compute backward gradients, unscale, clip, and step.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Floating Point & Underflow Simulator */}
        <div className="lg:col-span-6 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-6">
          <h4 className="font-serif font-bold text-[#33332D] flex items-center gap-2 border-b border-[#E5E3D8] pb-2">
            <span>Precision & Underflow Simulator</span>
          </h4>

          {/* Value slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-transparent">
              <span className="text-xs font-semibold text-[#55534C]">Simulated Raw Gradient Value</span>
              <span className="font-mono text-[#33332D] bg-[#EFEDE4] px-2 py-0.5 rounded text-xs font-bold">
                {testValue.toFixed(6)}
              </span>
            </div>
            <input
              type="range"
              min="0.000001"
              max="0.001"
              step="0.000005"
              value={testValue}
              onChange={(e) => setTestValue(parseFloat(e.target.value))}
              className="w-full accent-[#8A9A5B]"
            />
            <p className="text-[11px] text-[#706F63]">
              Slide to simulate a tiny gradient value during the backward pass of a deep LLM network.
            </p>
          </div>

          {/* Loss scale factor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#55534C]">GradScaler Factor</span>
              <span className="font-mono text-[#3E6335] font-bold bg-[#EAF2E8] px-2.5 py-0.5 rounded">
                × {scaleFactor}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="2048"
              step="64"
              value={scaleFactor}
              onChange={(e) => setScaleFactor(parseInt(e.target.value))}
              className="w-full accent-[#8A9A5B]"
            />
            <p className="text-[11px] text-[#706F63]">
              Loss scaling temporarily multiplies small values to make them representable inside the FP16 word representation.
            </p>
          </div>

          {/* Precision Support Grid Card */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#55534C] block">Representation Results</span>

            {/* Float32 Block */}
            <div className="p-3 bg-[#FAF8F3] border border-[#E5E3D8] rounded-lg flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-[#33332D] block">Float32 (Single Precision)</span>
                <span className="text-[10px] text-[#706F63] font-mono">Sign: 1 | Exponent: 8b | Mantissa: 23b</span>
              </div>
              <span className="bg-[#EAF2E8] text-[#3E6335] border border-[#B2D8A6] px-2.5 py-0.5 rounded text-[11px] font-bold font-mono">
                Representable
              </span>
            </div>

            {/* BFloat16 Block (Brain Float) */}
            <div className="p-3 bg-[#FAF8F3] border border-[#E5E3D8] rounded-lg flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-[#33332D] block">BFloat16 (Brain Float 16-bit)</span>
                <span className="text-[10px] text-[#706F63] font-mono">Sign: 1 | Exponent: 8b | Mantissa: 7b</span>
              </div>
              <div className="text-right">
                <span className="bg-[#EAF2E8] text-[#3E6335] border border-[#B2D8A6] px-2.5 py-0.5 rounded text-[11px] font-bold font-mono block">
                  Representable
                </span>
                <span className="text-[9px] text-[#706F63] tracking-tight">Large range, low precision</span>
              </div>
            </div>

            {/* Float16 Block */}
            <div className="p-3 border rounded-lg flex justify-between items-center transition-all bg-[#FAF8F3] border-[#E5E3D8]">
              <div>
                <span className="text-xs font-bold text-[#33332D] block">Float16 (Standard FP16)</span>
                <span className="text-[10px] text-[#706F63] font-mono">Sign: 1 | Exponent: 5b | Mantissa: 10b</span>
              </div>

              <div className="text-right space-y-1">
                {isFP16Representable ? (
                  <span className="bg-[#EAF2E8] border border-[#B2D8A6] text-[#3E6335] px-2 py-0.5 rounded text-[11px] font-bold font-mono">
                    Underflow Safe
                  </span>
                ) : (
                  <div className="space-y-0.5">
                    <span className="bg-[#FDF1D8] border border-[#D9A34A] text-[#8B6424] px-2.5 py-0.5 rounded text-[10px] font-bold font-mono flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3 text-[#D9A34A]" /> Underflows to 0.0 !
                    </span>
                    <span className="text-[9px] text-[#706F63] block font-mono">Value &lt; 0.000061</span>
                  </div>
                )}
              </div>
            </div>

            {/* Float16 + Scaling Combined Block */}
            <div className={`p-4 rounded-lg border flex justify-between items-center transition-all ${
              isAfterScalingRepresentable ? 'bg-[#EAF2E8] border-[#B2D8A6]' : 'bg-[#FDF1D8] border-[#D9A34A]'
            }`}>
              <div>
                <span className="text-xs font-bold text-[#33332D] block">Scaled FP16 (Loss × Scaler)</span>
                <span className="text-[11px] font-mono block mt-0.5 text-[#55534C]">
                  Value inside backward: <span className="font-bold">{(testValue * scaleFactor).toFixed(5)}</span>
                </span>
              </div>
              <div>
                {isAfterScalingRepresentable ? (
                  <span className="bg-white/50 border border-[#B2D8A6] px-2.5 py-1 rounded text-[11px] font-bold font-mono flex items-center gap-1 text-[#3E6335]">
                    <Check className="w-3.5 h-3.5 font-bold" /> Representable!
                  </span>
                ) : (
                  <span className="bg-white/30 border border-[#D9A34A] px-2.5 py-1 rounded text-[10px] font-bold font-mono text-[#8B6424]">
                    Still Underflows
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order of Operations Ordering Game */}
        <div className="lg:col-span-6 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-4">
          <div className="border-b border-[#E5E3D8] pb-2">
            <h4 className="font-serif font-bold text-[#33332D] flex items-center justify-between">
              <span>Sorting Game: FP16 Training Sequence</span>
            </h4>
            <p className="text-xs text-[#706F63] mt-0.5">
              Reorder below steps by moving them up or down. Get the exact correct mathematical pipeline!
            </p>
          </div>

          {/* Card list of tasks to sort */}
          <div className="space-y-2">
            {choices.map((choice, idx) => {
              const numOrder = idx + 1;
              return (
                <div
                  key={choice}
                  className="flex items-center justify-between bg-[#FAF8F3] border border-[#E5E3D8] p-2.5 rounded-lg shadow-sm text-[11px] font-medium text-[#33332D]"
                >
                  <div className="flex items-center gap-1.5 flex-1 pr-2">
                    <span className="w-5 h-5 bg-[#EFEDE4] border border-[#D5D3C7] rounded-full flex items-center justify-center font-mono text-[#33332D] text-[10px] font-bold shrink-0">
                      {numOrder}
                    </span>
                    <span className="leading-snug">{choice}</span>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      id={`game-btn-up-${idx}`}
                      onClick={() => moveItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 min-w-8 bg-white border border-[#E5E3D8] text-[#55534C] rounded text-[9px] hover:bg-[#F2F1EA] disabled:opacity-30 cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      id={`game-btn-down-${idx}`}
                      onClick={() => moveItem(idx, 'down')}
                      disabled={idx === choices.length - 1}
                      className="p-1 min-w-8 bg-white border border-[#E5E3D8] text-[#55534C] rounded text-[9px] hover:bg-[#F2F1EA] disabled:opacity-30 cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              id="btn-mixed-precision-reset"
              onClick={handleResetGame}
              className="px-3 py-1.5 border border-[#E5E3D8] text-[#55534C] rounded text-xs hover:bg-[#F2F1EA] cursor-pointer"
            >
              Reset Order
            </button>
            <button
              id="btn-mixed-precision-check"
              onClick={checkGameOrder}
              className="px-4 py-1.5 bg-[#33332D] hover:bg-[#1C1C1A] text-white rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              Check Sequence
            </button>
          </div>

          {/* Game feedback banner */}
          <div className="pt-2">
            {gameResult === 'success' && (
              <div className="p-3 bg-[#EAF2E8] border border-[#B2D8A6] rounded-lg text-[#3E6335] text-[11px] font-medium leading-relaxed">
                <span className="font-bold flex items-center gap-1 text-[#3E6335] text-xs uppercase mb-1">
                  <Check className="w-4 h-4 text-[#3E6335] stroke-[3px]" /> Excellent! Exact math flow!
                </span>
                Gradients MUST be unscaled first (<code className="font-mono bg-[#EAF2E8] px-1 py-0.5 rounded text-[#3E6335]">scaler.unscale_</code>) 
                before checking clipping norms, because if you clip gradients that are still multi-scaled, the thresholds will trigger erroneously! Then scaler computes optimizer weights correctly.
              </div>
            )}
            {gameResult === 'fail' && (
              <div className="p-3 bg-[#FDF1D8] border border-[#D9A34A] rounded-lg text-[#8B6424] text-[11px] font-medium">
                <span className="font-bold flex items-center gap-1 text-[#8B6424] text-xs uppercase mb-1">
                  ❌ Sequence Mistake Found
                </span>
                The order is incorrect. Remember context wrappers open first, scaling occurs on loss, unscaling must pre-empt clipping check, and scale state updates last. Try reordering!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
