import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Update RightPanel signature
rp_sig_old = r'function RightPanel\(\{\n\s*status,'
rp_sig_new = r'function RightPanel({\n  width,\n  status,'
text = re.sub(rp_sig_old, rp_sig_new, text)

rp_type_old = r'\}:\s*\{\n\s*status:\s*AgentStatus'
rp_type_new = r'}: {\n  width: number\n  status: AgentStatus'
text = re.sub(rp_type_old, rp_type_new, text)

# Update RightPanel width in inline style
aside_old = r'width:\s*360,\s*minWidth:\s*360,\s*maxWidth:\s*360,'
aside_new = r'width, minWidth: width, maxWidth: width,'
text = re.sub(aside_old, aside_new, text)

# Update App states
app_decl = r'export default function App\(\) \{'
app_state_new = """export default function App() {
  const [rpWidth, setRpWidth] = React.useState(360)
  const [isResizingRp, setIsResizingRp] = React.useState(false)
  const rpResizeRef = React.useRef<{startX: number, startWidth: number} | null>(null)

  React.useEffect(() => {
    if (!isResizingRp) return
    const onMove = (e: MouseEvent) => {
      if (!rpResizeRef.current) return
      const delta = rpResizeRef.current.startX - e.clientX
      const newW = Math.max(280, Math.min(800, rpResizeRef.current.startWidth + delta))
      setRpWidth(newW)
    }
    const onUp = () => { setIsResizingRp(false); rpResizeRef.current = null }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [isResizingRp])
"""
text = re.sub(app_decl, app_state_new, text)

# Update flex wrapper
flex_wrapper_old = r'<div style=\{\{\s*flex: 1,\s*display: "flex",\s*overflow: "hidden",\s*minWidth: 0\s*\}\}>'
flex_wrapper_new = r'<div style={{ flex: 1, display: "flex", overflow: "hidden", minWidth: 0, position: "relative", userSelect: isResizingRp ? "none" : "auto" }}>'
text = re.sub(flex_wrapper_old, flex_wrapper_new, text)

# Add resizer and update RightPanel usage
rp_usage_old = r'<RightPanel\s+status=\{agentStatus\}'
rp_usage_new = """<div
          onMouseDown={(e) => {
            setIsResizingRp(true)
            rpResizeRef.current = { startX: e.clientX, startWidth: rpWidth }
          }}
          style={{
            position: "absolute",
            right: rpWidth - 4,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: "col-resize",
            zIndex: 50,
            backgroundColor: isResizingRp ? T.blue : "transparent",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => { if (!isResizingRp) e.currentTarget.style.backgroundColor = "rgba(0,102,204,0.2)" }}
          onMouseLeave={(e) => { if (!isResizingRp) e.currentTarget.style.backgroundColor = "transparent" }}
        />
        <RightPanel
          width={rpWidth}
          status={agentStatus}"""
text = re.sub(rp_usage_old, rp_usage_new, text)

with open("src/App.tsx", "w") as f:
    f.write(text)
