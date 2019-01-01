const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');

function shouldCharsReact(a, b) {
  const aLow = a.toLowerCase();
  const aUp = a.toUpperCase();
  const bLow = b.toLowerCase();
  const bUp = b.toUpperCase();

  if (aLow === bLow &&
    ( (a === aLow && b === bUp) || (a === aUp && b === bLow) )
  ) {
    return true;
  } else {
    return false;
  }
}

function reactPolymer(polymerArray) {
  let reducedCount = 0;
  let a = 0;
  let b = 1;

  // end-of-string conditions
  while (a < (polymerArray.length - 1) && b < polymerArray.length) {

    while (shouldCharsReact(polymerArray[a], polymerArray[b])) {
      polymerArray[a] = polymerArray[b] = '*'; // flag chars as having been reacted
      reducedCount += 2;

      if (a === 0) {
        // if A is 0, we've reacted back to the beginning of the string,
        // so advance past the reacted B and break out to continue adjacent comparisons
        b++;
        break;
      } else {
        // single decrement of A might back up onto an already-reacted char,
        // so keep backing up a until we see a non-reacted char or hit beginning of string
        do {
          a--;
        } while (polymerArray[a] === '*' && a > 0)

        // advance b past last reacted char
        b++;

        if (b >= polymerArray.length) break;
      }
    }

    // continue adjacent comparisons
    a = b;
    b = a + 1;
  }

  return reducedCount;
}

function getUniqueCharsMap(polymerArray) {
  return polymerArray.reduce((unique, char) => {
    unique[char.toLowerCase()] = true;
    return unique;
  }, {});
}

function removeCharsAndReactPolymers(charsToRemoveMap, originalPolymerString) {
  Object.keys(charsToRemoveMap).forEach(char => {
    const modifiedPolymer = originalPolymerString.replace(new RegExp(char, 'gi'), '');
    const reducedCount = reactPolymer(Array.from(modifiedPolymer));
    charsToRemoveMap[char] = modifiedPolymer.length - reducedCount;
  });
}

function getMinCharByPolymerLength(uniqueCharsMap) {
  return Object.keys(uniqueCharsMap).reduce((min, char) => {
    if (uniqueCharsMap[char] < min.length) {
      return {
        char: char,
        length: uniqueCharsMap[char]
      };
    } else {
      return min;
    }
  }, {
    char: null,
    length: Number.MAX_SAFE_INTEGER
  });
}

const reducedCount = reactPolymer(Array.from(rawInput));
console.log(`Star 1 - Reacted polymer length: ${rawInput.length - reducedCount}`);

const uniqueCharsMap = getUniqueCharsMap(Array.from(rawInput));
removeCharsAndReactPolymers(uniqueCharsMap, rawInput);
const minChar = getMinCharByPolymerLength(uniqueCharsMap);
console.log(`Star 2 - Shortest Polymer after removing a unit on one type: ${minChar.length} (for unit '${minChar.char}')`);
