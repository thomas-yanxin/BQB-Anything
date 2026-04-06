import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { BqbData, BqbEntry } from "./types.js";

const DATA_URL =
  "https://raw.githubusercontent.com/zhaoolee/ChineseBQB/master/chinesebqb_github.json";
const CACHE_DIR = join(tmpdir(), "chinese-bqb");
const CACHE_FILE = join(CACHE_DIR, "data.json");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache to avoid repeated disk reads within a session
let memoryCache: { data: BqbEntry[]; fetchedAt: number } | null = null;

async function isCacheValid(): Promise<boolean> {
  if (!existsSync(CACHE_FILE)) return false;
  try {
    const raw = await readFile(CACHE_FILE, "utf-8");
    const cached = JSON.parse(raw) as { fetchedAt: number; data: BqbEntry[] };
    return Date.now() - cached.fetchedAt < CACHE_TTL_MS;
  } catch {
    return false;
  }
}

async function readCache(): Promise<BqbEntry[] | null> {
  try {
    const raw = await readFile(CACHE_FILE, "utf-8");
    const cached = JSON.parse(raw) as { fetchedAt: number; data: BqbEntry[] };
    return cached.data;
  } catch {
    return null;
  }
}

async function writeCache(data: BqbEntry[]): Promise<void> {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true });
  }
  await writeFile(
    CACHE_FILE,
    JSON.stringify({ fetchedAt: Date.now(), data }),
    "utf-8"
  );
}

async function fetchFromGitHub(): Promise<BqbEntry[]> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch BQB data: ${response.statusText}`);
  }
  const json = (await response.json()) as BqbData;
  if (json.status !== 1000) {
    throw new Error(`Unexpected data status: ${json.status}`);
  }
  return json.data;
}

export async function getBqbData(forceRefresh = false): Promise<BqbEntry[]> {
  // 1. Return memory cache if available and not forcing refresh
  if (!forceRefresh && memoryCache) {
    if (Date.now() - memoryCache.fetchedAt < CACHE_TTL_MS) {
      return memoryCache.data;
    }
  }

  // 2. Try disk cache
  if (!forceRefresh && (await isCacheValid())) {
    const cached = await readCache();
    if (cached) {
      memoryCache = { data: cached, fetchedAt: Date.now() };
      return cached;
    }
  }

  // 3. Fetch from GitHub
  const data = await fetchFromGitHub();
  memoryCache = { data, fetchedAt: Date.now() };
  await writeCache(data).catch(() => {
    // Silently ignore cache write failures
  });
  return data;
}

export function getCategories(entries: BqbEntry[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const entry of entries) {
    if (!seen.has(entry.category)) {
      seen.add(entry.category);
      categories.push(entry.category);
    }
  }
  return categories.sort();
}
