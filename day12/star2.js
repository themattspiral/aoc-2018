const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);

function positiveRuleDict(lines) {
  return lines.reduce((ruleDict, line) => {
    if (line.endsWith('=> #')) {
      ruleDict[line.substring(0, 5)] = true;
    }
    return ruleDict;
  }, {});
}

function potString(pots, potIndex, numSiblings) {
  let potString = pots[potIndex];

  for (let i = 1; i <= numSiblings; i++) {
    let sibString = '.';
    const sibIndex = potIndex - i;
    if (sibIndex >= 0) {
      sibString = pots[sibIndex];
    }
    potString = sibString + potString;
  }

  for (let i = 1; i <= numSiblings; i++) {
    let sibString = '.';
    const sibIndex = potIndex + i;
    if (sibIndex < pots.length) {
      sibString = pots[sibIndex];
    }
    potString += sibString;
  }

  return potString;
}

function padEmptyPots(potsMeta, numSiblings) {
  const plantAt = potsMeta.pots.indexOf('#');
  const leftPadCount = plantAt >= 0 && plantAt < numSiblings ? numSiblings - plantAt : 0;
  for (let i = 0; i < leftPadCount; i++) {
    potsMeta.pots.unshift('.');
    potsMeta.potZeroIndex += 1;
  }

  const lastPlantAt = potsMeta.pots.lastIndexOf('#');
  const lastPlantDiff = potsMeta.pots.length - 1 - lastPlantAt;
  const rightPadCount = plantAt >= 0 && lastPlantDiff < numSiblings ? numSiblings - lastPlantDiff : 0;
  for (let i = 0; i < rightPadCount; i++) {
    potsMeta.pots.push('.');
  }
}

function advanceGeneration(potsMeta, numSiblings, ruleDict) {
  const check = [...potsMeta.pots];
  for (let i = 0; i < potsMeta.pots.length; i++) {
    if (ruleDict[potString(check, i, numSiblings)]) {
      potsMeta.pots[i] = '#';
    } else {
      potsMeta.pots[i] = '.';
    }
  }
  padEmptyPots(potsMeta, numSiblings);
}

function plantCount(potsMeta) {
  let total = 0;
  for (let i = 0; i < potsMeta.pots.length; i++) {
    if (potsMeta.pots[i] === '#') {
      const potValue = i - potsMeta.potZeroIndex;
      total += potValue;
    }
  }
  return total;
}

const siblings = 2;
const positiveRules = positiveRuleDict(lines);
const potsMeta = {
  pots: Array.from(lines[0].substring(15)),
  potZeroIndex: 0
};
padEmptyPots(potsMeta, siblings);

// run for 1000 generations, and track the difference in count each time (assume we've stabilized by 1000)
let prevCount = 0;
let lastDiff = 0;
for (let i = 0; i < 1000; i++) {
  advanceGeneration(potsMeta, siblings, positiveRules);
  const count = plantCount(potsMeta);
  lastDiff = count - prevCount;
  prevCount = count;
}

// extrapolate the count for 50B generation (counting the first 1000 separately, before it stabilized)
const remaining = (50000000000 - 1000) * lastDiff;
const total = prevCount + remaining;
console.log(total);
