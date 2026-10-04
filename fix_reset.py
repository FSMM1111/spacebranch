import re

with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace('setPhase("initial"); setDeskXY(null);', 'setAiPhase("idle"); setLifeContext(""); setPhase("initial"); setDeskXY(null);')

with open("src/App.tsx", "w") as f:
    f.write(text)
