const axios = require('axios'); // Menggunakan Axios untuk melakukan request ke API

module.exports = (bot, availableCommands) => {
  const commandName = 'instadl'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['downloader'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tag downloader

  bot.command(commandName, async (ctx) => {
    const message = ctx.message.text;
    const link = message.split(' ').slice(1).join(' ');

    if (!link) {
      ctx.reply('Ini adalah fitur downloader konten Instagram. Untuk menggunakan, ketik /instadl dan kirim link Instagram.\n\nContoh: /instadl https://www.instagram.com/p/xxxxxxx/');
      return;
    }

    if (!/^https?:\/\/(www\.)?instagram\.com\/(?:p|tv|reel)\//i.test(link)) {
      ctx.reply('URL yang diberikan bukan URL Instagram.');
      return;
    }

    try {
      // Memberikan pesan bahwa konten sedang diunduh
      const downloadMessage = await ctx.reply('Tunggu sebentar, konten sedang di download...');

      // Memanggil API untuk mendapatkan informasi konten Instagram
      const { data } = await axios.post("https://allvideodownloader.cc/wp-json/aio-dl/video-data/", { url: link });

      // Menampilkan response body pada console
      console.log(data);

      // Proses konten yang diunduh
      const medias = data.medias;

      if (medias && medias.length > 0) {
        for (let i = 0; i < medias.length; i++) {
          const media = medias[i];
          const url = media.url;
          const extension = media.extension; // Mendapatkan ekstensi file dari response

          if (extension === 'mp4') {
            // Mengirim tindakan mengunggah video
            await ctx.sendChatAction('upload_video');
            
            // Mengirim video Instagram kepada pengguna
            await ctx.replyWithVideo({
              url: url,
              caption: `Video ${i + 1}/${medias.length}`
            });
          } else if (extension === 'jpg' || extension === 'jpeg') {
            // Mengirim tindakan mengunggah foto
            await ctx.sendChatAction('upload_photo');
            
            // Mengirim foto Instagram kepada pengguna
            await ctx.replyWithPhoto({
              url: url,
              caption: `Foto ${i + 1}/${medias.length}`
            });
          } else {
            // Jika format tidak dikenali
            ctx.reply(`Format file ${extension} tidak dikenali.`);
          }
        }
        // Mengubah pesan menjadi "Selesai!" setelah semua konten dikirim
        await ctx.telegram.editMessageText(ctx.chat.id, downloadMessage.message_id, null, 'Selesai!');
      } else {
        ctx.reply('Maaf, tidak ada media yang ditemukan.');
      }
    } catch (error) {
      console.error('Error fetching Instagram content:', error);
      ctx.reply('Terjadi kesalahan saat mengambil konten Instagram. Mohon coba lagi nanti.');
    }
  });
};