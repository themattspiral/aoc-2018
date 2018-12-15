const fs = require('fs');

const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);

const uniqueFrequencies = {};
let sum = 0;
let linesIndex = 0;

while (true) {
  sum += parseInt(lines[linesIndex]);

  if (uniqueFrequencies[sum]) {
    break;
  } else {
    uniqueFrequencies[sum] = true;
  }

  linesIndex++;
  if (linesIndex > lines.length - 1) {
    linesIndex = 0;
  }
}

console.log(sum);
