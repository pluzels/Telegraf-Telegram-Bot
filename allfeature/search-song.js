const axios = require('axios');

// In-memory store for session data
const sessionStore = {};

module.exports = (bot, availableCommands) => {
  const commandName = 'song'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['search'] });

  async function spotifydl(url) {
    try {
      const res = await axios.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`);
      const data = res.data.result;
      const downloadRes = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${data.gid}/${data.id}`);
      return {
        download: `https://api.fabdl.com${downloadRes.data.result.download_url}`,
      };
    } catch (error) {
      console.error('Error downloading from Spotify:', error);
      throw 'An error occurred while downloading the song from Spotify.';
    }
  }

  async function searchSpotify(query) {
    try {
      const access_token = await getAccessToken();
      const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data.tracks.items.map((item, index) => ({
        index: index + 1,
        name: item.name,
        artists: item.artists.map(artist => artist.name).join(', '),
        popularity: item.popularity,
        link: item.external_urls.spotify,
        image: item.album.images[0].url,
        duration_ms: item.duration_ms,
      }));
    } catch (error) {
      console.error('Error searching Spotify:', error);
      throw 'An error occurred while searching for songs on Spotify.';
    }
  }

  async function getAccessToken() {
    try {
      const client_id = 'acc6302297e040aeb6e4ac1fbdfd62c3';
      const client_secret = '0e8439a1280a43aba9a5bc0a16f3f009';
      const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
      const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw 'An error occurred while obtaining Spotify access token.';
    }
  }

  bot.command(commandName, async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (!query) {
      return ctx.reply('Please provide a song name or artist.');
    }

    try {
      const results = await searchSpotify(query);
      if (results.length === 0) {
        return ctx.reply('No results found.');
      }

      sessionStore[ctx.from.id] = {
        results,
        buttonPressCount: 0,
        messageId: null
      };

      const resultText = results.map(result => `${result.index}. ${result.name} by ${result.artists}`).join('\n');
      const buttons = results.map(result => ({ text: result.index.toString(), callback_data: `select_${result.index}` }));

      const keyboard = [];
      if (buttons.length > 5) {
        keyboard.push(buttons.slice(0, 5));
        keyboard.push(buttons.slice(5));
      } else {
        keyboard.push(buttons);
      }

      const message = await ctx.replyWithPhoto({ url: 'https://telegra.ph/file/4c33484511c7b019a22cd.jpg' }, {
        caption: `MAKASII YA UDA MAKE FITUR INII :3\n\nBERIKUT ADALAH HASIL PENCARIAN KAMUUU:\n\n${resultText}\n\nPOWERED BY https://api.spotify.com`,
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });

      sessionStore[ctx.from.id].messageId = message.message_id;

    } catch (error) {
      ctx.reply(error.toString());
    }
  });

  bot.action(/^select_\d+$/, async (callbackCtx) => {
    const userId = callbackCtx.from.id;
    const selection = parseInt(callbackCtx.callbackQuery.data.split('_')[1]);
    const userSession = sessionStore[userId];

    if (!userSession || isNaN(selection) || selection < 1 || selection > userSession.results.length) {
      return callbackCtx.answerCbQuery('Invalid selection.');
    }

    userSession.buttonPressCount++;

    if (userSession.buttonPressCount >= 10) {
      try {
        await bot.telegram.deleteMessage(callbackCtx.chat.id, userSession.messageId);
        delete sessionStore[userId];
        return callbackCtx.answerCbQuery('Button press limit reached, message deleted.');
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }

    const selectedSong = userSession.results[selection - 1];
    try {
      const downloadLink = await spotifydl(selectedSong.link);
      await callbackCtx.replyWithAudio({ url: downloadLink.download, title: selectedSong.name, performer: selectedSong.artists });
      await callbackCtx.answerCbQuery(); // Answer the callback query to remove loading state
    } catch (error) {
      await callbackCtx.answerCbQuery('Failed to download the song.');
    }
  });
};