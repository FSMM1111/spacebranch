import { useEffect, useRef, useState } from "react"

type Screen = "onboard" | "brief" | "workspace"
type WorkspaceState = "idle" | "decision" | "preview" | "applied"
type InputMode = "text" | "camera" | "reference"

function Mark({ blue = false }: { blue?: boolean }) {
  return (
    <span className={blue ? "brand-mark brand-mark--blue" : "brand-mark"}>
      <img src={blue ? "/assets/home-blue.svg" : "/assets/home-mark.svg"} alt="" />
    </span>
  )
}

function BrandHeader({ status }: { status?: string }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Mark />
        <span>SpaceBranch</span>
      </div>
      {status && (
        <div className="agent-status">
          <b>AGENT STATUS:</b>
          <span className={status === "Idle" ? "" : "active"}>{status}</span>
        </div>
      )}
    </header>
  )
}

const modeInfo = {
  text: {
    tag: "TEXT",
    title: "文字描述",
    detail: "说变化、目标与限制",
    icon: "/assets/input-text.svg",
  },
  camera: {
    tag: "CAMERA",
    title: "拍照 / 录像",
    detail: "让我看见真实空间",
    icon: "/assets/input-camera.svg",
  },
  reference: {
    tag: "REFERENCE",
    title: "收纳案例",
    detail: "告诉我你喜欢什么",
    icon: "/assets/input-reference.svg",
  },
}

function Onboard({ onContinue }: { onContinue: () => void }) {
  const [mode, setMode] = useState<InputMode>("text")
  const [text, setText] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="onboard-shell">
      <BrandHeader />
      <div className="onboard-layout">
        <main className="onboard-main">
          <div className="onboard-title">
            <Mark blue />
            <h1>说说生活正在发生的变化</h1>
            <p>选择最省力的方式。Agent 会把不同证据合并成一个空间任务。</p>
          </div>
          <div className="mode-grid">
            {(Object.keys(modeInfo) as InputMode[]).map((id) => {
              const item = modeInfo[id]
              return (
                <button
                  className={`mode-card ${mode === id ? "active" : ""}`}
                  key={id}
                  onClick={() => setMode(id)}
                >
                  <span className={`mode-tag ${id}`}>{item.tag}</span>
                  <img src={item.icon} alt="" />
                  <b>{item.title}</b>
                  <small>{item.detail}</small>
                </button>
              )
            })}
          </div>
          <div className="input-panel">
            {mode === "text" ? (
              <>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="例如：下个月开始长期居家办公，希望卧室能容纳一个舒适的工作区，但不想让休息区变得拥挤。"
                />
                <div className="input-footer">
                  <span>描述越具体，空间推导越准确</span>
                  <button onClick={onContinue} disabled={!text.trim()}>继续</button>
                </div>
              </>
            ) : (
              <button className="drop-zone" onClick={() => fileRef.current?.click()}>
                <b>{mode === "camera" ? "选择照片或视频" : "选择参考案例"}</b>
                <span>点击选择或拖拽到这里 · JPG、PNG、HEIC、MOV、MP4</span>
              </button>
            )}
            <input ref={fileRef} hidden type="file" accept="image/*,video/*" />
          </div>
        </main>
      </div>
    </div>
  )
}

