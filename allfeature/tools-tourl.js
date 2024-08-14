const fetch = require('node-fetch');
const uploadFile = require('../lib/uploadFile');
const uploadImage = require('../lib/uploadImage');

module.exports = (bot, availableCommands) => {
  const commandName = 'tourl'; // Name of the command to be registered
  availableCommands.push({ command: commandName, tags: ['tools'] }); // Add commandName to the list of availableCommands with tag 'tools'

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  bot.command(commandName, async (ctx) => {
    // Check if the command is replying to a message
    if (!ctx.message.reply_to_message) {
      ctx.reply('Silakan balas perintah ini ke media (gambar/video/dokumen) yang ingin Anda jadikan URL.');
      return;
    }

    // Determine the type of media and get the file ID
    let fileId;
    let fileType;
    if (ctx.message.reply_to_message.photo) {
      fileId = ctx.message.reply_to_message.photo[ctx.message.reply_to_message.photo.length - 1].file_id;
      fileType = 'photo';
    } else if (ctx.message.reply_to_message.video) {
      fileId = ctx.message.reply_to_message.video.file_id;
      fileType = 'video';
    } else if (ctx.message.reply_to_message.document) {
      fileId = ctx.message.reply_to_message.document.file_id;
      fileType = 'document';
    } else {
      ctx.reply('Tidak ada media yang ditemukan dalam balasan pesan ini.');
      return;
    }

    try {
      // Get the file link
      const fileLink = await ctx.telegram.getFileLink(fileId);

      // Fetch the file as a buffer and check the file size
      const response = await fetch(fileLink);
      const buffer = await response.buffer();

      // Check file size
      if (buffer.length > MAX_FILE_SIZE && (fileType === 'photo' || fileType === 'video')) {
        ctx.reply('File terlalu besar. Ukuran maksimum untuk gambar dan video adalah 5MB.');
        return;
      }

      // Upload the file based on the type of media
      let fileUrl;
      if (fileType === 'photo' || fileType === 'video') {
        // If it's a photo or video, use uploadImage
        fileUrl = await uploadImage(buffer);
      } else {
        // If it's a document, use uploadFile
        fileUrl = await uploadFile(buffer);
      }

      // Send the URL to the user
      ctx.reply(`Media berhasil diunggah! URL: ${fileUrl}`);
    } catch (error) {
      console.error('Error processing the media:', error);
      ctx.reply('Maaf, terjadi kesalahan saat memproses media.');
    }
  });
};