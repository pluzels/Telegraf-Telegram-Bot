const fs = require("fs");
const getGPT4js = require("gpt4js");
let GPT4js;

// Membuat folder dan file database jika belum ada
function initializeDatabase() {
  if (!fs.existsSync("gptdb")) {
    fs.mkdirSync("gptdb");
  }
  if (!fs.existsSync("gptdb/geminipro.json")) {
    fs.writeFileSync("gptdb/geminipro.json", JSON.stringify({}));
  }
}

initializeDatabase(); // Panggil fungsi untuk inisialisasi database

// Inisialisasi GPT4js
(async () => {
  GPT4js = await getGPT4js();
})();

// Fungsi untuk memuat dan menyimpan database
function loadDatabase() {
  const data = fs.readFileSync("gptdb/geminipro.json", "utf8");
  return JSON.parse(data);
}

function saveDatabase(data) {
  fs.writeFileSync("gptdb/geminipro.json", JSON.stringify(data, null, 2));
}

// Fungsi untuk menghindari error pada format Markdown
function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

async function gpt(text, userId) {
  // Pastikan GPT4js telah diinisialisasi
  if (!GPT4js) {
    console.error("GPT4js belum siap.");
    return "Layanan sedang dalam inisialisasi, coba lagi sebentar lagi.";
  }

  const provider = GPT4js.createProvider("Nextway");

  const db = loadDatabase();
  const messages = db[userId] || [];
  messages.push({ role: "user", content: text });

  const options = {
    model: "gemini-pro",
    webSearch: true
  };

  try {
    const response = await provider.chatCompletion(messages, options);
    messages.push({ role: "assistant", content: response });

    db[userId] = messages;
    saveDatabase(db);
    
    return response;
  } catch (error) {
    console.error("Error during GEMINI request:", error);
    return null;
  }
}

module.exports = (bot, availableCommands) => {
  const commandName = 'geminipro';
  availableCommands.push({ command: commandName, tags: ['ai'] });

  bot.command(commandName, async (ctx) => {
    try {
      const message = ctx.message.text;
      const inputText = message.split(' ').slice(1).join(' ');
      const userId = ctx.message.from.id;
      const replyToMessageId = ctx.message.message_id;

      if (!inputText) {
        ctx.reply('Gunakan perintah dengan teks seperti ini: /geminipro halo');
        return;
      }

      const response = await gpt(inputText, userId);
      if (response) {
        // Escape karakter untuk respons Markdown
        const escapedResponse = escapeMarkdown(response);
        
        // Cek apakah response mengandung kode dengan pola triple backticks
        const codePattern = /```([\s\S]+?)```/g;
        if (codePattern.test(response)) {
          // Menggunakan Markdown untuk format kode
          const formattedResponse = escapedResponse.replace(codePattern, '```\n$1\n```');
          ctx.reply(formattedResponse, { reply_to_message_id: replyToMessageId });
        } else {
          // Mengirim respons tanpa format kode
          ctx.reply(escapedResponse, { reply_to_message_id: replyToMessageId });
        }
      } else {
        ctx.reply('Tidak ada jawaban, coba lagi nanti.', { reply_to_message_id: replyToMessageId });
      }
    } catch (error) {
      console.error('Error handling command:', error);
      ctx.reply('Error API GEMINI down, coba lagi nanti.', { reply_to_message_id: ctx.message.message_id });
    }
  });
};
