# Dibuja la etiqueta del tarro (se enrolla alrededor del cuerpo). Uso: python etiqueta.py etiqueta.png
import sys, math
from PIL import Image, ImageDraw, ImageFont
W, H = 3000, 800
F = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
im = Image.new("RGB", (W, H), "#d9249c"); d = ImageDraw.Draw(im)
for y in range(70, H - 90):
    t = (y - 70) / (H - 160); d.line([(0, y), (W, y)], fill=(255, int(214 - 60 * t), int(232 - 36 * t)))
cx = W // 2
f = lambda s: ImageFont.truetype(F, s)
d.text((cx - 380, 110), "nurea", font=f(120), fill="#0f3b2e")
d.rectangle([cx - 376, 262, cx - 270, 272], fill="#d6266f")
d.text((cx - 380, 290), "Women's", font=f(92), fill="#d6266f")
d.text((cx - 380, 388), "Probiotic +", font=f(92), fill="#d6266f")
d.text((cx - 380, 490), "Slippery Elm", font=f(72), fill="#d6266f")
ox, oy = cx + 300, 430
for i in range(5):
    a = i / 5 * math.tau - math.pi / 2; px, py = ox + math.cos(a) * 78, oy + math.sin(a) * 78
    d.ellipse([px - 74, py - 74, px + 74, py + 74], fill="#ff8fc0" if i % 2 else "#ffb0d2", outline="#d6408a", width=5)
d.ellipse([ox - 30, oy - 30, ox + 30, oy + 30], fill="#ffd23f")
d.rounded_rectangle([cx - 390, 600, cx + 200, 672], 36, fill="#ffeef5"); d.text((cx - 360, 612), "Dietary Supplement", font=f(46), fill="#d6266f")
im.save(sys.argv[1])
