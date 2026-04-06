export interface BqbEntry {
    name: string;
    category: string;
    url: string;
}
export interface BqbData {
    status: number;
    info: string;
    data: BqbEntry[];
}
export interface SearchResult {
    entry: BqbEntry;
    score: number;
}
