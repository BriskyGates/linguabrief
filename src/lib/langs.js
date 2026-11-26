// src/lib/langs.js — 16 supported languages + bilingual mode configuration

export const SUPPORTED_LANGS = {
  'zh-CN': {
    flag: '🇨🇳',
    label: '简体中文',
    llmName: 'Simplified Chinese (简体中文)',
    jumpText: '↗原楼层',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">由 @${bot} 自动提炼</a>`,
    titleSuffix: '今日精华晚报',
    subHeader: (n) => `已自动过滤水贴，从 ${n} 条发言中浓缩以下高价值情报：`,
    secHot: '今日干货与实测共识',
    secDebate: '观点交锋',
    secOpen: '遗珠悬赏（待解答真问题）',
  },
  'bi': {
    flag: '🌍',
    label: '中英双语',
    llmName: 'concise Bilingual Simplified Chinese + English (中英双语对照，每条要点先写中文再换行附简练英文)',
    jumpText: '↗原文/Src',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">Curated by @${bot}</a>`,
    titleSuffix: 'Daily Bilingual Brief · 双语晚报',
    subHeader: (n) => `Filtered noise from ${n} messages · 已从 ${n} 条多语种发言中提纯：`,
    secHot: 'Key Takeaways · 今日干货共识',
    secDebate: 'Perspectives · 观点交锋',
    secOpen: 'Open Questions · 待解之问',
  },
  'en': {
    flag: '🇺🇸',
    label: 'English',
    llmName: 'idiomatic English',
    jumpText: '↗Source',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">Curated by @${bot}</a>`,
    titleSuffix: 'Daily Digest',
    subHeader: (n) => `Noise filtered — distilled from ${n} messages today:`,
    secHot: 'Key Takeaways & Consensus',
    secDebate: 'Point & Counterpoint',
    secOpen: 'Unanswered Questions',
  },
  'ru': {
    flag: '🇷🇺',
    label: 'Русский',
    llmName: 'natural Russian (Русский язык)',
    jumpText: '↗Источник',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">Сводка от @${bot}</a>`,
    titleSuffix: 'Главное за день',
    subHeader: (n) => `Без флуда и рекламы — выжимка из ${n} сообщений:`,
    secHot: 'Практика и главные выводы',
    secDebate: 'Разные мнения',
    secOpen: 'Вопросы без ответа',
  },
  'es': {
    flag: '🇪🇸',
    label: 'Español',
    llmName: 'natural Spanish (Español)',
    jumpText: '↗Mensaje',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">Resumen por @${bot}</a>`,
    titleSuffix: 'Resumen del Día',
    subHeader: (n) => `Sin spam — lo más valioso de ${n} mensajes de hoy:`,
    secHot: 'Aportes Clave y Consenso',
    secDebate: 'Debates y Posturas',
    secOpen: 'Preguntas Abiertas',
  },
  'pt': {
    flag: '🇵🇹',
    label: 'Português',
    llmName: 'natural Brazilian/European Portuguese (Português)',
    jumpText: '↗Origem',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">Resumo por @${bot}</a>`,
    titleSuffix: 'Resumo do Dia',
    subHeader: (n) => `Sem spam — destaques extraídos de ${n} mensagens:`,
    secHot: 'Destaques e Consenso',
    secDebate: 'Diferentes Visões',
    secOpen: 'Perguntas em Aberto',
  },
  'ja': {
    flag: '🇯🇵',
    label: '日本語',
    llmName: 'natural Japanese (日本語)',
    jumpText: '↗元の投稿',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">@${bot} が自動要約</a>`,
    titleSuffix: '本日のハイライト',
    subHeader: (n) => `ノイズを除去し、本日の ${n} 件の発言から重要情報を厳選：`,
    secHot: '本日の知見・コンセンサス',
    secDebate: '議論のポイント',
    secOpen: '未解決の質問',
  },
  'ko': {
    flag: '🇰🇷',
    label: '한국어',
    llmName: 'natural Korean (한국어)',
    jumpText: '↗원문보기',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">@${bot} 자동 요약</a>`,
    titleSuffix: '오늘의 핵심 브리핑',
    subHeader: (n) => `스팸 제거 완료 — 오늘 올라온 ${n}개의 대화 중 핵심 요약:`,
    secHot: '핵심 인사이트 및 실전 팁',
    secDebate: '주요 의견 대립',
    secOpen: '답변 대기 중인 질문',
  },
  'ar': {
    flag: '🇸🇦',
    label: 'العربية',
    llmName: 'natural Modern Standard Arabic (العربية)',
    jumpText: '↗المصدر',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">ملخص بواسطة @${bot}</a>`,
    titleSuffix: 'ملخص اليوم',
    subHeader: (n) => `تمت تصفية الرسائل المزعجة واستخلاص أهم النقاط من ${n} رسالة:`,
    secHot: 'أهم الخبرات والخلاصات',
    secDebate: 'وجهات النظر المختلفة',
    secOpen: 'أسئلة تنتظر الإجابة',
  },
  'vi': {
    flag: '🇻🇳',
    label: 'Tiếng Việt',
    llmName: 'natural Vietnamese (Tiếng Việt)',
    jumpText: '↗Tin gốc',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">Tóm tắt bởi @${bot}</a>`,
    titleSuffix: 'Bản Tin Tinh Hoa Cuối Ngày',
    subHeader: (n) => `Đã lọc tin rác — chắt lọc từ ${n} tin nhắn hôm nay:`,
    secHot: 'Kinh Nghiệm & Điểm Chính',
    secDebate: 'Góc Nhìn Tranh Luận',
    secOpen: 'Câu Hỏi Chưa Có Lời Giải',
  },
  'id': {
    flag: '🇮🇩',
    label: 'Indonesia',
    llmName: 'natural Indonesian (Bahasa Indonesia)',
    jumpText: '↗Pesan Asli',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">Dirangkum oleh @${bot}</a>`,
    titleSuffix: 'Ringkasan Hari Ini',
    subHeader: (n) => `Bebas spam — intisari dari ${n} pesan hari ini:`,
    secHot: 'Poin Utama & Pengalaman',
    secDebate: 'Perbandingan Sudut Pandang',
    secOpen: 'Pertanyaan Belum Terjawab',
  },
  'th': {
    flag: '🇹🇭',
    label: 'ภาษาไทย',
    llmName: 'natural Thai (ภาษาไทย)',
    jumpText: '↗ข้อความต้นฉบับ',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">สรุปโดย @${bot}</a>`,
    titleSuffix: 'สรุปประเด็นสำคัญวันนี้',
    subHeader: (n) => `คัดกรองสแปมแล้ว — สรุปจาก ${n} ข้อความในกลุ่ม:`,
    secHot: 'ประเด็นสำคัญและประสบการณ์จริง',
    secDebate: 'มุมมองที่หลากหลาย',
    secOpen: 'คำถามที่รอคำตอบ',
  },
  'tr': {
    flag: '🇹🇷',
    label: 'Türkçe',
    llmName: 'natural Turkish (Türkçe)',
    jumpText: '↗Kaynak',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">@${bot} tarafından özetlendi</a>`,
    titleSuffix: 'Günün Özeti',
    subHeader: (n) => `Spam temizlendi — bugünkü ${n} mesajdan öne çıkanlar:`,
    secHot: 'Öne Çıkan Deneyimler',
    secDebate: 'Farklı Görüşler',
    secOpen: 'Yanıt Bekleyen Sorular',
  },
  'de': {
    flag: '🇩🇪',
    label: 'Deutsch',
    llmName: 'natural German (Deutsch)',
    jumpText: '↗Quelle',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">Zusammengefasst von @${bot}</a>`,
    titleSuffix: 'Tageszusammenfassung',
    subHeader: (n) => `Spam gefiltert — die wichtigsten Punkte aus ${n} Nachrichten:`,
    secHot: 'Wichtigste Erkenntnisse',
    secDebate: 'Meinungsverschiedenheiten',
    secOpen: 'Offene Fragen',
  },
  'fr': {
    flag: '🇫🇷',
    label: 'Français',
    llmName: 'natural French (Français)',
    jumpText: '↗Source',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">Résumé par @${bot}</a>`,
    titleSuffix: 'Résumé du Jour',
    subHeader: (n) => `Sans spam — l'essentiel extrait de ${n} messages :`,
    secHot: 'Points Clés & Retours',
    secDebate: 'Débats & Points de Vue',
    secOpen: 'Questions en Suspens',
  },
  'zh-TW': {
    flag: '🇭🇰',
    label: '繁體中文',
    llmName: 'Traditional Chinese (繁體中文)',
    jumpText: '↗原樓層',
    tail: (bot) => `⚡️ <a href="https://t.me/${bot}?start=grp_tail">由 @${bot} 自動提煉</a>`,
    titleSuffix: '今日精華晚報',
    subHeader: (n) => `已自動過濾水貼，從 ${n} 則發言中濃縮以下高價值情報：`,
    secHot: '今日乾貨與實測共識',
    secDebate: '觀點交鋒',
    secOpen: '遺珠懸賞（待解答真問題）',
  },
};

