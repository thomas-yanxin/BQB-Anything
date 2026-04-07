import type { BqbEntry } from "../data/types.js";
export declare const PREVIEW_RENDERERS: readonly ["auto", "iterm", "kitty", "sixels", "symbols", "open"];
export type PreviewRenderer = (typeof PREVIEW_RENDERERS)[number];
interface PreviewOptions {
    renderer?: PreviewRenderer;
}
export declare function previewEntries(entries: BqbEntry[], options?: PreviewOptions): Promise<"iterm" | "kitty" | "sixels" | "symbols" | "open">;
export {};
