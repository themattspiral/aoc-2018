const fs = require('fs');

// const rawInput = fs.readFileSync('./small_input.txt', 'utf8');
const rawInput = fs.readFileSync('./input.txt', 'utf8');
const lines = rawInput.split(/\n/);
const marbleRegex = /(\d+) players; last marble is worth (\d+) points/;

function fromInputStringToGameParams(inputString) {
  if (!inputString.startsWith('#')) {
    const matches = marbleRegex.exec(inputString);
    return {
      playerCount: parseInt(matches[1]),
      lastMarbleValue: parseInt(matches[2]) * 100  // STAR 2 MULTIPLIER
    };
  }
}

function addToCircleAfterClockwiseNeighbor(currentMarble, newMarbleValue) {
  const newMarble = {
    value: newMarbleValue,
    nextMarble: null,
    previousMarble: null
  };

  const clockwiseNeighbor = currentMarble.nextMarble;
  const neighborsNeighbor = clockwiseNeighbor.nextMarble;

  newMarble.previousMarble = clockwiseNeighbor;
  newMarble.nextMarble = neighborsNeighbor;
  clockwiseNeighbor.nextMarble = newMarble;
  neighborsNeighbor.previousMarble = newMarble;

  return newMarble;
}

function removeSeventhCounterClockwiseFromCircle(currentMarble) {
  let marbleToRemove = currentMarble;
  for (let i = 0; i < 7; i++) {
    marbleToRemove = marbleToRemove.previousMarble;
  }

  marbleToRemove.previousMarble.nextMarble = marbleToRemove.nextMarble;
  marbleToRemove.nextMarble.previousMarble = marbleToRemove.previousMarble;

  return {
    removedMarble: marbleToRemove,
    currentMarble: marbleToRemove.nextMarble
  };
}

function playMarbles(playerCount, lastMarbleValue) {
  const playerScores = new Array(playerCount).fill(0);
  const marbles = new Array(lastMarbleValue + 1).fill(0).map((x, i) => i).reverse();

  const firstMarble = {
    value: marbles.pop(), // start with 0 marble in the circle
  };
  firstMarble.nextMarble = firstMarble;
  firstMarble.previousMarble = firstMarble;

  let currentMarble = firstMarble;
  let currentPlayerIndex = 0;

  while (marbles.length) {
    // remove the lowest value marble
    const marbleToPlay = marbles.pop();

    if (marbleToPlay % 23 === 0) {
      // accumulate score for the current player
      playerScores[currentPlayerIndex] += marbleToPlay;

      const info = removeSeventhCounterClockwiseFromCircle(currentMarble);

      // add removed marble's value to score also
      playerScores[currentPlayerIndex] += info.removedMarble.value;

      currentMarble = info.currentMarble;
    } else {
      currentMarble = addToCircleAfterClockwiseNeighbor(currentMarble, marbleToPlay);
    }

    // update to the next player
    currentPlayerIndex++;
    if (currentPlayerIndex > playerCount - 1) {
      currentPlayerIndex = 0;
    }
  }

  return playerScores;
}

function maxScore(scores) {
  return scores.reduce((max, score) => score > max ? score : max, 0);
}

const gameParams = lines.map(fromInputStringToGameParams).filter(p => !!p);

gameParams.forEach(p => {
  const scores = playMarbles(p.playerCount, p.lastMarbleValue);
  console.log(`For ${p.playerCount} players & last marble ${p.lastMarbleValue}, high score is ${maxScore(scores)}`);
});
