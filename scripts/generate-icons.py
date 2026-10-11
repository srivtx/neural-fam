"""Generate PWA icons (requires Pillow): python3 scripts/generate-icons.py
Draws a neural "family tree": one root neuron branching into children, on a dark tile.
"""
from PIL import Image, ImageDraw, ImageFilter
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
os.makedirs(OUT, exist_ok=True)

BG_TOP, BG_BOT = (28, 24, 21), (14, 12, 10)
# Node layout in a 0..100 box: (x, y, radius, colour); edges by index
NODES = [
    (50, 22, 8.5, (255, 138, 0)),    # 0 root
    (28, 50, 6.5, (67, 83, 255)),    # 1
    (72, 50, 6.5, (0, 168, 107)),    # 2
    (16, 78, 5.5, (139, 92, 246)),   # 3
    (40, 78, 5.5, (255, 59, 107)),   # 4
    (60, 78, 5.5, (255, 59, 107)),   # 5
    (84, 78, 5.5, (139, 92, 246)),   # 6
]
EDGES = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)]


def render(size, maskable=False, ss=4):
    S = size * ss
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    # vertical gradient background
    grad = Image.new('RGBA', (1, S))
    for y in range(S):
        t = y / (S - 1)
        grad.putpixel((0, y), tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3)) + (255,))
    bg = grad.resize((S, S))
    mask = Image.new('L', (S, S), 0)
    radius = 0 if maskable else int(S * 0.22)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=radius, fill=255)
    img.paste(bg, (0, 0), mask)

    # content box: maskable keeps content inside the central 62% safe zone
    scale = 0.62 if maskable else 0.80
    box = S * scale
    off = (S - box) / 2
    P = lambda x, y: (off + x / 100 * box, off + y / 100 * box)

    # soft glow behind nodes
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for x, y, r, c in NODES:
        px, py = P(x, y)
        rr = r / 100 * box * 2.2
        gd.ellipse([px - rr, py - rr, px + rr, py + rr], fill=c + (90,))
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.025))
    img = Image.alpha_composite(img, glow)

    d = ImageDraw.Draw(img)
    w = max(2, int(box * 0.028))
    for a, b in EDGES:
        ax, ay = P(NODES[a][0], NODES[a][1])
        bx, by = P(NODES[b][0], NODES[b][1])
        d.line([ax, ay, bx, by], fill=(235, 230, 220, 150), width=w)
    for x, y, r, c in NODES:
        px, py = P(x, y)
        rr = r / 100 * box
        d.ellipse([px - rr * 1.25, py - rr * 1.25, px + rr * 1.25, py + rr * 1.25], fill=(14, 12, 10, 255))
        d.ellipse([px - rr, py - rr, px + rr, py + rr], fill=c + (255,))
        hr = rr * 0.35
        d.ellipse([px - rr * 0.45 - hr, py - rr * 0.45 - hr, px - rr * 0.45 + hr, py - rr * 0.45 + hr],
                  fill=(255, 255, 255, 90))
    return img.resize((size, size), Image.LANCZOS)


for name, size, maskable in [
    ('icon-192.png', 192, False),
    ('icon-512.png', 512, False),
    ('icon-maskable-512.png', 512, True),
    ('apple-touch-icon.png', 180, True),
    ('favicon-32.png', 32, False),
]:
    render(size, maskable).save(os.path.join(OUT, name))
    print('wrote', name)
