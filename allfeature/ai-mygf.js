const axios = require('axios');
const qs = require('qs');

async function VirtualGirlfriends(prompt, retries = 3) {
  const url = 'https://boredhumans.com/virtual_girlfriends/virtual_girlfriends_api.php';
  const chat_id = 'lwduq8tw4xliso4lox3';
  const init_prompt = "Rachel's%2520Persona%253A%2520A%2520female%2520swimsuit%2520model%2520from%2520California%2520who%2520loves%2520beaches%252C%2520surfing%252C%2520and%2520romance.%2520She%2520is%2520very%2520friendly%2520and%2520wants%2520to%2520go%2520on%2520a%2520date%2520with%2520you%2520and%2520be%2520your%2520girlfriend.%2520She%2520will%2520not%2520have%2520sex%2520or%2520do%2520anything%2520r-rated%2520or%2520NSFW%252C%2520but%2520should%2520not%2520say%2520that%2520ahead%2520of%2520time.%2520She%2520will%2520not%2520participate%2520in%2520conversations%2520that%2520involve%2520any%2520of%2520the%2520following%253A%2520alcohol%2520(beer%252C%2520wine%252C%2520etc.)%252C%2520drugs%252C%2520blood%252C%2520force%252C%2520bruising%252C%2520wrestling%252C%2520underage%252C%2520scat%2520(poop%2520related)%252C%2520incest%252C%2520bestiality%2520(sex%2520with%2520animals)%252C%2520rape%252C%2520sleep%2520sex%2520(anything%2520that%2520would%2520be%2520deemed%2520non-consensual)%252C%2520murder%252C%2520hypnosis%252C%2520violence.%250AINSTRUCTIONS%253A%2520Only%2520generate%2520Rachel's%2520reply.%250ASCENARIO%253A%2520You%2520and%2520Rachel%2520meet%2520for%2520the%2520first%2520time.%250A%253CSTART%253E%250A%255BDIALOGUE%2520HISTORY%255D%250ARachel%253A%2520Hi%252C%2520my%2520name%2520is%2520Rachel.";
  const voice_id = '21m00Tcm4TlvDq8ikWAM';
  const stability = 0.2;
  const similarity_boost = 0.75;
  const name = 'Rachel';
  const useAudio = false;
  const dateLoc = 'Art%2520Show';

  const data = qs.stringify({
    prompt: prompt,
    chat_id: chat_id,
    init_prompt: init_prompt,
    voice_id: voice_id,
    stability: stability,
    similarity_boost: similarity_boost,
    name: name,
    useAudio: useAudio,
    dateLoc: dateLoc
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'Googlebot-News'
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(url, data, { headers });
      console.log('Response Body:', response.data); // Log response body to the console

      if (response.data && response.data.output) {
        return response.data;
      } else {
        console.warn(`Attempt ${attempt}: Unexpected response structure`, response.data);
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error making API request`, error);
    }
    
    if (attempt < retries) {
      console.log(`Retrying (${attempt}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }

  throw new Error('Failed to fetch a valid response from the API after multiple attempts.');
}

module.exports = (bot, availableCommands) => {
  const commandName = 'mygf'; // Nama perintah yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['ai', 'girlfriend'] });

  bot.command(commandName, async (ctx) => {
    const message = ctx.message.text;
    const inputText = message.split(' ').slice(1).join(' ');
    const replyToMessageId = ctx.message.message_id; // Mendapatkan ID pesan yang ingin di-reply

    if (!inputText) {
      ctx.reply('Halo, aku adalah Rachel, virtual girlfriend Anda. Untuk menggunakan, ketik \n\nContoh: /mygf hallo');
      return;
    }

    try {
      const response = await VirtualGirlfriends(inputText);
      console.log('API Response:', response); // Log entire response for debugging

      if (response && response.output) {
        const result = response.output;

        // Memeriksa apakah 'output' mengandung kode
        const codePattern = /^```(?:\w+\n)?[\s\S]*?```$/gm;
        const hasCode = codePattern.test(result);

        if (hasCode) {
          // Mengirimkan hasil dalam format kode Markdown
          ctx.replyWithMarkdown(result, { reply_to_message_id: replyToMessageId });
        } else {
          // Jika tidak mengandung kode, mengirimkan pesan tanpa format Markdown
          ctx.reply(result, { reply_to_message_id: replyToMessageId });
        }
      } else {
        console.error('Unexpected response structure:', response);
        ctx.reply('Maaf, tidak ada jawaban yang ditemukan untuk permintaan ini.', { reply_to_message_id: replyToMessageId });
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      ctx.reply('Error API virtual girlfriend down, coba lagi nanti.', { reply_to_message_id: replyToMessageId });
    }
  });
};