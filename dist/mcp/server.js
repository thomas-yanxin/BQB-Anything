#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { getBqbData, getCategories } from "../data/fetcher.js";
import { search, getRandomEntries, getEntriesByCategory, } from "../search/engine.js";
const server = new Server({ name: "chinese-bqb", version: "1.0.0" }, { capabilities: { tools: {} } });
// ── Tool definitions ──────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "search_meme",
            description: "搜索中文表情包（BQB）。根据关键词在表情包名称和分类中进行匹配，返回最相关的结果。",
            inputSchema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "搜索关键词，支持中文，多个关键词用空格或逗号分隔。例如：'鄙视 滑稽' 或 '开心'",
                    },
                    limit: {
                        type: "number",
                        description: "返回结果数量上限，默认 10，最大 50",
                        default: 10,
                    },
                    category: {
                        type: "string",
                        description: "可选：限定在某个分类中搜索，例如 '猫和老鼠' 或 'Funny'",
                    },
                },
                required: ["query"],
            },
        },
        {
            name: "list_categories",
            description: "列出所有可用的表情包分类",
            inputSchema: {
                type: "object",
                properties: {},
            },
        },
        {
            name: "get_memes_by_category",
            description: "获取指定分类下的表情包列表",
            inputSchema: {
                type: "object",
                properties: {
                    category: {
                        type: "string",
                        description: "分类名称或关键词，例如 '猫和老鼠'",
                    },
                    limit: {
                        type: "number",
                        description: "返回数量上限，默认 20",
                        default: 20,
                    },
                },
                required: ["category"],
            },
        },
        {
            name: "get_random_meme",
            description: "随机获取一个或多个表情包",
            inputSchema: {
                type: "object",
                properties: {
                    count: {
                        type: "number",
                        description: "随机获取的数量，默认 1",
                        default: 1,
                    },
                    category: {
                        type: "string",
                        description: "可选：限定分类范围",
                    },
                },
            },
        },
        {
            name: "refresh_data",
            description: "强制刷新本地缓存，从 GitHub 重新拉取最新表情包数据",
            inputSchema: {
                type: "object",
                properties: {},
            },
        },
    ],
}));
// ── Tool handlers ─────────────────────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (name === "search_meme") {
            const { query, limit = 10, category } = args;
            const entries = await getBqbData();
            const results = search(entries, query, {
                limit: Math.min(limit, 50),
                category,
            });
            if (results.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `没有找到与 "${query}" 相关的表情包。建议尝试其他关键词，或使用 list_categories 查看可用分类。`,
                        },
                    ],
                };
            }
            const lines = results.map((r, i) => `${i + 1}. [${r.entry.name}]\n   分类: ${r.entry.category}\n   URL: ${r.entry.url}\n   相关度: ${r.score}`);
            return {
                content: [
                    {
                        type: "text",
                        text: `找到 ${results.length} 个与 "${query}" 相关的表情包：\n\n${lines.join("\n\n")}`,
                    },
                ],
            };
        }
        if (name === "list_categories") {
            const entries = await getBqbData();
            const categories = getCategories(entries);
            return {
                content: [
                    {
                        type: "text",
                        text: `共有 ${categories.length} 个表情包分类：\n\n${categories.join("\n")}`,
                    },
                ],
            };
        }
        if (name === "get_memes_by_category") {
            const { category, limit = 20 } = args;
            const entries = await getBqbData();
            const results = getEntriesByCategory(entries, category, limit);
            if (results.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `未找到分类 "${category}"，请用 list_categories 查看所有可用分类。`,
                        },
                    ],
                };
            }
            const lines = results.map((e, i) => `${i + 1}. ${e.name}\n   URL: ${e.url}`);
            return {
                content: [
                    {
                        type: "text",
                        text: `分类 "${category}" 下共找到 ${results.length} 个表情包（显示前 ${limit} 个）：\n\n${lines.join("\n\n")}`,
                    },
                ],
            };
        }
        if (name === "get_random_meme") {
            const { count = 1, category } = args;
            let entries = await getBqbData();
            if (category) {
                entries = getEntriesByCategory(entries, category, 9999);
            }
            const results = getRandomEntries(entries, count);
            if (results.length === 0) {
                return {
                    content: [{ type: "text", text: "暂无表情包数据。" }],
                };
            }
            const lines = results.map((e, i) => `${i + 1}. ${e.name}\n   分类: ${e.category}\n   URL: ${e.url}`);
            return {
                content: [
                    {
                        type: "text",
                        text: `随机表情包 ${results.length} 个：\n\n${lines.join("\n\n")}`,
                    },
                ],
            };
        }
        if (name === "refresh_data") {
            await getBqbData(true);
            return {
                content: [{ type: "text", text: "数据缓存已刷新。" }],
            };
        }
        return {
            content: [{ type: "text", text: `未知工具: ${name}` }],
            isError: true,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `错误: ${message}` }],
            isError: true,
        };
    }
});
// ── Start server ──────────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // MCP servers communicate via stdio; do NOT write to stdout
    process.stderr.write("Chinese BQB MCP Server started\n");
}
main().catch((err) => {
    process.stderr.write(`Fatal error: ${err}\n`);
    process.exit(1);
});
//# sourceMappingURL=server.js.map