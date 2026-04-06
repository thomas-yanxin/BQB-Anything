/**
 * Vocabulary bridge: maps emotion/situation labels to BQB search keywords.
 * The LLM (Claude) identifies which emotion applies; this file maps it to
 * concrete search terms for the BQB dataset.
 */
export const EMOTION_KEYWORDS: Record<string, string[]> = {
  "开心/高兴":   ["开心", "哈哈", "笑", "快乐", "开森"],
  "无奈/叹气":   ["无奈", "叹气", "苦笑", "哎", "摊手"],
  "鄙视/嘲讽":   ["鄙视", "滑稽", "嘲讽", "不屑", "冷笑"],
  "生气/愤怒":   ["生气", "愤怒", "怒", "火大"],
  "难过/伤心":   ["哭", "难过", "伤心", "泪", "心碎"],
  "赞赏/佩服":   ["厉害", "赞", "666", "牛", "膜拜"],
  "困惑/疑惑":   ["疑惑", "问号", "不懂", "懵", "黑人问号"],
  "加油/鼓励":   ["加油", "奥利给", "冲", "努力", "棒棒"],
  "撒娇/求人":   ["求", "撒娇", "拜托", "嘤嘤"],
  "尴尬/无语":   ["尴尬", "无语", "干笑", "社死"],
  "得意/炫耀":   ["得意", "嘿嘿", "赢了", "厉害"],
  "困/累/摸鱼":  ["困", "累", "摸鱼", "躺平", "睡觉"],
  "惊讶/震惊":   ["震惊", "惊讶", "卧槽", "离谱"],
  "支持/赞同":   ["赞同", "支持", "点头", "对对对"],
};

/** All known emotion labels, for Claude's reference in tool descriptions */
export const EMOTION_LABELS = Object.keys(EMOTION_KEYWORDS);

/** Given an emotion label (or free text), return search keywords */
export function emotionToKeywords(emotion: string): string[] {
  // Exact match first
  if (EMOTION_KEYWORDS[emotion]) return EMOTION_KEYWORDS[emotion];

  // Partial match: find any label that contains the query or vice versa
  for (const [label, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (label.includes(emotion) || emotion.includes(label.split("/")[0])) {
      return keywords;
    }
  }

  // Fallback: treat the emotion string itself as a search keyword
  return [emotion];
}
