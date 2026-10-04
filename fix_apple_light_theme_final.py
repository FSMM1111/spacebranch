import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Force the Light Theme tokens
old_tokens = """const T = {
  bg: "#101010",
  panel: "#181818",
  text: "#FFFFFF",
  text2: "rgba(255,255,255,0.55)",
  text3: "rgba(255,255,255,0.32)",
  border: "rgba(255,255,255,0.1)",
  borderSoft: "rgba(255,255,255,0.06)",
  blue: "#4EA8FF",
  blueHover: "#62B4FF",
  green: "#30D158",
  amber: "#FF9F0A",
  red: "#FF453A",
  furnitureBg: "rgba(255,255,255,0.08)",
  furnitureBd: "rgba(255,255,255,0.18)",
  furnitureTx: "rgba(255,255,255,0.55)",
  darkBg: "#101010",
  darkPanel: "#181818",
}"""

new_tokens = """const T = {
  bg: "#ffffff",             // pure white canvas
  panel: "#f5f5f7",          // parchment
  text: "#1d1d1f",           // ink
  text2: "#7a7a7a",          // muted text
  text3: "#cccccc",          // very muted text / borders
  border: "#e0e0e0",         // hairline
  borderSoft: "#f0f0f0",     // soft divider
  blue: "#0066cc",           // Apple Action Blue
  blueHover: "#0071e3",
  green: "#30D158",
  amber: "#FF9F0A",
  red: "#FF453A",
  furnitureBg: "#ffffff",
  furnitureBd: "#e0e0e0",
  furnitureTx: "#1d1d1f",
  darkBg: "#1d1d1f",         // keep canvas dark for contrast if needed, or make it light. Let's make it light gray.
  darkPanel: "#f5f5f7",
}"""
text = text.replace(old_tokens, new_tokens)

# 2. Fix All Headers to be Light
text = re.sub(r'background: "rgba\(10,10,10,0\.8\)"', r'background: "rgba(255,255,255,0.88)"', text)

# 3. Fix main background
text = text.replace('backgroundColor: "#0A0A0A"', 'backgroundColor: "#fafafc"')

# 4. Fix AgentMessage bubble styles for Light Theme
text = text.replace('color: role === "user" ? T.text3 : "#fff"', 'color: role === "user" ? "#1d1d1f" : "#fff"')
text = text.replace('backgroundColor: role === "user" ? T.panel : T.blue', 'backgroundColor: role === "user" ? "#f5f5f7" : T.blue')

# 5. Restore translucent panel backgrounds for light theme
text = text.replace('backgroundColor: "rgba(255,255,255,0.04)"', 'backgroundColor: "rgba(0,0,0,0.02)"')
text = text.replace('backgroundColor: "rgba(255,255,255,0.03)"', 'backgroundColor: "rgba(0,0,0,0.03)"')
text = text.replace('backgroundColor: "rgba(255,255,255,0.05)"', 'backgroundColor: "rgba(0,0,0,0.04)"')
text = text.replace('backgroundColor: "rgba(255,255,255,0.06)"', 'backgroundColor: "rgba(0,0,0,0.05)"')
text = text.replace('backgroundColor: "rgba(255,255,255,0.08)"', 'backgroundColor: "rgba(0,0,0,0.06)"')

# 6. Button text in Agent workspace
text = text.replace('color: input.trim() ? "#fff" : T.text3', 'color: input.trim() ? "#fff" : "#7a7a7a"')

# 7. Ensure onboarding layout uses light styling correctly
text = text.replace('border: `2px dashed ${drag ? T.blue : "rgba(0,0,0,0.15)"}`', 'border: `2px dashed ${drag ? T.blue : "rgba(0,0,0,0.15)"}`')

# 8. Fix missing light styles in the SVGs and text elements inside them
text = text.replace('fill="#101010"', 'fill="#ffffff"')
text = text.replace('stroke="#101010"', 'stroke="#ffffff"')

with open("src/App.tsx", "w") as f:
    f.write(text)
