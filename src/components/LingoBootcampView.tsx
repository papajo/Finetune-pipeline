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
  Users,
  Layers,
  Cpu,
  Tv,
  ArrowRight,
  BookOpen,
  Infinity as InfoIcon,
  ShieldAlert,
  Dribbble
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

// Concept Mastery structures
interface LevelQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  proSpeakerTip: string;
}

interface ConceptQuiz {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  levels: {
    layperson: LevelQuestion;
    enthusiast: LevelQuestion;
    expert: LevelQuestion;
  };
}

export default function LingoBootcampView() {
  const [activeSubTab, setActiveSubTab] = useState<'toolkit' | 'matrix'>('toolkit');

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
      question: 'Your adapter performance shows an impressive reduction in downstream perplexity on clinical data. However, how did you ensure you didn\'t induce catastrophic forgetting of the base model\'s foundational alignment?',
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

  // Concept Quizzes at Different Levels (Layperson, Enthusiast, Expert)
  const conceptQuizzes: ConceptQuiz[] = [
    {
      id: 'lora',
      title: '🔢 LoRA Parameter Decoupling',
      subtitle: 'Understanding frozen weights and low-rank matrices A & B',
      icon: '🔢',
      levels: {
        layperson: {
          question: 'When describing Low-Rank Adaptation (LoRA) to an investor or non-technical user, which analogy is most appropriate?',
          options: [
            'It is like deleting half of the dictionary to make books load faster on laptops.',
            'It is like placing a transparent sketchpad template over a large, frozen architectural blueprint—altering only small details rather than redrafting the entire building from scratch.',
            'It acts like high-yield file compression (like a zip file) that shrinks deep models down to plain spreadsheets.'
          ],
          correctIndex: 1,
          explanation: 'LoRA leaves the huge multi-billion parameter base model locked ("frozen blueprint") and only teaches lightweight auxiliary adapter matrices ("trace paper overlay") representing custom skills.',
          proSpeakerTip: 'Use terms like "parameter-efficient alignment" and "lowering high-throughput operational expenditure" to capture both engineering and commercial authority.'
        },
        enthusiast: {
          question: 'How does the LoRA Rank parameter (r) control the dimensions and capacity of matrices A and B mathematically?',
          options: [
            'r defines the number of parallel GPU threads designated to handle weight division steps.',
            'r controls the inner bottleneck dimension. Matrices A and B have dimensions d×r and r×k. A higher r adds representation capacity, but increases parameter size and risk of overfitting.',
            'r is a secondary division factor that reduces training learning rates linearly as training advances.'
          ],
          correctIndex: 1,
          explanation: 'The weight update delta is factorized into matrices A and B of rank r. r is the shared bottleneck dimension; if r=8, matrices retain fewer trainable parameters than r=32.',
          proSpeakerTip: 'Quote: "We optimized the parameter footprint by scaling the inner bottleneck dimension r to establish structured trade-offs between validation loss and VRAM occupancy."'
        },
        expert: {
          question: 'What is the correct mathematical update equation applied to raw model weight representations inside a LoRA-equipped layer during a forward pass?',
          options: [
            'Y = W₀x + (α/r) * BAmul(x)',
            'Y = W₀(x) * (r/α) + BA(x)',
            'Y = (W₀ + BA)x * log(α / r)'
          ],
          correctIndex: 0,
          explanation: 'The output is the frozen weight dot product (W₀x) added to the adapter branch pass scaled by are constant multiplier (α/r) multiplied by BA weights (the low-rank product).',
          proSpeakerTip: 'Deliver this with precision: "By anchoring the learning trajectory using a static scaling ratio of alpha over rank, we decoupled weight updates from sensitivity to rank variations during hyperparameter exploration."'
        }
      }
    },
    {
      id: 'clipping',
      title: '⚡ Gradient Bounds & Norm Clipping',
      subtitle: 'Navigating optimization trajectories and non-convex curves',
      icon: '⚡',
      levels: {
        layperson: {
          question: 'Why in simple terms does a deep neural network training script require a "Gradient Clip"?',
          options: [
            'To cut off long sentences, forcing the AI to output very concise answers.',
            'Like a dynamic safety bumper on a bumper car, it prevents heavy sudden mathematical surges from knocking the trained model off the path and corrupting memory.',
            'To limit the GPU electric power consumption so it does not overheat.'
          ],
          correctIndex: 1,
          explanation: 'Without clipping, sudden spikes in error feedback calculations ("exploding gradients") trigger extreme changes in weights, immediately breaking the existing learned concepts.',
          proSpeakerTip: 'Describe it on stage as: "A key structural guardrail ensuring numerical optimization stability across highly chaotic error manifolds."'
        },
        enthusiast: {
          question: 'What is the principal benefit of computing global Gradient Norm (L2) clipping versus simple Gradient Value clipping?',
          options: [
            'Global L2 norm clipping scales all coordinate dimensions down proportionally, preserving gradient vector direction, while value clipping truncates coordinates independently, biasing the step direction.',
            'Value clipping is incredibly slow to compute on GPU Tensor cores compared to norm clipping.',
            'L2 norm clipping is only valid on bfloat16 models while value clipping requires float32.'
          ],
          correctIndex: 0,
          explanation: 'Norm clipping scale the global gradient vector down as a unit when its length exceeds a threshold. Value clipping cuts individual coordinate dimensions at static bounds, warping the gradient direction.',
          proSpeakerTip: 'Tell your audience: "We enforced structural gradient norm containment utilizing global L2 benchmarks to ensure mathematical directional integrity during high-loss curvature intervals."'
        },
        expert: {
          question: 'During Multi-GPU Distributed Data Parallel (DDP) iteration, how must the global gradient norm clip threshold be structured to ensure mathematical equivalence to single-GPU steps?',
          options: [
            'Each training node calculations its local norm independently and applies local scaling, ignoring other GPUs.',
            'An All-Reduce operation must aggregate the squared gradients across all model parameters and nodes, calculate the unified global L2 norm, and scale variables globally prior to local optimizer stepping.',
            'The learning rate is divided by the number of active GPU worker cards to bypass norm synchronization bottlenecks.'
          ],
          correctIndex: 1,
          explanation: 'Because a unified global norm is computed over public variables, all GPUs must communicate and synchronize using collective parallel structures (All-Reduce) before adjusting local optimizer states.',
          proSpeakerTip: 'Present it clearly: "By implementing a global All-Reduce synchronization on the L2 gradient accumulation across distinct nodes, we bypassed local step divergence and guaranteed deterministic training."'
        }
      }
    },
    {
      id: 'precision',
      title: '💻 Dual Precision & Loss Scaling',
      subtitle: 'Managing numeric limits inside FP16 / BF16 formats',
      icon: '💻',
      levels: {
        layperson: {
          question: 'What is the main user value of training a model using "Mixed Precision"?',
          options: [
            'It allows two people to train the same model simultaneously from different computers.',
            'It operates like sketching quick drafts with thick crayons (cheap half-precision math) and only using expensive narrow ink pens (FP32) for the master records, reducing memory and cutting time in half.',
            'It combines text and image training together so the AI understands charts.'
          ],
          correctIndex: 1,
          explanation: 'Heavy matrix multiplications are computed in faster 16-bit registers (FP16 or BF16) to leverage GPU acceleration, while sensitive calculations (parameters, loss metrics, optimizers) are held in resilient 32-bit float types.',
          proSpeakerTip: 'State: "Mixed precision doubles Tensor-core throughput and slashes our graphics card VRAM overhead by half with zero loss in training accuracy."'
        },
        enthusiast: {
          question: 'Why is Google/NVIDIA’s bfloat16 (BF16) format structural superior to standard FP16 for neural optimization?',
          options: [
            'BF16 allocates more bits to the mantissa, ensuring high spelling accuracy.',
            'BF16 shares the exact same exponent size (8 bits) as FP32, giving it the same dynamic range. This naturally avoids numeric underflow or overflow, bypassing the need for complex dynamic loss scale scripts.',
            'BF16 consumes exactly 8 bits of memory whereas FP16 consumes 16 bits.'
          ],
          correctIndex: 1,
          explanation: 'BF16 matches FP32 exponent limits, meaning values do not overflow easily. Standard FP16 exponent is smaller (5 bits), which regularly triggers numeric underflow without dynamic scaling helper rules.',
          proSpeakerTip: 'Mention: "By relying on native BF16 architectures, we eliminated dynamic loss scaler calibration, achieving pristine convergence paths with no underflow anomalies."'
        },
        expert: {
          question: 'How exactly does a Dynamic Loss Scaler function in FP16 contexts to resolve gradient underflow during backward passes?',
          options: [
            'It multiplies weights directly by 65,536 during model load times, then divides them during final inference cycles.',
            'The loss is multiplied by a scale factor S. Gradients are computed in FP16 safely shifted within dynamic limits. Prior to updating parameters, gradients are unscaled back (g/S). If an Inf/NaN gradient is recorded, the step is discarded, S is reduced, and the process continues.',
            'It matches learning rates to standard decay functions based entirely on backpropagation batch size limits.'
          ],
          correctIndex: 1,
          explanation: 'Gradient underflow happens when small gradient values land below standard FP16 limits (6.10e-5). Scaling the loss shifts derivatives up into range, then unscaling them before weights update ensures numerical correctness.',
          proSpeakerTip: 'Assert: "We countered numerical truncation in standard FP16 pipelines by wrapping backward computations in a dynamic loss scaling loop, actively monitoring CUDA flags for gradient overflow."'
        }
      }
    },
    {
      id: 'scheduler',
      title: '📈 LR Cycles & Warmup Schedules',
      subtitle: 'Smoothing convergence curves over multi-epoch runs',
      icon: '📈',
      levels: {
        layperson: {
          question: 'Why does an AI model benefit from a "Linear learning rate warmup" at the start of optimizer steps?',
          options: [
            'To warm up the physical computer fans so that chips do not struggle under initial load spikes.',
            'Like driving a heavy train slowly out of a busy station to prevent wheels from spinning, a warmup starts training with small steps to let initial parameters adapt before running at high speeds.',
            'To download the dataset into RAM over a split period.'
          ],
          correctIndex: 1,
          explanation: 'Warmup incrementally increases step scale. Because new adapter weights start near-zero and starting feedback calculations are highly volatile, safe initial steps keep training on track.',
          proSpeakerTip: 'Pitch it as: "An essential phase to navigate high initial variance and prevent early weight deterioration on highly skewed clinical sets."'
        },
        enthusiast: {
          question: 'What does a "Cosine Annealing" learning rate scheduler accomplish over training epochs?',
          options: [
            'It decays the step size smoothly down to near-zero along a cosine curve. This permits large early steps for fast discovery, and ultra-fine micro-adjustments as weights approach global minima.',
            'It dynamically fits validation loss curves directly onto a trigonometry graph.',
            'It forces the model token generation rate to cycle back and forth to keep attention blocks active.'
          ],
          correctIndex: 0,
          explanation: 'Decaying the learning rate along a cosine curve lets optimization stabilize as training moves to final epochs, allowing weights to settle within dense local minima.',
          proSpeakerTip: 'Say: "We implemented a Cosine Annealing decay profile to foster asymptotic convergence and prevent optimization trajectory bounce during terminal training iterations."'
        },
        expert: {
          question: 'In non-convex loss environments with high saddle point density, how does a cyclic cosine scheduler with warm-restarts improve model generalization?',
          options: [
            'Periodic learning rate spikes help the optimizer escape shallow, over-memorized local basins (saddle points), forcing exploration of broader, flatter minimums which generalize better to test validation splits.',
            'Warm-restarts recalculate the model attention registers using dynamic second-order Hessian estimations.',
            'By resetting training data shuffling parameters to default values whenever learning rate approaches zero.'
          ],
          correctIndex: 0,
          explanation: 'Cyclic spikes in learning rate shake the optimizer state out of narrow, overfit basins. Flat basins generalize better to unseen validations because slight test distribution shifts do not degrade predictions.',
          proSpeakerTip: 'Expound with power: "Employing cyclic cosine schedules with sharp warm-restarts enabled our gradient vectors to escape sub-optimal local basins, facilitating generalizable convergence on out-of-distribution holdouts."'
        }
      }
    },
    {
      id: 'split',
      title: '📊 Stratification & Loss Curves',
      subtitle: 'Evaluating generalizability and underfit boundaries',
      icon: '📊',
      levels: {
        layperson: {
          question: 'What is the danger of "Overfitting" when training a custom AI model?',
          options: [
            'The graphics card consumes too much physical space on server chassis grids.',
            'The model essentially memorizes the specific training questions card-by-card, scoring 100% on class exercises but failing to answer new questions it has not encountered before.',
            'The AI becomes too smart and refuses to respond to basic questions.'
          ],
          correctIndex: 1,
          explanation: 'Overfitting occurs when a neural model models training noise and quirks instead of generalized concepts. Holdout splits are critical diagnostic checks to test this.',
          proSpeakerTip: 'Explain: "Overfitting represents a degradation in generalization capacity where the model over-indexes on training sample distribution noise."'
        },
        enthusiast: {
          question: 'Why is a "Stratified" split crucial when separating highly unbalanced, specialized clinical datasets into train/validation blocks?',
          options: [
            'It splits files by exact text paragraph length to ensure training batch matrices remain perfectly squared.',
            'It ensures the exact same proportion of target labels (e.g. rare diseases vs normal notes) is represented in both splits, preventing validation metrics from being biased or unrepresentative.',
            'It forces all text data to undergo cryptographic hashing splits to protect patient privacy.'
          ],
          correctIndex: 1,
          explanation: 'A normal random split might put all rare positive disease vectors into the validation set, meaning the training set misses this knowledge entirely and scoring remains skewed.',
          proSpeakerTip: 'Describe as: "We enforced target label stratification across our data separation pipeline to maintain statistical consistency and isolate evaluation metrics."'
        },
        expert: {
          question: 'When analyzing training loss versus validation loss plots, what does a rising U-shape in the validation curve represent while training loss continues to sink near zero?',
          options: [
            'The dynamic loss scaler is experiencing underflow truncation.',
            'The model has entered the overfitting regime. The network is minimizing empirical risk on training samples by memorizing distribution-specific parameters, thereby losing entropy on unseen test distributions.',
            'The model is in an underfitted state and needs immediate scaling of learning rates.'
          ],
          correctIndex: 1,
          explanation: 'Rebounding validation loss indicates the model is separating further from general truth. It represents empirical risk alignment over generalization bounds, meaning the model is memorizing.',
          proSpeakerTip: 'Quote: "The validation loss curve exhibited a classic divergence path post-epoch 8, signifying empirical risk minimization overfitting, which prompted early-stopping intervention at the minimum validation elbow."'
        }
      }
    }
  ];

  // Soundboard Buzzword components
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

  // Concept quiz session variables
  const [selectedConcept, setSelectedConcept] = useState<ConceptQuiz>(conceptQuizzes[0]);
  const [activeDifficulty, setActiveDifficulty] = useState<'layperson' | 'enthusiast' | 'expert'>('layperson');
  const [userSelectedQuizOption, setUserSelectedQuizOption] = useState<number | null>(null);
  const [quizScores, setQuizScores] = useState<Record<string, { layperson?: boolean; enthusiast?: boolean; expert?: boolean }>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const handleSelectDrill = (optIdx: number) => {
    setSelectedDrillOption(optIdx);
    setCompletedDrills(prev => ({ ...prev, [String(drillQuestions[drillIndex].id)]: optIdx }));
  };

  const getDrillScoreSum = () => {
    const stageDrillPoints = Object.entries(completedDrills).reduce((acc, [qId, optIdx]) => {
      const q = drillQuestions.find(dq => dq.id === parseInt(qId));
      return acc + (q?.options[optIdx as number]?.score || 0);
    }, 0);

    // Add Concept Mastery Points (10 pts for each correct answer)
    let conceptPoints = 0;
    const scoresArray = Object.values(quizScores) as Array<{ layperson?: boolean; enthusiast?: boolean; expert?: boolean }>;
    scoresArray.forEach((levels) => {
      if (levels.layperson) conceptPoints += 10;
      if (levels.enthusiast) conceptPoints += 10;
      if (levels.expert) conceptPoints += 10;
    });

    return stageDrillPoints + conceptPoints;
  };

  const handleQuizAnswer = (optIndex: number, correctIdx: number) => {
    if (userSelectedQuizOption !== null) return;
    setUserSelectedQuizOption(optIndex);
    setShowExplanation(true);

    if (optIndex === correctIdx) {
      setQuizScores(prev => {
        const conceptScore = prev[selectedConcept.id] || {};
        return {
          ...prev,
          [selectedConcept.id]: {
            ...conceptScore,
            [activeDifficulty]: true
          }
        };
      });
    }
  };

  const currentQuestion: LevelQuestion = selectedConcept.levels[activeDifficulty];

  const totalPossiblePoints = (drillQuestions.length * 10) + (conceptQuizzes.length * 3 * 10);

  const generatedBuzzword = `${buzzPrefix} ${buzzRoot} ${buzzSuffix}`;

  const getBuzzwordDefinition = () => {
    return `An advanced design methodology that leverages ${buzzPrefix.toLowerCase()} parameters to coordinate a ${buzzRoot.toLowerCase()} mechanism, designed to optimize the ${buzzSuffix.toLowerCase()} during distributed training.`;
  };

  const getCompletedQuizCount = () => {
    let count = 0;
    const scoresArray = Object.values(quizScores) as Array<{ layperson?: boolean; enthusiast?: boolean; expert?: boolean }>;
    scoresArray.forEach((levels) => {
      if (levels.layperson) count++;
      if (levels.enthusiast) count++;
      if (levels.expert) count++;
    });
    return count;
  };

  return (
    <div id="lingo-bootcamp-view" className="space-y-6">
      {/* Header Panel */}
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
            <span className="font-bold text-[#3E6335] text-[13px]">{getDrillScoreSum()} / {totalPossiblePoints} Points</span>
          </div>
        </div>
      </div>

      {/* Sub tabs selector */}
      <div className="flex border-b border-[#E5E3D8] gap-1.5 pb-px">
        <button
          onClick={() => setActiveSubTab('toolkit')}
          className={`px-4 py-2.5 text-xs font-bold font-mono transition-all cursor-pointer rounded-t-lg border-t border-x ${
            activeSubTab === 'toolkit'
              ? 'bg-[#FAF9F6] border-[#E5E3D8] text-[#33332D] border-b-[#FAF9F6] mb-[-1px]'
              : 'border-transparent text-[#706F63] hover:text-[#33332D]'
          }`}
        >
          🎙️ Stage Speech & Q&A Toolkit
        </button>
        <button
          onClick={() => {
            setActiveSubTab('matrix');
            // reset quiz state
            setUserSelectedQuizOption(null);
            setShowExplanation(false);
          }}
          className={`px-4 py-2.5 text-xs font-bold font-mono transition-all cursor-pointer rounded-t-lg border-t border-x flex items-center gap-1.5 ${
            activeSubTab === 'matrix'
              ? 'bg-[#FAF9F6] border-[#E5E3D8] text-[#33332D] border-b-[#FAF9F6] mb-[-1px]'
              : 'border-transparent text-[#706F63] hover:text-[#33332D]'
          }`}
        >
          🧠 Multi-Level Concept Quiz Matrix
          {getCompletedQuizCount() > 0 && (
            <span className="bg-[#3E6335] text-white text-[9px] px-1.5 py-0.2 rounded-full font-sans">
              {getCompletedQuizCount()} Passed
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'toolkit' ? (
        <>
          {/* TAB 1: Toolkit layout */}
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
                <div className="bg-white border border-[#E5E3D8] rounded-xl p-4 flex flex-col justify-between min-h-[140px] shadow-inner font-sans">
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
                <div className="bg-[#EAF2E8]/40 border border-[#B2D8A6] rounded-xl p-4 flex flex-col justify-between min-h-[140px] shadow-sm font-sans">
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
              <div className="space-y-1 flex-1 font-sans">
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
        </>
      ) : (
        /* TAB 2: Multi-Level Concept Quiz Matrix */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lft sidebar selector for Concept topics */}
          <div className="lg:col-span-4 bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-4 space-y-3.5 shadow-sm">
            <div>
              <span className="text-[9px] font-mono font-bold bg-[#EFEDE4] px-1.5 py-0.5 rounded text-gray-500 uppercase">
                Choose Laboratory core topic
              </span>
              <h4 className="font-serif font-bold text-sm text-[#33332D] mt-1.5">
                Targeted Concept Quizzes
              </h4>
            </div>

            <div className="space-y-2">
              {conceptQuizzes.map((quiz) => {
                const quizScore = quizScores[quiz.id] || {};
                const completedLevelsCount = [quizScore.layperson, quizScore.enthusiast, quizScore.expert].filter(Boolean).length;

                return (
                  <button
                    key={quiz.id}
                    id={`concept-quiz-${quiz.id}`}
                    onClick={() => {
                      setSelectedConcept(quiz);
                      setUserSelectedQuizOption(null);
                      setShowExplanation(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer flex flex-col gap-1.5 ${
                      selectedConcept.id === quiz.id
                        ? 'bg-[#33332D] border-[#33332D] text-[#FAF9F6] shadow-md'
                        : 'bg-white border-[#E5E3D8] hover:bg-[#FAF8F3] text-[#55534C]'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold flex items-center gap-1">
                        {quiz.title}
                      </span>
                      {completedLevelsCount === 3 ? (
                        <span className="text-[10px] font-mono text-[#4ade80] font-bold">★ Mastered</span>
                      ) : (
                        <span className="text-[9px] font-mono opacity-80">
                          {completedLevelsCount}/3 Cleared
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] leading-snug truncate block ${selectedConcept.id === quiz.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {quiz.subtitle}
                    </span>

                    {/* Progress indicators */}
                    <div className="flex gap-1 pt-1 border-t border-dashed border-gray-200/50">
                      <span className={`w-2 h-2 rounded-full ${quizScore.layperson ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <span className={`w-2 h-2 rounded-full ${quizScore.enthusiast ? 'bg-amber-400' : 'bg-gray-200'}`} />
                      <span className={`w-2 h-2 rounded-full ${quizScore.expert ? 'bg-red-500' : 'bg-gray-200'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E5E3D8]">
              <span className="text-[10px] font-mono text-amber-800 font-bold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                Bootcamp Objective:
              </span>
              <p className="text-[10px] text-amber-900 leading-relaxed mt-1">
                Clear all 15 targeted multi-level quizzes to fully master the vocabulary required for competitive research events.
              </p>
            </div>
          </div>

          {/* Right column active quiz workspace */}
          <div className="lg:col-span-8 bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-5 space-y-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#EFEDE4] pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-[#3E6335] font-bold tracking-wide">
                  Active Question Space
                </span>
                <h3 className="font-serif font-bold text-[17px] text-[#33332D]">
                  {selectedConcept.title}
                </h3>
              </div>

              {/* Difficulty level selector badges */}
              <div className="flex gap-1 bg-[#EFEDE4]/60 p-1 rounded-lg border border-[#D5D3C7]">
                {(['layperson', 'enthusiast', 'expert'] as const).map((difficulty) => {
                  const isDifficultyActive = activeDifficulty === difficulty;
                  const isCorrect = !!(quizScores[selectedConcept.id]?.[difficulty]);
                  
                  let colorClass = 'text-gray-500 hover:text-[#33332D]';
                  if (isDifficultyActive) {
                    colorClass = difficulty === 'layperson'
                      ? 'bg-green-600 text-white font-bold'
                      : difficulty === 'enthusiast'
                      ? 'bg-amber-500 text-white font-bold'
                      : 'bg-red-600 text-white font-bold';
                  }

                  return (
                    <button
                      key={difficulty}
                      id={`diff-btn-${difficulty}`}
                      onClick={() => {
                        setActiveDifficulty(difficulty);
                        setUserSelectedQuizOption(null);
                        setShowExplanation(false);
                      }}
                      className={`px-3 py-1 text-[10px] rounded-md font-mono uppercase tracking-wide cursor-pointer flex items-center gap-1 ${colorClass}`}
                    >
                      {difficulty}
                      {isCorrect && <CheckCircle className="w-2.5 h-2.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* The Question Card body */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#E5E3D8] shadow-inner space-y-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#706F63]">
                  <HelpCircle className="w-4 h-4 text-[#8A9A5B]" />
                  <span>Topic: {selectedConcept.subtitle}</span>
                </div>
                <p className="text-sm font-serif font-bold text-[#33332D] leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Option Radio elements */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, oIdx) => {
                  const isSelected = userSelectedQuizOption === oIdx;
                  const isCorrectAnswer = oIdx === currentQuestion.correctIndex;
                  const hasAnswered = userSelectedQuizOption !== null;

                  let optStyle = 'border-[#E5E3D8] bg-white hover:bg-[#FAF8F3] text-[#33332D]';
                  if (hasAnswered) {
                    if (isCorrectAnswer) {
                      optStyle = 'border-[#3E6335] bg-[#EAF2E8] text-[#3E6335] font-semibold';
                    } else if (isSelected) {
                      optStyle = 'border-red-400 bg-[#FDF2F2] text-red-700 font-semibold';
                    } else {
                      optStyle = 'border-gray-100 bg-white opacity-40 cursor-not-allowed';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      id={`concept-opt-${oIdx}`}
                      onClick={() => handleQuizAnswer(oIdx, currentQuestion.correctIndex)}
                      disabled={hasAnswered}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs leading-relaxed transition-all cursor-pointer flex gap-3 items-start outline-none ${optStyle}`}
                    >
                      <span className="font-mono font-bold w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0 bg-gray-50 text-[10px] text-gray-500">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <p className="text-xs pt-0.5">{option}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Feedback & Slides speaker Dialect guidance */}
            <AnimatePresence>
              {showExplanation && userSelectedQuizOption !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 border-t border-[#EFEDE4] pt-4"
                >
                  {/* Banner state */}
                  <div className={`p-4 rounded-xl border flex gap-3 ${
                    userSelectedQuizOption === currentQuestion.correctIndex
                      ? 'bg-[#EAF2E8] border-[#B2D8A6] text-[#3E6335]'
                      : 'bg-[#FDF2F2] border-[#F8B4B4] text-red-700'
                  }`}>
                    {userSelectedQuizOption === currentQuestion.correctIndex ? (
                      <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1">
                      <strong className="text-xs font-serif block">
                        {userSelectedQuizOption === currentQuestion.correctIndex 
                          ? '🎉 Correct Response! You nailed the specialized term vocabulary.' 
                          : '⚠️ Discrepancy registered in answer dialect.'
                        }
                      </strong>
                      <p className="text-xs leading-relaxed text-[#55534C]">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Pro speaker slide dialect advice */}
                  <div className="bg-[#FAF6EE] border border-[#EAD0A8] p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D9A34A]" />
                      Conference Slide Pro Tip (Elite Speaker formulation)
                    </span>
                    <p className="text-xs font-mono font-medium text-amber-950 leading-relaxed bg-white border border-[#F5EFE3] p-3 rounded-lg italic">
                      "{currentQuestion.proSpeakerTip}"
                    </p>
                    <p className="text-[10px] text-amber-800 italic">
                      Use this statement verbatim to immediately command authority from the review panels.
                    </p>
                  </div>

                  {/* Flow control tools */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-mono text-gray-400">
                      Concept: {selectedConcept.id.toUpperCase()} • Diff: {activeDifficulty.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {
                        // find next unfinished difficulty or next concept
                        const currentQuizScore = quizScores[selectedConcept.id] || {};
                        if (!currentQuizScore.layperson) {
                          setActiveDifficulty('layperson');
                        } else if (!currentQuizScore.enthusiast) {
                          setActiveDifficulty('enthusiast');
                        } else if (!currentQuizScore.expert) {
                          setActiveDifficulty('expert');
                        } else {
                          // select next concept
                          const currentIndex = conceptQuizzes.findIndex(c => c.id === selectedConcept.id);
                          const nextIndex = (currentIndex + 1) % conceptQuizzes.length;
                          setSelectedConcept(conceptQuizzes[nextIndex]);
                          setActiveDifficulty('layperson');
                        }
                        setUserSelectedQuizOption(null);
                        setShowExplanation(false);
                      }}
                      className="bg-[#33332D] hover:bg-[#55534C] text-[#FAF9F6] font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:translate-x-0.5"
                    >
                      Next Core Drill <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

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
