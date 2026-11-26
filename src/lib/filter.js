// src/lib/filter.js — Multi-language spam filter & reply-tree signal ranking

const SPAM_PATTERNS = [
  /(\?|&)(ref|invite|aff|referral|utm_source)=/i,
  /t\.me\/(\+|joinchat\/|\w+\?start=)/i,
  /(temu\.com|yangkeduo\.com|pinduoduo|bit\.ly|tinyurl\.com|cutt\.ly)/i,
  /(砍一刀|帮我点一下|助力一下|免费领|注册即送|首充|包赔|带单老师|日赚|私我领)/i,
  /\b(free\s+airdrop|claim\s+now|guaranteed\s+profit|dm\s+me\s+for\s+signals|pump\s+group)\b/i,
  /(раздача\s+крипты|легкий\s+заработок|пиши\s+в\s+лс|халява)/i,
];

const NOISE_EXACT = /^(哈哈+|666+|牛逼|牛哇|收到|感谢|谢谢老板|顶|路过|插眼|蹲一个|mark|gm|gn|good\s*morning|good\s*night|lol+|lmao+|rofl|wtf|thx|thanks|ty|ok+|okay|nice|cool|спс|лол|кек|ахах+|ок|gracias|jaja+|kkk+|ㅋㅋ+|ㅎㅎ+|草|www+|\+1|👍+|😂+|🤣+|🔥+|🎉+|❤️+|🙏+)$/i;

/**
 * Filter out bots, forwards, short chatter, emoji-only replies, and referral spam.
 */
export function cleanIncomingMessage(message) {
  if (message.from?.is_bot || message.via_bot || message.forward_from_chat) {
    return null;
  }

  const raw = (message.text || message.caption || '').trim();
  if (!raw || raw.startsWith('/')) return null;

  const stripped = raw.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]/gu, '');
  if (stripped.length < 4 || NOISE_EXACT.test(stripped)) {
    return null;
  }

  const entities = message.entities || message.caption_entities || [];
  let urlCharTotal = 0;
  for (const ent of entities) {
    if (ent.type === 'text_link' && ent.url) {
      if (SPAM_PATTERNS.some((re) => re.test(ent.url))) return null;
    }
    if (ent.type === 'url') {
      urlCharTotal += ent.length;
    }
  }

  if (SPAM_PATTERNS.some((re) => re.test(raw))) {
    return null;
  }

  if (urlCharTotal > 0 && (raw.length - urlCharTotal) < 8) {
    return null;
  }

  return raw.replace(/\s+/g, ' ').slice(0, 320);
}

/**
 * Fold two-person ping-pong arguments and rank messages by reply-tree engagement & signal density.
 */
export function rankAndFoldMessages(rows) {
  const replyUsersByTarget = new Map();
  const msgAuthorMap = new Map();

  for (const r of rows) {
    msgAuthorMap.set(r.msgId, r.userId);
    if (r.replyToId > 0) {
      if (!replyUsersByTarget.has(r.replyToId)) {
        replyUsersByTarget.set(r.replyToId, new Set());
      }
      replyUsersByTarget.get(r.replyToId).add(r.userId);
    }
  }

  const pairStreak = new Map();
  const filtered = [];

  for (const r of rows) {
    if (r.replyToId > 0 && msgAuthorMap.has(r.replyToId)) {
      const targetAuthor = msgAuthorMap.get(r.replyToId);
      if (targetAuthor && targetAuthor !== r.userId) {
        const pairKey = [r.userId, targetAuthor].sort().join(':');
        const count = (pairStreak.get(pairKey) || 0) + 1;
        pairStreak.set(pairKey, count);

        const uniqueParticipants = replyUsersByTarget.get(r.replyToId)?.size || 1;
        if (count > 4 && uniqueParticipants <= 2 && r.content.length < 60) {
          continue;
        }
      }
    }
    filtered.push(r);
  }

  const scored = filtered.map((r) => {
    let score = 0;
    const uniqueRepliers = replyUsersByTarget.get(r.msgId)?.size || 0;
    score += uniqueRepliers * 5;
    if (r.content.length >= 35) score += 3;
    if (/(?:\$|€|£|¥|₽|₩|₫|\d+\s*(?:%|w|k|刀|元|美金|usd|eur|rub|usdt|ton|gram|stars|倍|天|days|hrs))/i.test(r.content)) {
      score += 3;
    }
    if (/[?？¿؟]|怎么|请问|求推|踩坑|实测|解决|\b(how|why|anyone|tested|fixed|issue)\b|(как|почему|кто|опыт|решил)|(cómo|alguien)|(どうやって|어떻게)/i.test(r.content)) {
      score += 2;
    }
    return { ...r, score, uniqueRepliers };
  });

  return scored.length > 85
    ? scored
        .sort((a, b) => b.score - a.score || a.id - b.id)
        .slice(0, 85)
        .sort((a, b) => a.id - b.id)
    : scored;
}
