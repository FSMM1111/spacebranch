import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Fix all header backgrounds
text = re.sub(
    r'background:\s*"rgba\(10,\s*10,\s*10,\s*0\.8\d*\)"',
    r'background: "rgba(255,255,255,0.88)"',
    text
)

# 2. Fix the SpaceBranch text styles to use FONT_DISPLAY and size 21
# It looks like:
# fontSize: 17, (or 18)
# fontWeight: 600,
# letterSpacing: "-0.5px", (or "-0.3px")
# color: T.text,

def replace_logo_text(match):
    return 'fontSize: 21,\nfontWeight: 600,\nletterSpacing: "0.231px",\ncolor: T.text,\nfontFamily: FONT_DISPLAY,'

text = re.sub(
    r'fontSize:\s*1[78],\s*fontWeight:\s*600,\s*letterSpacing:\s*"-[0-9.]+px",\s*color:\s*T\.text,',
    replace_logo_text,
    text
)

# 3. Check for any other hardcoded `#000` or `#1E1C1A` in OnboardScreen/CalibrationScreen
text = re.sub(r'backgroundColor:\s*"#000"', r'backgroundColor: T.darkBg', text)

with open("src/App.tsx", "w") as f:
    f.write(text)
