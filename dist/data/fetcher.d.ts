import type { BqbEntry } from "./types.js";
export declare function getBqbData(forceRefresh?: boolean): Promise<BqbEntry[]>;
export declare function getCategories(entries: BqbEntry[]): string[];
