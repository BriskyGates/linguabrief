// src/worker.js — LinguaBrief Open-Source Edition (Cloudflare Workers + D1, zero billing/payment dependencies)
import { cleanIncomingMessage, rankAndFoldMessages } from './lib/filter.js';
import {
  SUPPORTED_LANGS,
  resolveLangCode,
  getLangMeta,
  buildLangKeyboard,
  extractLeadingLangArg,
} from './lib/langs.js';
import { BOT_LOCALIZED_PROFILES, getLocalizedStartCard } from './lib/profiles.js';

const DEFAULT_BOT_NAME = 'LinguaBriefBot';
const MIN_MSGS_FOR_AUTO = 10;

const FAST_MODEL = 'gpt-4.1-mini';
const DIGEST_MODEL = 'gpt-4.1';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/setup-webhook') {
      if (!env.BOT_TOKEN) return new Response('Missing BOT_TOKEN secret.', { status: 500 });
      const guard = url.searchParams.get('key') || '';
      if (guard !== env.BOT_TOKEN.slice(0, 10)) {
        return new Response('Forbidden: append ?key=<first 10 chars of BOT_TOKEN>', { status: 403 });
      }
      const me = await tgApi(env.BOT_TOKEN, 'getMe', {});
      if (me?.ok && me.result?.username) {
        await setSetting(env, 'BOT_USERNAME', me.result.username);
      }
      const webhookUrl = `${url.origin}/webhook`;
      const secretToken = await sha256Hex(env.BOT_TOKEN);
      const res = await tgApi(env.BOT_TOKEN, 'setWebhook', {
        url: webhookUrl,
        secret_token: secretToken,
        allowed_updates: ['message', 'callback_query', 'inline_query'],
      });
      return Response.json({
        ok: true,
        botUsername: me?.result?.username || null,
        webhookUrl,
        telegramResponse: res,
      });
    }

    if (url.pathname === '/setup-profile') {
      if (!env.BOT_TOKEN) return new Response('Missing BOT_TOKEN secret.', { status: 500 });
      const guard = url.searchParams.get('key') || '';
      if (guard !== env.BOT_TOKEN.slice(0, 10)) {
        return new Response('Forbidden: append ?key=<first 10 chars of BOT_TOKEN>', { status: 403 });
      }
      const skipName = url.searchParams.get('skip_name') === '1';
      const report = [];
      for (const prof of BOT_LOCALIZED_PROFILES) {
        const langParam = prof.language_code ? { language_code: prof.language_code } : {};
        const nameRes = skipName
          ? { ok: true, skipped: true }
          : await tgApi(env.BOT_TOKEN, 'setMyName', { name: prof.name, ...langParam });
        const shortRes = await tgApi(env.BOT_TOKEN, 'setMyShortDescription', {
          short_description: prof.short_description,
          ...langParam,
        });
        const descRes = await tgApi(env.BOT_TOKEN, 'setMyDescription', {
          description: prof.description,
          ...langParam,
        });
        const cmdRes = await tgApi(env.BOT_TOKEN, 'setMyCommands', {
          commands: prof.commands,
          ...langParam,
        });
        report.push({
          locale: prof.label,
          setMyName: nameRes.ok ?? false,
          setMyShortDescription: shortRes.ok ?? false,
          setMyDescription: descRes.ok ?? false,
          setMyCommands: cmdRes.ok ?? false,
          notes: [nameRes, shortRes, descRes, cmdRes].filter((r) => !r.ok).map((r) => r.description),
        });
      }
      return Response.json({ ok: true, configuredLocales: report });
    }

    if (url.pathname === '/webhook' && request.method === 'POST') {
      const expectedSecret = await sha256Hex(env.BOT_TOKEN);
      const incomingSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (incomingSecret !== expectedSecret) {
        return new Response('Unauthorized', { status: 401 });
      }

      const update = await request.json();
      ctx.waitUntil(handleUpdate(update, env));
      return new Response('OK', { status: 200 });
    }

    return new Response('LinguaBrief Open-Source Worker is running.', { status: 200 });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScheduledDigests(env));
  },
};

