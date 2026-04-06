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
  score: number; // relevance score: 2 = name match, 1 = category match
}
