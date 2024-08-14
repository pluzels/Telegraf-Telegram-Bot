const axios = require('axios');

module.exports = (bot, availableCommands) => {
  const commandName = 'pixivsearch'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['search'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tags: search

  bot.command(commandName, async (ctx) => {
    const message = ctx.message.text;
    const commandArgs = message.split(' ').slice(1).join(' ').trim(); // Mengambil argumen dari pesan

    if (!commandArgs) {
      ctx.reply('Silakan masukkan kata kunci pencarian setelah perintah /pixiv, diikuti dengan jumlah gambar.\n\nContoh: /pixiv vicidior, 5');
      return;
    }

    const args = commandArgs.split(',').map(arg => arg.trim()); // Memisahkan kata kunci pencarian dan jumlah gambar
    const query = args[0]; // Kata kunci pencarian
    const count = parseInt(args[1]) || 1; // Jumlah gambar yang diinginkan (default: 1 jika tidak disediakan)

    try {
      // Kirim pesan "Searching...🔎" sebelum melakukan pencarian
      const searchingMessage = await ctx.reply('Searching...🔎');

      // Mengirim permintaan GET ke API
      const response = await axios.get(`https://api.onesytex.my.id/api/pixiv?query=${encodeURIComponent(query)}`);

      console.log('API Response:', response.data); // Logging respons API

      if (response.data && response.data.result && response.data.result.length > 0) {
        const images = response.data.result;

        // Ambil URL gambar regular
        const selectedImages = images.slice(0, count);

        // Kirim gambar-gambar ke pengguna
        for (const image of selectedImages) {
          await ctx.sendChatAction('upload_photo'); // Indicate that the bot is uploading a photo
          await ctx.replyWithPhoto({ url: image.urls.regular });
        }

        // Edit pesan menjadi "NOW I FOUND IT!!! XD🥳" setelah selesai mengirim gambar-gambar
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          searchingMessage.message_id,
          null,
          'NOW I FOUND IT!!! XD🥳'
        );

        // Kirim pesan "FINISHHHHH!!!" setelah selesai mengirim gambar-gambar
        ctx.reply('FINISHHHHH!!!');
      } else {
        // Jika tidak ditemukan gambar
        ctx.reply(`Maaf, tidak dapat menemukan gambar Pixiv untuk kata kunci "${query}".`);
      }
    } catch (error) {
      console.error('Error fetching Pixiv images:', error.response ? error.response.data : error.message);
      ctx.reply('Maaf, terjadi kesalahan saat mencari gambar Pixiv.');
    }
  });
};