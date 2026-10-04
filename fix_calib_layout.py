import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Update overall wrapper layout limits
text = text.replace('maxWidth: 860,', 'maxWidth: 1024,')
text = text.replace('padding: "24px 20px",', 'padding: "32px 40px",')

# 2. Update Left column width
text = text.replace('width: 248,\n              flexShrink: 0,', 'width: 300,\n              flexShrink: 0,')

# 3. Update SX and SY
text = text.replace('const SX = 340,\n    SY = 280,\n    CPAD = 40', 'const SX = 540,\n    SY = 440,\n    CPAD = 60')

# 4. Fix hardcoded dark colors in Calibration SVG
text = text.replace('fill="#1A1A1A"', 'fill={T.darkPanel}')
text = text.replace('stroke="#1A1A1A"', 'stroke={T.darkPanel}')

with open("src/App.tsx", "w") as f:
    f.write(text)
