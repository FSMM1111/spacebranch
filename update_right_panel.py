import re

with open("src/App.tsx", "r") as f:
    text = f.read()

rp_sig = re.compile(r"function RightPanel\(\{.*?: Phase; deskXY: XY \| null; readXY: XY \| null; storageXY: XY \| null; petXY: XY \| null\n  storageApplied: boolean; petApplied: boolean", re.DOTALL)
new_rp_sig = """function RightPanel({ aiPhase, phase, deskXY, readXY, storageXY, petXY, storageApplied, petApplied,
  lastDeskAlt, lastReadAlt, canGoBack, onAction, onBack,
  customInput, onCustomInputChange, onAddCustom,
  customInputW, onCustomInputWChange, customInputH, onCustomInputHChange }: {
  aiPhase: string; phase: Phase; deskXY: XY | null; readXY: XY | null; storageXY: XY | null; petXY: XY | null
  storageApplied: boolean; petApplied: boolean"""

text = rp_sig.sub(new_rp_sig, text)

# Now we need to modify the content() inside RightPanel.
# Let's replace the content() function body entirely.

content_regex = re.compile(r"  const content = \(\) => \{\n    if \(phase === \"initial\"\).*?return null\n  \}", re.DOTALL)

new_content = """  const content = () => {
    if (aiPhase === "idle") return (
      <div style={{ animation: "fade-in 0.3s ease both", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>✨</div>
        <p style={{ fontSize: 18, color: T.text3, lineHeight: 1.6 }}>
          在左侧输入生活变化，<br/>AI 将为你推理空间需求并共创布置方案。
        </p>
      </div>
    )

    if (aiPhase === "interpreting") return (
      <div style={{ animation: "fade-in 0.3s ease both", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", border: `3px solid rgba(255,255,255,0.1)`, borderTopColor: T.blue, animation: "spin 1s linear infinite", marginBottom: 20 }} />
        <p style={{ fontSize: 18, color: T.text2 }}>正在理解生活情境...</p>
      </div>
    )

    if (aiPhase === "reasoning" || (aiPhase === "strategies" && phase === "initial")) return (
      <div style={{ animation: "fade-in 0.4s ease both" }}>
        {sectionLbl("2. Spatial Impact")}
        <div style={{ borderRadius: 10, padding: "14px", backgroundColor: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)", marginBottom: 20 }}>
          <p style={{ fontSize: 17, color: T.red, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
            发现空间冲突！
          </p>
          <p style={{ fontSize: 16, color: "rgba(255,69,58,0.8)", lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
            当前空间南侧窗边采光最好，但若增加双人办公区，将占用 90cm 主通道并阻挡左侧衣柜。若放在床尾，则采光受限。
          </p>
        </div>

        {aiPhase === "strategies" && (
          <div style={{ animation: "fade-in 0.4s ease both" }}>
            {divider}
            {sectionLbl("3. Trade-off Co-design")}
            <p style={{ fontSize: 16, color: T.text2, marginBottom: 14 }}>根据不同生活优先级，AI 生成了以下策略：</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => onAction("preview-B")} style={{ padding: "12px", borderRadius: 10, backgroundColor: T.panel, border: `1px solid ${lastDeskAlt === "B" ? T.blue : T.border}`, textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: lastDeskAlt === "B" ? T.blue : T.text }}>策略 A：优先工作舒适</div>
                <div style={{ fontSize: 14, color: T.text3, marginTop: 4 }}>使用固定大桌，保留采光与通道。</div>
              </button>
              <button onClick={() => onAction("preview-C")} style={{ padding: "12px", borderRadius: 10, backgroundColor: T.panel, border: `1px solid ${lastDeskAlt === "C" ? T.blue : T.border}`, textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: lastDeskAlt === "C" ? T.blue : T.text }}>策略 B：优先空间开阔</div>
                <div style={{ fontSize: 14, color: T.text3, marginTop: 4 }}>使用折叠桌，不用时收起。</div>
              </button>
              <button onClick={() => onAction("preview-A")} style={{ padding: "12px", borderRadius: 10, backgroundColor: T.panel, border: `1px solid ${lastDeskAlt === "A" ? T.blue : T.border}`, textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: lastDeskAlt === "A" ? T.blue : T.text }}>策略 C：优先预算</div>
                <div style={{ fontSize: 14, color: T.text3, marginTop: 4 }}>窗边短桌，复用部分现有家具。</div>
              </button>
            </div>
          </div>
        )}
      </div>
    )

    // The rest of the original logic for previewing and applying
    if (["desk-preview-A","desk-preview-B","desk-preview-C"].includes(phase)) {
      const id = phase.slice(-1) as "A"|"B"|"C"
      return (
        <div style={{ animation: "fade-in 0.22s ease both" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <button onClick={() => onAction("preview-B")} style={{ padding: "12px", borderRadius: 10, backgroundColor: T.panel, border: `1px solid ${lastDeskAlt === "B" ? T.blue : T.border}`, textAlign: "left", cursor: "pointer" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: lastDeskAlt === "B" ? T.blue : T.text }}>策略 A：优先工作舒适</div>
            </button>
            <button onClick={() => onAction("preview-C")} style={{ padding: "12px", borderRadius: 10, backgroundColor: T.panel, border: `1px solid ${lastDeskAlt === "C" ? T.blue : T.border}`, textAlign: "left", cursor: "pointer" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: lastDeskAlt === "C" ? T.blue : T.text }}>策略 B：优先空间开阔</div>
            </button>
            <button onClick={() => onAction("preview-A")} style={{ padding: "12px", borderRadius: 10, backgroundColor: T.panel, border: `1px solid ${lastDeskAlt === "A" ? T.blue : T.border}`, textAlign: "left", cursor: "pointer" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: lastDeskAlt === "A" ? T.blue : T.text }}>策略 C：优先预算</div>
            </button>
          </div>
          {deskMetrics && (
            <>
              {sectionLbl("此策略影响预览")}
              {deskMetrics.map(m => <MetricRow key={m.label} m={m} />)}
            </>
          )}
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            {pill(`应用此策略并调整`, true, () => onAction(`apply-${id}`))}
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => onAction("reset-ai")}
              style={{
                width: "100%", padding: "8px 0", borderRadius: 980, fontSize: 18,
                backgroundColor: "transparent", color: T.text3,
                border: `1px solid ${T.border}`, cursor: "pointer", fontFamily: FONT,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}>
              <span style={{ fontSize: 17 }}>←</span> 重新生成策略
            </button>
          </div>
        </div>
      )
    }

    if (phase === "desk-applied" || phase.startsWith("r2-") || phase.startsWith("r3-") || phase.startsWith("r4-")) {
      return (
        <div style={{ animation: "fade-in 0.3s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, backgroundColor: "rgba(48,209,88,0.12)", border: "1px solid rgba(48,209,88,0.25)", marginBottom: 16 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>✓</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: T.green }}>已应用空间策略</div>
              <div style={{ fontSize: 14, color: T.green, marginTop: 4 }}>双击画布中的家具可解锁重新拖拽。</div>
            </div>
          </div>

          {deskMetrics && (
            <>
              {sectionLbl("当前空间状态")}
              {deskMetrics.map(m => <MetricRow key={m.label} m={m} />)}
            </>
          )}

          {divider}
          {sectionLbl("继续共创")}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => onAction("r2-add-reading")}
              style={{ width: "100%", textAlign: "center", padding: "11px 14px", borderRadius: 980, backgroundColor: T.blue, border: "none", cursor: "pointer", fontFamily: FONT, transition: "background-color 0.15s", color: "#fff", fontSize: 16, fontWeight: 600 }}>
              ＋ 加入阅读角
            </button>
            <button onClick={() => onAction("r3-add-storage")}
              style={{ width: "100%", textAlign: "center", padding: "11px 14px", borderRadius: 980, backgroundColor: T.blue, border: "none", cursor: "pointer", fontFamily: FONT, transition: "background-color 0.15s", color: "#fff", fontSize: 16, fontWeight: 600 }}>
              ＋ 增加收纳
            </button>
          </div>
          <div style={{ marginTop: 10 }}>{backBtn}</div>
        </div>
      )
    }

    if (phase === "desk-active") {
        return (
          <div style={{ animation: "fade-in 0.28s ease both" }}>
            <p style={{ fontSize: 18, color: T.text2, marginBottom: 14, lineHeight: 1.5 }}>
              自由拖拽进行微调：
            </p>
            {deskMetrics && (
              <>
                {sectionLbl("实时影响")}
                {deskMetrics.map(m => <MetricRow key={m.label} m={m} />)}
              </>
            )}
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              {pill("应用当前位置", true, () => onAction("apply-custom"))}
            </div>
            <div style={{ marginTop: 10 }}>{backBtn}</div>
          </div>
        )
    }

    return null
  }"""

