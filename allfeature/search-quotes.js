const quotes = require('../lib/sadquotes');

module.exports = (bot, availableCommands) => {
  const commandName = 'sadquotes'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['search'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tags: search

  bot.command(commandName, async (ctx) => {
    try {
      await sendQuote(ctx);
    } catch (error) {
      console.error('Error in /sadquotes command:', error);
      ctx.reply('Terjadi kesalahan saat mengambil kutipan.');
    }
  });

  bot.action('get_another_quote', async (ctx) => {
    try {
      await ctx.answerCbQuery(); // Acknowledge the button press
      await sendQuote(ctx);
    } catch (error) {
      console.error('Error in get_another_quote action:', error);
      ctx.reply('Terjadi kesalahan saat mengambil kutipan.');
    }
  });

  async function sendQuote(ctx) {
    try {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const quote = quotes[randomIndex];
      const keyboard = {
        inline_keyboard: [
          [{ text: 'Lagi', callback_data: 'get_another_quote' }]
        ]
      };

      // Reply to the user with the quote and button
      await ctx.reply(quote, {
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      ctx.reply('Terjadi kesalahan saat mengambil kutipan.');
    }
  }
};