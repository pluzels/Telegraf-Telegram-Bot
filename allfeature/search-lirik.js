const fetch = require('node-fetch');

module.exports = (bot, availableCommands) => {
  const commandName = 'lirik'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['search'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tags: search

  bot.command(commandName, async (ctx) => {
    const message = ctx.message.text;
    const query = message.split(' ').slice(1).join(' ').trim(); // Ambil judul lagu dari pesan

    if (!query) {
      ctx.reply('Silakan masukkan judul lagu setelah perintah /lirik. Contoh: /lirik nama lagu');
      return;
    }

    try {
      // Kirim permintaan ke API untuk mencari lirik lagu
      const response = await fetch(`https://some-random-api.com/others/lyrics?title=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data && data.lyrics && data.thumbnail && data.thumbnail.genius && data.title && data.author) {
        const lyrics = data.lyrics;
        const thumbnailUrl = data.thumbnail.genius;
        const title = data.title;
        const author = data.author;

        // Pisahkan lirik berdasarkan dua baris baru
        const lyricParagraphs = lyrics.split('\n\n');

        // Kirim foto bersama dengan caption yang berisi judul, pengarang, dan paragraf pertama dari lirik
        const firstCaption = `*${title}* by *${author}*\n\n${lyricParagraphs[0]}`;
        await ctx.replyWithPhoto({ url: thumbnailUrl }, { caption: firstCaption, parse_mode: 'Markdown' });

        // Kirim paragraf lirik yang tersisa
        for (let i = 1; i < lyricParagraphs.length; i++) {
          await ctx.reply(lyricParagraphs[i]);
        }
      } else {
        ctx.reply(`Maaf, lirik lagu "${query}" tidak ditemukan.`);
      }
    } catch (error) {
      console.error('Error fetching song lyrics:', error);
      ctx.reply('Terjadi kesalahan saat mencari lirik lagu.');
    }
  });
};