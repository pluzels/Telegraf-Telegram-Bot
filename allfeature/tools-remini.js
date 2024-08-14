const fetch = require('node-fetch');
const uploadImage = require('../lib/uploadImage');

module.exports = (bot, availableCommands) => {
  const commandName = 'remini'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['tools'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tags: tools

  bot.command(commandName, async (ctx) => {
    // Kirim "upload_photo" action saat sedang mengunggah foto
    await ctx.sendChatAction("upload_photo");

    // Check if the command is replying to a message
    if (!ctx.message.reply_to_message) {
      ctx.reply('Silakan balas perintah ini ke gambar yang ingin Anda perjelas.');
      return;
    }

    // Get the file ID of the image
    const fileId = ctx.message.reply_to_message.photo ? ctx.message.reply_to_message.photo[ctx.message.reply_to_message.photo.length - 1].file_id : null;

    if (!fileId) {
      ctx.reply('Tidak ada gambar yang ditemukan dalam balasan pesan ini.');
      return;
    }

    try {
      // Send waiting message
      const waitMessage = await ctx.reply("Waittt I processed this image, this doesn't take a long time⌛");

      // Get the file link
      const fileLink = await ctx.telegram.getFileLink(fileId);

      // Fetch the file as a buffer
      const response = await fetch(fileLink);
      const buffer = await response.buffer();

      // Upload the original image to Telegra.ph to get a URL
      const originalImageUrl = await uploadImage(buffer);

      // Enhance the image using the upscale API with the image URL
      const enhanceResponse = await fetch(`https://skizo.tech/api/remini?apikey=galzrich&url=${encodeURIComponent(originalImageUrl)}`);

      if (!enhanceResponse.ok) {
        throw new Error('Failed to enhance the image');
      }

      // Fetch the enhanced image as a buffer
      const enhancedBuffer = await enhanceResponse.buffer();

      // Send the enhanced image to the user
      await ctx.sendChatAction('upload_photo');
      await ctx.replyWithPhoto({ source: enhancedBuffer }, { caption: 'I hope you are happy when you see this picture :3' });

      // Edit the waiting message to show completion
      await ctx.telegram.editMessageText(ctx.chat.id, waitMessage.message_id, null, "DONEEEEE!!!! I HOPE U HAPPY WITH THIS IMAGE😤");
    } catch (error) {
      console.error('Error processing the image:', error);
      ctx.reply('Maaf, terjadi kesalahan saat memproses gambar.');
    }
  });
};