const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'configure.json'); // Mengubah referensi ke configure.json
let config;

try {
  config = require(configPath);
} catch (error) {
  config = { bots: [] };
}

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  config,
  saveConfig,
};