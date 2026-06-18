import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldAlert, Zap, HelpCircle, RotateCcw, Flame } from 'lucide-react';

export default function GradClipView() {
  const [clipThreshold, setClipThreshold] = useState<number>(1.5);
  // Current raw gradient vector elements
  const [vector, setVector] = useState<{ x: number; y: number }>({ x: 2.2, y: 1.8 });
  const [history, setHistory] = useState<Array<{ step: number; x: number; y: number; norm: number; after: number; isClipped: boolean }>>([]);
  const [stepCounter, setStepCounter] = useState<number>(1);

  // Compute L2 Norm (Euclidean / Euclidean distance length of vector)
  const norm = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  const isClipped = norm > clipThreshold;

  // Clipped vector coordinates
  const scale = isClipped ? clipThreshold / norm : 1.0;
  const clippedX = vector.x * scale;
  const clippedY = vector.y * scale;
  const clippedNorm = Math.sqrt(clippedX * clippedX + clippedY * clippedY);

  const handleGenerateRandom = (large = false) => {
    const range = large ? 4.5 : 2.0;
    const signX = Math.random() > 0.5 ? 1 : -1;
    const signY = Math.random() > 0.5 ? 1 : -1;
    const rx = parseFloat((Math.random() * range * signX).toFixed(2));
    const ry = parseFloat((Math.random() * range * signY).toFixed(2));
    setVector({ x: rx, y: ry });
  };

  const logUpdate = () => {
    const newRecord = {
      step: stepCounter,
      x: vector.x,
      y: vector.y,
      norm: parseFloat(norm.toFixed(3)),
      after: parseFloat(clippedNorm.toFixed(3)),
      isClipped: isClipped,
    };
    setHistory(prev => [newRecord, ...prev].slice(0, 5));
    setStepCounter(prev => prev + 1);
  };

  useEffect(() => {
    logUpdate();
  }, [vector, clipThreshold]);

  // Canvas visual scaling coordinates mapping (translating to SVG space of 200x200 center of 100,100)
  const center = 100;
  const multiplier = 20; // 1 unit = 20 pixels

  return (
    <div id="grad-clip-view" className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#8A9A5B] p-4 rounded-r-lg">
        <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#8A9A5B]" />
          Exercise 2: Gradient Clipping to Stabilize Models
        </h3>
        <p className="text-sm text-[#706F63] mt-1 leading-relaxed">
          Gradients can explode (L2 Norm &gt;&gt; clipping threshold) during training, causing parameters to overflow.
          Gradient Clipping scales the parameters back while keeping their heading/direction exactly identical so learning remains stable.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: explanation and input parameters */}
        <div className="lg:col-span-5 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-5">
          <h4 className="font-serif font-bold text-[#33332D] flex items-center gap-2 border-b border-[#E5E3D8] pb-2">
            <span>Gradient Clipping Sandbox</span>
          </h4>

          {/* Slider for Clipping Range */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#55534C]">Clipping Threshold (γ)</span>
              <span className="font-mono bg-[#EFEDE4] text-[#33332D] px-2 py-0.5 rounded font-bold">
                γ = {clipThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={clipThreshold}
              onChange={(e) => setClipThreshold(parseFloat(e.target.value))}
              className="w-full accent-[#8A9A5B]"
            />
            <p className="text-[11px] text-[#706F63]">
              Maximum allowable Euclidean Euclidean length ($L_2$ norm) for the full model gradients.
            </p>
          </div>

          {/* Interactive Vector Controls */}
          <div className="space-y-3 p-3 bg-[#FAF8F3] rounded-lg border border-[#E5E3D8]">
            <span className="text-xs font-bold text-[#33332D] block">Simulate Current Gradients</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-[#706F63] font-mono block mb-1">Grad_X component</span>
                <input
                  type="number"
                  step="0.1"
                  value={vector.x}
                  onChange={(e) => setVector({ ...vector, x: parseFloat(e.target.value) || 0 })}
                  className="w-full text-center py-1 bg-white border border-[#E5E3D8] rounded text-xs font-mono font-bold text-[#33332D]"
                />
              </div>
              <div>
                <span className="text-[10px] text-[#706F63] font-mono block mb-1">Grad_Y component</span>
                <input
                  type="number"
                  step="0.1"
                  value={vector.y}
                  onChange={(e) => setVector({ ...vector, y: parseFloat(e.target.value) || 0 })}
                  className="w-full text-center py-1 bg-white border border-[#E5E3D8] rounded text-xs font-mono font-bold text-[#33332D]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                id="btn-trigger-exploding-grad"
                onClick={() => handleGenerateRandom(true)}
                className="w-full py-1.5 bg-[#D9A34A] hover:bg-[#C28E35] active:bg-[#B58021] text-white rounded text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                Exploding Grad! (Large Vector)
              </button>
              <button
                id="btn-trigger-normal-grad"
                onClick={() => handleGenerateRandom(false)}
                className="w-full py-1 bg-[#33332D] hover:bg-[#1C1C1A] text-[#FAF9F6] rounded text-xs font-bold transition-all cursor-pointer"
              >
                Stable Gradient (Small Vector)
              </button>
            </div>
          </div>

          {/* Status Panel */}
          <div className="bg-[#33332D] text-[#FAF9F6] p-4 rounded-lg space-y-2 border border-[#55534C]">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#FAF9F6]/60">Raw Grad L2 Norm:</span>
              <span className={`font-bold ${isClipped ? 'text-[#D9A34A]' : 'text-[#8A9A5B]'}`}>
                {norm.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-mono border-b border-[#55534C] pb-1.5">
              <span className="text-[#FAF9F6]/60">Threshold Max:</span>
              <span className="text-[#D9A34A] font-bold">{clipThreshold.toFixed(2)}</span>
            </div>

            <AnimatePresence mode="wait">
              {isClipped ? (
                <motion.div
                  key="clipped"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-[#1C1C1A] border border-[#D9A34A] p-2.5 rounded-md text-[#FAF9F6]/80 text-[11px] font-mono leading-relaxed space-y-1"
                >
                  <div className="flex items-center gap-1 text-[#D9A34A] font-bold uppercase text-xs">
                    <Zap className="w-3.5 h-3.5" />
                    Clipping Triggered!
                  </div>
                  <div>
                    Reduction scale factor: <code className="font-bold text-white text-xs">{(scale * 100).toFixed(1)}%</code>.
                  </div>
                  <div>
                    All vectors scaled by exact multiplier factor so gradients do not corrupt baseline embeddings.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="safe"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-[#1C1C1A] border border-[#3E6335] p-2.5 rounded-md text-[#FAF9F6]/80 text-[11px] font-mono leading-relaxed"
                >
                  <div className="text-[#8A9A5B] font-bold uppercase text-xs mb-0.5">✔ Normal Flow</div>
                  No attenuation required. Vector parameters mapped forward unchanged.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right column: live SVG circle geometry representation & histories */}
        <div className="lg:col-span-7 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-6">
          <h4 className="font-serif font-bold text-[#33332D] flex items-center justify-between">
            <span>2D Geometric Gradient Space</span>
            <span className="text-xs text-[#706F63] italic">Amber = Raw, Sage = After Clipping</span>
          </h4>

          {/* SVG representation space */}
          <div className="flex items-center justify-center p-4 bg-[#FAF8F3] border border-[#E5E3D8] rounded-lg relative">
            <svg
              viewBox="0 0 200 200"
              className="w-72 h-72 rounded-lg"
              style={{ overflow: 'visible' }}
            >
              {/* Origin Grid axis */}
              <line x1="0" y1="100" x2="200" y2="100" stroke="#D5D3C7" strokeDasharray="2,2" />
              <line x1="100" y1="0" x2="100" y2="200" stroke="#D5D3C7" strokeDasharray="2,2" />

              {/* Threshold Boundary Circle */}
              <circle
                cx={center}
                cy={center}
                r={clipThreshold * multiplier}
                fill="rgba(138, 154, 91, 0.05)"
                stroke="#8A9A5B"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <text
                x={center + clipThreshold * multiplier + 4}
                y={center + 12}
                fill="#3E6335"
                fontSize="8"
                fontFamily="monospace"
                className="font-bold"
              >
                γ Thr={clipThreshold.toFixed(1)}
              </text>

              {/* Raw Vector arrow (if clipped, show dotted red/amber extending to overflow) */}
              {isClipped && (
                <g>
                  {/* Outer unclipped trajectory extension */}
                  <line
                    x1={center}
                    y1={center}
                    x2={center + vector.x * multiplier}
                    y2={center - vector.y * multiplier}
                    stroke="#D9A34A"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                  />
                  {/* Arrowhead element for Raw trajectory */}
                  <circle
                    cx={center + vector.x * multiplier}
                    cy={center - vector.y * multiplier}
                    r="4"
                    fill="#D9A34A"
                  />
                </g>
              )}

              {/* Main Valid Target Vector (either clipped endpoint or raw endpoint) */}
              <line
                x1={center}
                y1={center}
                x2={center + clippedX * multiplier}
                y2={center - clippedY * multiplier}
                stroke="#8A9A5B"
                strokeWidth="3.5"
              />
              <circle
                cx={center + clippedX * multiplier}
                cy={center - clippedY * multiplier}
                r="5"
                fill="#8A9A5B"
              />

              {/* Vector values prints */}
              <text
                x={center + clippedX * multiplier + 6}
                y={center - clippedY * multiplier - 6}
                fontSize="9"
                className="font-bold"
                fill="#3E6335"
                fontFamily="monospace"
              >
                g_c : [{clippedX.toFixed(1)}, {clippedY.toFixed(1)}] (L2={clippedNorm.toFixed(2)})
              </text>

              {isClipped && (
                <text
                  x={center + vector.x * multiplier + 6}
                  y={center - vector.y * multiplier + 12}
                  fontSize="8"
                  className="font-semibold"
                  fill="#8B6424"
                  fontFamily="monospace"
                >
                  Raw L2={norm.toFixed(2)}
                </text>
              )}
            </svg>
          </div>

          {/* History logging table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#55534C] block">Gradient Log History</span>
            <div className="border border-[#E5E3D8] rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left bg-white">
                <thead className="bg-[#EFEDE4] text-[#706F63] font-mono text-[10px] border-b border-[#E5E3D8]">
                  <tr>
                    <th className="p-2">Log Step</th>
                    <th className="p-2">Raw Vector (x, y)</th>
                    <th className="p-2">Raw Norm</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Clipped Norm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3D8] font-mono text-[11px]">
                  {history.map((record) => (
                    <tr key={record.step} className={record.isClipped ? 'bg-[#FDF1D8]/20' : ''}>
                      <td className="p-2 text-[#706F63]/80">#{record.step}</td>
                      <td className="p-2 text-[#33332D]">({record.x.toFixed(2)}, {record.y.toFixed(2)})</td>
                      <td className="p-2 font-semibold text-[#33332D]">{record.norm.toFixed(2)}</td>
                      <td className="p-2">
                        {record.isClipped ? (
                          <span className="bg-[#FDF1D8] text-[#8B6424] px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                            Clipped
                          </span>
                        ) : (
                          <span className="bg-[#EAF2E8] text-[#3E6335] px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                            Safe
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-[#33332D] font-bold">{record.after.toFixed(2)}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#706F63] italic">No iterations simulated yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
