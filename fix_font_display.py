import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Add FONT_DISPLAY constant
font_declaration = """const FONT = 'SF Pro Text, system-ui, -apple-system, sans-serif'
"""

new_font_declaration = """const FONT = 'SF Pro Text, system-ui, -apple-system, sans-serif'
const FONT_DISPLAY = 'SF Pro Display, system-ui, -apple-system, sans-serif'
"""

if "const FONT_DISPLAY =" not in text:
    text = text.replace(font_declaration, new_font_declaration)

with open("src/App.tsx", "w") as f:
    f.write(text)
