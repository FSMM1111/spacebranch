import { useEffect, useMemo, useRef, useState } from "react"

type Screen = "onboard" | "brief" | "workspace"
type Scenario = "office" | "pet"
type PetKind = "cat" | "dog"
type WorkspaceState = "idle" | "decision" | "preview" | "applied"
type BriefInput = { text: string; photos: number; videos: number; references: number }
type InputAttachment = { id: string; name: string; url: string; media: "photo" | "video"; kind: "space" | "reference" }

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

function Onboard({ onContinue }: { onContinue: (input: BriefInput) => void }) {
  const [text, setText] = useState("")
  const [attachments, setAttachments] = useState<InputAttachment[]>([])
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const referenceRef = useRef<HTMLInputElement>(null)
  const previewUrls = useRef(new Set<string>())
  useEffect(() => () => { previewUrls.current.forEach(url => URL.revokeObjectURL(url)) }, [])

  const addFiles = (files: FileList | File[], kind: InputAttachment["kind"]) => {
    const added: InputAttachment[] = []
    let unsupported = false
    Array.from(files).forEach(file => {
      const video = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(file.name)
      const image = file.type.startsWith("image/") || /\.(jpe?g|png|heic|heif|webp|gif)$/i.test(file.name)
      if (!video && !image) { unsupported = true; return }
      const url = URL.createObjectURL(file)
      previewUrls.current.add(url)
      added.push({ id: crypto.randomUUID(), name: file.name, url, media: video ? "video" : "photo", kind })
    })
    setAttachments(previous => [...previous, ...added])
    setFileError(unsupported ? "请添加照片或视频文件；参考链接可以直接粘贴在文字中。" : "")
  }
  const removeAttachment = (item: InputAttachment) => {
    URL.revokeObjectURL(item.url)
    previewUrls.current.delete(item.url)
    setAttachments(previous => previous.filter(file => file.id !== item.id))
  }

  return (
    <div className="onboard-shell">
      <BrandHeader />
      <div className="onboard-layout">
        <main className="onboard-main">
          <div className="onboard-title">
            <Mark blue />
            <h1>说说生活正在发生的变化</h1>
            <p>写下想法，添加空间照片、视频或参考案例，一起开始。</p>
          </div>
          <div className={`unified-input-card ${dragging ? "is-dragging" : ""}`}
            onDragOver={event => { event.preventDefault(); setDragging(true) }}
            onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }}
            onDrop={event => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files, "space") }}
          >
            <textarea aria-label="空间任务描述" value={text} onChange={event => setText(event.target.value)}
              placeholder="描述生活变化、空间需求或你喜欢的样子…也可以粘贴参考链接。"
              onPaste={event => { if (event.clipboardData.files.length) { event.preventDefault(); addFiles(event.clipboardData.files, "space") } }}
            />
            {attachments.length > 0 && <div className="input-attachments" aria-label="已添加的附件">
              {attachments.map(item => <article className="input-attachment" key={item.id}>
                <div className="attachment-preview">
                  {item.media === "video" ? <video src={item.url} controls preload="metadata" /> : <img src={item.url} alt={item.name} onError={event => { event.currentTarget.style.opacity = "0" }} />}
                  <button className="remove-attachment" aria-label={`移除 ${item.name}`} onClick={() => removeAttachment(item)}>×</button>
                </div>
                <b title={item.name}>{item.name}</b>
                <small>{item.kind === "reference" ? "参考案例" : item.media === "video" ? "空间视频" : "空间照片"}</small>
              </article>)}
            </div>}
            {fileError && <p className="input-file-error" role="alert">{fileError}</p>}
            <div className="unified-input-footer">
              <div className="input-add-actions">
                <button onClick={() => fileRef.current?.click()}><span aria-hidden="true">＋</span> 照片 / 视频</button>
                <button onClick={() => referenceRef.current?.click()}><span aria-hidden="true">＋</span> 参考案例</button>
              </div>
              <button className="primary input-continue" disabled={!text.trim() && attachments.length === 0}
                onClick={() => onContinue({ text: text.trim(), photos: attachments.filter(item => item.kind === "space" && item.media === "photo").length, videos: attachments.filter(item => item.kind === "space" && item.media === "video").length, references: attachments.filter(item => item.kind === "reference").length })}>继续 <span aria-hidden="true">→</span></button>
            </div>
            <input ref={fileRef} hidden type="file" multiple accept="image/*,video/*,.heic,.heif,.mov" onChange={event => { if (event.target.files) addFiles(event.target.files, "space"); event.target.value = "" }} />
            <input ref={referenceRef} hidden type="file" multiple accept="image/*,video/*,.heic,.heif,.mov" onChange={event => { if (event.target.files) addFiles(event.target.files, "reference"); event.target.value = "" }} />
          </div>
          <p className="unified-input-hint">文字、照片、视频和参考案例可混合添加 · 支持拖拽或粘贴图片</p>
        </main>
      </div>
    </div>
  )
}

