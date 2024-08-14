const axios = require('axios');

module.exports = (bot, availableCommands) => {
  const commandName = 'iplookup'; // Nama command yang didaftarkan
  availableCommands.push({ command: commandName, tags: ['tools'] }); // Tambahkan commandName ke dalam daftar availableCommands dengan tags: tools

  // Register the '/iplookup' command
  bot.command(commandName, async (ctx) => {
    // Check if the command has an argument (IP address)
    const ip = ctx.message.text.split(' ')[1];
    if (!ip) {
      ctx.reply('Gunakan perintah ini dengan format: /iplookup <alamat_ip>');
      return;
    }

    try {
      // Call the API with the provided IP address
      const response = await axios.post('https://samirxpikachu.run.place/iplookup', { ip });

      if (response.data && response.data.ip) {
        const ipInfo = response.data;
        let ipDetails = `
IP Address: ${ipInfo.ip}
Network: ${ipInfo.network}
Version: ${ipInfo.version}
City: ${ipInfo.city}
Region: ${ipInfo.region}
Country: ${ipInfo.country_name} (${ipInfo.country})
Country Code: ${ipInfo.country_code}
Country Capital: ${ipInfo.country_capital}
Postal Code: ${ipInfo.postal}
Latitude: ${ipInfo.latitude}
Longitude: ${ipInfo.longitude}
Timezone: ${ipInfo.timezone}
UTC Offset: ${ipInfo.utc_offset}
Country Calling Code: ${ipInfo.country_calling_code}
Currency: ${ipInfo.currency_name} (${ipInfo.currency})
Languages: ${ipInfo.languages}
Country Area: ${ipInfo.country_area}
Country Population: ${ipInfo.country_population}
ASN: ${ipInfo.asn}
Organization: ${ipInfo.org}
        `;
        ctx.reply(ipDetails);
      } else {
        ctx.reply('Tidak dapat menemukan informasi untuk alamat IP yang diberikan.');
      }
    } catch (error) {
      console.error('Error fetching IP information:', error);
      ctx.reply('Terjadi kesalahan saat mencari informasi IP. Coba lagi nanti.');
    }
  });
};