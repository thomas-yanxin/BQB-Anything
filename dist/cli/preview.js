import { spawn } from "child_process";
import { constants } from "fs";
import { access, mkdir, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { extname, join } from "path";
export const PREVIEW_RENDERERS = [
    "auto",
    "iterm",
    "kitty",
    "sixels",
    "symbols",
    "open",
];
function sanitizeFileName(fileName) {
    return fileName.replace(/[/\\:*?"<>|]/g, "_");
}
async function commandExists(command) {
    const pathValue = process.env.PATH ?? "";
    for (const dir of pathValue.split(":")) {
        if (!dir)
            continue;
        try {
            await access(join(dir, command), constants.X_OK);
            return true;
        }
        catch {
            // Keep searching.
        }
    }
    return false;
}
function detectRenderer() {
    const term = process.env.TERM ?? "";
    const termProgram = process.env.TERM_PROGRAM ?? "";
    if (process.env.ITERM_SESSION_ID || termProgram === "iTerm.app") {
        return "iterm";
    }
    if (process.env.KITTY_WINDOW_ID ||
        process.env.WEZTERM_PANE ||
        process.env.GHOSTTY_RESOURCES_DIR ||
        term.includes("kitty") ||
        termProgram === "ghostty") {
        return "kitty";
    }
    return "symbols";
}
async function ensurePreviewFile(entry) {
    const previewDir = join(tmpdir(), "chinese-bqb", "previews");
    await mkdir(previewDir, { recursive: true });
    const urlExt = (() => {
        try {
            return extname(new URL(entry.url).pathname);
        }
        catch {
            return "";
        }
    })();
    const fileExt = extname(entry.name) || urlExt || ".img";
    const baseName = sanitizeFileName(entry.name) || "preview";
    const finalName = baseName.endsWith(fileExt) ? baseName : `${baseName}${fileExt}`;
    const filePath = join(previewDir, finalName);
    const res = await fetch(entry.url);
    if (!res.ok) {
        throw new Error(`下载预览图失败: HTTP ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(filePath, buffer);
    return filePath;
}
function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: "inherit",
        });
        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${command} exited with code ${code ?? "unknown"}`));
        });
    });
}
function getChafaArgs(filePath, renderer) {
    const width = Math.max(40, Math.min(process.stdout.columns ?? 80, 120));
    const height = Math.max(18, Math.min((process.stdout.rows ?? 40) - 6, 40));
    return [
        `--format=${renderer}`,
        "--animate=off",
        "--margin-bottom=0",
        `--size=${width}x${height}`,
        filePath,
    ];
}
export async function previewEntries(entries, options = {}) {
    if (entries.length === 0)
        return "symbols";
    const requestedRenderer = options.renderer ?? "auto";
    const renderer = requestedRenderer === "auto" ? detectRenderer() : requestedRenderer;
    if (renderer === "open") {
        if (!(await commandExists("open"))) {
            throw new Error("未找到 open 命令，无法打开系统图片预览。");
        }
    }
    else if (!(await commandExists("chafa"))) {
        throw new Error("未找到 chafa。请先安装 chafa，或使用 --renderer open 走系统图片预览。");
    }
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const filePath = await ensurePreviewFile(entry);
        if (i > 0) {
            process.stdout.write("\n");
        }
        if (renderer === "open") {
            await runCommand("open", [filePath]);
            continue;
        }
        await runCommand("chafa", getChafaArgs(filePath, renderer));
    }
    return renderer;
}
//# sourceMappingURL=preview.js.map