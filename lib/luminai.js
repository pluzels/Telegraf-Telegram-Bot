const axios = require('axios');

/**
 * Mengirim permintaan ke LuminAI
 * @param {string} text - Teks untuk dianalisis
 * @param {string} user - ID pengguna (opsional)
 * @param {string} prompt - Prompt tambahan (opsional)
 * @param {boolean} webSearchMode - Mode pencarian web (opsional)
 * @param {Buffer} imageBuffer - Buffer gambar untuk dianalisis (opsional)
 * @returns {Promise<string>} - Hasil analisis
 */
async function luminAi(text, user = null, prompt = null, webSearchMode = false, imageBuffer = null) {
    try {
        const data = { content: text };
        if (user !== null) data.user = user;
        if (prompt !== null) data.prompt = prompt;
        data.webSearchMode = webSearchMode;

        // Tambahkan dukungan untuk analisis gambar
        if (imageBuffer) {
            data.imageBuffer = imageBuffer.toString('base64'); // Konversi buffer gambar ke base64
        }

        const { data: res } = await axios.post("https://luminai.siputzx.my.id/", data);
        return res.result;
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        throw error;
    }
}

module.exports = { luminAi };