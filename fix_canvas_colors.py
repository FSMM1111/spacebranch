import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Replace hardcoded dark colors with Apple tokens
text = text.replace('fill="#1E1C1A"', 'fill={T.darkPanel}')
text = text.replace('stroke="#1D1D1F"', 'stroke={T.darkBg}')
text = text.replace('backgroundColor: "#0A0A0A"', 'backgroundColor: T.darkBg')

with open("src/App.tsx", "w") as f:
    f.write(text)
