export interface SimulationState {
  epoch: number;
  step: number;
  currentLoss: number;
  valLoss: number | null;
  learningRate: number;
  gradientNorm: number;
  precisionMode: 'none' | 'fp16' | 'bf16';
  lrScheduler: 'linear' | 'cosine';
  gradClipThreshold: number;
  valSplit: number;
  isTrainingActive: boolean;
  activeLineIndex: number;
  isFp16AutocastActive: boolean;
  isLossScaled: boolean;
  scaleFactor: number;
  history: Array<{
    epoch: number;
    step: number;
    loss: number;
    valLoss: number | null;
    lr: number;
    gradNorm: number;
    unclippedGradNorm: number;
    isClipped: boolean;
  }>;
}

export interface LoraConfig {
  r: number;
  alpha: number;
  targetModules: string[];
  dropout: number;
  learningRate: number;
}
