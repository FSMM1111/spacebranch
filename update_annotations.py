import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Widen the SVG
text = text.replace('width={RW + PAD * 2}', 'width={RW + PAD * 2 + 280}')

# 2. Remove inline desk annotation
desk_annotation_regex = re.compile(r'\{isDeskApplied && \(\s*<text[^>]*>\s*书桌上放置办公用物品，靠近插头方便充电\s*</text>\s*\)\}', re.DOTALL)
text = desk_annotation_regex.sub('', text)

# 3. Remove inline custom module annotation
custom_annotation_regex = re.compile(r'\{c\.annotation && \(\s*<text[^>]*>\s*\{c\.annotation\}\s*</text>\s*\)\}', re.DOTALL)
text = custom_annotation_regex.sub('', text)

# 4. Add the leader lines and annotations at the end of the SVG (before </svg>)
annotations_block = """
      {/* Side Annotations */}
      {isDeskApplied && deskXY && (() => {
        const dd = getDeskDims(deskXY.x)
        const cx = PAD + deskXY.x + dd.w / 2
        const cy = PAD + deskXY.y + dd.h / 2
        const ax = PAD + RW + 20
        const ay = 100
        return (
          <g style={{ animation: "fade-in 0.4s ease both" }}>
            <path d={`M ${cx} ${cy} C ${cx + 100} ${cy}, ${ax - 100} ${ay}, ${ax} ${ay}`} fill="none" stroke="#FFB340" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.6} style={{ pointerEvents: "none" }} />
            <circle cx={cx} cy={cy} r={4} fill="#FFB340" style={{ pointerEvents: "none" }} />
            <text x={ax} y={ay - 6} fontSize={13} fill="#FFB340" fontFamily={FONT} fontWeight="600" style={{ pointerEvents: "none" }}>办公桌</text>
            <text x={ax} y={ay + 12} fontSize={12} fill={T.text2} fontFamily={FONT} style={{ pointerEvents: "none" }}>放置办公用物品，</text>
            <text x={ax} y={ay + 28} fontSize={12} fill={T.text2} fontFamily={FONT} style={{ pointerEvents: "none" }}>靠近插头方便充电</text>
          </g>
        )
      })()}

      {customModules.map((c, i) => {
        if (!c.annotation) return null
        const cx = PAD + c.x + c.w / 2
        const cy = PAD + c.y + c.h / 2
        const ax = PAD + RW + 20
        const ay = 200 + i * 90
        return (
          <g key={`anno-${c.id}`} style={{ animation: "fade-in 0.4s ease both" }}>
            <path d={`M ${cx} ${cy} C ${cx + 100} ${cy}, ${ax - 100} ${ay}, ${ax} ${ay}`} fill="none" stroke="#FFB340" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.6} style={{ pointerEvents: "none" }} />
            <circle cx={cx} cy={cy} r={4} fill="#FFB340" style={{ pointerEvents: "none" }} />
            <text x={ax} y={ay - 6} fontSize={13} fill="#FFB340" fontFamily={FONT} fontWeight="600" style={{ pointerEvents: "none" }}>{c.name}</text>
            <text x={ax} y={ay + 12} fontSize={12} fill={T.text2} fontFamily={FONT} style={{ pointerEvents: "none" }}>{c.annotation}</text>
          </g>
        )
      })}
"""

svg_close_idx = text.rfind("</svg>")
text = text[:svg_close_idx] + annotations_block + text[svg_close_idx:]

with open("src/App.tsx", "w") as f:
    f.write(text)
