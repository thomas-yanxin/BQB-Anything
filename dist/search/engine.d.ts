import type { BqbEntry, SearchResult } from "../data/types.js";
export interface SearchOptions {
    limit?: number;
    category?: string;
}
export declare function search(entries: BqbEntry[], query: string, options?: SearchOptions): SearchResult[];
export declare function getRandomEntries(entries: BqbEntry[], count?: number): BqbEntry[];
export declare function getEntriesByCategory(entries: BqbEntry[], category: string, limit?: number): BqbEntry[];
