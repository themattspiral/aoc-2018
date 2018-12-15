const fs = require('fs');

const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);

const result = lines.reduce((sum, line) => sum + parseInt(line), 0);
console.log(result);
