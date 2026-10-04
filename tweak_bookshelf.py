import re

with open("src/App.tsx", "r") as f:
    text = f.read()

# Fix bookshelf position to be truly touching bottom right walls
old_str = 'x: 500, y: 490, w: 90, h: 40, annotation: "书柜贴墙，与办公区分开"'
new_str = 'x: 570, y: 500, w: 90, h: 40, annotation: "书柜贴墙，与办公区分开"'
text = text.replace(old_str, new_str)

with open("src/App.tsx", "w") as f:
    f.write(text)
