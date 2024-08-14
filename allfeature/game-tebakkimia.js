const axios = require('axios');

module.exports = (bot, availableCommands) => {
  const commandName = 'tebakkimia'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['game'] });

  let timeout = 10000; // Timeout 1 menit
  let poin = 500; // Poin yang diberikan
  let activeGames = {}; // Objek untuk menyimpan permainan yang sedang aktif
  let src = null;

  bot.command(commandName, async (ctx, next) => {
    const chatId = ctx.chat.id;

    try {
      // Fetch data dari sumber yang diinginkan jika belum ada
      if (!src) {
        const response = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakkimia.json');
        src = response.data;
      }
      const randomQuestion = src[Math.floor(Math.random() * src.length)];

      const questionText = `
Nama unsur dari lambang ${randomQuestion.lambang} adalah...

Timeout ${(timeout / 1000).toFixed(2)} detik
Ketik /tekki untuk bantuan
Bonus: ${poin} XP

Balas pesan ini untuk menjawab
`.trim();

      // Kirim pertanyaan ke pengguna
      await ctx.reply(questionText);

      // Simpan permainan aktif
      activeGames[chatId] = {
        question: randomQuestion,
        points: poin,
        timeoutId: setTimeout(() => {
          ctx.reply(`Waktu habis!\nJawabannya adalah ${randomQuestion.unsur}`);
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

  bot.command('tekki', async (ctx, next) => {
    const chatId = ctx.chat.id;
    const game = activeGames[chatId];

    if (game) {
      const hint = `Bantuan: Huruf pertama dari nama unsur adalah ${game.question.unsur.charAt(0)} `;
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
      if (answer === game.question.unsur.toLowerCase()) {
        ctx.reply(`Benar! Jawabannya adalah ${game.question.unsur}\nKamu mendapatkan ${game.points} XP!`);
        clearTimeout(game.timeoutId);
        delete activeGames[chatId];
      }
    }

    // Meneruskan pesan ke middleware atau penanganan pesan berikutnya
    next();
  });
};