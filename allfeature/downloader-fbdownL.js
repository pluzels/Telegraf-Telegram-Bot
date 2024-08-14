const cheerio = require('cheerio');
const fetch = require('node-fetch');

module.exports = (bot, availableCommands) => {
  const commandName = 'fbdl'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['downloader'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tag downloader

  bot.command(commandName, async (ctx) => {
    const message = ctx.message.text;
    const link = message.split(' ').slice(1).join(' ');

    if (!link) {
      ctx.reply('Ini adalah fitur downloader video Facebook. Untuk menggunakan, ketik /fbdl dan kirim link Facebook.\n\nContoh: /fbdl https://www.facebook.com/username/videos/1234567890/');
      return;
    }

    try {
      // Memberikan pesan bahwa video sedang diunduh
      const downloadMessage = await ctx.reply('Tunggu sebentar, video sedang di download...');

      // Memanggil fungsi fbdown untuk mendapatkan informasi video Facebook
      const videoInfo = await fbdown(link);

      if (!videoInfo || (!videoInfo.sdLink && !videoInfo.hdLink)) {
        ctx.reply('Tidak dapat menemukan URL video Facebook.');
        return;
      }

      // Memilih video berkualitas tinggi jika ada, jika tidak menggunakan video berkualitas standar
      const videoUrl = videoInfo.hdLink || videoInfo.sdLink;

      // Indicate that the bot is uploading a video
      await ctx.sendChatAction('upload_video');

      // Mengirim video Facebook kepada pengguna
      await ctx.replyWithVideo({
        url: videoUrl,
        caption: `Title: ${videoInfo.title}\n${videoInfo.description}`
      });

      // Mengubah pesan menjadi "Selesai!" setelah video dikirim
      await ctx.telegram.editMessageText(ctx.chat.id, downloadMessage.message_id, null, 'Selesai!');
    } catch (error) {
      console.error('Error fetching Facebook video:', error);
      ctx.reply('Terjadi kesalahan saat mengambil video Facebook. Mohon coba lagi nanti.');
    }
  });
};

// Fungsi untuk mendapatkan informasi video Facebook
async function fbdown(url) {
  try {
    const postOptions = {
        method: "POST",
        body: new URLSearchParams({ URLz: url })
      },
      response = await fetch("https://fdown.net/download.php", postOptions),
      html = await response.text(),
      $ = cheerio.load(html);

    return {
      title: $(".lib-row.lib-header").text().trim(),
      description: $(".lib-row.lib-desc").text().trim(),
      sdLink: $("#sdlink").attr("href"),
      hdLink: $("#hdlink").attr("href")
    };
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}