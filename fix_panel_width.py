import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Fix the flexbox min-width: auto bug inside AgentMessage
text = text.replace(
    '<div style={{ flex: 1, paddingTop: 4 }}>{children}</div>',
    '<div style={{ flex: 1, paddingTop: 4, minWidth: 0 }}>{children}</div>'
)

# 2. Safely constraint RightPanel width so it never overflows
text = re.sub(
    r'(<aside\s+style=\{\{\s*width:\s*)340(,\s*flexShrink:\s*0,\s*backgroundColor:\s*T\.panel,)',
    r'\1 360, minWidth: 360, maxWidth: 360\2',
    text
)

# 3. Safely constraint LeftPanel width as well
text = re.sub(
    r'(<aside\s+style=\{\{\s*width:\s*)240(,\s*flexShrink:\s*0,\s*backgroundColor:\s*T\.panel,)',
    r'\1 260, minWidth: 260, maxWidth: 260\2',
    text
)

# 4. Hide scrollbar for the horizontal scrolling cards to keep it clean (macOS style)
scroll_container = 'overflowX: "auto",\n                  paddingBottom: 8,'
scroll_container_new = 'overflowX: "auto",\n                  paddingBottom: 8,\n                  scrollbarWidth: "none",\n                  msOverflowStyle: "none",'
text = text.replace(scroll_container, scroll_container_new)

with open("src/App.tsx", "w") as f:
    f.write(text)