function SpaceBrief({ onStart, input }: { onStart: () => void; input: BriefInput }) {
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
    change: input.text || "根据空间影像和参考案例优化布局",
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
            ["T", "文字", input.text ? "1 条描述" : "未添加"],
            ["P", "空间影像", `${input.photos} 张照片 / ${input.videos} 段视频`],
            ["R", "参考案例", `${input.references} 个案例`],
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

function MemoryPanel({ state, scenario, officeDecision }: { state: WorkspaceState; scenario: Scenario; officeDecision: string }) {
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
            <b>当前生活状态</b><small className="memory-summary">{scenario === "pet" ? "居家办公 · 下个月养宠" : "长期居家办公"}</small>
            <span className="memory-hover-detail">
              <b>{scenario === "pet" ? "办公与宠物共处" : "卧室兼办公"}</b>
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
            <b>已确认决策</b><small className="memory-summary">{officeDecision ? `${officeDecision}${scenario === "pet" && state === "applied" ? " · 养宠布局" : ""}` : "暂未确认"}</small>
            <span className="memory-hover-detail">
              <b>{state === "applied" ? "已应用" : "等待选择"}</b>
              <small>{officeDecision ? "保留已确认办公区 · 养宠家具独立排布" : "预览方案后确认"}</small>
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
  const elementRef = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  useEffect(() => {
    setPos({ x: 0, y: 0 })
  }, [layoutKey])

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!drag.current) return
      const element = elementRef.current
      const room = element?.parentElement
      if (!element || !room) return
      const bounds = room.getBoundingClientRect()
      const toPlacement = (node: Element): FurniturePlacement => {
        const rect = node.getBoundingClientRect()
        return { x: (rect.left - bounds.left) / bounds.width * 100, y: (rect.top - bounds.top) / bounds.height * 100, width: rect.width / bounds.width * 100, depth: rect.height / bounds.height * 100 }
      }
      const current = toPlacement(element)
      const obstacles = Array.from(room.querySelectorAll(":scope > .drag-item")).filter(node => node !== element).map(toPlacement)
      const targetX = drag.current.px + event.clientX - drag.current.x
      const targetY = drag.current.py + event.clientY - drag.current.y
      setPos(previous => {
        const resolved = constrainMove(current, { ...current, x: current.x + (targetX - previous.x) / bounds.width * 100, y: current.y + (targetY - previous.y) / bounds.height * 100 }, obstacles)
        return { x: previous.x + (resolved.x - current.x) / 100 * bounds.width, y: previous.y + (resolved.y - current.y) / 100 * bounds.height }
      })
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
      ref={elementRef}
      className={`drag-item ${className}`}
      style={{ ...itemStyle, transform: `translate(${pos.x}px, ${pos.y}px)` }}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        drag.current = { x: event.clientX, y: event.clientY, px: pos.x, py: pos.y }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerCancel={() => { drag.current = null }}
      onLostPointerCapture={() => { drag.current = null }}
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
  const [addedFurniture, setAddedFurniture] = useState<Array<{ id: number; type: string; label: string; widthCm?: number; depthCm?: number; placement: FurniturePlacement }>>([])
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
  const [placementNotice, setPlacementNotice] = useState("")
  const insertFurniture = (type: string, label: string, widthCm?: number, depthCm?: number) => {
    const room = roomPlanRef.current
    if (!room) return
    const bounds = room.getBoundingClientRect()
    const occupied = Array.from(room.querySelectorAll(":scope > .drag-item")).map(node => {
      const rect = node.getBoundingClientRect()
      return { x: (rect.left - bounds.left) / bounds.width * 100, y: (rect.top - bounds.top) / bounds.height * 100, width: rect.width / bounds.width * 100, depth: rect.height / bounds.height * 100 }
    })
    const defaults: Record<string, [number, number]> = { desk: [25, 16], shelf: [9, 24], chair: [13, 17], night: [10, 10], basket: [12, 8] }
    const size = defaults[type] || [20, 14]
    const width = widthCm ? widthCm / (Math.max(2, Number(roomLength) || 4) * 100) * 100 : size[0]
    const depth = depthCm ? depthCm / (Math.max(2, Number(roomWidth) || 3) * 100) * 100 : size[1]
    let placement: FurniturePlacement | undefined
    for (let y = 0; y <= 100 - depth && !placement; y++) for (let x = 0; x <= 100 - width; x++) {
      const candidate = { x, y, width, depth }
      if (!occupied.some(other => overlaps(candidate, other))) { placement = candidate; break }
    }
    if (!placement) { setPlacementNotice("没有足够的空闲位置，请先移动家具或减小模块尺寸。"); return }
    setAddedFurniture(items => [...items, { id: Date.now(), type, label, widthCm, depthCm, placement }])
    setPlacementNotice("")
    setCustomOpen(false)
    setLibraryOpen(false)
  }
  const addFurniture = (type: string, label: string) => insertFurniture(type, label)
  const addCustomFurniture = () => insertFurniture("custom", customName.trim() || "自定义家具", Math.max(20, Math.min(300, Number(customWidth) || 80)), Math.max(20, Math.min(300, Number(customDepth) || 40)))
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
          {addedFurniture.map((item) => (
            <DragItem
              key={item.id}
              className={`added-furniture added-${item.type}`}
              label={item.label}
              layoutKey={`added-${item.id}`}
              itemStyle={placementStyle(item.placement)}
            />
          ))}
        </div>
        </div>
      </div>
      {placementNotice && <p role="status">{placementNotice}</p>}
      <button className="primary confirm-space" onClick={onConfirm}>确认空间并开始布局</button>
    </div>
  )
}

type FurniturePlacement = { x: number; y: number; width: number; depth: number }
type FurnitureModule = FurniturePlacement & { id: string; label: string; height: number }

const COLLISION_EPSILON = 1e-7
function overlaps(a: FurniturePlacement, b: FurniturePlacement): boolean {
  return a.x < b.x + b.width - COLLISION_EPSILON && a.x + a.width > b.x + COLLISION_EPSILON && a.y < b.y + b.depth - COLLISION_EPSILON && a.y + a.depth > b.y + COLLISION_EPSILON
}

