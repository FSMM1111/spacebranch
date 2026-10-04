import re

with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace('text2: "#7a7a7a",          // ink-muted-48', 'text2: "#333333",          // ink-muted-80')
text = text.replace('text3: "#cccccc",          // body-muted', 'text3: "#7a7a7a",          // ink-muted-48')

with open("src/App.tsx", "w") as f:
    f.write(text)
