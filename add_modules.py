import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Update CustomModule type
text = re.sub(
    r"interface CustomModule \{([\s\S]*?)\}",
    r"interface CustomModule {\1; annotation?: string }",
    text,
    count=1
)

# 2. Update RightPanel Applied State
old_applied_msg = """        {status === "Applied" && (
          <AgentMessage role="agent">
            <div
              style={{
                fontSize: 16,
                color: T.text,
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              已为你应用策略。你可以在左侧查看记忆，也可以在中间画布双击家具进行微调。
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                backgroundColor: "transparent",
                border: `1px solid ${T.border}`,
                color: T.text2,
                cursor: "pointer",
              }}
            >
              开始新的对话
            </button>
          </AgentMessage>
        )}"""

new_applied_msg = """        {status === "Applied" && (
          <AgentMessage role="agent">
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.5, marginBottom: 12 }}>
              已为您生成完整收纳方案，所有家具模块均可拖拽调整。您可以在左侧平面图通过拖拽家具进行微调。
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: T.blue, marginBottom: 4 }}>1. 书桌模块</div>
                <div style={{ fontSize: 13, color: T.text2, marginBottom: 4 }}><strong>AI推荐理由：</strong>满足居家办公与学习的刚性需求，利用墙角或靠墙位置，不占用主要动线。</div>
                <div style={{ fontSize: 13, color: T.text2 }}><strong>款式推荐：</strong>推荐“极简长条升降桌”或“带理线槽的靠墙书桌”。颜色建议原木色或纯白色。</div>
              </div>
              
              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: T.blue, marginBottom: 4 }}>2. 书柜模块</div>
                <div style={{ fontSize: 13, color: T.text2, marginBottom: 4 }}><strong>AI推荐理由：</strong>实现“动静分离”，避免办公区的杂乱影响休息区的氛围，同时满足书籍与展示品的收纳需求。</div>
                <div style={{ fontSize: 13, color: T.text2 }}><strong>款式推荐：</strong>推荐“窄边落地书架”或“模块化组合书柜”。</div>
              </div>

              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: T.blue, marginBottom: 4 }}>3. 床头柜模块</div>
                <div style={{ fontSize: 13, color: T.text2, marginBottom: 4 }}><strong>AI推荐理由：</strong>完善睡眠区的微收纳功能，提供触手可及的置物平面。</div>
                <div style={{ fontSize: 13, color: T.text2 }}><strong>款式推荐：</strong>推荐“带单抽屉的简约床头柜”或“轻巧的推车式床头柜”。</div>
              </div>

              <div style={{ backgroundColor: "rgba(255,255,255,0.04)", padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: T.blue, marginBottom: 4 }}>4. 衣柜顶置物筐模块</div>
                <div style={{ fontSize: 13, color: T.text2, marginBottom: 4 }}><strong>AI推荐理由：</strong>极致利用垂直空间，解决衣柜内部空间不足的问题，同时保持整体视觉的整洁。</div>
                <div style={{ fontSize: 13, color: T.text2 }}><strong>款式推荐：</strong>推荐“布艺折叠收纳筐（带盖）”或“仿藤编防尘收纳筐”。</div>
              </div>
            </div>

            <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "transparent", border: `1px solid ${T.border}`, color: T.text2, cursor: "pointer", width: "100%" }}>
              完成并开始新对话
            </button>
          </AgentMessage>
        )}"""

text = text.replace(old_applied_msg, new_applied_msg)

