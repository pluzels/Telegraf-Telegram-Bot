const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const axios = require('axios');

module.exports = (bot, availableCommands) => {
  const commandName = 'tomp3'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['tools'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tag 'tools'

  bot.command(commandName, async (ctx) => {
    const reply = ctx.message.reply_to_message;

    if (!reply || !reply.video) {
      ctx.reply('Silakan reply ke video yang ingin diubah ke audio dengan perintah /tomp3.');
      return;
    }

    try {
      // Memberikan pesan bahwa konversi sedang berjalan
      const waitMessage = await ctx.reply('wait a moment...');

      // Mendownload video
      const videoFileId = reply.video.file_id;
      const videoFile = await ctx.telegram.getFileLink(videoFileId);
      const videoPath = path.join(__dirname, 'temp_video.mp4');
      const audioPath = path.join(__dirname, 'temp_audio.mp3');

      const response = await axios({
        url: videoFile.href,
        responseType: 'stream'
      });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(videoPath);
        response.data.pipe(writer);

        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Mengonversi video ke audio
      ffmpeg(videoPath)
        .output(audioPath)
        .on('end', async () => {
          try {
            // Kirim tindakan bot "upload_audio"
            await ctx.sendChatAction('upload_audio');

            // Mengirim audio kepada pengguna
            await ctx.replyWithAudio({ source: audioPath });

            // Mengubah pesan menjadi "success"
            await ctx.telegram.editMessageText(ctx.chat.id, waitMessage.message_id, null, 'success');

            // Menghapus file sementara
            fs.unlinkSync(videoPath);
            fs.unlinkSync(audioPath);
          } catch (err) {
            console.error('Error sending audio or editing message:', err);
            ctx.reply('Terjadi kesalahan saat mengirim audio atau mengedit pesan.');
          }
        })
        .on('error', (err) => {
          console.error('Error converting video to audio:', err);
          ctx.reply('Terjadi kesalahan saat mengonversi video ke audio. Mohon coba lagi nanti.');
        })
        .run();
    } catch (error) {
      console.error('Error processing video:', error);
      ctx.reply('Terjadi kesalahan saat memproses video. Mohon coba lagi nanti.');
    }
  });
};