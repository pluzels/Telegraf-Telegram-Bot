const fetch = require('node-fetch');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

/**
 * Upload image to telegra.ph
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<string>} - URL of the uploaded image
 */
async function uploadImage(buffer) {
  try {
    const { ext } = await fromBuffer(buffer);
    let form = new FormData();
    form.append('file', buffer, 'tmp.' + ext);

    let res = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: form,
    });

    let img = await res.json();
    if (img.error) throw img.error;
    return 'https://telegra.ph' + img[0].src;
  } catch (error) {
    throw new Error('Error uploading image: ' + error.message);
  }
}

module.exports = uploadImage;