import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Replace React.useState with useState
text = text.replace("React.useState", "useState")
text = text.replace("React.useEffect", "useEffect")
text = text.replace("React.useCallback", "useCallback")
text = text.replace("React.useMemo", "useMemo")
text = text.replace("React.useRef", "useRef")
text = text.replace("React.MouseEvent", "MouseEvent")
text = text.replace("React.ReactNode", "ReactNode")
text = text.replace("React.RefObject", "RefObject")
text = text.replace("React.CSSProperties", "CSSProperties")

# Add ReactNode, MouseEvent, RefObject, CSSProperties to imports if they aren't there
import_line = 'import { useState, useRef, useEffect, useCallback, useMemo, ReactNode, MouseEvent, RefObject, CSSProperties } from "react"'
text = text.replace('import { useState, useRef, useEffect, useCallback, useMemo } from "react"', import_line)

# Remove 'import React from "react";' if it exists
text = text.replace('import React from "react";\n', '')

with open("src/App.tsx", "w") as f:
    f.write(text)