const ALIAS_MAP = {
  zh: 'zh-CN', cn: 'zh-CN', 'zh-cn': 'zh-CN', 'zh-hans': 'zh-CN', '中文': 'zh-CN', '中': 'zh-CN', '简体': 'zh-CN',
  tw: 'zh-TW', hk: 'zh-TW', 'zh-tw': 'zh-TW', 'zh-hant': 'zh-TW', '繁体': 'zh-TW', '繁體': 'zh-TW', '粤': 'zh-TW',
  bi: 'bi', bilingual: 'bi', '双语': 'bi', '中英': 'bi',
  en: 'en', eng: 'en', '英语': 'en', '英文': 'en', '英': 'en',
  ru: 'ru', rus: 'ru', '俄语': 'ru', '俄文': 'ru', '俄': 'ru',
  es: 'es', spa: 'es', '西语': 'es', '西班牙语': 'es', '西': 'es',
  pt: 'pt', 'pt-br': 'pt', por: 'pt', '葡语': 'pt', '葡萄牙语': 'pt', '葡': 'pt',
  ja: 'ja', jp: 'ja', jpn: 'ja', '日语': 'ja', '日文': 'ja', '日': 'ja',
  ko: 'ko', kr: 'ko', kor: 'ko', '韩语': 'ko', '韩文': 'ko', '韩': 'ko',
  ar: 'ar', ara: 'ar', '阿语': 'ar', '阿拉伯语': 'ar', '阿': 'ar',
  vi: 'vi', vn: 'vi', vie: 'vi', '越语': 'vi', '越南语': 'vi', '越': 'vi',
  id: 'id', ind: 'id', '印尼语': 'id', '印尼': 'id',
  th: 'th', tha: 'th', '泰语': 'th', '泰文': 'th', '泰': 'th',
  tr: 'tr', tur: 'tr', '土语': 'tr', '土耳其语': 'tr',
  de: 'de', ger: 'de', '德语': 'de', '德文': 'de', '德': 'de',
  fr: 'fr', fra: 'fr', '法语': 'fr', '法文': 'fr', '法': 'fr',
};

