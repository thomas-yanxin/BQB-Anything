# Chinese BQB — 表情包 MCP Server & CLI

> 基于 [ChineseBQB](https://github.com/zhaoolee/ChineseBQB) 的 MCP Server、CLI 工具和 Claude Code Skill。
> 5799 个表情包，108 个分类，支持关键词搜索和对话情绪推荐。

## 安装

```bash
git clone <this-repo>
cd BQB-Anything
npm install
npm run build
```

全局安装 CLI：

```bash
npm install -g .
```

---

## CLI 工具 (`bqb`)

### 搜索

```bash
bqb search "鄙视"
bqb search "猫 开心" --limit 5
bqb s "无奈" -c "同福客栈"   # 限定分类
```

### 情绪推荐

根据情绪或场景推荐合适的表情包，结果来自不同分类保证多样性：

```bash
bqb recommend "开心/高兴"
bqb recommend "难过/伤心" --count 5
bqb rec "惊讶/震惊" -s "朋友说要去火星旅行"   # 补充场景描述
```

可用情绪标签：`开心/高兴`、`无奈/叹气`、`鄙视/嘲讽`、`生气/愤怒`、`难过/伤心`、`赞赏/佩服`、`困惑/疑惑`、`加油/鼓励`、`撒娇/求人`、`尴尬/无语`、`得意/炫耀`、`困/累/摸鱼`、`惊讶/震惊`、`支持/赞同`

### 其他命令

```bash
bqb random --count 3            # 随机获取
bqb random -c "猫和老鼠"        # 指定分类随机
bqb list                        # 列出所有分类
bqb download "滑稽" -o ./memes  # 下载匹配的表情包
bqb refresh                     # 刷新数据缓存
```

---

## MCP Server

### 配置 Claude Desktop

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

重启 Claude Desktop 后生效。

### 可用工具

| 工具 | 说明 |
|------|------|
| `recommend_meme` | **主动推荐**：Claude 分析对话情绪后调用，返回风格多样的表情包 |
| `search_meme` | 关键词搜索，支持中文、多词、分类过滤 |
| `list_categories` | 列出全部 108 个分类 |
| `get_memes_by_category` | 获取指定分类的表情包列表 |
| `get_random_meme` | 随机获取，可限定分类 |
| `refresh_data` | 强制刷新本地缓存 |

### 推荐工作流

```
用户发言
  └→ Claude 判断情绪/场景
       └→ 调用 recommend_meme(emotion="开心/高兴", situation="用户通过了面试")
            └→ 返回来自不同分类的 3 个表情包供 Claude 选用
```

`recommend_meme` 的 tool description 中已内置触发条件示例，Claude 会在合适时机**自动**调用，无需用户手动触发。

---

## Claude Code Skill

将 `skills/bqb-search.md` 复制到你的 Claude Code 插件目录，可通过 `/bqb-search` 在对话中触发表情包搜索。

---

## 数据说明

- 数据源：[ChineseBQB](https://github.com/zhaoolee/ChineseBQB)（5799 个表情包）
- 首次使用时从 GitHub 拉取，自动缓存到本地（`/tmp/chinese-bqb/data.json`）
- 缓存有效期 24 小时，过期后自动刷新
- 每条数据包含：文件名、分类、图片直链 URL
