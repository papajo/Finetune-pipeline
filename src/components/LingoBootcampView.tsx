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
    layperson: LevelQuestion[];
    enthusiast: LevelQuestion[];
    expert: LevelQuestion[];
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
  // Concept Quizzes at Different Levels (Layperson, Enthusiast, Expert)
  const conceptQuizzes: ConceptQuiz[] = [
    {
      id: 'lora',
      title: '🔢 LoRA Parameter Decoupling',
      subtitle: 'Understanding frozen weights and low-rank matrices A & B',
      icon: '🔢',
      levels: {
        layperson: [
          {
            question: 'What is LoRA mainly trying to do?',
            options: [
              'Make the model bigger',
              'Train only a small part of the model',
              'Delete old training data',
              'Increase the number of layers'
            ],
            correctIndex: 1,
            explanation: 'Low-Rank Adaptation (LoRA) freezes the pre-trained weights and adds small trainable rank decomposition layers.',
            proSpeakerTip: 'We bypass full-parameter registration by introducing factorized weight delta pathways.'
          },
          {
            question: 'Why is LoRA useful?',
            options: [
              'It makes training slower',
              'It helps train models with fewer resources',
              'It removes the need for data',
              'It prevents the model from generating text'
            ],
            correctIndex: 1,
            explanation: 'LoRA slashes trainable parameters and reduces optimizer states memory footprint (VRAM) by up to 99%.',
            proSpeakerTip: 'This enables localized model optimization on commodity graphics cards.'
          }
        ],
        enthusiast: [
          {
            question: 'In LoRA, what happens to the original model weights?',
            options: [
              'They are rewritten every step',
              'They are usually frozen',
              'They are removed',
              'They are doubled'
            ],
            correctIndex: 1,
            explanation: 'The pre-trained base model backbone parameters are kept frozen to lock in general knowledge and prevent catastrophic forgetting.',
            proSpeakerTip: 'We preserve general pre-trained parameters in frozen states while isolating adaptation delta weights.'
          },
          {
            question: 'What do the low-rank matrices in LoRA learn?',
            options: [
              'A full replacement for the model',
              'A small update to the original weights',
              'The tokenizer rules',
              'The validation split'
            ],
            correctIndex: 1,
            explanation: 'Matrices A and B learn a low-rank delta update (ΔW) which is scaled and added to the original weights during execution.',
            proSpeakerTip: 'The low-rank matrices product approximates the true full-rank optimization updates gradient delta.'
          },
          {
            question: 'What does the rank r control?',
            options: [
              'How many layers exist in the model',
              'The size/capacity of the LoRA adapter',
              'The batch size',
              'The optimizer type'
            ],
            correctIndex: 1,
            explanation: 'Rank r determines the inner bottleneck dimension of the adaptor matrices, regulating capacity and memory.',
            proSpeakerTip: 'We balance rank r to establish a robust trade-off between validation loss convergence and matrix VRAM occupancy.'
          }
        ],
        expert: [
          {
            question: 'Why is LoRA often described as a low-rank reparameterization?',
            options: [
              'It changes attention masks only',
              'It constrains the weight update to lie in a low-dimensional subspace',
              'It eliminates the base model’s linear layers',
              'It replaces optimization with inference-time heuristics'
            ],
            correctIndex: 1,
            explanation: 'LoRA exploits the hypothesis that weight change matrices live on a lower intrinsic dimension, parameterizing updates via active bottlenecks.',
            proSpeakerTip: 'This structural constraint enforces target regularization, preventing high-rank noise memorization.'
          },
          {
            question: 'What is the practical effect of freezing the backbone and training only LoRA parameters?',
            options: [
              'It increases the full-rank optimization cost',
              'It reduces trainable parameter count and memory footprint',
              'It prevents gradient flow entirely',
              'It changes tokenization behavior'
            ],
            correctIndex: 1,
            explanation: 'Freezing backbone layers bypasses storing 1st and 2nd optimizer momentum configurations (such as in AdamW) for unselected weights, massively capping footprint.',
            proSpeakerTip: 'Decoupling optimizer states through selective param freezes optimizes global storage throughput.'
          }
        ]
      }
    },
    {
      id: 'clipping',
      title: '⚡ Gradient Bounds & Norm Clipping',
      subtitle: 'Managing optimization stability and non-convex curves',
      icon: '⚡',
      levels: {
        layperson: [
          {
            question: 'What does gradient clipping do?',
            options: [
              'Makes gradients disappear completely',
              'Prevents updates from getting too large',
              'Adds more data',
              'Speeds up tokenization'
            ],
            correctIndex: 1,
            explanation: 'Gradient clipping restricts step updates to a specified max boundary to prevent extreme mathematical surges.',
            proSpeakerTip: 'Enforce L2 norm bounds to limit volatile step deviations under sudden error-signal surges.'
          },
          {
            question: 'Why is it useful?',
            options: [
              'It helps keep training stable',
              'It makes the model smaller',
              'It removes the optimizer',
              'It turns off validation'
            ],
            correctIndex: 0,
            explanation: 'It shields model parameters from exploding weight variance which would immediately corrupt previously learned knowledge.',
            proSpeakerTip: 'A vital defensive optimization metric to ensure convergent trajectories across non-convex loss surfaces.'
          }
        ],
        enthusiast: [
          {
            question: 'When should gradient clipping usually happen?',
            options: [
              'Before forward pass',
              'After backward pass, before optimizer step',
              'After saving the model',
              'Before loading data'
            ],
            correctIndex: 1,
            explanation: 'Gradient calculations happen during backward pass, so we must inspect and clip values right after backprop and prior to updating weights.',
            proSpeakerTip: 'Apply norm clipping immediately post-backward pass, aligning the unscaled vector before the step call.'
          },
          {
            question: 'What problem does gradient clipping help prevent?',
            options: [
              'Vanishing inputs',
              'Exploding gradients',
              'Token mismatch',
              'Overfitting always'
            ],
            correctIndex: 1,
            explanation: 'In deep networks, backpropagated gradients can multiply exponentially, triggering NaN weights. Clipping caps the total magnitude.',
            proSpeakerTip: 'Clipping mitigates gradient explosion risk across deep recurrence or attention chains.'
          },
          {
            question: 'In FP16 training, what extra step is needed before clipping?',
            options: [
              'Resize the dataset',
              'Unscale gradients',
              'Rebuild the model',
              'Lower the batch size'
            ],
            correctIndex: 1,
            explanation: 'Because standard mixed-precision multiplies loss to stay in bounds, gradients are scaled and must be returned to true magnitudes before correct clipping calculation.',
            proSpeakerTip: 'Unscale gradients from the GradScaler context prior to norm evaluations to yield accurate clipping thresholds.'
          }
        ],
        expert: [
          {
            question: 'Why must gradients be unscaled before norm clipping in AMP FP16 training?',
            options: [
              'To preserve optimizer momentum only',
              'Because clipping thresholds are defined on true gradient magnitudes, not scaled values',
              'To avoid modifying the loss function',
              'Because the scheduler requires it'
            ],
            correctIndex: 1,
            explanation: 'If clipping is run on scaled gradients, the effective thresholds are shifted artificially high, triggering severe over-clipping and ruining step accuracy.',
            proSpeakerTip: 'Executing clipping directly on scaled variables is completely invalid, because scaling magnitudes misalign the threshold boundaries.'
          },
          {
            question: 'What is the main tradeoff of aggressive gradient clipping?',
            options: [
              'It always improves convergence',
              'It may stabilize training but distort the true update direction/magnitude',
              'It eliminates the need for backprop',
              'It increases model depth'
            ],
            correctIndex: 1,
            explanation: 'Setting clip limits too small trims structural updates too early, distorting step vectors and flattening or stalling the convergence path.',
            proSpeakerTip: 'Ensure max_norm bounds remain loose enough to restrict catastrophic surges without dampening critical update direction details.'
          }
        ]
      }
    },
    {
      id: 'precision',
      title: '💻 Mixed Precision Computing',
      subtitle: 'Managing numeric limits inside FP16 / BF16 formats',
      icon: '💻',
      levels: {
        layperson: [
          {
            question: 'Why use mixed precision?',
            options: [
              'To make training faster and use less memory',
              'To change the dataset',
              'To remove the need for a GPU',
              'To increase the vocabulary size'
            ],
            correctIndex: 0,
            explanation: 'Using lower precision formats (16-bit instead of 32-bit) speeds up computations and reduces active VRAM requirements.',
            proSpeakerTip: 'We accelerate matrix multiplication throughput on GPU tensor registers with excellent memory optimization ratios.'
          },
          {
            question: 'What are common mixed precision types?',
            options: [
              'JPG and PNG',
              'FP16 and BF16',
              'CSV and JSON',
              'SGD and Adam'
            ],
            correctIndex: 1,
            explanation: 'Semi-precision formats like Float16 and Brain Float 16 represent the industry standards for neural network hardware calculations.',
            proSpeakerTip: 'Both formats represent custom 16-bit floating point implementations optimized for high-acceleration matrix processing.'
          }
        ],
        enthusiast: [
          {
            question: 'Which mixed precision mode usually needs GradScaler?',
            options: [
              'BF16',
              'FP16',
              'Float64',
              'Int8'
            ],
            correctIndex: 1,
            explanation: 'FP16 has a narrow dynamic range. Low-magnitude gradients easily underflow, registering as pure zeros, so a Loss Scaler is required.',
            proSpeakerTip: 'GradScaler is essential in FP16 pipelines to counter dynamic representation underflow.'
          },
          {
            question: 'What does autocast do?',
            options: [
              'Automatically saves checkpoints',
              'Runs selected operations in lower precision',
              'Converts labels to integers',
              'Clips gradients'
            ],
            correctIndex: 1,
            explanation: 'Autocast routes specific layers (matrix multiplication) through ultra-fast 16-bit execution while keeping sensitive operations (loss, normalization) in Float32.',
            proSpeakerTip: 'We rely on autocast to selectively apply reduced precision matrices without sacrificing global numerical correctness.'
          },
          {
            question: 'Why is BF16 often more stable than FP16?',
            options: [
              'It has a larger exponent range',
              'It uses less memory than zero',
              'It removes all rounding',
              'It disables backprop'
            ],
            correctIndex: 0,
            explanation: 'BF16 allocates 8 bits to the exponent (matching FP32 range), eliminating underflow/overflow risks without requiring loss scalers.',
            proSpeakerTip: 'By inheriting FP32 exponent parameters, BF16 guarantees native convergence stability.'
          }
        ],
        expert: [
          {
            question: 'What is the main numerical advantage of BF16 over FP16?',
            options: [
              'Larger mantissa',
              'Larger exponent range, improving dynamic range',
              'Exact arithmetic',
              'No need for matrix multiplication'
            ],
            correctIndex: 1,
            explanation: 'While FP16 limits high-magnitude steps, BF16 mirrors FP32 exponent scale (8-bit), perfectly capturing wide parameter updates.',
            proSpeakerTip: 'BF16 trade-offs relative mantissa precision to maintain wide dynamic range parameters natively.'
          },
          {
            question: 'In AMP FP16 training, why is dynamic loss scaling used?',
            options: [
              'To increase batch size directly',
              'To reduce gradient underflow risk during backpropagation',
              'To avoid using CUDA',
              'To make validation faster'
            ],
            correctIndex: 1,
            explanation: 'Dynamic loss scaling multiplies active loss prior to backward passes, moving fractional updates up to land above FP16 representational minimum limits.',
            proSpeakerTip: 'Scaling prevents micro-gradients from rounding down to zero during chain-rule calculations.'
          },
          {
            question: 'What is a correct inference about autocast?',
            options: [
              'It changes model architecture permanently',
              'It selectively casts ops to reduced precision while preserving numerically sensitive ops in higher precision',
              'It replaces the optimizer',
              'It disables training mode'
            ],
            correctIndex: 1,
            explanation: 'Autocast runs linear/attention weights in FP16 or BF16 for speed, but executes stable non-linear calculations (Softmax, layer norm) in absolute FP32.',
            proSpeakerTip: 'Autocast leverages hybrid representation paths, ensuring performance speedups with no numerical regression.'
          }
        ]
      }
    },
    {
      id: 'scheduler',
      title: '📈 LR Cycles & Warmup Schedules',
      subtitle: 'Smoothing convergence curves over multi-epoch runs',
      icon: '📈',
      levels: {
        layperson: [
          {
            question: 'What does a learning-rate scheduler do?',
            options: [
              'It changes how fast the model learns over time',
              'It creates more data',
              'It changes the number of labels',
              'It deletes the loss function'
            ],
            correctIndex: 0,
            explanation: 'A scheduler dynamically adjusts the optimizer step size (learning rate) as the training steps proceed.',
            proSpeakerTip: 'It coordinates optimizer step velocity across training epochs to optimize convergent steps.'
          },
          {
            question: 'Why might you lower the learning rate later in training?',
            options: [
              'To help the model fine-tune more carefully',
              'To make the dataset smaller',
              'To stop training completely',
              'To reduce vocabulary size'
            ],
            correctIndex: 0,
            explanation: 'Lowering step speed towards late epochs lets weights settle closely and precisely into narrow local minima.',
            proSpeakerTip: 'Minimizing learning rate values near late stages promotes fine-grain parameter refinement.'
          }
        ],
        enthusiast: [
          {
            question: 'What’s the difference between linear and cosine decay?',
            options: [
              'Linear is constant; cosine oscillates smoothly downward',
              'Linear decays in a straight line; cosine decays smoothly following a cosine curve',
              'They are identical',
              'Cosine increases the LR forever'
            ],
            correctIndex: 1,
            explanation: 'Linear decay reduces step-size in a rigid static line. Cosine decay curves down in an S-curve, preserving discovery time before easing to terminal bounds.',
            proSpeakerTip: 'Cosine decay tracks half-cycle harmonic patterns to guarantee a highly civilized, smooth descent path.'
          },
          {
            question: 'When do you usually call scheduler.step()?',
            options: [
              'Before loading the model',
              'After the optimizer step, at the chosen cadence',
              'Before the forward pass',
              'Only during validation'
            ],
            correctIndex: 1,
            explanation: 'Step size transformations are updated based on optimization steps completed, requiring step calls right after the weights update.',
            proSpeakerTip: 'Synchronize scheduler steps following optimizer updates to ensure coordinate paces align precisely.'
          },
          {
            question: 'What does eta_min mean in cosine annealing?',
            options: [
              'The smallest learning rate the scheduler will reach',
              'The batch size',
              'The number of epochs',
              'The momentum value'
            ],
            correctIndex: 0,
            explanation: 'eta_min defines the bounding lower floor value for the learning rate schedule, preventing step size from dropping entirely to absolute zero.',
            proSpeakerTip: 'By bounding decay to eta_min, optimizer steps actively converge without completely stalling updates.'
          }
        ],
        expert: [
          {
            question: 'Why can decaying the learning rate improve late-stage optimization?',
            options: [
              'It increases gradient variance',
              'It allows coarse exploration early and finer parameter refinement later',
              'It removes the need for initialization',
              'It guarantees zero loss'
            ],
            correctIndex: 1,
            explanation: 'High early learning rates help weights escape volatile poor minima. Small late rates allow precise, narrow step updates adjacent to global targets.',
            proSpeakerTip: 'This trajectory structure matches structural optimization schedules to multi-stage convex convergence states.'
          },
          {
            question: 'What is a common caution when using per-batch schedulers?',
            options: [
              'They cannot be used with GPUs',
              'Their total step count must match the number of optimizer updates',
              'They work only for validation loss',
              'They require batch norm layers'
            ],
            correctIndex: 1,
            explanation: 'Per-batch schedulers shift rates at every iteration. If step arrays are defined for total epochs instead, rates decay far too early.',
            proSpeakerTip: 'We verify that steps-per-epoch iterations are correctly multiplied to construct uniform scheduler curves.'
          }
        ]
      }
    },
    {
      id: 'split',
      title: '📊 Stratification & Loss Curves',
      subtitle: 'Evaluating generalizability and underfit boundaries',
      icon: '📊',
      levels: {
        layperson: [
          {
            question: 'Why do we keep some data aside for validation?',
            options: [
              'To check how well the model handles new data',
              'To make training faster',
              'To reduce model size',
              'To improve tokenization'
            ],
            correctIndex: 0,
            explanation: 'Validation datasets evaluate if the model captures core concepts or simply memorized existing samples.',
            proSpeakerTip: 'It serves as an unbiased proxy for out-of-distribution generalizability.'
          },
          {
            question: 'What does overfitting mean?',
            options: [
              'The model does well on training data but poorly on new data',
              'The model stops learning',
              'The model uses too much memory',
              'The optimizer is broken'
            ],
            correctIndex: 0,
            explanation: 'Overtrained model weights replicate trivial patterns in the training samples, matching training targets while failing new tests.',
            proSpeakerTip: 'Overfitting represents parameter customization targeting local noise over generalized latent spaces.'
          }
        ],
        enthusiast: [
          {
            question: 'What mode should the model be in during validation?',
            options: [
              'train()',
              'eval()',
              'compile()',
              'freeze()'
            ],
            correctIndex: 1,
            explanation: 'Calling model.eval() switches off training variables, locking layers like dropout and batch normalization to make predictions consistent.',
            proSpeakerTip: 'Set evaluation states to ensure stable, deterministic parameter response metrics.'
          },
          {
            question: 'Why use torch.no_grad() during validation?',
            options: [
              'To make gradients larger',
              'To save memory and avoid building backward graphs',
              'To increase loss',
              'To update the scheduler automatically'
            ],
            correctIndex: 1,
            explanation: 'During validation we do not update weights or calculate derivatives. Disabling gradient tracking bypasses allocating temporary training matrices in VRAM.',
            proSpeakerTip: 'Inhibiting gradient trace compilation caps memory overhead and accelerates validation throughput.'
          },
          {
            question: 'What’s a sign of overfitting?',
            options: [
              'Training and validation losses both decrease',
              'Training loss decreases while validation loss rises',
              'Validation loss is always zero',
              'The model has fewer parameters'
            ],
            correctIndex: 1,
            explanation: 'When training loss decreases but validation loss increases, the model has begun memorizing local noise rather than generalizing.',
            proSpeakerTip: 'This divergence marks the optimal elbow boundary for trigger and intervention models like early stopping.'
          }
        ],
        expert: [
          {
            question: 'Why is a held-out validation set critical in model selection?',
            options: [
              'It guarantees generalization',
              'It provides an unbiased proxy for out-of-sample performance during hyperparameter tuning',
              'It increases training throughput',
              'It replaces test data entirely'
            ],
            correctIndex: 1,
            explanation: 'A held-out dataset guards optimization loops from parameter over-tuning, verifying general performance on unseen targets.',
            proSpeakerTip: 'Evaluating against isolated validation splits isolates model selection from empirical parameter bias.'
          },
          {
            question: 'Why must stochastic training-time behaviors be disabled during validation?',
            options: [
              'To ensure the optimizer is faster',
              'To reduce evaluation variance and obtain deterministic-ish performance estimates',
              'To improve tokenization',
              'To increase GPU temperature'
            ],
            correctIndex: 1,
            explanation: 'Stochastic behaviors (like Dropout randomized drop masks) introduce severe random noise. Disabling them returns uniform, reliable validation checks.',
            proSpeakerTip: 'Deactivating random masks stabilizes predictions, guaranteeing accurate measurement of training states.'
          }
        ]
      }
    },
    {
      id: 'app_workflow',
      title: '🏗️ Building a Training App',
      subtitle: 'Managing background jobs and model validation states',
      icon: '🏗️',
      levels: {
        layperson: [
          {
            question: 'What is the app’s job?',
            options: [
              'Let users set training options and start a training run',
              'Replace the model with a spreadsheet',
              'Remove the need for data',
              'Make the GPU disappear'
            ],
            correctIndex: 0,
            explanation: 'A training application serves as a control cockpit, enabling hyperparameter configuration, training execution, and metric visibility.',
            proSpeakerTip: 'It bridges raw execution logs into highly structured, diagnostic visualizer boards.'
          },
          {
            question: 'Why should training run in the background?',
            options: [
              'So the website doesn’t freeze while training',
              'So the model trains less',
              'So no one can see logs',
              'So the UI can’t update'
            ],
            correctIndex: 0,
            explanation: 'Deep learning steps are computationally heavy and long-lived. Executing training tasks asynchronously prevents blocking UI interaction.',
            proSpeakerTip: 'Oversight threads must run asynchronously to maintain server-interface responsiveness during extreme training epochs.'
          }
        ],
        enthusiast: [
          {
            question: 'What’s a good backend framework for this kind of app?',
            options: [
              'FastAPI',
              'CSS',
              'Excel',
              'Markdown'
            ],
            correctIndex: 0,
            explanation: 'FastAPI is a modern, high-speed Python backend web framework suited for managing task endpoints and streaming JSON responses.',
            proSpeakerTip: 'Python web architectures maximize model orchestration speed through clean async task hooks.'
          },
          {
            question: 'Why use a job queue or worker?',
            options: [
              'To make the UI prettier',
              'To run long training tasks asynchronously',
              'To remove the API server',
              'To reduce dataset size'
            ],
            correctIndex: 1,
            explanation: 'Workers (e.g. Celery or Redis Task Queues) retrieve and process long tasks outside the main API thread, managing concurrency and faults.',
            proSpeakerTip: 'Asynchronous workers isolate system threads to handle long-running model executions reliably.'
          },
          {
            question: 'What should the UI show during training?',
            options: [
              'Only the final model',
              'Logs, losses, progress, and validation metrics',
              'Just the dataset name',
              'Nothing'
            ],
            correctIndex: 1,
            explanation: 'Providing real-time updates of loss graphs, validation errors, and raw server logs is crucial for immediate diagnostic oversight.',
            proSpeakerTip: 'Expose live stream metadata vectors to empower early termination analysis during training anomalies.'
          }
        ],
        expert: [
          {
            question: 'Why is training typically separated from the request/response thread in an app?',
            options: [
              'To simplify tokenization',
              'To avoid blocking the web server and to support long-running, fault-tolerant jobs',
              'To make gradients smaller',
              'To eliminate the need for checkpoints'
            ],
            correctIndex: 1,
            explanation: 'Synchronous API routes timeout within seconds. Decoupling training keeps the web server agile while workers manage long pipelines.',
            proSpeakerTip: 'Thread decoupling acts as standard architecture to guard API ingress pipelines from operational fatigue.'
          },
          {
            question: 'What is a common design pattern for a training app backend?',
            options: [
              'Direct synchronous inference only',
              'API server + job queue + worker process + persistent storage',
              'One HTML page only',
              'Client-side-only model training'
            ],
            correctIndex: 1,
            explanation: 'The classic pattern uses an API server for controls, a persistent storage folder for logs/checkpoints, and worker nodes pulling tasks off a queue.',
            proSpeakerTip: 'This modular topology allows horizontal scaling of physical compute clusters under heavy custom workloads.'
          }
        ]
      }
    },
    {
      id: 'bonus_mixed',
      title: '🌟 Bonus Mixed Concept Quiz',
      subtitle: 'Putting it all together',
      icon: '🌟',
      levels: {
        layperson: [
          {
            question: 'Which feature helps stop training from going unstable?',
            options: [
              'Gradient clipping',
              'Tokenization',
              'Validation split',
              'Browser cache'
            ],
            correctIndex: 0,
            explanation: 'Gradient clipping keeps backprop step steps inside strict boundaries, preserving stability against massive surges.',
            proSpeakerTip: 'An indispensable mathematical bumper preventing unstable gradient spikes from ruining convergence.'
          }
        ],
        enthusiast: [
          {
            question: 'Which pair belongs together?',
            options: [
              'FP16 + GradScaler',
              'BF16 + image resize',
              'LoRA + tokenizer',
              'Cosine scheduler + dropout only'
            ],
            correctIndex: 0,
            explanation: 'FP16 has very thin numerical exponent limits, so using a GradScaler is required to escape underflow during backpropagation.',
            proSpeakerTip: 'We enforce this pairing strictly within half-precision environments to defend fractional updates.'
          }
        ],
        expert: [
          {
            question: 'Which sequence is correct for FP16 training?',
            options: [
              'step → backward → clip → autocast',
              'autocast → scale(loss) → backward → unscale → clip → step → update',
              'clip → forward → step → eval',
              'eval → backward → scaler.update()'
            ],
            correctIndex: 1,
            explanation: 'Wrap forward pass in autocast context, compute scaled loss backprop, unscale gradients safely, execute clipping norm, step the weights, and update scaling factors.',
            proSpeakerTip: 'Our research pipeline conforms strictly to this optimization schema to ensure numerical integrity.'
          }
        ]
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
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [userSelectedQuizOption, setUserSelectedQuizOption] = useState<number | null>(null);
  const [quizScores, setQuizScores] = useState<Record<string, boolean>>({});
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
    Object.keys(quizScores).forEach((key) => {
      if (quizScores[key]) {
        conceptPoints += 10;
      }
    });

    return stageDrillPoints + conceptPoints;
  };

  const handleQuizAnswer = (optIndex: number, correctIdx: number) => {
    if (userSelectedQuizOption !== null) return;
    setUserSelectedQuizOption(optIndex);
    setShowExplanation(true);

    if (optIndex === correctIdx) {
      const scoreKey = `${selectedConcept.id}:${activeDifficulty}:${activeQuestionIdx}`;
      setQuizScores(prev => ({
        ...prev,
        [scoreKey]: true
      }));
    }
  };

  const getCompletedQuestionsCount = (conceptId: string, level: 'layperson' | 'enthusiast' | 'expert') => {
    const conceptObj = conceptQuizzes.find(c => c.id === conceptId);
    if (!conceptObj) return 0;
    const questionsList = conceptObj.levels[level] || [];
    return questionsList.filter((_, idx) => quizScores[`${conceptId}:${level}:${idx}`]).length;
  };

  const isLevelCleared = (conceptId: string, level: 'layperson' | 'enthusiast' | 'expert') => {
    const conceptObj = conceptQuizzes.find(c => c.id === conceptId);
    if (!conceptObj) return false;
    const questionsList = conceptObj.levels[level] || [];
    return questionsList.length > 0 && getCompletedQuestionsCount(conceptId, level) === questionsList.length;
  };

  const currentQuestions = selectedConcept.levels[activeDifficulty] || [];
  const currentQuestion = currentQuestions[activeQuestionIdx] || currentQuestions[0] || {
    question: "No question available",
    options: [],
    correctIndex: 0,
    explanation: "N/A",
    proSpeakerTip: "N/A"
  };

  const totalQuestionsNumber = conceptQuizzes.reduce((acc, q) => {
    return acc + (q.levels.layperson?.length || 0) + (q.levels.enthusiast?.length || 0) + (q.levels.expert?.length || 0);
  }, 0);

  const totalPossiblePoints = (drillQuestions.length * 10) + (totalQuestionsNumber * 10);

  const generatedBuzzword = `${buzzPrefix} ${buzzRoot} ${buzzSuffix}`;

  const getBuzzwordDefinition = () => {
    return `An advanced design methodology that leverages ${buzzPrefix.toLowerCase()} parameters to coordinate a ${buzzRoot.toLowerCase()} mechanism, designed to optimize the ${buzzSuffix.toLowerCase()} during distributed training.`;
  };

  const getCompletedQuizCount = () => {
    return Object.values(quizScores).filter(Boolean).length;
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
                const isLaypersonCleared = isLevelCleared(quiz.id, 'layperson');
                const isEnthusiastCleared = isLevelCleared(quiz.id, 'enthusiast');
                const isExpertCleared = isLevelCleared(quiz.id, 'expert');
                const completedLevelsCount = [isLaypersonCleared, isEnthusiastCleared, isExpertCleared].filter(Boolean).length;

                return (
                  <button
                    key={quiz.id}
                    id={`concept-quiz-${quiz.id}`}
                    onClick={() => {
                      setSelectedConcept(quiz);
                      setActiveDifficulty('layperson');
                      setActiveQuestionIdx(0);
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
                      <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center text-[8px] ${isLaypersonCleared ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`} title="Layperson" />
                      <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center text-[8px] ${isEnthusiastCleared ? 'bg-amber-400 text-[#33332D]' : 'bg-gray-200 text-gray-500'}`} title="Enthusiast" />
                      <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center text-[8px] ${isExpertCleared ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`} title="Expert" />
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
                  const isCorrect = isLevelCleared(selectedConcept.id, difficulty);
                  
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
                        setActiveQuestionIdx(0);
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
              {/* Question dots step list navigation within level */}
              {currentQuestions.length > 1 && (
                <div className="flex gap-2 items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E5E3D8]">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[10px] font-mono text-gray-400 font-bold uppercase mr-1">Level Questions:</span>
                    {currentQuestions.map((_, idx) => {
                      const isCompleted = !!quizScores[`${selectedConcept.id}:${activeDifficulty}:${idx}`];
                      const isCurrent = idx === activeQuestionIdx;
                      return (
                        <button
                          key={idx}
                          id={`question-dot-${idx}`}
                          onClick={() => {
                            setActiveQuestionIdx(idx);
                            setUserSelectedQuizOption(null);
                            setShowExplanation(false);
                          }}
                          className={`w-5.5 h-5.5 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center justify-center border ${
                            isCurrent
                              ? 'bg-[#33332D] text-[#FAF9F6] border-[#33332D]'
                              : isCompleted
                              ? 'bg-[#EAF2E8] text-[#3E6335] border-[#B2D8A6]'
                              : 'bg-white text-gray-500 border-[#E5E3D8] hover:bg-gray-50'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-mono font-medium text-gray-400">
                    Question {activeQuestionIdx + 1} of {currentQuestions.length}
                  </span>
                </div>
              )}

              <div className="bg-white p-4 rounded-xl border border-[#E5E3D8] shadow-inner space-y-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#706F63]">
                  <HelpCircle className="w-4 h-4 text-[#8A9A5B]" />
                  <span>Topic: {selectedConcept.subtitle} (Q{activeQuestionIdx + 1}/{currentQuestions.length})</span>
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
                        // If there is another question in this active level:
                        if (activeQuestionIdx + 1 < currentQuestions.length) {
                          setActiveQuestionIdx(prev => prev + 1);
                        } else {
                          // Try to find next unfinished difficulty, or move to next concept
                          setActiveQuestionIdx(0);
                          
                          if (!isLevelCleared(selectedConcept.id, 'layperson')) {
                            setActiveDifficulty('layperson');
                          } else if (!isLevelCleared(selectedConcept.id, 'enthusiast')) {
                            setActiveDifficulty('enthusiast');
                          } else if (!isLevelCleared(selectedConcept.id, 'expert')) {
                            setActiveDifficulty('expert');
                          } else {
                            // select next concept
                            const currentIndex = conceptQuizzes.findIndex(c => c.id === selectedConcept.id);
                            const nextIndex = (currentIndex + 1) % conceptQuizzes.length;
                            setSelectedConcept(conceptQuizzes[nextIndex]);
                            setActiveDifficulty('layperson');
                          }
                        }
                        setUserSelectedQuizOption(null);
                        setShowExplanation(false);
                      }}
                      className="bg-[#33332D] hover:bg-[#55534C] text-[#FAF9F6] font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:translate-x-0.5"
                    >
                      {activeQuestionIdx + 1 < currentQuestions.length ? (
                        <>Next Question <ArrowRight className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Next Core Drill <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
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