function SpaceBrief({ onStart }: { onStart: () => void }) {
  const analysisSteps = [
    ["读取生活变化", "识别长期居家办公与桌面增长"],
    ["解析空间证据", "定位墙体、门窗和现有家具"],
    ["归纳物品特征", "区分高频物品与低频收纳"],
    ["推导隐性约束", "检查主通道、采光和固定家具"],
    ["生成 Space Brief", "合并证据并形成可确认任务"],
  ]
  const [analysisStep, setAnalysisStep] = useState(0)
  const [briefStage, setBriefStage] = useState<"analyzing" | "extract" | "preview">("analyzing")
  const [stageChanging, setStageChanging] = useState(false)
  const [closing, setClosing] = useState(false)
  const [fixedConstraint, setFixedConstraint] = useState<"fixed" | "adjustable">("fixed")
  const [briefFields, setBriefFields] = useState({
    change: "长期居家办公，桌面物品明显增加",
    space: "12 ㎡卧室；桌面拥挤；窗边仍有可利用区域",
    items: "高频：电脑 / 线材 / 文件；低频：相机配件 / 收藏品",
    preference: "桌面保持留白；更偏隐藏式收纳",
    constraints: "不增加大型家具；保留衣柜与主通道",
  })
  const changeStage = (nextStage: "extract" | "preview") => {
    setStageChanging(true)
    window.setTimeout(() => {
      setBriefStage(nextStage)
      setStageChanging(false)
    }, 180)
  }
  const finishFlow = () => {
    setClosing(true)
    window.setTimeout(onStart, 280)
  }

  useEffect(() => {
    let current = 0
    let finishTimer: ReturnType<typeof setTimeout> | undefined
    const interval = window.setInterval(() => {
      current += 1
      if (current < analysisSteps.length) {
        setAnalysisStep(current)
      } else {
        window.clearInterval(interval)
        finishTimer = setTimeout(() => changeStage("extract"), 450)
      }
    }, 680)
    return () => {
      window.clearInterval(interval)
      if (finishTimer) clearTimeout(finishTimer)
    }
  }, [])

  return (
    <div className={`brief-overlay ${closing ? "is-closing" : ""}`}>
      <section className={`space-brief-modal ${briefStage === "analyzing" ? "is-analyzing" : briefStage === "extract" ? "is-ready" : "preview-stage"} ${stageChanging ? "stage-leaving" : ""}`}>
        {briefStage === "analyzing" ? (
          <div className="brief-analysis">
            <div className="analysis-mark"><Mark blue /><i /><i /><i /></div>
            <h1>正在理解这次空间任务</h1>
            <p>Agent 正在把不同输入合并为一份可确认的 Space Brief</p>
            <div className="analysis-sources">
              <span><b>T</b>文字描述</span>
              <span><b>P</b>空间影像</span>
              <span><b>R</b>参考案例</span>
            </div>
            <div className="analysis-steps">
              {analysisSteps.map(([title, detail], index) => (
                <div className={index < analysisStep ? "done" : index === analysisStep ? "active" : ""} key={title}>
                  <i>{index < analysisStep ? "✓" : index + 1}</i>
                  <span><b>{title}</b><small>{detail}</small></span>
                  {index === analysisStep && <em><i /><i /><i /></em>}
                </div>
              ))}
            </div>
            <div className="analysis-progress">
              <i style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }} />
            </div>
            <small className="analysis-count">{analysisStep + 1} / {analysisSteps.length}</small>
          </div>
        ) : briefStage === "extract" ? (
          <>
        <div className="sources">
          <h3>Sources</h3>
          {[
            ["T", "文字", "1 条描述"],
            ["P", "空间影像", "4 张照片 / 1 段视频"],
            ["R", "参考案例", "2 个案例"],
          ].map(([letter, title, detail], index) => (
            <div className={`source source-${index}`} key={letter}>
              <span>{letter}</span>
              <div><b>{title}</b><small>{detail}</small></div>
            </div>
          ))}
        </div>
        <div className="brief-summary">
          <h1>Space Brief</h1>
          <p>我对这次空间任务的理解</p>
          {[
            ["change", "生活变化"],
            ["space", "当前空间"],
            ["items", "物品特征"],
            ["preference", "偏好"],
            ["constraints", "固定条件"],
          ].map(([key, label]) => (
            <div className="summary-row" key={key}>
              <span>{label}</span>
              <input
                value={briefFields[key as keyof typeof briefFields]}
                onChange={(event) => setBriefFields((fields) => ({ ...fields, [key]: event.target.value }))}
                aria-label={label}
              />
            </div>
          ))}
        </div>
        <div className="brief-check">
          <h3>Need your check</h3>
          <span className="confirmed">4 / 5 confirmed</span>
          <div className="check-card">
            <b>“衣柜是固定不可移动的吗？”</b>
            <div>
              <button className={fixedConstraint === "fixed" ? "selected" : ""} onClick={() => setFixedConstraint("fixed")}>是，保持不动</button>
              <button className={fixedConstraint === "adjustable" ? "selected" : ""} onClick={() => setFixedConstraint("adjustable")}>可小幅调整</button>
            </div>
          </div>
          <button className="primary" onClick={() => changeStage("preview")}>确认信息并预览空间</button>
        </div>
          </>
        ) : (
          <div className="embedded-calibration">
            <SpacePreviewEditor onBack={() => changeStage("extract")} onConfirm={finishFlow} />
          </div>
        )}
      </section>
    </div>
  )
}

