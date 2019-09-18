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

function nextGeneration(potsMeta, numSiblings, ruleDict) {
  const nextGen = [];
  for (let i = 0; i < potsMeta.pots.length; i++) {
    if (ruleDict[potString(potsMeta.pots, i, numSiblings)]) {
      nextGen.push('#');
    } else {
      nextGen.push('.');
    }
  }
  const nextGenMeta = {
    pots: nextGen,
    potZeroIndex: potsMeta.potZeroIndex
  };
  padEmptyPots(nextGenMeta, numSiblings);
  return nextGenMeta;
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
const genZeroMeta = {
  pots: Array.from(lines[0].substring(15)),
  potZeroIndex: 0
};
padEmptyPots(genZeroMeta, siblings);

const generations = [genZeroMeta];
for (let i = 0; i < 20; i++) {
  generations.push(nextGeneration(generations[i], siblings, positiveRules));
}

console.log(plantCount(generations[20]));
