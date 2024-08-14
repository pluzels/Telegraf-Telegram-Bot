const { tiktoks } = require('../lib/tiktoksearch');

module.exports = (bot, availableCommands) => {
  const commandName = 'tiktoksearch'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['search'] });

  bot.command(commandName, async (ctx) => {
    const commandParts = ctx.message.text.split(',');
    const query = commandParts[0].split(' ')[1];
    const count = parseInt(commandParts[1]);

    if (!query || isNaN(count) || count <= 0) {
      ctx.reply('Untuk menggunakan, ketik \n\nContoh: /tiktoksearch <query>,<count>');
      return;
    }

    const replyMessage = await ctx.reply('Tunggu sebentar, mencari video TikTok...');

    try {
      const videos = await tiktoks(query);

      console.log("Response body from tiktoksearch.js:", videos); // Menampilkan response body ke konsol

      if (videos && videos.length > 0) {
        const limit = Math.min(videos.length, count); // Batasi jumlah video yang ditampilkan sesuai dengan count
        for (let i = 0; i < limit; i++) {
          const videoUrl = videos[i].no_watermark; // Menggunakan video tanpa watermark

          // Indicate that the bot is uploading a video
          await ctx.sendChatAction('upload_video');

          // Send the video to the user
          await ctx.replyWithVideo({ url: videoUrl });
        }
        await ctx.telegram.editMessageText(ctx.chat.id, replyMessage.message_id, null, 'Berhasil menemukan video TikTok 🎉');
      } else {
        ctx.reply(`Maaf, tidak ada video TikTok ditemukan untuk query "${query}".`);
        await ctx.telegram.editMessageText(ctx.chat.id, replyMessage.message_id, null, 'Tidak ada video ditemukan 😔');
      }
    } catch (error) {
      console.error('Error searching TikTok video:', error);
      ctx.reply('Error saat mencari video TikTok. Coba lagi nanti.');
      await ctx.telegram.editMessageText(ctx.chat.id, replyMessage.message_id, null, 'Error saat mencari video 😔');
    }
  });
};