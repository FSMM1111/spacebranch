import re

with open("vite.config.ts", "r") as f:
    text = f.read()

# Remove the hmr line
text = re.sub(r'\s*hmr:\s*\{\s*port:[^}]+\},', '', text)

with open("vite.config.ts", "w") as f:
    f.write(text)
