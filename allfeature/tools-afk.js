module.exports = (bot, availableCommands) => {
  const commandName = 'afk'; // Command name to be registered
  availableCommands.push({ command: commandName, tags: ['tools'] });

  // Object to store AFK status and time for each user
  const afkUsers = {};

  // Handle the /afk command
  bot.command(commandName, (ctx) => {
    const message = ctx.message.text;
    const reason = message.split(' ').slice(1).join(' ');

    if (!reason) {
      ctx.reply('Please provide a reason for going AFK. Example: /afk tidur');
      return;
    }

    // Ensure the message has the 'from' property
    if (!ctx.message || !ctx.message.from) {
      ctx.reply('An error occurred. Could not retrieve user information.');
      return;
    }

    // Set the AFK status for the user
    const userId = ctx.message.from.id;
    const username = ctx.message.from.username || ctx.message.from.first_name || 'Unknown';
    afkUsers[userId] = {
      reason: reason,
      startTime: new Date(),
      username: username,
    };

    ctx.reply(`@${username} is now AFK: ${reason}`);
  });

  // Middleware to check if the user was AFK and calculate the AFK duration
  bot.use((ctx, next) => {
    // Ensure the message has the 'from' property
    if (!ctx.message || !ctx.message.from) {
      return next();
    }

    const userId = ctx.message.from.id;

    // Check if the user is returning from AFK
    if (afkUsers[userId]) {
      const afkInfo = afkUsers[userId];
      const startTime = afkInfo.startTime;
      const endTime = new Date();

      // Calculate the AFK duration
      const durationMs = endTime - startTime;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

      const durationStr = `Hours: ${hours}\nMinutes: ${minutes}\nSeconds: ${seconds}`;

      // Send the AFK duration message with user mention
      ctx.reply(`@${afkInfo.username} is back!\n\nThey were AFK for:\n${durationStr}\nReason: ${afkInfo.reason}`);

      // Remove the AFK status
      delete afkUsers[userId];
    }

    return next();
  });
};