const axios = require('axios');
const cheerio = require('cheerio');

async function gpt(text, sessionId) {
  try {
    const nonceResponse = await axios.get("https://chatgpt4online.org");
    const $ = cheerio.load(nonceResponse.data);
    const nonceValue = JSON.parse($('.mwai-chatbot-container').attr('data-system')).restNonce;

    const data = {
      botId: "default",
      customId: null,
      session: sessionId,
      contextId: 58,
      messages: [{
        role: "assistant",
        content: "Hai! saya merry",
        who: "AI: ",
      }],
      newMessage: text,
      newFileId: null,
      stream: false
    };

    const headers = {
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonceValue
    };

    const response = await axios.post('https://chatgpt4online.org/wp-json/mwai-ui/v1/chats/submit', data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error during GPT request:', error);
    return null;
  }
}

module.exports = (bot, availableCommands) => {
  const commandName = 'gpt4'; // Nama perintah yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['ai'] });

  // Inisialisasi objek untuk menyimpan konteks percakapan setiap pengguna
  const userSessions = {};

  bot.command(commandName, async (ctx) => {
    const message = ctx.message.text;
    const inputText = message.split(' ').slice(1).join(' ');
    const userId = ctx.message.from.id; // Menggunakan ID pengguna sebagai kunci untuk konteks
    const replyToMessageId = ctx.message.message_id; // Mendapatkan ID pesan yang ingin di-reply

    if (!inputText) {
      ctx.reply('Halo, aku adalah ChatGPT 4. Untuk menggunakan, ketik \n\nContoh: /gpt4 hello');
      return;
    }

    // Menggunakan sesi chat sebelumnya jika ada, berdasarkan ID pengguna
    const sessionId = userSessions[userId] || 'A';
    const response = await gpt(inputText, sessionId);

    try {
      if (response && response.reply) {
        let result = response.reply; // Mengambil 'reply' dari respons

        // Memeriksa apakah 'reply' mengandung kode
        const codePattern = /^```(?:\w+\n)?[\s\S]*?```$/gm;
        const hasCode = codePattern.test(result);

        if (hasCode) {
          // Mengirimkan hasil dalam format kode Markdown
          ctx.replyWithMarkdown(result, { reply_to_message_id: replyToMessageId });
        } else {
          // Jika tidak mengandung kode, mengirimkan pesan tanpa format Markdown
          ctx.reply(result, { reply_to_message_id: replyToMessageId });
        }

        // Menyimpan ID sesi chat saat ini untuk pengguna ini
        userSessions[userId] = response.session;
      } else {
        // Menangani struktur respons yang tidak terduga
        ctx.reply('Maaf, tidak ada jawaban yang ditemukan untuk permintaan ini.', { reply_to_message_id: replyToMessageId });
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      ctx.reply('Error API GPT-4 down, coba lagi nanti.', { reply_to_message_id: replyToMessageId });
    }
  });
};
