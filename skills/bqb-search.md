---
name: bqb-search
description: Search Chinese memes (BQB/表情包) from ChineseBQB. Use when user asks to find, search, or suggest Chinese memes/emoticons.
---

# BQB 表情包搜索技能

## 触发时机

当用户说以下类型的话时使用此技能：
- "帮我找一个表情包"
- "搜索表情包：[关键词]"
- "我需要一个 [情绪/场景] 的表情包"
- "随机给我一个表情包"

## 使用方式

### 通过 MCP Server（推荐，需先配置）

如果已配置 `chinese-bqb` MCP Server，直接调用工具：

```
search_meme(query="关键词")
get_random_meme(count=3)
list_categories()
```

### 通过 CLI 工具

```bash
# 搜索
bqb search "鄙视"
bqb search "开心 猫" --limit 5

# 随机
bqb random --count 3

# 查看分类
bqb list

# 下载
bqb download "滑稽" --output ./memes
```

### 直接使用数据 API

数据源 URL（可直接 fetch）：
```
https://raw.githubusercontent.com/zhaoolee/ChineseBQB/master/chinesebqb_github.json
```

每条记录格式：
```json
{ "name": "滑稽大佬00001-360度鄙视你.gif", "category": "001Funny_滑稽大佬😏BQB", "url": "https://..." }
```

## 返回结果处理

搜索结果包含 `url` 字段——直接把 URL 展示给用户即可，现代终端和聊天工具都支持点击预览。

如果用户在网页/聊天界面，可以用 Markdown 图片语法展示：
```markdown
![表情包名称](url)
```
