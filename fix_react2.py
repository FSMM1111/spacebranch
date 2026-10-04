import re

with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace('import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"', 'import { useState, useRef, useEffect, useCallback, useMemo } from "react"')

with open("src/App.tsx", "w") as f:
    f.write(text)
