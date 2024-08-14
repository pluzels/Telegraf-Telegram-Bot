const axios = require('axios');
const { Markup } = require('telegraf');

module.exports = (bot, availableCommands) => {
  availableCommands.push({ command: 'caisearch', tags: ['ai'] });
  availableCommands.push({ command: 'caiset', tags: ['ai'] });
  availableCommands.push({ command: 'cai', tags: ['ai'] });

  let charactersCache = []; // Menyimpan hasil karakter dari pencarian terakhir
  let currentCharacter = null; // Menyimpan karakter yang sedang diatur CAI-nya
  let userConversations = {}; // Menyimpan percakapan per pengguna

  bot.command('caisearch', async (ctx) => {
    const message = ctx.message.text;
    const query = message.split(' ').slice(1).join(' ').trim(); // Mengambil karakter yang dicari dari pesan

    if (!query) {
      ctx.reply('Silakan masukkan karakter yang ingin dicari setelah perintah /caisearch.\nContoh: /caisearch naruto');
      return;
    }

    try {
      ctx.reply('Searching C-AI character🔎'); // Menambahkan pesan searching sebelum permintaan GET
      const response = await axios.get(`https://api.apigratis.site/cai/search_characters?query=${encodeURIComponent(query)}`);

      if (response.data && response.data.status === true && response.data.result && response.data.result.characters.length > 0) {
        charactersCache = response.data.result.characters.slice(0, 5); // Simpan maksimal 5 karakter pertama dalam cache

        // Membuat pesan respons dengan informasi karakter yang ditemukan
        let message = 'NOW I FOUND THIS🥳\n\n'; // Pesan setelah menemukan karakter
        charactersCache.forEach((character, index) => {
          message += `${index + 1}. ${character.participant__name}\n\n`;
          message += `   Greeting: ${character.greeting}\n`;
          message += `   Title: ${character.title}\n\n`;
        });

        // Menambahkan tombol untuk memilih karakter
        const buttons = charactersCache.map((character, index) => 
          Markup.button.callback(`${index + 1}`, `caiset_${index}`)
        );

        ctx.reply(message, Markup.inlineKeyboard(buttons, { columns: 5 }));
      } else {
        ctx.reply(`Maaf, tidak dapat menemukan karakter dengan nama "${query}".`);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      ctx.reply('Maaf, terjadi kesalahan saat mencari karakter.');
    }
  });

  bot.action(/caiset_(\d+)/, async (ctx) => {
    const characterIndex = parseInt(ctx.match[1]); // Mendapatkan index karakter dari callback data

    if (characterIndex < 0 || characterIndex >= charactersCache.length) {
      ctx.reply('Nomor karakter tidak valid. Pastikan untuk memilih nomor karakter dari hasil pencarian sebelumnya.');
      return;
    }

    currentCharacter = charactersCache[characterIndex]; // Set karakter yang dipilih sebagai karakter saat ini

    try {
      // Data untuk dikirim dalam request POST
      const data = {
        external_id: currentCharacter.external_id,
        message: 'Hai :3! Ada yang bisa aku bantu?'
      };

      // Mengirim permintaan POST ke API CAI Send Message
      const response = await axios.post('https://api.apigratis.site/cai/send_message', data);

      if (response.data && response.data.status === true) {
        ctx.reply(`C-AI berhasil diatur ke karakter: ${currentCharacter.participant__name}`);
        setTimeout(() => {
          ctx.reply('Gunakan /cai <text> untuk berkomunikasi dengan C-AI yang kamu pilih\n\nContoh: /cai woi bang');
        }, 1000); // 1000 milidetik = 1 detik
      } else {
        ctx.reply('Gagal mengatur C-AI ke karakter. Mohon coba lagi.');
      }
    } catch (error) {
      console.error('Error setting C-AI to character', error);
      ctx.reply('Maaf, terjadi kesalahan saat mengatur C-AI ke karakter.');
    }
  });

  bot.command('cai', async (ctx) => {
    const userId = ctx.from.id; // Mendapatkan ID pengguna

    if (!currentCharacter) {
      ctx.reply('Karakter C-AI belum diatur. Silakan atur karakter C-AI terlebih dahulu menggunakan command /caiset.');
      return;
    }

    const message = ctx.message.text;
    const question = message.split(' ').slice(1).join(' ').trim(); // Mengambil pertanyaan dari pesan

    if (!question) {
      ctx.reply('Silakan masukkan pertanyaan setelah perintah /cai.\n\nContoh: /cai Apa kabar?');
      return;
    }

    // Menggabungkan pesan sebelumnya dengan pesan saat ini
    userConversations[userId] = userConversations[userId] || '';
    const prompt = `${userConversations[userId]} ${question}`.trim();

    try {
      // Data untuk dikirim dalam request POST
      const data = {
        external_id: currentCharacter.external_id,
        message: prompt
      };

      // Mengirim permintaan POST ke API CAI Send Message
      const response = await axios.post('https://api.apigratis.site/cai/send_message', data);

      if (response.data && response.data.status === true && response.data.result) {
        const replies = response.data.result.replies;
        const textResponse = replies[0].text; // Ambil teks dari respons API (ambil teks dari objek pertama dalam array replies)
        ctx.reply(textResponse);

        // Update user conversation history with the new question and response
        userConversations[userId] += ` ${question} ${textResponse}`.trim();
      } else {
        ctx.reply('Gagal mengirim pertanyaan ke C-AI. Mohon coba lagi.');
      }
    } catch (error) {
      console.error('Error sending question to C-AI', error);
      ctx.reply('Maaf, terjadi kesalahan saat mengirim pertanyaan ke CAI.');
    }
  });
};