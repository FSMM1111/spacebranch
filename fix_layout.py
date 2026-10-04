import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# 1. Update the layout positions in the handleUserDecision function
old_modules = """      setCustomModules([
        { id: "bookshelf", name: "书柜", x: 270, y: 350, w: 90, h: 40, annotation: "书柜与办公区分开" },
        { id: "nightstand", name: "床头柜", x: 330, y: 100, w: 50, h: 40, annotation: "放置睡前读物与手机" },
        { id: "baskets", name: "衣柜顶置物筐", x: 10, y: 10, w: 140, h: 50, annotation: "置物筐收纳不常用的过季衣物" }
      ])"""

new_modules = """      setCustomModules([
        { id: "bookshelf", name: "书柜", x: 500, y: 490, w: 90, h: 40, annotation: "书柜贴墙，与办公区分开" },
        { id: "nightstand", name: "床头柜", x: 335, y: 10, w: 45, h: 40, annotation: "放置睡前读物与手机" },
        { id: "baskets", name: "置物筐", x: 10, y: 10, w: 140, h: 50, annotation: "收纳不常用的过季衣物" }
      ])"""
text = text.replace(old_modules, new_modules)

with open("src/App.tsx", "w") as f:
    f.write(text)
