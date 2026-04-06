// Public API — re-export core utilities for programmatic use
export { getBqbData, getCategories } from "./data/fetcher.js";
export { search, getRandomEntries, getEntriesByCategory } from "./search/engine.js";
export type { BqbEntry, BqbData, SearchResult } from "./data/types.js";
