import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Update Types
types_idx = text.find("// ─── Types")
room_const_idx = text.find("// ─── Room & furniture")

new_types = """// ─── Types ────────────────────────────────────────────────────────────────────
type OnboardPhase = "upload" | "scanning" | "calibrate" | "done"
type AgentStatus = "Idle" | "Understanding" | "Planning" | "Exploring" | "Evaluating" | "Need your decision" | "Adapting" | "Applied"

interface SocketPin { wall: "top" | "bottom" | "left" | "right"; pos: number }
interface RoomData {
  length: string
  width: string
  ceilingH: string
  windowFacing: string
  windowStart: number
  windowEnd: number
  doorSwingIn: boolean
  socketPositions: SocketPin[]
  keepItems: Record<string, boolean>
}
type Phase = "initial" | "active" | "preview" | "applied"
type PStatus = "ok" | "neutral" | "affected"
type ILevel  = "ok" | "mild" | "significant"
interface XY          { x: number; y: number }
interface Metric      { label: string; before?: string; after: string; level: ILevel }
interface AltDef      { id: string; label: string; desc: string; tags: string[]; recommended?: boolean }
interface HistoryEntry { phase: Phase; deskXY: XY | null; readXY: XY | null; storageXY: XY | null; petXY: XY | null }
"""

text = text[:types_idx] + new_types + text[room_const_idx:]

# 2. Extract until Left Panel
left_panel_idx = text.find("// ─── Left Panel")
top_part = text[:left_panel_idx]