// Swept AABB: stop at the first contact even when the pointer jumps across a module.
function constrainMove(current: FurniturePlacement, requested: FurniturePlacement, obstacles: FurniturePlacement[]): FurniturePlacement {
  let position = { ...current }
  let dx = Math.max(0, Math.min(100 - current.width, requested.x)) - current.x
  let dy = Math.max(0, Math.min(100 - current.depth, requested.y)) - current.y
  for (let pass = 0; pass < 3 && Math.hypot(dx, dy) > COLLISION_EPSILON; pass++) {
    let time = 1, blockX = false, blockY = false
    for (const other of obstacles) {
      const interval = (start: number, delta: number, low: number, high: number): [number, number] => {
        if (Math.abs(delta) < COLLISION_EPSILON) return start <= low + COLLISION_EPSILON || start >= high - COLLISION_EPSILON ? [Infinity, -Infinity] : [-Infinity, Infinity]
        const a = (low - start) / delta, b = (high - start) / delta
        return [Math.min(a, b), Math.max(a, b)]
      }
      const [enterX, exitX] = interval(position.x, dx, other.x - position.width, other.x + other.width)
      const [enterY, exitY] = interval(position.y, dy, other.y - position.depth, other.y + other.depth)
      const entry = Math.max(enterX, enterY), exit = Math.min(exitX, exitY)
      if (entry >= -COLLISION_EPSILON && entry < time && exit > Math.max(0, entry) + COLLISION_EPSILON) {
        time = Math.max(0, entry)
        blockX = enterX >= enterY - COLLISION_EPSILON
        blockY = enterY >= enterX - COLLISION_EPSILON
      }
    }
    const travel = time < 1 ? Math.max(0, time - COLLISION_EPSILON) : 1
    position = { ...position, x: position.x + dx * travel, y: position.y + dy * travel }
    dx = blockX ? 0 : dx * (1 - travel)
    dy = blockY ? 0 : dy * (1 - travel)
  }
  return obstacles.some(other => overlaps(position, other)) ? current : position
}

// All CSS position/size properties use the same easing. Test their entire interpolation,
// and disable only transitions that would make volumes pass through one another.
function canAnimateLayout(before: FurnitureModule[], after: FurnitureModule[]): boolean {
  const previous = new Map(before.map(item => [item.id, item]))
  for (let i = 0; i < after.length; i++) for (let j = i + 1; j < after.length; j++) {
    const a1 = after[i], b1 = after[j], a0 = previous.get(a1.id) || a1, b0 = previous.get(b1.id) || b1
    let low = 0, high = 1, possible = true
    const gaps = [
      [a0.x + a0.width - b0.x, a1.x + a1.width - b1.x],
      [b0.x + b0.width - a0.x, b1.x + b1.width - a1.x],
      [a0.y + a0.depth - b0.y, a1.y + a1.depth - b1.y],
      [b0.y + b0.depth - a0.y, b1.y + b1.depth - a1.y],
    ]
    for (const [start, end] of gaps) {
      const delta = end - start
      if (Math.abs(delta) < COLLISION_EPSILON) { if (start <= COLLISION_EPSILON) possible = false }
      else if (delta > 0) low = Math.max(low, (COLLISION_EPSILON - start) / delta)
      else high = Math.min(high, (COLLISION_EPSILON - start) / delta)
    }
    if (possible && low < high && high > 0 && low < 1) return false
  }
  return true
}

type LayoutMotionStep = { furniture: FurnitureModule[]; duration: number }

function modulePath(start: FurnitureModule, goal: FurnitureModule, obstacles: FurnitureModule[]): FurnitureModule[] | null {
  if (obstacles.some(item => overlaps(goal, item))) return null
  const coordinates = (axis: "x" | "y", size: number) => Array.from(new Set([
    0, 100 - size, start[axis], goal[axis],
    ...obstacles.flatMap(item => [item[axis] - size, item[axis] + (axis === "x" ? item.width : item.depth)]),
  ].filter(value => value >= 0 && value <= 100 - size))).sort((a, b) => a - b)
  const xs = coordinates("x", start.width), ys = coordinates("y", start.depth)
  const key = (x: number, y: number) => y * xs.length + x
  const startKey = key(xs.indexOf(start.x), ys.indexOf(start.y)), goalKey = key(xs.indexOf(goal.x), ys.indexOf(goal.y))
  const costs = new Map<number, number>([[startKey, 0]]), previous = new Map<number, number>(), open = new Set([startKey])
  const placement = (node: number) => ({ ...start, x: xs[node % xs.length], y: ys[Math.floor(node / xs.length)] })
  while (open.size) {
    let node = -1, best = Infinity
    for (const candidate of open) {
      const point = placement(candidate), score = costs.get(candidate)! + Math.abs(point.x - goal.x) + Math.abs(point.y - goal.y)
      if (score < best) { node = candidate; best = score }
    }
    if (node === goalKey) {
      const path = [placement(node)]
      while (previous.has(node)) { node = previous.get(node)!; path.unshift(placement(node)) }
      return path.filter((point, i) => i === 0 || i === path.length - 1 || !((path[i - 1].x === point.x && point.x === path[i + 1].x) || (path[i - 1].y === point.y && point.y === path[i + 1].y)))
    }
    open.delete(node)
    const x = node % xs.length, y = Math.floor(node / xs.length), from = placement(node)
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || nx >= xs.length || ny < 0 || ny >= ys.length) continue
      const next = key(nx, ny), to = placement(next)
      const swept = { x: Math.min(from.x, to.x), y: Math.min(from.y, to.y), width: start.width + Math.abs(from.x - to.x), depth: start.depth + Math.abs(from.y - to.y) }
      if (obstacles.some(item => overlaps(swept, item))) continue
      const cost = costs.get(node)! + Math.abs(from.x - to.x) + Math.abs(from.y - to.y)
      if (cost >= (costs.get(next) ?? Infinity)) continue
      costs.set(next, cost); previous.set(next, node); open.add(next)
    }
  }
  return null
}

