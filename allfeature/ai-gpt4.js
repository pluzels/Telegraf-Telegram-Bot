const fs = require("fs");
const getGPT4js = require("gpt4js");
let GPT4js;

// Membuat folder dan file database jika belum ada
function initializeDatabase() {
  if (!fs.existsSync("gptdb")) {
    fs.mkdirSync("gptdb");
  }
  if (!fs.existsSync("gptdb/gpt4o-free.json")) {
    fs.writeFileSync("gptdb/gpt4o-free.json", JSON.stringify({}));
  }
}

initializeDatabase(); // Panggil fungsi untuk inisialisasi database

// Inisialisasi GPT4js
(async () => {
  GPT4js = await getGPT4js();
})();

// Fungsi untuk memuat dan menyimpan database
function loadDatabase() {
  const data = fs.readFileSync("gptdb/gpt4o-free.json", "utf8");
  return JSON.parse(data);
}

function saveDatabase(data) {
  fs.writeFileSync("gptdb/gpt4o-free.json", JSON.stringify(data, null, 2));
}

// Fungsi untuk menghindari error pada format Markdown
function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

async function gpt(text, userId) {
  const provider = GPT4js.createProvider("Nextway");

  const db = loadDatabase();
  const messages = db[userId] || [];
  messages.push({ role: "user", content: text });

  const options = {
    model: "gpt-4o-free",
    webSearch: true,
    temperature: 0.7,
    max_tokens: 150
  };

  try {
    const response = await provider.chatCompletion(messages, options);
    messages.push({ role: "assistant", content: response });

    db[userId] = messages;
    saveDatabase(db);
    
    return response;
  } catch (error) {
    console.error("Error during GPT request:", error);
    return null;
  }
}

module.exports = (bot, availableCommands) => {
  const commandName = 'gpt4';
  availableCommands.push({ command: commandName, tags: ['ai'] });

  bot.command(commandName, async (ctx) => {
    try {
      const message = ctx.message.text;
      const inputText = message.split(' ').slice(1).join(' ');
      const userId = ctx.message.from.id;
      const replyToMessageId = ctx.message.message_id;

      if (!inputText) {
        ctx.reply('Gunakan perintah dengan teks seperti ini: /gpt4 halo');
        return;
      }

      const response = await gpt(inputText, userId);
      if (response) {
        // Cek apakah response mengandung kode dengan pola triple backticks
        const codePattern = /```([\s\S]+?)```/g;
        const hasCode = codePattern.test(response);

        if (hasCode) {
          // Format pesan sebagai kode dengan HTML untuk menghindari masalah Markdown
          const formattedResponse = response.replace(codePattern, '<pre><code>$1</code></pre>');
          ctx.replyWithHTML(formattedResponse, { reply_to_message_id: replyToMessageId });
        } else {
          // Jika tidak mengandung kode, kirimkan teks biasa
          ctx.reply(response, { reply_to_message_id: replyToMessageId });
        }
      } else {
        ctx.reply('Tidak ada jawaban, coba lagi nanti.', { reply_to_message_id: replyToMessageId });
      }
    } catch (error) {
      console.error('Error handling command:', error);
      ctx.reply('Error API GPT-4 down, coba lagi nanti.', { reply_to_message_id: ctx.message.message_id });
    }
  });
};
