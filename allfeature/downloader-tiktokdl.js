const { tiktok2 } = require('../lib/tiktokscraper'); // Menggunakan modul scrape.js

module.exports = (bot, availableCommands) => {
  const commandName = 'tiktokdl'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['downloader'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tag downloader

  bot.command(commandName, async (ctx) => {
    const message = ctx.message.text;
    const link = message.split(' ').slice(1).join(' ');

    if (!link) {
      ctx.reply('Ini adalah fitur downloader video TikTok tanpa watermark. Untuk menggunakan, ketik /tiktokdl dan kirim link TikTok.\n\nContoh: /tiktokdl https://vt.tiktok.com/ZSY1orLBs/');
      return;
    }

    try {
      // Memberikan pesan bahwa video sedang diunduh
      const downloadMessage = await ctx.reply('Tunggu sebentar, video sedang di download...');

      // Memanggil fungsi tiktok2 untuk mendapatkan informasi video TikTok dalam kualitas HD
      const videoInfo = await tiktok2(link);

      if (!videoInfo || !videoInfo.no_watermark) {
        ctx.reply('Tidak dapat menemukan URL video TikTok tanpa watermark.');
        return;
      }

      // Indicate that the bot is uploading a video
      await ctx.sendChatAction('upload_video');
      // Mengirim video TikTok tanpa watermark kepada pengguna
      const sentVideo = await ctx.replyWithVideo({
        url: videoInfo.no_watermark,
        caption: `${videoInfo.title}\n${videoInfo.music}`
      });

      // Mengubah pesan menjadi "Selesai!" setelah video dikirim
      await ctx.telegram.editMessageText(ctx.chat.id, downloadMessage.message_id, null, 'Selesai!');

      // Indicate that the bot is uploading audio
      await ctx.sendChatAction('upload_audio');
      // Mengirim audio TikTok kepada pengguna dengan judul musik dan nama file yang sesuai
      await ctx.replyWithAudio({
        url: videoInfo.music,
        performer: 'TikTok Audio',
        title: videoInfo.music_info.title, // Include the title in the audio message
        filename: `${videoInfo.music_info.title}.mp3` // Menetapkan nama file yang sesuai
      });
    } catch (error) {
      console.error('Error fetching TikTok video:', error);
      ctx.reply('Terjadi kesalahan saat mengambil video TikTok. Mohon coba lagi nanti.');
    }
  });
};