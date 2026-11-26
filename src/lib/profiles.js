// src/lib/profiles.js — Localized Bot profiles, command menus & /start welcome cards (Open-Source Edition)

export const BOT_LOCALIZED_PROFILES = [
  {
    language_code: '',
    label: 'Global Default (English)',
    name: 'LinguaBrief · AI Group Digest & Translator',
    short_description:
      'Noise-free AI daily group digest with jump-to-message links & zero-spam /tr reply translation across 16 languages.',
    description:
      '🌍 Turn noisy multilingual chats into daily signal.\n\n' +
      '• Noise-Free Daily Digest: Filters spam & chatter, delivering key takeaways, neutral debate recaps & open questions with ↗Source jump links.\n' +
      '• 16 Languages + Bilingual: Supports EN, ZH, RU, ES, PT, JA, KO, AR, VI, ID, TH, TR, DE, FR (/lang).\n' +
      '• Zero-Spam Reply Translate: Reply /tr to read any message in your own language.\n' +
      '• Inline 5-Lang Cards: Type @your_bot in any chat!',
    commands: [
      { command: 'digest', description: "Generate today's AI group digest now" },
      { command: 'tr', description: 'Reply to translate into your language (or /tr es, /tr ru)' },
      { command: 'lang', description: 'Switch digest language (16 languages & Bilingual)' },
      { command: 'tz', description: 'Set group timezone & daily push hour (e.g. /tz -5 21)' },
      { command: 'groupid', description: 'Show group ID & current digest schedule' },
    ],
  },
  {
    language_code: 'zh',
    label: 'Chinese (zh)',
    name: 'LinguaBrief · 群聊精华晚报 & 智能互译',
    short_description:
      '自动过滤水贴与砍价链，每晚准点推送带「↗原楼层跳转」的跨语种社群干货晚报；群内回复 /tr 秒翻16国母语。',
    description:
      '📊 每天群聊几百条爬不动楼？跨国群多语种混聊看不懂？\n\n' +
      '• 净水精华晚报：自动剔除砍价拉新与表情复读，每晚准点提炼干货共识、争议端水复盘与未解真问题（附 ↗原楼层 一键直跳）\n' +
      '• 16 国语言 + 中英双语：群内发 /lang 点击国旗一键切换\n' +
      '• 随叫随到翻译：回复任意外语发 /tr 自动翻成你的手机母语，平时安静绝不刷屏\n' +
      '• 内联 5 国齐发：任意聊天框 @机器人 秒出 5 国地道译文卡片！',
    commands: [
      { command: 'digest', description: '立即提炼本群今日干货精华晚报' },
      { command: 'tr', description: '回复外语秒翻母语（或 /tr ru、/tr es 指定语种）' },
      { command: 'lang', description: '打开 16 国语言与「中英双语」切换面板' },
      { command: 'tz', description: '设置本群时区与每日推报整点（如 /tz +8 21）' },
      { command: 'groupid', description: '查看本群数字 ID 与当前推报配置' },
    ],
  },
  {
    language_code: 'ru',
    label: 'Russian (ru)',
    name: 'LinguaBrief · ИИ-дайджест чата и переводчик',
    short_description:
      'Умный ИИ-дайджест чата со ссылками на сообщения без флуда + мгновенный перевод реплаем (/tr) на 16 языков.',
    description:
      '📊 Сотни сообщений в чате и некогда читать весь скролл?\n\n' +
      '• Выжимка без флуда и спама: каждый вечер собирает главные инсайты, нейтральный разбор споров и вопросы без ответа с кнопкой «↗Источник».\n' +
      '• 16 языков: поддержка RU, EN, ZH, ES, AR и др. (/lang).\n' +
      '• Перевод без спама: ответьте /tr на любое сообщение для перевода на ваш язык.\n' +
      '• Инлайн-режим: используйте @bot в любом чате!',
    commands: [
      { command: 'digest', description: 'Собрать ИИ-дайджест чата прямо сейчас' },
      { command: 'tr', description: 'Перевести сообщение реплаем на ваш язык' },
      { command: 'lang', description: 'Выбрать язык дайджеста (16 языков)' },
      { command: 'tz', description: 'Настроить часовой пояс и время (напр. /tz +3 21)' },
      { command: 'groupid', description: 'Показать ID чата и текущие настройки' },
    ],
  },
  {
    language_code: 'es',
    label: 'Spanish (es)',
    name: 'LinguaBrief · Resumen IA de Grupo y Traductor',
    short_description:
      'Resumen diario con IA sin spam y enlaces al mensaje original + traducción instantánea (/tr) en 16 idiomas.',
    description:
      '🌍 Convierte cientos de mensajes diarios en información clara.\n\n' +
      '• Resumen Diario sin Spam: Filtra ruido y enlaces basura; entrega conclusiones clave, debates neutrales y dudas pendientes con enlace «↗Mensaje».\n' +
      '• 16 Idiomas + Modo Bilingüe: Cambia fácil con /lang.\n' +
      '• Traducción sin Spam: Responde /tr a cualquier mensaje para leerlo en tu idioma.\n' +
      '• Modo Inline: Escribe @bot en cualquier chat.',
    commands: [
      { command: 'digest', description: 'Generar el resumen IA del grupo ahora' },
      { command: 'tr', description: 'Responder para traducir a tu idioma (o /tr en, /tr pt)' },
      { command: 'lang', description: 'Cambiar idioma del resumen (16 idiomas)' },
      { command: 'tz', description: 'Ajustar zona horaria y hora (ej. /tz -5 21)' },
      { command: 'groupid', description: 'Ver ID del grupo y configuración actual' },
    ],
  },
];