async function handleUpdate(update, env) {
  try {
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query, env);
      return;
    }

    if (update.inline_query) {
      await handleInlineQuery(update.inline_query, env);
      return;
    }

    if (update.message) {
      await handleMessage(update.message, env);
    }
  } catch (err) {
    console.error('Update error:', err);
  }
}

async function handleInlineQuery(inlineQuery, env) {
  const raw = (inlineQuery.query || '').trim();
  if (raw.length < 2) return;

  const { langCode, restText } = extractLeadingLangArg(raw);

  if (langCode && restText) {
    const meta = getLangMeta(langCode);
    const translated = await translateSmart(env, restText, langCode, '');
    await tgApi(env.BOT_TOKEN, 'answerInlineQuery', {
      inline_query_id: inlineQuery.id,
      cache_time: 30,
      results: [{
        type: 'article',
        id: `tr_${langCode}`,
        title: `${meta.flag} ${meta.label}：${translated.slice(0, 48)}`,
        description: `Send ${meta.label} translation`,
        input_message_content: {
          message_text: `${escapeHtml(translated)}\n<i>(${escapeHtml(restText)})</i>`,
          parse_mode: 'HTML',
        },
      }],
    });
    return;
  }

  const multi = await translateMultiCards(env, raw);
  const results = multi.map((item, idx) => {
    const meta = getLangMeta(item.code);
    return {
      type: 'article',
      id: `m_${idx}_${item.code}`,
      title: `${meta.flag} ${meta.label} — ${item.text.slice(0, 45)}`,
      description: item.text.slice(0, 95),
      input_message_content: {
        message_text: `${escapeHtml(item.text)}\n<i>(${escapeHtml(raw)})</i>`,
        parse_mode: 'HTML',
      },
    };
  });

  if (results.length > 0) {
    await tgApi(env.BOT_TOKEN, 'answerInlineQuery', {
      inline_query_id: inlineQuery.id,
      cache_time: 30,
      results,
    });
  }
}

async function handleCallbackQuery(cbq, env) {
  const data = cbq.data || '';
  if (!data.startsWith('setlang:')) return;

  const chatId = cbq.message?.chat?.id;
  const userId = cbq.from?.id;
  if (!chatId || !userId) return;

  const adminId = Number(env.ADMIN_TG_ID || 0);
  if (cbq.message.chat.type !== 'private' && (!adminId || userId !== adminId)) {
    const isAdmin = await checkIsGroupAdmin(env.BOT_TOKEN, chatId, userId);
    if (!isAdmin) {
      await tgApi(env.BOT_TOKEN, 'answerCallbackQuery', {
        callback_query_id: cbq.id,
        text: '⚠️ 仅本群管理员可修改晚报默认语言 / Admins only',
        show_alert: true,
      });
      return;
    }
  }

  const code = data.slice(8);
  const meta = SUPPORTED_LANGS[code];
  if (!meta) return;

  await env.DB.prepare('UPDATE groups SET target_lang = ? WHERE chat_id = ?').bind(code, chatId).run();
  await tgApi(env.BOT_TOKEN, 'answerCallbackQuery', {
    callback_query_id: cbq.id,
    text: `✅ 已切换为 ${meta.flag} ${meta.label}`,
  });

  await tgApi(env.BOT_TOKEN, 'editMessageText', {
    chat_id: chatId,
    message_id: cbq.message.message_id,
    parse_mode: 'HTML',
    text: `✅ <b>本群晚报语言已设为：${meta.flag} ${meta.label}</b>\n` +
          `<i>💡 提示：群友回复外语发 <code>/tr</code> 会自动翻译成提问者自己的母语；也可发 <code>/tr ru</code>、<code>/tr es</code>、<code>/tr ja</code> 指定 16 国语言，或发 <code>/tz +8 21</code> 调整本群时区。</i>`,
  });
}