bottom_part = """
// ─── Shared Components ────────────────────────────────────────────────────────
function AgentMessage({ role, children }: { role: "user" | "agent"; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20, animation: "fade-in 0.4s ease both" }}>
      <div style={{
        width: 28, height: 28, borderRadius: role === "user" ? "50%" : 8,
        backgroundColor: role === "user" ? T.panel : T.blue, border: role === "user" ? `1px solid ${T.border}` : "none",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        color: role === "user" ? T.text3 : "#fff", fontSize: 14, fontWeight: 700
      }}>
        {role === "user" ? "U" : "AI"}
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        {children}
      </div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.text3, marginBottom: 8 }}>{title}</div>
}

// ─── Left Panel ───────────────────────────────────────────────────────────────
function LeftPanel({ lifeState, priorities, decisions, area, dims }: { lifeState: string; priorities: string[]; decisions: string[]; area: string; dims: string }) {
  return (
    <aside style={{ width: 240, flexShrink: 0, backgroundColor: T.panel, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${T.borderSoft}` }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text3 }}>
          Space Memory
        </div>
      </div>
      
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", flex: 1 }}>
        <div>
          <SectionTitle title="当前生活状态" />
          <div style={{ fontSize: 16, color: lifeState ? T.text : T.text3, lineHeight: 1.5 }}>
            {lifeState || "尚未设置"}
          </div>
        </div>
        
        <div>
          <SectionTitle title="已确认优先级" />
          {priorities.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {priorities.map((p, i) => (
                <div key={i} style={{ fontSize: 15, color: T.text2, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: T.blue }}>{i + 1}.</span> {p}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 15, color: T.text3 }}>暂无</div>
          )}
        </div>
        
        <div>
          <SectionTitle title="已确认空间决策" />
          {decisions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {decisions.map((d, i) => (
                <div key={i} style={{ padding: "10px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 8, border: `1px solid ${T.borderSoft}`, fontSize: 15, color: T.green }}>
                  ✓ {d}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 15, color: T.text3 }}>暂无</div>
          )}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.borderSoft}`, padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 16, color: T.text3 }}>{area} ㎡</span>
        <span style={{ fontSize: 16, color: T.text3 }}>{dims}</span>
      </div>
    </aside>
  )
}

// ─── Right Panel ──────────────────────────────────────────────────────────────
function RightPanel({ status, input, onInputChange, onSubmit, explicitNeeds, implicitNeeds, activeStep, explorationLog, onUserDecision }: { 
  status: AgentStatus; input: string; onInputChange: (v: string) => void; onSubmit: () => void;
  explicitNeeds: string[]; implicitNeeds: string[]; activeStep: number; explorationLog: string[];
  onUserDecision: (choice: string) => void;
}) {
  return (
    <aside style={{ width: 340, flexShrink: 0, backgroundColor: T.panel, borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.text3, marginBottom: 2 }}>
          Agent Workspace
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: status === "Idle" ? T.text3 : T.blue, display: "flex", alignItems: "center", gap: 8 }}>
          {status !== "Idle" && status !== "Applied" && status !== "Need your decision" && <div style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${T.blue}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />}
          {status === "Need your decision" && <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: T.amber, animation: "pulse-dot 1.5s infinite" }} />}
          {status}
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column" }}>
        {status === "Idle" && (
          <AgentMessage role="agent">
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.6, marginBottom: 16 }}>
              请描述你的生活发生了什么变化？<br/>我将为你推导空间需求并探索合适的布局。
            </div>
            <textarea
              value={input}
              onChange={e => onInputChange(e.target.value)}
              placeholder="例如：我下个月开始长期居家办公，但房间已经很挤了..."
              style={{
                width: "100%", height: 100, padding: "12px", borderRadius: 10, fontSize: 15, boxSizing: "border-box",
                border: `1px solid ${T.border}`, outline: "none", fontFamily: FONT,
                color: T.text, backgroundColor: "rgba(255,255,255,0.03)", resize: "none", marginBottom: 12
              }}
            />
            <button onClick={onSubmit} disabled={!input.trim()}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 15, fontWeight: 600,
                backgroundColor: input.trim() ? T.blue : "rgba(255,255,255,0.06)",
                color: input.trim() ? "#fff" : T.text3, border: "none", cursor: input.trim() ? "pointer" : "default"
              }}>
              提交生活变化
            </button>
          </AgentMessage>
        )}

        {status !== "Idle" && (
          <AgentMessage role="user">
            <div style={{ fontSize: 15, color: T.text2, lineHeight: 1.5 }}>"{input}"</div>
          </AgentMessage>
        )}

        {(status === "Understanding" || status === "Planning" || status === "Exploring" || status === "Evaluating" || status === "Need your decision" || status === "Adapting" || status === "Applied") && (
          <AgentMessage role="agent">
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.5, marginBottom: 12 }}>
              已理解你的生活情境，提取需求如下：
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px", border: `1px solid ${T.borderSoft}` }}>
              <div style={{ fontSize: 13, color: T.text3, marginBottom: 6 }}>显性需求</div>
              {explicitNeeds.map((n, i) => <div key={i} style={{ fontSize: 14, color: T.text, marginBottom: 4 }}>• {n}</div>)}
              <div style={{ fontSize: 13, color: T.text3, marginTop: 12, marginBottom: 6 }}>AI 推导潜在需求</div>
              {implicitNeeds.map((n, i) => <div key={i} style={{ fontSize: 14, color: T.blue, marginBottom: 4 }}>✦ {n}</div>)}
            </div>
          </AgentMessage>
        )}

        {(status === "Planning" || status === "Exploring" || status === "Evaluating" || status === "Need your decision" || status === "Adapting" || status === "Applied") && (
          <AgentMessage role="agent">
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.5, marginBottom: 12 }}>
              执行计划：
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["分析当前空间", "检查可用区域", "尝试布局方案", "检查空间影响", "提交可选策略"].map((step, i) => (
                <div key={i} style={{ fontSize: 14, color: activeStep > i ? T.text3 : activeStep === i ? T.text : T.text3, display: "flex", alignItems: "center", gap: 8, opacity: activeStep < i ? 0.4 : 1 }}>
                  {activeStep > i ? <span style={{ color: T.green }}>✓</span> : activeStep === i ? <span style={{ color: T.blue }}>●</span> : <span>○</span>}
                  <span style={{ textDecoration: activeStep > i ? "line-through" : "none" }}>{step}</span>
                </div>
              ))}
            </div>
          </AgentMessage>
        )}

        {(status === "Exploring" || status === "Evaluating" || status === "Need your decision" || status === "Adapting" || status === "Applied") && (
          <AgentMessage role="agent">
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.5, marginBottom: 12 }}>
              自主探索结果：
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {explorationLog.map((log, i) => {
                const isFail = log.includes("失败");
                const isWarn = log.includes("牺牲");
                const color = isFail ? T.red : isWarn ? T.amber : T.green;
                return (
                  <div key={i} style={{ padding: "10px", borderRadius: 8, backgroundColor: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${color}`, fontSize: 14, color: T.text2, lineHeight: 1.5 }}>
                    {log}
                  </div>
                )
              })}
            </div>
          </AgentMessage>
        )}

        {status === "Need your decision" && (
          <div style={{ animation: "fade-in 0.5s ease both", marginTop: 10, padding: 16, backgroundColor: "rgba(255,159,10,0.1)", borderRadius: 12, border: `1px solid rgba(255,159,10,0.3)` }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.amber, marginBottom: 12 }}>
              Human Decision Point
            </div>
            <div style={{ fontSize: 15, color: T.text, lineHeight: 1.5, marginBottom: 16 }}>
              我在探索中遇到了价值冲突。为了给到最适合你的方案，请问你更在意：
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => onUserDecision("comfort")} style={{ padding: "12px", borderRadius: 8, backgroundColor: T.panel, border: `1px solid ${T.amber}`, color: T.text, textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontWeight: 600 }}>工作舒适优先</div>
                <div style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>允许空间变满，可能牺牲部分储物</div>
              </button>
              <button onClick={() => onUserDecision("space")} style={{ padding: "12px", borderRadius: 8, backgroundColor: T.panel, border: `1px solid ${T.amber}`, color: T.text, textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontWeight: 600 }}>空间开阔优先</div>
                <div style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>使用折叠桌，需要日常勤收纳</div>
              </button>
              <button onClick={() => onUserDecision("budget")} style={{ padding: "12px", borderRadius: 8, backgroundColor: T.panel, border: `1px solid ${T.amber}`, color: T.text, textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontWeight: 600 }}>最小改动优先</div>
                <div style={{ fontSize: 13, color: T.text3, marginTop: 4 }}>复用现有小家具，体验一般</div>
              </button>
            </div>
          </div>
        )}
        
        {status === "Adapting" && (
          <AgentMessage role="agent">
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.5 }}>
              收到，根据你的倾向，我正在生成最终可执行策略...
            </div>
          </AgentMessage>
        )}

        {status === "Applied" && (
          <AgentMessage role="agent">
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.5, marginBottom: 16 }}>
              已为你应用策略。你可以在左侧查看记忆，也可以在中间画布双击家具进行微调。
            </div>
            <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "transparent", border: `1px solid ${T.border}`, color: T.text2, cursor: "pointer" }}>
              开始新的对话
            </button>
          </AgentMessage>
        )}
      </div>
    </aside>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [onboardPhase, setOnboardPhase] = React.useState<OnboardPhase>("upload")
  const [photoURL, setPhotoURL]         = React.useState<string | null>(null)
  const [scanStep, setScanStep]         = React.useState(0)
  const [roomData, setRoomData] = React.useState<RoomData>({
    length: "4.0", width: "3.0", ceilingH: "", windowFacing: "北",
    windowStart: 0.30, windowEnd: 0.72, doorSwingIn: true, socketPositions: [],
    keepItems: { wardrobe: true, bed: true, window: true, door: true },
  })

  const [agentStatus, setAgentStatus] = React.useState<AgentStatus>("Idle")
  const [input, setInput] = React.useState("")
  const [explicitNeeds, setExplicitNeeds] = React.useState<string[]>([])
  const [implicitNeeds, setImplicitNeeds] = React.useState<string[]>([])
  const [activeStep, setActiveStep] = React.useState(0)
  const [explorationLog, setExplorationLog] = React.useState<string[]>([])
  
  const [lifeState, setLifeState] = React.useState("")
  const [priorities, setPriorities] = React.useState<string[]>([])
  const [decisions, setDecisions] = React.useState<string[]>([])

  const [deskXY, setDeskXY] = React.useState<XY | null>(null)
  const [deskTempXY, setDeskTempXY] = React.useState<XY | null>(null)
  const [deskType, setDeskType] = React.useState<"large" | "folding" | "small">("large")
  
  const [deskApplied, setDeskApplied] = React.useState(false)
  
  const svgRef = React.useRef<SVGSVGElement>(null)
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = React.useState(1)

  React.useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setZoom(z => Math.min(3, Math.max(0.4, z * (1 - e.deltaY * 0.001))))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const startAgentFlow = () => {
    setAgentStatus("Understanding")
    setTimeout(() => {
      setExplicitNeeds(["增加长期办公功能"])
      setImplicitNeeds(["长时间坐姿舒适", "视频会议背景", "设备充电", "桌面面积", "工作与休息边界", "办公后的收纳"])
      setTimeout(() => {
        setAgentStatus("Planning")
        setActiveStep(0)
        setTimeout(() => setActiveStep(1), 800)
        setTimeout(() => {
          setActiveStep(2)
          setAgentStatus("Exploring")
          runExplorationSequence()
        }, 1600)
      }, 2000)
    }, 1500)
  }

  const runExplorationSequence = () => {
    // Attempt 1
    setTimeout(() => {
      setDeskType("large")
      setDeskTempXY({ x: 200, y: 300 }) // Corridor
    }, 500)
    setTimeout(() => {
      setExplorationLog(l => [...l, "尝试 1: 固定大桌靠窗区域 -> 占用 90cm 主通道 -> 判定失败"])
      setDeskTempXY(null)
    }, 2000)

    // Attempt 2
    setTimeout(() => {
      setDeskTempXY({ x: 10, y: 220 }) // Side wall
    }, 3000)
    setTimeout(() => {
      setExplorationLog(l => [...l, "尝试 2: 侧墙办公区 -> 保留主通道 -> 牺牲部分储物空间"])
      setDeskTempXY(null)
    }, 4500)

    // Attempt 3
    setTimeout(() => {
      setDeskType("folding")
      setDeskTempXY({ x: 220, y: 400 }) // Foot of bed folding
    }, 5500)
    setTimeout(() => {
      setExplorationLog(l => [...l, "尝试 3: 折叠式办公区 -> 空间最开阔 -> 日常需要频繁收纳整理"])
      setDeskTempXY(null)
      
      setTimeout(() => {
        setActiveStep(3)
        setTimeout(() => {
          setActiveStep(4)
          setAgentStatus("Need your decision")
        }, 800)
      }, 800)
    }, 7000)
  }

  const handleUserDecision = (choice: string) => {
    setAgentStatus("Adapting")
    let p: string[] = []
    let d: string = ""
    let finalXY = { x: 10, y: 220 }
    let type: "large" | "folding" | "small" = "large"

    if (choice === "comfort") {
      p = ["工作舒适", "储物量", "空间开阔"]
      d = "使用侧墙固定办公区"
      finalXY = { x: 10, y: 220 }
      type = "large"
    } else if (choice === "space") {
      p = ["空间开阔", "工作舒适", "储物量"]
      d = "使用床尾折叠办公区"
      finalXY = { x: 160, y: 380 }
      type = "folding"
    } else {
      p = ["最小改动", "空间开阔", "工作舒适"]
      d = "复用小桌靠窗"
      finalXY = { x: 150, y: 10 }
      type = "small"
    }

    setTimeout(() => {
      setPriorities(p)
      setDecisions([d])
      setLifeState("长期居家办公")
      setDeskXY(finalXY)
      setDeskTempXY(finalXY)
      setDeskType(type)
      setDeskApplied(true)
      setAgentStatus("Applied")
    }, 1500)
  }

  if (onboardPhase === "upload" || onboardPhase === "scanning") {
    return <OnboardScreen phase={onboardPhase} photoURL={photoURL} scanStep={scanStep}
      onUpload={f => {
        setPhotoURL(URL.createObjectURL(f)); setOnboardPhase("scanning"); setScanStep(0)
        ;[700,1400,2100,2800].forEach((d, i) => setTimeout(() => setScanStep(i + 1), d))
        setTimeout(() => setOnboardPhase("calibrate"), 3600)
      }} onSkip={() => setOnboardPhase("calibrate")} />
  }

  if (onboardPhase === "calibrate") {
    return <CalibrationScreen photoURL={photoURL} data={roomData}
      onChange={(k, v) => setRoomData(d => ({ ...d, [k]: v }))} onConfirm={() => setOnboardPhase("done")} />
  }

  const currentDeskXY = deskTempXY || deskXY

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: FONT, backgroundColor: T.bg }}>
      <header style={{
        height: 56, display: "flex", alignItems: "center", padding: "0 28px",
        justifyContent: "space-between", flexShrink: 0,
        background: "rgba(10,10,10,0.88)", backdropFilter: "blur(28px) saturate(180%)",
        borderBottom: `1px solid ${T.border}`, position: "relative", zIndex: 10,
      }}>
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.5px", color: T.text }}>SpaceBranch</span>
        <nav style={{ display: "flex", alignItems: "center", gap: 16, padding: "4px 12px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 980 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Agent Status:</span>
          <span style={{ fontSize: 14, color: agentStatus === "Idle" ? T.text3 : T.blue, fontWeight: 500 }}>{agentStatus}</span>
        </nav>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <LeftPanel lifeState={lifeState} priorities={priorities} decisions={decisions} area={(parseFloat(roomData.length)*parseFloat(roomData.width)).toFixed(1)} dims={`${roomData.width} × ${roomData.length} m`} />

        <main ref={canvasRef} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#0A0A0A" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.08s ease-out", filter: "drop-shadow(0 8px 40px rgba(0,0,0,0.6))" }}>
              <RoomCanvas
                phase={"initial"} deskXY={currentDeskXY} readXY={null} storageXY={null} petXY={null}
                storageApplied={false} petApplied={false}
                isDraggingDesk={false} isDraggingRead={false} isDraggingStorage={false} isDraggingPet={false}
                onDeskDown={() => {}} onReadDown={() => {}} onStorageDown={() => {}} onPetDown={() => {}}
                svgRef={svgRef} customModules={[]} onCustomModuleDown={() => {}} onRemoveCustom={() => {}}
                unlockedItems={new Set()} onToggleUnlock={() => {}}
              />
            </div>
          </div>
        </main>

        <RightPanel
          status={agentStatus} input={input} onInputChange={setInput} onSubmit={startAgentFlow}
          explicitNeeds={explicitNeeds} implicitNeeds={implicitNeeds}
          activeStep={activeStep} explorationLog={explorationLog} onUserDecision={handleUserDecision}
        />
      </div>
    </div>
  )
}
"""

with open("src/App.tsx", "w") as f:
    f.write(top_part + bottom_part)
