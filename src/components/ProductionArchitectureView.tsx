import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Database,
  Terminal,
  ArrowRight,
  Code,
  CheckCircle,
  Copy,
  Folder,
  FolderOpen,
  FileCode,
  Settings2,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Monitor,
  Check
} from 'lucide-react';

interface CodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export default function ProductionArchitectureView() {
  const [activeSchemaTab, setActiveSchemaTab] = useState<'diagram' | 'explorer' | 'api' | 'roadmap'>('diagram');
  const [selectedNode, setSelectedNode] = useState<string>('api');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('requirements.txt');
  const [simulatedJobState, setSimulatedJobState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [simStep, setSimStep] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simJobId, setSimJobId] = useState<string>('');

  // Checklist for user's interactive roadmap
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({
    m1_1: true,
    m1_2: true,
    m2_1: false,
    m2_2: false,
    m3_1: false,
    m3_2: false,
    m4_1: false,
  });

  const toggleMilestone = (key: string) => {
    setCompletedMilestones(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const codeFiles: Record<string, CodeFile> = {
    'requirements.txt': {
      name: 'requirements.txt',
      path: './requirements.txt',
      language: 'text',
      description: 'Minimum required dependencies for the FastAPI server and Streamlit frontend.',
      content: `fastapi==0.111.0
uvicorn==0.30.1
streamlit==1.35.0
torch>=2.2.0
transformers>=4.40.0
peft>=0.10.0
pydantic>=2.7.0
requests==2.32.3
plotly==5.22.0
`
    },
    'backend/main.py': {
      name: 'main.py',
      path: './backend/main.py',
      language: 'python',
      description: 'Production-ready FastAPI backend server that handles config submission, schedules training via an asynchronous background thread, logs metrics, and manages checkpoint retrieval.',
      content: `import uuid
import logging
import threading
import time
from typing import Dict, List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="LLM Fine-Tuning Pipeline Backend",
    description="Product-grade API gateway overseeing live LoRA training checkpoints",
    version="1.0.0"
)

# Enable CORS for Streamlit client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("TuningBackend")

# Schema definitions
class LoraHyperparameters(BaseModel):
    r: int = Field(8, ge=1, le=128, description="LoRA rank parameter")
    alpha: int = Field(16, ge=1, description="LoRA scaling factor")
    target_modules: List[str] = Field(default=["q_proj", "v_proj"])
    learning_rate: float = Field(2e-4, gt=0.0)
    gradient_clipping: float = Field(1.0, ge=0.0)
    mixed_precision: str = Field("fp16", regex="^(fp16|bf16|fp32)$")
    val_split_percentage: int = Field(15, ge=5, le=50)
    batch_size: int = Field(4, ge=1)
    epochs: int = Field(5, ge=1, le=50)

class TrainingJob(BaseModel):
    job_id: str
    status: str  # idle, running, completed, failed, cancelled
    config: LoraHyperparameters
    progress: float = 0.0  # 0.0 to 100.0
    current_epoch: int = 0
    train_loss: List[float] = []
    val_loss: List[float] = []
    active_learning_rate: float = 0.0
    logs: List[string] = []

# Global in-memory data tables (For production, swap with a database like SQLite or Redis state)
TRAINING_JOBS: Dict[str, TrainingJob] = {}

def simulate_training_loop(job_id: str, config: LoraHyperparameters):
    """
    Decoupled PyTorch loop simulator translating hyperparameters into training logs.
    In real usage, replace this with direct torch subprocess calls.
    """
    job = TRAINING_JOBS[job_id]
    epochs = config.epochs
    lr = config.learning_rate
    clip_thresh = config.gradient_clipping
    prec = config.mixed_precision
    split = config.val_split_percentage

    job.logs.append(f"Initialized PyTorch CUDA device context.")
    job.logs.append(f"Freezing base pre-trained weights. Adapters rank r={config.r} alpha={config.alpha}.")
    job.logs.append(f"Base model parameters locked. Total trainable parameters: ~2,500,000 (0.07%).")
    
    # Initialize loss values
    t_loss = 4.2
    v_loss = 4.5
    
    for epoch in range(1, epochs + 1):
        if job.status == "cancelled":
            job.logs.append("Training job voluntarily cancelled by supervisor.")
            return

        job.current_epoch = epoch
        job.active_learning_rate = lr * (1.0 - (epoch - 1) / epochs) # Linear Decay simulator
        
        job.logs.append(f"--- Epoch {epoch}/{epochs} Started ---")
        job.logs.append(f"Optimizer parameters calibrated. Precision scaler initiated for format: {prec}.")
        
        # Simulated steps per epoch
        for step in range(1, 4):
            time.sleep(1.0) # Simulate GPU training step delay
            # Loss steps downward
            t_loss -= (t_loss * 0.15)
            # Validation loss simulates potential overfitting after middle epochs
            if epoch > (epochs * 0.6):
                # High overfit risk model gets triggered if val_split is small
                overfit_rate = 0.05 * (100 / split)
                v_loss += (overfit_rate * (epoch - epochs*0.6))
            else:
                v_loss -= (v_loss * 0.12)
                
            job.logs.append(f"Epoch {epoch} Step {step}/3 | Loss (Raw): {(t_loss * 1.5):.4f} | Clipped: {clip_thresh}")
        
        job.train_loss.append(round(t_loss, 4))
        job.val_loss.append(round(v_loss, 4))
        job.progress = round((epoch / epochs) * 100, 1)
        job.logs.append(f"Epoch {epoch} complete. Train Loss: {t_loss:.4f} | Val Loss: {v_loss:.4f}")

    job.status = "completed"
    job.progress = 100.0
    job.logs.append("Training finished. Adapter state dictionary synchronized.")
    job.logs.append("Saved checkpoint: adapter_weights.safetensors -> /artifacts/safetensors/")
    logger.info(f"Job {job_id} successfully finalized.")

@app.post("/api/train", response_model=Dict[str, str])
def submit_training_job(config: LoraHyperparameters, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())[:8]
    
    # Register job metadata
    TRAINING_JOBS[job_id] = TrainingJob(
        job_id=job_id,
        status="running",
        config=config,
        active_learning_rate=config.learning_rate,
        logs=[f"Submitted training scheduler. Assigned ID: {job_id}", "Validating dataset tokens split partitions."]
    )
    
    # Enqueue background task
    background_tasks.add_task(simulate_training_loop, job_id, config)
    logger.info(f"Created training runner thread for sub-process job ID: {job_id}")
    
    return {"job_id": job_id, "status": "running"}

@app.get("/api/train/{job_id}", response_model=TrainingJob)
def get_job_status(job_id: str):
    if job_id not in TRAINING_JOBS:
        raise HTTPException(status_code=404, detail="Requested training run ID does not exist.")
    return TRAINING_JOBS[job_id]

@app.post("/api/train/{job_id}/cancel")
def cancel_job(job_id: str):
    if job_id not in TRAINING_JOBS:
        raise HTTPException(status_code=404, detail="Job not found.")
    job = TRAINING_JOBS[job_id]
    if job.status == "running":
        job.status = "cancelled"
        job.logs.append("Triggered cancellation interrupt.")
        return {"status": "cancelled", "message": "Job cancellation sequence dispatched."}
    return {"status": job.status, "message": "Job not running."}

@app.get("/api/jobs", response_model=List[str])
def list_active_jobs():
    return list(TRAINING_JOBS.keys())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`
    },
    'frontend/app.py': {
      name: 'app.py',
      path: './frontend/app.py',
      language: 'python',
      description: 'Streamlit UI layout displaying customizable input sliders, a live poll scheduler for logs, real-time plotted loss curves, and artifact downloaders.',
      content: `import streamlit as st
import requests
import time
import pandas as pd

# API endpoints
BACKEND_URL = "http://localhost:8000/api"

st.set_page_config(
    page_title="LLM Fine-Tuning Console",
    page_icon="⚙️",
    layout="wide"
)

st.title("⚙️ LLM Fine-Tuning Console & Adapter Hub")
st.markdown("Connects directly to PyTorch via a FastAPI background thread service.")

# Split UI columns
col_ctrl, col_mon = st.columns([1, 2])

# Control sidebar panel
with col_ctrl:
    st.header("1. Tuning Hyperparameters")
    
    r = st.slider("LoRA Rank (r)", min_value=1, max_value=128, value=8, step=1)
    alpha = st.slider("LoRA Alpha", min_value=1, max_value=256, value=16)
    
    learning_rate = st.number_input("Learning Rate", min_value=1e-6, max_value=1e-1, value=2e-4, format="%.2e")
    clipping = st.slider("Gradient Clipping Limit", min_value=0.0, max_value=10.0, value=1.0)
    precision = st.selectbox("Mixed Precision Format", ["fp16", "bf16", "fp32"])
    
    val_split = st.slider("Holdout Validation Percentage (%)", min_value=5, max_value=50, value=15)
    epochs = st.slider("Total Epochs", min_value=1, max_value=20, value=5)
    
    submit_btn = st.button("🚀 Queue Training Job", type="primary")

# Interactive triggers session variables
if "active_job_id" not in st.session_state:
    st.session_state.active_job_id = None

if submit_btn:
    payload = {
        "r": r,
        "alpha": alpha,
        "target_modules": ["q_proj", "v_proj"],
        "learning_rate": learning_rate,
        "gradient_clipping": clipping,
        "mixed_precision": precision,
        "val_split_percentage": val_split,
        "batch_size": 4,
        "epochs": epochs
    }
    try:
        res = requests.post(f"{BACKEND_URL}/train", json=payload)
        if res.status_code == 200:
            job_data = res.json()
            st.session_state.active_job_id = job_data["job_id"]
            st.success(f"Job successfully queued! ID: {job_data['job_id']}")
        else:
            st.error("Could not register training sequence on target socket.")
    except Exception as e:
        st.error(f"Failed connecting to server backend: {str(e)}")

# Right side: Metric monitoring panel
with col_mon:
    st.header("2. Real-Time Monitor Dashboard")
    
    if st.session_state.active_job_id:
        job_id = st.session_state.active_job_id
        
        # Display meta status summary
        st.markdown(f"**Tracking Active Run ID:** \`{job_id}\`")
        
        # Query API status endpoint
        try:
            res = requests.get(f"{BACKEND_URL}/train/{job_id}")
            if res.status_code == 200:
                data = res.json()
                
                # Check status
                status = data["status"]
                progress = data["progress"]
                epoch = data["current_epoch"]
                
                status_color = {
                    "running": "orange",
                    "completed": "green",
                    "cancelled": "red",
                    "failed": "red"
                }.get(status, "grey")
                
                st.markdown(f"**Execution Status:** :{status_color}[{status.upper()}]  |  **Epoch:** {epoch}")
                st.progress(progress / 100.0)
                
                # Render losses plot
                if len(data["train_loss"]) > 0:
                    metrics_df = pd.DataFrame({
                        "Epoch": range(1, len(data["train_loss"]) + 1),
                        "Train Loss": data["train_loss"],
                        "Val Loss": data["val_loss"]
                    }).set_index("Epoch")
                    
                    st.line_chart(metrics_df)
                else:
                    st.info("Awaiting metric packets from background scheduler.")
                
                # Display output logger
                with st.expander("Show Deep GPU Standard Output Logs", expanded=True):
                    st.text_area("Console", value="\\n".join(data["logs"]), height=180)
                
                # Control Actions
                if status == "running":
                    if st.button("🛑 Dispatch Hard Cancel Request"):
                        requests.post(f"{BACKEND_URL}/train/{job_id}/cancel")
                        st.info("Cancellation instruction was disptached.")
                
                # Enable checks output if completed
                if status == "completed":
                    st.success("Trained LLM Adaptor Saved Successfully!")
                    st.download_button(
                        label="💾 Download adapter_config.json",
                        data=f'{{"base_model_name_or_path": "gpt2", "peft_type": "LORA", "r": {r}}}',
                        file_name="adapter_config.json",
                        mime="application/json"
                    )
            else:
                st.error("No valid metrics sequence found for this run.")
        except Exception as e:
            st.warning("Awaiting backend initialization connection...")
            
        # Quick stream loop triggering auto reruns
        st.button("🔄 Refresh Logs & Status Metrics")
    else:
        st.info("Configure your hyperparameter payload configuration inputs and click 'Queue Training Job' to display active process graphs.")
`
    },
    'backend/train.py': {
      name: 'train.py',
      path: './backend/train.py',
      language: 'python',
      description: 'Reference PyTorch & Hugging Face code containing deep model structural logic: locks base parameters, integrates the PEFT LoraConfig, implements gradient scaling for precision, and scales clipped backpropagation gradients.',
      content: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model
from torch.cuda.amp import GradScaler, autocast

def train_adapter_pytorch(
    model_name: str,
    lora_rank: int,
    lora_alpha: int,
    learning_rate: float,
    max_gradient_norm: float,
    use_fp16: bool
):
    print("Preparing Tokenizer and causal parameters...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    
    # STEP 1: Setup LoRA configurations using PEFT library
    peft_config = LoraConfig(
        r=lora_rank,
        lora_alpha=lora_alpha,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    
    # Injects small trainable matrices (A and B) around frozen target elements
    model = get_peft_model(model, peft_config)
    
    # Critical verify check: Ensure W0 is frozen and A & B is active
    print("Trainable parameter overview:")
    model.print_trainable_parameters()
    
    # STEP 2: Configure Optimizer & PyTorch Floating-Point scalar
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
    scaler = GradScaler(enabled=use_fp16)
    
    # Simulated mini training iteration
    dummy_input = "Fine-tuning Large Language Models saves massive server costs."
    inputs = tokenizer(dummy_input, return_tensors="pt")
    labels = inputs["input_ids"]
    
    # Zero gradient buffers
    optimizer.zero_grad()
    
    # STEP 3: Forward Pass under autocast context
    with autocast(enabled=use_fp16):
        outputs = model(**inputs, labels=labels)
        loss = outputs.loss
        
    # Scale backward pass to prevent gradient underflow in float16 formats
    scaler.scale(loss).backward()
    
    # STEP 4: Unscale and evaluate gradient clipping before optimizer updates parameters
    if use_fp16:
        scaler.unscale_(optimizer) # Unscale gradients back to full fp32 scope
        
    # Execute actual gradients ceiling bounding
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_gradient_norm)
    
    # Step optimizer and update scaler
    scaler.step(optimizer)
    scaler.update()
    
    print(f"Iteration finalized. Scaled step validated. Core Loss: {loss.item():.4f}")
`
    }
  };

  const copyToClipboard = (filename: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Mock server simulation triggers
  const runSimulatedJob = () => {
    if (simulatedJobState === 'running') return;
    setSimulatedJobState('running');
    setSimStep(0);
    const id = 'lora-job-' + Math.floor(Math.random() * 900 + 100);
    setSimJobId(id);
    
    const steps = [
      { msg: 'POST /api/train - JSON Hyperparameters verified.', delay: 800 },
      { msg: `Spawning background thread worker. Job assigned UUID: ${id}`, delay: 1600 },
      { msg: 'Tokenizing training datasets... Holdout Validation partition configured at 15%.', delay: 2400 },
      { msg: 'Injected low-rank linear projections. Training adapters A and B.', delay: 3500 },
      { msg: 'Epoch 1/3 | Step 100/300 | Loss: 3.5204 | LR: 2.00e-4 | GPU VRAM: 4.8 GB', delay: 4500 },
      { msg: 'Epoch 2/3 | Step 200/300 | Loss: 1.8492 | LR: 1.33e-4 | GPU VRAM: 4.8 GB', delay: 5500 },
      { msg: 'Epoch 3/3 | Step 300/350 | Loss: 0.9572 | LR: 6.66e-5 | Overfit validation check: Val Loss remains stable.', delay: 6500 },
      { msg: 'Finalizing training pass. Extracting state dictionary weights.', delay: 7200 },
      { msg: 'adapter_model.safetensors successfully synchronized. Output folder finalized.', delay: 8000 }
    ];

    setSimLogs([`Awaiting job dispatch trigger...`]);

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.msg}`]);
        setSimStep(idx + 1);
        if (idx === steps.length - 1) {
          setSimulatedJobState('completed');
        }
      }, step.delay);
    });
  };

  return (
    <div id="production-architecture-view" className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#FAF6EE] border-l-4 border-[#8A9A5B] p-4 rounded-r-lg">
        <h3 className="font-serif text-lg font-bold text-[#33332D] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#8A9A5B]" />
          Production Blueprint & Decoupled Architecture Guide
        </h3>
        <p className="text-sm text-[#706F63] mt-1 leading-relaxed">
          While this interactive laboratory operates directly in your browser sandbox, setting up actual models like Llama or Mistral requires a robust production-grade architecture. Review below high-quality implementation guides, backend starter files, API designs, and a full engineering MVP roadmap.
        </p>
      </div>

      {/* Nested Tabs Bar Selection */}
      <div className="flex gap-1.5 border-b border-[#E5E3D8] pb-1.5 overflow-x-auto select-none no-scrollbar">
        {[
          { id: 'diagram', name: '1. App Flow Diagram', icon: Layers },
          { id: 'explorer', name: '2. FastAPI + Streamlit Scaffold', icon: FolderOpen },
          { id: 'api', name: '3. API Task Simulator', icon: Terminal },
          { id: 'roadmap', name: '4. Full MVP Roadmap', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSchemaTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSchemaTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#8A9A5B] text-[#3E6335] bg-[#FAF8F3]/50 font-bold'
                  : 'border-transparent text-[#706F63] hover:text-[#33332D]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Main Tab Screen Switcher */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeSchemaTab === 'diagram' && (
            <motion.div
              key="diagram"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-[#FAF9F6] border border-[#E5E3D8] p-5 rounded-xl space-y-4 shadow-sm">
                <div className="border-b border-[#E5E3D8] pb-2 flex justify-between items-center">
                  <h4 className="font-serif font-bold text-[#33332D] text-base">Production Hub Flowchart</h4>
                  <span className="text-[10px] bg-[#EAF2E8] border border-[#D5D3C7] px-2.5 py-0.5 rounded font-mono text-[#3E6335] font-bold">
                    Async Decoupled Execution
                  </span>
                </div>

                <p className="text-xs text-[#706F63] leading-relaxed">
                  Hover or click on individual pipeline blocks below to reveal how the Streamlit dashboard exchanges data asynchronously with the background worker processes.
                </p>

                {/* Interactive SVG Flow Diagram */}
                <div className="bg-[#FAF8F3] border border-[#E5E3D8] p-4 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 750 180" className="w-full max-w-3xl h-auto">
                    {/* Connection arrows */}
                    <g stroke="#D5D3C7" strokeWidth="2" fill="none">
                      {/* Line 1 -> 2 */}
                      <path d="M 125 90 L 165 90" />
                      <polygon points="165,90 157,86 157,94" fill="#D5D3C7" />

                      {/* Line 2 -> 3 */}
                      <path d="M 285 90 L 325 90" />
                      <polygon points="325,90 317,86 317,94" fill="#D5D3C7" />

                      {/* Line 3 -> 4 */}
                      <path d="M 445 90 L 485 90" />
                      <polygon points="485,90 477,86 477,94" fill="#D5D3C7" />

                      {/* Line 4 -> 5 */}
                      <path d="M 605 90 L 645 90" />
                      <polygon points="645,90 637,86 637,94" fill="#D5D3C7" />

                      {/* Return polling loop line 2 -> 1 */}
                      <path d="M 225 60 Q 165 20 100 60" strokeDasharray="3,3" />
                      <polygon points="100,60 105,53 109,61" fill="#D5D3C7" stroke="none" />
                    </g>

                    {/* Node 1: Streamlit Client */}
                    <g
                      onClick={() => setSelectedNode('gui')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="15"
                        y="60"
                        width="110"
                        height="60"
                        rx="8"
                        fill={selectedNode === 'gui' ? '#3B4E2B' : '#FAF9F6'}
                        stroke={selectedNode === 'gui' ? '#8A9A5B' : '#E5E3D8'}
                        strokeWidth={selectedNode === 'gui' ? '2.5' : '1.5'}
                        className="transition-colors duration-200"
                      />
                      <text
                        x="70"
                        y="88"
                        textAnchor="middle"
                        fontSize="10"
                        className={`font-semibold  ${selectedNode === 'gui' ? 'fill-white font-bold' : 'fill-[#33332D]'}`}
                      >
                        1. Streamlit Dashboard
                      </text>
                      <text
                        x="70"
                        y="104"
                        textAnchor="middle"
                        fontSize="8"
                        className={selectedNode === 'gui' ? 'fill-gray-200' : 'fill-[#706F63]'}
                      >
                        User GUI View (Client)
                      </text>
                    </g>

                    {/* Node 2: FastAPI */}
                    <g
                      onClick={() => setSelectedNode('api')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="175"
                        y="60"
                        width="110"
                        height="60"
                        rx="8"
                        fill={selectedNode === 'api' ? '#3B4E2B' : '#FAF9F6'}
                        stroke={selectedNode === 'api' ? '#8A9A5B' : '#E5E3D8'}
                        strokeWidth={selectedNode === 'api' ? '2.5' : '1.5'}
                        className="transition-colors duration-200"
                      />
                      <text
                        x="230"
                        y="88"
                        textAnchor="middle"
                        fontSize="10"
                        className={`font-semibold ${selectedNode === 'api' ? 'fill-white font-bold' : 'fill-[#33332D]'}`}
                      >
                        2. FastAPI Service
                      </text>
                      <text
                        x="230"
                        y="104"
                        textAnchor="middle"
                        fontSize="8"
                        className={selectedNode === 'api' ? 'fill-gray-200' : 'fill-[#706F63]'}
                      >
                        API Handler Gateway
                      </text>
                    </g>

                    {/* Node 3: Thread background / Redis Queue */}
                    <g
                      onClick={() => setSelectedNode('queue')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="335"
                        y="60"
                        width="110"
                        height="60"
                        rx="8"
                        fill={selectedNode === 'queue' ? '#3B4E2B' : '#FAF9F6'}
                        stroke={selectedNode === 'queue' ? '#8A9A5B' : '#E5E3D8'}
                        strokeWidth={selectedNode === 'queue' ? '2.5' : '1.5'}
                        className="transition-colors duration-200"
                      />
                      <text
                        x="390"
                        y="88"
                        textAnchor="middle"
                        fontSize="10"
                        className={`font-semibold ${selectedNode === 'queue' ? 'fill-white font-bold' : 'fill-[#33332D]'}`}
                      >
                        3. Thread Scheduler
                      </text>
                      <text
                        x="390"
                        y="104"
                        textAnchor="middle"
                        fontSize="8"
                        className={selectedNode === 'queue' ? 'fill-gray-200' : 'fill-[#706F63]'}
                      >
                        Background Job Queue
                      </text>
                    </g>

                    {/* Node 4: GPU PyTorch */}
                    <g
                      onClick={() => setSelectedNode('pytorch')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="495"
                        y="60"
                        width="110"
                        height="60"
                        rx="8"
                        fill={selectedNode === 'pytorch' ? '#3B4E2B' : '#FAF9F6'}
                        stroke={selectedNode === 'pytorch' ? '#8A9A5B' : '#E5E3D8'}
                        strokeWidth={selectedNode === 'pytorch' ? '2.5' : '1.5'}
                        className="transition-colors duration-200"
                      />
                      <text
                        x="550"
                        y="88"
                        textAnchor="middle"
                        fontSize="10"
                        className={`font-semibold ${selectedNode === 'pytorch' ? 'fill-white font-bold' : 'fill-[#33332D]'}`}
                      >
                        4. GPU Trainer (HF)
                      </text>
                      <text
                        x="550"
                        y="104"
                        textAnchor="middle"
                        fontSize="8"
                        className={selectedNode === 'pytorch' ? 'fill-gray-200' : 'fill-[#706F63]'}
                      >
                        PyTorch / PEFT Core
                      </text>
                    </g>

                    {/* Node 5: Storage folder */}
                    <g
                      onClick={() => setSelectedNode('storage')}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="655"
                        y="60"
                        width="80"
                        height="60"
                        rx="8"
                        fill={selectedNode === 'storage' ? '#3B4E2B' : '#FAF9F6'}
                        stroke={selectedNode === 'storage' ? '#8A9A5B' : '#E5E3D8'}
                        strokeWidth={selectedNode === 'storage' ? '2.5' : '1.5'}
                        className="transition-colors duration-200"
                      />
                      <text
                        x="695"
                        y="88"
                        textAnchor="middle"
                        fontSize="10"
                        className={`font-semibold ${selectedNode === 'storage' ? 'fill-white font-bold' : 'fill-[#33332D]'}`}
                      >
                        5. Storage
                      </text>
                      <text
                        x="695"
                        y="104"
                        textAnchor="middle"
                        fontSize="8"
                        className={selectedNode === 'storage' ? 'fill-gray-200' : 'fill-[#706F63]'}
                      >
                        Checkpoints
                      </text>
                    </g>

                    {/* Top Loop Label pointer */}
                    <text x="160" y="32" fontSize="7" fill="#8A9A5B" className="font-semibold">
                      GET /api/train/status status poll ticks every 2s
                    </text>
                  </svg>
                </div>

                {/* Node Details Panel */}
                <div className="bg-[#FAF8F3] border border-[#E5E3D8] rounded-lg p-4 space-y-3">
                  {selectedNode === 'gui' && (
                    <>
                      <h5 className="font-bold flex items-center gap-1.5 text-xs text-[#3E6335]">
                        <span className="w-2.5 h-2.5 bg-[#8A9A5B] rounded-full" />
                        1. Streamlit Dashboard Frontend (`app.py`)
                      </h5>
                      <p className="text-xs text-[#706F63] leading-relaxed">
                        Defines layout widgets for input arguments and maps them to REST requests. It handles UI updates without holding the active web page connection open indefinitely by polling the running job metrics.
                      </p>
                      <div className="text-[11px] font-mono bg-[#EFEDE4]/60 p-2.5 rounded text-[#55534C] border border-[#D5D3C7]">
                        st.session_state.active_job_id = requests.post("/api/train", json=config)
                      </div>
                    </>
                  )}

                  {selectedNode === 'api' && (
                    <>
                      <h5 className="font-bold flex items-center gap-1.5 text-xs text-[#3E6335]">
                        <span className="w-2.5 h-2.5 bg-[#8A9A5B] rounded-full" />
                        2. FastAPI Gatekeeper API Server (`main.py`)
                      </h5>
                      <p className="text-xs text-[#706F63] leading-relaxed">
                        Acts as our primary application middleware. It intercepts JSON parameters, saves hyperparameter logs into database tables, immediately releases the client with a successful `job_id`, and manages background tasks.
                      </p>
                      <div className="text-[11px] font-mono bg-[#EFEDE4]/60 p-2.5 rounded text-[#55534C] border border-[#D5D3C7]">
                        @app.post("/api/train")<br />
                        def init_job(config: Parameters, background_tasks: BackgroundTasks):
                      </div>
                    </>
                  )}

                  {selectedNode === 'queue' && (
                    <>
                      <h5 className="font-bold flex items-center gap-1.5 text-xs text-[#3E6335]">
                        <span className="w-2.5 h-2.5 bg-[#8A9A5B] rounded-full" />
                        3. Thread Scheduler & Task Runner
                      </h5>
                      <p className="text-xs text-[#706F63] leading-relaxed">
                        For lightweight/single-instance systems, FastAPI's built-in `BackgroundTasks` thread works natively. For multi-user clusters, migrate this piece to standard task workers like <span className="underline font-bold">Celery</span> powered by a Redis message broker.
                      </p>
                      <div className="text-[11px] font-mono bg-[#EFEDE4]/60 p-2.5 rounded text-[#55534C] border border-[#D5D3C7]">
                        background_tasks.add_task(execute_pytorch_runner, job_id, config)
                      </div>
                    </>
                  )}

                  {selectedNode === 'pytorch' && (
                    <>
                      <h5 className="font-bold flex items-center gap-1.5 text-xs text-[#3E6335]">
                        <span className="w-2.5 h-2.5 bg-[#8A9A5B] rounded-full" />
                        4. GPU PyTorch PEFT Engine (`train.py`)
                      </h5>
                      <p className="text-xs text-[#706F63] leading-relaxed">
                        Loads tokenizer models, allocates VRAM on GPU CUDA nodes, injects adapter layers, and runs gradient backpropagation loops. It logs loss values and steps into shared state buffers.
                      </p>
                      <div className="text-[11px] font-mono bg-[#EFEDE4]/60 p-2.5 rounded text-[#55534C] border border-[#D5D3C7]">
                        scale.backward() &rarr; unscale_(optimizer) &rarr; clip_grad_norm_ &rarr; step()
                      </div>
                    </>
                  )}

                  {selectedNode === 'storage' && (
                    <>
                      <h5 className="font-bold flex items-center gap-1.5 text-xs text-[#3E6335]">
                        <span className="w-2.5 h-2.5 bg-[#8A9A5B] rounded-full" />
                        5. Model Checkpoint Directory Storage
                      </h5>
                      <p className="text-xs text-[#706F63] leading-relaxed">
                        At the optimal epoch, the worker saves serialized weight adapters (using Hugging Face's high-performance `safetensors` model container). This format prevents code execution exploits that are common with pickle-based `.bin` or `.pth` models.
                      </p>
                      <div className="text-[11px] font-mono bg-[#EFEDE4]/60 p-2.5 rounded text-[#55534C] border border-[#D5D3C7]">
                        model.save_pretrained("/artifacts/checkpoint-best/")
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Pro-Tips Warning Panel */}
              <div className="bg-[#FAF6EE] border border-[#EFEDE4] rounded-lg p-4 space-y-2">
                <h5 className="font-bold font-serif text-[13px] text-[#33332D] flex items-center gap-1.5">
                  <span className="text-[#B58021]">★</span> Architectural Best Practices
                </h5>
                <ul className="text-xs text-[#706F63] space-y-1.5 list-disc pl-5">
                  <li><strong>Avoid API Timeouts:</strong> Never run the fine-tuning training loop directly inside the web server's request-response lifecycle. Fine-tuning takes hours, and HTTP requests timeout automatically at 60-120 seconds.</li>
                  <li><strong>Isolate Memory Buffers:</strong> Spawn PyTorch processes using decoupled Python subprocess blocks. If PyTorch encounters an Out-Of-Memory (OOM) GPU error, it will crash. Running it in a decoupled process prevents the FastAPI server itself from crashing.</li>
                  <li><strong>Safetensors by Default:</strong> Avoid saving checkpoints using raw PyTorch pickle files (`.pt`). Use the `safetensors` library to safely restrict metadata parsing and prevent dynamic payload injection.</li>
                </ul>
              </div>
            </motion.div>
          )}

          {activeSchemaTab === 'explorer' && (
            <motion.div
              key="explorer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column File Hub */}
              <div className="lg:col-span-4 bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-4 shadow-sm space-y-4">
                <h4 className="font-serif font-bold text-[#33332D] text-[14px] border-b border-[#E5E3D8] pb-1.5">
                  Workspace Template Structure
                </h4>
                
                <div className="space-y-1 text-xs font-mono">
                  {/* Root dir */}
                  <div className="flex items-center gap-1.5 text-[#33332D] font-bold p-1">
                    <FolderOpen className="w-4 h-4 text-[#8A9A5B]" />
                    <span>llm-tuning-app/</span>
                  </div>

                  {/* Requirements file */}
                  <button
                    onClick={() => setSelectedFile('requirements.txt')}
                    className={`w-full flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-left pl-6 transition-colors ${
                      selectedFile === 'requirements.txt' ? 'bg-[#33332D] text-[#FAF9F6] font-bold' : 'text-[#55534C] hover:bg-[#F2F1EA]'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 opacity-85" />
                    <span>requirements.txt</span>
                  </button>

                  {/* Backend folder */}
                  <div className="flex items-center gap-1.5 text-[#33332D] font-bold pl-5 py-1">
                    <Folder className="w-4 h-4 text-[#8A9A5B]" />
                    <span>backend/</span>
                  </div>

                  {/* main.py */}
                  <button
                    onClick={() => setSelectedFile('backend/main.py')}
                    className={`w-full flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-left pl-10 transition-colors ${
                      selectedFile === 'backend/main.py' ? 'bg-[#33332D] text-[#FAF9F6] font-bold' : 'text-[#55534C] hover:bg-[#F2F1EA]'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 opacity-85" />
                    <span>main.py</span>
                  </button>

                  {/* train.py */}
                  <button
                    onClick={() => setSelectedFile('backend/train.py')}
                    className={`w-full flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-left pl-10 transition-colors ${
                      selectedFile === 'backend/train.py' ? 'bg-[#33332D] text-[#FAF9F6] font-bold' : 'text-[#55534C] hover:bg-[#F2F1EA]'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 opacity-85" />
                    <span>train.py</span>
                  </button>

                  {/* Frontend folder */}
                  <div className="flex items-center gap-1.5 text-[#33332D] font-bold pl-5 py-1">
                    <Folder className="w-4 h-4 text-[#8A9A5B]" />
                    <span>frontend/</span>
                  </div>

                  {/* app.py */}
                  <button
                    onClick={() => setSelectedFile('frontend/app.py')}
                    className={`w-full flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-left pl-10 transition-colors ${
                      selectedFile === 'frontend/app.py' ? 'bg-[#33332D] text-[#FAF9F6] font-bold' : 'text-[#55534C] hover:bg-[#F2F1EA]'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 opacity-85" />
                    <span>app.py</span>
                  </button>
                </div>

                <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#EFEDE4]">
                  <p className="text-[11px] text-[#706F63] leading-relaxed">
                    <strong>File Description:</strong><br />
                    {codeFiles[selectedFile].description}
                  </p>
                </div>
              </div>

              {/* Right Column Code Viewer */}
              <div className="lg:col-span-8 bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="bg-[#EFEDE4] px-4 py-2 flex justify-between items-center border-b border-[#E5E3D8]">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-[#8A9A5B]" />
                    <span className="font-mono text-xs font-bold text-[#33332D]">{codeFiles[selectedFile].path}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedFile, codeFiles[selectedFile].content)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#8A9A5B] hover:text-[#3B4E2B] transition-colors cursor-pointer"
                  >
                    {copiedFile === selectedFile ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="p-4 overflow-auto max-h-[480px] bg-[#33332D] text-[#FAF9F6] font-mono text-[11px] leading-relaxed whitespace-pre rounded-b-xl border border-t-0 border-[#55534C]">
                  {codeFiles[selectedFile].content}
                </div>
              </div>
            </motion.div>
          )}

          {activeSchemaTab === 'api' && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left API Trigger */}
              <div className="lg:col-span-5 bg-[#FAF9F6] border border-[#E5E3D8] p-5 rounded-xl shadow-sm space-y-4">
                <h4 className="font-serif font-bold text-[#33332D] text-[15px] border-b border-[#E5E3D8] pb-2">
                  Client Simulator
                </h4>
                <p className="text-xs text-[#706F63] leading-relaxed">
                  FastAPI handles asynchronous request threads gracefully. Click the button below to submit a custom training payload configuration to the mock API server backend and watch real-time output updates.
                </p>

                {/* Hyperparameter mock values container */}
                <div className="bg-[#FAF8F3] border border-[#E5E3D8] rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#706F63]">Model Endpoint</span>
                    <span className="font-mono font-bold text-[#33332D]">gpt2-medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706F63]">LoRA Rank (r)</span>
                    <span className="font-mono font-bold text-[#33332D]">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706F63]">Alpha Scale</span>
                    <span className="font-mono font-bold text-[#33332D]">16</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#706F63]">Learning Rate</span>
                    <span className="font-mono font-bold text-[#33332D]">2.00e-4</span>
                  </div>
                </div>

                <button
                  onClick={runSimulatedJob}
                  disabled={simulatedJobState === 'running'}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5 ${
                    simulatedJobState === 'running'
                      ? 'bg-[#EFEDE4] text-[#706F63] border border-[#E5E3D8] cursor-not-allowed'
                      : 'bg-[#33332D] hover:bg-[#55534C] text-[#FAF9F6] font-bold'
                  }`}
                >
                  <Activity className="w-4 h-4 animate-pulse-slow" />
                  {simulatedJobState === 'running' ? 'Tuning Job Running...' : 'Simulate API Submit Post'}
                </button>

                {/* Simulated Server JSON response visual block */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#706F63] font-mono">Response Payload (POST /api/train):</span>
                  <div className="bg-[#FAF8F3] border border-[#E5E3D8] p-3 rounded-lg font-mono text-[10px] text-[#3E6335]">
                    {simStep >= 1 ? (
                      <div>
                        {`{`} <br />
                        &nbsp;&nbsp;{`"job_id": "${simJobId}",`} <br />
                        &nbsp;&nbsp;{`"status": "running",`} <br />
                        &nbsp;&nbsp;{`"background_thread_assigned": true`} <br />
                        {`}`}
                      </div>
                    ) : (
                      <span className="text-gray-400">Awaiting dispatch simulation...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right API console monitor */}
              <div className="lg:col-span-7 bg-[#FAF9F6] border border-[#E5E3D8] p-5 rounded-xl shadow-sm flex flex-col space-y-3 justify-between">
                <div className="border-b border-[#E5E3D8] pb-1.5 flex justify-between items-center">
                  <span className="text-xs font-serif font-bold text-[#33332D] flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-[#8A9A5B]" />
                    Backend Thread Console Log
                  </span>
                  {simulatedJobState === 'running' && (
                    <span className="text-[10px] bg-[#EAF2E8] text-[#3E6335] px-2 py-0.5 rounded border border-[#B2D8A6] font-mono animate-pulse font-bold">
                      ● active process
                    </span>
                  )}
                </div>

                <div className="h-[250px] overflow-auto p-3.5 bg-[#33332D] text-[#FAF9F6] font-mono text-[11px] leading-relaxed rounded-lg border border-[#55534C] space-y-2">
                  {simLogs.map((log, idx) => (
                    <div key={idx} className="transition-all">
                      {log}
                    </div>
                  ))}
                  {simulatedJobState === 'running' && (
                    <div className="flex gap-1 items-center italic text-[#8A9A5B] text-[10px] animate-pulse">
                      <span>⚡ PyTorch calculating parameters...</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#FAF6EE] rounded border border-[#E5E3D8] text-[11px] text-[#706F63] leading-relaxed">
                  This mock terminal illustrates the immediate release of the HTTP socket. The caller receives the `job_id` within milliseconds, while the heavy training loop is dispatched asynchronously onto Python background runtime threads.
                </div>
              </div>
            </motion.div>
          )}

          {activeSchemaTab === 'roadmap' && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Head stats tracker */}
              <div className="bg-[#FAF9F6] border border-[#E5E3D8] p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-serif font-bold text-[#33332D] text-[14px]">Engineering Task Planner</h4>
                  <p className="text-xs text-[#706F63]">Mark off milestones as you finalize the code sequence!</p>
                </div>
                <div className="bg-[#EFEDE4] px-3.5 py-1.5 rounded-lg border border-[#D5D3C7] text-xs font-mono font-bold text-[#55534C]">
                  Tasks Finished: {Object.values(completedMilestones).filter(Boolean).length} / {Object.keys(completedMilestones).length}
                </div>
              </div>

              {/* Milestones grid list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phase 1 */}
                <div className="bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#E5E3D8] pb-1.5">
                    <span className="text-xs font-serif font-bold text-[#33332D] flex items-center gap-1.5">
                      <span className="p-1 bg-[#FAF6EE] text-[#B58021] font-mono text-[10px] rounded border border-[#EFEDE4] font-bold">Phase 1</span>
                      Offline Streamlit Proof of Concept
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div
                      onClick={() => toggleMilestone('m1_1')}
                      className={`flex gap-3 items-start p-2.5 rounded-lg border transition-all cursor-pointer ${
                        completedMilestones.m1_1 ? 'bg-[#EAF2E8]/40 border-[#B2D8A6]' : 'bg-[#FAF8F3]/50 border-[#E5E3D8] hover:border-gray-300'
                      }`}
                    >
                      <button className="pt-0.5" id="btn-milestone-m1-1">
                        <CheckCircle className={`w-4 h-4 ${completedMilestones.m1_1 ? 'text-[#8A9A5B] fill-[#8A9A5B]/15' : 'text-gray-300'}`} />
                      </button>
                      <div className="text-xs">
                        <span className={`font-semibold text-[#33332D] block ${completedMilestones.m1_1 ? 'line-through opacity-60' : ''}`}>M1.1: Local Sliders UI Widgets</span>
                        <span className="text-[#706F63] text-[11px]">Integrate config inputs for model name, r, alpha, precision, training epochs, and dataset paths.</span>
                      </div>
                    </div>

                    <div
                      onClick={() => toggleMilestone('m1_2')}
                      className={`flex gap-3 items-start p-2.5 rounded-lg border transition-all cursor-pointer ${
                        completedMilestones.m1_2 ? 'bg-[#EAF2E8]/40 border-[#B2D8A6]' : 'bg-[#FAF8F3]/50 border-[#E5E3D8] hover:border-gray-300'
                      }`}
                    >
                      <button className="pt-0.5" id="btn-milestone-m1-2">
                        <CheckCircle className={`w-4 h-4 ${completedMilestones.m1_2 ? 'text-[#8A9A5B] fill-[#8A9A5B]/15' : 'text-gray-300'}`} />
                      </button>
                      <div className="text-xs">
                        <span className={`font-semibold text-[#33332D] block ${completedMilestones.m1_2 ? 'line-through opacity-60' : ''}`}>M1.2: Base Model Lock Mechanism</span>
                        <span className="text-[#706F63] text-[11px]">Write PyTorch script verifying pre-trained backbone model parameters freeze parameters perfectly to preserve weights.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#E5E3D8] pb-1.5">
                    <span className="text-xs font-serif font-bold text-[#33332D] flex items-center gap-1.5">
                      <span className="p-1 bg-[#FAF6EE] text-[#B58021] font-mono text-[10px] rounded border border-[#EFEDE4] font-bold">Phase 2</span>
                      Decouple REST Server Logic
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div
                      onClick={() => toggleMilestone('m2_1')}
                      className={`flex gap-3 items-start p-2.5 rounded-lg border transition-all cursor-pointer ${
                        completedMilestones.m2_1 ? 'bg-[#EAF2E8]/40 border-[#B2D8A6]' : 'bg-[#FAF8F3]/50 border-[#E5E3D8] hover:border-gray-300'
                      }`}
                    >
                      <button className="pt-0.5" id="btn-milestone-m2-1">
                        <CheckCircle className={`w-4 h-4 ${completedMilestones.m2_1 ? 'text-[#8A9A5B] fill-[#8A9A5B]/15' : 'text-gray-300'}`} />
                      </button>
                      <div className="text-xs">
                        <span className={`font-semibold text-[#33332D] block ${completedMilestones.m2_1 ? 'line-through opacity-60' : ''}`}>M2.1: FastAPI Status Polling API</span>
                        <span className="text-[#706F63] text-[11px]">Map inputs to Pydantic validator models. Return immediate UUID while running actual jobs in background.</span>
                      </div>
                    </div>

                    <div
                      onClick={() => toggleMilestone('m2_2')}
                      className={`flex gap-3 items-start p-2.5 rounded-lg border transition-all cursor-pointer ${
                        completedMilestones.m2_2 ? 'bg-[#EAF2E8]/40 border-[#B2D8A6]' : 'bg-[#FAF8F3]/50 border-[#E5E3D8] hover:border-gray-300'
                      }`}
                    >
                      <button className="pt-0.5" id="btn-milestone-m2-2">
                        <CheckCircle className={`w-4 h-4 ${completedMilestones.m2_2 ? 'text-[#8A9A5B] fill-[#8A9A5B]/15' : 'text-gray-300'}`} />
                      </button>
                      <div className="text-xs">
                        <span className={`font-semibold text-[#33332D] block ${completedMilestones.m2_2 ? 'line-through opacity-60' : ''}`}>M2.2: Streamlit Line-Chart Sockets</span>
                        <span className="text-[#706F63] text-[11px]">Configure Streamlit frontend client calling status routes to feed dynamic line elements for training lines.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#E5E3D8] pb-1.5">
                    <span className="text-xs font-serif font-bold text-[#33332D] flex items-center gap-1.5">
                      <span className="p-1 bg-[#FAF6EE] text-[#B58021] font-mono text-[10px] rounded border border-[#EFEDE4] font-bold">Phase 3</span>
                      Multi-user Celery Orchestration
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div
                      onClick={() => toggleMilestone('m3_1')}
                      className={`flex gap-3 items-start p-2.5 rounded-lg border transition-all cursor-pointer ${
                        completedMilestones.m3_1 ? 'bg-[#EAF2E8]/40 border-[#B2D8A6]' : 'bg-[#FAF8F3]/50 border-[#E5E3D8] hover:border-gray-300'
                      }`}
                    >
                      <button className="pt-0.5" id="btn-milestone-m3-1">
                        <CheckCircle className={`w-4 h-4 ${completedMilestones.m3_1 ? 'text-[#8A9A5B] fill-[#8A9A5B]/15' : 'text-gray-300'}`} />
                      </button>
                      <div className="text-xs">
                        <span className={`font-semibold text-[#33332D] block ${completedMilestones.m3_1 ? 'line-through opacity-60' : ''}`}>M3.1: Celery + Redis Task Brokers</span>
                        <span className="text-[#706F63] text-[11px]">Swap thread-loops with persistent task runners. Support job concurrency across multi-GPU infrastructures.</span>
                      </div>
                    </div>

                    <div
                      onClick={() => toggleMilestone('m3_2')}
                      className={`flex gap-3 items-start p-2.5 rounded-lg border transition-all cursor-pointer ${
                        completedMilestones.m3_2 ? 'bg-[#EAF2E8]/40 border-[#B2D8A6]' : 'bg-[#FAF8F3]/50 border-[#E5E3D8] hover:border-gray-300'
                      }`}
                    >
                      <button className="pt-0.5" id="btn-milestone-m3-2">
                        <CheckCircle className={`w-4 h-4 ${completedMilestones.m3_2 ? 'text-[#8A9A5B] fill-[#8A9A5B]/15' : 'text-gray-300'}`} />
                      </button>
                      <div className="text-xs">
                        <span className={`font-semibold text-[#33332D] block ${completedMilestones.m3_2 ? 'line-through opacity-60' : ''}`}>M3.2: Persistent Database State</span>
                        <span className="text-[#706F63] text-[11px]">Deploy SQLite schema configuration to persist historically executed job adapters safely.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase 4 */}
                <div className="bg-[#FAF9F6] border border-[#E5E3D8] rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#E5E3D8] pb-1.5">
                    <span className="text-xs font-serif font-bold text-[#33332D] flex items-center gap-1.5">
                      <span className="p-1 bg-[#FAF6EE] text-[#B58021] font-mono text-[10px] rounded border border-[#EFEDE4] font-bold">Phase 4</span>
                      Adapters Export & Model Hub
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div
                      onClick={() => toggleMilestone('m4_1')}
                      className={`flex gap-3 items-start p-2.5 rounded-lg border transition-all cursor-pointer ${
                        completedMilestones.m4_1 ? 'bg-[#EAF2E8]/40 border-[#B2D8A6]' : 'bg-[#FAF8F3]/50 border-[#E5E3D8] hover:border-gray-300'
                      }`}
                    >
                      <button className="pt-0.5" id="btn-milestone-m4-1">
                        <CheckCircle className={`w-4 h-4 ${completedMilestones.m4_1 ? 'text-[#8A9A5B] fill-[#8A9A5B]/15' : 'text-gray-300'}`} />
                      </button>
                      <div className="text-xs">
                        <span className={`font-semibold text-[#33332D] block ${completedMilestones.m4_1 ? 'line-through opacity-60' : ''}`}>M4.1: Safetensors Hugging Face Push</span>
                        <span className="text-[#706F63] text-[11px]">Write script calling Hugging Face Hub `push_to_hub` mechanism to publish trained model layers directly to custom public metrics.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
