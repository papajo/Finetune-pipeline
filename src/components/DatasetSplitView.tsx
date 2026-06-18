import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Columns, Play, Percent, Check, Ban, AlertTriangle, Sparkles } from 'lucide-react';

export default function DatasetSplitView() {
  const [valSplit, setValSplit] = useState<number>(15); // 15% validation
  const [epochs, setEpochs] = useState<number>(15);
  const [overfitRate, setOverfitRate] = useState<number>(5); // 1 to 10
  const [selectedEpoch, setSelectedEpoch] = useState<number>(7);

  // Math equations simulating Train/Val Curves based on capacity/overfitRate
  const getLossPoints = (epoch: number) => {
    // Train loss drops continuously
    const trainLoss = 2.5 * Math.exp(-0.25 * epoch) + 0.1;
    
    // Val loss drops but rises later due to overfitting, faster when overfitRate is high
    const overfitFactor = (overfitRate / 100) * Math.pow(epoch, 1.8);
    const valLoss = 2.65 * Math.exp(-0.22 * epoch) + 0.15 + overfitFactor;

    return { train: trainLoss, val: valLoss };
  };

  // Find the optimal checkpoint index
  let bestEpoch = 1;
  let minVal = 999.0;
  for (let e = 1; e <= epochs; e++) {
    const { val } = getLossPoints(e);
    if (val < minVal) {
      minVal = val;
      bestEpoch = e;
    }
  }

  const { train: curTrain, val: curVal } = getLossPoints(selectedEpoch);

  // SVG dimensions for plot
  const svgWidth = 400;
  const svgHeight = 180;
  const padding = 25;

  const trainPoints: string[] = [];
  const valPoints: string[] = [];

  for (let e = 1; e <= epochs; e++) {
    const { train, val } = getLossPoints(e);
    const x = padding + ((e - 1) / (epochs - 1)) * (svgWidth - 2 * padding);
    
    // Scale losses to fit SVG boxheight (loss values range ~0.1 to 3.0)
    const yMax = svgHeight - padding;
    const yMin = padding;
    const trainY = yMax - (train / 3.0) * (yMax - yMin);
    const valY = yMax - (val / 3.0) * (yMax - yMin);

    trainPoints.push(`${x},${trainY}`);
    valPoints.push(`${x},${valY}`);
  }

  // Find coordinate of optimal evaluation checkpoint on plot
  const bestX = padding + ((bestEpoch - 1) / (epochs - 1)) * (svgWidth - 2 * padding);
  const bestY = svgHeight - padding - (minVal / 3.0) * (svgHeight - 2 * padding);

  // Grid distribution of cards representing dataset
  const totalSamplesCount = 60;
  const trainCount = Math.floor(((100 - valSplit) / 100) * totalSamplesCount);
  const valCount = totalSamplesCount - trainCount;

  return (
    <div id="dataset-split-view" className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#8A9A5B] p-4 rounded-r-lg">
        <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
          <Columns className="w-5 h-5 text-[#8A9A5B]" />
          Exercise 5: Validation Split & Periodic Evaluation
        </h3>
        <p className="text-sm text-[#706F63] mt-1 leading-relaxed">
          Holding out a portion of datasets ($10-20\%$) inside validation segments lets us track generalization on unseen tokens. 
          When training loss continues moving down but validation loss begins climbing back up, the model is starting to 
          <strong> overfit</strong>. The ideal stopping point is the minimum of validation loss.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left segment controls */}
        <div className="lg:col-span-5 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-5">
          <h4 className="font-serif font-bold text-[#33332D] flex items-center gap-2 border-b border-[#E5E3D8] pb-2">
            <span>Holdout Parameters</span>
          </h4>

          {/* Validation percentage slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#55534C]">Validation Split Percentage</span>
              <span className="font-mono text-[#3E6335] font-bold bg-[#EAF2E8] px-2.5 py-0.5 rounded">
                {valSplit} %
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={valSplit}
              onChange={(e) => setValSplit(parseInt(e.target.value))}
              className="w-full accent-[#8A9A5B]"
            />
            <p className="text-[11px] text-[#706F63]">
              Splits datasets into Training Set ({100 - valSplit}%) and holdout Validation Set ({valSplit}%).
            </p>
          </div>

          {/* Model Overfitting rate factor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#55534C]">Model Capacity (Overfit propensity)</span>
              <span className="font-mono bg-[#EFEDE4] px-2 py-0.5 rounded text-[#8B6424] font-bold text-xs">
                {overfitRate === 1 ? 'Low' : overfitRate <= 4 ? 'Moderate' : overfitRate <= 7 ? 'High Capacity' : 'Extremely High'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={overfitRate}
              onChange={(e) => setOverfitRate(parseInt(e.target.value))}
              className="w-full accent-[#8A9A5B]"
            />
            <p className="text-[11px] text-[#706F63]">
              Higher capacity models memorize patterns rapidly, inducing validation curves to bounce upward earlier!
            </p>
          </div>

          {/* Grid representing dataset split distribution */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#33332D]">
              <span>Holdout grid map ({totalSamplesCount} files)</span>
              <span className="text-[10px] text-[#706F63] font-normal">Train: {trainCount} | Val: {valCount}</span>
            </div>
            <div className="grid grid-cols-10 gap-1.5 p-3 bg-[#FAF8F3] border border-[#E5E3D8] rounded-lg">
              {Array.from({ length: totalSamplesCount }).map((_, idx) => {
                const isVal = idx >= trainCount;
                return (
                  <motion.div
                    key={idx}
                    className={`h-4.5 rounded-sm transition-all shadow-sm ${
                      isVal ? 'bg-[#8A9A5B]' : 'bg-[#EFEDE4] border border-[#E5E3D8]'
                    }`}
                    title={isVal ? 'Validation sample' : 'Training sample'}
                    animate={{ scale: [0.95, 1] }}
                    transition={{ delay: idx * 0.005 }}
                  />
                );
              })}
            </div>
            <div className="flex justify-around items-center text-[10px] mt-1 pr-1 font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#EFEDE4] border border-[#E5E3D8] rounded-sm inline-block" />
                <span className="text-[#706F63]">Training Partition</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#8A9A5B] rounded-sm inline-block" />
                <span className="text-[#706F63]">Holdout Validation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Training curve graph and explainers */}
        <div className="lg:col-span-7 bg-[#FAF9F6] p-5 rounded-xl border border-[#E5E3D8] shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E5E3D8] pb-2">
            <h4 className="font-serif font-bold text-[#33332D] flex items-center gap-1.5">
              <span>Generalization Loss curves</span>
            </h4>
            <div className="text-xs bg-[#EFEDE4] px-2 py-0.5 rounded text-[#3E6335] font-bold font-mono">
              Min Val Loss at Epoch {bestEpoch}
            </div>
          </div>

          {/* Plotting panel */}
          <div className="p-3 bg-[#FAF8F3] border border-[#E5E3D8] rounded-lg flex flex-col items-center">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full max-w-lg"
              style={{ overflow: 'visible' }}
            >
              {/* Plot Background lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#E5E3D8" />
              <line x1={padding} y1={(svgHeight) / 2} x2={svgWidth - padding} y2={(svgHeight) / 2} stroke="#E5E3D8" />
              <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#D5D3C7" strokeWidth="1.2" />

              {/* Dotted indicator for Best Checkpoint evaluation stopping point */}
              <line
                x1={bestX}
                y1={padding}
                x2={bestX}
                y2={svgHeight - padding}
                stroke="#8A9A5B"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />

              {/* Dotted indicator for current cursor selection */}
              <line
                x1={padding + ((selectedEpoch - 1) / (epochs - 1)) * (svgWidth - 2 * padding)}
                y1={padding}
                x2={padding + ((selectedEpoch - 1) / (epochs - 1)) * (svgWidth - 2 * padding)}
                y2={svgHeight - padding}
                stroke="#D9A34A"
                strokeWidth="1.2"
                strokeDasharray="4,2"
              />

              {/* Train Loss Path (decaying downwards) */}
              {trainPoints.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#B58021"
                  strokeWidth="2.5"
                  points={trainPoints.join(' ')}
                />
              )}

              {/* Validation Loss Path (decaying, but eventually rising) */}
              {valPoints.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#8A9A5B"
                  strokeWidth="2.5"
                  strokeDasharray="1,0"
                  points={valPoints.join(' ')}
                />
              )}

              {/* Minimal validation checkpoint star marker */}
              <circle
                cx={bestX}
                cy={bestY}
                r="6"
                fill="#8A9A5B"
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* Labels */}
              <text x={padding} y={svgHeight - 4} fontSize="8" fill="#706F63" fontFamily="monospace">
                Epoch 1
              </text>
              <text x={svgWidth - padding - 35} y={svgHeight - 4} fontSize="8" fill="#706F63" fontFamily="monospace">
                Epoch {epochs}
              </text>
              <text x={padding} y={padding - 6} fontSize="8" className="font-bold fill-[#706F63]" fontFamily="sans-serif">
                Loss
              </text>

              {/* Labels for curve signatures */}
              <text x={svgWidth - padding - 75} y={svgHeight - padding - 40} fontSize="8" className="font-bold fill-[#B58021]" fontFamily="sans-serif">
                Train Loss
              </text>
              <text x={svgWidth - padding - 75} y={padding + 15} fontSize="8" className="font-bold fill-[#8A9A5B]" fontFamily="sans-serif">
                Validation Loss
              </text>

              <text x={bestX - 25} y={padding + 8} fontSize="7" className="font-bold fill-[#3E6335]" fontFamily="sans-serif">
                ★ Best Checkpoint
              </text>
            </svg>

            {/* Config scrubber */}
            <div className="w-full max-w-lg mt-3 space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-[#706F63]">
                <span>Select epoch to inspect details</span>
                <span className="font-bold text-[#3E6335]">Epoch {selectedEpoch}</span>
              </div>
              <input
                type="range"
                min="1"
                max={epochs}
                step="1"
                value={selectedEpoch}
                onChange={(e) => setSelectedEpoch(parseInt(e.target.value))}
                className="w-full accent-[#8A9A5B]"
              />
            </div>
          </div>

          {/* Validation state table block */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-[#FAF6EE] rounded border border-[#E5E3D8] text-center">
              <span className="text-[10px] text-[#B58021] font-mono block">Train Loss (Epoch {selectedEpoch})</span>
              <span className="font-mono text-base font-bold text-[#33332D]">{curTrain.toFixed(4)}</span>
            </div>
            <div className="p-2.5 bg-[#EAF2E8] rounded border border-[#E5E3D8] text-center">
              <span className="text-[10px] text-[#3E6335] font-mono block">Val Loss (Epoch {selectedEpoch})</span>
              <span className="font-mono text-base font-bold text-[#33332D]">{curVal.toFixed(4)}</span>
            </div>
          </div>

          {/* Overfitting alert or healthy comment */}
          <div className="bg-[#33332D] text-[#FAF9F6] p-3.5 rounded-lg text-xs leading-relaxed space-y-1 border border-[#55534C]">
            {selectedEpoch < bestEpoch ? (
              <div>
                <span className="text-[#8A9A5B] font-bold block mb-0.5">✔ Normal Convergence Phase</span>
                Both training loss and validation loss are trending downwards. Model is still learning general features. Continued training is recommended.
              </div>
            ) : selectedEpoch === bestEpoch ? (
              <div>
                <span className="text-[#8A9A5B] font-bold block mb-0.5">🌟 OPTIMAL STOPPOINT / GOLD CHECKPOINT</span>
                At epoch {selectedEpoch}, validation loss has reached its absolute floor ({minVal.toFixed(3)}). This represents optimal model checkpoint parameters! Any further training will begin memorizing specific tokens.
              </div>
            ) : (
              <div>
                <span className="text-[#D9A34A] font-bold flex items-center gap-1 mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ OVERFITTING TRIGGERED
                </span>
                At epoch {selectedEpoch}, train loss resides at {curTrain.toFixed(3)}, but validation loss bounced back up to {curVal.toFixed(3)}! The parameters are starting to memorize non-generalizable structures of training.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
