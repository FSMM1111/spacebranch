import re

with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace(
    """const FONT =
  '-apple-system,BlinkMacSystemFont,"SF Pro SC","PingFang SC","Noto Sans SC","Helvetica Neue",sans-serif'""",
    """const FONT = 'SF Pro Text, system-ui, -apple-system, sans-serif'
const FONT_DISPLAY = 'SF Pro Display, system-ui, -apple-system, sans-serif'"""
)

with open("src/App.tsx", "w") as f:
    f.write(text)
