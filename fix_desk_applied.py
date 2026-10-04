import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Add deskApplied to RoomCanvasProps
rc_props = "  deskXY: XY | null; readXY: XY | null; storageXY: XY | null; petXY: XY | null\n  storageApplied: boolean; petApplied: boolean"
rc_props_new = "  deskXY: XY | null; readXY: XY | null; storageXY: XY | null; petXY: XY | null\n  deskApplied: boolean; storageApplied: boolean; petApplied: boolean"
text = text.replace(rc_props, rc_props_new)

# 2. Add deskApplied to RoomCanvas function signature
rc_sig = "  storageApplied,\n  petApplied,"
rc_sig_new = "  deskApplied,\n  storageApplied,\n  petApplied,"
text = text.replace(rc_sig, rc_sig_new)

# 3. Update isDeskApplied to use deskApplied instead of APPLIED_PHASES
text = text.replace("const isDeskApplied = APPLIED_PHASES.includes(phase)", "const isDeskApplied = deskApplied")

# 4. Pass deskApplied in App.tsx
app_rc = "                petApplied={false}"
app_rc_new = "                deskApplied={deskApplied}\n                petApplied={false}"
text = text.replace(app_rc, app_rc_new)

# 5. Fix the bug where currentDeskXY is passed but deskXY is checked
text = text.replace("deskXY={currentDeskXY}", "deskXY={deskXY}") # wait, currentDeskXY is correct because we want to see the temp positions.

with open("src/App.tsx", "w") as f:
    f.write(text)
