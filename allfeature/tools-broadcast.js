const fs = require('fs');

module.exports = (bot, availableCommands) => {
  const commandName = 'broadcast'; // Nama command untuk pendaftaran
  availableCommands.push({ command: commandName, tags: ['tools'] });

  // Path ke database.json
  const databasePath = 'data/database.json';

  // Load database.json
  let rawData = fs.readFileSync(databasePath);
  let users = JSON.parse(rawData);

  // ID owner
  const ownerId = 1731783140; // Ganti dengan ID owner yang sesuai

  // Handle the /broadcast command
  bot.command(commandName, (ctx) => {
    // Cek apakah user adalah owner
    if (ctx.from.id !== ownerId) {
      ctx.reply('Anda tidak bisa mengakses fitur ini.');
      return;
    }

    if (!ctx.message.reply_to_message) {
      ctx.reply('Tidak ada pesan yang di-reply. Harap reply ke sebuah pesan untuk broadcast.');
      return;
    }

    const broadcastMessage = ctx.message.reply_to_message.text;

    // Kirim pesan broadcast ke semua user
    users.forEach(user => {
      bot.telegram.sendMessage(user.userId, broadcastMessage)
        .then(() => {
          console.log(`Pesan terkirim ke user ID: ${user.userId}`);
        })
        .catch(error => {
          console.error(`Gagal mengirim pesan ke user ID: ${user.userId}`, error);
        });
    });

    ctx.reply('Pesan broadcast terkirim ke semua user.');
  });
};