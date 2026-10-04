import re

with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace(
    '<div style={{ flex: 1, display: "flex", overflow: "hidden" }}>',
    '<div style={{ flex: 1, display: "flex", overflow: "hidden", minWidth: 0 }}>'
)

text = text.replace(
    'backgroundColor: "#fafafc",\n          }}',
    'backgroundColor: "#fafafc",\n            minWidth: 0,\n          }}'
)

with open("src/App.tsx", "w") as f:
    f.write(text)