export function getLocalizedStartCard(userLangCode, botName) {
  if (userLangCode.startsWith('zh')) {
    return {
      text:
        `👋 <b>LinguaBrief · 全球 16 语种社群晚报 & 智能翻译官</b>\n\n` +
        `1️⃣ <b>跨国群晚报（含中英双语模式）：</b>自动过滤广告水贴，每晚准点推送带「↗原楼层跳转」的干货晚报（群内发 <code>/lang</code> 一键切 16 国语言）。\n` +
        `2️⃣ <b>千人千面母语即译：</b>群内回复任意外语发 <code>/tr</code> 自动翻成你的手机母语；也可发 <code>/tr ru</code>、<code>/tr es</code>、<code>/tr ar</code> 指定语种。\n` +
        `3️⃣ <b>内联 5 国齐发：</b>任意聊天框敲 <code>@${botName} 句子</code> 一次弹出 5 张地道译文卡片！\n\n` +
        `👇 现在直接发句话（如 <code>ru 明天发货</code>）秒测翻译：`,
      btn: '➕ 一键拉入我的群组',
    };
  }

  if (userLangCode === 'ru') {
    return {
      text:
        `👋 <b>LinguaBrief · Умный ИИ-дайджест чата и переводчик (16 языков)</b>\n\n` +
        `1️⃣ <b>Вечерняя выжимка без флуда:</b> фильтрует спам и собирает главные мысли, разбор споров и вопросы со ссылками «↗Источник» (<code>/lang</code> — 16 языков).\n` +
        `2️⃣ <b>Перевод без спама в чате:</b> ответьте <code>/tr</code> на любое сообщение, чтобы перевести его на ваш язык (или <code>/tr en</code>, <code>/tr zh</code>).\n` +
        `3️⃣ <b>Инлайн-карточки:</b> введите <code>@${botName} текст</code> в любом чате для мгновенного перевода на 5 языков!\n\n` +
        `👇 Отправьте любой текст сюда на пробу:`,
      btn: '➕ Добавить в группу',
    };
  }

  if (userLangCode === 'es') {
    return {
      text:
        `👋 <b>LinguaBrief · Resumen Diario con IA y Traductor (16 Idiomas)</b>\n\n` +
        `1️⃣ <b>Resumen sin Spam:</b> Filtra el ruido y resume lo mejor del día con enlaces directos «↗Mensaje» (<code>/lang</code> para 16 idiomas).\n` +
        `2️⃣ <b>Traducción al Instante:</b> Responde <code>/tr</code> a cualquier mensaje en el grupo para leerlo en tu idioma sin llenar el chat de spam.\n` +
        `3️⃣ <b>Tarjetas Inline:</b> Escribe <code>@${botName} texto</code> en cualquier chat.\n\n` +
        `👇 Envía cualquier frase aquí para probar ahora:`,
      btn: '➕ Agregar a mi grupo',
    };
  }

  return {
    text:
      `👋 <b>LinguaBrief · 16-Language AI Group Digest & Instant Translator</b>\n\n` +
      `1️⃣ <b>Noise-Free Daily Digest:</b> Summarizes 100s of multilingual chats with ↗Source jump links (<code>/lang</code> for EN, ZH, Bilingual, RU, ES, PT, JA, KO, AR, VI, ID, TH, TR, DE, FR).\n` +
      `2️⃣ <b>Zero-Spam Reply Translate:</b> Reply <code>/tr</code> to any message to read it in your own language, or <code>/tr es</code> / <code>/tr ru</code> / <code>/tr ar</code>.\n` +
      `3️⃣ <b>Inline Multi-Card:</b> Type <code>@${botName} text</code> in any chat for instant 5-language cards!\n\n` +
      `👇 Send any message here (e.g. <code>es Shipped today</code>) to try now:`,
    btn: '➕ Add to Group',
  };
}
