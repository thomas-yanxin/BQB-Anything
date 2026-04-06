#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { createWriteStream, existsSync } from "fs";
import { mkdir } from "fs/promises";
import { join, extname } from "path";
import { getBqbData, getCategories } from "../data/fetcher.js";
import {
  search,
  getRandomEntries,
  getEntriesByCategory,
} from "../search/engine.js";
import { emotionToKeywords, EMOTION_LABELS } from "../search/emotions.js";
import type { BqbEntry } from "../data/types.js";

const program = new Command();

program
  .name("bqb")
  .description("中文表情包 (BQB) 搜索工具 — 基于 ChineseBQB 开源项目")
  .version("1.0.0");

// ── Helpers ───────────────────────────────────────────────────────────────────

function printEntry(entry: BqbEntry, index?: number) {
  const prefix = index !== undefined ? chalk.gray(`${index + 1}.`) : "•";
  console.log(`${prefix} ${chalk.bold(entry.name)}`);
  console.log(`   ${chalk.dim("分类:")} ${chalk.cyan(entry.category)}`);
  console.log(`   ${chalk.dim("URL: ")} ${chalk.underline.blue(entry.url)}`);
}

async function loadData(forceRefresh = false) {
  const spinner = ora("正在加载表情包数据...").start();
  try {
    const data = await getBqbData(forceRefresh);
    spinner.succeed(chalk.green(`已加载 ${data.length} 个表情包`));
    return data;
  } catch (err) {
    spinner.fail(chalk.red("数据加载失败"));
    throw err;
  }
}

// ── Commands ──────────────────────────────────────────────────────────────────

program
  .command("search <query>")
  .alias("s")
  .description("按关键词搜索表情包（支持中文，多词用空格分隔）")
  .option("-n, --limit <number>", "返回数量上限", "10")
  .option("-c, --category <name>", "限定搜索分类")
  .action(async (query: string, opts: { limit: string; category?: string }) => {
    try {
      const entries = await loadData();
      const results = search(entries, query, {
        limit: parseInt(opts.limit, 10),
        category: opts.category,
      });

      if (results.length === 0) {
        console.log(chalk.yellow(`\n没有找到与 "${query}" 相关的表情包`));
        console.log(chalk.dim('提示：尝试 bqb list 查看所有分类'));
        return;
      }

      console.log(
        chalk.green(`\n找到 ${results.length} 个与 "${query}" 相关的表情包：\n`)
      );
      results.forEach((r, i) => {
        printEntry(r.entry, i);
        console.log();
      });
    } catch (err) {
      console.error(chalk.red("搜索失败:"), err);
      process.exit(1);
    }
  });

program
  .command("list")
  .alias("l")
  .description("列出所有表情包分类")
  .action(async () => {
    try {
      const entries = await loadData();
      const categories = getCategories(entries);
      console.log(chalk.green(`\n共 ${categories.length} 个分类：\n`));
      categories.forEach((c, i) => {
        console.log(`  ${chalk.gray(`${i + 1}.`)} ${c}`);
      });
    } catch (err) {
      console.error(chalk.red("获取分类失败:"), err);
      process.exit(1);
    }
  });

program
  .command("random")
  .alias("r")
  .description("随机获取表情包")
  .option("-n, --count <number>", "随机数量", "1")
  .option("-c, --category <name>", "限定分类范围")
  .action(async (opts: { count: string; category?: string }) => {
    try {
      let entries = await loadData();
      if (opts.category) {
        entries = getEntriesByCategory(entries, opts.category, 9999);
        if (entries.length === 0) {
          console.log(chalk.yellow(`未找到分类 "${opts.category}"`));
          return;
        }
      }
      const results = getRandomEntries(entries, parseInt(opts.count, 10));
      console.log(chalk.green(`\n随机表情包 ${results.length} 个：\n`));
      results.forEach((e, i) => {
        printEntry(e, i);
        console.log();
      });
    } catch (err) {
      console.error(chalk.red("获取失败:"), err);
      process.exit(1);
    }
  });

