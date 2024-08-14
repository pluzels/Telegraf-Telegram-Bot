const { generateMenuMessage, generateMenuKeyboard, generateSubMenuCaption } = require('../menu/menuUtils');

module.exports = function(bot, availableCommands) {
  // Handle /menu command
  bot.command('menu', async (ctx) => {
    try {
      const menuMessage = generateMenuMessage();
      const keyboard = generateMenuKeyboard();

      await ctx.replyWithPhoto({ url: 'https://telegra.ph/file/22bc89fca017b007305b1.jpg' }, {
        caption: menuMessage,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error in /menu command:', error);
      ctx.reply('Sorry, an error occurred. Please try again later.');
    }
  });

  // Handle /start command
bot.command('start', async (ctx) => {
  try {
    const keyboard = {
      inline_keyboard: [
        [{ text: 'Menu', callback_data: 'main_menu' }]
      ]
    };

    await ctx.replyWithVideo({ url: 'https://telegra.ph/file/d34b89399630682d3b760.mp4' }, {
      caption: 'Hello! I am a bot here to assist you. Press "Menu" below to see the available features. \n\n Powered By @galihhjs',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error in /start command:', error);
    ctx.reply('Sorry, an error occurred. Please try again later.');
  }
});

  // Handle submenu actions
  bot.action(/^menu_(.*)$/, async (ctx) => {
    const menuType = ctx.match[1];
    try {
      await ctx.answerCbQuery();
      const caption = generateSubMenuCaption(menuType, availableCommands);

      await ctx.editMessageCaption(caption, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Back', callback_data: 'main_menu' }]]
        }
      });
    } catch (error) {
      console.error(`Error in ${menuType} menu action:`, error);
      ctx.reply('Sorry, an error occurred. Please try again later.');
    }
  });

  // Handle back to main menu
  bot.action('main_menu', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const menuMessage = generateMenuMessage();
      const keyboard = generateMenuKeyboard();
      await ctx.editMessageCaption(menuMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } catch (error) {
      console.error('Error in main_menu action:', error);
      ctx.reply('Sorry, an error occurred. Please try again later.');
    }
  });

  // Handle the "Game" button action
  bot.action('menu_game', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const caption = generateSubMenuCaption('game', availableCommands);

      await ctx.editMessageCaption(caption, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Back', callback_data: 'main_menu' }]]
        }
      });
    } catch (error) {
      console.error('Error in menu_game action:', error);
      ctx.reply('Sorry, an error occurred. Please try again later.');
    }
  });

  // Handle the "AI" button action
  bot.action('menu_ai', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const caption = generateSubMenuCaption('ai', availableCommands);

      await ctx.editMessageCaption(caption, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Back', callback_data: 'main_menu' }]]
        }
      });
    } catch (error) {
      console.error('Error in menu_ai action:', error);
      ctx.reply('Sorry, an error occurred. Please try again later.');
    }
  });

  // Handle the "Downloader" button action
  bot.action('menu_downloader', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const caption = generateSubMenuCaption('downloader', availableCommands);

      await ctx.editMessageCaption(caption, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Back', callback_data: 'main_menu' }]]
        }
      });
    } catch (error) {
      console.error('Error in menu_downloader action:', error);
      ctx.reply('Sorry, an error occurred. Please try again later.');
    }
  });

  // Handle the "Search" button action
  bot.action('menu_search', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const caption = generateSubMenuCaption('search', availableCommands);

      await ctx.editMessageCaption(caption, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Back', callback_data: 'main_menu' }]]
        }
      });
    } catch (error) {
      console.error('Error in menu_search action:', error);
      ctx.reply('Sorry, an error occurred. Please try again later.');
    }
  });

  // Handle the "Tools" button action
  bot.action('menu_tools', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const caption = generateSubMenuCaption('tools', availableCommands);

      await ctx.editMessageCaption(caption, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Back', callback_data: 'main_menu' }]]
        }
      });
    } catch (error) {
      console.error('Error in menu_tools action:', error);
      ctx.reply('Sorry, an error occurred. Please try again later.');
    }
  });
};