# 3. Add CustomModules state and logic into App()
app_hook_injection_point = "  const [deskApplied, setDeskApplied] = React.useState(false)"
app_hook_injection_new = """  const [deskApplied, setDeskApplied] = React.useState(false)

  const [customModules, setCustomModules] = React.useState<CustomModule[]>([])
  const [draggingCustom, setDraggingCustom] = React.useState<{ id: string; ox: number; oy: number } | null>(null)
  
  // Custom module drag
  React.useEffect(() => {
    if (!draggingCustom) return
    const svg = svgRef.current
    if (!svg) return
    const onMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      // PAD is 32, RW is 660, RH is 540 in constants. We use magic numbers for now.
      const mx = e.clientX - rect.left - 32
      const my = e.clientY - rect.top - 32
      setCustomModules(m => m.map(c => {
        if (c.id !== draggingCustom.id) return c
        return { ...c, x: Math.max(0, Math.min(660 - c.w, mx - draggingCustom.ox)), y: Math.max(0, Math.min(540 - c.h, my - draggingCustom.oy)) }
      }))
    }
    const onUp = () => setDraggingCustom(null)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [draggingCustom])

  const handleCustomModuleDown = React.useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const cm = customModules.find(c => c.id === id)
    if (!cm) return
    setDraggingCustom({ id, ox: e.clientX - rect.left - 32 - cm.x, oy: e.clientY - rect.top - 32 - cm.y })
  }, [customModules])
"""
text = text.replace(app_hook_injection_point, app_hook_injection_new)

# 4. Add Custom Modules on user decision
handle_decision_injection = """      setDeskApplied(true)
      setAgentStatus("Applied")
    }, 1500)"""

handle_decision_new = """      setDeskApplied(true)
      
      // 添加完整收纳方案的其它模块
      setCustomModules([
        { id: "bookshelf", name: "书柜", x: 270, y: 350, w: 90, h: 40, annotation: "书柜与办公区分开" },
        { id: "nightstand", name: "床头柜", x: 330, y: 100, w: 50, h: 40, annotation: "放置睡前读物与手机" },
        { id: "baskets", name: "衣柜顶置物筐", x: 10, y: 10, w: 140, h: 50, annotation: "置物筐收纳不常用的过季衣物" }
      ])
      
      setAgentStatus("Applied")
    }, 1500)"""
text = text.replace(handle_decision_injection, handle_decision_new)


# 5. Fix App Component rendering of RoomCanvas
app_render_roomcanvas_old = """                customModules={[]}
                onCustomModuleDown={() => {}}
                onRemoveCustom={() => {}}"""
app_render_roomcanvas_new = """                customModules={customModules}
                onCustomModuleDown={handleCustomModuleDown}
                onRemoveCustom={id => setCustomModules(m => m.filter(c => c.id !== id))}"""
text = text.replace(app_render_roomcanvas_old, app_render_roomcanvas_new)

# 6. Update RoomCanvas to show annotations
roomcanvas_desk_annotation = """              {isDeskApplied && (
                <text
                  x={dd.w - 6}
                  y={13}
                  textAnchor="end"
                  fontSize={16}
                  fill={deskUnlocked ? T.amber : T.green}
                  fontFamily={FONT}
                >
                  {deskUnlocked ? "⟳" : "✓"}
                </text>
              )}"""
roomcanvas_desk_annotation_new = """              {isDeskApplied && (
                <text
                  x={dd.w - 6}
                  y={13}
                  textAnchor="end"
                  fontSize={16}
                  fill={deskUnlocked ? T.amber : T.green}
                  fontFamily={FONT}
                >
                  {deskUnlocked ? "⟳" : "✓"}
                </text>
              )}
              {isDeskApplied && (
                <text
                  x={dd.w / 2}
                  y={dd.h + 20}
                  textAnchor="middle"
                  fontSize={13}
                  fill="#FFB340"
                  fontFamily={FONT}
                  stroke="#101010"
                  strokeWidth={3}
                  paintOrder="stroke"
                  style={{ pointerEvents: "none" }}
                >
                  书桌上放置办公用物品，靠近插头方便充电
                </text>
              )}"""
text = text.replace(roomcanvas_desk_annotation, roomcanvas_desk_annotation_new)

roomcanvas_custom_annotation = """          </text>
          {c.h > 40 && ("""
roomcanvas_custom_annotation_new = """          </text>
          {c.annotation && (
            <text
              x={c.w / 2}
              y={c.h + 20}
              textAnchor="middle"
              fontSize={13}
              fill="#FFB340"
              fontFamily={FONT}
              stroke="#101010"
              strokeWidth={3}
              paintOrder="stroke"
              style={{ pointerEvents: "none" }}
            >
              {c.annotation}
            </text>
          )}
          {c.h > 40 && ("""
text = text.replace(roomcanvas_custom_annotation, roomcanvas_custom_annotation_new)


with open("src/App.tsx", "w") as f:
    f.write(text)

