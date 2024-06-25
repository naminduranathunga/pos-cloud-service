// 

const crypto = require('crypto');
const fs = require('fs');

const aesKey = crypto.randomBytes(32);
fs.writeFileSync('aes_key.txt', aesKey.toString('hex'));

console.log('AES key generated and saved to aes_key.txt');
console.log("Add this key to the .env file as PASSWORD_SYMMETRIC_KEY=your_aes_key_here");

//run - node generate_aes_key.js