import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Add AI states
app_decl = """export default function App() {"""
app_new = """export default function App() {
  const [lifeContext, setLifeContext] = useState("")
  const [aiPhase, setAiPhase] = useState<"idle" | "interpreting" | "reasoning" | "strategies" | "applied">("idle")"""
text = text.replace(app_decl, app_new)

# Replace LeftPanel
left_panel_regex = re.compile(r"function LeftPanel\(.*?</aside>\n}", re.DOTALL)
new_left_panel = """
function LeftPanel({ pmap, history, roomData, lifeContext, onLifeContextChange, onSubmitContext, aiPhase }: { pmap: Record<string, PStatus>; history: string[]; roomData: RoomData; lifeContext: string; onLifeContextChange: (v: string) => void; onSubmitContext: () => void; aiPhase: string }) {
  const l = parseFloat(roomData.length) || 4, w = parseFloat(roomData.width) || 3
  const area = (l * w).toFixed(1)
  const sectionLabel = (text: string) => (
    <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text3, padding: "0 4px", marginBottom: 4 }}>
      {text}
    </div>
  )
  return (
    <aside style={{ width: 220, flexShrink: 0, backgroundColor: T.panel, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 10px", borderBottom: `1px solid ${T.borderSoft}` }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text3 }}>
          1. Life Context
        </div>
      </div>

      <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
        {aiPhase === "idle" ? (
          <>
            <div style={{ fontSize: 18, color: T.text2, lineHeight: 1.5, padding: "0 4px" }}>
              输入即将发生的生活变化：
            </div>
            <textarea
              value={lifeContext}
              onChange={e => onLifeContextChange(e.target.value)}
              placeholder="例如：准备养猫、开始居家办公、或者伴侣搬来同居..."
              style={{
                width: "100%", height: 120, padding: "12px", borderRadius: 10, fontSize: 16, boxSizing: "border-box",
                border: `1px solid ${T.border}`, outline: "none", fontFamily: FONT,
                color: T.text, backgroundColor: "rgba(255,255,255,0.03)", resize: "none"
              }}
            />
            <button onClick={onSubmitContext} disabled={!lifeContext.trim()}
              style={{
                padding: "10px 0", borderRadius: 8, fontSize: 16, fontWeight: 600,
                backgroundColor: lifeContext.trim() ? T.blue : "rgba(255,255,255,0.06)",
                color: lifeContext.trim() ? "#fff" : T.text3, border: "none", cursor: lifeContext.trim() ? "pointer" : "default"
              }}>
              AI 需求推理
            </button>
          </>
        ) : (
          <div style={{ animation: "fade-in 0.4s ease both" }}>
            <div style={{ fontSize: 18, color: T.text, lineHeight: 1.5, padding: "0 4px", marginBottom: 16 }}>
              “{lifeContext}”
            </div>
            {sectionLabel("AI 推理出的空间需求")}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["居家办公 (需大桌面与采光)", "双人活动 (需宽敞通道)"].map((need, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                  <div style={{ color: T.blue }}>✦</div>
                  <div style={{ fontSize: 16, color: T.text }}>{need}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ borderTop: `1px solid ${T.borderSoft}`, padding: "10px 16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 18, color: T.text3 }}>{area} ㎡</span>
        <span style={{ fontSize: 18, color: T.text3 }}>{w} × {l} m</span>
      </div>
    </aside>
  )
}
"""
text = left_panel_regex.sub(new_left_panel, text)

# Replace App's call to LeftPanel
text = text.replace("<LeftPanel pmap={pmap} history={history} roomData={roomData} />", "<LeftPanel pmap={pmap} history={history} roomData={roomData} lifeContext={lifeContext} onLifeContextChange={setLifeContext} onSubmitContext={() => { setAiPhase('interpreting'); setTimeout(() => setAiPhase('reasoning'), 1500); setTimeout(() => setAiPhase('strategies'), 3500) }} aiPhase={aiPhase} />")

with open("src/App.tsx", "w") as f:
    f.write(text)