export function resolveLangCode(input, fallback = '') {
  if (!input) return fallback;
  const norm = String(input).trim().toLowerCase();
  if (SUPPORTED_LANGS[input]) return input;
  if (ALIAS_MAP[norm]) return ALIAS_MAP[norm];
  const base = norm.split('-')[0];
  if (ALIAS_MAP[base]) return ALIAS_MAP[base];
  return fallback;
}

export function getLangMeta(code) {
  return SUPPORTED_LANGS[code] || SUPPORTED_LANGS['zh-CN'];
}

export function buildLangKeyboard() {
  const keys = [
    ['zh-CN', 'bi', 'en', 'ru'],
    ['es', 'pt', 'ja', 'ko'],
    ['ar', 'vi', 'id', 'th'],
    ['tr', 'de', 'fr', 'zh-TW'],
  ];
  return {
    inline_keyboard: keys.map((row) =>
      row.map((code) => ({
        text: `${SUPPORTED_LANGS[code].flag} ${SUPPORTED_LANGS[code].label}`,
        callback_data: `setlang:${code}`,
      }))
    ),
  };
}

export function extractLeadingLangArg(rawArgs) {
  const trimmed = (rawArgs || '').trim();
  const match = trimmed.match(/^([a-zA-Z-]{2,7}|中文|英文|英语|俄语|俄文|西语|西班牙语|葡语|日语|日文|韩语|韩文|阿语|阿拉伯语|越语|越南语|印尼语|泰语|土语|土耳其语|德语|法语|繁体|繁體)\s+([\s\S]+)$/i);
  if (!match) return { langCode: '', restText: trimmed };
  const resolved = resolveLangCode(match[1], '');
  if (!resolved || resolved === 'bi') return { langCode: '', restText: trimmed };
  return { langCode: resolved, restText: match[2].trim() };
}