function Calibration({ onConfirm }: { onConfirm: () => void }) {
  const [facing, setFacing] = useState("北")
  const [windowRange, setWindowRange] = useState({ left: 35, right: 65 })
  const planRef = useRef<HTMLDivElement>(null)
  const windowDrag = useRef<"left" | "right" | null>(null)

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!windowDrag.current || !planRef.current) return
      const rect = planRef.current.getBoundingClientRect()
      const percentage = Math.max(4, Math.min(96, ((event.clientX - rect.left) / rect.width) * 100))
      setWindowRange((range) =>
        windowDrag.current === "left"
          ? { ...range, left: Math.min(percentage, range.right - 10) }
          : { ...range, right: Math.max(percentage, range.left + 10) },
      )
    }
    const up = () => { windowDrag.current = null }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [])

  return (
    <div className="calibration-shell">
      <BrandHeader />
      <span className="calibration-label">空间校准</span>
      <main className="calibration-main">
        <section className="calibration-controls">
          <h1>确认空间数据</h1>
          <p>AI 已识别基础信息，请在右侧图中标注细节。</p>
          <div className="detected-card">
            <h3><i /> 已识别</h3>
            <div className="checks">
              {["衣柜", "床", "窗户", "门"].map((item) => <label key={item}><input defaultChecked type="checkbox" />{item}</label>)}
            </div>
            <div className="dimensions">
              <label>长（m）<input defaultValue="4.0" /></label>
              <label>宽（m）<input defaultValue="3.0" /></label>
            </div>
            <strong>12.0 ㎡</strong>
          </div>
          <div className="annotation-card">
            <h3>标注进度</h3>
            {["窗户位置", "窗户朝向", "门的开合"].map((item) => <p key={item}><i />{item}</p>)}
            <p className="pending"><i />插座标注</p>
          </div>
          <button className="primary" onClick={onConfirm}>开始空间布局 →</button>
          <div className="ai-notes"><b>AI 无法判断</b><br />– 承重墙位置<br />– 采光随时段的变化<br />– 噪音来源方向</div>
        </section>
        <section className="calibration-canvas">
          <div className="canvas-toolbar">
            <span><i /> 空间标注</span>
            <p>拖动家具调整布局 · 拖动蓝点调整窗户 · 门洞保持畅通</p>
          </div>
          <div className="facing">
            <span>窗户朝向</span>
            {["北", "东", "南", "西"].map((item) => <button className={facing === item ? "active" : ""} onClick={() => setFacing(item)} key={item}>{item}</button>)}
            <em>窗户宽 1.7 m</em>
          </div>
          <div className="calibration-plan-wrap">
            <div className="calibration-plan" ref={planRef}>
              <div className="floor-grid" />
              <div
                className="calibration-window"
                style={{ left: `${windowRange.left}%`, width: `${windowRange.right - windowRange.left}%` }}
              >
                <button aria-label="调整窗户左边缘" onPointerDown={() => { windowDrag.current = "left" }} />
                <span>窗户　{(((windowRange.right - windowRange.left) / 100) * 4).toFixed(1)} m</span>
                <button aria-label="调整窗户右边缘" onPointerDown={() => { windowDrag.current = "right" }} />
              </div>
              <div className="room-door calibration-door" aria-label="门洞位置" />
              <DragItem className="wardrobe-module" label="衣柜" layoutKey="calibration" />
              <DragItem className="bed-module" label="床" layoutKey="calibration" />
              <DragItem className="desk-module" label="书桌" layoutKey="calibration" />
              <DragItem className="shelf-module" label="书柜" layoutKey="calibration" />
              <DragItem className="night-module" label="床头柜" layoutKey="calibration" />
              <DragItem className="basket-module" label="置物筐" layoutKey="calibration" />
              <DragItem className="cal-chair-module" label="椅子" layoutKey="calibration" />
            </div>
            <span className="dim calibration-dim-h">4 m</span>
            <span className="dim calibration-dim-v">3 m</span>
          </div>
          <div className="editor-legend"><span className="blue-dot" />拖动蓝点调整窗户　<span className="legend-furniture" />拖动家具修改位置　<span className="orange-dot" />门洞位置</div>
        </section>
      </main>
    </div>
  )
}

