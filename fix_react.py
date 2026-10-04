import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Make sure OnboardScreen and CalibrationScreen have React in scope if they don't
text = text.replace('import { useState, useRef, useEffect, useCallback, useMemo } from "react"', 'import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"')

with open("src/App.tsx", "w") as f:
    f.write(text)
