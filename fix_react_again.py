import re

with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace("React.useState", "useState")
text = text.replace("React.useRef", "useRef")
text = text.replace("React.useEffect", "useEffect")
text = text.replace("React.useCallback", "useCallback")
text = text.replace("React.useMemo", "useMemo")

with open("src/App.tsx", "w") as f:
    f.write(text)
