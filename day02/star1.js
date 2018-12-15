const fs = require('fs');

const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);

function stringLetterCounts(str) {
  return [...str].reduce((counts, ltr) => {
    if (counts[ltr] > 0) {
      counts[ltr]++;
    } else {
      counts[ltr] = 1;
    }
    return counts;
  }, {});
}

function hasTwoOrThreeCount(letterCounts) {
  return Object.values(letterCounts).reduce((results, count) => {
    if (count === 2) {
      results.hasTwoCount = true;
    } else if (count === 3) {
      results.hasThreeCount = true;
    }
    return results;
  }, {});
}

let twoCounts = 0;
let threeCounts = 0;

lines.forEach(line => {
  const twoOrThree = hasTwoOrThreeCount(stringLetterCounts(line));
  if (twoOrThree.hasTwoCount) twoCounts++;
  if (twoOrThree.hasThreeCount) threeCounts++;
});

console.log(twoCounts * threeCounts);