function planLayoutMotion(before: FurnitureModule[], after: FurnitureModule[]): LayoutMotionStep[] {
  if (canAnimateLayout(before, after)) return [{ furniture: after, duration: 800 }]
  let working = before.filter(item => after.some(target => target.id === item.id))
  const steps: LayoutMotionStep[] = []
  const different = (a: FurnitureModule, b: FurnitureModule) => a.x !== b.x || a.y !== b.y || a.width !== b.width || a.depth !== b.depth
  const pending = new Map(after.filter(item => working.some(previous => previous.id === item.id && different(previous, item))).map(item => [item.id, item]))
  const push = (item: FurnitureModule, duration: number) => {
    working = working.map(previous => previous.id === item.id ? item : previous)
    steps.push({ furniture: working, duration })
  }
  const move = (current: FurnitureModule, target: FurnitureModule): boolean => {
    const obstacles = working.filter(item => item.id !== current.id)
    if (obstacles.some(item => overlaps(target, item))) return false
    const small = { ...current, width: Math.min(current.width, target.width), depth: Math.min(current.depth, target.depth) }
    const path = modulePath(small, { ...small, x: target.x, y: target.y }, obstacles)
    if (!path) return false
    if (different(current, small)) push(small, 120)
    for (let i = 1; i < path.length; i++) {
      const distance = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y)
      push(path[i], Math.max(110, Math.min(360, distance * 7)))
    }
    if (different(path[path.length - 1], target)) push(target, 140)
    return true
  }
  for (let attempt = 0; pending.size && attempt < after.length * 4; attempt++) {
    let advanced = false
    for (const [id, target] of pending) {
      if (move(working.find(item => item.id === id)!, target)) { pending.delete(id); advanced = true }
    }
    if (advanced) continue
    // Resolve mutual blocking by temporarily parking a moving module in free space.
    let parked = false
    const movableIds = after.filter(target => before.some(original => original.id === target.id && different(original, target))).map(item => item.id)
    const parkingOrder = [...movableIds.filter(id => !pending.has(id)), ...pending.keys()]
    for (const id of parkingOrder) {
      const item = working.find(current => current.id === id)!
      const reserved = [...working.filter(other => other.id !== id), ...after.filter(other => other.id !== id)]
      const candidates: FurnitureModule[] = []
      for (let y = 0; y <= 100 - item.depth; y += 2) for (let x = 0; x <= 100 - item.width; x += 2) {
        const candidate = { ...item, x, y }
        if (Math.hypot(x - item.x, y - item.y) >= 2 && !reserved.some(other => overlaps(candidate, other))) candidates.push(candidate)
      }
      candidates.sort((a, b) => (Math.hypot(a.x - 34, a.y - 40) + .1 * Math.hypot(a.x - item.x, a.y - item.y)) - (Math.hypot(b.x - 34, b.y - 40) + .1 * Math.hypot(b.x - item.x, b.y - item.y)))
      for (const candidate of candidates) {
        const parkedLayout = working.map(other => other.id === id ? candidate : other)
        const unblocks = Array.from(pending.values()).some(target => {
          if (target.id === id) return false
          const current = parkedLayout.find(other => other.id === target.id)!
          const obstacles = parkedLayout.filter(other => other.id !== target.id)
          if (obstacles.some(other => overlaps(target, other))) return false
          const small = { ...current, width: Math.min(current.width, target.width), depth: Math.min(current.depth, target.depth) }
          return modulePath(small, { ...small, x: target.x, y: target.y }, obstacles) !== null
        })
        if (unblocks && move(item, candidate)) { pending.set(id, after.find(target => target.id === id)!); parked = true; break }
      }
      if (parked) break
    }
    if (!parked) break
  }
  // A fully packed manually edited room may have no traversable route.
  // Its validated target remains usable; ordinary proposals take collision-free routes.
  if (pending.size) return [{ furniture: after, duration: 0 }]
  steps.push({ furniture: after, duration: 0 })
  return steps
}

function furnitureLayout(layout: string): FurnitureModule[] {
  const modules: FurnitureModule[] = [
    { id: "wardrobe", label: "衣柜", x: 0, y: 0, width: 22, depth: 38, height: 92 },
    { id: "bed", label: "床", x: 64, y: 0, width: 36, depth: 70, height: 24 },
    { id: "desk", label: "书桌", x: 0, y: 46, width: 15, depth: 30, height: 34 },
    { id: "shelf", label: "书柜", x: 0, y: 76, width: 9, depth: 24, height: 70 },
    { id: "night", label: "床头柜", x: 53, y: 0, width: 10, depth: 10, height: 28 },
    { id: "basket", label: "置物筐", x: 0, y: 38, width: 12, depth: 8, height: 14 },
    { id: "chair", label: "椅子", x: 15, y: 52, width: 13, depth: 17, height: 38 },
  ]
  const updates: Record<string, Partial<FurniturePlacement>> = layout === "decision" ? {
    desk: { x: 27, y: 0, width: 25, depth: 16 }, chair: { x: 33, y: 16 },
    shelf: { y: 38, depth: 30 }, basket: { y: 68 },
  } : layout === "option-1" ? {
    desk: { x: 28, y: 85, width: 25, depth: 15 }, chair: { x: 34, y: 68 },
    shelf: { y: 38, depth: 30 }, basket: { y: 68 },
  } : layout === "option-2" ? {
    desk: { x: 22, y: 0, width: 15, depth: 15 }, chair: { x: 23, y: 15 },
    shelf: { y: 38, depth: 30 }, basket: { y: 68 },
  } : {}
  return modules.map((item) => ({ ...item, ...updates[item.id] }))
}

