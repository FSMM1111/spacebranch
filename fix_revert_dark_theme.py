import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Revert to the original Dark Theme design tokens while keeping Apple Typography
old_tokens = """const T = {
  bg: "#ffffff",             // canvas
  panel: "#f5f5f7",          // canvas-parchment
  text: "#1d1d1f",           // ink
  text2: "#333333",          // ink-muted-80
  text3: "#7a7a7a",          // ink-muted-48
  border: "#e0e0e0",         // hairline
  borderSoft: "#f0f0f0",     // divider-soft
  blue: "#0066cc",           // primary
  blueHover: "#0071e3",      // primary-focus
  green: "#30D158",          // (Keep semantic)
  amber: "#FF9F0A",          // (Keep semantic)
  red: "#FF453A",            // (Keep semantic)
  furnitureBg: "#f5f5f7",    // parchment for furniture
  furnitureBd: "#e0e0e0",
  furnitureTx: "#1d1d1f",
  darkBg: "#1d1d1f",         // For the 2D canvas background (inverted)
  darkPanel: "#272729",
}"""

new_tokens = """const T = {
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

text = text.replace(old_tokens, new_tokens)

# 2. Fix Header backgrounds
text = re.sub(
    r'background: "rgba\(255,255,255,0\.88\)"',
    r'background: "rgba(10,10,10,0.8)"',
    text
)

# 3. Fix main canvas background
text = text.replace('backgroundColor: "#fafafc",', 'backgroundColor: "#0A0A0A",')

# 4. Fix AgentMessage bubble styles
text = text.replace('color: role === "user" ? "#fff" : "#fff",', 'color: role === "user" ? T.text3 : "#fff",')
text = text.replace('backgroundColor: role === "user" ? T.text : T.blue,', 'backgroundColor: role === "user" ? T.panel : T.blue,')
text = text.replace('border: role === "user" ? `1px solid ${T.border}` : "none",', 'border: role === "user" ? `1px solid ${T.border}` : "none",')

# 5. Restore translucent panel backgrounds from black alphas to white alphas
text = text.replace('backgroundColor: "rgba(0,0,0,0.03)"', 'backgroundColor: "rgba(255,255,255,0.04)"')
text = text.replace('backgroundColor: "rgba(0,0,0,0.02)"', 'backgroundColor: "rgba(255,255,255,0.03)"')
text = text.replace('backgroundColor: "rgba(0,0,0,0.04)"', 'backgroundColor: "rgba(255,255,255,0.05)"')
text = text.replace('backgroundColor: "rgba(0,0,0,0.06)"', 'backgroundColor: "rgba(255,255,255,0.06)"')
text = text.replace('backgroundColor: "rgba(0,0,0,0.08)"', 'backgroundColor: "rgba(255,255,255,0.08)"')
text = text.replace('color: input.trim() ? "#fff" : "#7a7a7a"', 'color: input.trim() ? "#fff" : T.text3')

with open("src/App.tsx", "w") as f:
    f.write(text)
