import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Settings,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle,
  AlertTriangle,
  FileText,
  Search,
  Code,
  Terminal,
  RefreshCw,
  Sliders,
  Sparkles,
  ChevronRight,
  TrendingDown,
  ArrowRight,
  Bookmark,
  Users
} from 'lucide-react';

interface ConceptGuide {
  id: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<any>;
  standardNaming: { [key: string]: string };
  recommendedConfigs: { [key: string]: string };
  whyItMatters: string;
  bestPracticeSnippet: string;
}

export default function LabGuideView() {
  const [activeConceptId, setActiveConceptId] = useState<string>('lora');

  // Multi-variable experiment sandbox states
  const [lr, setLr] = useState<number>(3e-4); // 0.00001 to 0.01
  const [rank, setRank] = useState<number>(8); // 2 to 64
  const [clip, setClip] = useState<string>('1.0'); // 'off', '0.05', '1.0', '10.0'
  const [precision, setPrecision] = useState<string>('bf16'); // 'fp32', 'fp16-unscaled', 'fp16-scaled', 'bf16'
  const [warmup, setWarmup] = useState<number>(10); // 0 to 20%
  const [decay, setDecay] = useState<number>(0.1); // 0 to 0.5

  const concepts: ConceptGuide[] = [
    {
      id: 'lora',
      title: 'LoRA Adapter Factorization',
      tagline: 'Parameter-efficient structural weight adaptation',
      icon: Sliders,
      whyItMatters: 'Instead of altering a model’s full d x k parameter matrix W₀, LoRA projects updates into two low-rank matrices A and B (with size d x r and r x k). By locking the base weights, we bypass storing optimization state gradients for normal layers, reducing VRAM by up to 99%.',
      standardNaming: {
        'peft.LoraConfig': 'The root controller class in Hugging Face PEFT library.',
        'r (rank)': 'Dimension of low-rank bottleneck. Common: 8 or 16.',
        'lora_alpha': 'Scaling hyperparameter. Dictates delta contribution weight. Usually set to 16 or 2x rank.',
        'target_modules': 'String array pointing to dense target projections, e.g., ["q_proj", "v_proj"].'
      },
      recommendedConfigs: {
        'r (Rank)': '8 to 16 for standard instruct tuning. Scale to 32 or 64 if adapting to new massive jargon sets.',
        'lora_alpha': 'Multiply by 2 relative to rank (e.g. r=8 -> alpha=16; r=16 -> alpha=32). Helps step-scaling convergence.',
        'lora_dropout': '0.05 for vast corpora; 0.1 for smaller datasets to shield adapter weights from over-indexing.'
      },
      bestPracticeSnippet: `from peft import LoraConfig, get_peft_model

peft_config = LoraConfig(
    task_type="CAUSAL_LM",
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none"
)
model = get_peft_model(base_model, peft_config)`
    },
    {
      id: 'clipping',
      title: 'Gradient Bounds Constraint',
      tagline: 'Precluding catastrophic multi-layer numerical surges',
      icon: ShieldCheck,
      whyItMatters: 'In deep sequence recurrent and attention chains, backpropagated feedback can multiply exponentially, triggering "gradient explosion" that ruins parameter convergence. Gradient clipping caps global L2 norm of derivatives, allowing steps even during periods of intense high loss.',
      standardNaming: {
        'torch.nn.utils.clip_grad_norm_': 'Iterates all tensors, computes global L2 norm, and scales down globally to maintain vector direction.',
        'max_norm': 'The upper threshold bounds value assigned. Usually set to 1.0.'
      },
      recommendedConfigs: {
        'max_norm threshold': '1.0 (strict standard) or 5.0 (lenient path).',
        'Execution Order': 'Must be placed strictly AFTER loss.backward() and BEFORE optimizer.step(). Executing is useless if optimizer updates have already shipped!'
      },
      bestPracticeSnippet: `loss = criterion(outputs, targets)
loss.backward()

# Unscale FP16 gradients first if utilizing GradScaler!
# scaler.unscale_(optimizer)

# Execute clipping prior to updating weights
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

optimizer.step()
optimizer.zero_grad()`
    },
    {
      id: 'precision',
      title: 'Mixed Precision Scaling',
      tagline: 'Leveraging half-precision matrix multiplication without numeric collapse',
      whyItMatters: 'While standard Float32 provides wide mathematical margins, it eats significant bandwidth and VRAM. Under half-precision FP16, dynamic values are prone to falling below 6.10e-5 (underflow), zeroing out updates. Dynamic Loss scaling multiplies values before backprop, shifting gradients into clear range.',
      icon: Zap,
      standardNaming: {
        'torch.amp.autocast': 'Context wrapper that routes target layer matrices through 16-bit registers (FP16 or BF16).',
        'torch.amp.GradScaler': 'Dynamic loss scaler engine that manages FP16 multiplication and unscaling steps.'
      },
      recommendedConfigs: {
        'FP16 Dynamic Scaler': 'Required for normal FP16 configurations. Do not bypass!',
        'BF16 (Bfloat16)': 'If training on Ampere/Hopper (A100, H100, RTX 3000+) GPUs, prioritize BF16 over FP16. BF16 matches FP32 exponent margins, removing the need for loss scaling and unscaling variables altogether.'
      },
      bestPracticeSnippet: `from torch.amp import autocast, GradScaler

scaler = GradScaler()

for inputs, targets in dataloader:
    optimizer.zero_grad()
    
    # Cast activations to half-precision
    with autocast(device_type="cuda", dtype=torch.float16):
        loss = model(inputs, targets)
        
    # Scale loss to avoid gradient underflow representational limits
    scaler.scale(loss).backward()
    
    # Unscale prior to clipping and updating
    scaler.unscale_(optimizer)
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    
    scaler.step(optimizer)
    scaler.update()`
    },
    {
      id: 'scheduler',
      title: 'LR Warmup & Cosine Cycles',
      tagline: 'Coordinating step trajectories along complex loss landscapes',
      whyItMatters: 'Near initialization, adapter parameters have high variance. Placing a highly escalated learning rate at start-step 0 can ruin the foundation. Linear warmup steps gently build momentum, followed by a Cosine decay curve that allows weights to converge elegantly as they settle into stable local minima.',
      icon: RefreshCw,
      standardNaming: {
        'get_cosine_schedule_with_warmup': 'Standard generator in Hugging Face Transformers schedule utility module.',
        'num_warmup_steps': 'Amount of starting steps using linear climb. Commonly 5% to 10% of total steps.',
        'learning_rate': 'Peak optimizer scale.'
      },
      recommendedConfigs: {
        'Warmup Ratio': '5% to 10% of total schedule steps.',
        'Final Learning Rate Bounding': 'Bounded to 10% of peak learning rate at terminal step rather than decaying to hard 0.0.'
      },
      bestPracticeSnippet: `from transformers import get_cosine_schedule_with_warmup

optimizer = torch.optim.AdamW(model.parameters(), lr=2e-4, weight_decay=0.01)
scheduler = get_cosine_schedule_with_warmup(
    optimizer=optimizer,
    num_warmup_steps=int(0.1 * total_steps), # 10% warmup
    num_training_steps=total_steps
)`
    },
    {
      id: 'split',
      title: 'Holdout Data Stratification',
      tagline: 'Shielding verification curves from category class frequency skew',
      whyItMatters: 'When validating models on rare, localized classifications (e.g., highly specialized clinical terminology), basic random data splitting runs the risk of isolating all rare target instances into the training or validation branch solely. Stratified splitting preserves label proportions across boundaries.',
      icon: Bookmark,
      standardNaming: {
        'train_test_split(..., stratify=y)': 'Standard programmatic split configuration inside Python Scikit-Learn tools.',
        'Validation Loss Elbow': 'The precise coordinate on validation plots where validation loss reaches a minimum before rebounding.'
      },
      recommendedConfigs: {
        'Partitioning ratio': '80% Train / 20% Validation (for standard small adapters) or 90/10 for highly consolidated sets.',
        'Stratification variable': 'Pass target distribution identifiers so validation evaluates with proportional accuracy.'
      },
      bestPracticeSnippet: `from sklearn.model_selection import train_test_split

# Split ensuring training and validation mirror identical proportion of rare clinical classes
train_df, val_df = train_test_split(
    raw_dataset, 
    test_size=0.20, 
    random_state=42, 
    stratify=raw_dataset['label_id']
)`
    }
  ];

  // Advisor Diagnosis Engine for Sandbox Simulator
  const checkExperimentBalance = () => {
    const alerts: Array<{ type: 'warn' | 'optimal' | 'info'; msg: string; title: string }> = [];

    // Check Precision & Loss Scale alignment
    if (precision === 'fp16-unscaled') {
      alerts.push({
        type: 'warn',
        title: 'Gradients Underflow Risk',
        msg: '⚠️ Running FP16 without structural GradScaler scaling causes highly microscopic weight updates to collapse to 0.0 before optimization registers. Expect stalled model learning or NaNs.'
      });
    }

    if (precision === 'bf16') {
      alerts.push({
        type: 'optimal',
        title: 'Native Half-Precision Excellent',
        msg: '✅ BF16 shares FP32 exponent margins natively. Dynamic scaling is unneeded, bypassing unscale overhead while retaining dual velocity!'
      });
    }

    // Check LR & Rank
    if (lr >= 5e-3) {
      alerts.push({
        type: 'warn',
        title: 'Divergence & Gradient Explosion Danger',
        msg: '⚠️ Peak Learning Rate (' + lr + ') is extremely high for fine-tuning. This risks destabilizing frozen layer outputs, overriding adapter convergence.'
      });
    } else if (lr < 5e-5 && rank <= 4) {
      alerts.push({
        type: 'warn',
        title: 'Severely Restrained Learning Pace',
        msg: '💤 Double-underfitting risk: Peak LR is too low, and Adapter capacity (r=' + rank + ') is too tight. The network can hardly change weights.'
      });
    }

    // Check Overfit risk
    if (rank >= 32 && decay < 0.05) {
      alerts.push({
        type: 'warn',
        title: 'Severe Overfit Regime',
        msg: '⚠️ High rank adapter capacity (r=' + rank + ') paired with negligible Weight Decay (' + decay + ') allows the adapter to easily memorize training samples, eroding validation generalizability.'
      });
    }

    // Checking Gradient clipping
    if (clip === 'off' && lr > 5e-4) {
      alerts.push({
        type: 'warn',
        title: 'Vulnerability to Loss Manifold Spikes',
        msg: '⚠️ Gradient clipping is inactive. With a learning rate of ' + lr + ', high-error sample tokens can spark sudden gradient spikes, causing parameters to overshoot.'
      });
    } else if (clip === '0.05') {
      alerts.push({
        type: 'warn',
        title: 'Excessive Trajectory Step Truncation',
        msg: '⚠️ Gradient clipping bound is set too tight (max_norm=0.05). This trims directional gradients too early, flattening optimization curves.'
      });
    }

    // Warmup checks
    if (warmup === 0 && lr >= 3e-4) {
      alerts.push({
        type: 'info',
        title: 'Volatile Warmup Lack',
        msg: 'ℹ️ Warmup is disabled. Standard training begins immediately at peak LR, which can trigger early variance shocks and destabilize initial weights.'
      });
    }

    // If no warning alerts, show success
    const warningCount = alerts.filter(a => a.type === 'warn').length;
    if (warningCount === 0) {
      alerts.unshift({
        type: 'optimal',
        title: 'Primal Parameter Blueprint Approved',
        msg: '🌟 Configuration is beautifully balanced! Adequate capacity (r=' + rank + '), stable steps (lr=' + lr + '), guardrails active (clip=' + clip + '), and proportional regularization.'
      });
    }

    return alerts;
  };

  const activeConceptObj = concepts.find(c => c.id === activeConceptId) || concepts[0];
  const activeIcon = activeConceptObj.icon;
  const analysisOutput = checkExperimentBalance();

  const handleRecommendPreset = (presetName: string) => {
    if (presetName === 'stable') {
      setLr(2e-4);
      setRank(16);
      setClip('1.0');
      setPrecision('bf16');
      setWarmup(10);
      setDecay(0.1);
    } else if (presetName === 'aggro') {
      setLr(1e-3);
      setRank(32);
      setClip('5.0');
      setPrecision('fp16-scaled');
      setWarmup(5);
      setDecay(0.01);
    } else if (presetName === 'under') {
      setLr(1e-5);
      setRank(2);
      setClip('0.05');
      setPrecision('fp16-unscaled');
      setWarmup(0);
      setDecay(0.0);
    }
  };

  return (
    <div id="lab-guide-main-view" className="space-y-6">
      {/* Intro Header banner */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#3E6335] p-5 rounded-r-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#3E6335]" />
            Lab Companion & Reference Advisor
          </h3>
          <p className="text-sm text-[#706F63] leading-relaxed">
            Gain diagnostic mastery over the core experimental modules. Review optimal parameters, standard schemas, and design custom configurations using our dynamic evaluation analyzer.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="bg-[#EAF2E8] border border-[#B2D8A6] px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium text-[#3E6335]">
            🧪 PyTorch 2.4 Specs
          </span>
          <span className="bg-[#FAF9F6] border border-[#E5E3D8] px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium text-[#55534C]">
            📋 HF PEFT 0.12 Compliant
          </span>
        </div>
      </div>

      {/* Main Grid: Guide on Left, Dynamic Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Concept Curriculum and Snippets */}
        <div className="lg:col-span-7 bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-5 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#E5E3D8] pb-3">
            <h4 className="font-serif text-[15px] font-bold text-[#33332D] flex items-center gap-2">
              <Code className="w-4.5 h-4.5 text-[#3E6335]" />
              Core Experimental Concepts Index
            </h4>
            <span className="text-[10px] font-mono text-[#706F63]">Click tabs to explore guidelines</span>
          </div>

          {/* Inline Navigation Tabs for Concepts */}
          <div className="flex flex-wrap gap-1.5">
            {concepts.map((concept) => {
              const IconComp = concept.icon;
              const isActive = concept.id === activeConceptId;
              return (
                <button
                  key={concept.id}
                  id={`guide-tab-${concept.id}`}
                  onClick={() => setActiveConceptId(concept.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-[#33332D] border-[#33332D] text-[#FAF9F6] shadow-sm'
                      : 'bg-white hover:bg-[#FAF8F3] border-[#E5E3D8] text-[#55534C]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {concept.title}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeConceptId}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Concept detail body */}
              <div className="bg-white border border-[#E5E3D8] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-[#3E6335] bg-[#EAF2E8] px-2 py-0.5 rounded border border-[#B2D8A6] inline-block">
                  {activeConceptObj.tagline}
                </span>
                <p className="text-xs text-[#55534C] leading-relaxed font-serif pt-1">
                  {activeConceptObj.whyItMatters}
                </p>
              </div>

              {/* Configurations & Naming Conventions Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Naming Conventions */}
                <div className="bg-[#FAF8F3] border border-[#E5E3D8] p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#8A9A5B] block border-b border-[#EFEDE4] pb-1">
                    🏷️ Standard Naming Keys
                  </span>
                  <div className="space-y-2">
                    {Object.entries(activeConceptObj.standardNaming).map(([key, desc]) => (
                      <div key={key} className="text-[11px] leading-relaxed font-sans">
                        <strong className="font-mono text-[#33332D] block text-[10.5px]">{key}</strong>
                        <span className="text-[#706F63]">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Golden Parameters Recommendations */}
                <div className="bg-[#FAF8F3] border border-[#E5E3D8] p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#D9A34A] block border-b border-[#EFEDE4] pb-1">
                    🛠️ Golden Configurations
                  </span>
                  <div className="space-y-2">
                    {Object.entries(activeConceptObj.recommendedConfigs).map(([key, desc]) => (
                      <div key={key} className="text-[11px] leading-relaxed font-sans">
                        <strong className="font-mono text-[#8B6424] block text-[10.5px]">{key}</strong>
                        <span className="text-[#706F63]">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Script code sample mock panel */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-[#706F63] block">
                  💻 Production Implementation Script Template:
                </span>
                <div className="bg-[#1E1E1E] text-slate-100 rounded-xl p-3.5 font-mono text-[11px] overflow-x-auto relative shadow-md">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeConceptObj.bestPracticeSnippet);
                    }}
                    className="absolute top-2.5 right-2 rounded bg-slate-800 text-slate-300 text-[10px] px-2.5 py-1 hover:bg-slate-700 font-bold transition-all cursor-pointer"
                  >
                    Copy Code
                  </button>
                  <pre className="no-scrollbar pt-2 whitespace-pre leading-relaxed font-mono">
                    {activeConceptObj.bestPracticeSnippet}
                  </pre>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Standard Lab Experiment checklist checkmarks */}
          <div className="border-t border-[#E5E3D8] pt-4.5 space-y-3">
            <h5 className="font-serif font-bold text-xs text-[#33332D]">
              Recommended Lab Learning Exercises Flow
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-sans">
              {[
                { label: 'Ex 1: Align adapter bottleneck matrix dimensions', desc: 'Experiment trace in the LoRA Math view.' },
                { label: 'Ex 2: Trigger Grad Clipping norm scaling', desc: 'Observe vectors shrink during gradient surges.' },
                { label: 'Ex 3: Evaluate FP16 underflow mitigation', desc: 'Play with dynamic grad values multipliers.' },
                { label: 'Ex 4: Monitor cold warmup stability bounds', desc: 'Trace linear learning curve trajectories.' },
                { label: 'Ex 5: Graph the train validation elbow split', desc: 'Discover overfit indicators on target epochs.' },
                { label: 'Ex 6: Test downstream inferences live', desc: 'Tweak target temp, top-p variables to test loops.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-[#E5E3D8] p-3 rounded-xl flex items-start gap-2.5 shadow-sm">
                  <span className="bg-[#EAF2E8] text-[#3E6335] rounded-full p-0.5 text-[10px] font-bold h-5 w-5 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-bold text-[#33332D] leading-tight">{item.label}</span>
                    <span className="block text-[10px] text-[#706F63]">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Interactive Experiment Configuration Simulator */}
        <div id="experiment-advisor-sandbox" className="lg:col-span-5 bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-5 shadow-sm space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#3E6335] bg-[#EAF2E8] px-2 py-0.5 rounded border border-[#B2D8A6] inline-block">
              Interactive Design Sandbox
            </span>
            <h4 className="font-serif text-[15px] font-bold text-[#33332D] flex items-center gap-1.5">
              <Sliders className="w-4.5 h-4.5 text-[#8A9A5B]" />
              Multi-Variable Configuration Sandbox
            </h4>
            <p className="text-xs text-[#706F63]">
              Configure your hyperparameter inputs below. The advisor updates dynamically with automated diagnostics and warnings.
            </p>
          </div>

          {/* Quick presets selectors */}
          <div className="bg-white border border-[#E5E3D8] p-3 rounded-lg flex items-center justify-between text-xs gap-1 flex-wrap">
            <span className="font-semibold text-[11px] text-[#55534C] font-mono">Load Lab Presets:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleRecommendPreset('stable')}
                className="bg-[#FAF8F3] hover:bg-[#EAF2E8] border border-[#E5E3D8] text-[10px] font-medium py-1 px-2.5 rounded-md text-[#33332D] transition-all cursor-pointer"
              >
                ✅ Optimal Stable
              </button>
              <button
                onClick={() => handleRecommendPreset('aggro')}
                className="bg-[#FAF8F3] hover:bg-[#FDF1D8] border border-[#E5E3D8] text-[10px] font-medium py-1 px-2.5 rounded-md text-[#33332D] transition-all cursor-pointer"
              >
                ⚡ Ultra Fast
              </button>
              <button
                onClick={() => handleRecommendPreset('under')}
                className="bg-[#FAF8F3] hover:bg-red-50 border border-[#E5E3D8] text-[10px] font-medium py-1 px-2.5 rounded-md text-[#33332D] transition-all cursor-pointer"
              >
                ⚠️ Underfit/NaN Test
              </button>
            </div>
          </div>

          {/* The Parameter Controls Form */}
          <div className="space-y-4 bg-white border border-[#E5E3D8] rounded-xl p-4 shadow-inner">
            {/* Learning Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-medium text-[#55534C]">Peak Learning Rate (lr)</span>
                <span className="font-mono bg-[#EFEDE4] px-1.5 py-0.2 rounded text-[11px] font-bold text-[#3E6335]">
                  {lr.toExponential(1)}
                </span>
              </div>
              <input
                id="sandbox-lr-input"
                type="range"
                min="0.00001"
                max="0.01"
                step="0.00005"
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="w-full accent-[#3E6335]"
              />
            </div>

            {/* Rank Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-medium text-[#55534C]">LoRA Bottleneck Rank (r)</span>
                <span className="font-mono bg-[#EFEDE4] px-1.5 py-0.2 rounded text-[11px] font-bold text-[#3E6335]">
                  r = {rank}
                </span>
              </div>
              <input
                id="sandbox-rank-input"
                type="range"
                min="2"
                max="64"
                step="2"
                value={rank}
                onChange={(e) => setRank(parseInt(e.target.value))}
                className="w-full accent-[#3E6335]"
              />
            </div>

            {/* Regularization (Weight Decay) Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-medium text-[#55534C]">Weight Decay Regularization</span>
                <span className="font-mono bg-[#EFEDE4] px-1.5 py-0.2 rounded text-[11px] font-bold text-[#3E6335]">
                  {decay}
                </span>
              </div>
              <input
                id="sandbox-decay-input"
                type="range"
                min="0.0"
                max="0.5"
                step="0.05"
                value={decay}
                onChange={(e) => setDecay(parseFloat(e.target.value))}
                className="w-full accent-[#3E6335]"
              />
            </div>

            {/* Grad Clipping dropdown selector */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5 font-mono text-[11px]">
                <label className="font-medium text-[#55534C] block">Grad clipping max_norm:</label>
                <select
                  id="sandbox-clip-select"
                  value={clip}
                  onChange={(e) => setClip(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#E5E3D8] rounded p-2 focus:outline-none"
                >
                  <option value="off">Off (Disabled)</option>
                  <option value="0.05">0.05 (Aggressive)</option>
                  <option value="1.0">1.0 (Standard)</option>
                  <option value="10.0">10.0 (Lenient)</option>
                </select>
              </div>

              {/* Precision selector */}
              <div className="space-y-1.5 font-mono text-[11px]">
                <label className="font-medium text-[#55534C] block">Floating Precision mode:</label>
                <select
                  id="sandbox-precision-select"
                  value={precision}
                  onChange={(e) => setPrecision(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#E5E3D8] rounded p-2 focus:outline-none"
                >
                  <option value="fp32">FP32 (Standard)</option>
                  <option value="fp11-unscaled">FP16 (No dynamic scaling)</option>
                  <option value="fp16-scaled">FP16 (GradScaler Dynamic)</option>
                  <option value="bf16">BF16 (Native Ampere)</option>
                </select>
              </div>
            </div>

            {/* Warmup input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono font-medium text-[#55534C]">Initial Optimizer Warmup Ratio</span>
                <span className="font-mono bg-[#EFEDE4] px-1.5 py-0.2 rounded text-[11px] font-bold text-[#3E6335]">
                  {warmup}% steps
                </span>
              </div>
              <input
                id="sandbox-warmup-input"
                type="range"
                min="0"
                max="20"
                step="5"
                value={warmup}
                onChange={(e) => setWarmup(parseInt(e.target.value))}
                className="w-full accent-[#3E6335]"
              />
            </div>
          </div>

          {/* Dynamic Advisor Output analysis container */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-mono font-bold text-[#55534C] block">
              📊 Advisor Diagnosis Report:
            </span>
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1 no-scrollbar-y">
              {analysisOutput.map((diag, idx) => (
                <div
                  key={idx}
                  className={`border p-3.5 rounded-xl text-xs space-y-1 leading-relaxed ${
                    diag.type === 'optimal'
                      ? 'bg-[#EAF2E8] border-[#B2D8A6] text-[#3E6335]'
                      : diag.type === 'info'
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-[#FDF1D8] border-[#EAD0A8] text-[#8B6424]'
                  }`}
                >
                  <span className="font-mono text-[10.5px] font-bold uppercase tracking-wide block">
                    {diag.title}
                  </span>
                  <p className="text-[11px]">{diag.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
