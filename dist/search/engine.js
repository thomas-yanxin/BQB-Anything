/**
 * Score a single entry against a list of keywords.
 * Strategy A (weighted): name match = 2pts, category match = 1pt per keyword.
 * Higher score = more relevant.
 */
function scoreEntry(entry, keywords) {
    const nameLower = entry.name.toLowerCase();
    const categoryLower = entry.category.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
        const k = kw.toLowerCase();
        if (nameLower.includes(k))
            score += 2;
        if (categoryLower.includes(k))
            score += 1;
    }
    return score;
}
export function search(entries, query, options = {}) {
    const { limit = 20, category } = options;
    // Split query into individual keywords (support spaces and commas)
    const keywords = query
        .split(/[\s,，]+/)
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
    if (keywords.length === 0)
        return [];
    let pool = entries;
    // Optional pre-filter by category
    if (category) {
        const catLower = category.toLowerCase();
        pool = pool.filter((e) => e.category.toLowerCase().includes(catLower));
    }
    const results = pool
        .map((entry) => ({ entry, score: scoreEntry(entry, keywords) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    return results;
}
export function getRandomEntries(entries, count = 1) {
    if (entries.length === 0)
        return [];
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, entries.length));
}
export function getEntriesByCategory(entries, category, limit = 20) {
    const catLower = category.toLowerCase();
    return entries
        .filter((e) => e.category.toLowerCase().includes(catLower))
        .slice(0, limit);
}
//# sourceMappingURL=engine.js.map