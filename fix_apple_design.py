import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Replace Design tokens
old_tokens = """// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
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
}"""

new_tokens = """// ─── Design tokens (Apple Design System) ──────────────────────────────────────
const T = {
  bg: "#ffffff",             // canvas
  panel: "#f5f5f7",          // canvas-parchment
  text: "#1d1d1f",           // ink
  text2: "#7a7a7a",          // ink-muted-48
  text3: "#cccccc",          // body-muted
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

text = text.replace(old_tokens, new_tokens)

# Fonts
text = text.replace('const FONT = \'-apple-system,BlinkMacSystemFont,"SF Pro SC","PingFang SC","Noto Sans SC","Helvetica Neue",sans-serif\'', 'const FONT = \'SF Pro Text, system-ui, -apple-system, sans-serif\'\nconst FONT_DISPLAY = \'SF Pro Display, system-ui, -apple-system, sans-serif\'')

# Apply Apple font weights and letter spacing in headers
# Change "SpaceBranch" header
text = text.replace(
    'fontSize: 17, fontWeight: 600, letterSpacing: "-0.5px", color: T.text',
    'fontSize: 21, fontWeight: 600, letterSpacing: "0.231px", color: T.text, fontFamily: FONT_DISPLAY'
)

# Header background
text = text.replace(
    'background: "rgba(10,10,10,0.88)"',
    'background: "rgba(255,255,255,0.88)"'
)

# Agent workspace backgrounds
text = text.replace('backgroundColor: "#0A0A0A"', 'backgroundColor: "#fafafc"')

# Fix AgentMessage styles
text = text.replace('color: role === "user" ? T.text3 : "#fff"', 'color: role === "user" ? "#fff" : "#fff"')
text = text.replace('backgroundColor: role === "user" ? T.panel : T.blue', 'backgroundColor: role === "user" ? T.text : T.blue')

# Fix text colors that were assuming dark mode
text = text.replace('backgroundColor: "rgba(255,255,255,0.04)"', 'backgroundColor: "rgba(0,0,0,0.03)"')
text = text.replace('backgroundColor: "rgba(255,255,255,0.03)"', 'backgroundColor: "rgba(0,0,0,0.02)"')
text = text.replace('backgroundColor: "rgba(255,255,255,0.05)"', 'backgroundColor: "rgba(0,0,0,0.04)"')

# Button styling
text = text.replace('color: input.trim() ? "#fff" : T.text3', 'color: input.trim() ? "#fff" : "#7a7a7a"')
text = text.replace('backgroundColor: input.trim() ? T.blue : "rgba(255,255,255,0.06)"', 'backgroundColor: input.trim() ? T.blue : "rgba(0,0,0,0.06)"')
text = text.replace('borderRadius: 8', 'borderRadius: 9999') # pill shapes for buttons
text = text.replace('borderRadius: 10', 'borderRadius: 18') # large utility cards

with open("src/App.tsx", "w") as f:
    f.write(text)
