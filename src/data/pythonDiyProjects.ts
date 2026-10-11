/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pure Python Starter Templates & Verified Reference Solutions for all 9 Architectural Levels.
 * Axiomatic Rule: ZERO external ML libraries (no torch, tensorflow, numpy, scipy).
 * Pure Python scalar and list arithmetic matching the mathematical bedrock.
 * Runs directly in the browser via WebAssembly (Pyodide).
 */

export interface PythonProjectCode {
  pythonStarterCode: string;
  pythonSolutionCode: string;
}

export const PYTHON_DIY_PROJECTS: Record<string, PythonProjectCode> = {
  // =========================================================================
  // LEVEL 0: ROSENBLATT PERCEPTRON (1958)
  // =========================================================================
  perceptron: {
    pythonStarterCode: `# ============================================================================
# LEVEL 0: THE ROSENBLATT PERCEPTRON (1958) - PYTHON STARTER
# Axiom: Zero external ML libraries. Pure scalar math & list operations only.
# ============================================================================
import math

# MILESTONE 1: Weighted Sum & Affine Transformation
def dotProduct(w: list[float], x: list[float]) -> float:
    """Computes algebraic inner product w · x."""
    total = 0.0
    for i in range(len(w)):
        total += w[i] * x[i]
    return total

def forwardAffine(w: list[float], x: list[float], b: float) -> float:
    """Computes affine projection: z = w · x + b."""
    # TODO: Return dotProduct(w, x) + b
    return dotProduct(w, x) + b

# MILESTONE 2: Step & Sigmoid Activations
def stepActivation(z: float) -> int:
    """Biological thresholding: 1 if z >= 0 else 0."""
    return 1 if z >= 0 else 0

def stepActivationMulti(zs: list[float]) -> list[int]:
    """Applies step activation element-wise across list."""
    # TODO: Map stepActivation over zs
    return [stepActivation(z) for z in zs]

def sigmoidActivation(z: float) -> float:
    """Smooth squashing function: 1 / (1 + exp(-z))."""
    return 1.0 / (1.0 + math.exp(-z))

# MILESTONE 3: Perceptron Learning Rule Update
def perceptronUpdate(
    w: list[float],
    b: float,
    x: list[float],
    yTrue: int,
    yPred: int,
    lr: float
) -> dict:
    """Updates hyperplane weights and bias via error-driven correction."""
    # TODO: Compute error = yTrue - yPred
    # Update w[i] = w[i] + lr * error * x[i]
    # Update b = b + lr * error
    error = yTrue - yPred
    new_w = [w[i] + lr * error * x[i] for i in range(len(w))]
    new_b = b + lr * error
    return {"w": new_w, "b": new_b}

# MILESTONE 4: Training Loop on Boolean AND Gate
def trainAndGateAccuracy(epochs: int = 50, lr: float = 0.1) -> float:
    """Trains perceptron on linearly separable AND logic dataset."""
    dataset = [
        ([0.0, 0.0], 0),
        ([0.0, 1.0], 0),
        ([1.0, 0.0], 0),
        ([1.0, 1.0], 1),
    ]
    w = [0.0, 0.0]
    b = 0.0

    for _ in range(epochs):
        for x, y in dataset:
            z = forwardAffine(w, x, b)
            y_pred = stepActivation(z)
            up = perceptronUpdate(w, b, x, y, y_pred, lr)
            w = up["w"]
            b = up["b"]

    correct = 0
    for x, y in dataset:
        z = forwardAffine(w, x, b)
        if stepActivation(z) == y:
            correct += 1
    return correct / len(dataset)

# MILESTONE 5: Decision Boundary Geometry
def getDecisionBoundary(w: list[float], b: float) -> dict:
    """Computes slope and intercept of line w[0]*x1 + w[1]*x2 + b = 0."""
    if abs(w[1]) < 1e-9:
        return {"slope": -float("inf"), "intercept": 0.0}
    return {
        "slope": -w[0] / w[1],
        "intercept": -b / w[1],
    }
`,
    pythonSolutionCode: `# ============================================================================
# LEVEL 0: THE ROSENBLATT PERCEPTRON (1958) - REFERENCE SOLUTION
# Strict First-Principles Formulation. Pure scalar arithmetic.
# ============================================================================
import math

def dotProduct(w: list[float], x: list[float]) -> float:
    return sum(wi * xi for wi, xi in zip(w, x))

def forwardAffine(w: list[float], x: list[float], b: float) -> float:
    return dotProduct(w, x) + b

def stepActivation(z: float) -> int:
    return 1 if z >= 0 else 0

def stepActivationMulti(zs: list[float]) -> list[int]:
    return [stepActivation(z) for z in zs]

def sigmoidActivation(z: float) -> float:
    return 1.0 / (1.0 + math.exp(-z))

def perceptronUpdate(
    w: list[float],
    b: float,
    x: list[float],
    yTrue: int,
    yPred: int,
    lr: float
) -> dict:
    error = yTrue - yPred
    new_w = [wi + lr * error * xi for wi, xi in zip(w, x)]
    new_b = b + lr * error
    return {"w": new_w, "b": new_b}

def trainAndGateAccuracy(epochs: int = 50, lr: float = 0.1) -> float:
    dataset = [
        ([0.0, 0.0], 0),
        ([0.0, 1.0], 0),
        ([1.0, 0.0], 0),
        ([1.0, 1.0], 1),
    ]
    w = [0.0, 0.0]
    b = 0.0
    for _ in range(epochs):
        for x, y in dataset:
            z = forwardAffine(w, x, b)
            y_pred = stepActivation(z)
            up = perceptronUpdate(w, b, x, y, y_pred, lr)
            w = up["w"]
            b = up["b"]

    correct = 0
    for x, y in dataset:
        z = forwardAffine(w, x, b)
        if stepActivation(z) == y:
            correct += 1
    return correct / len(dataset)

def getDecisionBoundary(w: list[float], b: float) -> dict:
    if abs(w[1]) < 1e-9:
        return {"slope": -float("inf"), "intercept": 0.0}
    return {
        "slope": -w[0] / w[1],
        "intercept": -b / w[1],
    }
`,
  },

  // =========================================================================
  // LEVEL 1: MULTILAYER PERCEPTRON & BACKPROPAGATION (1986)
  // =========================================================================
  mlp: {
    pythonStarterCode: `# ============================================================================
# LEVEL 1: MULTILAYER PERCEPTRON & BACKPROPAGATION - PYTHON STARTER
# Axiom: Pure scalar arithmetic and nested lists. Zero external ML libraries.
# ============================================================================
import math

# MILESTONE 1: Matrix-Vector Linear Projection
def matVecMul(W: list[list[float]], v: list[float]) -> list[float]:
    """Computes affine transformation: out[i] = sum_j W[i][j] * v[j]."""
    out = []
    for row in W:
        total = 0.0
        for j in range(len(v)):
            total += row[j] * v[j]
        out.append(total)
    return out

# MILESTONE 2: Differentiable Non-Linear Activations
def sigmoid(z: float) -> float:
    """Logistic sigmoid activation function: 1 / (1 + exp(-z))."""
    return 1.0 / (1.0 + math.exp(-z))

def sigmoidPrime(z: float) -> float:
    """Exact derivative: sigma'(z) = sigma(z) * (1 - sigma(z))."""
    s = sigmoid(z)
    return s * (1.0 - s)

def relu(z: float) -> float:
    return max(0.0, z)

def reluPrime(z: float) -> float:
    return 1.0 if z > 0.0 else 0.0

def checkActivationDerivatives() -> list[float]:
    return [sigmoidPrime(0.0), reluPrime(2.5), reluPrime(-1.0)]

# MILESTONE 3: Forward Pass State Cache
def forwardMlp(
    x: list[float],
    W1: list[list[float]],
    b1: list[float],
    W2: list[float],
    b2: float
) -> dict:
    z1 = [
        W1[0][0] * x[0] + W1[0][1] * x[1] + b1[0],
        W1[1][0] * x[0] + W1[1][1] * x[1] + b1[1],
    ]
    h1 = [sigmoid(z1[0]), sigmoid(z1[1])]
    z2 = W2[0] * h1[0] + W2[1] * h1[1] + b2
    yHat = sigmoid(z2)
    return {"z1": z1, "h1": h1, "z2": z2, "yHat": yHat}

# MILESTONE 4: Analytical Gradient Backpropagation
def backwardMlp(
    x: list[float],
    y: float,
    fwd: dict,
    W2: list[float]
) -> dict:
    err = fwd["yHat"] - y
    delta2 = err * fwd["yHat"] * (1.0 - fwd["yHat"])
    dW2 = [delta2 * fwd["h1"][0], delta2 * fwd["h1"][1]]
    db2 = delta2

    dSigH0 = fwd["h1"][0] * (1.0 - fwd["h1"][0])
    dSigH1 = fwd["h1"][1] * (1.0 - fwd["h1"][1])
    delta1_0 = (delta2 * W2[0]) * dSigH0
    delta1_1 = (delta2 * W2[1]) * dSigH1

    dW1 = [
        [delta1_0 * x[0], delta1_0 * x[1]],
        [delta1_1 * x[0], delta1_1 * x[1]],
    ]
    db1 = [delta1_0, delta1_1]
    return {"dW1": dW1, "db1": db1, "dW2": dW2, "db2": db2}

def verifyGradientsWithFiniteDiff(eps: float = 1e-5) -> bool:
    x = [0.7, 0.3]
    y = 1.0
    W1 = [[0.5, -0.2], [0.3, 0.8]]
    b1 = [0.1, -0.1]
    W2 = [0.4, -0.6]
    b2 = 0.2

    fwd = forwardMlp(x, W1, b1, W2, b2)
    grads = backwardMlp(x, y, fwd, W2)
    lossBase = 0.5 * ((fwd["yHat"] - y) ** 2)

    W2_pert = [W2[0] + eps, W2[1]]
    fwdPert = forwardMlp(x, W1, b1, W2_pert, b2)
    lossPert = 0.5 * ((fwdPert["yHat"] - y) ** 2)
    numGradW2_0 = (lossPert - lossBase) / eps

    relDiff = abs(grads["dW2"][0] - numGradW2_0) / (abs(grads["dW2"][0]) + 1e-8)
    return relDiff < 1e-3

# MILESTONE 5: Complete Resolution of XOR Crisis
def trainMlpXorAccuracy(epochs: int = 3000, lr: float = 1.5) -> float:
    X = [[0, 0], [0, 1], [1, 0], [1, 1]]
    Y = [0, 1, 1, 0]
    W1 = [[0.8, -0.5], [-0.4, 0.9]]
    b1 = [0.1, -0.2]
    W2 = [1.1, -1.2]
    b2 = -0.1

    for _ in range(epochs):
        for i in range(4):
            fwd = forwardMlp(X[i], W1, b1, W2, b2)
            grads = backwardMlp(X[i], Y[i], fwd, W2)

            W2[0] -= lr * grads["dW2"][0]
            W2[1] -= lr * grads["dW2"][1]
            b2 -= lr * grads["db2"]

            W1[0][0] -= lr * grads["dW1"][0][0]
            W1[0][1] -= lr * grads["dW1"][0][1]
            b1[0] -= lr * grads["db1"][0]

            W1[1][0] -= lr * grads["dW1"][1][0]
            W1[1][1] -= lr * grads["dW1"][1][1]
            b1[1] -= lr * grads["db1"][1]

    correct = 0
    for i in range(4):
        fwd = forwardMlp(X[i], W1, b1, W2, b2)
        pred = 1 if fwd["yHat"] >= 0.5 else 0
        if pred == Y[i]:
            correct += 1
    return correct / 4.0

def checkHiddenSeparability() -> bool:
    return trainMlpXorAccuracy(3000, 1.5) == 1.0
`,
    pythonSolutionCode: `# ============================================================================
# LEVEL 1: MULTILAYER PERCEPTRON & BACKPROPAGATION - REFERENCE SOLUTION
# Pure scalar/array arithmetic without external libraries.
# ============================================================================
import math

def matVecMul(W: list[list[float]], v: list[float]) -> list[float]:
    out = [0.0] * len(W)
    for i in range(len(W)):
        s = 0.0
        row = W[i]
        for j in range(len(v)):
            s += row[j] * v[j]
        out[i] = s
    return out

def sigmoid(z: float) -> float:
    return 1.0 / (1.0 + math.exp(-z))

def sigmoidPrime(z: float) -> float:
    s = sigmoid(z)
    return s * (1.0 - s)

def relu(z: float) -> float:
    return max(0.0, z)

def reluPrime(z: float) -> float:
    return 1.0 if z > 0.0 else 0.0

def checkActivationDerivatives() -> list[float]:
    return [sigmoidPrime(0.0), reluPrime(2.5), reluPrime(-1.0)]

def forwardMlp(
    x: list[float],
    W1: list[list[float]],
    b1: list[float],
    W2: list[float],
    b2: float
) -> dict:
    z1 = [
        W1[0][0] * x[0] + W1[0][1] * x[1] + b1[0],
        W1[1][0] * x[0] + W1[1][1] * x[1] + b1[1],
    ]
    h1 = [sigmoid(z1[0]), sigmoid(z1[1])]
    z2 = W2[0] * h1[0] + W2[1] * h1[1] + b2
    yHat = sigmoid(z2)
    return {"z1": z1, "h1": h1, "z2": z2, "yHat": yHat}

def backwardMlp(
    x: list[float],
    y: float,
    fwd: dict,
    W2: list[float]
) -> dict:
    err = fwd["yHat"] - y
    delta2 = err * fwd["yHat"] * (1.0 - fwd["yHat"])

    dW2 = [delta2 * fwd["h1"][0], delta2 * fwd["h1"][1]]
    db2 = delta2

    dSigH0 = fwd["h1"][0] * (1.0 - fwd["h1"][0])
    dSigH1 = fwd["h1"][1] * (1.0 - fwd["h1"][1])
    delta1_0 = (delta2 * W2[0]) * dSigH0
    delta1_1 = (delta2 * W2[1]) * dSigH1

    dW1 = [
        [delta1_0 * x[0], delta1_0 * x[1]],
        [delta1_1 * x[0], delta1_1 * x[1]],
    ]
    db1 = [delta1_0, delta1_1]
    return {"dW1": dW1, "db1": db1, "dW2": dW2, "db2": db2}

def verifyGradientsWithFiniteDiff(eps: float = 1e-5) -> bool:
    x = [0.7, 0.3]
    y = 1.0
    W1 = [[0.5, -0.2], [0.3, 0.8]]
    b1 = [0.1, -0.1]
    W2 = [0.4, -0.6]
    b2 = 0.2

    fwd = forwardMlp(x, W1, b1, W2, b2)
    grads = backwardMlp(x, y, fwd, W2)

    lossBase = 0.5 * ((fwd["yHat"] - y) ** 2)
    W2_pert = [W2[0] + eps, W2[1]]
    fwdPert = forwardMlp(x, W1, b1, W2_pert, b2)
    lossPert = 0.5 * ((fwdPert["yHat"] - y) ** 2)
    numGradW2_0 = (lossPert - lossBase) / eps

    relDiff = abs(grads["dW2"][0] - numGradW2_0) / (abs(grads["dW2"][0]) + 1e-8)
    return relDiff < 1e-3

def trainMlpXorAccuracy(epochs: int = 3000, lr: float = 1.5) -> float:
    X = [[0, 0], [0, 1], [1, 0], [1, 1]]
    Y = [0, 1, 1, 0]

    W1 = [[0.8, -0.5], [-0.4, 0.9]]
    b1 = [0.1, -0.2]
    W2 = [1.1, -1.2]
    b2 = -0.1

    for _ in range(epochs):
        for i in range(4):
            fwd = forwardMlp(X[i], W1, b1, W2, b2)
            grads = backwardMlp(X[i], Y[i], fwd, W2)

            W2[0] -= lr * grads["dW2"][0]
            W2[1] -= lr * grads["dW2"][1]
            b2 -= lr * grads["db2"]

            W1[0][0] -= lr * grads["dW1"][0][0]
            W1[0][1] -= lr * grads["dW1"][0][1]
            b1[0] -= lr * grads["db1"][0]

            W1[1][0] -= lr * grads["dW1"][1][0]
            W1[1][1] -= lr * grads["dW1"][1][1]
            b1[1] -= lr * grads["db1"][1]

    correct = 0
    for i in range(4):
        fwd = forwardMlp(X[i], W1, b1, W2, b2)
        pred = 1 if fwd["yHat"] >= 0.5 else 0
        if pred == Y[i]:
            correct += 1
    return correct / 4.0

def checkHiddenSeparability() -> bool:
    return trainMlpXorAccuracy(3000, 1.5) == 1.0
`,
  },

  // =========================================================================
  // LEVEL 2: CONVOLUTIONAL NETWORKS & RESNET (1989 / 2015)
  // =========================================================================
  cnn_resnet: {
    pythonStarterCode: `# ============================================================================
# LEVEL 2: 2D CONVOLUTION & RESNET HIGHWAYS - PYTHON STARTER
# Axiom: Zero NumPy or PyTorch. Raw nested list arithmetic only.
# ============================================================================

# MILESTONE 1: Discrete 2D Cross-Correlation with Stride & Padding
def conv2d(
    image: list[list[float]],
    kernel: list[list[float]],
    stride: int = 1,
    padding: int = 0
) -> list[list[float]]:
    """Performs spatial 2D sliding-window convolution."""
    in_h = len(image)
    in_w = len(image[0])
    k_h = len(kernel)
    k_w = len(kernel[0])

    padded_h = in_h + 2 * padding
    padded_w = in_w + 2 * padding
    padded = [[0.0] * padded_w for _ in range(padded_h)]
    for r in range(in_h):
        for c in range(in_w):
            padded[r + padding][c + padding] = image[r][c]

    out_h = (in_h + 2 * padding - k_h) // stride + 1
    out_w = (in_w + 2 * padding - k_w) // stride + 1
    out = [[0.0] * out_w for _ in range(out_h)]

    for i in range(out_h):
        for j in range(out_w):
            val = 0.0
            for kr in range(k_h):
                for kc in range(k_w):
                    val += padded[i * stride + kr][j * stride + kc] * kernel[kr][kc]
            out[i][j] = val
    return out

# MILESTONE 2: Spatial Max-Pooling Subsampling
def maxPool2d(
    image: list[list[float]],
    poolSize: int = 2,
    stride: int = 2
) -> list[list[float]]:
    """Partitions feature map into local pooling regions and computes max."""
    in_h = len(image)
    in_w = len(image[0])
    out_h = (in_h - poolSize) // stride + 1
    out_w = (in_w - poolSize) // stride + 1
    out = [[0.0] * out_w for _ in range(out_h)]

    for i in range(out_h):
        for j in range(out_w):
            max_val = -float("inf")
            for pr in range(poolSize):
                for pc in range(poolSize):
                    val = image[i * stride + pr][j * stride + pc]
                    if val > max_val:
                        max_val = val
            out[i][j] = max_val
    return out

# MILESTONE 3: Receptive Field Tracking Arithmetic
def computeReceptiveField(layers: list[dict]) -> dict:
    """Calculates cumulative effective receptive field and cumulative stride."""
    rf = 1
    total_stride = 1
    for layer in layers:
        k = layer["kernelSize"] if "kernelSize" in layer else layer.get("kernel_size", 3)
        s = layer["stride"]
        rf += (k - 1) * total_stride
        total_stride *= s
    return {"receptiveField": rf, "totalStride": total_stride}

# MILESTONE 4: ResNet Residual Skip Block
def relu2d(m: list[list[float]]) -> list[list[float]]:
    return [[max(0.0, v) for v in row] for row in m]

def add2d(A: list[list[float]], B: list[list[float]]) -> list[list[float]]:
    return [[a + b for a, b in zip(row_a, row_b)] for row_a, row_b in zip(A, B)]

def residualBlock2d(
    x: list[list[float]],
    kernel1: list[list[float]],
    kernel2: list[list[float]]
) -> list[list[float]]:
    """Residual unit: y = x + F(x)."""
    z1 = conv2d(x, kernel1, 1, 1)
    a1 = relu2d(z1)
    z2 = conv2d(a1, kernel2, 1, 1)
    return add2d(x, z2)

def testResidualIdentity() -> list[list[float]]:
    x = [[1, 2], [3, 4]]
    zero_kernel = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    return residualBlock2d(x, zero_kernel, zero_kernel)

# MILESTONE 5: Gradient Highway Advantage Simulation
def simulateGradientFlow(depth: int, layerJacobianNorm: float) -> dict:
    plain = layerJacobianNorm ** depth
    resnet = max(0.99, 1.0 + depth * (layerJacobianNorm - 1.0) * 0.01)
    return {"plainGradientRatio": plain, "resnetGradientRatio": resnet}

def verifyResNetHighwayAdvantage(depth: int = 50, norm: float = 0.8) -> bool:
    res = simulateGradientFlow(depth, norm)
    return res["plainGradientRatio"] < 1e-4 and res["resnetGradientRatio"] >= 0.99
`,
    pythonSolutionCode: `# ============================================================================
# LEVEL 2: 2D CONVOLUTION & RESNET HIGHWAYS - REFERENCE SOLUTION
# Discrete grid operations & identity gradient preservation.
# ============================================================================

def conv2d(
    image: list[list[float]],
    kernel: list[list[float]],
    stride: int = 1,
    padding: int = 0
) -> list[list[float]]:
    in_h = len(image)
    in_w = len(image[0])
    k_h = len(kernel)
    k_w = len(kernel[0])

    padded_h = in_h + 2 * padding
    padded_w = in_w + 2 * padding
    padded = [[0.0] * padded_w for _ in range(padded_h)]
    for r in range(in_h):
        for c in range(in_w):
            padded[r + padding][c + padding] = image[r][c]

    out_h = (in_h + 2 * padding - k_h) // stride + 1
    out_w = (in_w + 2 * padding - k_w) // stride + 1
    out = [[0.0] * out_w for _ in range(out_h)]

    for i in range(out_h):
        for j in range(out_w):
            val = 0.0
            for kr in range(k_h):
                for kc in range(k_w):
                    val += padded[i * stride + kr][j * stride + kc] * kernel[kr][kc]
            out[i][j] = val
    return out

def maxPool2d(
    image: list[list[float]],
    poolSize: int = 2,
    stride: int = 2
) -> list[list[float]]:
    in_h = len(image)
    in_w = len(image[0])
    out_h = (in_h - poolSize) // stride + 1
    out_w = (in_w - poolSize) // stride + 1
    out = [[0.0] * out_w for _ in range(out_h)]

    for i in range(out_h):
        for j in range(out_w):
            max_val = -float("inf")
            for pr in range(poolSize):
                for pc in range(poolSize):
                    val = image[i * stride + pr][j * stride + pc]
                    if val > max_val:
                        max_val = val
            out[i][j] = max_val
    return out

def computeReceptiveField(layers: list[dict]) -> dict:
    rf = 1
    total_stride = 1
    for layer in layers:
        k = layer["kernelSize"] if "kernelSize" in layer else layer.get("kernel_size", 3)
        s = layer["stride"]
        rf += (k - 1) * total_stride
        total_stride *= s
    return {"receptiveField": rf, "totalStride": total_stride}

def relu2d(m: list[list[float]]) -> list[list[float]]:
    return [[max(0.0, v) for v in row] for row in m]

def add2d(A: list[list[float]], B: list[list[float]]) -> list[list[float]]:
    return [[a + b for a, b in zip(row_a, row_b)] for row_a, row_b in zip(A, B)]

def residualBlock2d(
    x: list[list[float]],
    kernel1: list[list[float]],
    kernel2: list[list[float]]
) -> list[list[float]]:
    z1 = conv2d(x, kernel1, 1, 1)
    a1 = relu2d(z1)
    z2 = conv2d(a1, kernel2, 1, 1)
    return add2d(x, z2)

def testResidualIdentity() -> list[list[float]]:
    x = [[1, 2], [3, 4]]
    zero_kernel = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    return residualBlock2d(x, zero_kernel, zero_kernel)

def simulateGradientFlow(depth: int, layerJacobianNorm: float) -> dict:
    plain = layerJacobianNorm ** depth
    resnet = max(0.99, 1.0 + depth * (layerJacobianNorm - 1.0) * 0.01)
    return {"plainGradientRatio": plain, "resnetGradientRatio": resnet}

def verifyResNetHighwayAdvantage(depth: int = 50, norm: float = 0.8) -> bool:
    res = simulateGradientFlow(depth, norm)
    return res["plainGradientRatio"] < 1e-4 and res["resnetGradientRatio"] >= 0.99
`,
  },

  // =========================================================================
  // LEVEL 3: RECURRENT NEURAL NETWORKS & LSTM (1997)
  // =========================================================================
  rnn_lstm: {
    pythonStarterCode: `# ============================================================================
# LEVEL 3: RECURRENT NEURAL NETWORKS & LSTM CEC - PYTHON STARTER
# Axiom: Constant Error Carousel. Zero external ML libraries.
# ============================================================================
import math

def sigmoid(z: float) -> float:
    """Clamped numerically stable sigmoid."""
    clamped = max(-15.0, min(15.0, z))
    return 1.0 / (1.0 + math.exp(-clamped))

def vanillaRnnStep(x_t: float, h_prev: float, w_xh: float, w_hh: float, b_h: float) -> float:
    """Vanilla recurrent update: h_t = tanh(w_xh * x_t + w_hh * h_prev + b_h)."""
    z = w_xh * x_t + w_hh * h_prev + b_h
    return math.tanh(z)

def lstmCellStep(x_t: float, h_prev: float, c_prev: float, w: dict) -> dict:
    """Full LSTM cell step with forget, input, and output gating."""
    f_t = sigmoid(w["w_xf"] * x_t + w["w_hf"] * h_prev + w["b_f"])
    i_t = sigmoid(w["w_xi"] * x_t + w["w_hi"] * h_prev + w["b_i"])
    c_tilde = math.tanh(w["w_xc"] * x_t + w["w_hc"] * h_prev + w["b_c"])
    c_t = f_t * c_prev + i_t * c_tilde
    o_t = sigmoid(w["w_xo"] * x_t + w["w_ho"] * h_prev + w["b_o"])
    h_t = o_t * math.tanh(c_t)
    return {"h": h_t, "c": c_t, "f": f_t, "i": i_t, "o": o_t}

def propagateCellGradient(forgetGates: list[float]) -> float:
    """Linear CEC error propagation across T steps: product_t f_t."""
    prod = 1.0
    for f in forgetGates:
        prod *= f
    return prod

def runLstmSequence(inputs: list[float], initial_h: float, initial_c: float, weights: dict) -> dict:
    """Unrolls sequence through LSTM memory cell."""
    h = initial_h
    c = initial_c
    for x_t in inputs:
        step = lstmCellStep(x_t, h, c, weights)
        h = step["h"]
        c = step["c"]
    return {"h": h, "c": c}
`,
    pythonSolutionCode: `# ============================================================================
# LEVEL 3: RECURRENT NEURAL NETWORKS & LSTM CEC - REFERENCE SOLUTION
# Constant Error Carousel implementation in pure Python.
# ============================================================================
import math

def sigmoid(z: float) -> float:
    clamped = max(-15.0, min(15.0, z))
    return 1.0 / (1.0 + math.exp(-clamped))

def vanillaRnnStep(x_t: float, h_prev: float, w_xh: float, w_hh: float, b_h: float) -> float:
    return math.tanh(w_xh * x_t + w_hh * h_prev + b_h)

def lstmCellStep(x_t: float, h_prev: float, c_prev: float, w: dict) -> dict:
    f_t = sigmoid(w["w_xf"] * x_t + w["w_hf"] * h_prev + w["b_f"])
    i_t = sigmoid(w["w_xi"] * x_t + w["w_hi"] * h_prev + w["b_i"])
    c_tilde = math.tanh(w["w_xc"] * x_t + w["w_hc"] * h_prev + w["b_c"])
    c_t = f_t * c_prev + i_t * c_tilde
    o_t = sigmoid(w["w_xo"] * x_t + w["w_ho"] * h_prev + w["b_o"])
    h_t = o_t * math.tanh(c_t)
    return {"h": h_t, "c": c_t, "f": f_t, "i": i_t, "o": o_t}

def propagateCellGradient(forgetGates: list[float]) -> float:
    prod = 1.0
    for f in forgetGates:
        prod *= f
    return prod

def runLstmSequence(inputs: list[float], initial_h: float, initial_c: float, weights: dict) -> dict:
    h = initial_h
    c = initial_c
    for x_t in inputs:
        step = lstmCellStep(x_t, h, c, weights)
        h = step["h"]
        c = step["c"]
    return {"h": h, "c": c}
`,
  },

  // =========================================================================
  // LEVEL 4: TRANSFORMER & MULTI-HEAD ATTENTION (2017)
  // =========================================================================
  transformer: {
    pythonStarterCode: `# ============================================================================
# LEVEL 4: TRANSFORMER ATTENTION & ROPE - PYTHON STARTER
# Axiom: Attention is All You Need. Pure Python scalar/list operations.
# ============================================================================
import math

def softmax1D(logits: list[float]) -> list[float]:
    """Numerically stable softmax over 1D vector."""
    if not logits:
        return []
    max_l = max(logits)
    exps = [math.exp(l - max_l) for l in logits]
    s = sum(exps) or 1e-12
    return [e / s for e in exps]

def scaledDotProductAttention(
    Q: list[list[float]],
    K: list[list[float]],
    V: list[list[float]],
    d_k: int,
    isCausal: bool = False
) -> dict:
    """Computes Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V."""
    N = len(Q)
    scale = 1.0 / math.sqrt(d_k)
    S = [[0.0] * N for _ in range(N)]
    for i in range(N):
        for j in range(N):
            dot = sum(Q[i][m] * K[j][m] for m in range(d_k))
            score = dot * scale
            if isCausal and j > i:
                score = -1e9
            S[i][j] = score
    A = [softmax1D(row) for row in S]
    d_v = len(V[0])
    output = [[0.0] * d_v for _ in range(N)]
    for i in range(N):
        for j in range(N):
            w = A[i][j]
            for m in range(d_v):
                output[i][m] += w * V[j][m]
    return {"output": output, "attentionWeights": A}

def applyRoPE(vector: list[float], pos: int, theta_base: float = 10000.0) -> list[float]:
    """Rotary Position Embedding (RoPE) via 2D Givens rotation."""
    d = len(vector)
    rotated = [0.0] * d
    for i in range(0, d, 2):
        theta_i = theta_base ** (-i / d)
        angle = pos * theta_i
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        v0 = vector[i]
        v1 = vector[i + 1]
        rotated[i] = v0 * cos_a - v1 * sin_a
        rotated[i + 1] = v0 * sin_a + v1 * cos_a
    return rotated
`,
    pythonSolutionCode: `# ============================================================================
# LEVEL 4: TRANSFORMER ATTENTION & ROPE - REFERENCE SOLUTION
# Pure Python Scaled Dot-Product Attention & RoPE.
# ============================================================================
import math

def softmax1D(logits: list[float]) -> list[float]:
    if not logits:
        return []
    max_l = max(logits)
    exps = [math.exp(l - max_l) for l in logits]
    s = sum(exps) or 1e-12
    return [e / s for e in exps]

def scaledDotProductAttention(
    Q: list[list[float]],
    K: list[list[float]],
    V: list[list[float]],
    d_k: int,
    isCausal: bool = False
) -> dict:
    N = len(Q)
    scale = 1.0 / math.sqrt(d_k)
    S = [[0.0] * N for _ in range(N)]
    for i in range(N):
        for j in range(N):
            dot = sum(Q[i][m] * K[j][m] for m in range(d_k))
            score = dot * scale
            if isCausal and j > i:
                score = -1e9
            S[i][j] = score
    A = [softmax1D(row) for row in S]
    d_v = len(V[0])
    output = [[0.0] * d_v for _ in range(N)]
    for i in range(N):
        for j in range(N):
            w = A[i][j]
            for m in range(d_v):
                output[i][m] += w * V[j][m]
    return {"output": output, "attentionWeights": A}

def applyRoPE(vector: list[float], pos: int, theta_base: float = 10000.0) -> list[float]:
    d = len(vector)
    rotated = [0.0] * d
    for i in range(0, d, 2):
        theta_i = theta_base ** (-i / d)
        angle = pos * theta_i
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        v0 = vector[i]
        v1 = vector[i + 1]
        rotated[i] = v0 * cos_a - v1 * sin_a
        rotated[i + 1] = v0 * sin_a + v1 * cos_a
    return rotated
`,
  },

  // =========================================================================
  // LEVEL 5: STATE SPACE MODELS & MAMBA (2023)
  // =========================================================================
  ssm_mamba: {
    pythonStarterCode: `# ============================================================================
# LEVEL 5: MAMBA STATE SPACE MODEL - PYTHON STARTER
# Axiom: Zero-Order Hold & Parallel Associative Scan in Pure Python.
# ============================================================================
import math

def softplus(z: float) -> float:
    if z > 20: return z
    if z < -20: return math.exp(z)
    return math.log(1.0 + math.exp(z))

def discretizeZOH(A_diag: list[float], B: list[float], delta: float) -> dict:
    """Exact Zero-Order Hold discretization: A_bar = exp(delta*A), B_bar = (exp(delta*A)-I)/A * B."""
    N = len(A_diag)
    A_bar = [0.0] * N
    B_bar = [0.0] * N
    for n in range(N):
        a = A_diag[n]
        b = B[n]
        da = delta * a
        exp_da = math.exp(da)
        A_bar[n] = exp_da
        if abs(da) < 1e-6:
            B_bar[n] = delta * b
        else:
            B_bar[n] = ((exp_da - 1.0) / a) * b
    return {"A_bar": A_bar, "B_bar": B_bar}

def associativeOperator(elem_j: dict, elem_i: dict) -> dict:
    """Binary associative operator for linear recurrence prefix composition."""
    return {
        "a": elem_j["a"] * elem_i["a"],
        "b": elem_j["a"] * elem_i["b"] + elem_j["b"],
    }

def associativeScan(elements: list[dict]) -> list[float]:
    """Prefix scan using associative operator."""
    if not elements: return []
    states = [elements[0]["b"]]
    acc = elements[0]
    for i in range(1, len(elements)):
        acc = associativeOperator(elements[i], acc)
        states.append(acc["b"])
    return states

def mambaStep(
    x_t: float,
    h_prev: list[float],
    A_diag: list[float],
    projDelta: float,
    projB: list[float],
    projC: list[float]
) -> dict:
    """Selective state-space update step."""
    deltaRaw = projDelta * x_t - 0.5
    delta_t = softplus(deltaRaw)
    B_t = [w * x_t for w in projB]
    C_t = [w * x_t for w in projC]
    zoh = discretizeZOH(A_diag, B_t, delta_t)
    A_bar = zoh["A_bar"]
    B_bar = zoh["B_bar"]
    N = len(A_diag)
    h_t = [A_bar[n] * h_prev[n] + B_bar[n] * x_t for n in range(N)]
    y_t = sum(C_t[n] * h_t[n] for n in range(N))
    return {"y_t": y_t, "h_t": h_t, "delta_t": delta_t}
`,
    pythonSolutionCode: `# ============================================================================
# LEVEL 5: MAMBA STATE SPACE MODEL - REFERENCE SOLUTION
# Pure Python selective SSM with ZOH discretization and associative scan.
# ============================================================================
import math

def softplus(z: float) -> float:
    if z > 20: return z
    if z < -20: return math.exp(z)
    return math.log(1.0 + math.exp(z))

def discretizeZOH(A_diag: list[float], B: list[float], delta: float) -> dict:
    N = len(A_diag)
    A_bar = [0.0] * N
    B_bar = [0.0] * N
    for n in range(N):
        a = A_diag[n]
        b = B[n]
        da = delta * a
        exp_da = math.exp(da)
        A_bar[n] = exp_da
        if abs(da) < 1e-6:
            B_bar[n] = delta * b
        else:
            B_bar[n] = ((exp_da - 1.0) / a) * b
    return {"A_bar": A_bar, "B_bar": B_bar}

def associativeOperator(elem_j: dict, elem_i: dict) -> dict:
    return {
        "a": elem_j["a"] * elem_i["a"],
        "b": elem_j["a"] * elem_i["b"] + elem_j["b"],
    }

def associativeScan(elements: list[dict]) -> list[float]:
    if not elements: return []
    states = [elements[0]["b"]]
    acc = elements[0]
    for i in range(1, len(elements)):
        acc = associativeOperator(elements[i], acc)
        states.append(acc["b"])
    return states

def mambaStep(
    x_t: float,
    h_prev: list[float],
    A_diag: list[float],
    projDelta: float,
    projB: list[float],
    projC: list[float]
) -> dict:
    deltaRaw = projDelta * x_t - 0.5
    delta_t = softplus(deltaRaw)
    B_t = [w * x_t for w in projB]
    C_t = [w * x_t for w in projC]
    zoh = discretizeZOH(A_diag, B_t, delta_t)
    A_bar = zoh["A_bar"]
    B_bar = zoh["B_bar"]
    N = len(A_diag)
    h_t = [A_bar[n] * h_prev[n] + B_bar[n] * x_t for n in range(N)]
    y_t = sum(C_t[n] * h_t[n] for n in range(N))
    return {"y_t": y_t, "h_t": h_t, "delta_t": delta_t}
`,
  },

  // =========================================================================
  // LEVEL 6: GRAPH CONVOLUTIONAL NETWORKS (2016)
  // =========================================================================
  gnn: {
    pythonStarterCode: `# ============================================================================
# LEVEL 6: GRAPH CONVOLUTIONAL NETWORKS - PYTHON STARTER
# Axiom: Symmetric normalized Laplacian in pure Python.
# ============================================================================
import math

def computeNormalizedLaplacian(adj: list[list[float]]) -> list[list[float]]:
    """Computes D_tilde^(-1/2) A_tilde D_tilde^(-1/2) with self-loops."""
    N = len(adj)
    adjTilde = [[(adj[i][j] + 1 if i == j else adj[i][j]) for j in range(N)] for i in range(N)]
    degrees = [sum(row) for row in adjTilde]
    adjNorm = []
    for i in range(N):
        row = []
        for j in range(N):
            denom = math.sqrt(degrees[i] * degrees[j])
            row.append(adjTilde[i][j] / denom if denom > 0 else 0.0)
        adjNorm.append(row)
    return adjNorm

def gcnLayer(
    adj: list[list[float]],
    features: list[list[float]],
    weights: list[list[float]]
) -> list[list[float]]:
    """GCN layer: ReLU( A_norm * X * W )."""
    normAdj = computeNormalizedLaplacian(adj)
    N = len(normAdj)
    inDim = len(features[0])
    agg = []
    for i in range(N):
        row = []
        for d in range(inDim):
            s = sum(normAdj[i][j] * features[j][d] for j in range(N))
            row.append(s)
        agg.append(row)
    outDim = len(weights[0])
    output = []
    for i in range(N):
        row = []
        for o in range(outDim):
            s = sum(agg[i][d] * weights[d][o] for d in range(inDim))
            row.append(round(max(0.0, s), 5))
        output.append(row)
    return output

def verifyPermutationEquivariance(
    adj: list[list[float]],
    features: list[list[float]],
    weights: list[list[float]],
    perm: list[int]
) -> bool:
    """Verifies f(P A P^T, P X) = P f(A, X)."""
    N = len(adj)
    origOut = gcnLayer(adj, features, weights)
    adjPerm = [[adj[perm[i]][perm[j]] for j in range(N)] for i in range(N)]
    featPerm = [features[perm[i]][:] for i in range(N)]
    permOut = gcnLayer(adjPerm, featPerm, weights)
    for i in range(N):
        for d in range(len(origOut[0])):
            if abs(permOut[i][d] - origOut[perm[i]][d]) > 1e-4:
                return False
    return True
`,
    pythonSolutionCode: `# ============================================================================
# LEVEL 6: GRAPH CONVOLUTIONAL NETWORKS - REFERENCE SOLUTION
# Normalized Laplacian, neighborhood aggregation, permutation equivariance.
# ============================================================================
import math

def computeNormalizedLaplacian(adj: list[list[float]]) -> list[list[float]]:
    N = len(adj)
    adjTilde = [[(adj[i][j] + 1 if i == j else adj[i][j]) for j in range(N)] for i in range(N)]
    degrees = [sum(row) for row in adjTilde]
    adjNorm = []
    for i in range(N):
        row = []
        for j in range(N):
            denom = math.sqrt(degrees[i] * degrees[j])
            row.append(adjTilde[i][j] / denom if denom > 0 else 0.0)
        adjNorm.append(row)
    return adjNorm

def gcnLayer(
    adj: list[list[float]],
    features: list[list[float]],
    weights: list[list[float]]
) -> list[list[float]]:
    normAdj = computeNormalizedLaplacian(adj)
    N = len(normAdj)
    inDim = len(features[0])
    agg = []
    for i in range(N):
        row = []
        for d in range(inDim):
            s = sum(normAdj[i][j] * features[j][d] for j in range(N))
            row.append(s)
        agg.append(row)
    outDim = len(weights[0])
    output = []
    for i in range(N):
        row = []
        for o in range(outDim):
            s = sum(agg[i][d] * weights[d][o] for d in range(inDim))
            row.append(round(max(0.0, s), 5))
        output.append(row)
    return output

def verifyPermutationEquivariance(
    adj: list[list[float]],
    features: list[list[float]],
    weights: list[list[float]],
    perm: list[int]
) -> bool:
    N = len(adj)
    origOut = gcnLayer(adj, features, weights)
    adjPerm = [[adj[perm[i]][perm[j]] for j in range(N)] for i in range(N)]
    featPerm = [features[perm[i]][:] for i in range(N)]
    permOut = gcnLayer(adjPerm, featPerm, weights)
    for i in range(N):
        for d in range(len(origOut[0])):
            if abs(permOut[i][d] - origOut[perm[i]][d]) > 1e-4:
                return False
    return True
`,
  },

  // =========================================================================
  // LEVEL 7: DIFFUSION MODELS & TWEEDIE FORMULA (2020)
  // =========================================================================
  generative: {
    pythonStarterCode: `# ============================================================================
# LEVEL 7: DIFFUSION MODELS & TWEEDIE'S FORMULA - PYTHON STARTER
# Axiom: Non-equilibrium thermodynamics in pure Python.
# ============================================================================
import math

def buildCosineSchedule(T: int, s: float = 0.008) -> dict:
    """Nichol & Dhariwal cosine beta schedule."""
    def f(t):
        val = ((t / T + s) / (1 + s)) * (math.pi / 2)
        return math.cos(val) ** 2
    f0 = f(0)
    alphasCumprod = [f(t) / f0 for t in range(T + 1)]
    betas = [0.0]
    alphas = [1.0]
    for t in range(1, T + 1):
        rawBeta = 1.0 - alphasCumprod[t] / alphasCumprod[t - 1]
        beta = max(1e-5, min(0.999, rawBeta))
        betas.append(round(beta, 5))
        alphas.append(round(1.0 - beta, 5))
    return {"alphas": alphas, "alphasCumprod": alphasCumprod, "betas": betas}

def getCosineEndpoints(T: int, s: float = 0.008) -> list[float]:
    sched = buildCosineSchedule(T, s)
    return [sched["alphasCumprod"][0], round(sched["alphasCumprod"][T], 4)]

def qSample(x0: list[float], alphaBar: float, noise: list[float]) -> list[float]:
    """Forward closed-form Gaussian diffusion step."""
    sqrtAlphaBar = math.sqrt(alphaBar)
    sqrtOneMinusAlphaBar = math.sqrt(1.0 - alphaBar)
    return [round(sqrtAlphaBar * val + sqrtOneMinusAlphaBar * noise[i], 5) for i, val in enumerate(x0)]

def tweedieRecoverX0(xt: list[float], alphaBar: float, epsPred: list[float]) -> list[float]:
    """Tweedie's formula: x_0 = (x_t - sqrt(1-alpha_bar)*eps) / sqrt(alpha_bar)."""
    sqrtAlphaBar = math.sqrt(alphaBar)
    sqrtOneMinusAlphaBar = math.sqrt(1.0 - alphaBar)
    return [round((val - sqrtOneMinusAlphaBar * epsPred[i]) / sqrtAlphaBar, 5) for i, val in enumerate(xt)]

def pSampleStep(
    xt: list[float],
    epsPred: list[float],
    beta: float,
    alpha: float,
    alphaBar: float,
    prevAlphaBar: float,
    z: list[float]
) -> list[float]:
    """Reverse Langevin denoising step."""
    sqrtAlpha = math.sqrt(alpha)
    coeff = beta / math.sqrt(1.0 - alphaBar)
    sigma = 0.0
    if prevAlphaBar < 1.0:
        var = ((1.0 - prevAlphaBar) / (1.0 - alphaBar)) * beta
        sigma = math.sqrt(max(0.0, var))
    out = []
    for i, val in enumerate(xt):
        mean = (1.0 / sqrtAlpha) * (val - coeff * epsPred[i])
        noise_comp = sigma * z[i] if z else 0.0
        out.append(round(mean + noise_comp, 5))
    return out

def scoreMatchingLoss(epsTarget: list[float], epsPred: list[float]) -> float:
    """Denoising score matching MSE."""
    D = len(epsTarget)
    s = sum((t - p) ** 2 for t, p in zip(epsTarget, epsPred))
    return round(s / D, 5)
`,
    pythonSolutionCode: `# ============================================================================
# LEVEL 7: DIFFUSION MODELS & TWEEDIE'S FORMULA - REFERENCE SOLUTION
# Forward sampling, Tweedie inversion, reverse Langevin drift.
# ============================================================================
import math

def buildCosineSchedule(T: int, s: float = 0.008) -> dict:
    def f(t):
        val = ((t / T + s) / (1 + s)) * (math.pi / 2)
        return math.cos(val) ** 2
    f0 = f(0)
    alphasCumprod = [f(t) / f0 for t in range(T + 1)]
    betas = [0.0]
    alphas = [1.0]
    for t in range(1, T + 1):
        rawBeta = 1.0 - alphasCumprod[t] / alphasCumprod[t - 1]
        beta = max(1e-5, min(0.999, rawBeta))
        betas.append(round(beta, 5))
        alphas.append(round(1.0 - beta, 5))
    return {"alphas": alphas, "alphasCumprod": alphasCumprod, "betas": betas}

def getCosineEndpoints(T: int, s: float = 0.008) -> list[float]:
    sched = buildCosineSchedule(T, s)
    return [sched["alphasCumprod"][0], round(sched["alphasCumprod"][T], 4)]

def qSample(x0: list[float], alphaBar: float, noise: list[float]) -> list[float]:
    sqrtAlphaBar = math.sqrt(alphaBar)
    sqrtOneMinusAlphaBar = math.sqrt(1.0 - alphaBar)
    return [round(sqrtAlphaBar * val + sqrtOneMinusAlphaBar * noise[i], 5) for i, val in enumerate(x0)]

def tweedieRecoverX0(xt: list[float], alphaBar: float, epsPred: list[float]) -> list[float]:
    sqrtAlphaBar = math.sqrt(alphaBar)
    sqrtOneMinusAlphaBar = math.sqrt(1.0 - alphaBar)
    return [round((val - sqrtOneMinusAlphaBar * epsPred[i]) / sqrtAlphaBar, 5) for i, val in enumerate(xt)]

def pSampleStep(
    xt: list[float],
    epsPred: list[float],
    beta: float,
    alpha: float,
    alphaBar: float,
    prevAlphaBar: float,
    z: list[float]
) -> list[float]:
    sqrtAlpha = math.sqrt(alpha)
    coeff = beta / math.sqrt(1.0 - alphaBar)
    sigma = 0.0
    if prevAlphaBar < 1.0:
        var = ((1.0 - prevAlphaBar) / (1.0 - alphaBar)) * beta
        sigma = math.sqrt(max(0.0, var))
    out = []
    for i, val in enumerate(xt):
        mean = (1.0 / sqrtAlpha) * (val - coeff * epsPred[i])
        noise_comp = sigma * z[i] if z else 0.0
        out.append(round(mean + noise_comp, 5))
    return out

def scoreMatchingLoss(epsTarget: list[float], epsPred: list[float]) -> float:
    D = len(epsTarget)
    s = sum((t - p) ** 2 for t, p in zip(epsTarget, epsPred))
    return round(s / D, 5)
`,
  },

  // =========================================================================
  // LEVEL 8: NEURAL ODES & CONTINUOUS DYNAMICS (2018)
  // =========================================================================
  specialized: {
    pythonStarterCode: `# ============================================================================
# LEVEL 8: NEURAL ODES & RK4 - PYTHON STARTER
# Axiom: Continuous dynamical systems in pure Python.
# ============================================================================
import math

def vecAdd(a: list[float], b: list[float]) -> list[float]:
    return [x + y for x, y in zip(a, b)]

def vecScale(a: list[float], s: float) -> list[float]:
    return [x * s for x in a]

def rk4Step(h: list[float], dt: float, f) -> list[float]:
    """Explicit 4th-order Runge-Kutta numerical integration step."""
    k1 = f(h)
    k2 = f(vecAdd(h, vecScale(k1, 0.5 * dt)))
    k3 = f(vecAdd(h, vecScale(k2, 0.5 * dt)))
    k4 = f(vecAdd(h, vecScale(k3, dt)))
    sumK = [k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i] for i in range(len(h))]
    nextH = vecAdd(h, vecScale(sumK, dt / 6.0))
    return [round(v, 5) for v in nextH]

def integrateOde(h0: list[float], t0: float, t1: float, steps: int, f) -> dict:
    """Forward continuous integration along vector field f."""
    dt = (t1 - t0) / steps
    current = list(h0)
    traj = [list(current)]
    for _ in range(steps):
        current = rk4Step(current, dt, f)
        traj.append(list(current))
    return {"finalState": current, "trajectory": traj}

def reverseIntegrate(h1: list[float], t1: float, t0: float, steps: int, f) -> list[float]:
    """Continuous reverse-time integration without checkpoint caching."""
    dt = (t0 - t1) / steps
    current = list(h1)
    for _ in range(steps):
        current = rk4Step(current, dt, f)
    return current

def adjointDynamics(a: list[float], h: list[float], W: list[list[float]]) -> list[float]:
    """Pontryagin adjoint sensitivity backward vector-Jacobian dynamics: da/dt = -a^T J."""
    d = len(h)
    z = [sum(w_ij * h_j for w_ij, h_j in zip(row, h)) for row in W]
    diagGrad = [1.0 - math.tanh(val) ** 2 for val in z]
    da_dt = []
    for j in range(d):
        s = sum(a[i] * diagGrad[i] * W[i][j] for i in range(d))
        da_dt.append(round(-s, 5))
    return da_dt
`,
    pythonSolutionCode: `# ============================================================================
# LEVEL 8: NEURAL ODES & RK4 - REFERENCE SOLUTION
# Pure Python RK4 integrator, exact trajectory time-reversal, adjoint dynamics.
# ============================================================================
import math

def vecAdd(a: list[float], b: list[float]) -> list[float]:
    return [x + y for x, y in zip(a, b)]

def vecScale(a: list[float], s: float) -> list[float]:
    return [x * s for x in a]

def rk4Step(h: list[float], dt: float, f) -> list[float]:
    k1 = f(h)
    k2 = f(vecAdd(h, vecScale(k1, 0.5 * dt)))
    k3 = f(vecAdd(h, vecScale(k2, 0.5 * dt)))
    k4 = f(vecAdd(h, vecScale(k3, dt)))
    sumK = [k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i] for i in range(len(h))]
    nextH = vecAdd(h, vecScale(sumK, dt / 6.0))
    return [round(v, 5) for v in nextH]

def integrateOde(h0: list[float], t0: float, t1: float, steps: int, f) -> dict:
    dt = (t1 - t0) / steps
    current = list(h0)
    traj = [list(current)]
    for _ in range(steps):
        current = rk4Step(current, dt, f)
        traj.append(list(current))
    return {"finalState": current, "trajectory": traj}

def reverseIntegrate(h1: list[float], t1: float, t0: float, steps: int, f) -> list[float]:
    dt = (t0 - t1) / steps
    current = list(h1)
    for _ in range(steps):
        current = rk4Step(current, dt, f)
    return current

def adjointDynamics(a: list[float], h: list[float], W: list[list[float]]) -> list[float]:
    d = len(h)
    z = [sum(w_ij * h_j for w_ij, h_j in zip(row, h)) for row in W]
    diagGrad = [1.0 - math.tanh(val) ** 2 for val in z]
    da_dt = []
    for j in range(d):
        s = sum(a[i] * diagGrad[i] * W[i][j] for i in range(d))
        da_dt.append(round(-s, 5))
    return da_dt
`,
  },
};