function MemoryPanel({ state }: { state: WorkspaceState }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const expandSection = (section: string) => {
    setExpandedSections((sections) => {
      const next = new Set(sections)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }
  return (
    <aside className="memory-panel">
      <div className="memory-title">
        <b>空间记忆</b>
        <small>卧室 · 已完成空间校准</small>
        <div className="space-facts">
          <span><b>12.0㎡</b><small>面积</small></span>
          <span><b>4.0 × 3.0m</b><small>长宽</small></span>
          <span><b>1 门 1 窗</b><small>开口</small></span>
        </div>
      </div>
      <nav>
        <button className={`active ${expandedSections.has("life") ? "expanded" : ""}`} onClick={() => expandSection("life")}>
          <span className="line-icon">♙</span>
          <div>
            <b>当前生活状态</b><small className="memory-summary">长期居家办公</small>
            <span className="memory-hover-detail">
              <b>卧室兼办公</b>
              <small>每周 5 天 · 约 8h / 天</small>
              <em>共用 12㎡</em>
            </span>
          </div><i>›</i>
        </button>
        <button className={expandedSections.has("priorities") ? "expanded" : ""} onClick={() => expandSection("priorities")}>
          <span className="line-icon">☷</span>
          <div>
            <b>用户优先级</b><small className="memory-summary">通道 ＞ 舒适 ＞ 收纳</small>
            <span className="memory-hover-detail">
              <b>优先顺序</b>
              <small>1. 通道 ≥ 80cm<br />2. 工作舒适<br />3. 增加收纳</small>
            </span>
          </div><i>›</i>
        </button>
        <button className={expandedSections.has("decisions") ? "expanded" : ""} onClick={() => expandSection("decisions")}>
          <span className="line-icon">✓</span>
          <div>
            <b>已确认决策</b><small className="memory-summary">{state === "applied" ? "床尾折叠工作区" : "暂未确认"}</small>
            <span className="memory-hover-detail">
              <b>{state === "applied" ? "已应用" : "等待选择"}</b>
              <small>{state === "applied" ? "书桌贴墙 · 保留主通道" : "预览方案后确认"}</small>
            </span>
          </div><i>›</i>
        </button>
        <button className={expandedSections.has("constraints") ? "expanded" : ""} onClick={() => expandSection("constraints")}>
          <span className="line-icon">▣</span>
          <div>
            <b>固定约束</b><small className="memory-summary">衣柜 · 窗户 · 门洞</small>
            <span className="memory-hover-detail">
              <b>不可占用</b>
              <small>衣柜开启区<br />窗前与门洞</small>
              <em>可用墙面约 6.4m</em>
            </span>
          </div><i>›</i>
        </button>
      </nav>
    </aside>
  )
}

function DragItem({
  className,
  label,
  layoutKey,
  itemStyle,
}: {
  className: string
  label: string
  layoutKey: string
  itemStyle?: React.CSSProperties
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  useEffect(() => {
    setPos({ x: 0, y: 0 })
  }, [layoutKey])

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!drag.current) return
      setPos({ x: drag.current.px + event.clientX - drag.current.x, y: drag.current.py + event.clientY - drag.current.y })
    }
    const up = () => { drag.current = null }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [])

  return (
    <button
      className={`drag-item ${className}`}
      style={{ ...itemStyle, transform: `translate(${pos.x}px, ${pos.y}px)` }}
      onPointerDown={(event) => {
        drag.current = { x: event.clientX, y: event.clientY, px: pos.x, py: pos.y }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
    >
      <span className="furniture-label">{label}</span>
      {className.includes("bed-module") && <span className="bed-linens"><i /><i /></span>}
      {className.includes("desk-module") && <span className="desk-top"><i className="laptop" /><i className="plant" /></span>}
      {className.includes("wardrobe-module") && <span className="wardrobe-doors"><i /><i /></span>}
      {className.includes("shelf-module") && <span className="shelf-lines"><i /><i /><i /></span>}
    </button>
  )
}

const furnitureLibrary = [
  { type: "desk", label: "书桌" },
  { type: "shelf", label: "书柜" },
  { type: "chair", label: "椅子" },
  { type: "night", label: "床头柜" },
  { type: "basket", label: "置物筐" },
]

function SpacePreviewEditor({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [roomLength, setRoomLength] = useState("4.0")
  const [roomWidth, setRoomWidth] = useState("3.0")
  const [windowOpening, setWindowOpening] = useState({ left: 38, right: 66 })
  const [doorOpening, setDoorOpening] = useState({ left: 7, right: 25 })
  const [customName, setCustomName] = useState("自定义家具")
  const [customWidth, setCustomWidth] = useState("80")
  const [customDepth, setCustomDepth] = useState("40")
  const [addedFurniture, setAddedFurniture] = useState<Array<{ id: number; type: string; label: string; widthCm?: number; depthCm?: number }>>([])
  const roomPlanRef = useRef<HTMLDivElement>(null)
  const openingDrag = useRef<{
    target: "window" | "door"
    mode: "move" | "left" | "right"
    startX: number
    left: number
    right: number
  } | null>(null)

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = openingDrag.current
      const room = roomPlanRef.current
      if (!drag || !room) return
      const delta = ((event.clientX - drag.startX) / room.getBoundingClientRect().width) * 100
      const minimumWidth = 8
      let next = { left: drag.left, right: drag.right }
      if (drag.mode === "move") {
        const width = drag.right - drag.left
        const left = Math.max(0, Math.min(100 - width, drag.left + delta))
        next = { left, right: left + width }
      } else if (drag.mode === "left") {
        next = { left: Math.max(0, Math.min(drag.right - minimumWidth, drag.left + delta)), right: drag.right }
      } else {
        next = { left: drag.left, right: Math.min(100, Math.max(drag.left + minimumWidth, drag.right + delta)) }
      }
      if (drag.target === "window") setWindowOpening(next)
      else setDoorOpening(next)
    }
    const up = () => { openingDrag.current = null }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [])

  const startOpeningDrag = (
    event: React.PointerEvent,
    target: "window" | "door",
    mode: "move" | "left" | "right",
  ) => {
    event.preventDefault()
    event.stopPropagation()
    const opening = target === "window" ? windowOpening : doorOpening
    openingDrag.current = { target, mode, startX: event.clientX, ...opening }
  }
  const addFurniture = (type: string, label: string) => {
    setAddedFurniture((items) => [...items, { id: Date.now(), type, label }])
    setLibraryOpen(false)
  }
  const addCustomFurniture = () => {
    const widthCm = Math.max(20, Math.min(300, Number(customWidth) || 80))
    const depthCm = Math.max(20, Math.min(300, Number(customDepth) || 40))
    setAddedFurniture((items) => [...items, { id: Date.now(), type: "custom", label: customName.trim() || "自定义家具", widthCm, depthCm }])
    setCustomOpen(false)
    setLibraryOpen(false)
  }
  const parsedLength = Math.max(2, Math.min(10, Number(roomLength) || 4))
  const parsedWidth = Math.max(2, Math.min(10, Number(roomWidth) || 3))

  return (
    <div className="simple-space-preview">
      <button className="simple-preview-back" onClick={onBack}>‹ 返回上一步</button>
      <h1>确认 2D 空间</h1>
      <div className="simple-plan-shell">
        <div className="room-size-editor">
          <label>长 <input type="number" min="2" max="10" step="0.1" value={roomLength} onChange={(event) => setRoomLength(event.target.value)} /> m</label>
          <span>×</span>
          <label>宽 <input type="number" min="2" max="10" step="0.1" value={roomWidth} onChange={(event) => setRoomWidth(event.target.value)} /> m</label>
          <b>{(parsedLength * parsedWidth).toFixed(1)} ㎡</b>
        </div>
        <div className="add-furniture">
          <button onClick={() => setLibraryOpen((open) => !open)}>＋ 增加家具模块</button>
          {libraryOpen && (
            <div className="furniture-menu">
              {!customOpen ? (
                <>
                  {furnitureLibrary.map((item) => (
                    <button key={item.type} onClick={() => addFurniture(item.type, item.label)}>{item.label}</button>
                  ))}
                  <button className="custom-furniture-entry" onClick={() => setCustomOpen(true)}>＋ 自定义尺寸家具</button>
                </>
              ) : (
                <div className="custom-furniture-form">
                  <b>自定义家具模块</b>
                  <label>名称<input value={customName} onChange={(event) => setCustomName(event.target.value)} /></label>
                  <div>
                    <label>宽度（cm）<input type="number" min="20" max="300" value={customWidth} onChange={(event) => setCustomWidth(event.target.value)} /></label>
                    <label>深度（cm）<input type="number" min="20" max="300" value={customDepth} onChange={(event) => setCustomDepth(event.target.value)} /></label>
                  </div>
                  <span><button onClick={() => setCustomOpen(false)}>返回</button><button onClick={addCustomFurniture}>添加</button></span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="simple-room-frame" style={{ aspectRatio: `${parsedLength} / ${parsedWidth}` }}>
          <span className="room-dimension room-dimension-x">{parsedLength.toFixed(1)} m</span>
          <span className="room-dimension room-dimension-y">{parsedWidth.toFixed(1)} m</span>
        <div className="simple-room-plan" ref={roomPlanRef}>
          <div className="floor-grid" />
          <div
            className="editable-opening editable-window"
            style={{ left: `${windowOpening.left}%`, width: `${windowOpening.right - windowOpening.left}%` }}
            onPointerDown={(event) => startOpeningDrag(event, "window", "move")}
          >
            <button aria-label="调整窗户左边缘" onPointerDown={(event) => startOpeningDrag(event, "window", "left")} />
            <span>窗户 {(((windowOpening.right - windowOpening.left) / 100) * parsedLength).toFixed(1)} m</span>
            <button aria-label="调整窗户右边缘" onPointerDown={(event) => startOpeningDrag(event, "window", "right")} />
          </div>
          <div
            className="editable-opening editable-door"
            style={{ left: `${doorOpening.left}%`, width: `${doorOpening.right - doorOpening.left}%` }}
            onPointerDown={(event) => startOpeningDrag(event, "door", "move")}
          >
            <button aria-label="调整门洞左边缘" onPointerDown={(event) => startOpeningDrag(event, "door", "left")} />
            <span>门 {(((doorOpening.right - doorOpening.left) / 100) * parsedLength).toFixed(1)} m</span>
            <button aria-label="调整门洞右边缘" onPointerDown={(event) => startOpeningDrag(event, "door", "right")} />
          </div>
          <DragItem className="wardrobe-module" label="衣柜" layoutKey="space-preview" />
          <DragItem className="bed-module" label="床" layoutKey="space-preview" />
          <DragItem className="desk-module" label="书桌" layoutKey="space-preview" />
          <DragItem className="shelf-module" label="书柜" layoutKey="space-preview" />
          <DragItem className="night-module" label="床头柜" layoutKey="space-preview" />
          <DragItem className="basket-module" label="置物筐" layoutKey="space-preview" />
          <DragItem className="cal-chair-module" label="椅子" layoutKey="space-preview" />
          {addedFurniture.map((item, index) => (
            <DragItem
              key={item.id}
              className={`added-furniture added-${item.type}`}
              label={item.label}
              layoutKey={`added-${item.id}`}
              itemStyle={{
                left: `${34 + (index % 4) * 9}%`,
                top: `${38 + (index % 3) * 12}%`,
                ...(item.widthCm ? { width: `${Math.min(70, (item.widthCm / (parsedLength * 100)) * 100)}%` } : {}),
                ...(item.depthCm ? { height: `${Math.min(70, (item.depthCm / (parsedWidth * 100)) * 100)}%` } : {}),
              }}
            />
          ))}
        </div>
        </div>
      </div>
      <button className="primary confirm-space" onClick={onConfirm}>确认空间并开始布局</button>
    </div>
  )
}

function ThreeDBox({ className, label, height }: { className: string; label: string; height: number }) {
  return (
    <div className={`object-3d ${className}`} style={{ "--box-height": `${height}px` } as React.CSSProperties}>
      <div className="box-face box-top"><span>{label}</span>{className.includes("bed-3d") && <><i /><i /></>}</div>
      <div className="box-face box-front" />
      <div className="box-face box-side" />
    </div>
  )
}

function FloorPlan({
  state,
  selectedOption,
  viewMode,
  onViewModeChange,
}: {
  state: WorkspaceState
  selectedOption: number
  viewMode: "2d" | "3d"
  onViewModeChange: (mode: "2d" | "3d") => void
}) {
  const [orbit, setOrbit] = useState({ pitch: 57, yaw: -36 })
  const orbitDrag = useRef<{ x: number; y: number; pitch: number; yaw: number } | null>(null)
  const layoutClass =
    state === "preview"
      ? `room-preview room-preview-${selectedOption}`
      : state === "applied"
        ? `room-applied room-applied-${selectedOption}`
        : `room-${state}`
  return (
    <main className="floor-area">
      <div className="floor-toolbar">
        <div><h1>{viewMode === "2d" ? "2D Floor Plan" : "3D Space View"}</h1><p>12 ㎡ · 卧室</p></div>
        <div className="tools">
          <div className="view-switch">
            <button className={viewMode === "2d" ? "active" : ""} onClick={() => onViewModeChange("2d")}>2D 图</button>
            <button className={viewMode === "3d" ? "active" : ""} onClick={() => onViewModeChange("3d")}>3D 图</button>
          </div>
          <span>−　100%　＋</span>
        </div>
      </div>
      <div className="floor-stage">
        {viewMode === "3d" ? (
          <div
            className="space-3d-stage"
            onPointerDown={(event) => {
              orbitDrag.current = { x: event.clientX, y: event.clientY, ...orbit }
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              const drag = orbitDrag.current
              if (!drag) return
              setOrbit({
                pitch: Math.max(32, Math.min(76, drag.pitch - (event.clientY - drag.y) * 0.18)),
                yaw: drag.yaw + (event.clientX - drag.x) * 0.22,
              })
            }}
            onPointerUp={(event) => {
              orbitDrag.current = null
              event.currentTarget.releasePointerCapture(event.pointerId)
            }}
          >
            <div className="room-3d" style={{ transform: `rotateX(${orbit.pitch}deg) rotateZ(${orbit.yaw}deg) translate3d(2%,3%,0)` }}>
              <div className="wall-3d wall-3d-back"><span>窗户</span></div>
              <div className="wall-3d wall-3d-side" />
              <div className="floor-3d-grid" />
              <ThreeDBox className="wardrobe-3d" label="衣柜" height={92} />
              <ThreeDBox className="bed-3d" label="床" height={24} />
              <ThreeDBox className="desk-3d" label="书桌" height={34} />
              <ThreeDBox className="shelf-3d" label="书柜" height={70} />
              <ThreeDBox className="night-3d" label="床头柜" height={28} />
              <ThreeDBox className="chair-3d" label="椅子" height={38} />
            </div>
            <div className="view-3d-hint">按住并拖动旋转视角 · 拖动家具请切回 2D 图</div>
          </div>
        ) : (
        <div className="plan-wrap">
          <div className="window-title">窗户</div>
          <div className="measure measure-y">3 m</div>
          <div className="measure measure-x">4 m</div>
          <div className={`room-plan ${layoutClass}`} aria-label="卧室二维平面图">
            <div className="floor-grid" />
            <div className="room-window"><i /><i /></div>
            <div className="room-door" />
            <DragItem className="wardrobe-module" label="衣柜" layoutKey={`${state}-${selectedOption}`} />
            <DragItem className="bed-module" label="床" layoutKey={`${state}-${selectedOption}`} />
            <DragItem className="desk-module" label="书桌" layoutKey={`${state}-${selectedOption}`} />
            <DragItem className="shelf-module" label="书柜" layoutKey={`${state}-${selectedOption}`} />
            <DragItem className="night-module" label="床头柜" layoutKey={`${state}-${selectedOption}`} />
            <DragItem className="basket-module" label="置物筐" layoutKey={`${state}-${selectedOption}`} />
            <div className="chair"><i /><i /></div>
            <div className="desk-plant" />
            {state === "decision" && <div className="corridor-zone" />}
          {state === "decision" && <div className="conflict"><i>!</i><span>Attempt 01<b>通道过窄</b></span></div>}
          </div>
          <div className="plan-legend"><span className="legend-furniture" />家具 <span className="legend-window" />窗户 <span className="legend-door" />门</div>
        </div>
        )}
      </div>
    </main>
  )
}

const options = [
  ["Work First", "工作舒适优先", "办公舒适", "收纳充足", "专注不受扰"],
  ["Flex Space", "空间灵活优先", "空间更清", "一室多用", "日常要开阔"],
  ["Minimal Change", "最小改动优先", "保留现有家具", "成本最低", "快速可实施"],
]

const comparisonMetrics = [
  { label: "工作舒适度", values: [96, 78, 65], display: ["96", "78", "65"] },
  { label: "空间开阔度", values: [68, 94, 82], display: ["68", "94", "82"] },
  { label: "成本友好度", values: [62, 76, 96], display: ["62", "76", "96"] },
  { label: "主通道宽度", values: [82, 100, 91], display: ["82 cm", "90 cm", "86 cm"] },
]

function AgentPanel({
  state,
  selectedOption,
  latestRequest,
  onExplore,
  onSelect,
  onBack,
  onApply,
}: {
  state: WorkspaceState
  selectedOption: number
  latestRequest: string
  onExplore: (request: string) => void
  onSelect: (index: number) => void
  onBack: () => void
  onApply: () => void
}) {
  const selected = options[selectedOption]
  const [draft, setDraft] = useState("")
  const conversationRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const conversation = conversationRef.current
    if (conversation) conversation.scrollTop = conversation.scrollHeight
  }, [state, latestRequest])
  const submitRequest = () => {
    const request = draft.trim()
    if (!request) return
    onExplore(request)
    setDraft("")
  }
  return (
    <aside className="workspace-panel">
      <header><b>AGENT WORKSPACE</b><strong>{state === "decision" ? "Need your decision" : state === "preview" ? "Previewing" : state === "applied" ? "Applied" : ""}</strong></header>
      <div className="conversation" ref={conversationRef}>
        <div className="chat-message ai">
          
          <div><p>告诉我你的生活变化或空间需求。我会分析空间、尝试布局，并在需要你判断时暂停。</p></div>
        </div>

        {latestRequest && <div className="chat-message user"><div><p>{latestRequest}</p></div><i>U</i></div>}

        {state !== "idle" && (
          <>
            <div className="chat-message ai">
              
              <div>
                <b>已完成空间分析</b>
                <p>我检查了墙面、窗户、门的开合和主要通道，并自主尝试了三种布局策略。</p>
                <ul><li>固定家具保持贴墙</li><li>主通道优先保持 80 cm 以上</li><li>书桌避开门洞与窗户开口</li></ul>
              </div>
            </div>
            <div className="chat-message ai">
              
              <div>
                <b>需要你的决策</b>
                <p>点击任一方案会立即在中间平面图中预览，但不会直接应用。</p>
                <div className="chat-options">
                  {options.map((option, index) => (
                    <button disabled={state === "applied"} className={index === selectedOption ? "active" : ""} key={option[0]} onClick={() => onSelect(index)}>
                      <span>{index + 1}</span><b>{option[0]}</b><small>{option[1]}</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {(state === "preview" || state === "applied") && (
          <div className="chat-message ai">
            
            <div className="chat-preview">
              <div className="preview-switcher-head">
                <b>当前预览：{selected[0]}</b>
                <span>
                  <button disabled={state === "applied"} onClick={() => onSelect((selectedOption + options.length - 1) % options.length)} aria-label="上一个方案">‹</button>
                  {selectedOption + 1} / {options.length}
                  <button disabled={state === "applied"} onClick={() => onSelect((selectedOption + 1) % options.length)} aria-label="下一个方案">›</button>
                </span>
              </div>
              <div className="metric-charts">
                {comparisonMetrics.map((metric) => (
                  <section className="metric-chart" key={metric.label}>
                    <b>{metric.label}</b>
                    <div>
                      {metric.values.map((value, index) => (
                        <span className={index === selectedOption ? "active" : ""} key={`${metric.label}-${index}`}>
                          <i style={{ width: `${value}%` }} /><em>{metric.display[index]}</em>
                        </span>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
              {state === "preview" && (
                <div className="chat-preview-actions">
                  <button className="primary" onClick={onApply}>应用此方案</button>
                  <button onClick={onBack}>返回决策</button>
                </div>
              )}
            </div>
          </div>
        )}

        {state === "applied" && (
          <>
            <div className="chat-message user compact"><div><p>应用方案：{selected[0]}</p></div><i>U</i></div>
            <div className="chat-message ai"><div><b>方案已应用</b><p>已按“{selected[1]}”完成排布。中间的家具仍可拖拽微调，你也可以继续输入新需求。</p></div></div>
          </>
        )}
      </div>
      <form
        className="agent-composer"
        onSubmit={(event) => {
          event.preventDefault()
          submitRequest()
        }}
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              submitRequest()
            }
          }}
          placeholder="输入新的生活变化或空间需求…"
          aria-label="输入空间需求"
        />
        <button type="submit" disabled={!draft.trim()} aria-label="发送需求">↑</button>
        <small>Enter 发送 · Shift + Enter 换行</small>
      </form>
    </aside>
  )
}

function Workspace() {
  const [state, setState] = useState<WorkspaceState>("idle")
  const [selectedOption, setSelectedOption] = useState(0)
  const [latestRequest, setLatestRequest] = useState("")
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [panelWidth, setPanelWidth] = useState(360)
  const resize = useRef<{ x: number; width: number } | null>(null)

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!resize.current) return
      setPanelWidth(Math.max(280, Math.min(800, resize.current.width + resize.current.x - event.clientX)))
    }
    const up = () => { resize.current = null }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [])

  const status = state === "idle" ? "Idle" : state === "decision" ? "Need your decision" : state === "preview" ? "Previewing" : "Applied"
  return (
    <div className="app-shell" style={{ "--panel-width": `${panelWidth}px` } as React.CSSProperties}>
      <BrandHeader status={status} />
      <div className="app-columns">
        <MemoryPanel state={state} />
        <FloorPlan state={state} selectedOption={selectedOption} viewMode={viewMode} onViewModeChange={setViewMode} />
        <div className="resize-handle" onPointerDown={(event) => { resize.current = { x: event.clientX, width: panelWidth } }} />
        <AgentPanel
          state={state}
          selectedOption={selectedOption}
          latestRequest={latestRequest}
          onExplore={(request) => {
            setLatestRequest(request)
            setSelectedOption(0)
            setState("decision")
          }}
          onSelect={(index) => {
            setSelectedOption(index)
            if (state === "decision") {
              setState("preview")
            }
          }}
          onBack={() => setState("decision")}
          onApply={() => setState("applied")}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboard")

  if (screen === "workspace") return <Workspace />
  return (
    <>
      <Onboard onContinue={() => setScreen("brief")} />
      {screen === "brief" && <SpaceBrief onStart={() => setScreen("workspace")} />}
    </>
  )
}
