import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Fix the body layout of the second page to center properly
old_layout = """      {/* Body — two columns */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
          padding: "32px 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1024,
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
          }}
        >"""

new_layout = """      {/* Body — two columns */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "32px 40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1024,
            display: "flex",
            gap: 40,
            alignItems: "flex-start",
            margin: "0 auto"
          }}
        >"""

text = text.replace(old_layout, new_layout)

with open("src/App.tsx", "w") as f:
    f.write(text)