async function handleMessage(message, env) {
  const chatId = message.chat.id;
  const chatType = message.chat.type;
  const userId = message.from?.id;
  if (!userId) return;

  const nowSec = Math.floor(Date.now() / 1000);
  const userAppLang = resolveLangCode(message.from?.language_code || '', 'en');
  const adminId = Number(env.ADMIN_TG_ID || 0);
  const text = (message.text || message.caption || '').trim();
  if (!text) return;

  // Private chat mode
  if (chatType === 'private') {
    if (adminId && userId === adminId && text.startsWith('/setkey ')) {
      const val = text.slice(8).trim();
      await setSetting(env, 'OPENAI_KEY', val);
      await tgApi(env.BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: '✅ OpenAI API Key saved to D1.' });
      return;
    }

    if (text.startsWith('/start')) {
      const botName = await getSetting(env, 'BOT_USERNAME', env.BOT_USERNAME || DEFAULT_BOT_NAME);
      const card = getLocalizedStartCard(userAppLang, botName);

      await tgApi(env.BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        parse_mode: 'HTML',
        text: card.text,
        reply_markup: {
          inline_keyboard: [[
            {
              text: card.btn,
              url: `https://t.me/${botName}?startgroup=welcome`,
            },
          ]],
        },
      });
      return;
    }

    if (text.startsWith('/lang') || text.startsWith('/tz') || text.startsWith('/digest') || text.startsWith('/groupid')) {
      const botName = await getSetting(env, 'BOT_USERNAME', env.BOT_USERNAME || DEFAULT_BOT_NAME);
      const isChineseUser = userAppLang.startsWith('zh');
      await tgApi(env.BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        parse_mode: 'HTML',
        text: isChineseUser
          ? `ℹ️ <code>${escapeHtml(text.split(/\s+/)[0])}</code> 是<b>群聊专属指令</b>，用于设置所在群的晚报语言、时区或触发晚报。\n\n请先将我拉入你的群组，然后在群内发送 <code>/lang</code> 打开 16 国语言切换面板 👇`
          : `ℹ️ <code>${escapeHtml(text.split(/\s+/)[0])}</code> is a <b>group command</b>.\n\nPlease add me to your group first, then send <code>/lang</code> inside the group to open the 16-language selector 👇`,
        reply_markup: {
          inline_keyboard: [[
            {
              text: isChineseUser ? '➕ 一键拉入群组' : '➕ Add to Group',
              url: `https://t.me/${botName}?startgroup=welcome`,
            },
          ]],
        },
      });
      return;
    }

    const cleanedCmd = text.replace(/^\/tr(@\S+)?\s*/i, '');
    const { langCode, restText } = extractLeadingLangArg(cleanedCmd);
    const translated = await translateSmart(env, restText || cleanedCmd, langCode, userAppLang);
    await tgApi(env.BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: translated });
    return;
  }

  // Group chat mode
  const botName = await getSetting(env, 'BOT_USERNAME', env.BOT_USERNAME || DEFAULT_BOT_NAME);
  let group = await env.DB.prepare('SELECT * FROM groups WHERE chat_id = ?').bind(chatId).first();
  if (!group) {
    const initLang = SUPPORTED_LANGS[userAppLang] ? userAppLang : 'zh-CN';
    const initTz = guessDefaultTz(initLang);
    await env.DB.prepare(
      'INSERT INTO groups (chat_id, title, target_lang, tz_offset) VALUES (?, ?, ?, ?)'
    ).bind(chatId, message.chat.title || 'Group', initLang, initTz).run();
    group = {
      chat_id: chatId,
      title: message.chat.title || 'Group',
      target_lang: initLang,
      tz_offset: initTz,
      digest_hour: 21,
      last_digest_at: 0,
    };
  }

  const langMeta = getLangMeta(group.target_lang);
  const tailLink = `\n\n—\n${langMeta.tail(botName)}`;

  if (text.startsWith('/groupid')) {
    await tgApi(env.BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      text: `Group ID: <code>${chatId}</code> | Lang: ${langMeta.flag} <b>${langMeta.label}</b> | UTC${group.tz_offset >= 0 ? '+' : ''}${group.tz_offset} (${group.digest_hour}:00)`,
      parse_mode: 'HTML',
    });
    return;
  }

  if (text.startsWith('/lang')) {
    const arg = text.replace(/^\/lang(@\S+)?\s*/i, '').trim();
    if (arg) {
      if ((!adminId || userId !== adminId) && !(await checkIsGroupAdmin(env.BOT_TOKEN, chatId, userId))) {
        await tgApi(env.BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ 仅本群管理员可修改晚报默认语言 / Admins only' });
        return;
      }
      const code = resolveLangCode(arg, '');
      if (!code || !SUPPORTED_LANGS[code]) {
        await tgApi(env.BOT_TOKEN, 'sendMessage', {
          chat_id: chatId,
          text: '请选择下方按钮切换语言 / Tap a flag below:',
          reply_markup: buildLangKeyboard(),
        });
        return;
      }
      const m = getLangMeta(code);
      await env.DB.prepare('UPDATE groups SET target_lang = ? WHERE chat_id = ?').bind(code, chatId).run();
      await tgApi(env.BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        parse_mode: 'HTML',
        text: `✅ 本群晚报语言已切换为：<b>${m.flag} ${m.label}</b>`,
      });
      return;
    }

    await tgApi(env.BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      parse_mode: 'HTML',
      text: `🌐 <b>当前本群晚报语言：${langMeta.flag} ${langMeta.label}</b>\n点击下方国旗一键切换（混聊国际群推荐 <b>🌍 中英双语</b>）：`,
      reply_markup: buildLangKeyboard(),
    });
    return;
  }

  if (text.startsWith('/tz')) {
    if ((!adminId || userId !== adminId) && !(await checkIsGroupAdmin(env.BOT_TOKEN, chatId, userId))) {
      await tgApi(env.BOT_TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ 仅群管理员可修改时区 / Admins only' });
      return;
    }
    const parts = text.replace(/^\/tz(@\S+)?\s*/i, '').trim().split(/\s+/);
    const tz = parseInt(parts[0], 10);
    const hr = parts[1] !== undefined ? parseInt(parts[1], 10) : group.digest_hour;
    if (Number.isNaN(tz) || tz < -12 || tz > 14 || Number.isNaN(hr) || hr < 0 || hr > 23) {
      await tgApi(env.BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        parse_mode: 'HTML',
        text: `🕒 当前设置：<code>UTC${group.tz_offset >= 0 ? '+' : ''}${group.tz_offset}</code> 每日 <code>${group.digest_hour}:00</code> 推报。\n修改示例：<code>/tz +8 21</code> 或 <code>/tz +3 20</code>`,
      });
      return;
    }
    await env.DB.prepare('UPDATE groups SET tz_offset = ?, digest_hour = ? WHERE chat_id = ?')
      .bind(tz, hr, chatId).run();
    await tgApi(env.BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      parse_mode: 'HTML',
      text: `✅ 已更新推报时间：<code>UTC${tz >= 0 ? '+' : ''}${tz}</code> 每日 <b>${hr}:00</b> 准点推送！`,
    });
    return;
  }

  const isMentioned = text.toLowerCase().includes(`@${botName.toLowerCase()}`);
  if (text.startsWith('/tr') || (message.reply_to_message && isMentioned)) {
    const afterCmd = text.replace(/^\/tr(@\S+)?\s*/i, '').replace(new RegExp(`@${botName}`, 'ig'), '').trim();
    const replyBody = (message.reply_to_message?.text || message.reply_to_message?.caption || '').trim();

    let explicitLang = '';
    let sourceText = '';

    if (replyBody) {
      explicitLang = resolveLangCode(afterCmd, '');
      sourceText = replyBody;
    } else {
      const parsed = extractLeadingLangArg(afterCmd);
      explicitLang = parsed.langCode;
      sourceText = parsed.restText;
    }

    if (!sourceText) {
      await tgApi(env.BOT_TOKEN, 'sendMessage', {
        chat_id: chatId,
        parse_mode: 'HTML',
        text: '💡 回复任意消息发 <code>/tr</code> 自动翻成你的母语；或发 <code>/tr ru</code> · <code>/tr es</code> · <code>/tr ja</code> · <code>/tr ar</code> · <code>/tr vi</code> 指定 16 国语言！',
        reply_to_message_id: message.message_id,
      });
      return;
    }

    const fallbackBridge = group.target_lang === 'bi' ? 'en' : group.target_lang;
    const translated = await translateSmart(env, sourceText, explicitLang, userAppLang, fallbackBridge);
    const badge = explicitLang && SUPPORTED_LANGS[explicitLang] ? SUPPORTED_LANGS[explicitLang].flag : '🌐';

    await tgApi(env.BOT_TOKEN, 'sendMessage', {
      chat_id: chatId,
      reply_to_message_id: message.reply_to_message?.message_id || message.message_id,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      text: `${badge} ${escapeHtml(translated)}  <i>(via @${botName})</i>`,
    });
    return;
  }

  if (text.startsWith('/digest')) {
    await triggerDigestForGroup(env, group, nowSec, tailLink, true);
    return;
  }

  const cleaned = cleanIncomingMessage(message);
  if (cleaned) {
    const sender = (message.from.first_name || message.from.username || 'Member').slice(0, 24);
    await env.DB.prepare(
      'INSERT INTO buffer_messages (chat_id, msg_id, user_id, reply_to_id, sender, content) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(chatId, message.message_id, userId, message.reply_to_message?.message_id || 0, sender, cleaned).run();

    await env.DB.prepare(
      `DELETE FROM buffer_messages WHERE chat_id = ? AND id NOT IN (
         SELECT id FROM buffer_messages WHERE chat_id = ? ORDER BY id DESC LIMIT 220
       )`
    ).bind(chatId, chatId).run();
  }
}

