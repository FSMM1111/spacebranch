import re

with open("src/App.tsx", "r") as f:
    text = f.read()

old_button_section = """            </div>

            <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "transparent", border: `1px solid ${T.border}`, color: T.text2, cursor: "pointer", width: "100%" }}>"""

new_recommendation_section = """            </div>

            <div style={{ marginTop: 8, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.text3, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: T.blue }}>✦</span> 前沿灵感推荐
              </div>
              
              <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, margin: "0 -4px", paddingLeft: 4, paddingRight: 4 }}>
                <div style={{ flexShrink: 0, width: 180, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSoft}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = T.blue} onMouseLeave={e => e.currentTarget.style.borderColor = T.borderSoft}>
                  <div style={{ height: 100, backgroundColor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🪑</div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>自适应体态升降桌</div>
                    <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.4 }}>内置微雷达捕捉坐姿，自动调节最适高度，有效缓解久坐疲劳。</div>
                  </div>
                </div>
                
                <div style={{ flexShrink: 0, width: 180, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSoft}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = T.blue} onMouseLeave={e => e.currentTarget.style.borderColor = T.borderSoft}>
                  <div style={{ height: 100, backgroundColor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📚</div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>光学隐形亚克力书柜</div>
                    <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.4 }}>采用透光折射技术，视觉隐形效果，令小空间通透感提升30%。</div>
                  </div>
                </div>

                <div style={{ flexShrink: 0, width: 180, backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSoft}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = T.blue} onMouseLeave={e => e.currentTarget.style.borderColor = T.borderSoft}>
                  <div style={{ height: 100, backgroundColor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🔋</div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>磁吸智充推车床头柜</div>
                    <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.4 }}>无线供电结合全向万向轮，睡前读物与设备充电一站式解决。</div>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "transparent", border: `1px solid ${T.border}`, color: T.text2, cursor: "pointer", width: "100%", transition: "all 0.2s", fontFamily: FONT }} onMouseEnter={e => {e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = T.text}} onMouseLeave={e => {e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text2}}>"""

text = text.replace(old_button_section, new_recommendation_section)

# ensure we don't accidentally hide the scrollbar thumb completely but keeping it clean
# actually Tailwind/Vite default resets are fine. 

with open("src/App.tsx", "w") as f:
    f.write(text)