// Keep new modules along the room perimeter or fixed furniture, leaving a continuous aisle.
function petLayout(base: FurnitureModule[], kind: PetKind, option: number): FurnitureModule[] {
  const modules: FurnitureModule[] = [
    { id: "pet-clean", label: kind === "cat" ? "猫砂盆" : "如厕垫", x: 44, y: 84, width: 16, depth: 16, height: kind === "cat" ? 12 : 3 },
    { id: "pet-bed", label: "宠物窝", x: 64, y: 82, width: 18, depth: 18, height: 10 },
    { id: "pet-food", label: "食水区", x: 84, y: 90, width: 16, depth: 10, height: 5 },
    ...(kind === "dog" && option !== 2 ? [{ id: "pet-play", label: "玩具收纳", x: 10, y: 38, width: 12, depth: 12, height: 14 }] : []),
  ]
  const occupied = [...base]
  for (const item of modules) {
    const preferred = option === 1 ? { ...item, x: item.id === "pet-food" ? 10 : item.x, y: item.id === "pet-food" ? 38 : item.y } : item
    const candidates: { x: number; y: number; score: number }[] = []
    for (let y = 0; y <= 100 - item.depth; y++) {
      for (let x = 0; x <= 100 - item.width; x++) {
        // Protect the entrance and the full central circulation route.
        if (x < 44 && y + item.depth > 78) continue
        if (x < 64 && x + item.width > 28 && y < 80 && y + item.depth > 34) continue
        if (occupied.some(other => x < other.x + other.width + 1 && x + item.width + 1 > other.x && y < other.y + other.depth + 1 && y + item.depth + 1 > other.y)) continue
        const wallGap = Math.min(x, y, 100 - x - item.width, 100 - y - item.depth)
        // A cabinet edge also counts as the room edge, never a floating central island.
        const besideFixed = base.some(other =>
          ((Math.abs(x - other.x - other.width) <= 2 || Math.abs(x + item.width - other.x) <= 2) && y < other.y + other.depth && y + item.depth > other.y) ||
          ((Math.abs(y - other.y - other.depth) <= 2 || Math.abs(y + item.depth - other.y) <= 2) && x < other.x + other.width && x + item.width > other.x))
        if (wallGap > 1 && !besideFixed) continue
        const clean = occupied.find(other => other.id === "pet-clean")
        const separation = clean ? Math.hypot(x + item.width / 2 - clean.x - clean.width / 2, y + item.depth / 2 - clean.y - clean.depth / 2) : 100
        const separationPenalty = item.id === "pet-food" ? Math.max(0, 30 - separation) * 4 : 0
        candidates.push({ x, y, score: (wallGap <= 1 ? 0 : 30) + Math.abs(x - preferred.x) + Math.abs(y - preferred.y) + separationPenalty })
      }
    }
    candidates.sort((a, b) => a.score - b.score)
    // If no edge is free, omit the module instead of filling the aisle.
    if (candidates[0]) occupied.push({ ...item, x: candidates[0].x, y: candidates[0].y })
  }
  return occupied
}

function placementStyle(item: FurniturePlacement): React.CSSProperties {
  return { left: `${item.x}%`, top: `${item.y}%`, right: "auto", bottom: "auto", width: `${item.width}%`, height: `${item.depth}%` }
}

function FurnitureSymbol({ type, variant }: { type: string; variant?: string }) {
  return (
    <svg className={`plan-symbol symbol-${type}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {type === "bed" && <>
        <rect x="4" y="3" width="92" height="94" rx="1" />
        <rect x="9" y="8" width="35" height="18" rx="2" /><rect x="56" y="8" width="35" height="18" rx="2" />
        <path d="M5 33H95M8 37H92V92H8Z" /><path className="symbol-fine" d="M8 40L92 45M8 44L92 49" />
      </>}
      {type === "wardrobe" && <>
        <rect x="4" y="3" width="92" height="94" /><path d="M50 3V97M4 50H96" />
        <path className="symbol-dashed" d="M4 3L50 50L96 3M4 97L50 50L96 97" />
        <path d="M45 22V31M55 22V31M45 69V78M55 69V78" />
      </>}
      {type === "desk" && <>
        <rect x="4" y="5" width="92" height="90" rx="2" />
        <rect x="25" y="18" width="50" height="27" rx="1" /><path d="M46 45V51H54V45M35 51H65" />
        <rect x="29" y="60" width="42" height="10" rx="1" /><rect x="78" y="59" width="9" height="12" rx="3" />
        <path className="symbol-fine" d="M34 63H65M34 67H65" />
      </>}
      {type === "shelf" && <>
        <rect x="5" y="3" width="90" height="94" /><path d="M5 25H95M5 49H95M5 73H95" />
        <path className="symbol-fine" d="M18 6V22M30 6V22M45 6V22M61 7L72 22M18 29V46M34 29V46M50 29V46M66 29V46M18 53V70M32 53V70M47 53V70M66 53L77 70M18 77V94M35 77V94M51 77V94" />
      </>}
      {type === "night" && <><rect x="5" y="5" width="90" height="90" rx="2" /><circle cx="50" cy="44" r="22" /><circle cx="50" cy="44" r="5" /><path d="M5 82H95M42 88H58" /></>}
      {type === "basket" && <><rect x="7" y="8" width="86" height="84" rx="10" /><rect x="14" y="16" width="72" height="68" rx="7" /><path className="symbol-fine" d="M26 16V84M42 16V84M58 16V84M74 16V84M14 32H86M14 50H86M14 68H86" /></>}
      {type === "pet-bed" && <><rect x="5" y="5" width="90" height="90" rx="24" /><rect className="pet-symbol-cushion" x="17" y="17" width="66" height="66" rx="20" /><path className="symbol-fine" d="M29 72Q50 82 71 72" /></>}
      {type === "pet-food" && <><rect x="4" y="8" width="92" height="84" rx="12" /><ellipse className="pet-symbol-well" cx="28" cy="50" rx="19" ry="28" /><ellipse className="pet-symbol-well" cx="72" cy="50" rx="19" ry="28" /><ellipse className="symbol-fine" cx="28" cy="50" rx="13" ry="19" /><ellipse className="symbol-fine" cx="72" cy="50" rx="13" ry="19" /></>}
      {type === "pet-clean" && <><rect x="5" y="5" width="90" height="90" rx="10" /><rect className="pet-symbol-tray" x="15" y="15" width="70" height="70" rx="6" />{variant === "如厕垫" ? <path className="symbol-fine" d="M33 18V82M50 18V82M67 18V82M18 33H82M18 50H82M18 67H82" /> : <><path className="symbol-fine" d="M24 29H76M24 42H76M24 55H76M24 68H76" /><path d="M37 92H63" /></>}</>}
      {type === "pet-play" && <><rect x="6" y="6" width="88" height="88" rx="9" /><rect x="16" y="16" width="68" height="68" rx="5" /><path d="M36 48H64V54H36Z" /></>}
      {type === "chair" && <><rect className="chair-backrest" x="16" y="5" width="68" height="14" rx="5" /><rect x="19" y="25" width="62" height="56" rx="12" /><path d="M12 27V67M88 27V67M12 27H19M81 27H88M50 81V94M29 94H71" /></>}
    </svg>
  )
}

function Furniture2D({ item, onMove }: { item: FurnitureModule; onMove: (id: string, placement: FurniturePlacement) => void }) {
  const drag = useRef<{ x: number; y: number; startX: number; startY: number; roomWidth: number; roomDepth: number } | null>(null)
  return (
    <button
      className={`drag-item ${item.id === "chair" ? "chair" : `${item.id}-module`}`}
      data-furniture-id={item.id}
      style={placementStyle(item)}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        const room = event.currentTarget.parentElement!
        drag.current = { x: item.x, y: item.y, startX: event.clientX, startY: event.clientY, roomWidth: room.clientWidth, roomDepth: room.clientHeight }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const start = drag.current
        if (!start) return
        onMove(item.id, { ...item,
          x: Math.max(0, Math.min(100 - item.width, start.x + (event.clientX - start.startX) / start.roomWidth * 100)),
          y: Math.max(0, Math.min(100 - item.depth, start.y + (event.clientY - start.startY) / start.roomDepth * 100)),
        })
      }}
      onKeyDown={(event) => {
        const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
        const delta = directions[event.key]
        if (!delta) return
        event.preventDefault()
        const step = event.shiftKey ? 5 : 1
        onMove(item.id, { ...item, x: item.x + delta[0] * step, y: item.y + delta[1] * step })
      }}
      onPointerUp={(event) => { drag.current = null; event.currentTarget.releasePointerCapture(event.pointerId) }}
      onPointerCancel={() => { drag.current = null }}
      onLostPointerCapture={() => { drag.current = null }}
    >
      <FurnitureSymbol type={item.id} variant={item.label} />
      <span className="furniture-label">{item.label}</span>
    </button>
  )
}

function ModelBlock({ x = 0, y = 0, width = 100, depth = 100, height, z = 0, className = "", children, front, right }: {
  x?: number; y?: number; width?: number; depth?: number; height: number; z?: number; className?: string; children?: React.ReactNode; front?: React.ReactNode; right?: React.ReactNode
}) {
  return <div className={`model-block ${className}`} style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${depth}%`, transform: `translateZ(${z}px)`, "--part-height": `${height}px` } as React.CSSProperties}>
    <div className="model-face model-top">{children}</div>
    <div className="model-face model-front">{front}</div>
    <div className="model-face model-back" />
    <div className="model-face model-left" />
    <div className="model-face model-right">{right}</div>
  </div>
}

