import re

with open("vite.config.ts", "r") as f:
    text = f.read()

# Add hmr config
server_block_regex = re.compile(r"    server: \{[\s\S]*?\},")
server_block = text[server_block_regex.search(text).start():server_block_regex.search(text).end()]

if "hmr: {" not in server_block:
    new_server_block = server_block.replace(
        "    server: {",
        "    server: {\n      hmr: { port: parseInt(process.env.PORT || '8443'), clientPort: 443 },"
    )
    text = text.replace(server_block, new_server_block)

with open("vite.config.ts", "w") as f:
    f.write(text)
