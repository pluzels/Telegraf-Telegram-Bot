module.exports = (bot, availableCommands) => {
  const commandName = 'playm'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['downloader', 'music'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tag downloader dan music

  bot.command(commandName, async (ctx) => {
    const message = ctx.message.text;
    const query = message.split(' ').slice(1).join(' ');

    if (!query) {
      ctx.reply('Ini adalah fitur pencarian musik. Untuk menggunakan, ketik /playm diikuti judul lagu yang ingin dicari.\n\nContoh: /playm Shape of You');
      return;
    }

    try {
      // Memberikan pesan bahwa lagu sedang dicari
      const searchMessage = await ctx.reply('Tunggu sebentar, sedang mencari musik...');

      // Menggunakan API yang diberikan untuk mencari musik berdasarkan query
      const response = await axios.get(`https://api3.galihjsdev.xyz/api/playmusic?query=${encodeURIComponent(query)}`);
      
      const musicData = response.data.data.audio;

      if (!musicData) {
        ctx.reply('Tidak dapat menemukan musik yang sesuai dengan query.');
        return;
      }

      // Indicate that the bot is uploading audio
      await ctx.sendChatAction('upload_audio');
      
      // Mengirim audio kepada pengguna dengan judul musik dan nama file yang sesuai
      await ctx.replyWithAudio({
        url: musicData.url,
        performer: musicData.artist,
        title: musicData.title, // Include the title in the audio message
        filename: `${musicData.title}.mp3` // Menetapkan nama file yang sesuai
      });

      // Mengubah pesan menjadi "Selesai!" setelah musik dikirim
      await ctx.telegram.editMessageText(ctx.chat.id, searchMessage.message_id, null, 'Selesai!');
      
    } catch (error) {
      console.error('Error fetching music:', error);
      ctx.reply('Terjadi kesalahan saat mencari musik. Mohon coba lagi nanti.');
    }
  });
};
