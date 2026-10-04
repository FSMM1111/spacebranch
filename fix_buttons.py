import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Fix human decision buttons
old_button = """                style={{
                  padding: "12px",
                  borderRadius: 9999,
                  backgroundColor: T.panel,
                  border: `1px solid ${T.amber}`,
                  color: T.text,
                  textAlign: "left",
                  cursor: "pointer",
                }}"""
new_button = """                style={{
                  padding: "16px 20px",
                  borderRadius: 18,
                  backgroundColor: T.bg,
                  border: `1px solid ${T.amber}`,
                  color: T.text,
                  textAlign: "left",
                  cursor: "pointer",
                }}"""
text = text.replace(old_button, new_button)

# Fix human decision container background
text = text.replace('backgroundColor: "rgba(255,159,10,0.1)",', 'backgroundColor: "transparent",')
text = text.replace('border: `1px solid rgba(255,159,10,0.3)`,', 'border: "none",')

with open("src/App.tsx", "w") as f:
    f.write(text)
