function generateMenuMessage() {
  return 'Hello! I am a Telegram bot developed by @galihhjs, ready to assist you. Please choose a category:';
}

// Generate menu keyboard
function generateMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Game 🎮', callback_data: 'menu_game' }, { text: 'AI 🤖', callback_data: 'menu_ai' }],
      [{ text: 'Downloader 📁', callback_data: 'menu_downloader' }, { text: 'Search 🔎', callback_data: 'menu_search' }],
      [{ text: 'Tools 🔧', callback_data: 'menu_tools' }]
    ]
  };
}

// Generate submenu keyboard
function generateSubMenuKeyboard(tag, availableCommands) {
  const commandsWithTag = availableCommands
    .filter(cmd => cmd.tags && cmd.tags.includes(tag));
  const buttons = commandsWithTag.map(cmd => [{ text: `/${cmd.command}`, callback_data: `run_${cmd.command}` }]);
  buttons.push([{ text: 'Back 🔃', callback_data: 'main_menu' }]); // Add back button to return to main menu
  return { inline_keyboard: buttons };
}

// Capitalize the first letter of the tag
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Generate submenu caption
function generateSubMenuCaption(tag, availableCommands) {
  const commandsWithTag = availableCommands
    .filter(cmd => cmd.tags && cmd.tags.includes(tag));
  
  const capitalizedTag = capitalizeFirstLetter(tag);
  
  let caption = `*Here are the commands for the ${capitalizedTag} menu:*\n\n`;
  caption += ` –   ${capitalizedTag} Commands\n`;
  caption += `┌  ◦  /${commandsWithTag[0].command}\n`;
  
  commandsWithTag.slice(1, -1).forEach(cmd => {
    caption += `│  ◦  /${cmd.command}\n`;
  });
  
  if (commandsWithTag.length > 1) {
    caption += `└  ◦  /${commandsWithTag[commandsWithTag.length - 1].command}\n`;
  }

  caption += ` –   End of ${capitalizedTag} Commands\n\n`;
  
  return caption;
}

module.exports = {
  generateMenuMessage,
  generateMenuKeyboard,
  generateSubMenuKeyboard,
  generateSubMenuCaption
};