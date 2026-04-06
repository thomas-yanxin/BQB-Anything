/**
 * Vocabulary bridge: maps emotion/situation labels to BQB search keywords.
 * The LLM (Claude) identifies which emotion applies; this file maps it to
 * concrete search terms for the BQB dataset.
 */
export declare const EMOTION_KEYWORDS: Record<string, string[]>;
/** All known emotion labels, for Claude's reference in tool descriptions */
export declare const EMOTION_LABELS: string[];
/** Given an emotion label (or free text), return search keywords */
export declare function emotionToKeywords(emotion: string): string[];
