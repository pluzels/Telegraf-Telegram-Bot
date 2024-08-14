const axios = require('axios');

module.exports = (bot, availableCommands) => {
  const commandName = 'ai'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['ai'] });

  // Inisialisasi variabel untuk menyimpan riwayat sesi chat
  let sessionHistory = '';

  bot.command(commandName, async (ctx, next) => {
    const message = ctx.message.text;
    const inputText = message.split(' ').slice(1).join(' ');

    if (!inputText) {
      ctx.reply('Hello aku adalah Bot AI. Untuk menggunakan, ketik \n\nContoh: /ai hello bot');
      return;
    }

    // Menambahkan input saat ini ke sesi chat sebelumnya
    sessionHistory += `\nUser: ${inputText}`;

    try {
      const apiUrl = `https://itzpire.com/ai/botika?q=${encodeURIComponent(sessionHistory)}&user=assistant&model=sindy`;

      const response = await axios.get(apiUrl);

      // Logging response for debugging purposes
      console.log('Full response data:', response.data);

      if (response.data && response.data.result) {
        const result = response.data.result; // Mengambil 'result' dari respons

        // Menambahkan respons AI ke sesi chat
        sessionHistory += `\nAssistant: ${result}`;

        // Mengirimkan respons AI dengan reply to message ID
        ctx.reply(result, { reply_to_message_id: ctx.message.message_id });
      } else {
        // Handle unexpected response structure
        ctx.reply('Maaf, tidak ada jawaban yang ditemukan untuk permintaan ini.', { reply_to_message_id: ctx.message.message_id });
      }

    } catch (error) {
      console.error('Error fetching AI response:', error);
      ctx.reply('Error API AI down, coba lagi nanti.', { reply_to_message_id: ctx.message.message_id });
    }

    // Tidak perlu memanggil next() karena hanya ada satu middleware di sini
  });
};