async function runScheduledDigests(env) {
  const nowSec = Math.floor(Date.now() / 1000);
  const utcHour = new Date(nowSec * 1000).getUTCHours();
  const botName = await getSetting(env, 'BOT_USERNAME', env.BOT_USERNAME || DEFAULT_BOT_NAME);

  const { results: allGroups } = await env.DB.prepare(
    'SELECT * FROM groups WHERE (? - last_digest_at) >= 64800'
  ).bind(nowSec).all();

  for (const g of allGroups || []) {
    const localHour = ((utcHour + (g.tz_offset ?? 8)) % 24 + 24) % 24;
    if (localHour !== (g.digest_hour ?? 21)) continue;

    const countRow = await env.DB.prepare('SELECT COUNT(*) AS cnt FROM buffer_messages WHERE chat_id = ?')
      .bind(g.chat_id).first();
    const totalBuffered = countRow?.cnt || 0;
    if (totalBuffered < MIN_MSGS_FOR_AUTO) continue;

    const langMeta = getLangMeta(g.target_lang);
    const tailLink = `\n\n—\n${langMeta.tail(botName)}`;
    await triggerDigestForGroup(env, g, nowSec, tailLink, false);
  }
}

async function triggerDigestForGroup(env, group, nowSec, tailLink, isManual) {
  const { results } = await env.DB.prepare(
    'SELECT id, msg_id AS msgId, user_id AS userId, reply_to_id AS replyToId, sender, content FROM buffer_messages WHERE chat_id = ? ORDER BY id DESC LIMIT 160'
  ).bind(group.chat_id).all();

  const rawRows = (results || []).reverse();
  if (rawRows.length < 5) {
    if (isManual) {
      await tgApi(env.BOT_TOKEN, 'sendMessage', {
        chat_id: group.chat_id,
        text: '📭 当前过滤水贴后的有效讨论不足 5 条 / Fewer than 5 valid messages buffered so far.',
      });
    }
    return;
  }

  const digestHtml = await buildDigestHtml(env, group, rawRows);
  await tgApi(env.BOT_TOKEN, 'sendMessage', {
    chat_id: group.chat_id,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    text: `${digestHtml}${tailLink}`,
  });

  await env.DB.prepare('DELETE FROM buffer_messages WHERE chat_id = ?').bind(group.chat_id).run();
  await env.DB.prepare('UPDATE groups SET last_digest_at = ? WHERE chat_id = ?').bind(nowSec, group.chat_id).run();
}

