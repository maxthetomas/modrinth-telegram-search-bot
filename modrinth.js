require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const UserAgent = 'maxthetomas/modrinth-telegram-search-bot/1.0 (max@maxthetomas.ru)'

bot.on('inline_query', async (q) => { 
  let current_offset = parseInt(q.offset) || 0;
  const res = await (await fetch('https://api.modrinth.com/v2/search?' + new URLSearchParams({ query: q.query, limit: 10, offset: current_offset }).toString(), { headers: { 'user-agent': UserAgent } })).json();

  /** @type {TelegramBot.InlineQueryResult[]} */
  let results = [];

  res.hits.forEach(element => {
    results.push({ 
      type: 'article',
      title: element.title,
      description: element.description,
      id: element.project_id,
      thumb_url: element.icon_url,
      hide_url: true,
      message_text: `<a href="${'https://modrinth.com/' + element.project_type + '/' + element.slug}">${element.title}</a> on Modrinth.`,
      disable_web_page_preview: false,
      parse_mode: 'HTML',
      url: 'https://modrinth.com/' + element.project_type + '/' + element.slug
    })
  });

  let next_offset;
  if (res.offset + res.limit < res.total_hits) {
    next_offset = res.offset + res.limit;
  }

  bot.answerInlineQuery(q.id, results, { cache_time: 3600, is_personal: false, next_offset });
});

bot.onText(/^\/start/, (msg) => { 
  bot.sendMessage(msg.chat.id, `👋 Hello, I'm Modrinth search bot. You can search projects on Modrinth using @modrinthbot in any chat! \n\n📗 For example: \n@modrinthbot Fabric`, {
    reply_markup: { inline_keyboard: [ [ { text: 'Try it', switch_inline_query_current_chat: 'Fabric' } ] ] }
  });
});

bot.startPolling();