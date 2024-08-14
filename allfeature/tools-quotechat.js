const axios = require('axios');
const path = require('path');
const fs = require('fs').promises; // Menggunakan versi promise dari fs

module.exports = (bot, availableCommands) => {
  const commandName = 'quotechat'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['tools'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tags: tools

  bot.command(commandName, async (ctx) => {
    const message = ctx.message.text;
    const args = message.split(' ').slice(1); // Mengambil argumen setelah command
    const text = args.join(' ').trim(); // Mengambil teks quote dari pesan

    if (!text) {
      ctx.reply('Silakan masukkan teks setelah perintah /quote.\n\nContoh: /quote Ini adalah contoh quote.');
      return;
    }

    const name = ctx.from.first_name || 'User'; // Nama pengirim
    const userId = ctx.from.id; // ID pengirim
    const avatarUrl = await getUserAvatarUrl(bot, userId); // Mendapatkan URL foto profil pengguna

    // Kirim pesan "Creating..." sebelum memulai pembuatan quote
    const creatingMessage = await ctx.reply('Creating...');

    try {
      // Menghasilkan gambar quote menggunakan API
      const imageBuffer = await generateQuoteImage(text, name, avatarUrl);

      // Menyimpan buffer sebagai file gambar sementara
      const imagePath = path.join(__dirname, 'temp_quote_image.webp');
      await fs.writeFile(imagePath, imageBuffer);

      // Kirim gambar yang telah diunggah sebagai stiker
      await ctx.replyWithSticker({ source: imagePath });

      // Menghapus file gambar setelah dikirim
      await fs.unlink(imagePath);

      // Edit pesan "Creating..." menjadi "Success!!!"
      await ctx.telegram.editMessageText(ctx.chat.id, creatingMessage.message_id, null, 'Success!!!');
    } catch (error) {
      console.error('Error generating quote:', error);
      ctx.reply('Terjadi kesalahan saat menghasilkan quote.');

      // Jika terjadi kesalahan, edit pesan "Creating..." menjadi "Error!!!"
      await ctx.telegram.editMessageText(ctx.chat.id, creatingMessage.message_id, null, 'Error!!!');
    }
  });
};

// Fungsi untuk mendapatkan URL foto profil pengguna dari Telegram API
async function getUserAvatarUrl(bot, userId) {
  try {
    // Mendapatkan foto profil pengguna dari Telegram API
    const userProfilePhotos = await bot.telegram.getUserProfilePhotos(userId);

    // Mengambil URL foto profil terbaru (paling besar)
    if (userProfilePhotos && userProfilePhotos.photos.length > 0) {
      const photo = userProfilePhotos.photos[0].slice(-1)[0];
      return await bot.telegram.getFileLink(photo.file_id);
    }
  } catch (error) {
    console.error('Error fetching user avatar:', error);
  }
  
  // Mengembalikan default URL avatar jika tidak ada foto profil
  return 'https://i.ibb.co/2WzLyGk/profile.jpg';
}

// Fungsi untuk menghasilkan gambar quote menggunakan API
async function generateQuoteImage(text, name, url) {
  let body = {
    "type": "quote",
    "format": "webp", // Mengubah format ke webp
    "backgroundColor": "#FFFFFF", // Warna latar belakang putih
    "width": 480,
    "height": 480,
    "scale": 2,
    "messages": [{
      "avatar": true,
      "from": {
        "first_name": name,
        "language_code": "en",
        "name": name,
        "photo": {
          "url": url
        }
      },
      "text": text,
      "replyMessage": {}
    }]
  };

  let res = await axios.post('https://bot.lyo.su/quote/generate', body);
  return Buffer.from(res.data.result.image, "base64");
}