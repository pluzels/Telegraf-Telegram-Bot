const axios = require('axios');
const cheerio = require('cheerio');

function pinterest(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get('https://id.pinterest.com/search/pins/?autologin=true&q=' + query, {
        headers: {
          "cookie": "_auth=1; _b=\"AVna7S1p7l1C5I9u0+nR3YzijpvXOPc6d09SyCzO+DcwpersQH36SmGiYfymBKhZcGg=\"; _pinterest_sess=TWc9PSZHamJOZ0JobUFiSEpSN3Z4a2NsMk9wZ3gxL1NSc2k2NkFLaUw5bVY5cXR5alZHR0gxY2h2MVZDZlNQalNpUUJFRVR5L3NlYy9JZkthekp3bHo5bXFuaFZzVHJFMnkrR3lTbm56U3YvQXBBTW96VUgzVUhuK1Z4VURGKzczUi9hNHdDeTJ5Y2pBTmxhc2owZ2hkSGlDemtUSnYvVXh5dDNkaDN3TjZCTk8ycTdHRHVsOFg2b2NQWCtpOWxqeDNjNkk3cS85MkhhSklSb0hwTnZvZVFyZmJEUllwbG9UVnpCYVNTRzZxOXNJcmduOVc4aURtM3NtRFo3STlmWjJvSjlWTU5ITzg0VUg1NGhOTEZzME9SNFNhVWJRWjRJK3pGMFA4Q3UvcHBnWHdaYXZpa2FUNkx6Z3RNQjEzTFJEOHZoaHRvazc1c1UrYlRuUmdKcDg3ZEY4cjNtZlBLRTRBZjNYK0lPTXZJTzQ5dU8ybDdVS015bWJKT0tjTWYyRlBzclpiamdsNmtpeUZnRjlwVGJXUmdOMXdTUkFHRWloVjBMR0JlTE5YcmhxVHdoNzFHbDZ0YmFHZ1VLQXU1QnpkM1FqUTNMTnhYb3VKeDVGbnhNSkdkNXFSMXQybjRGL3pyZXRLR0ZTc0xHZ0JvbTJCNnAzQzE0cW1WTndIK0trY05HV1gxS09NRktadnFCSDR2YzBoWmRiUGZiWXFQNjcwWmZhaDZQRm1UbzNxc21pV1p5WDlabm1UWGQzanc1SGlrZXB1bDVDWXQvUis3elN2SVFDbm1DSVE5Z0d4YW1sa2hsSkZJb1h0MTFpck5BdDR0d0lZOW1Pa2RDVzNySWpXWmUwOUFhQmFSVUpaOFQ3WlhOQldNMkExeDIvMjZHeXdnNjdMYWdiQUhUSEFBUlhUVTdBMThRRmh1ekJMYWZ2YTJkNlg0cmFCdnU2WEpwcXlPOVZYcGNhNkZDd051S3lGZmo0eHV0ZE42NW8xRm5aRWpoQnNKNnNlSGFad1MzOHNkdWtER0xQTFN5Z3lmRERsZnZWWE5CZEJneVRlMDd2VmNPMjloK0g5eCswZUVJTS9CRkFweHc5RUh6K1JocGN6clc1JmZtL3JhRE1sc0NMTFlpMVErRGtPcllvTGdldz0=; _ir=0"
        }
      });
      const $ = cheerio.load(response.data);
      const result = [];
      const hasil = [];
      $('div > a').each((i, b) => {
        const link = $(b).find('img').attr('src');
        if (link) result.push(link);
      });
      result.forEach(v => {
        hasil.push(v.replace(/236/g, '736'));
      });
      hasil.shift();
      resolve(hasil);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = (bot, availableCommands) => {
  const commandName = 'pinsearch'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['search'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tags: search

  bot.command(commandName, async (ctx, next) => {
    const message = ctx.message.text;
    const commandArgs = message.split(' ').slice(1).join(' ').trim(); // Mengambil argumen dari pesan

    if (!commandArgs) {
      ctx.reply('Silakan masukkan kata kunci pencarian setelah perintah /pinsearch, diikuti dengan jumlah gambar.\n\nContoh: /pinsearch vicidior, 5');
      return;
    }

    const args = commandArgs.split(',').map(arg => arg.trim()); // Memisahkan kata kunci pencarian dan jumlah gambar
    const query = args[0]; // Kata kunci pencarian
    const maxImagesToSend = Math.min(parseInt(args[1]) || 1, 10); // Jumlah gambar yang diinginkan (default: 1 jika tidak disediakan, maksimal 10)

    try {
      // Kirim pesan "Searching...🔎" sebelum melakukan pencarian
      const searchingMessage = await ctx.reply('Searching...🔎');

      // Mengirim permintaan ke fungsi pinterest
      const imageUrls = await pinterest(query);

      if (imageUrls.length > 0) {
        const imagesToSend = imageUrls.slice(0, maxImagesToSend); // Ambil sejumlah maksimal gambar sesuai permintaan pengguna

        // Kirim gambar-gambar ke pengguna
        for (const imageUrl of imagesToSend) {
          await ctx.sendChatAction('upload_photo'); // Indicate that the bot is uploading a photo
          await ctx.replyWithPhoto({ url: imageUrl });
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
        ctx.reply(`Maaf, tidak dapat menemukan gambar Pinterest untuk kata kunci "${query}".`);
      }

      // Meneruskan pesan ke middleware atau penanganan pesan berikutnya
      next();
    } catch (error) {
      console.error('Error fetching Pinterest images:', error);
      ctx.reply('Maaf, terjadi kesalahan saat mencari gambar Pinterest.');
    }
  });
};