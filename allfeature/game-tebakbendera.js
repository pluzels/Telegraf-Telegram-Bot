const axios = require('axios');

module.exports = (bot, availableCommands) => {
  const commandName = 'tebakbendera'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['game'] });

  let timeout = 20000; // Timeout 6 detik
  let poin = 1000; // Poin yang diberikan
  let tiketcoin = 1; // TiketCoin yang diberikan
  let activeGames = {}; // Objek untuk menyimpan permainan yang sedang aktif
  let src = null;

  bot.command(commandName, async (ctx, next) => {
    const chatId = ctx.chat.id;

    try {
      // Fetch data dari sumber yang diinginkan jika belum ada
      if (!src) {
        const response = await axios.get('https://raw.githubusercontent.com/qisyana/scrape/main/flag.json');
        src = response.data;
      }
      const randomQuestion = src[Math.floor(Math.random() * src.length)];

      const questionText = `
Timeout ${(timeout / 1000).toFixed(2)} detik
Ketik /tekbe untuk bantuan
Bonus: ${poin} XP
Tiketcoin: ${tiketcoin} TiketCoin

Balas pesan ini untuk menjawab
`.trim();

      // Indicate that the bot is uploading a photo
      await ctx.sendChatAction('upload_photo');

      // Kirim pertanyaan ke pengguna bersama gambar
      await ctx.replyWithPhoto({ url: randomQuestion.img }, { caption: questionText });

      // Simpan permainan aktif
      activeGames[chatId] = {
        question: randomQuestion,
        points: poin,
        tiketcoin: tiketcoin,
        timeoutId: setTimeout(() => {
          ctx.reply(`Waktu habis!\nJawabannya adalah ${randomQuestion.name}`);
          delete activeGames[chatId];
        }, timeout)
      };

      // Meneruskan pesan ke middleware atau penanganan pesan berikutnya
      next();

    } catch (error) {
      console.error('Error fetching quiz data:', error);
      ctx.reply('Terjadi kesalahan saat mengambil data soal. Coba lagi nanti.');
    }
  });

  bot.command('tekbe', async (ctx, next) => {
    const chatId = ctx.chat.id;
    const game = activeGames[chatId];

    if (game) {
      const hint = `Bantuan: Huruf pertama dari nama negara adalah ${game.question.name.charAt(0)} `;
      ctx.reply(hint);
    } else {
      ctx.reply('Tidak ada permainan aktif di chat ini.');
    }

    // Meneruskan pesan ke middleware atau penanganan pesan berikutnya
    next();
  });

  bot.on('text', async (ctx, next) => {
    const chatId = ctx.chat.id;
    const game = activeGames[chatId];

    // Cek apakah pesan adalah perintah, jika ya, abaikan permainan dan lanjutkan dengan perintah
    if (ctx.message.text.startsWith('/')) {
      next(); // Meneruskan pesan ke middleware atau penanganan pesan berikutnya
      return;
    }

    if (game) {
      const answer = ctx.message.text.trim().toLowerCase();
      if (answer === game.question.name.toLowerCase()) {
        ctx.reply(`Benar! Jawabannya adalah ${game.question.name}\nKamu mendapatkan ${game.points} XP dan ${game.tiketcoin} TiketCoin!`);
        clearTimeout(game.timeoutId);
        delete activeGames[chatId];
      }
    }

    // Meneruskan pesan ke middleware atau penanganan pesan berikutnya
    next();
  });
};