text = content_regex.sub(new_content, text)

# We also need to add a css animation for "spin" at the top or in index.css.
# The project has index.css, we can add it there or just inline. We'll add inline style for the loader.

# Update App.tsx component invocation of RightPanel
app_rp = re.compile(r"<RightPanel phase=\{phase\}.*?customInputHChange=\{setCustomInputH\} />", re.DOTALL)
new_app_rp = """<RightPanel aiPhase={aiPhase} phase={phase} deskXY={deskXY} readXY={readXY}
          storageXY={storageXY} petXY={petXY}
          storageApplied={storageApplied} petApplied={petApplied}
          lastDeskAlt={lastDeskAlt} lastReadAlt={lastReadAlt}
          canGoBack={phaseStack.length > 0}
          onAction={a => { if(a==='reset-ai'){ setAiPhase('idle'); setPhase('initial'); setDeskXY(null) } else handleAction(a) }} onBack={handleBack}
          customInput={customInput}
          onCustomInputChange={setCustomInput}
          onAddCustom={handleAddCustom}
          customInputW={customInputW} onCustomInputWChange={setCustomInputW}
          customInputH={customInputH} onCustomInputHChange={setCustomInputH} />"""

text = app_rp.sub(new_app_rp, text)

with open("src/App.tsx", "w") as f:
    f.write(text)
