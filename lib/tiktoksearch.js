const axios = require('axios');

/**
 * Search for TikTok videos using the TikWM API (multiple videos)
 * @param {string} query - The query to search for TikTok videos
 * @returns {Promise<Array<Object>>} - Array of TikTok video objects
 */
async function tiktoks(query) {
  try {
    const response = await axios.post('https://tikwm.com/api/feed/search', 
      new URLSearchParams({
        keywords: query,
        count: 10, // Changed count to 10
        cursor: 0,
        HD: 1
      }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': 'current_language=en',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
      }
    });

    const responseData = response.data;
    const videos = responseData.data.videos;

    if (videos.length === 0) {
      return []; // Changed handling if no videos are found to return an empty array
    } else {
      return videos.map(video => ({
        title: video.title,
        cover: video.cover,
        origin_cover: video.origin_cover,
        no_watermark: video.play,
        watermark: video.wmplay,
        music: video.music
      }));
    }
  } catch (error) {
    throw new Error('Error searching for TikTok videos: ' + error.message);
  }
}

module.exports = {
  tiktoks
};