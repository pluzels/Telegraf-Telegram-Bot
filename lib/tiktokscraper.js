const axios = require('axios');

// Fungsi untuk mencari video TikTok menggunakan API TikWM (single video)
async function tiktok2(query) {
    try {
        const encodedParams = new URLSearchParams();
        encodedParams.set('url', query);
        encodedParams.set('hd', '2'); // Mengatur HD ke 2 untuk kualitas HD

        const response = await axios({
            method: 'POST',
            url: 'https://tikwm.com/api/',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': 'current_language=en',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
            },
            data: encodedParams
        });

        console.log(response.data); // Log response untuk verifikasi

        const videos = response.data.data;
        return {
            title: videos.title,
            cover: videos.cover,
            origin_cover: videos.origin_cover,
            no_watermark: videos.play, // Menggunakan videos.play untuk URL video tanpa watermark
            watermark: videos.wmplay, // URL video dengan watermark
            music: videos.music, // URL musik
            music_info: { // Tambahkan informasi musik
                title: videos.music_info.title // Judul musik
            }
        };
    } catch (error) {
        throw new Error('Error fetching TikTok video: ' + error.message);
    }
}

module.exports = {
    tiktok2
};