async function callLLM(env, model, systemPrompt, userText, maxTokens = 900, jsonMode = false) {
  const apiKey = env.OPENAI_KEY || await getSetting(env, 'OPENAI_KEY');
  if (!apiKey) throw new Error('Missing OPENAI_KEY secret.');

  const baseUrl = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const payload = {
    model,
    max_tokens: maxTokens,
    temperature: 0.3,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userText },
    ],
  };
  if (jsonMode) payload.response_format = { type: 'json_object' };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

async function translateSmart(env, text, explicitLangCode = '', requesterLangCode = 'zh-CN', groupFallbackCode = 'en') {
  if (explicitLangCode && SUPPORTED_LANGS[explicitLangCode]) {
    const targetName = SUPPORTED_LANGS[explicitLangCode].llmName;
    const prompt = `Translate the user's message accurately and idiomatically into ${targetName}, preserving domain slang and tone. Output ONLY the translated text without explanations.`;
    return callLLM(env, FAST_MODEL, prompt, text.slice(0, 2000), 500);
  }

  const primaryMeta = getLangMeta(requesterLangCode || 'zh-CN');
  const altCode = (requesterLangCode || '').startsWith('en')
    ? (groupFallbackCode && !groupFallbackCode.startsWith('en') ? groupFallbackCode : 'zh-CN')
    : 'en';
  const altMeta = getLangMeta(altCode);

  const prompt = `You are a native multilingual chat translator.
1. If the input message is NOT written in ${primaryMeta.llmName}, translate it idiomatically into ${primaryMeta.llmName}.
2. If the input message is ALREADY written in ${primaryMeta.llmName}, translate it idiomatically into ${altMeta.llmName}.
Preserve slang, numbers, and tone. Output ONLY the translation, with zero explanations or quotes.`;

  return callLLM(env, FAST_MODEL, prompt, text.slice(0, 2000), 500);
}