function ThreeDBox({ item }: { item: FurnitureModule }) {
  const label = <span className="model-label">{item.label}</span>
  return <div className={`object-3d ${item.id}-3d`} data-furniture-id={item.id} style={placementStyle(item)}>
    {item.id === "bed" && <>
      <ModelBlock height={9} className="bed-frame" />
      <ModelBlock x={4} y={3} width={92} depth={94} z={9} height={12} className="mattress">{label}<span className="model-duvet" /></ModelBlock>
      <ModelBlock x={9} y={8} width={35} depth={18} z={21} height={4} className="model-pillow" />
      <ModelBlock x={56} y={8} width={35} depth={18} z={21} height={4} className="model-pillow" />
      <ModelBlock depth={3} height={32} className="bed-headboard" />
    </>}
    {item.id === "desk" && <ModelBlock height={item.height} className="model-solid-desk">{label}<span className="model-surface-outline" /></ModelBlock>}
    {item.id === "wardrobe" && <ModelBlock height={item.height} className="model-cabinet" right={<div className="model-cabinet-doors"><span /><span /></div>}>{label}</ModelBlock>}
    {item.id === "shelf" && <ModelBlock height={item.height} className="model-bookcase" right={<div className="model-shelves">{[0,1,2,3].map(i=><span key={i}><i /><i /><i /></span>)}</div>}>{label}</ModelBlock>}
    {item.id === "chair" && <ModelBlock height={28} className="model-solid-chair">{label}<span className="model-seat-outline" /></ModelBlock>}
    {item.id === "night" && <>
      <ModelBlock height={24} className="model-nightstand" front={<div className="model-drawers"><span /><span /></div>}>{label}</ModelBlock>
      <ModelBlock x={37} y={29} width={26} depth={26} z={24} height={2} className="model-lamp-base" />
      <ModelBlock x={47} y={39} width={6} depth={6} z={26} height={10} />
      <ModelBlock x={28} y={20} width={44} depth={44} z={36} height={8} className="model-lampshade" />
    </>}
    {item.id.startsWith("pet-") && <ModelBlock height={item.height} className={`model-pet ${item.id} ${item.label === "如厕垫" ? "pet-pad" : ""}`}>
      {item.id === "pet-bed" && <span className="pet-cushion" />}
      {item.id === "pet-food" && <div className="pet-bowl-wells"><span /><span /></div>}
      {item.id === "pet-clean" && <span className="pet-tray-inset" />}
      {item.id === "pet-play" && <span className="pet-storage-lid" />}
      {label}
    </ModelBlock>}
    {item.id === "basket" && <ModelBlock height={14} className="model-basket" front={<FurnitureSymbol type="basket" />}><FurnitureSymbol type="basket" />{label}</ModelBlock>}
  </div>
}

