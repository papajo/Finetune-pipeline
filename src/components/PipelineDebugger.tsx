import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, RotateCcw, Monitor, Code, Settings, CheckCircle, Database } from 'lucide-react';
import { SimulationState } from '../types';

export default function PipelineDebugger() {
  const [pipelineMode, setPipelineMode] = useState<'standard' | 'precision_fp16'>('precision_fp16');
  const [state, setState] = useState<SimulationState>({
    epoch: 1,
    step: 0,
    currentLoss: 2.14,
    valLoss: null,
    learningRate: 3e-4,
    gradientNorm: 1.2,
    precisionMode: 'fp16',
    lrScheduler: 'cosine',
    gradClipThreshold: 1.5,
    valSplit: 15,
    isTrainingActive: false,
    activeLineIndex: 0,
    isFp16AutocastActive: false,
    isLossScaled: false,
    scaleFactor: 65536,
    history: [],
  });

  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'SYSTEM: Sandbox pipeline initialized. Choose a debugger model loop to execute.',
  ]);

  // Code line blocks matching standard vs mixed precision processes
  const standardCodeLines = [
    'for batch in train_loader:  # 1. Fetch batch from data loop',
    '    optimizer.zero_grad()  # 2. Reset optimizer parameter gradients',
    '    outputs = model(**batch)  # 3. Standard FP32 forward pass',
    '    loss = outputs.loss  # 4. Extract scalar model loss',
    '    loss.backward()  # 5. Backward propagation creates raw gradients',
    '    # 6. Apply Gradient Clipping',
    '    torch.nn.utils.clip_grad_norm_(model.parameters(), clip_threshold)',
    '    optimizer.step()  # 7. Standard optimizer gradient updates',
    '    scheduler.step()  # 8. Adjust learning rate step decays',
  ];

  const fp16CodeLines = [
    'for batch in train_loader:  # 1. Fetch batch from split loader',
    '    optimizer.zero_grad()  # 2. Reset optimizer gradient states',
    '    # 3. Mixed Precision context wrapper',
    '    with autocast(device_type="cuda", dtype=torch.float16):',
    '        outputs = model(**batch)  # 4. Autocast forward pass computes elements',
    '        loss = outputs.loss',
    '    # 5. Scale loss before computing backward pass to shield low exponents',
    '    scaler.scale(loss).backward()',
    '    # 6. UN-SCALE gradients first else clipping threshold evaluates erroneously',
    '    scaler.unscale_(optimizer)',
    '    # 7. Check and prune exploding gradient norms',
    '    torch.nn.utils.clip_grad_norm_(model.parameters(), clip_threshold)',
    '    scaler.step(optimizer)  # 8. Step weights with protection filter',
    '    scaler.update()  # 9. Dynamically adjust scaler factor registers',
    '    scheduler.step()  # 10. Decay current step Learning Rate',
  ];

  const activeLines = pipelineMode === 'standard' ? standardCodeLines : fp16CodeLines;

  // Manual step or auto step logic
  const handleStepForward = () => {
    setState((prev) => {
      const isFp16 = pipelineMode === 'precision_fp16';
      const linesCount = isFp16 ? fp16CodeLines.length : standardCodeLines.length;
      const nextLineIdx = (prev.activeLineIndex + 1) % linesCount;
      
      let nextStep = prev.step;
      let nextEpoch = prev.epoch;
      let nextLoss = prev.currentLoss;
      let nextGradNorm = prev.gradientNorm;
      let nextLr = prev.learningRate;
      let nextAutocast = prev.isFp16AutocastActive;
      let nextScaled = prev.isLossScaled;
      let nextScaleFactor = prev.scaleFactor;
      let logMsg = '';

      if (nextLineIdx === 0) {
        // Increment step inside epoch loop
        nextStep += 1;
        if (nextStep >= 5) {
          nextStep = 0;
          nextEpoch += 1;
        }
      }

      // Action logging based on active execution line index
      if (isFp16) {
        switch (nextLineIdx) {
          case 0: // fetch batch
            nextGradNorm = parseFloat((Math.random() * 2.8 + 0.2).toFixed(2));
            logMsg = `[Step ${nextStep}] Fetched random training batch of tokens from DataLoader. Raw Grad Norm simulated: ${nextGradNorm}.`;
            break;
          case 1: // zero dev
            logMsg = 'Gradients cleared inside optimizer parameter memory storage (zero_grad).';
            break;
          case 2: // autocast start
            nextAutocast = true;
            logMsg = 'Autocast context opened! Forcing CUDA tensor logic to utilize 16-bit float registers representation.';
            break;
          case 4: // forward computed
            nextLoss = parseFloat((2.5 * Math.exp(-0.15 * nextStep - 0.2 * nextEpoch) + Math.random() * 0.1).toFixed(3));
            logMsg = `Forward pass complete. Loss computed: ${nextLoss}. FP16 weights reduce GPU cache loads by ~48%.`;
            break;
          case 6: // scaled loss backward
            nextAutocast = false;
            nextScaled = true;
            logMsg = `scaler.scale(loss) triggered! Loss scaling factor registry multiplied to preserve tiny values underflow: ${nextLoss} × ${nextScaleFactor} = ${(nextLoss * nextScaleFactor).toFixed(0)}. Backward gradients populated.`;
            break;
          case 8: // unscale
            nextScaled = false;
            logMsg = `Gradients unscaled back to raw range (divided by scale register ${nextScaleFactor}) before checking gradient clip.`;
            break;
          case 10: // clip norm
            if (nextGradNorm > prev.gradClipThreshold) {
              logMsg = `⚠️ Gradient clipping triggered! Exploding gradient norm ${nextGradNorm} scaled back to threshold maximum ${prev.gradClipThreshold}.`;
              nextGradNorm = prev.gradClipThreshold;
            } else {
              logMsg = `Gradient norm (${nextGradNorm}) is under max clipping limit (${prev.gradClipThreshold}). Parameter integrity intact.`;
            }
            break;
          case 12: // step weights
            logMsg = 'Weight update parameters successfully dispatched through scaled optimizer layer.';
            break;
          case 13: // scale factor adjust
            if (Math.random() > 0.8) {
              nextScaleFactor = Math.max(1024, Math.floor(nextScaleFactor / 2));
              logMsg = `Scaler detected subnormal patterns. Reduced scale factor registry register to ${nextScaleFactor}.`;
            } else {
              logMsg = 'No parameter underflow detected. Scale factor registers stabilized.';
            }
            break;
          case 14: // decay lr
            // Simulate cosine decay pattern
            const progress = (nextStep + nextEpoch * 5) / 50;
            const cosVal = (Math.cos(progress * Math.PI) + 1) / 2;
            nextLr = 3e-4 * (0.1 + 0.9 * cosVal);
            logMsg = `LR Decay stepped! Current LR mapped down to : ${nextLr.toExponential(3)}.`;
            break;
          default:
            break;
        }
      } else {
        // Standard loop tracing
        switch (nextLineIdx) {
          case 0:
            nextGradNorm = parseFloat((Math.random() * 3.0 + 0.1).toFixed(2));
            logMsg = `[Step ${nextStep}] Loaded next FP32 batch from DataLoader.`;
            break;
          case 1:
            logMsg = 'All parameter gradients zeroed out.';
            break;
          case 2:
            nextLoss = parseFloat((2.5 * Math.exp(-0.15 * nextStep - 0.2 * nextEpoch) + Math.random() * 0.15).toFixed(3));
            logMsg = `Standard forward pass completed inside full 32-bit registers. Loss: ${nextLoss}.`;
            break;
          case 4:
            logMsg = 'Standard backward pass finished. Populated FP32 gradients.';
            break;
          case 6:
            if (nextGradNorm > prev.gradClipThreshold) {
              logMsg = `⚠️ CLIP: Gradient norm ${nextGradNorm} exceeded ${prev.gradClipThreshold}. Clipped output.`;
              nextGradNorm = prev.gradClipThreshold;
            } else {
              logMsg = 'Gradients norm safe under clipping limit.';
            }
            break;
          case 7:
            logMsg = 'Optimizer weights parameters updated.';
            break;
          case 8:
            nextLr = Math.max(1e-5, prev.learningRate - 8e-6);
            logMsg = `Linear scheduler stepped. Adjusted LR down to : ${nextLr.toExponential(3)}.`;
            break;
          default:
            break;
        }
      }

      if (logMsg) {
        setConsoleLogs((prevLogs) => [logMsg, ...prevLogs].slice(0, 8));
      }

      return {
        ...prev,
        activeLineIndex: nextLineIdx,
        step: nextStep,
        epoch: nextEpoch,
        currentLoss: nextLoss,
        gradientNorm: nextGradNorm,
        learningRate: nextLr,
        isFp16AutocastActive: nextAutocast,
        isLossScaled: nextScaled,
        scaleFactor: nextScaleFactor,
      };
    });
  };

  // Timer loop when "Play" is clicked
  useEffect(() => {
    let timerID: any = null;
    if (state.isTrainingActive) {
      timerID = setInterval(() => {
        handleStepForward();
      }, 1000);
    }
    return () => {
      if (timerID) clearInterval(timerID);
    };
  }, [state.isTrainingActive, pipelineMode, state.activeLineIndex]);

  const handleReset = () => {
    setState({
      epoch: 1,
      step: 0,
      currentLoss: 2.14,
      valLoss: null,
      learningRate: 3e-4,
      gradientNorm: 1.2,
      precisionMode: 'fp16',
      lrScheduler: 'cosine',
      gradClipThreshold: 1.5,
      valSplit: 15,
      isTrainingActive: false,
      activeLineIndex: 0,
      isFp16AutocastActive: false,
      isLossScaled: false,
      scaleFactor: 65536,
      history: [],
    });
    setConsoleLogs(['SYSTEM: Reset complete. Training pipeline loaded back to Step 0.']);
  };

  return (
    <div id="pipeline-debugger-view" className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#8A9A5B] p-4 rounded-r-lg">
        <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
          <Monitor className="w-5 h-5 text-[#8A9A5B]" />
          Interactive IDE Training Debugger Walkthrough
        </h3>
        <p className="text-sm text-[#706F63] mt-1 leading-relaxed">
          Select standard or multi-precision templates. Press <strong>Step Forward</strong> or click <strong>Auto Run</strong> 
          to trace the exact execution pipeline in real-time, watching hardware states and GPU registers adapt.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Visual IDE with lines highlight */}
        <div className="lg:col-span-7 bg-[#1C1C1A] p-5 rounded-xl text-[#FAF9F6] font-mono shadow-sm border border-[#33332D] min-h-[460px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-[#33332D] mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#8A9A5B]" />
                <span className="text-xs font-bold text-[#FAF9F6]/60">ide_tuner_script.py</span>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  id="btn-debugger-mode-fp32"
                  onClick={() => {
                    setPipelineMode('standard');
                    handleReset();
                  }}
                  className={`px-2.5 py-1 rounded text-2xs cursor-pointer ${
                    pipelineMode === 'standard' ? 'bg-[#8A9A5B] text-white font-bold' : 'bg-[#33332D] border border-[#55534C] text-[#FAF9F6]/60'
                  }`}
                >
                  FP32 Standard Loop
                </button>
                <button
                  id="btn-debugger-mode-fp16"
                  onClick={() => {
                    setPipelineMode('precision_fp16');
                    handleReset();
                  }}
                  className={`px-2.5 py-1 rounded text-2xs cursor-pointer ${
                    pipelineMode === 'precision_fp16' ? 'bg-[#8A9A5B] text-white font-bold' : 'bg-[#33332D] border border-[#55534C] text-[#FAF9F6]/60'
                  }`}
                >
                  FP16 Mixed Precision
                </button>
              </div>
            </div>

            {/* List of code lines */}
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              {activeLines.map((line, idx) => {
                const isActive = state.activeLineIndex === idx;
                return (
                  <motion.div
                    key={line}
                    className={`p-1.5 rounded flex gap-2 transition-all ${
                      isActive
                        ? 'bg-[#33332D] text-white font-semibold border-l-4 border-[#8A9A5B] shadow-xs'
                        : 'text-[#FAF9F6]/60 border-l-4 border-transparent'
                    }`}
                    animate={isActive ? { scale: [0.99, 1.01, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-[#55534C] select-none w-5 text-right font-mono">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className="whitespace-pre-wrap">{line}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#33332D] pt-4 mt-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#FAF9F6]/40">Telemetry Engine console</span>
              <span className="font-bold text-[#8A9A5B] font-mono">Active script threads : main()</span>
            </div>
          </div>
        </div>

        {/* Right column: Debugger Controller, Hardware monitor, Logs */}
        <div className="lg:col-span-5 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Simulation controls bar */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#706F63] block">Debugger Controllers</span>
              <div className="flex gap-2">
                <button
                  id="btn-debugger-toggle-run"
                  onClick={() => setState({ ...state, isTrainingActive: !state.isTrainingActive })}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all text-white flex items-center justify-center gap-1.5 cursor-pointer ${
                    state.isTrainingActive ? 'bg-[#D9A34A] hover:bg-[#C28E35]' : 'bg-[#8A9A5B] hover:bg-[#78884F]'
                  }`}
                >
                  {state.isTrainingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {state.isTrainingActive ? 'Hold Autoplay' : 'Autoplay (1s)'}
                </button>
                <button
                  id="btn-debugger-step"
                  onClick={handleStepForward}
                  disabled={state.isTrainingActive}
                  className="px-3 bg-[#33332D] text-[#FAF9F6] hover:bg-[#1C1C1A] disabled:opacity-40 rounded text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Step
                </button>
                <button
                  id="btn-debugger-reset"
                  onClick={handleReset}
                  className="p-1 px-3 border border-[#E5E3D8] hover:bg-[#FAF9F6] rounded text-[#706F63] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Live Hardware Monitors */}
            <div className="space-y-3 bg-[#FAF8F3] p-4 rounded-lg border border-[#E5E3D8]">
              <span className="text-xs font-bold text-[#33332D] block border-b border-[#E5E3D8] pb-1">
                Hardware Registers & Active State
              </span>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#706F63] block">DType precision</span>
                  <span className="font-bold text-[#3E6335] uppercase">
                    {state.isFp16AutocastActive ? 'Float16 (Autocast)' : 'Float32 (Normal)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#706F63] block">LR (Optimizer)</span>
                  <span className="font-bold text-[#33332D]">{state.learningRate.toExponential(4)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#706F63] block">Active Loss</span>
                  <span className="font-bold text-[#33332D]">{state.currentLoss.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#706F63] block">GradScaler registers</span>
                  <span className="font-bold text-[#33332D]">
                    {pipelineMode === 'precision_fp16' ? `Factor: ${state.scaleFactor}` : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#706F63] block">Gradient Norm (g_norm)</span>
                  <span className={`font-bold ${state.gradientNorm >= state.gradClipThreshold ? 'text-[#8B6424]' : 'text-[#3E6335]'}`}>
                    {state.gradientNorm.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#706F63] block">GPU cache burden (Model)</span>
                  <span className="font-bold text-[#8A9A5B]">
                    {pipelineMode === 'precision_fp16' ? '78 MB (VRAM Saved!)' : '156 MB'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time scrollable logging output box */}
          <div className="space-y-2 mt-4">
            <span className="text-xs font-semibold text-[#706F63] block">Telemetry Log Stream</span>
            <div className="bg-[#1C1C1A] p-3 rounded-lg border border-[#33332D] min-h-[140px] max-h-[140px] overflow-y-auto space-y-2 font-mono text-[10px] text-[#8A9A5B]">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed odd:text-[#FAF9F6]">
                  🌿 {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