async function translateMultiCards(env, text) {
  const hasCJK = /[\u4e00-\u9fff]/.test(text);
  const targetCodes = hasCJK
    ? ['en', 'ru', 'es', 'ja', 'ko']
    : ['zh-CN', 'en', 'ru', 'es', 'ar'];

  const spec = targetCodes.map((c) => `"${c}": "${SUPPORTED_LANGS[c].llmName}"`).join(', ');
  const prompt = `Translate the user's text idiomatically into each of these target languages: { ${spec} }.
Return strictly a JSON object mapping each language code key to its translated string. Keep translations natural for instant messaging.`;

  try {
    const rawJson = await callLLM(env, FAST_MODEL, prompt, text.slice(0, 600), 650, true);
    const parsed = JSON.parse(rawJson);
    return targetCodes
      .filter((code) => typeof parsed[code] === 'string' && parsed[code].trim())
      .map((code) => ({ code, text: parsed[code].trim() }));
  } catch {
    const fallback = await translateSmart(env, text, hasCJK ? 'en' : 'zh-CN');
    return [{ code: hasCJK ? 'en' : 'zh-CN', text: fallback }];
  }
}

async function buildDigestHtml(env, group, rawRows) {
  const chatId = group.chat_id;
  const chatTitle = group.title || 'Group';
  const langMeta = getLangMeta(group.target_lang || 'zh-CN');
  const cleanId = String(chatId).startsWith('-100') ? String(chatId).slice(4) : null;
  const rows = rankAndFoldMessages(rawRows);

  const formattedLog = rows.map((r) => {
    const replyTag = r.replyToId ? `(↳#${r.replyToId})` : '';
    const hotTag = r.uniqueRepliers >= 2 ? `[🔥${r.uniqueRepliers}]` : '';
    return `[#${r.msgId}]${replyTag}${hotTag} ${r.sender}: ${r.content}`;
  }).join('\n');

  const linkGuide = cleanId
    ? `At the end of EVERY bullet, attach an HTML jump link to the primary source message ID in this exact format: <a href="https://t.me/c/${cleanId}/MESSAGE_ID">${langMeta.jumpText}</a>`
    : 'Credit key contributors by name in each bullet.';

  const sysPrompt = `You are a veteran multilingual community editor-in-chief. Summarize the group chat log (which may mix Chinese, English, Russian, Spanish, Arabic, Japanese, Korean, Vietnamese, etc.) into a high-signal HTML digest written entirely in ${langMeta.llmName}.

[STRICT HTML & SAFETY RULES]
- ONLY use Telegram-supported HTML tags: <b>, <i>, <code>, and <a href="..."> (NO Markdown **, ##, or unsupported tags).
- Completely ignore leftover referral spam, greetings, or empty chatter. Unify insights from ALL languages in the chat into ${langMeta.llmName}.

[FIXED DIGEST STRUCTURE — omit any section if empty today, never pad]

📊 <b>${escapeHtml(chatTitle)} · ${langMeta.titleSuffix}</b>
<i>${langMeta.subHeader(rawRows.length)}</i>

🔥 <b>${langMeta.secHot}</b> (2–4 bullets)
• <b>[Short Actionable Headline]:</b> Concrete takeaways, numbers, tools, or lessons learned, crediting helpful members (e.g. via @Name). ${linkGuide}

⚖️ <b>${langMeta.secDebate}</b> (ONLY if a real debate/argument occurred)
• NEVER name quarrelers or repeat insults! Reframe heated arguments neutrally as objective industry trade-offs ("Regarding [topic], two practical views emerged: one side argues... while the other notes..."). ${linkGuide}

🙋 <b>${langMeta.secOpen}</b> (1–2 bullets max)
• Highlight genuine, substantive questions from members that went unanswered in the noise so evening readers can help. ${linkGuide}`;

  const model = rows.length >= 50 ? DIGEST_MODEL : FAST_MODEL;
  return callLLM(env, model, sysPrompt, formattedLog.slice(0, 15000), 1050);
}

async function checkIsGroupAdmin(botToken, chatId, userId) {
  try {
    const res = await tgApi(botToken, 'getChatMember', { chat_id: chatId, user_id: userId });
    const status = res?.result?.status || '';
    return status === 'creator' || status === 'administrator';
  } catch {
    return false;
  }
}

function guessDefaultTz(langCode) {
  const map = {
    'zh-CN': 8, 'zh-TW': 8, 'ja': 9, 'ko': 9, 'vi': 7, 'th': 7, 'id': 7,
    'ru': 3, 'tr': 3, 'ar': 4, 'de': 1, 'fr': 1, 'es': -5, 'pt': -3, 'en': 0,
  };
  return map[langCode] ?? 8;
}

async function getSetting(env, key, fallback = '') {
  const row = await env.DB.prepare('SELECT val FROM kv_config WHERE key = ?').bind(key).first();
  return row ? row.val : fallback;
}

async function setSetting(env, key, val) {
  await env.DB.prepare(
    'INSERT INTO kv_config (key, val) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET val = excluded.val'
  ).bind(key, val).run();
}

async function tgApi(botToken, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function sha256Hex(input) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 48);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
