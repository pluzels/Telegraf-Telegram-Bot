const axios = require("axios");
const FormData = require("form-data");
const { fromBuffer } = require("file-type");

/**
 * Upload image to url
 * Supported mimetype:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * @param {Buffer} buffer Image Buffer
 * @returns {Promise<string>} URL of the uploaded image
 */
const uploadFile = async (buffer) => {
  try {
    const { ext, mime } = (await fromBuffer(buffer)) || {};

    if (!ext || !mime) {
      throw new Error("Unsupported file type");
    }

    const form = new FormData();
    form.append("file", buffer, { filename: `tmp.${ext}`, contentType: mime });

    const response = await axios.post(
      "https://tmpfiles.org/api/v1/upload",
      form,
      {
        headers: form.getHeaders(),
      }
    );

    const match = /https?:\/\/tmpfiles.org\/(.*)/.exec(response.data.data.url);
    if (match && match[1]) {
      return `https://tmpfiles.org/dl/${match[1]}`;
    } else {
      throw new Error("Failed to extract URL from response");
    }
  } catch (error) {
    throw new Error('Error uploading file: ' + error.message);
  }
};

module.exports = uploadFile;