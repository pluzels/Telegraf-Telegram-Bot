const axios = require('axios');
const path = require('path');
const fs = require('fs').promises; // Menggunakan versi promise dari fs
const sharp = require('sharp');

module.exports = (bot, availableCommands) => {
  const commandName = 'tosticker'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['tools'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tags: tools

  bot.command(commandName, async (ctx) => {
    const message = ctx.message;

    // Periksa apakah pesan tersebut adalah reply dari foto
    if (message.reply_to_message && message.reply_to_message.photo) {
      const photo = message.reply_to_message.photo.slice(-1)[0];
      const fileId = photo.file_id;

      try {
        const creatingMessage = await ctx.reply('Creating...');

        // Dapatkan link file dari file_id
        const fileLink = await bot.telegram.getFileLink(fileId);

        // Unduh gambar dari link file
        const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);

        // Proses gambar menggunakan sharp untuk mengubahnya menjadi format stiker
        const stickerBuffer = await sharp(imageBuffer)
          .resize(512, 512, {
            fit: 'inside',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .webp({ quality: 100 })
          .toBuffer();

        // Menyimpan buffer sebagai file stiker sementara
        const stickerPath = path.join(__dirname, 'temp_sticker_image.webp');
        await fs.writeFile(stickerPath, stickerBuffer);

        // Kirim gambar yang telah diunggah sebagai stiker
        await ctx.replyWithSticker({ source: stickerPath });

        // Menghapus file stiker setelah dikirim
        await fs.unlink(stickerPath);

        // Edit pesan "Creating..." menjadi "Success!!!"
        await ctx.telegram.editMessageText(ctx.chat.id, creatingMessage.message_id, null, 'Success!!!');
      } catch (error) {
        console.error('Error generating sticker:', error);
        ctx.reply('Terjadi kesalahan saat menghasilkan stiker.');
        await ctx.telegram.editMessageText(ctx.chat.id, creatingMessage.message_id, null, 'Error!!!');
      }
    } else {
      ctx.reply('Silakan balas perintah /sticker pada sebuah foto untuk membuat stiker.');
    }
  });
};