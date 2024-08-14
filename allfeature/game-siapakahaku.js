const axios = require('axios');
const similarity = require('similarity');
const threshold = 0.72;

module.exports = (bot, availableCommands) => {
  const commandName = 'siapakahaku'; // Command name for registration
  availableCommands.push({ command: commandName, tags: ['game'] });

  let timeout = 60000; // 3 minutes timeout
  let poin = 500; // Points awarded
  let tiketcoin = 1; // Ticket coin awarded
  let activeGames = {}; // Object to store active games
  let src = null;

  bot.command(commandName, async (ctx, next) => {
    const chatId = ctx.chat.id;

    if (chatId in activeGames) {
      ctx.reply('Masih ada soal belum terjawab di chat ini', activeGames[chatId].message);
      return;
    }

    try {
      // Fetch data if not already fetched
      if (!src) {
        const response = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/siapakahaku.json');
        src = response.data;
      }
      const randomQuestion = src[Math.floor(Math.random() * src.length)];

      const questionText = `
Siapakah aku? ${randomQuestion.soal}

Timeout ${(timeout / 1000).toFixed(2)} detik
Ketik /who untuk bantuan
Bonus: ${poin} XP 
TiketCoin: ${tiketcoin} Tiketcoin
`.trim();

      // Send question to the user
      const sentMessage = await ctx.reply(questionText);

      // Store active game
      activeGames[chatId] = {
        message: sentMessage,
        question: randomQuestion,
        points: poin,
        timeoutId: setTimeout(() => {
          if (activeGames[chatId]) {
            ctx.replyWithMarkdown(`Waktu habis!\nJawabannya adalah ${randomQuestion.jawaban}`, {
              reply_markup: {
                inline_keyboard: [[{ text: "Lagi", callback_data: 'play_again' }]]
              }
            });
            delete activeGames[chatId];
          }
        }, timeout)
      };

    } catch (error) {
      console.error('Error fetching quiz data:', error);
      ctx.reply('Terjadi kesalahan saat mengambil data soal. Coba lagi nanti.');
    }

    // Pass to the next middleware or message handler
    next();
  });

  bot.command('who', async (ctx, next) => {
    const chatId = ctx.chat.id;
    const game = activeGames[chatId];

    if (game) {
      const answer = game.question.jawaban;
      const clue = answer.replace(/[bcdfghjklmnpqrstvwxyz]/g, '_');
      ctx.reply('' + clue + '');
    } else {
      ctx.reply('Tidak ada permainan aktif di chat ini.');
    }

    // Pass to the next middleware or message handler
    next();
  });

  bot.on('text', async (ctx, next) => {
    const chatId = ctx.chat.id;
    const game = activeGames[chatId];

    // Ignore if the message is a command
    if (ctx.message.text.startsWith('/')) {
      next(); // Pass to the next middleware or message handler
      return;
    }

    if (game) {
      const answer = ctx.message.text.trim().toLowerCase();
      const correctAnswer = game.question.jawaban.toLowerCase().trim();

      if (answer === correctAnswer) {
        ctx.replyWithMarkdown(`Benar!\n+${game.points} XP\n+${tiketcoin} Tiketcoin`, {
          reply_markup: {
            inline_keyboard: [[{ text: "Lagi", callback_data: 'play_again' }]]
          }
        });
        clearTimeout(game.timeoutId);
        delete activeGames[chatId];
      } else if (similarity(answer, correctAnswer) >= threshold) {
        ctx.reply(`Dikit Lagi!`);
      } else {
        ctx.reply(`Salah!`);
      }
    }

    // Pass to the next middleware or message handler
    next();
  });

  bot.action('play_again', async (ctx) => {
    const chatId = ctx.chat.id;

    if (chatId in activeGames) {
      ctx.answerCbQuery('Masih ada soal belum terjawab di chat ini', true);
      return;
    }

    try {
      // Fetch data if not already fetched
      if (!src) {
        const response = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/siapakahaku.json');
        src = response.data;
      }
      const randomQuestion = src[Math.floor(Math.random() * src.length)];

      const questionText = `
Siapakah aku? ${randomQuestion.soal}

Timeout ${(timeout / 1000).toFixed(2)} detik
Ketik /who untuk bantuan
Bonus: ${poin} XP 
TiketCoin: ${tiketcoin} Tiketcoin
`.trim();

      // Send question to the user
      const sentMessage = await ctx.reply(questionText);

      // Store active game
      activeGames[chatId] = {
        message: sentMessage,
        question: randomQuestion,
        points: poin,
        timeoutId: setTimeout(() => {
          if (activeGames[chatId]) {
            ctx.replyWithMarkdown(`Waktu habis!\nJawabannya adalah ${randomQuestion.jawaban}`, {
              reply_markup: {
                inline_keyboard: [[{ text: "Lagi", callback_data: 'play_again' }]]
              }
            });
            delete activeGames[chatId];
          }
        }, timeout)
      };

      ctx.answerCbQuery();

    } catch (error) {
      console.error('Error fetching quiz data:', error);
      ctx.reply('Terjadi kesalahan saat mengambil data soal. Coba lagi nanti.');
      ctx.answerCbQuery('Terjadi kesalahan saat mengambil data soal. Coba lagi nanti.');
    }
  });
};