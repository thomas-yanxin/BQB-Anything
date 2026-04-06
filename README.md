# Chinese BQB — 表情包 MCP Server & CLI

基于 [ChineseBQB](https://github.com/zhaoolee/ChineseBQB) 的 MCP Server、CLI 工具和 Skill。

## 安装

```bash
npm install
npm run build
```

## CLI 工具

```bash
# 全局安装后使用 bqb 命令
npm install -g .

bqb search "鄙视"              # 搜索关键词
bqb search "猫" --limit 5      # 限制返回数量
bqb random --count 3           # 随机 3 个
bqb list                       # 列出所有分类
bqb download "滑稽" -o ./memes # 下载匹配结果
bqb refresh                    # 刷新缓存
```

## MCP Server

### 在 Claude Desktop 中配置

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "chinese-bqb": {
      "command": "node",
      "args": ["/path/to/BQB-Anything/dist/mcp/server.js"]
    }
  }
}
```

重启 Claude Desktop 后，即可在对话中使用以下工具：

| 工具 | 说明 |
|------|------|
| `search_meme` | 按关键词搜索表情包 |
| `list_categories` | 列出所有分类 |
| `get_memes_by_category` | 获取某分类的表情包 |
| `get_random_meme` | 随机获取表情包 |
| `refresh_data` | 刷新数据缓存 |

### 在 Claude Code 中使用

```bash
npm run start:mcp
```

## Skill

将 `skills/bqb-search.md` 复制到你的 Claude Code 插件目录，即可通过 `/bqb-search` 触发搜索技能。

## 数据来源

- 数据源：https://github.com/zhaoolee/ChineseBQB
- 数据自动缓存到本地，TTL 24 小时
- 5000+ 表情包，100+ 分类
