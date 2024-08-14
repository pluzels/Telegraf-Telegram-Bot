const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const { config, saveConfig } = require('./addbottoken');
const loadMenu = require('./menu/menu'); // Import the menu module

// Path to the database.json file
const databasePath = path.join(__dirname, 'data/database.json');
const logFilePath = path.join(__dirname, 'data/log.txt');

// Function to load the database
async function loadDatabase() {
  try {
    const data = await fs.promises.readFile(databasePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read database:', error);
    return [];
  }
}

// Function to save the database
async function saveDatabase(database) {
  try {
    await fs.promises.writeFile(databasePath, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Failed to write to database:', error);
  }
}

// Function to log messages to console and log file
function logMessage(message) {
  console.log(message);
  fs.appendFile(logFilePath, message + '\n', (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
}

// Load all features from the 'allfeature' directory
async function loadAllFeatures(bot) {
  const allFeaturesDir = path.join(__dirname, 'allfeature');
  const files = await fs.promises.readdir(allFeaturesDir);

  let availableCommands = [];

  for (const file of files) {
    if (file.endsWith('.js')) {
      const allFeaturePath = path.join(allFeaturesDir, file);
      try {
        const allFeature = require(allFeaturePath);
        await allFeature(bot, availableCommands);
        logMessage(`allfeature ${file} loaded successfully.`);
      } catch (error) {
        logMessage(`Failed to load allfeature ${file}: ${error}`);
      }
    }
  }

  return availableCommands;
}

// Initialize the bot
function initializeBot(name, token) {
  const bot = new Telegraf(token);

  // Log incoming messages
  bot.use(async (ctx, next) => {
    if (ctx.message) {
      // Log message details
      const log = `
        ==========================
        Nama: ${ctx.from.first_name || ''} ${ctx.from.last_name || ''}
        Pengguna: @${ctx.from.username || 'N/A'}
        ID Pengguna: ${ctx.from.id}
        ID Chat: ${ctx.chat.id}
        ID Pesan: ${ctx.message.message_id}
        --------------------------
        Teks: ${ctx.message.text}
        ==========================
      `;
      logMessage(log);

      // Save user to the database if not already present
      const database = await loadDatabase();
      const userExists = database.some(entry => entry.userId === ctx.from.id);

      if (!userExists) {
        const user = {
          username: '@' + (ctx.from.username || 'N/A'),
          userId: ctx.from.id,
          name: (ctx.from.first_name || '') + ' ' + (ctx.from.last_name || '')
        };
        database.push(user);
        await saveDatabase(database);
        logMessage(`User ${ctx.from.id} added to database.`);
      }
    }
    // Process each command in a separate promise to allow concurrent processing
    setImmediate(next);
  });

  // Load all features and handle commands
  loadAllFeatures(bot).then(availableCommands => {

    // Load menu commands from menu.js
    loadMenu(bot, availableCommands);

    // Addbot, listbot, deletebot functions 
    bot.command('addbot', async (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length < 3) {
        return ctx.reply('Silakan masukkan nama dan token bot. Contoh: /addbot <nama> <bot_token>');
      }

      const name = args[1];
      const token = args[2];
      config.bots.push({ name, token });
      saveConfig();

      initializeBot(name, token);
      ctx.reply(`Bot ${name} telah ditambahkan dan dijalankan.`);
    });

    bot.command('listbot', (ctx) => {
      if (config.bots.length === 0) {
        return ctx.reply('Tidak ada bot yang terdaftar.');
      }

      let response = 'Daftar bot:\n';
      config.bots.forEach((bot, index) => {
        response += `${index + 1}. ${bot.name}\n`;
      });

      ctx.reply(response);
    });

    bot.command('deletebot', (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length < 2) {
        return ctx.reply('Silakan masukkan nama bot yang ingin dihapus. Contoh: /deletebot <nama>');
      }

      const name = args[1];
      const botIndex = config.bots.findIndex(bot => bot.name === name);

      if (botIndex === -1) {
        return ctx.reply(`Bot dengan nama ${name} tidak ditemukan.`);
      }

      config.bots.splice(botIndex, 1);
      saveConfig();

      ctx.reply(`Bot ${name} telah dihapus.`);
    });

    // Launch the bot
    bot.launch()
      .then(() => {
        logMessage(`Bot ${name} with token ${token} has started!`);
      })
      .catch(error => {
        logMessage(`Failed to start bot: ${error}`);
      });
  });

  // Handle SIGINT and SIGTERM signals
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// Initialize all bots from the config
config.bots.forEach(bot => initializeBot(bot.name, bot.token));
