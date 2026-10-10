/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PyTorchArchitectureSnippet {
  id: string;
  title: string;
  filename: string;
  torchCode: string;
  tensorShapes: string;
  inductiveBiasSummary: string;
}

export const PYTORCH_SNIPPETS: Record<string, PyTorchArchitectureSnippet> = {
  perceptron: {
    id: 'perceptron',
    title: 'Single Neuron (Perceptron)',
    filename: 'perceptron_module.py',
    tensorShapes: 'Input: [Batch, In_Features] -> Output: [Batch, 1]',
    inductiveBiasSummary: 'Linear hyperplane decision boundary: y = Step(W · x + b)',
    torchCode: `import torch
import torch.nn as nn

class Perceptron(nn.Module):
    """Atomic linear unit with step or sigmoid threshold."""
    def __init__(self, in_features: int):
        super().__init__()
        # Learnable weight vector and scalar bias
        self.linear = nn.Linear(in_features, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: [Batch, in_features]
        logits = self.linear(x)
        # Binary threshold step function
        return torch.where(logits >= 0.0, 1.0, 0.0)

# Verification
model = Perceptron(in_features=2)
x = torch.tensor([[1.0, 1.0], [0.0, 1.0], [0.0, 0.0]])
print("Predictions:", model(x).squeeze(-1))`,
  },

  mlp: {
    id: 'mlp',
    title: 'Multilayer Perceptron (MLP)',
    filename: 'mlp_module.py',
    tensorShapes: 'Input: [Batch, In_Dim] -> Hidden: [Batch, Hidden_Dim] -> Output: [Batch, Out_Dim]',
    inductiveBiasSummary: 'Universal continuous function approximation via non-linear space folding',
    torchCode: `import torch
import torch.nn as nn

class MultilayerPerceptron(nn.Module):
    """Feedforward network with space-warping ReLU hidden layers."""
    def __init__(self, in_dim: int = 784, hidden_dim: int = 256, out_dim: int = 10):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, out_dim)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: [Batch, in_dim]
        # Intermediate layers fold the geometry to classify non-linear boundaries (e.g. XOR)
        return self.net(x)

# Verification
model = MultilayerPerceptron(in_dim=4, hidden_dim=16, out_dim=2)
dummy_x = torch.randn(8, 4)
print("MLP Output Shape:", model(dummy_x).shape)  # [8, 2]`,
  },

  resnet: {
    id: 'resnet',
    title: 'Residual Network (ResNet Block)',
    filename: 'resnet_block.py',
    tensorShapes: 'Input: [Batch, Channels, H, W] -> Output: [Batch, Channels, H, W]',
    inductiveBiasSummary: 'Additive identity highway: y = x + F(x) preventing vanishing gradients',
    torchCode: `import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    """The fundamental ResNet building block with identity skip connection."""
    def __init__(self, channels: int):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Identity anchor
        identity = x

        # Residual transform F(x)
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)
        out = self.conv2(out)
        out = self.bn2(out)

        # Skip addition: dy/dx = 1 + dF/dx (gradients do not vanish)
        out += identity
        return self.relu(out)

# Verification
block = ResidualBlock(channels=64)
x = torch.randn(2, 64, 32, 32)
print("ResNet Block Output Shape:", block(x).shape)  # [2, 64, 32, 32]`,
  },

  rnn: {
    id: 'rnn',
    title: 'Recurrent Neural Network (RNN Cell)',
    filename: 'vanilla_rnn_cell.py',
    tensorShapes: 'Input: [Batch, In_Dim], Prev State: [Batch, Hidden_Dim] -> Next State: [Batch, Hidden_Dim]',
    inductiveBiasSummary: 'Temporal Markovian parameter sharing across sequence timesteps',
    torchCode: `import torch
import torch.nn as nn

class VanillaRNNCell(nn.Module):
    """Single step recurrent cell with shared transition matrices."""
    def __init__(self, input_size: int, hidden_size: int):
        super().__init__()
        self.W_ih = nn.Linear(input_size, hidden_size)
        self.W_hh = nn.Linear(hidden_size, hidden_size, bias=False)
        self.activation = nn.Tanh()

    def forward(self, x_t: torch.Tensor, h_prev: torch.Tensor) -> torch.Tensor:
        # h_t = tanh(W_ih * x_t + W_hh * h_{t-1} + b)
        h_next = self.activation(self.W_ih(x_t) + self.W_hh(h_prev))
        return h_next

# Verification
cell = VanillaRNNCell(input_size=16, hidden_size=32)
x_t = torch.randn(4, 16)
h_0 = torch.zeros(4, 32)
h_1 = cell(x_t, h_0)
print("Next Hidden State Shape:", h_1.shape)  # [4, 32]`,
  },

  lstm: {
    id: 'lstm',
    title: 'Long Short-Term Memory (LSTM Cell)',
    filename: 'lstm_cell.py',
    tensorShapes: 'Input: [Batch, In_Dim], States (h, c): [Batch, Hidden_Dim] -> New States: [Batch, Hidden_Dim]',
    inductiveBiasSummary: 'Linear cell state conveyor belt with learned forget, input, and output gates',
    torchCode: `import torch
import torch.nn as nn

class LSTMCell(nn.Module):
    """Gated recurrent unit preserving gradient flow via additive cell highway."""
    def __init__(self, input_size: int, hidden_size: int):
        super().__init__()
        self.hidden_size = hidden_size
        # Combined projection for 4 gates: Forget (f), Input (i), Candidate (g), Output (o)
        self.gates_proj = nn.Linear(input_size + hidden_size, 4 * hidden_size)

    def forward(self, x_t: torch.Tensor, states: tuple[torch.Tensor, torch.Tensor]):
        h_prev, c_prev = states
        combined = torch.cat([x_t, h_prev], dim=1)
        gates = self.gates_proj(combined)

        f_raw, i_raw, g_raw, o_raw = gates.chunk(4, dim=1)
        
        f = torch.sigmoid(f_raw)  # Forget gate
        i = torch.sigmoid(i_raw)  # Input gate
        c_cand = torch.tanh(g_raw) # Candidate update
        o = torch.sigmoid(o_raw)  # Output gate

        # Additive cell highway: C_t = f * C_{t-1} + i * C_cand
        c_t = f * c_prev + i * c_cand
        h_t = o * torch.tanh(c_t)

        return h_t, c_t

# Verification
lstm = LSTMCell(input_size=32, hidden_size=64)
x = torch.randn(4, 32)
h, c = torch.zeros(4, 64), torch.zeros(4, 64)
h_new, c_new = lstm(x, (h, c))
print("LSTM Cell Highway Output:", h_new.shape, c_new.shape)`,
  },

  transformer_standard: {
    id: 'transformer_standard',
    title: 'Transformer (Multi-Head Self-Attention)',
    filename: 'scaled_dot_product_attention.py',
    tensorShapes: 'Q, K, V: [Batch, Seq_Len, Hidden_Dim] -> Output: [Batch, Seq_Len, Hidden_Dim]',
    inductiveBiasSummary: 'Dynamic all-to-all token interaction: Softmax(QK^T / sqrt(d_k)) V',
    torchCode: `import math
import torch
import torch.nn as nn

class MultiHeadSelfAttention(nn.Module):
    """Scaled Dot-Product Multi-Head Attention layer."""
    def __init__(self, d_model: int = 512, num_heads: int = 8):
        super().__init__()
        assert d_model % num_heads == 0
        self.d_k = d_model // num_heads
        self.num_heads = num_heads
        
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.v_proj = nn.Linear(d_model, d_model)
        self.out_proj = nn.Linear(d_model, d_model)

    def forward(self, x: torch.Tensor, mask: torch.Tensor | None = None) -> torch.Tensor:
        B, L, D = x.shape
        
        # Project and reshape into heads: [B, num_heads, L, d_k]
        Q = self.q_proj(x).view(B, L, self.num_heads, self.d_k).transpose(1, 2)
        K = self.k_proj(x).view(B, L, self.num_heads, self.d_k).transpose(1, 2)
        V = self.v_proj(x).view(B, L, self.num_heads, self.d_k).transpose(1, 2)

        # Scaled attention scores: Softmax(Q @ K.T / sqrt(d_k))
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        
        attn_weights = torch.softmax(scores, dim=-1)
        # Weighted context aggregation
        context = torch.matmul(attn_weights, V)

        # Concatenate heads and project out
        context = context.transpose(1, 2).contiguous().view(B, L, D)
        return self.out_proj(context)

# Verification
mha = MultiHeadSelfAttention(d_model=256, num_heads=4)
tokens = torch.randn(2, 16, 256)
print("Transformer Attention Output:", mha(tokens).shape)  # [2, 16, 256]`,
  },

  mamba: {
    id: 'mamba',
    title: 'Mamba (Selective State-Space Model Block)',
    filename: 'mamba_selective_ssm.py',
    tensorShapes: 'Input: [Batch, Seq_Len, D_Model] -> Output: [Batch, Seq_Len, D_Model]',
    inductiveBiasSummary: 'Linear O(N) continuous state evolution with input-dependent dynamic selective gates',
    torchCode: `import torch
import torch.nn as nn
import torch.nn.functional as F

class MambaSelectiveSSM(nn.Module):
    """Selective State-Space Block: Linear time O(L) and constant O(1) state memory."""
    def __init__(self, d_model: int = 512, d_state: int = 16):
        super().__init__()
        self.d_model = d_model
        self.d_state = d_state

        # Continuous diagonal transition matrix parameter A (log-spaced)
        self.A_log = nn.Parameter(torch.log(torch.arange(1, d_state + 1, dtype=torch.float32)).repeat(d_model, 1))
        # Input-dependent projections for B, C, and step size Delta
        self.x_proj = nn.Linear(d_model, d_state * 2 + 1)
        self.out_proj = nn.Linear(d_model, d_model)

    def forward(self, u: torch.Tensor) -> torch.Tensor:
        B, L, D = u.shape
        # Compute input-dependent parameters at each timestep: Delta, B, C
        params = self.x_proj(u)
        delta = F.softplus(params[..., :1])  # Continuous discretization step
        B_t = params[..., 1:1 + self.d_state] # Dynamic input gate
        C_t = params[..., 1 + self.d_state:]  # Dynamic output gate

        # Continuous discretization: A_bar = exp(Delta * A)
        A = -torch.exp(self.A_log)
        
        # Recurrent scan over sequence length L with linear O(L) complexity
        y = torch.zeros_like(u)
        h = torch.zeros(B, D, self.d_state, device=u.device)
        for t in range(L):
            delta_t = delta[:, t].unsqueeze(-1)  # [B, 1, 1]
            A_bar = torch.exp(delta_t * A)       # [B, D, d_state]
            B_bar = delta_t * B_t[:, t].unsqueeze(1) # [B, 1, d_state]
            
            # State update: h_t = A_bar * h_{t-1} + B_bar * u_t
            h = A_bar * h + B_bar * u[:, t].unsqueeze(-1)
            # Output observation: y_t = C_t * h_t
            y[:, t] = (h * C_t[:, t].unsqueeze(1)).sum(dim=-1)

        return self.out_proj(y)

# Verification
mamba_layer = MambaSelectiveSSM(d_model=128, d_state=16)
x = torch.randn(2, 64, 128)
print("Mamba SSM Output Shape:", mamba_layer(x).shape)  # [2, 64, 128]`,
  },

  gcn: {
    id: 'gcn',
    title: 'Graph Convolutional Network (GCN Layer)',
    filename: 'gcn_layer.py',
    tensorShapes: 'Node Features: [Num_Nodes, In_Dim], Adj Matrix: [Num_Nodes, Num_Nodes] -> [Num_Nodes, Out_Dim]',
    inductiveBiasSummary: 'Permutation-invariant neighborhood aggregation: H^(l+1) = D^(-1/2) A D^(-1/2) H^l W',
    torchCode: `import torch
import torch.nn as nn

class GraphConvolutionLayer(nn.Module):
    """Kipf & Welling (2017) localized first-order spectral graph convolution."""
    def __init__(self, in_features: int, out_features: int):
        super().__init__()
        self.weight = nn.Linear(in_features, out_features, bias=False)
        self.bias = nn.Parameter(torch.zeros(out_features))

    def forward(self, H: torch.Tensor, A_norm: torch.Tensor) -> torch.Tensor:
        # H shape: [Num_Nodes, in_features]
        # A_norm: Symmetrically normalized adjacency matrix with self-loops
        
        # 1. Linear feature transformation: H * W
        support = self.weight(H)
        # 2. Neighborhood message aggregation: A_norm * (H * W)
        out = torch.matmul(A_norm, support) + self.bias
        return torch.relu(out)

# Verification
gcn = GraphConvolutionLayer(in_features=8, out_features=16)
nodes = torch.randn(5, 8)  # 5 nodes with 8 features
adj = torch.eye(5) + 0.5   # Normalized adjacency with self-loops
print("GCN Layer Output Shape:", gcn(nodes, adj).shape)  # [5, 16]`,
  },

  diffusion: {
    id: 'diffusion',
    title: 'Denoising Diffusion Probabilistic Model (DDPM Step)',
    filename: 'ddpm_reverse_step.py',
    tensorShapes: 'Noisy Sample: [Batch, C, H, W], Timestep t: [Batch] -> Denoised Mean: [Batch, C, H, W]',
    inductiveBiasSummary: 'Continuous Gaussian score matching reversing thermal entropy dissipation',
    torchCode: `import math
import torch
import torch.nn as nn

class DiffusionDenoisingStep(nn.Module):
    """Score network computing reverse Langevin diffusion step x_{t-1} from x_t."""
    def __init__(self, channels: int = 64):
        super().__init__()
        self.time_embed = nn.Sequential(
            nn.Linear(1, channels),
            nn.SiLU(),
            nn.Linear(channels, channels)
        )
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)

    def forward(self, x_t: torch.Tensor, t: torch.Tensor, alpha_t: float, beta_t: float) -> torch.Tensor:
        # Predict Gaussian noise epsilon_theta(x_t, t)
        t_emb = self.time_embed(t).unsqueeze(-1).unsqueeze(-1)
        h = torch.relu(self.conv1(x_t) + t_emb)
        noise_pred = self.conv2(h)

        # Reverse step formula: x_{t-1} = 1/sqrt(alpha) * (x_t - beta/sqrt(1-alpha_bar) * noise)
        mean = (1.0 / math.sqrt(alpha_t)) * (x_t - (beta_t / math.sqrt(1.0 - alpha_t)) * noise_pred)
        return mean

# Verification
ddpm = DiffusionDenoisingStep(channels=32)
noisy_img = torch.randn(2, 32, 16, 16)
timestep = torch.tensor([[500.0], [500.0]])
print("Denoised Output Shape:", ddpm(noisy_img, timestep, 0.99, 0.01).shape)`,
  },
};