program
  .command("download <query>")
  .alias("d")
  .description("搜索并下载匹配的表情包图片到本地目录")
  .option("-n, --limit <number>", "下载数量上限", "5")
  .option("-o, --output <dir>", "输出目录", "./bqb-downloads")
  .option("-c, --category <name>", "限定搜索分类")
  .action(
    async (
      query: string,
      opts: { limit: string; output: string; category?: string }
    ) => {
      try {
        const entries = await loadData();
        const results = search(entries, query, {
          limit: parseInt(opts.limit, 10),
          category: opts.category,
        });

        if (results.length === 0) {
          console.log(chalk.yellow(`没有找到与 "${query}" 相关的表情包`));
          return;
        }

        const outDir = opts.output;
        if (!existsSync(outDir)) {
          await mkdir(outDir, { recursive: true });
        }

        console.log(
          chalk.green(`\n开始下载 ${results.length} 个表情包到 ${outDir}/\n`)
        );

        for (let i = 0; i < results.length; i++) {
          const { entry } = results[i];
          const ext = extname(entry.name) || ".gif";
          // Sanitize filename: replace characters invalid on most filesystems
          const safeName = entry.name.replace(/[/\\:*?"<>|]/g, "_");
          const destPath = join(outDir, safeName);

          const spinner = ora(`下载 ${entry.name}`).start();
          try {
            const res = await fetch(entry.url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const dest = createWriteStream(destPath);
            // Node.js 18+ fetch returns a Web API Response; use arrayBuffer
            const buffer = await res.arrayBuffer();
            dest.write(Buffer.from(buffer));
            dest.end();
            spinner.succeed(chalk.green(`✓ ${safeName}`));
          } catch (dlErr) {
            spinner.fail(chalk.red(`✗ ${entry.name}: ${dlErr}`));
          }
        }

        console.log(chalk.bold.green(`\n完成！文件已保存至 ${outDir}`));
      } catch (err) {
        console.error(chalk.red("下载失败:"), err);
        process.exit(1);
      }
    }
  );

program
  .command("recommend <emotion>")
  .alias("rec")
  .description(`根据情绪/场景推荐表情包。可用标签：${EMOTION_LABELS.slice(0, 5).join("、")} 等，或自由描述`)
  .option("-n, --count <number>", "推荐数量", "3")
  .option("-s, --situation <text>", "补充说明对话场景")
  .action(async (emotion: string, opts: { count: string; situation?: string }) => {
    try {
      const entries = await loadData();

      const emotionKws = emotionToKeywords(emotion);
      const situationKws = opts.situation
        ? opts.situation.split(/[\s，,。！!？?、]+/).filter((w) => w.length >= 2).slice(0, 4)
        : [];
      const allKeywords = [...new Set([...emotionKws, ...situationKws])];

      const count = parseInt(opts.count, 10);
      const results = search(entries, allKeywords.join(" "), { limit: count * 3 });

      if (results.length === 0) {
        console.log(chalk.yellow(`未找到与 "${emotion}" 匹配的表情包，试试 bqb search`));
        return;
      }

      // Diverse pick: one per category first
      const picked: BqbEntry[] = [];
      const usedCats = new Set<string>();
      for (const r of results) {
        if (picked.length >= count) break;
        if (!usedCats.has(r.entry.category)) {
          picked.push(r.entry);
          usedCats.add(r.entry.category);
        }
      }
      for (const r of results) {
        if (picked.length >= count) break;
        if (!picked.includes(r.entry)) picked.push(r.entry);
      }

      console.log(chalk.green(`\n为"${emotion}"推荐 ${picked.length} 个表情包：\n`));
      picked.forEach((e, i) => {
        printEntry(e, i);
        console.log();
      });
    } catch (err) {
      console.error(chalk.red("推荐失败:"), err);
      process.exit(1);
    }
  });

program
  .command("refresh")
  .description("强制刷新本地缓存，从 GitHub 重新拉取数据")
  .action(async () => {
    try {
      await loadData(true);
    } catch (err) {
      console.error(chalk.red("刷新失败:"), err);
      process.exit(1);
    }
  });

program.parse(process.argv);
