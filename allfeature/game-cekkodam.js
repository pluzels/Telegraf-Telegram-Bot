const khodamNames = require('../lib/listkhodam.js');

module.exports = (bot, availableCommands) => {
  const commandName = 'cekkodam';
  availableCommands.push({ command: commandName, tags: ['game'] });

  const buttonLimit = 14;
  const userPressCount = {};

  bot.command(commandName, async (ctx) => {
    try {
      const userId = ctx.message.from.id;
      const userName = ctx.message.from.first_name || ctx.message.from.username || 'Pengguna';
      const commandText = ctx.message.text.split(' ');
      let name = 'Pengguna';
      if (commandText.length > 1) {
        name = commandText.slice(1).join(' ');
      }

      if (!userPressCount[userId]) {
        userPressCount[userId] = 0;
      }

      const randomIndex = Math.floor(Math.random() * khodamNames.length);
      const khodamName = khodamNames[randomIndex];

      const message = `
Hasil cek kodam untuk ${name}:

Nama: [${userName}](tg://user?id=${userId})
Khodam: ${khodamName}
      `;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "Cek lagi", callback_data: `cekkodam_again_${userId}` }
          ]
        ]
      };

      await ctx.replyWithMarkdown(message, {
        reply_markup: inlineKeyboard
      });
    } catch (error) {
      console.error('Error in cekkodam command:', error);
      ctx.reply('Maaf, terjadi kesalahan. Silakan coba lagi nanti.');
    }
  });

  bot.action(/^cekkodam_again_\d+$/, async (ctx) => {
    try {
      const data = ctx.callbackQuery.data;
      const userId = ctx.callbackQuery.from.id;
      const callbackUserId = parseInt(data.split('_')[2]);

      if (callbackUserId !== userId) {
        return ctx.answerCbQuery('Anda tidak dapat menekan tombol ini.');
      }

      if (!userPressCount[userId]) {
        userPressCount[userId] = 0;
      }

      userPressCount[userId]++;

      const userName = ctx.callbackQuery.from.first_name || ctx.callbackQuery.from.username || 'Pengguna';
      const commandText = ctx.callbackQuery.message.text.split('\n');
      let name = 'Pengguna';
      if (commandText.length > 1) {
        name = commandText.slice(1).join(' ').split(':')[1].trim();
      }

      const randomIndex = Math.floor(Math.random() * khodamNames.length);
      const khodamName = khodamNames[randomIndex];

      const message = `
Hasil cek kodam untuk ${name}:

Nama: [${userName}](tg://user?id=${userId})
Khodam: ${khodamName}
      `;

      if (userPressCount[userId] >= buttonLimit) {
        await ctx.editMessageText(`${message}\n\nAnda telah mencapai batas cek kodam. Ketik /cekkodam <nama> untuk cek lagi.`, {
          parse_mode: 'Markdown'
        });
      } else {
        await ctx.editMessageText(message, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Cek lagi", callback_data: `cekkodam_again_${userId}` }
              ]
            ]
          }
        });
      }

      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Error in cekkodam callback_query:', error);
      ctx.reply('Maaf, terjadi kesalahan. Silakan coba lagi nanti.');
    }
  });
};