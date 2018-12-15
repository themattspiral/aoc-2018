const fs = require('fs');

const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);

function stringIntersection(strA, strB) {
  const shorterStrLength = strA.length < strB.length ? strA.length : strB.length;

  let intersection = '';
  for (let i = 0; i < shorterStrLength; i++) {
    if (strA[i] === strB[i]) {
      intersection += strA[i];
    }
  }

  return intersection;
}

// compare each string with all the strings after it until we have two with a diff count of 1.
// (i'm not crazy about this nested loop, but haven't thought of a better way)
for (let i = 0; i < lines.length; i++) {
  for (let j = i + 1; j < lines.length; j++) {
    const intersection = stringIntersection(lines[i], lines[j]);
    if (intersection.length === lines[i].length - 1 && intersection.length === lines[j].length - 1) {
      console.log(intersection);
    }
  }
}