function FloorPlan({
  state,
  selectedOption,
  viewMode,
  onViewModeChange,
  furniture,
  onMove,
  scenario,
  motionKey,
}: {
  state: WorkspaceState
  selectedOption: number
  viewMode: "2d" | "3d"
  onViewModeChange: (mode: "2d" | "3d") => void
  furniture: FurnitureModule[]
  onMove: (id: string, placement: FurniturePlacement) => void
  scenario: Scenario
  motionKey: string
}) {
  const [orbit, setOrbit] = useState({ pitch: 57, yaw: -36 })
  const orbitDrag = useRef<{ x: number; y: number; pitch: number; yaw: number } | null>(null)
  const [displayedFurniture, setDisplayedFurniture] = useState(furniture)
  const [layoutMoving, setLayoutMoving] = useState(false)
  const displayedRef = useRef(furniture)
  const lastMotionKey = useRef(motionKey)
  useEffect(() => {
    const update = (items: FurnitureModule[]) => { displayedRef.current = items; setDisplayedFurniture(items) }
    if (lastMotionKey.current === motionKey || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lastMotionKey.current = motionKey
      update(furniture)
      setLayoutMoving(false)
      return
    }
    lastMotionKey.current = motionKey
    const steps = planLayoutMotion(displayedRef.current, furniture)
    let frame = 0, stepIndex = 0, started: number | null = null, origin = displayedRef.current
    setLayoutMoving(true)
    const tick = (now: number) => {
      const step = steps[stepIndex]
      if (!step) { update(furniture); setLayoutMoving(false); return }
      if (started === null) started = now
      const progress = step.duration ? Math.min(1, (now - started) / step.duration) : 1
      const eased = progress * progress * (3 - 2 * progress)
      const previous = new Map(origin.map(item => [item.id, item]))
      update(step.furniture.map(item => {
        const from = previous.get(item.id) || item
        return { ...item, x: from.x + (item.x - from.x) * eased, y: from.y + (item.y - from.y) * eased, width: from.width + (item.width - from.width) * eased, depth: from.depth + (item.depth - from.depth) * eased }
      }))
      if (progress === 1) { origin = step.furniture; started = null; stepIndex++ }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [furniture, motionKey])
  return (
    <main className="floor-area" data-motion-safe={false} data-layout-moving={layoutMoving}>
      <div className="floor-toolbar">
        <div><h1>空间布局</h1><p>卧室 · 12 ㎡ · {viewMode === "2d" ? "平面视图" : "白模视图"}</p></div>
        <div className="tools">
          <div className="view-switch">
            <button className={viewMode === "2d" ? "active" : ""} onClick={() => onViewModeChange("2d")}>2D 图</button>
            <button className={viewMode === "3d" ? "active" : ""} onClick={() => onViewModeChange("3d")}>3D 图</button>
          </div>
          <span className="viewport-label">{viewMode === "2d" ? "TOP / 2D" : "SOLID / 3D"}</span>
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
              {displayedFurniture.map((item) => <ThreeDBox key={item.id} item={item} />)}
            </div>
            <div className="view-3d-hint">按住并拖动旋转视角 · 拖动家具请切回 2D 图</div>
          </div>
        ) : (
        <div className="plan-wrap">
          <div className="window-title">窗户</div>
          <div className="measure measure-y">3 000</div>
          <div className="measure measure-x">4 000</div>
          <div className="room-plan" aria-label="卧室二维平面图">
            <div className="floor-grid" />
            <svg className="plan-light" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M38 0H66L100 53V78L38 16Z" /><path d="M0 45L30 75H0Z" /></svg>
            <div className="room-window"><i /><i /></div>
            <div className="room-door"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M2 98V2M2 2A96 96 0 0 1 98 98" /></svg></div>
            {displayedFurniture.map((item) => <Furniture2D key={item.id} item={item} onMove={onMove} />)}
            {state === "decision" && scenario === "office" && <div className="corridor-zone" />}
          {state === "decision" && scenario === "office" && <div className="conflict"><i>!</i><span>Attempt 01<b>通道过窄</b></span></div>}
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

const petOptions = [
  ["Shared Living", "分区共处", "食水与清洁分开", "保留办公区", "安静休息"],
  ["Play Space", "活动优先", "模块沿边排布", "释放中央空间", "活动更自由"],
  ["Essential Kit", "最小改动", "三件基础模块", "后续逐步添置", "保留原有家具"],
]

const comparisonMetrics = [
  { label: "工作舒适度", values: [96, 78, 65], display: ["96", "78", "65"] },
  { label: "空间开阔度", values: [68, 94, 82], display: ["68", "94", "82"] },
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
  scenario,
  petKind,
  onPetKindChange,
  onStartPet,
  officeDecision,
  furniture,
}: {
  state: WorkspaceState
  selectedOption: number
  latestRequest: string
  onExplore: (request: string) => void
  onSelect: (index: number) => void
  onBack: () => void
  onApply: () => void
  scenario: Scenario
  petKind: PetKind
  onPetKindChange: (kind: PetKind) => void
  onStartPet: () => void
  officeDecision: string
  furniture: FurnitureModule[]
}) {
  const currentOptions = scenario === "pet" ? petOptions : options
  const selected = currentOptions[selectedOption]
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

        {scenario === "pet" && <div className="chat-message ai"><div className="scenario-history"><small>已完成 · 长期居家办公</small><b>{officeDecision || "保留现有办公区"}</b><p>在已确认的布局上继续规划下个月的养宠生活。</p></div></div>}
        {latestRequest && <div className="chat-message user"><div><p>{latestRequest}</p></div><i>U</i></div>}

        {state !== "idle" && (
          <>
            <div className="chat-message ai">
              
              <div>
                <b>{scenario === "pet" ? "为下个月的养宠生活预留空间" : "已完成空间分析"}</b>
                {scenario === "pet" ? <>
                  <p>保留已确认的办公家具位置，新增食水、休息与清洁模块；清洁区和食水区分开，中央通道优先留空。</p>
                  <div className="pet-kind-switch" role="group" aria-label="宠物类型">{(["cat", "dog"] as const).map(kind => <button key={kind} aria-pressed={petKind === kind} onClick={() => onPetKindChange(kind)}>{kind === "cat" ? "计划养猫" : "计划养狗"}</button>)}</div>
                  <small className="pet-note">小型宠物示意布局 · 可切换类型后再预览</small>
                </> : <><p>我检查了墙面、窗户、门的开合和主要通道，并自主尝试了三种布局策略。</p><ul><li>固定家具保持贴墙</li><li>主通道优先保持 80 cm 以上</li><li>书桌避开门洞与窗户开口</li></ul></>}
              </div>
            </div>
            <div className="chat-message ai">
              
              <div>
                <b>需要你的决策</b>
                <p>点击任一方案会立即在中间平面图中预览，但不会直接应用。</p>
                <div className="chat-options">
                  {currentOptions.map((option, index) => (
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
                  <button disabled={state === "applied"} onClick={() => onSelect((selectedOption + currentOptions.length - 1) % currentOptions.length)} aria-label="上一个方案">‹</button>
                  {selectedOption + 1} / {currentOptions.length}
                  <button disabled={state === "applied"} onClick={() => onSelect((selectedOption + 1) % currentOptions.length)} aria-label="下一个方案">›</button>
                </span>
              </div>
              {scenario === "pet" ? <div className="pet-module-list"><b>新增养宠模块</b>{furniture.filter(item => item.id.startsWith("pet-")).map(item => <div key={item.id}><span>{item.label}</span><small>{Math.round(item.width * 4)} × {Math.round(item.depth * 3)} cm</small></div>)}<p>{selectedOption === 2 ? "先配置休息、食水和清洁三个基础区域。" : "养宠模块沿墙或固定家具边缘排布，中央过道保持留空。"}</p>{furniture.filter(item => item.id.startsWith("pet-")).length < (petKind === "dog" && selectedOption !== 2 ? 4 : 3) && <p role="status">当前空闲位置不足，部分模块暂未加入。可先移动现有家具，再重新生成养宠方案。</p>}<small>尺寸与位置为示意，可拖动微调后确认。</small></div> : <div className="metric-charts">
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
              }
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
            <div className="chat-message ai"><div><b>方案已应用</b><p>已按“{selected[1]}”完成排布。中间的家具仍可拖拽微调，你也可以继续输入新需求。</p>{scenario === "office" && <button className="next-scenario" onClick={onStartPet}><small>下一个生活场景</small><b>下个月打算养宠物 <span>↗</span></b></button>}</div></div>
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
  const [scenario, setScenario] = useState<Scenario>("office")
  const [petKind, setPetKind] = useState<PetKind>("cat")
  const [officeBase, setOfficeBase] = useState<FurnitureModule[]>([])
  const [officeDecision, setOfficeDecision] = useState("")
  const [layoutEdits, setLayoutEdits] = useState<Record<string, Record<string, FurniturePlacement>>>({})
  const layout = state === "preview" || state === "applied" ? `option-${selectedOption}` : state === "decision" ? "decision" : "base"
  const layoutKey = `${scenario}-${scenario === "pet" ? petKind : ""}-${layout}`
  const base = useMemo(() => scenario === "pet" ? petLayout(officeBase, petKind, selectedOption) : furnitureLayout(layout), [scenario, officeBase, petKind, selectedOption, layout])
  const furniture = useMemo(() => base.map(item => ({ ...item, ...layoutEdits[layoutKey]?.[item.id] })), [base, layoutEdits, layoutKey])
  const explore = (request: string) => {
    if (/宠物|养猫|养狗|养宠|猫咪|狗狗/.test(request)) {
      if (scenario === "office") setOfficeBase(furniture)
      setScenario("pet")
      if (/狗/.test(request)) setPetKind("dog")
      else if (/猫/.test(request)) setPetKind("cat")
    }
    setLatestRequest(request)
    setSelectedOption(0)
    setState("decision")
  }
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
        <MemoryPanel state={state} scenario={scenario} officeDecision={officeDecision} />
        <FloorPlan state={state} selectedOption={selectedOption} viewMode={viewMode} onViewModeChange={setViewMode} scenario={scenario} motionKey={layoutKey} furniture={furniture} onMove={(id, placement) => setLayoutEdits(previous => {
          const current = base.map(item => ({ ...item, ...previous[layoutKey]?.[item.id] }))
          const moving = current.find(item => item.id === id)
          if (!moving) return previous
          const resolved = constrainMove(moving, placement, current.filter(item => item.id !== id))
          if (resolved.x === moving.x && resolved.y === moving.y) return previous
          return { ...previous, [layoutKey]: { ...previous[layoutKey], [id]: resolved } }
        })} />
        <div className="resize-handle" onPointerDown={(event) => { resize.current = { x: event.clientX, width: panelWidth } }} />
        <AgentPanel
          state={state}
          selectedOption={selectedOption}
          latestRequest={latestRequest}
          onExplore={explore}
          scenario={scenario}
          petKind={petKind}
          officeDecision={officeDecision}
          furniture={furniture}
          onPetKindChange={kind => { setPetKind(kind); setState("decision") }}
          onStartPet={() => explore("下个月打算养宠物") }
          onSelect={(index) => {
            setSelectedOption(index)
            if (state === "decision") {
              setState("preview")
            }
          }}
          onBack={() => setState("decision")}
          onApply={() => { if (scenario === "office") setOfficeDecision(options[selectedOption][1]); setState("applied") }}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboard")
  const [input, setInput] = useState<BriefInput>({ text: "", photos: 0, videos: 0, references: 0 })

  if (screen === "workspace") return <Workspace />
  return (
    <>
      <Onboard onContinue={value => { setInput(value); setScreen("brief") }} />
      {screen === "brief" && <SpaceBrief input={input} onStart={() => setScreen("workspace")} />}
    </>
  )
}
