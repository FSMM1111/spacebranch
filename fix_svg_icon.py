import re

with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace('fill="#101010"', 'fill={T.bg}')
text = text.replace('fill="#000"', 'fill={T.text}')

with open("src/App.tsx", "w") as f:
    f.write(text)
